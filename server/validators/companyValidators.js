import { body } from "express-validator";

export const companyRules = [
  body("name").trim().notEmpty(),
  body("industry").optional().isString(),
  body("description").optional().isString(),
  body("website").optional().isString(),
  body("contactEmail").optional().isEmail(),
];
