import { body } from "express-validator";

export const applicationStatusRules = [
  body("status").isIn(["pending", "shortlisted", "rejected", "offered", "withdrawn"]),
  body("remarks").optional().isString(),
  body("fraudFlag").optional().isBoolean(),
];
