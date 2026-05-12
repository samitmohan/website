import { Router, Request, Response } from "express";
import { z } from "zod/v3";
import { requireAuth, requireCohort } from "../middleware/auth";
import { codeLimiter } from "../middleware/rateLimiter";
import { db } from "../config/database";
import { submission, userProgress, weekProgress, problem } from "../models/db-schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { updateWeekProgress } from "../services/study-plan";
import { updateStreak } from "./streaks";
import { randomUUID } from "crypto";

const submissionSchema = z.object({
  status: z.enum(["passed", "failed", "pending_review", "error"]),
  code: z.string().max(50000).optional(),
  testsPassed: z.number().int().min(0).optional(),
  totalTests: z.number().int().min(0).optional(),
  answers: z.record(z.string()).optional(),
  score: z.number().min(0).optional(),
  totalQuestions: z.number().int().min(0).optional(),
  designResponse: z.string().max(100000).optional(),
});

export const submissionsRouter = Router();

submissionsRouter.use(requireAuth, requireCohort);

// Get user's overall progress (must be before /:problemId routes)
submissionsRouter.get("/progress", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get all user progress records
    const progressRecords = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));

    // Get week progress
    const weekRecords = await db
      .select()
      .from(weekProgress)
      .where(eq(weekProgress.userId, userId));

    const totalSolved = progressRecords.filter((p) => p.solved).length;
    const totalAttempts = progressRecords.reduce((sum, p) => sum + p.attempts, 0);

    const problems: Record<string, { solved: boolean; bestScore: number | null; attempts: number }> = {};
    for (const p of progressRecords) {
      problems[p.problemId] = {
        solved: p.solved,
        bestScore: p.bestScore,
        attempts: p.attempts,
      };
    }

    const weeks: Record<string, { completed: number; total: number; percent: number }> = {};
    for (const w of weekRecords) {
      weeks[w.weekId] = {
        completed: w.completedProblems,
        total: w.totalProblems,
        percent: w.percentComplete,
      };
    }

    return res.json({ totalSolved, totalAttempts, problems, weeks });
  } catch (err) {
    console.error("Get progress error:", err);
    return res.status(500).json({ error: "Failed to get progress" });
  }
});

// Submit a solution (coding, quiz, or system design)
submissionsRouter.post("/:problemId", codeLimiter, async (req: Request, res: Response) => {
  try {
    const problemId = req.params.problemId as string;
    const userId = req.user!.id;

    // Get the problem to know its type and week
    const [prob] = await db
      .select({ type: problem.type, weekNumber: problem.weekNumber })
      .from(problem)
      .where(eq(problem.id, problemId))
      .limit(1);

    if (!prob) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const parsed = submissionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid submission data", details: parsed.error.flatten().fieldErrors });
    }
    const { status, code, testsPassed, totalTests, answers, score, totalQuestions, designResponse } = parsed.data;

    const submissionId = randomUUID();

    await db.insert(submission).values({
      id: submissionId,
      userId,
      problemId,
      problemType: prob.type,
      status,
      code,
      testsPassed,
      totalTests,
      answers,
      score,
      totalQuestions,
      designResponse,
    });

    // Update user progress
    const solved = status === "passed";
    const bestScore = testsPassed ?? score ?? 0;

    await db
      .insert(userProgress)
      .values({
        userId,
        problemId,
        solved,
        bestScore,
        attempts: 1,
        solvedAt: solved ? new Date() : undefined,
      })
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.problemId],
        set: {
          solved: solved ? true : undefined,
          bestScore,
          attempts: sql`${userProgress.attempts} + 1`,
          lastAttemptAt: new Date(),
          solvedAt: solved ? new Date() : undefined,
        },
      });

    // Update week progress
    const weekId = `week-${prob.weekNumber}`;
    await updateWeekProgress(userId, weekId);

    // Update streak
    await updateStreak(userId);

    return res.json({ submissionId, status });
  } catch (err) {
    console.error("Submission error:", err);
    return res.status(500).json({ error: "Failed to save submission" });
  }
});

// Get user's submissions for a problem
submissionsRouter.get("/:problemId/history", async (req: Request, res: Response) => {
  try {
    const problemId = req.params.problemId as string;
    const submissions = await db
      .select()
      .from(submission)
      .where(
        and(
          eq(submission.userId, req.user!.id),
          eq(submission.problemId, problemId)
        )
      )
      .orderBy(desc(submission.createdAt))
      .limit(20);

    return res.json({ submissions });
  } catch (err) {
    console.error("Get submissions error:", err);
    return res.status(500).json({ error: "Failed to get submissions" });
  }
});
