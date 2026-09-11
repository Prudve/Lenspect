import os
import time
import logging
from typing import List, Optional
from dotenv import load_dotenv

# Load environment variables (.env)
load_dotenv()

import httpx
import uvicorn
from google import genai
from google.genai import types
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("metrology-service")

app = FastAPI(
    title="Legal Metrology AI Service",
    description="Automated packaged commodity label compliance verification using Gemini 2.5 Flash Multimodal Vision",
    version="2.0.0"
)

# Enable CORS for development flexibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static assets directory
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# ---------------------------------------------------------------------------
# Data Schemas (Exact preservation of core models)
# ---------------------------------------------------------------------------
class AnalyzeRequest(BaseModel):
    image_url: str

class Violation(BaseModel):
    rule: str
    severity: str
    description: str

class ExtractedData(BaseModel):
    mrp: Optional[str] = None
    net_quantity: Optional[str] = None
    manufacturer_details: Optional[str] = None
    manufacturing_date: Optional[str] = None
    consumer_care: Optional[str] = None

class ComplianceResult(BaseModel):
    status: str
    overall_compliance: bool
    extracted_data: ExtractedData
    violations: List[Violation]

# Supporting schemas for frontend dashboard compatibility
class OCRLineItem(BaseModel):
    line_number: int
    text: str
    confidence: float
    box: List[float] = []

class OCRResponse(BaseModel):
    status: str
    filename: str
    deskew_angle: float
    image_width: int
    image_height: int
    total_lines: int
    ocr_text: str
    lines: List[OCRLineItem]
    execution_time_seconds: float

class AnalyzeResponse(BaseModel):
    status: str
    filename: str
    deskew_angle: float
    image_width: int
    image_height: int
    ocr_text: str
    ocr_lines_count: int
    lines: List[OCRLineItem] = []
    compliance_result: ComplianceResult
    execution_time_seconds: float

# Multi-Image Cross-Comparison Schemas
class ImageFieldValue(BaseModel):
    image_name: str
    value: Optional[str] = None

class FieldComparisonItem(BaseModel):
    field_name: str
    values: List[ImageFieldValue] = []
    status: str  # "MATCH", "MISMATCH", "PARTIAL", "MISSING"
    notes: Optional[str] = None

class DiscrepancyItem(BaseModel):
    title: str
    description: str
    severity: str  # "High", "Medium", "Low", "Info"
    images_involved: List[str] = []

class ImageOCRResult(BaseModel):
    image_index: int
    filename: str
    ocr_text: str
    total_lines: int
    lines: List[OCRLineItem] = []
    extracted_data: ExtractedData

class MultiImageCompareResponse(BaseModel):
    status: str
    total_images: int
    comparison_summary: str
    overall_consistency: bool
    images: List[ImageOCRResult] = []
    field_comparisons: List[FieldComparisonItem] = []
    discrepancies: List[DiscrepancyItem] = []
    execution_time_seconds: float = 0.0

# ---------------------------------------------------------------------------
# Gemini Client Helper
# ---------------------------------------------------------------------------
_genai_client = None

def get_genai_client() -> genai.Client:
    """Lazily load Gemini client with API key from environment."""
    global _genai_client
    if _genai_client is None:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            logger.warning("GEMINI_API_KEY not found in environment variables.")
        _genai_client = genai.Client(api_key=api_key)
    return _genai_client

# ---------------------------------------------------------------------------
# Image & AI Validation Functions
# ---------------------------------------------------------------------------
async def download_image(url: str) -> bytes:
    """Download image from a remote URL and return raw bytes."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(url, follow_redirects=True)
        if response.status_code != 200:
            raise HTTPException(
                status_code=400,
                detail=f"Unable to download image from the provided URL (status code: {response.status_code})"
            )
        return response.content

_active_model = None

async def run_metrology_validation(image_bytes: bytes, mime_type: str = "image/jpeg") -> ComplianceResult:
    """
    Directly evaluate packaging image declarations against Rule 6 of the Legal Metrology
    (Packaged Commodities) Rules, 2011 using Gemini multimodal vision.
    """
    global _active_model
    client = get_genai_client()

    prompt = """You are an expert Legal Metrology Inspector in India enforcing the Legal Metrology (Packaged Commodities) Rules, 2011.
Directly inspect the packaging label in the provided image and evaluate compliance against Rule 6 of the 2011 Guidelines.

Mandatory Statutory Requirements to verify under Rule 6:
1. Maximum Retail Price (MRP): Must state 'inclusive of all taxes' or 'incl. of all taxes'.
2. Net Quantity: Must use standard metric units of weight or measure (g, kg, ml, l, count/N, etc.).
3. Name and Complete Physical Address of Manufacturer, Packer, or Importer.
4. Month and Year of Manufacture / Packing / Import. Check for invalid or future dates.
5. Consumer Care Details: Must include a clear consumer care name/address, telephone/helpline number, and/or email.

Instructions:
- Read all text declarations directly from the packaging label image.
- Extract the exact declarations into extracted_data. For any missing declaration, set the value to null.
- Identify all violations: For every non-compliance, missing mandatory declaration, or improper unit/format, add a Violation entry with rule name, severity ('High', 'Medium', 'Low'), and clear description.
- Set 'overall_compliance' to true ONLY if all mandatory declarations comply with Rule 6 without any violations; otherwise set to false.
- Set 'status' to 'Compliant' or 'Non-Compliant' based on the overall assessment.
"""

    contents = [
        types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
        prompt
    ]

    candidate_models = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.8-flash", "gemini-2.5-flash"]
    if _active_model and _active_model in candidate_models:
        candidate_models.remove(_active_model)
        candidate_models.insert(0, _active_model)

    last_error = None

    for model_name in candidate_models:
        try:
            response = await client.aio.models.generate_content(
                model=model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=ComplianceResult,
                    temperature=0.0
                )
            )

            if response.parsed:
                _active_model = model_name
                return response.parsed
            elif response.text:
                _active_model = model_name
                return ComplianceResult.model_validate_json(response.text)
            else:
                raise ValueError("Empty response received from Gemini model.")
        except Exception as e:
            logger.warning(f"Model {model_name} failed: {e}. Retrying fallback...")
            last_error = e

    logger.error(f"Gemini Metrology validation failed: {last_error}")
    raise HTTPException(status_code=500, detail=f"Multimodal AI validation failed: {str(last_error)}")

class OCRRawExtraction(BaseModel):
    full_text: str
    lines: List[str]

async def run_full_ocr(image_bytes: bytes, mime_type: str = "image/jpeg") -> OCRRawExtraction:
    """
    Directly transcribe all visible text in the image verbatim using Gemini multimodal vision.
    """
    global _active_model
    client = get_genai_client()

    prompt = """You are an ultra-accurate Optical Character Recognition (OCR) engine.
Inspect the provided image carefully and transcribe ALL readable text verbatim.
Maintain natural reading order (top to bottom, left to right).

Instructions:
- Include all headings, paragraphs, labels, values, fine print, table data, and metadata visible in the image.
- In 'full_text', provide the entire transcribed text with appropriate line breaks.
- In 'lines', provide an array of strings where each element is a distinct line of text extracted from the image.
- Do not add commentary or explanations, only the exact text present in the image.
"""

    contents = [
        types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
        prompt
    ]

    candidate_models = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.8-flash", "gemini-2.5-flash"]
    if _active_model and _active_model in candidate_models:
        candidate_models.remove(_active_model)
        candidate_models.insert(0, _active_model)

    last_error = None
    for model_name in candidate_models:
        try:
            response = await client.aio.models.generate_content(
                model=model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=OCRRawExtraction,
                    temperature=0.0
                )
            )

            if response.parsed:
                _active_model = model_name
                return response.parsed
            elif response.text:
                _active_model = model_name
                return OCRRawExtraction.model_validate_json(response.text)
            else:
                raise ValueError("Empty response received from Gemini model.")
        except Exception as e:
            logger.warning(f"OCR model {model_name} failed: {e}. Retrying fallback...")
            last_error = e

    logger.error(f"Gemini OCR extraction failed: {last_error}")
    raise HTTPException(status_code=500, detail=f"Multimodal OCR failed: {str(last_error)}")

async def run_multi_image_comparison(images: List[tuple[str, bytes, str]]) -> MultiImageCompareResponse:
    """
    Perform simultaneous OCR and cross-image comparison across multiple packaging / document images.
    """
    global _active_model
    client = get_genai_client()

    contents = [
        "You are an expert Optical Character Recognition (OCR) and Packaging Compliance Inspector.",
        f"You are provided with {len(images)} packaging or document images to analyze, transcribe, and cross-compare."
    ]

    for idx, (filename, img_bytes, mime_type) in enumerate(images, start=1):
        contents.append(f"=== IMAGE {idx}: {filename} ===")
        contents.append(types.Part.from_bytes(data=img_bytes, mime_type=mime_type))

    prompt = f"""ANALYZE AND COMPARE THE {len(images)} PROVIDED IMAGES:

1. PER-IMAGE TEXT EXTRACTION (OCR):
   - For every image (Image 1 through Image {len(images)}), extract the complete verbatim text into 'ocr_text', preserving line breaks.
   - Break down the text line-by-line into 'lines' (each with line_number, text, confidence=0.99).
   - In 'extracted_data', extract statutory Legal Metrology declarations visible on that specific image (mrp, net_quantity, manufacturer_details, manufacturing_date, consumer_care). If absent on that image, leave as null.
   - Set 'image_index' to the corresponding index (1-based) and 'filename' to the image's filename.

2. CROSS-IMAGE COMPARISON:
   - Compare all declarations and textual statements across the images (e.g. Front of pack vs Back of pack, or Batch A vs Batch B).
   - In 'field_comparisons', create an entry for each of the following key fields:
     * Maximum Retail Price (MRP)
     * Net Quantity
     * Date of Manufacture / Expiry
     * Manufacturer / Packer Details
     * Consumer Care Details
     * Commodity / Product Title
     * Key Ingredients / Formulation claims
     For each field, provide a list of ImageFieldValue items (image_name=filename, value=found value or null). Set status to 'MATCH' if identical or consistent, 'MISMATCH' if there is a conflict, 'PARTIAL' if partially consistent, or 'MISSING' if not declared across all images.
   - In 'discrepancies', list all conflicting declarations, mismatched weights, different prices, divergent addresses, or contradictions across the images. Assign severity ('High', 'Medium', 'Low', 'Info').
   - In 'comparison_summary', write an insightful 2-4 sentence executive analysis summarizing the findings.
   - Set 'overall_consistency' to true if and only if there are no contradictory or conflicting declarations across the images.
"""
    contents.append(prompt)

    candidate_models = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.8-flash", "gemini-2.5-flash"]
    if _active_model and _active_model in candidate_models:
        candidate_models.remove(_active_model)
        candidate_models.insert(0, _active_model)

    last_error = None
    for model_name in candidate_models:
        try:
            response = await client.aio.models.generate_content(
                model=model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=MultiImageCompareResponse,
                    temperature=0.0
                )
            )

            if response.parsed:
                _active_model = model_name
                return response.parsed
            elif response.text:
                _active_model = model_name
                return MultiImageCompareResponse.model_validate_json(response.text)
            else:
                raise ValueError("Empty response received from Gemini model.")
        except Exception as e:
            logger.warning(f"Multi-image comparison with model {model_name} failed: {e}. Retrying fallback...")
            last_error = e

    logger.error(f"Gemini multi-image comparison failed: {last_error}")
    raise HTTPException(status_code=500, detail=f"Multi-image comparison failed: {str(last_error)}")

# ---------------------------------------------------------------------------
# API Routes
# ---------------------------------------------------------------------------
@app.get("/")
async def index():
    """Serve the interactive web frontend."""
    index_file = os.path.join(static_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "Legal Metrology AI Service is running. Access /docs for API docs."}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Legal Metrology AI Microservice",
        "architecture": "Cloud Multimodal (Serverless-ready)",
        "llm_engine": _active_model or "Gemini 2.5 Flash"
    }

@app.get("/api/sample")
async def get_sample_image():
    """Return the bundled sample packaged commodity image."""
    sample_path = os.path.join(static_dir, "sample_label.png")
    if os.path.exists(sample_path):
        return FileResponse(sample_path, media_type="image/png")
    raise HTTPException(status_code=404, detail="Sample image not found.")

@app.get("/api/sample-pair")
async def get_sample_pair_metadata():
    """Return endpoints for the front and back sample packaging labels."""
    return {
        "status": "success",
        "sample_count": 2,
        "samples": [
            {
                "name": "Front Panel (NutriCrunch Deluxe Cookies)",
                "filename": "sample_front.png",
                "url": "/api/sample-pair/front"
            },
            {
                "name": "Back Panel (NutriCrunch Statutory Declarations)",
                "filename": "sample_back.png",
                "url": "/api/sample-pair/back"
            }
        ]
    }

@app.get("/api/sample-pair/front")
async def get_sample_pair_front():
    p = os.path.join(static_dir, "sample_front.png")
    if os.path.exists(p):
        return FileResponse(p, media_type="image/png")
    raise HTTPException(status_code=404, detail="Sample front image not found.")

@app.get("/api/sample-pair/back")
async def get_sample_pair_back():
    p = os.path.join(static_dir, "sample_back.png")
    if os.path.exists(p):
        return FileResponse(p, media_type="image/png")
    raise HTTPException(status_code=404, detail="Sample back image not found.")

@app.post("/api/compare", response_model=MultiImageCompareResponse)
async def compare_images_endpoint(files: List[UploadFile] = File(...)):
    """
    Upload multiple images for simultaneous OCR extraction, cross-image diffing, and discrepancy analysis.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded.")

    start_time = time.time()
    images_data = []

    for idx, file in enumerate(files, start=1):
        contents = await file.read()
        if not contents:
            continue
        mime_type = file.content_type or "image/jpeg"
        if not mime_type.startswith("image/"):
            mime_type = "image/jpeg"
        fname = file.filename or f"image_{idx}.jpg"
        images_data.append((fname, contents, mime_type))

    if not images_data:
        raise HTTPException(status_code=400, detail="All uploaded files were empty.")

    result = await run_multi_image_comparison(images_data)
    result.execution_time_seconds = round(time.time() - start_time, 2)
    result.total_images = len(images_data)
    result.status = "success"
    return result

@app.post("/v1/vision/validate", response_model=ComplianceResult)
async def validate_package_from_url(request: AnalyzeRequest):
    """
    Validate packaged commodity label compliance from an image URL using Gemini 2.5 Flash.
    """
    image_bytes = await download_image(request.image_url)
    return await run_metrology_validation(image_bytes=image_bytes)

@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_uploaded_image(file: UploadFile = File(...)):
    """
    Interactive web endpoint: Upload an image file directly for cloud multimodal inspection + complete OCR.
    """
    start_time = time.time()
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    mime_type = file.content_type or "image/jpeg"
    if not mime_type.startswith("image/"):
        mime_type = "image/jpeg"

    # Concurrently or sequentially run compliance and OCR
    compliance = await run_metrology_validation(contents, mime_type=mime_type)
    try:
        ocr_result = await run_full_ocr(contents, mime_type=mime_type)
        full_ocr_text = ocr_result.full_text
        lines = [
            OCRLineItem(line_number=idx, text=line_str, confidence=0.99, box=[])
            for idx, line_str in enumerate(ocr_result.lines, start=1)
            if line_str.strip()
        ]
    except Exception as e:
        logger.warning(f"Supplementary OCR failed during analyze: {e}")
        # Fallback to extracted declarations
        extracted = compliance.extracted_data
        text_items = [
            ("MRP", extracted.mrp),
            ("Net Quantity", extracted.net_quantity),
            ("Manufacturer", extracted.manufacturer_details),
            ("Date", extracted.manufacturing_date),
            ("Consumer Care", extracted.consumer_care),
        ]
        lines = [
            OCRLineItem(line_number=i, text=f"{lbl}: {val}", confidence=0.99, box=[])
            for i, (lbl, val) in enumerate(text_items, start=1) if val
        ]
        full_ocr_text = "\n".join([f"{l}: {v}" for l, v in text_items if v]) or "Text extracted directly via Gemini Multimodal."

    elapsed = time.time() - start_time

    return AnalyzeResponse(
        status="success",
        filename=file.filename or "uploaded_label.jpg",
        deskew_angle=0.0,
        image_width=0,
        image_height=0,
        ocr_text=full_ocr_text,
        ocr_lines_count=len(lines),
        lines=lines,
        compliance_result=compliance,
        execution_time_seconds=round(elapsed, 2)
    )

@app.post("/api/ocr", response_model=OCRResponse)
async def ocr_image(file: UploadFile = File(...)):
    """
    OCR endpoint: Transcribe all visible text from the uploaded image.
    """
    start_time = time.time()
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    mime_type = file.content_type or "image/jpeg"
    if not mime_type.startswith("image/"):
        mime_type = "image/jpeg"

    ocr_result = await run_full_ocr(contents, mime_type=mime_type)
    elapsed = time.time() - start_time

    lines = [
        OCRLineItem(line_number=idx, text=line_str, confidence=0.99, box=[])
        for idx, line_str in enumerate(ocr_result.lines, start=1)
        if line_str.strip()
    ]

    return OCRResponse(
        status="success",
        filename=file.filename or "uploaded_label.jpg",
        deskew_angle=0.0,
        image_width=0,
        image_height=0,
        total_lines=len(lines),
        ocr_text=ocr_result.full_text,
        lines=lines,
        execution_time_seconds=round(elapsed, 2)
    )

if __name__ == "__main__":
    print("\n" + "=" * 65)
    print("  [+] Legal Metrology AI Service (Gemini 2.5 Flash Multimodal)")
    print("  --> Web Interface:        http://127.0.0.1:8000")
    print("  --> Interactive API Docs:  http://127.0.0.1:8000/docs")
    print("=" * 65 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)