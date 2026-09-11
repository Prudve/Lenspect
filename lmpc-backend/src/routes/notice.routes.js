import { Router } from "express";
import {
    generateNotice,
    getAllNotices,
    getNoticeById,
    downloadNoticePDF
} from "../controllers/notice.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRoles } from "../middlewares/rbac.middleware.js";
import { USER_ROLES } from "../constants.js";

const router = Router();

// Secure all notice routes
router.use(verifyJWT);

// Trigger PDFKit generation for a non-compliant inspection
router.route("/generate/:inspectionId").post(
    verifyRoles(USER_ROLES.ADMIN, USER_ROLES.INSPECTOR),
    generateNotice
);

// Fetch all issued legal notices
router.route("/").get(getAllNotices);

// Fetch notice metadata
router.route("/:noticeId").get(getNoticeById);

// Stream or download court-admissible PDF document
router.route("/:noticeId/download").get(downloadNoticePDF);

export default router;