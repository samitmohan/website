import { db } from "../config/database";
import { problem } from "../models/db-schema";
import { eq, and, sql, asc } from "drizzle-orm";
import { runInDaytona } from "./daytona";

interface ProblemFilters {
  type?: string;
  difficulty?: string;
  weekNumber?: number;
}

export async function listProblems(filters: ProblemFilters) {
  const conditions = [];

  if (filters.type) {
    conditions.push(eq(problem.type, filters.type));
  }
  if (filters.difficulty) {
    conditions.push(eq(problem.difficulty, filters.difficulty));
  }
  if (filters.weekNumber !== undefined) {
    conditions.push(eq(problem.weekNumber, filters.weekNumber));
  }

  const result = await db
    .select({
      id: problem.id,
      type: problem.type,
      title: problem.title,
      difficulty: problem.difficulty,
      weekNumber: problem.weekNumber,
      tags: problem.tags,
      visualizationComponent: problem.visualizationComponent,
      sortOrder: problem.sortOrder,
    })
    .from(problem)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(problem.weekNumber), asc(problem.sortOrder));

  return result;
}

export async function getProblem(id: string) {
  const [found] = await db
    .select()
    .from(problem)
    .where(eq(problem.id, id))
    .limit(1);

  if (!found) return null;

  // Hide solution and correct answers from response
  const { solution, ...rest } = found;

  // For quizzes, strip correctAnswer from questions
  if (rest.type === "quiz" && rest.questions) {
    const questions = rest.questions as any[];
    rest.questions = questions.map(({ correctAnswer, explanation, ...q }) => q);
  }

  // For system design, strip sampleAnswer
  if (rest.type === "system_design") {
    rest.sampleAnswer = null;
  }

  return rest;
}

export async function runCodingProblem(problemId: string, userCode: string) {
  const [prob] = await db
    .select({
      runnerTemplate: problem.runnerTemplate,
      testCases: problem.testCases,
    })
    .from(problem)
    .where(and(eq(problem.id, problemId), eq(problem.type, "coding")))
    .limit(1);

  if (!prob || !prob.runnerTemplate) {
    throw new Error("Problem not found or not a coding problem");
  }

  const fullCode = prob.runnerTemplate.replace("${userCode}", userCode);
  const result = await runInDaytona(fullCode);

  // Parse JSON output from test runner
  const stdout = result.stdout.trim();
  const lastLine = stdout.split("\n").pop() || "";

  try {
    const parsed = JSON.parse(lastLine);
    return {
      ...parsed,
      durationMs: result.durationMs,
    };
  } catch {
    return {
      status: "error",
      message: "Failed to parse test output",
      stdout: result.stdout,
      tests: [],
      passed: 0,
      total: 0,
      durationMs: result.durationMs,
    };
  }
}

export async function checkQuizAnswers(
  problemId: string,
  userAnswers: Record<string, string>
) {
  const [prob] = await db
    .select({ questions: problem.questions })
    .from(problem)
    .where(and(eq(problem.id, problemId), eq(problem.type, "quiz")))
    .limit(1);

  if (!prob || !prob.questions) {
    throw new Error("Quiz not found");
  }

  const questions = prob.questions as any[];
  let correct = 0;

  const results = questions.map((q) => {
    const userAnswer = userAnswers[q.id];
    const isCorrect = userAnswer === q.correctAnswer;
    if (isCorrect) correct++;

    return {
      questionId: q.id,
      userAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
    };
  });

  return {
    score: correct,
    total: questions.length,
    percentage: Math.round((correct / questions.length) * 100),
    results,
  };
}
