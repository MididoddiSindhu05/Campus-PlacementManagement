import { User } from "../models/User.js";
import { Student } from "../models/Student.js";
import { ok, fail, paginationMeta } from "../utils/apiResponse.js";
import { getPagination, sortSpec } from "../utils/pagination.js";
import { escapeRegex } from "../utils/search.js";
import { computeResumeScore } from "../services/resumeScoreService.js";

export async function listStudents(req, res, next) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const q = {};
    if (req.query.department) q.department = req.query.department;
    if (req.query.graduationYear) q.graduationYear = Number(req.query.graduationYear);
    if (req.query.placed === "true") q.placed = true;
    if (req.query.placed === "false") q.placed = false;
    if (req.query.search) {
      const term = escapeRegex(String(req.query.search).trim());
      q.$or = [
        { rollNumber: new RegExp(term, "i") },
        { department: new RegExp(term, "i") },
      ];
    }
    const [total, rows] = await Promise.all([
      Student.countDocuments(q),
      Student.find(q)
        .sort(sortSpec(req.query, "-updatedAt"))
        .skip(skip)
        .limit(limit)
        .populate("user", "name email role"),
    ]);
    return ok(res, { items: rows, meta: paginationMeta(total, page, limit) });
  } catch (e) {
    next(e);
  }
}

export async function getStudent(req, res, next) {
  try {
    const s = await Student.findById(req.params.id).populate("user");
    if (!s) return fail(res, "Not found", 404);
    return ok(res, s);
  } catch (e) {
    next(e);
  }
}

export async function adminUpdateStudent(req, res, next) {
  try {
    const s = await Student.findById(req.params.id);
    if (!s) return fail(res, "Not found", 404);
    const allowed = ["phone", "department", "cgpa", "backlogs", "graduationYear", "skills", "placed"];
    for (const k of allowed) {
      if (req.body[k] !== undefined) s[k] = req.body[k];
    }
    s.resumeScore = computeResumeScore(s, s.skills);
    s.rankScore = Number(((s.cgpa || 0) * 10 + (s.skills?.length || 0) * 2 + (s.resumeScore || 0) * 0.1).toFixed(2));
    await s.save();
    return ok(res, s, "Student updated");
  } catch (e) {
    next(e);
  }
}

export async function adminDeleteStudent(req, res, next) {
  try {
    const s = await Student.findById(req.params.id);
    if (!s) return fail(res, "Not found", 404);
    await User.findByIdAndDelete(s.user);
    await Student.findByIdAndDelete(s._id);
    return ok(res, null, "Student removed");
  } catch (e) {
    next(e);
  }
}

export async function exportStudentsCsv(req, res, next) {
  try {
    const students = await Student.find(req.query.filter ? JSON.parse(req.query.filter) : {})
      .populate("user", "name email")
      .lean();

    const header = "name,email,rollNumber,department,cgpa,backlogs,graduationYear,placed,resumeScore,rankScore\n";
    const lines = students.map((s) => {
      const name = `"${String(s.user?.name || "").replace(/"/g, '""')}"`;
      const email = s.user?.email || "";
      return [
        name,
        email,
        s.rollNumber,
        s.department,
        s.cgpa,
        s.backlogs,
        s.graduationYear,
        s.placed,
        s.resumeScore,
        s.rankScore,
      ].join(",");
    });

    const csv = header + lines.join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=students.csv");
    res.send(csv);
  } catch (e) {
    next(e);
  }
}
