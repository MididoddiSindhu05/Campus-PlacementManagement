import { PlacementDrive } from "../models/PlacementDrive.js";
import { ok, fail, paginationMeta } from "../utils/apiResponse.js";
import { getPagination, sortSpec } from "../utils/pagination.js";
import { notifyRole } from "../services/notificationService.js";
import { escapeRegex } from "../utils/search.js";

export async function createDrive(req, res, next) {
  try {
    const doc = await PlacementDrive.create({ ...req.body, postedBy: req.user.id });
    await notifyRole(
      "student",
      `New placement drive: ${doc.title}`,
      `Apply before ${new Date(doc.applicationDeadline).toLocaleDateString()}`,
      "info",
      "/drives"
    );
    return ok(res, doc, "Placement drive created", 201);
  } catch (e) {
    next(e);
  }
}

export async function listDrives(req, res, next) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const q = {};
    if (req.query.company) q.company = req.query.company;
    if (req.query.status) q.status = req.query.status;
    if (req.query.search) {
      const term = escapeRegex(String(req.query.search).trim());
      q.$or = [
        { title: new RegExp(term, "i") },
        { jobRole: new RegExp(term, "i") },
        { description: new RegExp(term, "i") },
      ];
    }
    const sort = sortSpec(req.query);
    const [total, rows] = await Promise.all([
      PlacementDrive.countDocuments(q),
      PlacementDrive.find(q)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("company", "name industry")
        .select("-__v"),
    ]);
    return ok(res, { items: rows, meta: paginationMeta(total, page, limit) });
  } catch (e) {
    next(e);
  }
}

export async function getDrive(req, res, next) {
  try {
    const doc = await PlacementDrive.findById(req.params.id).populate("company");
    if (!doc) return fail(res, "Drive not found", 404);
    return ok(res, doc);
  } catch (e) {
    next(e);
  }
}

export async function updateDrive(req, res, next) {
  try {
    const doc = await PlacementDrive.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return fail(res, "Drive not found", 404);
    return ok(res, doc, "Updated");
  } catch (e) {
    next(e);
  }
}

export async function deleteDrive(req, res, next) {
  try {
    const doc = await PlacementDrive.findByIdAndDelete(req.params.id);
    if (!doc) return fail(res, "Drive not found", 404);
    return ok(res, null, "Deleted");
  } catch (e) {
    next(e);
  }
}
