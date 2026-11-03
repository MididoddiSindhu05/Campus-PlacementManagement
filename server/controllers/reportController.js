import PDFDocument from "pdfkit";
import { prisma } from "../config/database.js";
import { ok } from "../utils/apiResponse.js";
import fs from "fs";
import path from "path";

export async function generatePlacementPdf(req, res, next) {
  try {
    const [placed, totalStudents, placedCount, apps, comps] = await Promise.all([
      prisma.student.findMany({
        where: { placed: true },
        include: { user: { select: { name: true, email: true } } },
        take: 500
      }),
      prisma.student.count(),
      prisma.student.count({ where: { placed: true } }),
      prisma.application.count(),
      prisma.company.count(),
    ]);

    const placementPct = totalStudents ? ((placedCount / totalStudents) * 100).toFixed(2) : 0;

    const reportsDir = path.join(process.cwd(), "uploads", "reports");
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    const fileName = `placement-report-${Date.now()}.pdf`;
    const filePath = path.join(reportsDir, fileName);

    const docPdf = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    docPdf.pipe(stream);

    docPdf.fontSize(18).text("College Placement Summary", { underline: true });
    docPdf.moveDown();
    docPdf.fontSize(11).text(`Generated at: ${new Date().toISOString()}`);
    docPdf.text(`Total students: ${totalStudents}`);
    docPdf.text(`Placed: ${placedCount} (${placementPct}% )`);
    docPdf.text(`Applications: ${apps}`);
    docPdf.text(`Companies: ${comps}`);
    docPdf.moveDown();

    docPdf.fontSize(14).text("Placed students", { underline: true });
    docPdf.moveDown(0.5);
    placed.forEach((s, i) => {
      docPdf.fontSize(10).text(
        `${i + 1}. ${s.user?.name || "?"} (${s.rollNumber}) — ${s.placedCompanyName || ""} — dept ${s.department}`
      );
    });

    docPdf.end();

    await new Promise((resolve, reject) => {
      stream.on("finish", resolve);
      stream.on("error", reject);
    });

    await prisma.report.create({
      data: {
        title: "Placement Summary",
        generatedById: req.user.id,
        type: "placement_summary",
        payload: { totalStudents, placedCount, placementPct },
        filePath,
      }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    fs.createReadStream(filePath).pipe(res);
  } catch (e) {
    next(e);
  }
}

export async function listReports(req, res, next) {
  try {
    const rows = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { generatedBy: { select: { name: true, email: true } } }
    });
    return ok(res, rows);
  } catch (e) {
    next(e);
  }
}
