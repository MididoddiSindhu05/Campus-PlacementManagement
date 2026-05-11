import crypto from "crypto";
import { Interview } from "../models/Interview.js";
import { Application } from "../models/Application.js";
import { Student } from "../models/Student.js";
import { ok, fail } from "../utils/apiResponse.js";
import { notifyUser } from "../services/notificationService.js";

export async function scheduleInterview(req, res, next) {
  try {
    const application = await Application.findById(req.params.applicationId);
    if (!application) return fail(res, "Application not found", 404);
    const token = crypto.randomBytes(16).toString("hex");
    const doc = await Interview.create({
      application: application._id,
      roundName: req.body.roundName,
      roundOrder: req.body.roundOrder ?? 1,
      scheduledAt: req.body.scheduledAt,
      venue: req.body.venue || "",
      meetingLink: req.body.meetingLink || "",
      instructions: req.body.instructions || "",
      admitCardToken: token,
      createdBy: req.user.id,
    });

    const stud = await Student.findById(application.student);
    if (stud?.user) {
      await notifyUser(
        stud.user,
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
    const application = await Application.findById(req.params.applicationId);
    if (!application) return fail(res, "Application not found", 404);
    if (req.user.role === "student") {
      const studentDoc = await Student.findOne({ user: req.user.id });
      if (!studentDoc || studentDoc._id.toString() !== application.student.toString()) {
        return fail(res, "Forbidden", 403);
      }
    }
    const rows = await Interview.find({ application: req.params.applicationId }).sort({ roundOrder: 1 });
    return ok(res, rows);
  } catch (e) {
    next(e);
  }
}

export async function admitCardPdf(req, res, next) {
  try {
    if (!req.student?.id) return fail(res, "Forbidden", 403);
    const interview = await Interview.findById(req.params.interviewId).populate({
      path: "application",
      populate: { path: "placementDrive", populate: { path: "company" } },
    });
    if (!interview) return fail(res, "Interview not found", 404);

    const appDoc = interview.application;
    const studentDoc = await Student.findOne({ user: req.user.id });
    if (!appDoc || studentDoc._id.toString() !== appDoc.student.toString()) {
      return fail(res, "Forbidden", 403);
    }

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", `attachment; filename=admit-card-${interview._id}.txt`);
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
