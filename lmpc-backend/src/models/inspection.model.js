import mongoose, { Schema } from "mongoose";

const boundingBoxSchema = new Schema(
    {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        w: { type: Number, required: true },
        h: { type: Number, required: true },
        label: { type: String, required: true }
    },
    { _id: false }
);

// Sub-schema for each image in a multi-panel scan
const panelImageSchema = new Schema(
    {
        imageUrl: { type: String, required: true },
        cloudinaryPublicId: { type: String, required: true },
        panelLabel: { type: String, default: null } // e.g. "front", "back", "side"
    },
    { _id: false }
);

const inspectionSchema = new Schema(
    {
        inspector: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        // Original single-image field
        imageUrl: {
            type: String,
            default: null
        },
        cloudinaryPublicId: {
            type: String,
            default: null
        },
        // array for multi-panel scans (1–5 images of the same product)
        multiImages: {
            type: [panelImageSchema],
            default: []
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
                required: true
            },
            coordinates: {
                type: [Number],
                required: true
            }
        },
        status: {
            type: String,
            enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
            default: "PENDING",
            index: true
        },
        extractedData: {
            mrp_val: { type: Number, default: null },
            unit_symbol: { type: String, default: null },
            mfg_date: { type: Date, default: null },
            country_origin: { type: String, default: null }
        },
        complianceStatus: {
            type: String,
            enum: ["COMPLIANT", "NON_COMPLIANT", "NEEDS_REVIEW"],
            default: "NEEDS_REVIEW",
            index: true
        },
        boundingBoxes: [boundingBoxSchema],
        failureReason: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

inspectionSchema.index({ location: "2dsphere" });

export const Inspection = mongoose.model("Inspection", inspectionSchema);