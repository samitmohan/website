import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { db } from "../config/database";
import { accessCode, user, emailWhitelist } from "../models/db-schema";
import { eq, and, sql } from "drizzle-orm";

export const cohortRouter = Router();

// Validate access code and assign user to cohort
cohortRouter.post("/join", requireAuth, async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const userId = req.user!.id;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Access code required" });
    }

    const trimmedCode = code.trim().toUpperCase();

    // Find access code
    const [found] = await db
      .select()
      .from(accessCode)
      .where(eq(accessCode.code, trimmedCode))
      .limit(1);

    if (!found) {
      return res.status(404).json({ error: "Invalid access code" });
    }

    // Check expiry
    if (found.expiresAt && found.expiresAt < new Date()) {
      return res.status(410).json({ error: "Access code has expired" });
    }

    // Check max uses
    if (found.maxUses !== null && found.currentUses >= found.maxUses) {
      return res.status(410).json({ error: "Access code has reached maximum uses" });
    }

    // Assign user to cohort
    await db.transaction(async (tx) => {
      await tx
        .update(user)
        .set({ cohortId: found.cohortId })
        .where(eq(user.id, userId));

      await tx
        .update(accessCode)
        .set({ currentUses: sql`${accessCode.currentUses} + 1` })
        .where(eq(accessCode.id, found.id));
    });

    return res.json({ status: "ok", cohortId: found.cohortId });
  } catch (err) {
    console.error("Cohort join error:", err);
    return res.status(500).json({ error: "Failed to join cohort" });
  }
});

// Check if user's email is whitelisted (called after auth)
cohortRouter.get("/check-email", requireAuth, async (req: Request, res: Response) => {
  try {
    const email = req.user!.email;

    const [found] = await db
      .select()
      .from(emailWhitelist)
      .where(eq(emailWhitelist.email, email))
      .limit(1);

    if (found && !req.user!.cohortId) {
      // Auto-assign to cohort
      await db
        .update(user)
        .set({ cohortId: found.cohortId })
        .where(eq(user.id, req.user!.id));

      return res.json({ whitelisted: true, cohortId: found.cohortId, autoJoined: true });
    }

    return res.json({
      whitelisted: !!found,
      cohortId: req.user!.cohortId || null,
      autoJoined: false,
    });
  } catch (err) {
    console.error("Email check error:", err);
    return res.status(500).json({ error: "Failed to check email" });
  }
});

// Get current user's cohort status
cohortRouter.get("/status", requireAuth, async (req: Request, res: Response) => {
  return res.json({
    userId: req.user!.id,
    cohortId: req.user!.cohortId || null,
    isMember: !!req.user!.cohortId,
  });
});
