import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { db } from "../config/database";
import { user, submission, accessCode, cohort } from "../models/db-schema";
import { sql, eq, desc } from "drizzle-orm";

export const adminRouter = Router();

const ADMIN_EMAILS = ["samitmohan@gmail.com"];

function requireAdmin(req: Request, res: Response, next: () => void) {
  if (!req.user || !ADMIN_EMAILS.includes(req.user.email)) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

adminRouter.use(requireAuth, requireAdmin);

// GET /stats - dashboard overview
adminRouter.get("/stats", async (_req: Request, res: Response) => {
  try {
    const [users] = await db.select({ count: sql<number>`count(*)` }).from(user);
    const [submissions] = await db.select({ count: sql<number>`count(*)` }).from(submission);
    const [activeUsers] = await db
      .select({ count: sql<number>`count(distinct ${submission.userId})` })
      .from(submission)
      .where(sql`${submission.createdAt} > now() - interval '7 days'`);
    const [passedSubmissions] = await db
      .select({ count: sql<number>`count(distinct ${submission.problemId} || '-' || ${submission.userId})` })
      .from(submission)
      .where(eq(submission.status, "passed"));

    return res.json({
      totalUsers: Number(users.count),
      totalSubmissions: Number(submissions.count),
      activeUsersLast7d: Number(activeUsers.count),
      totalSolved: Number(passedSubmissions.count),
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return res.status(500).json({ error: "Failed to get stats" });
  }
});

// GET /access-codes - list all access codes
adminRouter.get("/access-codes", async (_req: Request, res: Response) => {
  try {
    const codes = await db
      .select({
        id: accessCode.id,
        code: accessCode.code,
        cohortId: accessCode.cohortId,
        maxUses: accessCode.maxUses,
        currentUses: accessCode.currentUses,
        expiresAt: accessCode.expiresAt,
        createdAt: accessCode.createdAt,
      })
      .from(accessCode)
      .orderBy(desc(accessCode.createdAt));

    return res.json({ codes });
  } catch (err) {
    console.error("Admin access codes error:", err);
    return res.status(500).json({ error: "Failed to get access codes" });
  }
});

// POST /access-codes - create new access code
adminRouter.post("/access-codes", async (req: Request, res: Response) => {
  try {
    const { code, maxUses, expiresAt } = req.body;
    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Code is required" });
    }

    // Get default cohort
    const [defaultCohort] = await db.select().from(cohort).limit(1);
    if (!defaultCohort) {
      return res.status(500).json({ error: "No cohort found" });
    }

    const [created] = await db
      .insert(accessCode)
      .values({
        code: code.trim().toUpperCase(),
        cohortId: defaultCohort.id,
        maxUses: maxUses || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      })
      .returning();

    return res.json({ code: created });
  } catch (err: any) {
    if (err?.code === "23505") {
      return res.status(409).json({ error: "Code already exists" });
    }
    console.error("Admin create code error:", err);
    return res.status(500).json({ error: "Failed to create access code" });
  }
});

// DELETE /access-codes/:id - delete access code
adminRouter.delete("/access-codes/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    await db.delete(accessCode).where(eq(accessCode.id, id));
    return res.json({ ok: true });
  } catch (err) {
    console.error("Admin delete code error:", err);
    return res.status(500).json({ error: "Failed to delete access code" });
  }
});

// GET /users - list all users with progress
adminRouter.get("/users", async (_req: Request, res: Response) => {
  try {
    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        cohortId: user.cohortId,
        createdAt: user.createdAt,
        solved: sql<number>`count(distinct case when ${submission.status} = 'passed' then ${submission.problemId} end)`,
        lastSubmission: sql<string>`max(${submission.createdAt})`,
      })
      .from(user)
      .leftJoin(submission, eq(user.id, submission.userId))
      .groupBy(user.id, user.name, user.email, user.image, user.cohortId, user.createdAt)
      .orderBy(desc(sql`max(${submission.createdAt})`));

    return res.json({
      users: users.map((u) => ({
        ...u,
        solved: Number(u.solved),
      })),
    });
  } catch (err) {
    console.error("Admin users error:", err);
    return res.status(500).json({ error: "Failed to get users" });
  }
});
