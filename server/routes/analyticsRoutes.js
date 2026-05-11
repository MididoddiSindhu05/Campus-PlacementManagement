import { Router } from "express";
import { getAnalyticsDashboard } from "../controllers/analyticsController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/dashboard", protect, authorize("admin", "placement_officer"), getAnalyticsDashboard);

export default router;
