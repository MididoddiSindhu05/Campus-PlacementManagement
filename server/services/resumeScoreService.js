/**
 * Heuristic resume score vs required skills + CGPA factor (no external AI required).
 */
export function computeResumeScore(student, requiredSkills = []) {
  if (!student) return 0;
  const skillSet = new Set((student.skills || []).map((s) => s.toLowerCase()));
  let match = 0;
  const req = requiredSkills.length ? requiredSkills : student.skills || [];
  for (const s of req) {
    if (skillSet.has(String(s).toLowerCase())) match++;
  }
  const ratio = req.length ? match / req.length : 1;
  const cgpaFactor = Math.min(1, (student.cgpa || 0) / 10);
  return Math.round(100 * (0.6 * ratio + 0.4 * cgpaFactor));
}
