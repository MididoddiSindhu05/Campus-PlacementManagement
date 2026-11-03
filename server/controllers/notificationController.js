import { prisma } from "../config/database.js";
import { ok, fail } from "../utils/apiResponse.js";

export async function myNotifications(req, res, next) {
  try {
    const uid = req.user.id;
    const list = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: uid },
          { userId: null, audienceRole: { in: ["all", req.user.role] } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        readBy: {
          where: { userId: uid }
        }
      }
    });

    const withReadFlag = list.map((n) => {
      const { readBy, ...rest } = n;
      return {
        ...rest,
        read: readBy && readBy.length > 0,
      };
    });

    return ok(res, withReadFlag);
  } catch (e) {
    next(e);
  }
}

export async function markNotificationRead(req, res, next) {
  try {
    const n = await prisma.notification.findUnique({ where: { id: req.params.id } });
    if (!n) return fail(res, "Not found", 404);
    
    // Attempt to create a read record, ignore if it already exists
    try {
      await prisma.notificationRead.create({
        data: {
          notificationId: n.id,
          userId: req.user.id
        }
      });
    } catch (err) {
      if (err.code !== 'P2002') throw err; // Ignore unique constraint violation
    }
    
    return ok(res, n);
  } catch (e) {
    next(e);
  }
}

export async function adminCreateNotification(req, res, next) {
  try {
    const { title, message, audienceRole, userId, link, type } = req.body;
    const doc = await prisma.notification.create({
      data: {
        title,
        message,
        link: link || "",
        type: type || "info",
        audienceRole: audienceRole || "student",
        userId: userId || null,
      }
    });
    return ok(res, doc, "Notification created", 201);
  } catch (e) {
    next(e);
  }
}
