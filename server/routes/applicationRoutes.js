import { Router } from "express";
import {
  adminDeleteApplication,
  adminListApplications,
  adminUpdateApplication,
  applyToDrive,
  withdrawApplication,
} from "../controllers/applicationController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { applicationStatusRules } from "../validators/applicationValidators.js";

const router = Router();

router.post("/drive/:driveId/apply", protect, authorize("student"), applyToDrive);
router.patch("/withdraw/:id", protect, authorize("student"), withdrawApplication);

router.get("/", protect, authorize("admin", "placement_officer"), adminListApplications);
router.patch("/:id", protect, authorize("admin", "placement_officer"), applicationStatusRules, validate, adminUpdateApplication);
router.delete("/:id", protect, authorize("admin"), adminDeleteApplication);

export default router;
