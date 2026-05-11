import { fail } from "../utils/apiResponse.js";

export function handleUpload(upload) {
  return (req, res, next) =>
    upload(req, res, (err) => {
      if (err) return fail(res, err.message || "Upload failed", 400);
      next();
    });
}
