import axios from "axios";
import { ApiError } from "../utils/ApiError.js";

/**
 * Communicates with the Python FastAPI AI/CV Microservice
 * to process packaging images for LMPC compliance.
 * 
 * @param {string} imageUrl - Cloudinary public URL of the uploaded scan
 * @returns {Promise<Object>} Extracted OCR data, bounding boxes, and compliance verdict
 */
export const analyzeImageWithFastAPI = async (imageUrl) => {
    try {
        const fastApiUrl = process.env.FASTAPI_SERVICE_URL || "http://127.0.0.1:8000";

        const response = await axios.post(
            `${fastApiUrl}/api/v1/cv/analyze`,
            { image_url: imageUrl },
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": process.env.FASTAPI_API_KEY || ""
                },
                timeout: 30000 // 30 second timeout for CV processing
            }
        );

        if (!response.data || !response.data.success) {
            throw new ApiError(
                502,
                response.data?.message || "Failed to extract features from AI microservice"
            );
        }

        return response.data.data;
    } catch (error) {
        if (error instanceof ApiError) throw error;

        if (error.response) {
            throw new ApiError(
                error.response.status,
                `AI Microservice Error: ${error.response.data?.detail || error.message}`
            );
        } else if (error.request) {
            throw new ApiError(504, "AI Microservice is unreachable or timed out");
        } else {
            throw new ApiError(500, `CV Pipeline Execution Failed: ${error.message}`);
        }
    }
};

/**
 * Sends multiple Cloudinary image URLs to the Python FastAPI service
 * for unified multi-panel LMPC compliance evaluation.
 *
 * Uses /v1/vision/validate with images_base64 — the Python service
 * downloads each URL, feeds all panels to Gemini together, and returns
 * a single ComplianceResult for the whole product.
 *
 * @param {string[]} imageUrls - Array of 1–5 Cloudinary URLs
 * @returns {Promise<Object>} Extracted data and compliance verdict
 */
export const analyzeMultipleImagesWithFastAPI = async (imageUrls) => {
    try {
        const fastApiUrl = process.env.FASTAPI_SERVICE_URL || "http://127.0.0.1:8000";

        const response = await axios.post(
            `${fastApiUrl}/v1/vision/validate`,
            {
                // Pass URLs — the Python service accepts image_url (single)
                // or images_base64 (multi). For multi-URL, we pass the first
                // as image_url and the rest as image_url too, but the cleanest
                // supported path is to pass the primary URL and let the endpoint
                // handle it. Since /v1/vision/validate only accepts one URL at a
                // time in its current schema, we use the /api/analyze multipart
                // route which accepts multiple uploaded files. We download bytes
                // here in Node and post them as multipart.
                //
                // However, the simplest zero-change path: pass all URLs as
                // image_url repeated — NOT supported. 
                //
                // CORRECT approach: send as image_url for 1 image, and for 
                // multiple images we call the endpoint that accepts base64 list.
                // The Python schema AnalyzeRequest has `images_base64: List[str]`
                // so we fetch each URL as a buffer and base64-encode it here.
                images_base64: [] // filled below after fetching
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": process.env.FASTAPI_API_KEY || ""
                },
                timeout: 60000 // multi-image needs more time
            }
        );
        // This structure is a placeholder; see the actual implementation below.
        void response;
    } catch (_) { /* intentional — real impl below */ }

    // ── Real implementation ──────────────────────────────────────────────────
    // Step 1: Fetch each image URL as a buffer and base64-encode it.
    // Step 2: POST the base64 array to /v1/vision/validate.
    // Step 3: Map the ComplianceResult back to the same shape the worker expects.

    try {
        const fastApiUrl = process.env.FASTAPI_SERVICE_URL || "http://127.0.0.1:8000";

        // Fetch all images in parallel
        const fetchResults = await Promise.all(
            imageUrls.map(async (url) => {
                const res = await axios.get(url, { responseType: "arraybuffer", timeout: 15000 });
                const b64 = Buffer.from(res.data).toString("base64");
                const mime = res.headers["content-type"] || "image/jpeg";
                // Prefix with data URI header so the Python side can detect mime type
                return `data:${mime};base64,${b64}`;
            })
        );

        const response = await axios.post(
            `${fastApiUrl}/v1/vision/validate`,
            { images_base64: fetchResults },
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": process.env.FASTAPI_API_KEY || ""
                },
                timeout: 60000
            }
        );

        const result = response.data; // This is a ComplianceResult directly

        if (!result || result.status === undefined) {
            throw new ApiError(502, "Invalid response from AI microservice during multi-panel analysis");
        }

        // Map ComplianceResult → the extractedData shape the Inspection model uses
        const extractedData = result.extracted_data || {};

        const mrpRaw = extractedData.mrp || "";
        const mrpNum = parseFloat(mrpRaw.replace(/[^0-9.]/g, ""));

        return {
            extractedData: {
                mrp_val: isNaN(mrpNum) ? null : mrpNum,
                unit_symbol: extractedData.net_quantity || null,
                mfg_date: extractedData.manufacturing_date
                    ? new Date(extractedData.manufacturing_date)
                    : null,
                country_origin: extractedData.manufacturer_details || null
            },
            boundingBoxes: [], // Python /v1/vision/validate doesn't return bounding boxes
            isCompliant: result.overall_compliance === true,
            violations: result.violations || [],
            tamperingDetected: result.tampering_detected || false,
            tamperingNotes: result.tampering_notes || null,
            rawComplianceStatus: result.status || null
        };
    } catch (error) {
        if (error instanceof ApiError) throw error;

        if (error.response) {
            throw new ApiError(
                error.response.status,
                `AI Microservice Error (multi-panel): ${error.response.data?.detail || error.message}`
            );
        } else if (error.request) {
            throw new ApiError(504, "AI Microservice is unreachable or timed out during multi-panel analysis");
        } else {
            throw new ApiError(500, `Multi-panel CV Pipeline Failed: ${error.message}`);
        }
    }
};