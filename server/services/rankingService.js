import { Student } from "../models/Student.js";
import { computeResumeScore } from "./resumeScoreService.js";

/**
 * Updates rankScore for all students: blend of CGPA, skills count, resume score baseline.
 */
export async function refreshStudentRankings() {
  const students = await Student.find({});
  for (const s of students) {
    const resume = computeResumeScore(s, s.skills);
    s.resumeScore = resume;
    s.rankScore = Number((s.cgpa * 10 + s.skills.length * 2 + resume * 0.1).toFixed(2));
    await s.save();
  }
}

export function studentRankCompare(a, b) {
  return (b.rankScore || 0) - (a.rankScore || 0);
}
