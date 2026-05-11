import fs from "fs";
import { Student } from "../models/Student.js";
import { PlacementDrive } from "../models/PlacementDrive.js";
import { Application } from "../models/Application.js";
import { Interview } from "../models/Interview.js";
import { ok, fail } from "../utils/apiResponse.js";
import { isStudentEligibleForDrive } from "../services/eligibilityService.js";
import { computeResumeScore } from "../services/resumeScoreService.js";
import { recommendDrivesForStudent } from "../services/recommendationService.js";

export async function getMyProfile(req, res, next) {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return fail(res, "Student profile not found", 404);
    return ok(res, student);
  } catch (e) {
    next(e);
  }
}

export async function updateMyProfile(req, res, next) {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return fail(res, "Student profile not found", 404);
    const allowed = ["phone", "department", "cgpa", "backlogs", "graduationYear", "skills"];
    for (const k of allowed) {
      if (req.body[k] !== undefined) student[k] = req.body[k];
    }
    student.resumeScore = computeResumeScore(student, student.skills);
    await student.save();
    return ok(res, student, "Profile updated");
  } catch (e) {
    next(e);
  }
}

export async function uploadResumeHandler(req, res, next) {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return fail(res, "Student profile not found", 404);
    if (!req.file) return fail(res, "No file uploaded", 400);
    if (student.resumePath && fs.existsSync(student.resumePath)) {
      try {
        fs.unlinkSync(student.resumePath);
      } catch {
        /* ignore */
      }
    }
    student.resumePath = req.file.path;
    student.resumeFileName = req.file.originalname;
    student.resumeScore = computeResumeScore(student, student.skills);
    await student.save();
    return ok(
      res,
      { resumeFileName: student.resumeFileName, resumePath: student.resumePath },
      "Resume uploaded"
    );
  } catch (e) {
    next(e);
  }
}

export async function downloadResume(req, res, next) {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student?.resumePath) return fail(res, "No resume on file", 404);
    return res.download(student.resumePath, student.resumeFileName || "resume.pdf");
  } catch (e) {
    next(e);
  }
}

export async function listEligibleDrives(req, res, next) {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return fail(res, "Student profile not found", 404);
    const drives = await PlacementDrive.find({ status: "open" })
      .populate("company", "name industry website")
      .sort({ applicationDeadline: 1 })
      .lean();
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
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return fail(res, "Student profile not found", 404);
    const list = await recommendDrivesForStudent(student, 15);
    return ok(res, list);
  } catch (e) {
    next(e);
  }
}

export async function myApplicationsSummary(req, res, next) {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return fail(res, "Student profile not found", 404);
    const apps = await Application.find({ student: student._id })
      .populate({
        path: "placementDrive",
        populate: { path: "company", select: "name" },
      })
      .sort({ createdAt: -1 })
      .lean();

    const withInterviews = await Promise.all(
      apps.map(async (a) => {
        const interviews = await Interview.find({ application: a._id }).sort({ roundOrder: 1 }).lean();
        return { ...a, interviews };
      })
    );

    return ok(res, withInterviews);
  } catch (e) {
    next(e);
  }
}
