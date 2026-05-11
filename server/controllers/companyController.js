import { Company } from "../models/Company.js";
import { ok, fail, paginationMeta } from "../utils/apiResponse.js";
import { getPagination, sortSpec } from "../utils/pagination.js";
import { escapeRegex } from "../utils/search.js";

export async function createCompany(req, res, next) {
  try {
    const doc = await Company.create({ ...req.body, createdBy: req.user.id });
    return ok(res, doc, "Company created", 201);
  } catch (e) {
    next(e);
  }
}

export async function listCompanies(req, res, next) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const q = {};
    if (req.query.search) {
      const term = escapeRegex(String(req.query.search).trim());
      q.$or = [{ name: new RegExp(term, "i") }, { industry: new RegExp(term, "i") }];
    }
    if (req.query.active === "true") q.isActive = true;
    const sort = sortSpec(req.query);
    const [total, rows] = await Promise.all([
      Company.countDocuments(q),
      Company.find(q)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select("-__v"),
    ]);
    return ok(res, { items: rows, meta: paginationMeta(total, page, limit) });
  } catch (e) {
    next(e);
  }
}

export async function getCompany(req, res, next) {
  try {
    const doc = await Company.findById(req.params.id);
    if (!doc) return fail(res, "Company not found", 404);
    return ok(res, doc);
  } catch (e) {
    next(e);
  }
}

export async function updateCompany(req, res, next) {
  try {
    const doc = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return fail(res, "Company not found", 404);
    return ok(res, doc, "Updated");
  } catch (e) {
    next(e);
  }
}

export async function deleteCompany(req, res, next) {
  try {
    const doc = await Company.findByIdAndDelete(req.params.id);
    if (!doc) return fail(res, "Company not found", 404);
    return ok(res, null, "Deleted");
  } catch (e) {
    next(e);
  }
}
