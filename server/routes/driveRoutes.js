import { Router } from "express";
import {
  createDrive,
  deleteDrive,
  getDrive,
  listDrives,
  updateDrive,
} from "../controllers/driveController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { driveRules } from "../validators/driveValidators.js";

const router = Router();

router.get("/", listDrives);
router.get("/:id", getDrive);

router.post("/", protect, authorize("admin", "placement_officer"), driveRules, validate, createDrive);
router.patch("/:id", protect, authorize("admin", "placement_officer"), updateDrive);
router.delete("/:id", protect, authorize("admin"), deleteDrive);

export default router;
