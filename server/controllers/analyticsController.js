import { prisma } from "../config/database.js";
import { ok } from "../utils/apiResponse.js";

export async function getAnalyticsDashboard(req, res, next) {
  try {
    const [
      totalStudents,
      placedStudents,
      totalCompanies,
      totalDrives,
      totalApplications,
      deptAggRaw,
      packageAgg,
      eligibleVsAppliedAgg,
      applicationsByMonthRaw
    ] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { placed: true } }),
      prisma.company.count({ where: { isActive: true } }),
      prisma.placementDrive.count(),
      prisma.application.count(),
      prisma.$queryRaw`
        SELECT department as "_id", 
               CAST(SUM(CASE WHEN placed = true THEN 1 ELSE 0 END) AS INTEGER) as placed, 
               CAST(COUNT(*) AS INTEGER) as total
        FROM "Student"
        GROUP BY department
      `,
      prisma.placementDrive.aggregate({
        where: { status: { in: ["open", "closed", "completed"] } },
        _max: { salaryMax: true },
        _avg: { salaryMax: true },
      }),
      prisma.application.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.$queryRaw`
        SELECT 
          EXTRACT(YEAR FROM "appliedAt") as y, 
          EXTRACT(MONTH FROM "appliedAt") as m, 
          CAST(COUNT(*) AS INTEGER) as count
        FROM "Application"
        GROUP BY EXTRACT(YEAR FROM "appliedAt"), EXTRACT(MONTH FROM "appliedAt")
        ORDER BY y ASC, m ASC
        LIMIT 12
      `
    ]);

    const placementPct = totalStudents ? Math.round((placedStudents / totalStudents) * 1000) / 10 : 0;

    const applicationStatusMix = eligibleVsAppliedAgg.map(item => ({
      _id: item.status,
      count: item._count._all
    }));

    const applicationsByMonth = (applicationsByMonthRaw || []).map(item => ({
      _id: { y: Number(item.y), m: Number(item.m) },
      count: Number(item.count)
    }));

    const deptAgg = (deptAggRaw || []).map(item => ({
      _id: item._id,
      placed: Number(item.placed),
      total: Number(item.total)
    }));

    return ok(res, {
      totals: {
        students: totalStudents,
        placedStudents,
        placementPercentage: placementPct,
        companies: totalCompanies,
        drives: totalDrives,
        applications: totalApplications,
      },
      packages: { 
        maxPackage: packageAgg?._max?.salaryMax || 0, 
        avgPackage: packageAgg?._avg?.salaryMax || 0 
      },
      departmentWise: deptAgg,
      applicationStatusMix,
      placementTrends: applicationsByMonth,
    });
  } catch (e) {
    next(e);
  }
}
