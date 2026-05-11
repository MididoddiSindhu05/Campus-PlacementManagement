import { User } from "../models/User.js";
import { Student } from "../models/Student.js";
import { fail } from "../utils/apiResponse.js";
import { verifyAccessToken } from "../utils/tokens.js";

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return fail(res, "Not authorized — no token", 401);
    }
    const token = header.slice(7);
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) return fail(res, "User no longer exists", 401);
    req.user = { id: user._id.toString(), role: user.role, email: user.email };
    if (user.role === "student") {
      const student = await Student.findOne({ user: user._id });
      req.student = student ? { id: student._id.toString() } : null;
    }
    next();
  } catch {
    return fail(res, "Not authorized — invalid token", 401);
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return fail(res, "Not authorized", 401);
    if (!roles.includes(req.user.role)) {
      return fail(res, "Forbidden", 403);
    }
    next();
  };
}
