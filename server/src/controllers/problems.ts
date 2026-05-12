import { Router, Request, Response } from "express";
import { z } from "zod/v3";
import { requireAuth, requireCohort } from "../middleware/auth";
import { codeLimiter } from "../middleware/rateLimiter";
import { listProblems, getProblem, runCodingProblem, checkQuizAnswers } from "../services/problems";

const runCodeSchema = z.object({
  code: z.string().min(1, "Code is required").max(50000, "Code too long"),
});

const quizAnswersSchema = z.object({
  answers: z.record(z.string()),
});

export const problemsRouter = Router();

// All problem routes require auth + cohort
problemsRouter.use(requireAuth, requireCohort);

// List problems with optional filters
problemsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { type, difficulty, week } = req.query;
    const problems = await listProblems({
      type: type as string | undefined,
      difficulty: difficulty as string | undefined,
      weekNumber: week ? parseInt(week as string) : undefined,
    });
    return res.json({ problems });
  } catch (err) {
    console.error("List problems error:", err);
    return res.status(500).json({ error: "Failed to list problems" });
  }
});

// Get single problem
problemsRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const problem = await getProblem(req.params.id as string);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }
    return res.json({ problem });
  } catch (err) {
    console.error("Get problem error:", err);
    return res.status(500).json({ error: "Failed to get problem" });
  }
});

// Run coding problem
problemsRouter.post("/:id/run", codeLimiter, async (req: Request, res: Response) => {
  try {
    const parsed = runCodeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const result = await runCodingProblem(req.params.id as string, parsed.data.code);
    return res.json(result);
  } catch (err: any) {
    console.error("Run problem error:", err);
    return res.status(500).json({ error: err.message || "Execution failed" });
  }
});

// Submit quiz answers
problemsRouter.post("/:id/quiz", async (req: Request, res: Response) => {
  try {
    const parsed = quizAnswersSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Answers object required" });
    }
    const result = await checkQuizAnswers(req.params.id as string, parsed.data.answers);
    return res.json(result);
  } catch (err: any) {
    console.error("Quiz check error:", err);
    return res.status(500).json({ error: err.message || "Quiz check failed" });
  }
});
