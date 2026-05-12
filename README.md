# AI Engineering Platform

Practice platform for the 16-week AI Engineering cohort. LeetCode-style problem solving focused on ML/AI: coding challenges, concept quizzes, and system design problems with interactive visualizations.

## Architecture

```
web/          Next.js 16 (App Router) - frontend
server/       Express + Drizzle ORM - API backend
```

**Frontend** renders problems from static config files (fast, no network dependency for browsing). **Backend** handles auth, code execution (Daytona sandbox), submission recording, and progress tracking.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, React 19, TailwindCSS v4, TanStack Query v5, Zustand, CodeMirror 6 |
| Backend | Express, Drizzle ORM, PostgreSQL 16, Better-Auth (Google OAuth) |
| Execution | Daytona SDK (sandboxed Python) |
| Validation | Zod v4 |

## Features

- 172 problems across 16 weeks (125 coding, 25 quiz, 22 system design)
- Interactive visualizations for ML concepts (softmax, attention, transformers, etc.)
- Split-pane code editor with test case display and execution results
- Quiz view with keyboard shortcuts and instant grading
- System design with rubric and markdown editor
- Submission tracking with per-problem and per-week progress
- Activity heatmap (GitHub-style contribution graph)
- Streak tracking (daily practice motivation)
- Bookmarks (save problems for later)
- Cohort gating via access codes
- Responsive sidebar with collapse

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 16 (via brew or Docker)

### Database

```bash
# Option A: Homebrew (macOS)
brew install postgresql@16
brew services start postgresql@16
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
psql postgres -c "CREATE USER \"user\" WITH PASSWORD 'password' CREATEDB;"
psql postgres -c "CREATE DATABASE aiengg OWNER \"user\";"

# Option B: Docker
docker compose up -d
```

### Server

```bash
cd server
cp .env.example .env
# Fill in: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, DAYTONA_API_KEY
npm install
npm run db:push    # create tables
npm run db:seed    # seed 167 problems, 16 weeks, cohort + access code
npm run dev        # starts on :4000
```

### Frontend

```bash
cd web
npm install
npm run dev        # starts on :3000
```

### Access Code

After seeding, use `AIENGG-2026-DEV` to join the cohort on the /join page.

## Dev Mode

Frontend runs without backend in development (`NODE_ENV=development`):
- Auth checks bypassed
- Problems load from static config
- Run/Submit calls fail gracefully

## Environment Variables

### server/.env

```
DATABASE_URL=postgresql://user:password@localhost:5432/aiengg
BETTER_AUTH_SECRET=<random-32-chars>
BETTER_AUTH_URL=http://localhost:4000
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>
DAYTONA_API_KEY=<from-daytona>
FRONTEND_URL=http://localhost:3000
DEFAULT_COHORT_ID=aiengg-batch-1
PORT=4000
```

### web/.env.local

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/health | No | Health check |
| ALL | /api/auth/* | No | Better-Auth (Google OAuth) |
| POST | /api/cohort/join | Yes | Join cohort with access code |
| GET | /api/problems | Yes+Cohort | List problems (filterable) |
| GET | /api/problems/:id | Yes+Cohort | Get single problem |
| POST | /api/problems/:id/run | Yes+Cohort | Execute code in sandbox |
| POST | /api/problems/:id/quiz | Yes+Cohort | Grade quiz answers |
| GET | /api/submissions/progress | Yes+Cohort | User progress summary |
| POST | /api/submissions/:problemId | Yes+Cohort | Record a submission |
| GET | /api/submissions/:problemId/history | Yes+Cohort | Submission history |
| GET | /api/bookmarks | Yes+Cohort | List bookmarked problems |
| POST | /api/bookmarks/:problemId | Yes+Cohort | Toggle bookmark |
| GET | /api/streaks | Yes+Cohort | Current streak info |
| GET | /api/streaks/activity | Yes+Cohort | 365-day activity heatmap data |
| GET | /api/study-plan | Yes+Cohort | Weekly study plan |

## Project Structure

```
web/
  app/
    (platform)/      Authenticated pages (syllabus, problems, profile)
    (public)/        Login, join, landing
  components/
    problem/         CodingView, QuizView, SystemDesignView
    editor/          CodeMirror Python editor
    ui/              Shared UI components
    visualizations/  111 interactive ML concept visualizations
  config/            Static problem + syllabus data
  hooks/             React Query hooks (use-api.ts)
  stores/            Zustand stores

server/
  src/
    config/          Auth, database, app config
    controllers/     Route handlers (problems, submissions, cohort, bookmarks, streaks)
    middleware/      Auth guards, rate limiter, error handler
    models/          Drizzle schema (14 tables)
    services/        Business logic (code execution, quiz grading, progress)
```
