import { Application } from "../models/Application.js";
import { PlacementDrive } from "../models/PlacementDrive.js";
import { Student } from "../models/Student.js";
import { ok, fail, paginationMeta } from "../utils/apiResponse.js";
import { getPagination, sortSpec } from "../utils/pagination.js";
import { isStudentEligibleForDrive } from "../services/eligibilityService.js";
import { notifyUser } from "../services/notificationService.js";

export async function applyToDrive(req, res, next) {
  try {
    if (!req.student?.id) return fail(res, "Student profile required", 403);
    const student = await Student.findById(req.student.id);
    const drive = await PlacementDrive.findById(req.params.driveId);
    if (!drive) return fail(res, "Placement drive not found", 404);
    const { eligible, reasons } = isStudentEligibleForDrive(student, drive);
    if (!eligible) return fail(res, reasons.join("; "), 400);

    try {
      const app = await Application.create({
        student: student._id,
        placementDrive: drive._id,
        status: "pending",
      });
      await notifyUser(
        req.user.id,
        "Application submitted",
        `You applied for ${drive.title}`,
        "success",
        "/applications"
      );
      return ok(res, app, "Application submitted", 201);
    } catch (e) {
      if (e.code === 11000) return fail(res, "You have already applied to this drive", 409);
      throw e;
    }
  } catch (e) {
    next(e);
  }
}

export async function withdrawApplication(req, res, next) {
  try {
    if (!req.student?.id) return fail(res, "Student profile required", 403);
    const app = await Application.findOne({
      _id: req.params.id,
      student: req.student.id,
    });
    if (!app) return fail(res, "Application not found", 404);
    app.status = "withdrawn";
    await app.save();
    return ok(res, app, "Withdrawn");
  } catch (e) {
    next(e);
  }
}

export async function adminListApplications(req, res, next) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const q = {};
    if (req.query.status) q.status = req.query.status;
    if (req.query.student) q.student = req.query.student;
    if (req.query.drive) q.placementDrive = req.query.drive;
    if (req.query.fraud === "true") q.fraudFlag = true;
    const [total, rows] = await Promise.all([
      Application.countDocuments(q),
      Application.find(q)
        .sort(sortSpec(req.query, "-appliedAt"))
        .skip(skip)
        .limit(limit)
        .populate({
          path: "student",
          select: "rollNumber cgpa department skills user graduationYear",
          populate: { path: "user", select: "name email" },
        })
        .populate({
          path: "placementDrive",
          select: "title jobRole company",
          populate: { path: "company", select: "name" },
        }),
    ]);
    return ok(res, { items: rows, meta: paginationMeta(total, page, limit) });
  } catch (e) {
    next(e);
  }
}

export async function adminUpdateApplication(req, res, next) {
  try {
    const app = await Application.findById(req.params.id).populate({
      path: "placementDrive",
      select: "title",
    });
    if (!app) return fail(res, "Application not found", 404);
    app.status = req.body.status;
    if (req.body.remarks !== undefined) app.remarks = req.body.remarks;
    if (req.body.fraudFlag !== undefined) app.fraudFlag = req.body.fraudFlag;
    await app.save();

    const studentDoc = await Student.findById(app.student);
    if (studentDoc?.user) {
      await notifyUser(
        studentDoc.user,
        `Application updated: ${app.placementDrive?.title || ""}`,
        `Your status is now "${app.status}". ${app.remarks || ""}`.trim(),
        "info",
        "/applications"
      );
    }

    if (app.status === "offered") {
      const driveFull = await PlacementDrive.findById(app.placementDrive).populate("company");
      studentDoc.placed = true;
      studentDoc.placedCompanyName = driveFull?.company?.name || "";
      studentDoc.placementDriveId = app.placementDrive;
      await studentDoc.save();
    }
    return ok(res, app, "Updated");
  } catch (e) {
    next(e);
  }
}

export async function adminDeleteApplication(req, res, next) {
  try {
    const app = await Application.findByIdAndDelete(req.params.id);
    if (!app) return fail(res, "Not found", 404);
    return ok(res, null, "Removed");
  } catch (e) {
    next(e);
  }
}
