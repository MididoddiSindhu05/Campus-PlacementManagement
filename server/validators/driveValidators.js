import { body } from "express-validator";

export const driveRules = [
  body("company").isMongoId(),
  body("title").trim().notEmpty(),
  body("jobRole").trim().notEmpty(),
  body("description").optional().isString(),
  body("salaryMin").optional().isFloat({ min: 0 }),
  body("salaryMax").optional().isFloat({ min: 0 }),
  body("minCgpa").optional().isFloat({ min: 0, max: 10 }),
  body("maxBacklogs").optional().isInt({ min: 0 }),
  body("openings").optional().isInt({ min: 1 }),
  body("applicationDeadline").notEmpty().withMessage("Deadline required"),
  body("driveDate").optional({ nullable: true, checkFalsy: true }),
  body("status").optional().isIn(["draft", "open", "closed", "completed"]),
  body("requiredSkills").optional().isArray(),
  body("eligibleDepartments").optional().isArray(),
  body("graduationYears").optional().isArray(),
  body("rounds").optional().isArray(),
];
