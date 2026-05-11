/**
 * Determines if a student meets drive eligibility rules.
 */
export function isStudentEligibleForDrive(student, drive) {
  if (!student || !drive) return { eligible: false, reasons: ["Missing data"] };
  const reasons = [];

  if (drive.status !== "open") {
    reasons.push("Drive is not open for applications");
  }
  if (new Date(drive.applicationDeadline) < new Date()) {
    reasons.push("Application deadline has passed");
  }
  if (student.cgpa < drive.minCgpa) {
    reasons.push(`Minimum CGPA required: ${drive.minCgpa}`);
  }
  if (student.backlogs > drive.maxBacklogs) {
    reasons.push(`Maximum backlogs allowed: ${drive.maxBacklogs}`);
  }
  if (
    drive.eligibleDepartments?.length > 0 &&
    !drive.eligibleDepartments.map((d) => d.toLowerCase()).includes(student.department.toLowerCase())
  ) {
    reasons.push("Department not eligible");
  }
  if (
    drive.graduationYears?.length > 0 &&
    !drive.graduationYears.includes(student.graduationYear)
  ) {
    reasons.push("Graduation year not eligible");
  }
  if (drive.requiredSkills?.length > 0) {
    const have = new Set(student.skills.map((s) => s.toLowerCase()));
    const missing = drive.requiredSkills.filter((s) => !have.has(String(s).toLowerCase()));
    if (missing.length > 0) {
      reasons.push(`Missing required skills: ${missing.join(", ")}`);
    }
  }
  if (student.placed) {
    reasons.push("Student already placed");
  }

  return { eligible: reasons.length === 0, reasons };
}
