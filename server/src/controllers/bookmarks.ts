import { Router, Request, Response } from "express";
import { requireAuth, requireCohort } from "../middleware/auth";
import { db } from "../config/database";
import { bookmark } from "../models/db-schema";
import { eq, and } from "drizzle-orm";

export const bookmarksRouter = Router();

bookmarksRouter.use(requireAuth, requireCohort);

// Get all bookmarks for user
bookmarksRouter.get("/", async (req: Request, res: Response) => {
  try {
    const bookmarks = await db
      .select({ problemId: bookmark.problemId, createdAt: bookmark.createdAt })
      .from(bookmark)
      .where(eq(bookmark.userId, req.user!.id));

    return res.json({ bookmarks });
  } catch (err) {
    console.error("Get bookmarks error:", err);
    return res.status(500).json({ error: "Failed to get bookmarks" });
  }
});

// Toggle bookmark
bookmarksRouter.post("/:problemId", async (req: Request, res: Response) => {
  try {
    const problemId = req.params.problemId as string;
    const userId = req.user!.id;

    const [existing] = await db
      .select()
      .from(bookmark)
      .where(and(eq(bookmark.userId, userId), eq(bookmark.problemId, problemId)))
      .limit(1);

    if (existing) {
      await db
        .delete(bookmark)
        .where(and(eq(bookmark.userId, userId), eq(bookmark.problemId, problemId)));
      return res.json({ bookmarked: false });
    } else {
      await db.insert(bookmark).values({ userId, problemId });
      return res.json({ bookmarked: true });
    }
  } catch (err) {
    console.error("Toggle bookmark error:", err);
    return res.status(500).json({ error: "Failed to toggle bookmark" });
  }
});
