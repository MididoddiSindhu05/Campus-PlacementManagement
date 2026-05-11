import { body } from "express-validator";

export const registerRules = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  body("name").trim().notEmpty(),
  body("rollNumber").trim().notEmpty(),
  body("department").trim().notEmpty(),
  body("cgpa").isFloat({ min: 0, max: 10 }),
  body("graduationYear").isInt({ min: 2000, max: 2100 }),
  body("backlogs").optional().isInt({ min: 0 }),
  body("skills").optional().isArray(),
];

export const loginRules = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
];

export const forgotPasswordRules = [body("email").isEmail().normalizeEmail()];

export const resetPasswordRules = [
  body("token").notEmpty(),
  body("password").isLength({ min: 8 }),
];

export const adminRegisterRules = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  body("name").trim().notEmpty(),
  body("adminSecret").notEmpty(),
];
