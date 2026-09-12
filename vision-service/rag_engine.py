import os
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

# 1. Load the variables from .env into the environment
load_dotenv()

# 2. genai.Client() will now automatically detect GEMINI_API_KEY
client = genai.Client()

# 1. Define the Strict Output Structure
class Violation(BaseModel):
    rule_violated: str = Field(description="The specific rule number violated, e.g., 'Rule 6(1)(e)'")
    reason: str = Field(description="Explanation based ONLY on the retrieved rules")

class ComplianceResult(BaseModel):
    is_compliant: bool = Field(description="True if no rules are violated, False otherwise")
    extracted_data_summary: str = Field(description="A brief summary of what was found on the package")
    violations: list[Violation] = Field(description="List of violations found, if any")

# 2. The Augmentation & Generation Engine
def evaluate_compliance(ocr_text: str, retrieved_rules: list[str]) -> ComplianceResult:
    """
    Constructs a grounded RAG prompt and forces Gemini to return 
    the result matching the ComplianceResult Pydantic schema.
    """
    
    # Combine the retrieved rules into a single string block
    rules_context = "\n".join(retrieved_rules)
    
    # Construct the RAG Prompt
    prompt = f"""
    You are an expert Legal Metrology Auditor. Your job is to determine if a package is compliant.
    
    RULES TO ENFORCE (You may ONLY judge based on these retrieved statutes. Do not invent rules):
    {rules_context}
    
    RAW TEXT EXTRACTED FROM PACKAGE:
    "{ocr_text}"
    
    INSTRUCTIONS:
    1. Compare the raw extracted text against the rules provided above.
    2. Identify any missing information or formatting violations (like using 'gms' instead of 'g').
    3. Output your final audit exactly matching the requested JSON schema.
    """

    # Call Gemini Flash-Lite with Strict Schema Mode
    response = client.models.generate_content(
        model='gemini-3.5-flash-lite', # <--- UPDATED MODEL VERSION
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ComplianceResult,
            temperature=0.0 # Zero temperature for deterministic, factual outputs
        )
    )
    
    # The SDK automatically handles schema validation; response.text is guaranteed JSON
    return response.text