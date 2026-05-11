import { fail } from "../utils/apiResponse.js";
import { logError } from "../utils/logger.js";

export function notFound(req, res) {
  fail(res, `Route ${req.originalUrl} not found`, 404);
}

export function errorHandler(err, req, res, next) {
  logError(err.message || "Unhandled error", err);
  const status = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production" && status === 500
      ? "Internal server error"
      : err.message || "Internal server error";
  fail(res, message, status);
}
