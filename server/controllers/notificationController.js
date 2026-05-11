import { Notification } from "../models/Notification.js";
import mongoose from "mongoose";
import { ok, fail } from "../utils/apiResponse.js";

export async function myNotifications(req, res, next) {
  try {
    const uid = new mongoose.Types.ObjectId(req.user.id);
    const list = await Notification.find({
      $or: [{ user: req.user.id }, { user: null, audienceRole: { $in: ["all", req.user.role] } }],
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const withReadFlag = list.map((n) => ({
      ...n,
      read: n.readBy?.some((id) => id.equals(uid)),
    }));

    return ok(res, withReadFlag);
  } catch (e) {
    next(e);
  }
}

export async function markNotificationRead(req, res, next) {
  try {
    const n = await Notification.findById(req.params.id);
    if (!n) return fail(res, "Not found", 404);
    if (!n.readBy.includes(req.user.id)) {
      n.readBy.push(req.user.id);
      await n.save();
    }
    return ok(res, n);
  } catch (e) {
    next(e);
  }
}

export async function adminCreateNotification(req, res, next) {
  try {
    const { title, message, audienceRole, userId, link, type } = req.body;
    const doc = await Notification.create({
      title,
      message,
      link: link || "",
      type: type || "info",
      audienceRole: audienceRole || "student",
      user: userId || null,
    });
    return ok(res, doc, "Notification created", 201);
  } catch (e) {
    next(e);
  }
}
