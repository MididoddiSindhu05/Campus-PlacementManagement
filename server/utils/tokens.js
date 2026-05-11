import crypto from "crypto";
import jwt from "jsonwebtoken";

export function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function createPasswordResetToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  return { raw: token, hash };
}

export function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}
