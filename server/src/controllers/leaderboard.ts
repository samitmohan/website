import { Router, Request, Response } from "express";
import { requireAuth, requireCohort } from "../middleware/auth";
import { db } from "../config/database";
import { submission, user, userStreak } from "../models/db-schema";
import { eq, sql, desc } from "drizzle-orm";

export const leaderboardRouter = Router();

leaderboardRouter.use(requireAuth, requireCohort);

// GET / - returns top users ranked by problems solved (primary), streak (secondary)
leaderboardRouter.get("/", async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    const rankings = await db
      .select({
        userId: user.id,
        name: user.name,
        image: user.image,
        solved: sql<number>`count(distinct case when ${submission.status} = 'passed' then ${submission.problemId} end)`.as("solved"),
      })
      .from(user)
      .leftJoin(submission, eq(user.id, submission.userId))
      .groupBy(user.id, user.name, user.image)
      .orderBy(
        desc(sql`count(distinct case when ${submission.status} = 'passed' then ${submission.problemId} end)`),
      )
      .limit(limit);

    // Fetch streak data for these users
    const userIds = rankings.map((r) => r.userId);
    const streaks = userIds.length
      ? await db
          .select({
            userId: userStreak.userId,
            currentStreak: userStreak.currentStreak,
            lastActiveDate: userStreak.lastActiveDate,
          })
          .from(userStreak)
          .where(sql`${userStreak.userId} = any(${userIds})`)
      : [];

    const streakMap = new Map(streaks.map((s) => [s.userId, s]));

    // Merge and re-sort with streak as secondary
    const merged = rankings.map((r, i) => {
      const s = streakMap.get(r.userId);
      return {
        rank: i + 1,
        userId: r.userId,
        name: r.name,
        image: r.image,
        solved: Number(r.solved),
        streak: s?.currentStreak ?? 0,
        lastActive: s?.lastActiveDate ?? null,
      };
    });

    // Stable re-sort: solved desc, streak desc
    merged.sort((a, b) => {
      if (b.solved !== a.solved) return b.solved - a.solved;
      return b.streak - a.streak;
    });

    // Re-assign ranks after sort
    merged.forEach((entry, i) => {
      entry.rank = i + 1;
    });

    return res.json({ rankings: merged });
  } catch (err) {
    console.error("Leaderboard error:", err);
    return res.status(500).json({ error: "Failed to get leaderboard" });
  }
});
