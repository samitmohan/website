import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./config/auth";
import { config } from "./config";
import { problemsRouter } from "./controllers/problems";
import { studyPlanRouter } from "./controllers/study-plan";
import { submissionsRouter } from "./controllers/submissions";
import { cohortRouter } from "./controllers/cohort";
import { bookmarksRouter } from "./controllers/bookmarks";
import { streaksRouter } from "./controllers/streaks";
import { leaderboardRouter } from "./controllers/leaderboard";
import { adminRouter } from "./controllers/admin";
import { globalLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// CORS
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

// Better-Auth handler - must be before express.json()
app.all("/api/auth/*", toNodeHandler(auth));

// Global rate limiting
app.use(globalLimiter);

// Body parsing
app.use(express.json({ limit: "1mb" }));

// API routes
app.use("/api/problems", problemsRouter);
app.use("/api/study-plan", studyPlanRouter);
app.use("/api/submissions", submissionsRouter);
app.use("/api/cohort", cohortRouter);
app.use("/api/bookmarks", bookmarksRouter);
app.use("/api/streaks", streaksRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/admin", adminRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
