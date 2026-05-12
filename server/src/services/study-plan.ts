import { db } from "../config/database";
import {
  studyWeek,
  studySection,
  sectionProblem,
  problem,
  weekProgress,
  userProgress,
} from "../models/db-schema";
import { eq, and, asc, sql } from "drizzle-orm";

export async function getStudyPlan(userId: string) {
  // Get all weeks
  const weeks = await db
    .select()
    .from(studyWeek)
    .orderBy(asc(studyWeek.sortOrder));

  // Get user's progress for each week
  const progress = await db
    .select()
    .from(weekProgress)
    .where(eq(weekProgress.userId, userId));

  const progressMap = new Map(progress.map((p) => [p.weekId, p]));

  // Determine which weeks are unlocked
  return weeks.map((week, index) => {
    const wp = progressMap.get(week.id);
    const percentComplete = wp?.percentComplete ?? 0;

    // Week 0 is always unlocked
    // Other weeks unlock when previous week meets threshold
    let isLocked = false;
    if (index > 0) {
      const prevWeek = weeks[index - 1];
      const prevProgress = progressMap.get(prevWeek.id);
      const prevPercent = prevProgress?.percentComplete ?? 0;
      isLocked = prevPercent < prevWeek.unlockThreshold;
    }

    return {
      ...week,
      objectives: JSON.parse(week.objectives),
      isLocked,
      progress: {
        completedProblems: wp?.completedProblems ?? 0,
        totalProblems: wp?.totalProblems ?? 0,
        percentComplete,
      },
    };
  });
}

export async function getWeekDetail(weekId: string, userId: string) {
  // Get the week
  const [week] = await db
    .select()
    .from(studyWeek)
    .where(eq(studyWeek.id, weekId))
    .limit(1);

  if (!week) return null;

  // Get sections with problems
  const sections = await db
    .select()
    .from(studySection)
    .where(eq(studySection.weekId, weekId))
    .orderBy(asc(studySection.sortOrder));

  const sectionsWithProblems = await Promise.all(
    sections.map(async (section) => {
      const problems = await db
        .select({
          id: problem.id,
          type: problem.type,
          title: problem.title,
          difficulty: problem.difficulty,
          sortOrder: sectionProblem.sortOrder,
        })
        .from(sectionProblem)
        .innerJoin(problem, eq(sectionProblem.problemId, problem.id))
        .where(eq(sectionProblem.sectionId, section.id))
        .orderBy(asc(sectionProblem.sortOrder));

      // Get user's solve status for each problem
      const solveStatuses = await db
        .select({
          problemId: userProgress.problemId,
          solved: userProgress.solved,
        })
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, userId),
            sql`${userProgress.problemId} = ANY(${problems.map((p) => p.id)})`
          )
        );

      const solvedSet = new Set(
        solveStatuses.filter((s) => s.solved).map((s) => s.problemId)
      );

      return {
        ...section,
        problems: problems.map((p) => ({
          ...p,
          solved: solvedSet.has(p.id),
        })),
      };
    })
  );

  return {
    ...week,
    objectives: JSON.parse(week.objectives),
    sections: sectionsWithProblems,
  };
}

export async function updateWeekProgress(userId: string, weekId: string) {
  // Count total and solved problems for this week
  const sections = await db
    .select({ id: studySection.id })
    .from(studySection)
    .where(eq(studySection.weekId, weekId));

  if (sections.length === 0) return;

  const sectionIds = sections.map((s) => s.id);

  // Get all problem IDs in this week
  const weekProblems = await db
    .select({ problemId: sectionProblem.problemId })
    .from(sectionProblem)
    .where(sql`${sectionProblem.sectionId} = ANY(${sectionIds})`);

  const totalProblems = weekProblems.length;
  if (totalProblems === 0) return;

  const problemIds = weekProblems.map((p) => p.problemId);

  // Count solved
  const solved = await db
    .select({ count: sql<number>`count(*)` })
    .from(userProgress)
    .where(
      and(
        eq(userProgress.userId, userId),
        eq(userProgress.solved, true),
        sql`${userProgress.problemId} = ANY(${problemIds})`
      )
    );

  const completedProblems = Number(solved[0]?.count ?? 0);
  const percentComplete = completedProblems / totalProblems;

  // Upsert week progress
  await db
    .insert(weekProgress)
    .values({
      userId,
      weekId,
      completedProblems,
      totalProblems,
      percentComplete,
    })
    .onConflictDoUpdate({
      target: [weekProgress.userId, weekProgress.weekId],
      set: { completedProblems, totalProblems, percentComplete },
    });
}
