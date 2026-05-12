import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../config/auth";

// Extend Express Request with user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        image?: string;
        cohortId?: string;
      };
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ error: "Authentication required" });
    }

    req.user = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image ?? undefined,
      cohortId: (session.user as any).cohortId ?? undefined,
    };

    next();
  } catch {
    return res.status(401).json({ error: "Invalid session" });
  }
}

export async function requireCohort(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.cohortId) {
    return res.status(403).json({
      error: "Cohort membership required",
      code: "COHORT_REQUIRED",
    });
  }
  next();
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (session) {
      req.user = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? undefined,
        cohortId: (session.user as any).cohortId ?? undefined,
      };
    }
  } catch {
    // silently continue without auth
  }
  next();
}
