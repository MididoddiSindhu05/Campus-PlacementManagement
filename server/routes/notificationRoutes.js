import { Router } from "express";
import {
  adminCreateNotification,
  markNotificationRead,
  myNotifications,
} from "../controllers/notificationController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, myNotifications);
router.patch("/:id/read", protect, markNotificationRead);
router.post("/", protect, authorize("admin", "placement_officer"), adminCreateNotification);

export default router;
