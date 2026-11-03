import { prisma } from "../config/database.js";
import { ok, fail, paginationMeta } from "../utils/apiResponse.js";
import { getPagination } from "../utils/pagination.js";
import { notifyRole } from "../services/notificationService.js";

export async function createDrive(req, res, next) {
  try {
    const { rounds, ...data } = req.body;
    
    const createData = {
      ...data,
      postedById: req.user.id
    };

    if (rounds && rounds.length > 0) {
      createData.rounds = {
        create: rounds.map((r, i) => ({
          name: r.name,
          order: r.order || i + 1,
          description: r.description
        }))
      };
    }

    const doc = await prisma.placementDrive.create({
      data: createData,
      include: { rounds: true }
    });

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
    if (req.query.company) q.companyId = req.query.company;
    if (req.query.status) q.status = req.query.status;
    
    if (req.query.search) {
      const term = String(req.query.search).trim();
      q.OR = [
        { title: { contains: term, mode: "insensitive" } },
        { jobRole: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
      ];
    }
    
    let sort = { createdAt: 'desc' };
    if (req.query.sort) {
      const field = req.query.sort.replace('-', '');
      const order = req.query.sort.startsWith('-') ? 'desc' : 'asc';
      sort = { [field]: order };
    }

    const [total, rows] = await Promise.all([
      prisma.placementDrive.count({ where: q }),
      prisma.placementDrive.findMany({
        where: q,
        orderBy: sort,
        skip,
        take: limit,
        include: { company: { select: { name: true, industry: true } } }
      })
    ]);
    return ok(res, { items: rows, meta: paginationMeta(total, page, limit) });
  } catch (e) {
    next(e);
  }
}

export async function getDrive(req, res, next) {
  try {
    const doc = await prisma.placementDrive.findUnique({
      where: { id: req.params.id },
      include: { company: true, rounds: { orderBy: { order: 'asc' } } }
    });
    if (!doc) return fail(res, "Drive not found", 404);
    return ok(res, doc);
  } catch (e) {
    next(e);
  }
}

export async function updateDrive(req, res, next) {
  try {
    const { rounds, ...data } = req.body;
    
    const exists = await prisma.placementDrive.findUnique({ where: { id: req.params.id } });
    if (!exists) return fail(res, "Drive not found", 404);

    let updateData = { ...data };

    if (rounds) {
      updateData.rounds = {
        deleteMany: {},
        create: rounds.map((r, i) => ({
          name: r.name,
          order: r.order || i + 1,
          description: r.description
        }))
      };
    }

    const doc = await prisma.placementDrive.update({
      where: { id: req.params.id },
      data: updateData,
      include: { rounds: true }
    });
    return ok(res, doc, "Updated");
  } catch (e) {
    next(e);
  }
}

export async function deleteDrive(req, res, next) {
  try {
    const exists = await prisma.placementDrive.findUnique({ where: { id: req.params.id } });
    if (!exists) return fail(res, "Drive not found", 404);

    await prisma.placementDrive.delete({ where: { id: req.params.id } });
    return ok(res, null, "Deleted");
  } catch (e) {
    next(e);
  }
}
