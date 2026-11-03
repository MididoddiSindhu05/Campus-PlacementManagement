import crypto from "crypto";
import { prisma } from "../config/database.js";
import { ok, fail } from "../utils/apiResponse.js";
import { notifyUser } from "../services/notificationService.js";

export async function scheduleInterview(req, res, next) {
  try {
    const application = await prisma.application.findUnique({ where: { id: req.params.applicationId } });
    if (!application) return fail(res, "Application not found", 404);
    
    const token = crypto.randomBytes(16).toString("hex");
    
    const doc = await prisma.interview.create({
      data: {
        applicationId: application.id,
        roundName: req.body.roundName,
        roundOrder: req.body.roundOrder ?? 1,
        scheduledAt: new Date(req.body.scheduledAt),
        venue: req.body.venue || "",
        meetingLink: req.body.meetingLink || "",
        instructions: req.body.instructions || "",
        admitCardToken: token,
        createdById: req.user.id,
      }
    });

    const stud = await prisma.student.findUnique({ where: { id: application.studentId } });
    if (stud?.userId) {
      await notifyUser(
        stud.userId,
        `Interview scheduled: ${req.body.roundName}`,
        `Time: ${new Date(req.body.scheduledAt).toLocaleString()}${req.body.venue ? ` Venue: ${req.body.venue}` : ""}`,
        "reminder",
        "/applications"
      );
    }
    return ok(res, doc, "Interview scheduled", 201);
  } catch (e) {
    next(e);
  }
}

export async function listInterviewsForApplication(req, res, next) {
  try {
    const application = await prisma.application.findUnique({ where: { id: req.params.applicationId } });
    if (!application) return fail(res, "Application not found", 404);
    
    if (req.user.role === "student") {
      const studentDoc = await prisma.student.findUnique({ where: { userId: req.user.id } });
      if (!studentDoc || studentDoc.id !== application.studentId) {
        return fail(res, "Forbidden", 403);
      }
    }
    
    const rows = await prisma.interview.findMany({
      where: { applicationId: req.params.applicationId },
      orderBy: { roundOrder: 'asc' }
    });
    return ok(res, rows);
  } catch (e) {
    next(e);
  }
}

export async function admitCardPdf(req, res, next) {
  try {
    if (!req.student?.id) return fail(res, "Forbidden", 403);
    
    const interview = await prisma.interview.findUnique({
      where: { id: req.params.interviewId },
      include: {
        application: {
          include: {
            placementDrive: {
              include: { company: true }
            }
          }
        }
      }
    });
    if (!interview) return fail(res, "Interview not found", 404);

    const appDoc = interview.application;
    const studentDoc = await prisma.student.findUnique({ where: { userId: req.user.id } });
    
    if (!appDoc || studentDoc.id !== appDoc.studentId) {
      return fail(res, "Forbidden", 403);
    }

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", `attachment; filename=admit-card-${interview.id}.txt`);
    const company = appDoc.placementDrive?.company?.name || "Company";
    const role = appDoc.placementDrive?.jobRole || "";
    const lines = [
      "PLACEMENT PORTAL — ADMIT DETAILS",
      `Student: ${req.user.email}`,
      `Company: ${company}`,
      `Role: ${role}`,
      `Round: ${interview.roundName}`,
      `When: ${new Date(interview.scheduledAt).toISOString()}`,
      `Venue: ${interview.venue}`,
      `Link: ${interview.meetingLink}`,
      `Token: ${interview.admitCardToken}`,
      "",
      interview.instructions,
    ];
    res.send(lines.filter(Boolean).join("\n"));
  } catch (e) {
    next(e);
  }
}
