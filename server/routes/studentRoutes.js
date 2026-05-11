import { Router } from "express";
import {
  downloadResume,
  getMyProfile,
  listEligibleDrives,
  myApplicationsSummary,
  recommendDrives,
  updateMyProfile,
  uploadResumeHandler,
} from "../controllers/studentController.js";
import { protect, authorize } from "../middleware/auth.js";
import { uploadResume } from "../middleware/uploadResume.js";
import { validate } from "../middleware/validate.js";
import { handleUpload } from "../middleware/handleUpload.js";
import { updateStudentRules } from "../validators/studentValidators.js";

const router = Router();

router.use(protect, authorize("student"));

router.get("/me", getMyProfile);
router.patch("/me", updateStudentRules, validate, updateMyProfile);
router.post("/resume", handleUpload(uploadResume.single("resume")), uploadResumeHandler);
router.get("/resume", downloadResume);
router.get("/drives/eligible", listEligibleDrives);
router.get("/drives/recommended", recommendDrives);
router.get("/applications/summary", myApplicationsSummary);

export default router;
