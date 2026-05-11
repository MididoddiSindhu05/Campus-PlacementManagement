import { Router } from "express";
import { generatePlacementPdf, listReports } from "../controllers/reportController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/placement/pdf", protect, authorize("admin", "placement_officer"), generatePlacementPdf);
router.get("/", protect, authorize("admin", "placement_officer"), listReports);

export default router;
