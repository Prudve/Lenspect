from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import json

# Import our modular logic
from vision_pipeline import extract_text_from_image
from knowledge_base import retrieve_relevant_rules
from rag_engine import evaluate_compliance

app = FastAPI(title="Legal Metrology RAG Vision Service")

@app.post("/analyze-package/")
async def analyze_package(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")
    
    try:
        # Step 1: Read the uploaded file into memory
        image_bytes = await file.read()
        
        # Step 2: Extraction (OpenCV -> Tesseract)
        ocr_text = extract_text_from_image(image_bytes)
        
        # Guard clause: if OCR couldn't read anything
        if len(ocr_text.strip()) < 5:
            return JSONResponse(
                status_code=422,
                content={"error": "Could not extract sufficient text from image. Please retake the photo."}
            )
            
        # Step 3: Retrieval (BM25 -> Top Rules)
        retrieved_rules = retrieve_relevant_rules(ocr_text, top_k=3)
        
        # Step 4: Augmentation & Generation (LLM Reasoning -> JSON)
        # evaluate_compliance returns a JSON string guaranteed to match our Pydantic schema
        compliance_json_str = evaluate_compliance(ocr_text, retrieved_rules)
        
        # Parse the string back to a Python dictionary to return as a proper FastAPI JSON response
        final_result = json.loads(compliance_json_str)
        
        # Inject the raw OCR text into the response for debugging/logging
        final_result["debug_raw_ocr"] = ocr_text 
        
        return final_result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Run the server on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
