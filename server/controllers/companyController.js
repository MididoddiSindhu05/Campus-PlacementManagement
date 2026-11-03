import { prisma } from "../config/database.js";
import { ok, fail, paginationMeta } from "../utils/apiResponse.js";
import { getPagination, sortSpec } from "../utils/pagination.js";

export async function createCompany(req, res, next) {
  try {
    const doc = await prisma.company.create({
      data: { ...req.body, createdById: req.user.id }
    });
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
      const term = String(req.query.search).trim();
      q.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { industry: { contains: term, mode: "insensitive" } }
      ];
    }
    if (req.query.active === "true") q.isActive = true;
    
    // Sort logic translation. Prisma requires { field: 'asc'|'desc' }
    // The previous sortSpec returned a mongoose sort object. We need to handle this manually.
    let sort = { createdAt: 'desc' };
    if (req.query.sort) {
      const field = req.query.sort.replace('-', '');
      const order = req.query.sort.startsWith('-') ? 'desc' : 'asc';
      sort = { [field]: order };
    }

    const [total, rows] = await Promise.all([
      prisma.company.count({ where: q }),
      prisma.company.findMany({
        where: q,
        orderBy: sort,
        skip,
        take: limit
      })
    ]);
    return ok(res, { items: rows, meta: paginationMeta(total, page, limit) });
  } catch (e) {
    next(e);
  }
}

export async function getCompany(req, res, next) {
  try {
    const doc = await prisma.company.findUnique({ where: { id: req.params.id } });
    if (!doc) return fail(res, "Company not found", 404);
    return ok(res, doc);
  } catch (e) {
    next(e);
  }
}

export async function updateCompany(req, res, next) {
  try {
    const exists = await prisma.company.findUnique({ where: { id: req.params.id } });
    if (!exists) return fail(res, "Company not found", 404);
    
    const doc = await prisma.company.update({
      where: { id: req.params.id },
      data: req.body
    });
    return ok(res, doc, "Updated");
  } catch (e) {
    next(e);
  }
}

export async function deleteCompany(req, res, next) {
  try {
    const exists = await prisma.company.findUnique({ where: { id: req.params.id } });
    if (!exists) return fail(res, "Company not found", 404);
    
    await prisma.company.delete({ where: { id: req.params.id } });
    return ok(res, null, "Deleted");
  } catch (e) {
    next(e);
  }
}
