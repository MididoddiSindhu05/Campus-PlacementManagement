import { Router } from "express";
import {
  createCompany,
  deleteCompany,
  getCompany,
  listCompanies,
  updateCompany,
} from "../controllers/companyController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { companyRules } from "../validators/companyValidators.js";

const router = Router();

router.get("/", listCompanies);
router.get("/:id", getCompany);

router.post("/", protect, authorize("admin", "placement_officer"), companyRules, validate, createCompany);
router.patch("/:id", protect, authorize("admin", "placement_officer"), updateCompany);
router.delete("/:id", protect, authorize("admin"), deleteCompany);

export default router;
