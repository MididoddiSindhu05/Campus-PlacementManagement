import { prisma } from "../config/database.js";
import { computeResumeScore } from "../services/resumeScoreService.js";
import { signAccessToken } from "../utils/tokens.js";
import { ok, fail } from "../utils/apiResponse.js";
import { createPasswordResetToken, hashToken } from "../utils/tokens.js";
import { sendMail } from "../services/mailService.js";
import bcrypt from "bcryptjs";

function userPayload(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function registerStudent(req, res, next) {
  try {
    const { email, password, name, rollNumber, department, cgpa, backlogs, graduationYear, skills, phone } = req.body;
    
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return fail(res, "Email already registered", 409);
    
    const roll = await prisma.student.findUnique({ where: { rollNumber } });
    if (roll) return fail(res, "Roll number already in use", 409);

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "student",
      }
    });

    const resumeScore = computeResumeScore({ cgpa, department, skills }, skills || []);
    const rankScore = Number(((cgpa || 0) * 10 + (skills?.length || 0) * 2 + (resumeScore || 0) * 0.1).toFixed(2));

    await prisma.student.create({
      data: {
        userId: user.id,
        rollNumber,
        department,
        cgpa,
        backlogs: backlogs ?? 0,
        graduationYear,
        skills: skills || [],
        phone: phone || "",
        resumeScore,
        rankScore
      }
    });

    const token = signAccessToken({ userId: user.id, role: user.role });
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

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return fail(res, "Email already registered", 409);

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "admin",
      }
    });

    const token = signAccessToken({ userId: user.id, role: user.role });
    return ok(res, { token, user: userPayload(user) }, "Admin registered successfully", 201);
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password, roleHint } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return fail(res, "Invalid credentials", 401);
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return fail(res, "Invalid credentials", 401);
    }

    if (roleHint === "admin" && user.role !== "admin" && user.role !== "placement_officer") {
      return fail(res, "Invalid credentials", 401);
    }
    if (roleHint === "student" && user.role !== "student") {
      return fail(res, "Invalid credentials", 401);
    }
    const token = signAccessToken({ userId: user.id, role: user.role });
    return ok(res, { token, user: userPayload(user) }, "Logged in");
  } catch (e) {
    next(e);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.body.email } });
    if (!user) {
      return ok(res, null, "If the email exists, a reset link has been sent");
    }
    const { raw, hash } = createPasswordResetToken();
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hash,
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000)
      }
    });

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
    
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashed,
        passwordResetExpires: { gt: new Date() },
      }
    });
    
    if (!user) return fail(res, "Invalid or expired token", 400);

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      }
    });
    
    return ok(res, null, "Password updated");
  } catch (e) {
    next(e);
  }
}

export async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return fail(res, "User not found", 404);
    let student = null;
    if (user.role === "student") {
      student = await prisma.student.findUnique({
        where: { userId: user.id },
        include: { user: { select: { name: true, email: true, role: true } } }
      });
    }
    return ok(res, { user: userPayload(user), student });
  } catch (e) {
    next(e);
  }
}
