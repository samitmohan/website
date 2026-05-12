import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  serial,
  primaryKey,
  real,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ==================== AUTH (Better-Auth standard tables) ====================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  cohortId: text("cohort_id").references(() => cohort.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
});

// ==================== COHORT GATING ====================

export const cohort = pgTable("cohort", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accessCode = pgTable("access_code", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  cohortId: text("cohort_id")
    .notNull()
    .references(() => cohort.id),
  maxUses: integer("max_uses"),
  currentUses: integer("current_uses").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailWhitelist = pgTable("email_whitelist", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  cohortId: text("cohort_id")
    .notNull()
    .references(() => cohort.id),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

// ==================== UNIFIED PROBLEM TABLE ====================

export const problem = pgTable("problem", {
  id: text("id").primaryKey(), // slug
  type: text("type").notNull(), // "coding" | "quiz" | "system_design"
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  difficulty: text("difficulty").notNull().default("medium"),
  weekNumber: integer("week_number").notNull(),
  tags: text("tags").notNull().default("[]"), // JSON array
  theory: text("theory").notNull().default(""),
  hints: text("hints").notNull().default("[]"), // JSON array
  visualizationComponent: text("visualization_component"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),

  // -- Coding problem fields --
  starterCode: text("starter_code"),
  runnerTemplate: text("runner_template"),
  solution: text("solution"),
  testCases: jsonb("test_cases"), // TestCase[]
  functionMetadata: jsonb("function_metadata"), // FunctionMetadata

  // -- Quiz problem fields --
  questions: jsonb("questions"), // QuizQuestion[]

  // -- System design fields --
  designPrompt: text("design_prompt"),
  sampleAnswer: text("sample_answer"),
  rubric: jsonb("rubric"), // RubricItem[]
});

// ==================== STUDY PLAN (16 weeks) ====================

export const studyWeek = pgTable("study_week", {
  id: text("id").primaryKey(), // "week-0", "week-1", ...
  weekNumber: integer("week_number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  objectives: text("objectives").notNull().default("[]"), // JSON array
  project: text("project"),
  unlockThreshold: real("unlock_threshold").notNull().default(0.7),
  sortOrder: integer("sort_order").notNull(),
});

export const studySection = pgTable("study_section", {
  id: text("id").primaryKey(), // "week-2-tokenization"
  weekId: text("week_id")
    .notNull()
    .references(() => studyWeek.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const sectionProblem = pgTable(
  "section_problem",
  {
    sectionId: text("section_id")
      .notNull()
      .references(() => studySection.id, { onDelete: "cascade" }),
    problemId: text("problem_id")
      .notNull()
      .references(() => problem.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.sectionId, table.problemId] }),
  })
);

// ==================== SUBMISSIONS & PROGRESS ====================

export const submission = pgTable("submission", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  problemId: text("problem_id")
    .notNull()
    .references(() => problem.id),
  problemType: text("problem_type").notNull(),
  status: text("status").notNull(), // "passed" | "failed" | "partial" | "error" | "pending_review"

  // Coding submission fields
  code: text("code"),
  testsPassed: integer("tests_passed").default(0),
  totalTests: integer("total_tests").default(0),

  // Quiz submission fields
  answers: jsonb("answers"),
  score: integer("score"),
  totalQuestions: integer("total_questions"),

  // System design submission fields
  designResponse: text("design_response"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userProgress = pgTable(
  "user_progress",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    problemId: text("problem_id")
      .notNull()
      .references(() => problem.id),
    solved: boolean("solved").notNull().default(false),
    bestScore: integer("best_score"),
    attempts: integer("attempts").notNull().default(0),
    solvedAt: timestamp("solved_at"),
    lastAttemptAt: timestamp("last_attempt_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserProblem: uniqueIndex("unique_user_problem_progress").on(
      table.userId,
      table.problemId
    ),
  })
);

export const weekProgress = pgTable(
  "week_progress",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    weekId: text("week_id")
      .notNull()
      .references(() => studyWeek.id),
    completedProblems: integer("completed_problems").notNull().default(0),
    totalProblems: integer("total_problems").notNull().default(0),
    percentComplete: real("percent_complete").notNull().default(0),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    uniqueUserWeek: uniqueIndex("unique_user_week_progress").on(
      table.userId,
      table.weekId
    ),
  })
);

// ==================== BOOKMARKS ====================

export const bookmark = pgTable(
  "bookmark",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    problemId: text("problem_id")
      .notNull()
      .references(() => problem.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserBookmark: uniqueIndex("unique_user_bookmark").on(
      table.userId,
      table.problemId
    ),
  })
);

// ==================== STREAKS ====================

export const userStreak = pgTable("user_streak", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .unique(),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActiveDate: text("last_active_date"), // YYYY-MM-DD format for easy comparison
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ==================== TypeScript types for JSONB fields ====================

export interface TestCase {
  id: string;
  name: string;
  inputs: Record<string, unknown>;
  isPublic: boolean;
}

export interface FunctionMetadata {
  name: string;
  parameters: {
    name: string;
    type: string | string[];
    description?: string;
    example?: string;
  }[];
}

export interface QuizQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  options: { a: string; b: string; c: string; d: string };
  correctAnswer: "a" | "b" | "c" | "d";
  explanation: string;
}

export interface RubricItem {
  criterion: string;
  weight: number;
  description: string;
  keyPoints: string[];
}
