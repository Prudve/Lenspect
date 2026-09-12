import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Inspection } from "../models/inspection.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { addInspectionJob } from "../queues/inspection.queue.js";

const uploadInspectionScan = asyncHandler(async (req, res) => {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
        throw new ApiError(400, "Latitude and longitude coordinates are required");
    }

    const localFilePath = req.file?.path;
    if (!localFilePath) {
        throw new ApiError(400, "Inspection image file is required");
    }

    const cloudinaryResponse = await uploadOnCloudinary(localFilePath);
    if (!cloudinaryResponse) {
        throw new ApiError(500, "Failed to upload image to Cloudinary");
    }

    const inspection = await Inspection.create({
        inspector: req.user._id,
        imageUrl: cloudinaryResponse.secure_url,
        cloudinaryPublicId: cloudinaryResponse.public_id,
        location: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        status: "PENDING"
    });

    await addInspectionJob(
        inspection._id.toString(),
        cloudinaryResponse.secure_url
    );

    return res.status(202).json(
        new ApiResponse(
            202,
            inspection,
            "Scan uploaded successfully and queued for AI analysis"
        )
    );
});

const getAllInspections = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, complianceStatus, status } = req.query;

    const query = {};
    if (complianceStatus) query.complianceStatus = complianceStatus;
    if (status) query.status = status;

    const inspections = await Inspection.find(query)
        .populate("inspector", "fullName email username")
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

    const total = await Inspection.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(
            200,
            { inspections, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
            "Inspections retrieved successfully"
        )
    );
});

const getInspectionById = asyncHandler(async (req, res) => {
    const { inspectionId } = req.params;

    const inspection = await Inspection.findById(inspectionId).populate(
        "inspector",
        "fullName email username"
    );

    if (!inspection) {
        throw new ApiError(404, "Inspection record not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, inspection, "Inspection details fetched successfully"));
});

const getGeospatialHeatmap = asyncHandler(async (req, res) => {
    // Return GeoJSON FeatureCollection format for Leaflet.js rendering
    const inspections = await Inspection.find(
        { complianceStatus: "NON_COMPLIANT" },
        "location complianceStatus status createdAt"
    );

    const geoJsonFeatures = inspections.map((item) => ({
        type: "Feature",
        geometry: item.location,
        properties: {
            id: item._id,
            complianceStatus: item.complianceStatus,
            createdAt: item.createdAt
        }
    }));

    return res.status(200).json(
        new ApiResponse(
            200,
            { type: "FeatureCollection", features: geoJsonFeatures },
            "Geospatial heatmap data fetched successfully"
        )
    );
});

const reviewInspection = asyncHandler(async (req, res) => {
    const { inspectionId } = req.params;
    const { extractedData, complianceStatus } = req.body;

    const inspection = await Inspection.findById(inspectionId);
    if (!inspection) {
        throw new ApiError(404, "Inspection record not found");
    }

    if (extractedData) inspection.extractedData = { ...inspection.extractedData, ...extractedData };
    if (complianceStatus) inspection.complianceStatus = complianceStatus;

    await inspection.save();

    return res
        .status(200)
        .json(new ApiResponse(200, inspection, "Inspection record updated after manual review"));
});

export {
    uploadInspectionScan,
    getAllInspections,
    getInspectionById,
    getGeospatialHeatmap,
    reviewInspection
};