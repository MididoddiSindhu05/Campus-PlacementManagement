import PDFDocument from "pdfkit";
import { Student } from "../models/Student.js";
import { Company } from "../models/Company.js";
import { Application } from "../models/Application.js";
import { Report } from "../models/Report.js";
import { ok } from "../utils/apiResponse.js";
import fs from "fs";
import path from "path";

export async function generatePlacementPdf(req, res, next) {
  try {
    const [placed, totals] = await Promise.all([
      Student.find({ placed: true }).populate("user", "name email").limit(500),
      Promise.all([
        Student.countDocuments(),
        Student.countDocuments({ placed: true }),
        Application.countDocuments(),
        Company.countDocuments(),
      ]),
    ]);

    const [totalStudents, placedCount, apps, comps] = totals;
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

    await Report.create({
      title: "Placement Summary",
      generatedBy: req.user.id,
      type: "placement_summary",
      payload: { totalStudents, placedCount, placementPct },
      filePath,
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
    const rows = await Report.find().sort({ createdAt: -1 }).limit(50).populate("generatedBy", "name email");
    return ok(res, rows);
  } catch (e) {
    next(e);
  }
}
