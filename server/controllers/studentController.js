import fs from "fs";
import { prisma } from "../config/database.js";
import { ok, fail } from "../utils/apiResponse.js";
import { isStudentEligibleForDrive } from "../services/eligibilityService.js";
import { computeResumeScore } from "../services/resumeScoreService.js";
import { recommendDrivesForStudent } from "../services/recommendationService.js";

export async function getMyProfile(req, res, next) {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return fail(res, "Student profile not found", 404);
    return ok(res, student);
  } catch (e) {
    next(e);
  }
}

export async function updateMyProfile(req, res, next) {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return fail(res, "Student profile not found", 404);
    
    const allowed = ["phone", "department", "cgpa", "backlogs", "graduationYear", "skills"];
    const updateData = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) updateData[k] = req.body[k];
    }
    
    const currentSkills = updateData.skills !== undefined ? updateData.skills : student.skills;
    const currentCgpa = updateData.cgpa !== undefined ? updateData.cgpa : student.cgpa;
    const currentDepartment = updateData.department !== undefined ? updateData.department : student.department;

    updateData.resumeScore = computeResumeScore({ cgpa: currentCgpa, department: currentDepartment, skills: currentSkills }, currentSkills);
    updateData.rankScore = Number(((currentCgpa || 0) * 10 + (currentSkills?.length || 0) * 2 + (updateData.resumeScore || 0) * 0.1).toFixed(2));

    const updated = await prisma.student.update({
      where: { id: student.id },
      data: updateData
    });
    return ok(res, updated, "Profile updated");
  } catch (e) {
    next(e);
  }
}

export async function uploadResumeHandler(req, res, next) {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return fail(res, "Student profile not found", 404);
    if (!req.file) return fail(res, "No file uploaded", 400);
    
    if (student.resumePath && fs.existsSync(student.resumePath)) {
      try {
        fs.unlinkSync(student.resumePath);
      } catch {
        /* ignore */
      }
    }
    
    const resumePath = req.file.path;
    const resumeFileName = req.file.originalname;
    const resumeScore = computeResumeScore(student, student.skills);
    
    const updated = await prisma.student.update({
      where: { id: student.id },
      data: { resumePath, resumeFileName, resumeScore }
    });

    return ok(
      res,
      { resumeFileName: updated.resumeFileName, resumePath: updated.resumePath },
      "Resume uploaded"
    );
  } catch (e) {
    next(e);
  }
}

export async function downloadResume(req, res, next) {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student?.resumePath) return fail(res, "No resume on file", 404);
    return res.download(student.resumePath, student.resumeFileName || "resume.pdf");
  } catch (e) {
    next(e);
  }
}

export async function listEligibleDrives(req, res, next) {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return fail(res, "Student profile not found", 404);
    
    const drives = await prisma.placementDrive.findMany({
      where: { status: "open" },
      include: { company: { select: { name: true, industry: true, website: true } } },
      orderBy: { applicationDeadline: 'asc' }
    });
    
    const enriched = drives.map((d) => {
      const { eligible, reasons } = isStudentEligibleForDrive(student, d);
      return { ...d, eligible, eligibilityReasons: reasons };
    });
    return ok(res, enriched);
  } catch (e) {
    next(e);
  }
}

export async function recommendDrives(req, res, next) {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return fail(res, "Student profile not found", 404);
    const list = await recommendDrivesForStudent(student, 15);
    return ok(res, list);
  } catch (e) {
    next(e);
  }
}

export async function myApplicationsSummary(req, res, next) {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return fail(res, "Student profile not found", 404);
    
    const apps = await prisma.application.findMany({
      where: { studentId: student.id },
      include: {
        placementDrive: {
          include: { company: { select: { name: true } } }
        },
        interviews: {
          orderBy: { roundOrder: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return ok(res, apps);
  } catch (e) {
    next(e);
  }
}
