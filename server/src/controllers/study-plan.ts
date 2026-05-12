import { Router, Request, Response } from "express";
import { requireAuth, requireCohort } from "../middleware/auth";
import { getStudyPlan, getWeekDetail } from "../services/study-plan";

export const studyPlanRouter = Router();

studyPlanRouter.use(requireAuth, requireCohort);

// Get full study plan with progress
studyPlanRouter.get("/", async (req: Request, res: Response) => {
  try {
    const plan = await getStudyPlan(req.user!.id);
    return res.json({ weeks: plan });
  } catch (err) {
    console.error("Get study plan error:", err);
    return res.status(500).json({ error: "Failed to get study plan" });
  }
});

// Get week detail with sections and problems
studyPlanRouter.get("/:weekId", async (req: Request, res: Response) => {
  try {
    const detail = await getWeekDetail(req.params.weekId as string, req.user!.id);
    if (!detail) {
      return res.status(404).json({ error: "Week not found" });
    }
    return res.json({ week: detail });
  } catch (err) {
    console.error("Get week detail error:", err);
    return res.status(500).json({ error: "Failed to get week detail" });
  }
});
