import { Router } from "express";
import {
    uploadInspectionScan,
    getAllInspections,
    getInspectionById,
    getGeospatialHeatmap,
    reviewInspection
} from "../controllers/inspection.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRoles } from "../middlewares/rbac.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { USER_ROLES } from "../constants.js";

const router = Router();

// Secure all inspection routes with JWT verification
router.use(verifyJWT);

// Upload packaging scan (Saves locally via Multer -> Cloudinary -> Queues BullMQ CV job)
router.route("/upload-scan").post(
    verifyRoles(USER_ROLES.INSPECTOR, USER_ROLES.ADMIN),
    upload.single("image"),
    uploadInspectionScan
);

// Fetch paginated inspection logs
router.route("/").get(getAllInspections);

// Get GeoJSON data points for Leaflet.js dashboard heatmaps
router.route("/geospatial/heatmap").get(getGeospatialHeatmap);

// Fetch specific scan details or update non-compliant inspection attributes
router.route("/:inspectionId")
    .get(getInspectionById)
    .patch(
        verifyRoles(USER_ROLES.ADMIN, USER_ROLES.INSPECTOR),
        reviewInspection
    );

export default router;