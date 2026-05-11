import { PlacementDrive } from "../models/PlacementDrive.js";
import { isStudentEligibleForDrive } from "./eligibilityService.js";

/**
 * Score drives for a student: eligibility + skill overlap.
 */
export async function recommendDrivesForStudent(student, limit = 10) {
  const drives = await PlacementDrive.find({ status: "open" })
    .populate("company", "name industry")
    .sort({ applicationDeadline: 1 })
    .limit(100)
    .lean();

  const scored = [];
  for (const d of drives) {
    const { eligible, reasons } = isStudentEligibleForDrive(student, d);
    const skillSet = new Set((student.skills || []).map((s) => s.toLowerCase()));
    let overlap = 0;
    for (const s of d.requiredSkills || []) {
      if (skillSet.has(String(s).toLowerCase())) overlap++;
    }
    const req = d.requiredSkills?.length || 1;
    const skillScore = overlap / req;
    const recommendationScore = eligible ? Math.round(skillScore * 100 + (student.cgpa || 0) * 5) : 0;
    scored.push({
      ...d,
      eligible,
      eligibilityReasons: reasons,
      recommendationScore,
    });
  }
  scored.sort((a, b) => b.recommendationScore - a.recommendationScore);
  return scored.slice(0, limit);
}
