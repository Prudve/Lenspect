import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Inspection } from "../models/inspection.model.js";
import { Notice } from "../models/notice.model.js";
import { User } from "../models/user.model.js";

// A1: Inspections over time, grouped by day — with compliant vs non-compliant split
const getComplianceTrend = asyncHandler(async (req, res) => {
    // Default: last 30 days. Accept ?days=N from query.
    const days = Math.min(Number(req.query.days) || 30, 365);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const trend = await Inspection.aggregate([
        {
            $match: {
                status: "COMPLETED",
                createdAt: { $gte: since }
            }
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    complianceStatus: "$complianceStatus"
                },
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: "$_id.date",
                statuses: {
                    $push: { status: "$_id.complianceStatus", count: "$count" }
                }
            }
        },
        { $sort: { _id: 1 } },
        {
            $project: {
                _id: 0,
                date: "$_id",
                statuses: 1
            }
        }
    ]);

    // Flatten into a friendlier shape for the frontend chart
    const formatted = trend.map((day) => {
        const row = { date: day.date, COMPLIANT: 0, NON_COMPLIANT: 0, NEEDS_REVIEW: 0 };
        day.statuses.forEach(({ status, count }) => { row[status] = count; });
        return row;
    });

    return res.status(200).json(
        new ApiResponse(200, formatted, `Compliance trend for the last ${days} days fetched successfully`)
    );
});

// A2: Top N most frequently flagged LMPC rule violations
const getTopViolations = asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 10, 50);

    const violations = await Notice.aggregate([
        { $match: { status: "ISSUED" } },
        { $unwind: "$violations" },
        {
            $group: {
                _id: "$violations.rule",
                count: { $sum: 1 },
                // Grab one sample description for context
                sampleDescription: { $first: "$violations.description" }
            }
        },
        { $sort: { count: -1 } },
        { $limit: limit },
        {
            $project: {
                _id: 0,
                rule: "$_id",
                count: 1,
                sampleDescription: 1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, violations, "Top violations fetched successfully")
    );
});

// A3: Inspector leaderboard — ranked by number of scans submitted
const getInspectorLeaderboard = asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 10, 50);

    const leaderboard = await Inspection.aggregate([
        {
            $group: {
                _id: "$inspector",
                totalScans: { $sum: 1 },
                compliantScans: {
                    $sum: { $cond: [{ $eq: ["$complianceStatus", "COMPLIANT"] }, 1, 0] }
                },
                nonCompliantScans: {
                    $sum: { $cond: [{ $eq: ["$complianceStatus", "NON_COMPLIANT"] }, 1, 0] }
                }
            }
        },
        { $sort: { totalScans: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "inspector"
            }
        },
        { $unwind: "$inspector" },
        {
            $project: {
                _id: 0,
                inspector: {
                    _id: "$inspector._id",
                    fullName: "$inspector.fullName",
                    email: "$inspector.email",
                    username: "$inspector.username"
                },
                totalScans: 1,
                compliantScans: 1,
                nonCompliantScans: 1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, leaderboard, "Inspector leaderboard fetched successfully")
    );
});

// A4: Overall compliance rate across all completed inspections
const getOverallComplianceRate = asyncHandler(async (req, res) => {
    const [result] = await Inspection.aggregate([
        { $match: { status: "COMPLETED" } },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                compliant: {
                    $sum: { $cond: [{ $eq: ["$complianceStatus", "COMPLIANT"] }, 1, 0] }
                },
                nonCompliant: {
                    $sum: { $cond: [{ $eq: ["$complianceStatus", "NON_COMPLIANT"] }, 1, 0] }
                },
                needsReview: {
                    $sum: { $cond: [{ $eq: ["$complianceStatus", "NEEDS_REVIEW"] }, 1, 0] }
                }
            }
        },
        {
            $project: {
                _id: 0,
                total: 1,
                compliant: 1,
                nonCompliant: 1,
                needsReview: 1,
                complianceRate: {
                    $cond: [
                        { $eq: ["$total", 0] },
                        0,
                        {
                            $round: [
                                { $multiply: [{ $divide: ["$compliant", "$total"] }, 100] },
                                2
                            ]
                        }
                    ]
                }
            }
        }
    ]);

    const data = result || {
        total: 0, compliant: 0, nonCompliant: 0, needsReview: 0, complianceRate: 0
    };

    return res.status(200).json(
        new ApiResponse(200, data, "Overall compliance rate fetched successfully")
    );
});

export {
    getComplianceTrend,
    getTopViolations,
    getInspectorLeaderboard,
    getOverallComplianceRate
};