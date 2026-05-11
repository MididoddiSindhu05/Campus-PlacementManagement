import { body } from "express-validator";

export const updateStudentRules = [
  body("phone").optional().isString(),
  body("department").optional().trim().notEmpty(),
  body("cgpa").optional().isFloat({ min: 0, max: 10 }),
  body("backlogs").optional().isInt({ min: 0 }),
  body("graduationYear").optional().isInt({ min: 2000, max: 2100 }),
  body("skills").optional().isArray(),
];
