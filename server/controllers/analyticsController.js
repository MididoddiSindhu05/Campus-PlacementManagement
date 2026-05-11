import { Student } from "../models/Student.js";
import { Company } from "../models/Company.js";
import { PlacementDrive } from "../models/PlacementDrive.js";
import { Application } from "../models/Application.js";
import { ok } from "../utils/apiResponse.js";

export async function getAnalyticsDashboard(req, res, next) {
  try {
    const [
      totalStudents,
      placedStudents,
      totalCompanies,
      totalDrives,
      totalApplications,
      deptAgg,
      packageAgg,
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ placed: true }),
      Company.countDocuments({ isActive: true }),
      PlacementDrive.countDocuments(),
      Application.countDocuments(),
      Student.aggregate([
        {
          $group: {
            _id: "$department",
            placed: { $sum: { $cond: ["$placed", 1, 0] } },
            total: { $sum: 1 },
          },
        },
      ]),
      PlacementDrive.aggregate([
        { $match: { status: { $in: ["open", "closed", "completed"] } } },
        {
          $group: {
            _id: null,
            maxPackage: { $max: "$salaryMax" },
            avgPackage: { $avg: "$salaryMax" },
          },
        },
      ]),
    ]);

    const placementPct = totalStudents ? Math.round((placedStudents / totalStudents) * 1000) / 10 : 0;

    const eligibleVsAppliedAgg = await Application.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const applicationsByMonth = await Application.aggregate([
      {
        $group: {
          _id: {
            y: { $year: "$appliedAt" },
            m: { $month: "$appliedAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
      { $limit: 12 },
    ]);

    return ok(res, {
      totals: {
        students: totalStudents,
        placedStudents,
        placementPercentage: placementPct,
        companies: totalCompanies,
        drives: totalDrives,
        applications: totalApplications,
      },
      packages: packageAgg[0] || { maxPackage: 0, avgPackage: 0 },
      departmentWise: deptAgg,
      applicationStatusMix: eligibleVsAppliedAgg,
      placementTrends: applicationsByMonth,
    });
  } catch (e) {
    next(e);
  }
}
