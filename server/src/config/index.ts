import "dotenv/config";

export const config = {
  port: parseInt(process.env.PORT || "4000"),
  databaseUrl: process.env.DATABASE_URL!,
  betterAuthSecret: process.env.BETTER_AUTH_SECRET!,
  betterAuthUrl: process.env.BETTER_AUTH_URL || "http://localhost:4000",
  googleClientId: process.env.GOOGLE_CLIENT_ID!,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  daytonaApiKey: process.env.DAYTONA_API_KEY!,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  defaultCohortId: process.env.DEFAULT_COHORT_ID || "sm-batch-1",
};
