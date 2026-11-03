import { prisma } from "../config/database.js";
import { computeResumeScore } from "./resumeScoreService.js";

/**
 * Updates rankScore for all students: blend of CGPA, skills count, resume score baseline.
 */
export async function refreshStudentRankings() {
  const students = await prisma.student.findMany();
  for (const student of students) {
    const resume = computeResumeScore(student, student.skills);
    const rankScore = Number(
      (student.cgpa * 10 + student.skills.length * 2 + resume * 0.1).toFixed(2)
    );
    await prisma.student.update({
      where: { id: student.id },
      data: { resumeScore: resume, rankScore },
    });
  }
}

export function studentRankCompare(a, b) {
  return (b.rankScore || 0) - (a.rankScore || 0);
}
