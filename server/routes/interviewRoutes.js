import { Router } from "express";
import {
  admitCardPdf,
  listInterviewsForApplication,
  scheduleInterview,
} from "../controllers/interviewController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.post(
  "/application/:applicationId",
  protect,
  authorize("admin", "placement_officer"),
  scheduleInterview
);
router.get(
  "/application/:applicationId",
  protect,
  authorize("admin", "placement_officer", "student"),
  listInterviewsForApplication
);
router.get("/:interviewId/admit-card", protect, authorize("student"), admitCardPdf);

export default router;
