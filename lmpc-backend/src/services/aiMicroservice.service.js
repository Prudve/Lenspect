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