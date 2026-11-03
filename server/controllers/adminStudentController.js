import { prisma } from "../config/database.js";
import { ok, fail, paginationMeta } from "../utils/apiResponse.js";
import { getPagination } from "../utils/pagination.js";
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
      const term = String(req.query.search).trim();
      q.OR = [
        { rollNumber: { contains: term, mode: "insensitive" } },
        { department: { contains: term, mode: "insensitive" } },
      ];
    }

    let sort = { updatedAt: 'desc' };
    if (req.query.sort) {
      const field = req.query.sort.replace('-', '');
      const order = req.query.sort.startsWith('-') ? 'desc' : 'asc';
      sort = { [field]: order };
    }

    const [total, rows] = await Promise.all([
      prisma.student.count({ where: q }),
      prisma.student.findMany({
        where: q,
        orderBy: sort,
        skip,
        take: limit,
        include: { user: { select: { name: true, email: true, role: true } } }
      })
    ]);
    return ok(res, { items: rows, meta: paginationMeta(total, page, limit) });
  } catch (e) {
    next(e);
  }
}

export async function getStudent(req, res, next) {
  try {
    const s = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { name: true, email: true, role: true } } }
    });
    if (!s) return fail(res, "Not found", 404);
    return ok(res, s);
  } catch (e) {
    next(e);
  }
}

export async function adminUpdateStudent(req, res, next) {
  try {
    const s = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!s) return fail(res, "Not found", 404);
    
    const allowed = ["phone", "department", "cgpa", "backlogs", "graduationYear", "skills", "placed"];
    const dataToUpdate = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) dataToUpdate[k] = req.body[k];
    }
    
    const currentSkills = dataToUpdate.skills !== undefined ? dataToUpdate.skills : s.skills;
    const currentCgpa = dataToUpdate.cgpa !== undefined ? dataToUpdate.cgpa : s.cgpa;
    const currentDepartment = dataToUpdate.department !== undefined ? dataToUpdate.department : s.department;

    dataToUpdate.resumeScore = computeResumeScore({ cgpa: currentCgpa, department: currentDepartment, skills: currentSkills }, currentSkills);
    dataToUpdate.rankScore = Number(((currentCgpa || 0) * 10 + (currentSkills?.length || 0) * 2 + (dataToUpdate.resumeScore || 0) * 0.1).toFixed(2));

    const updated = await prisma.student.update({
      where: { id: req.params.id },
      data: dataToUpdate
    });
    return ok(res, updated, "Student updated");
  } catch (e) {
    next(e);
  }
}

export async function adminDeleteStudent(req, res, next) {
  try {
    const s = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!s) return fail(res, "Not found", 404);
    
    // Deleting the user will cascade delete the student
    await prisma.user.delete({ where: { id: s.userId } });
    
    return ok(res, null, "Student removed");
  } catch (e) {
    next(e);
  }
}

export async function exportStudentsCsv(req, res, next) {
  try {
    const filterParams = req.query.filter ? JSON.parse(req.query.filter) : {};
    let q = {};
    if (filterParams.department) q.department = filterParams.department;
    if (filterParams.graduationYear) q.graduationYear = Number(filterParams.graduationYear);
    if (filterParams.placed !== undefined) q.placed = filterParams.placed === true || filterParams.placed === 'true';

    const students = await prisma.student.findMany({
      where: q,
      include: { user: { select: { name: true, email: true } } }
    });

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
