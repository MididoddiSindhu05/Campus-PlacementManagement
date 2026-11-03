import { prisma } from "../config/database.js";
import { ok, fail, paginationMeta } from "../utils/apiResponse.js";
import { getPagination } from "../utils/pagination.js";
import { isStudentEligibleForDrive } from "../services/eligibilityService.js";
import { notifyUser } from "../services/notificationService.js";

export async function applyToDrive(req, res, next) {
  try {
    if (!req.student?.id) return fail(res, "Student profile required", 403);
    const student = await prisma.student.findUnique({ where: { id: req.student.id } });
    const drive = await prisma.placementDrive.findUnique({ where: { id: req.params.driveId } });
    
    if (!drive) return fail(res, "Placement drive not found", 404);
    
    const { eligible, reasons } = isStudentEligibleForDrive(student, drive);
    if (!eligible) return fail(res, reasons.join("; "), 400);

    try {
      const app = await prisma.application.create({
        data: {
          studentId: student.id,
          placementDriveId: drive.id,
          status: "pending",
        }
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
      if (e.code === 'P2002') return fail(res, "You have already applied to this drive", 409);
      throw e;
    }
  } catch (e) {
    next(e);
  }
}

export async function withdrawApplication(req, res, next) {
  try {
    if (!req.student?.id) return fail(res, "Student profile required", 403);
    
    const app = await prisma.application.findFirst({
      where: {
        id: req.params.id,
        studentId: req.student.id,
      }
    });
    
    if (!app) return fail(res, "Application not found", 404);
    
    const updated = await prisma.application.update({
      where: { id: app.id },
      data: { status: "withdrawn" }
    });
    return ok(res, updated, "Withdrawn");
  } catch (e) {
    next(e);
  }
}

export async function adminListApplications(req, res, next) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const q = {};
    if (req.query.status) q.status = req.query.status;
    if (req.query.student) q.studentId = req.query.student;
    if (req.query.drive) q.placementDriveId = req.query.drive;
    if (req.query.fraud === "true") q.fraudFlag = true;
    
    let sort = { appliedAt: 'desc' };
    if (req.query.sort) {
      const field = req.query.sort.replace('-', '');
      const order = req.query.sort.startsWith('-') ? 'desc' : 'asc';
      sort = { [field]: order };
    }

    const [total, rows] = await Promise.all([
      prisma.application.count({ where: q }),
      prisma.application.findMany({
        where: q,
        orderBy: sort,
        skip,
        take: limit,
        include: {
          student: {
            select: {
              rollNumber: true, cgpa: true, department: true, skills: true, graduationYear: true,
              user: { select: { name: true, email: true } }
            }
          },
          placementDrive: {
            select: {
              title: true, jobRole: true,
              company: { select: { name: true } }
            }
          }
        }
      })
    ]);
    return ok(res, { items: rows, meta: paginationMeta(total, page, limit) });
  } catch (e) {
    next(e);
  }
}

export async function adminUpdateApplication(req, res, next) {
  try {
    const exists = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { placementDrive: { select: { title: true } } }
    });
    if (!exists) return fail(res, "Application not found", 404);

    const dataToUpdate = {};
    if (req.body.status !== undefined) dataToUpdate.status = req.body.status;
    if (req.body.remarks !== undefined) dataToUpdate.remarks = req.body.remarks;
    if (req.body.fraudFlag !== undefined) dataToUpdate.fraudFlag = req.body.fraudFlag;

    const app = await prisma.application.update({
      where: { id: req.params.id },
      data: dataToUpdate,
      include: { placementDrive: { select: { title: true, companyId: true } } }
    });

    const studentDoc = await prisma.student.findUnique({ where: { id: app.studentId } });
    if (studentDoc?.userId) {
      await notifyUser(
        studentDoc.userId,
        `Application updated: ${app.placementDrive?.title || ""}`,
        `Your status is now "${app.status}". ${app.remarks || ""}`.trim(),
        "info",
        "/applications"
      );
    }

    if (app.status === "offered") {
      const driveFull = await prisma.placementDrive.findUnique({
        where: { id: app.placementDriveId },
        include: { company: true }
      });
      await prisma.student.update({
        where: { id: app.studentId },
        data: {
          placed: true,
          placedCompanyName: driveFull?.company?.name || "",
          placementDriveId: app.placementDriveId
        }
      });
    }
    return ok(res, app, "Updated");
  } catch (e) {
    next(e);
  }
}

export async function adminDeleteApplication(req, res, next) {
  try {
    const exists = await prisma.application.findUnique({ where: { id: req.params.id } });
    if (!exists) return fail(res, "Not found", 404);
    await prisma.application.delete({ where: { id: req.params.id } });
    return ok(res, null, "Removed");
  } catch (e) {
    next(e);
  }
}
