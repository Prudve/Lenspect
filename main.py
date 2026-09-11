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

    candidate_models = ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-3.6-flash", "gemini-3.7-flash"]
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
        "llm_engine": "Gemini 2.5 Flash"
    }

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
    Interactive web endpoint: Upload an image file directly for cloud multimodal inspection.
    """
    start_time = time.time()
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    mime_type = file.content_type or "image/jpeg"
    if not mime_type.startswith("image/"):
        mime_type = "image/jpeg"

    compliance = await run_metrology_validation(contents, mime_type=mime_type)
    elapsed = time.time() - start_time

    return AnalyzeResponse(
        status="success",
        filename=file.filename or "uploaded_label.jpg",
        deskew_angle=0.0,
        image_width=0,
        image_height=0,
        ocr_text="Inspected directly via Gemini 2.5 Flash Multimodal Vision.",
        ocr_lines_count=0,
        lines=[],
        compliance_result=compliance,
        execution_time_seconds=round(elapsed, 2)
    )

@app.post("/api/ocr", response_model=OCRResponse)
async def ocr_image(file: UploadFile = File(...)):
    """
    OCR endpoint: In cloud multimodal mode, text reading is handled directly by Gemini.
    """
    start_time = time.time()
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    mime_type = file.content_type or "image/jpeg"
    if not mime_type.startswith("image/"):
        mime_type = "image/jpeg"

    compliance = await run_metrology_validation(contents, mime_type=mime_type)
    elapsed = time.time() - start_time

    # Construct descriptive lines from extracted declarations
    extracted = compliance.extracted_data
    lines = []
    text_items = [
        ("MRP", extracted.mrp),
        ("Net Quantity", extracted.net_quantity),
        ("Manufacturer", extracted.manufacturer_details),
        ("Date", extracted.manufacturing_date),
        ("Consumer Care", extracted.consumer_care),
    ]
    for idx, (label, val) in enumerate(text_items, start=1):
        if val:
            lines.append(OCRLineItem(line_number=idx, text=f"{label}: {val}", confidence=0.99, box=[]))

    ocr_summary = "\n".join([f"{l}: {v}" for l, v in text_items if v])

    return OCRResponse(
        status="success",
        filename=file.filename or "uploaded_label.jpg",
        deskew_angle=0.0,
        image_width=0,
        image_height=0,
        total_lines=len(lines),
        ocr_text=ocr_summary or "Text extracted directly via Gemini Multimodal.",
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
