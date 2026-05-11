import { Router } from "express";
import {
  forgotPassword,
  login,
  me,
  registerStudent,
  registerAdmin,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  forgotPasswordRules,
  loginRules,
  registerRules,
  adminRegisterRules,
  resetPasswordRules,
} from "../validators/authValidators.js";

const router = Router();

router.post("/register", registerRules, validate, registerStudent);
router.post("/register-admin", adminRegisterRules, validate, registerAdmin);
router.post("/login", loginRules, validate, login);
router.post("/forgot-password", forgotPasswordRules, validate, forgotPassword);
router.post("/reset-password", resetPasswordRules, validate, resetPassword);
router.get("/me", protect, me);

export default router;
