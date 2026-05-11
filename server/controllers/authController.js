import { User } from "../models/User.js";
import { Student } from "../models/Student.js";
import { computeResumeScore } from "../services/resumeScoreService.js";
import { signAccessToken } from "../utils/tokens.js";
import { ok, fail } from "../utils/apiResponse.js";
import { createPasswordResetToken, hashToken } from "../utils/tokens.js";
import { sendMail } from "../services/mailService.js";

function userPayload(user) {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function registerStudent(req, res, next) {
  try {
    const { email, password, name, rollNumber, department, cgpa, backlogs, graduationYear, skills, phone } =
      req.body;
    const exists = await User.findOne({ email });
    if (exists) return fail(res, "Email already registered", 409);
    const roll = await Student.findOne({ rollNumber });
    if (roll) return fail(res, "Roll number already in use", 409);

    const user = await User.create({
      email,
      password,
      name,
      role: "student",
    });
    const stuDoc = await Student.create({
      user: user._id,
      rollNumber,
      department,
      cgpa,
      backlogs: backlogs ?? 0,
      graduationYear,
      skills: skills || [],
      phone: phone || "",
    });
    stuDoc.resumeScore = computeResumeScore(stuDoc, stuDoc.skills);
    stuDoc.rankScore = Number(((stuDoc.cgpa || 0) * 10 + (stuDoc.skills?.length || 0) * 2 + (stuDoc.resumeScore || 0) * 0.1).toFixed(2));
    await stuDoc.save();

    const token = signAccessToken({ userId: user._id.toString(), role: user.role });
    return ok(res, { token, user: userPayload(user) }, "Registered successfully", 201);
  } catch (e) {
    next(e);
  }
}

export async function registerAdmin(req, res, next) {
  try {
    const { email, password, name, adminSecret } = req.body;
    
    const expectedSecret = process.env.ADMIN_REGISTRATION_SECRET || "SecretAdmin123";
    if (adminSecret !== expectedSecret) {
      return fail(res, "Invalid admin registration code", 403);
    }

    const exists = await User.findOne({ email });
    if (exists) return fail(res, "Email already registered", 409);

    const user = await User.create({
      email,
      password,
      name,
      role: "admin",
    });

    const token = signAccessToken({ userId: user._id.toString(), role: user.role });
    return ok(res, { token, user: userPayload(user) }, "Admin registered successfully", 201);
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password, roleHint } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return fail(res, "Invalid credentials", 401);
    }
    if (roleHint === "admin" && user.role !== "admin" && user.role !== "placement_officer") {
      return fail(res, "Invalid credentials", 401);
    }
    if (roleHint === "student" && user.role !== "student") {
      return fail(res, "Invalid credentials", 401);
    }
    const token = signAccessToken({ userId: user._id.toString(), role: user.role });
    return ok(res, { token, user: userPayload(user) }, "Logged in");
  } catch (e) {
    next(e);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return ok(res, null, "If the email exists, a reset link has been sent");
    }
    const { raw, hash } = createPasswordResetToken();
    user.passwordResetToken = hash;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${raw}`;
    await sendMail({
      to: user.email,
      subject: "Password reset",
      text: `Reset your password within 1 hour: ${resetUrl}`,
      html: `<p>Reset your password within 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });
    return ok(res, null, "If the email exists, a reset link has been sent");
  } catch (e) {
    next(e);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    const hashed = hashToken(token);
    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: new Date() },
    }).select("+password +passwordResetToken +passwordResetExpires");
    if (!user) return fail(res, "Invalid or expired token", 400);
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return ok(res, null, "Password updated");
  } catch (e) {
    next(e);
  }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return fail(res, "User not found", 404);
    let student = null;
    if (user.role === "student") {
      student = await Student.findOne({ user: user._id }).populate("user", "name email role");
    }
    return ok(res, { user: userPayload(user), student });
  } catch (e) {
    next(e);
  }
}
