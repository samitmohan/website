import { Router, Request, Response } from "express";
import { requireAuth, requireCohort } from "../middleware/auth";
import { db } from "../config/database";
import { userStreak, submission } from "../models/db-schema";
import { eq, and, gte, desc } from "drizzle-orm";

export const streaksRouter = Router();

streaksRouter.use(requireAuth, requireCohort);

function toDateStr(date: Date): string {
  return date.toISOString().split("T")[0];
}

function daysBetween(a: string, b: string): number {
  const msDay = 86400000;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msDay);
}

// Get user's streak
streaksRouter.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const [streak] = await db
      .select()
      .from(userStreak)
      .where(eq(userStreak.userId, userId))
      .limit(1);

    if (!streak) {
      return res.json({ currentStreak: 0, longestStreak: 0, lastActiveDate: null });
    }

    // Check if streak is still active (last active was today or yesterday)
    const today = toDateStr(new Date());
    const gap = streak.lastActiveDate ? daysBetween(streak.lastActiveDate, today) : 999;

    if (gap > 1) {
      // Streak broken - reset
      await db
        .update(userStreak)
        .set({ currentStreak: 0 })
        .where(eq(userStreak.userId, userId));
      return res.json({ currentStreak: 0, longestStreak: streak.longestStreak, lastActiveDate: streak.lastActiveDate });
    }

    return res.json({
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActiveDate: streak.lastActiveDate,
    });
  } catch (err) {
    console.error("Get streak error:", err);
    return res.status(500).json({ error: "Failed to get streak" });
  }
});

// Get activity heatmap (last 365 days of submission dates + counts)
streaksRouter.get("/activity", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const submissions = await db
      .select({ createdAt: submission.createdAt })
      .from(submission)
      .where(
        and(eq(submission.userId, userId), gte(submission.createdAt, oneYearAgo))
      )
      .orderBy(desc(submission.createdAt));

    // Aggregate by date
    const activity: Record<string, number> = {};
    for (const s of submissions) {
      const dateStr = toDateStr(s.createdAt);
      activity[dateStr] = (activity[dateStr] || 0) + 1;
    }

    return res.json({ activity });
  } catch (err) {
    console.error("Get activity error:", err);
    return res.status(500).json({ error: "Failed to get activity" });
  }
});

// Update streak (called internally after a successful submission)
export async function updateStreak(userId: string): Promise<void> {
  const today = toDateStr(new Date());

  const [existing] = await db
    .select()
    .from(userStreak)
    .where(eq(userStreak.userId, userId))
    .limit(1);

  if (!existing) {
    await db.insert(userStreak).values({
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: today,
    });
    return;
  }

  // Already counted today
  if (existing.lastActiveDate === today) return;

  const gap = existing.lastActiveDate ? daysBetween(existing.lastActiveDate, today) : 999;

  let newStreak: number;
  if (gap === 1) {
    // Consecutive day
    newStreak = existing.currentStreak + 1;
  } else {
    // Gap > 1, restart
    newStreak = 1;
  }

  const newLongest = Math.max(existing.longestStreak, newStreak);

  await db
    .update(userStreak)
    .set({
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: today,
    })
    .where(eq(userStreak.userId, userId));
}
