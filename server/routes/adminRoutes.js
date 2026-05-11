import { Router } from "express";
import {
  adminDeleteStudent,
  adminUpdateStudent,
  exportStudentsCsv,
  getStudent,
  listStudents,
} from "../controllers/adminStudentController.js";
import { protect, authorize } from "../middleware/auth.js";
import { refreshRankings } from "../controllers/maintenanceController.js";

const router = Router();

router.use(protect, authorize("admin"));

router.post("/rankings/refresh", refreshRankings);

router.get("/students", listStudents);
router.get("/students/export/csv", exportStudentsCsv);
router.get("/students/:id", getStudent);
router.patch("/students/:id", adminUpdateStudent);
router.delete("/students/:id", adminDeleteStudent);

export default router;
