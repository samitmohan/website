import "dotenv/config";
import { db } from "./config/database";
import {
  cohort,
  accessCode,
  studyWeek,
  studySection,
  sectionProblem,
  problem,
} from "./models/db-schema";
import { sql } from "drizzle-orm";
import { PROBLEMS } from "../../web/config/problems";
import { SYLLABUS } from "../../web/config/syllabus";

// ===== Runner Template Generation =====

function extractFunctionName(starterCode: string): string | null {
  const match = starterCode.match(/def\s+(\w+)\s*\(/);
  return match ? match[1] : null;
}

function extractSolutionCode(solutionMarkdown: string): string | null {
  // Solution is wrapped in ```python ... ```
  const match = solutionMarkdown.match(/```python\n([\s\S]*?)```/);
  if (!match) return null;
  return match[1].trim();
}

function generateRunnerTemplate(
  functionName: string,
  solutionCode: string,
  testCases: { id: string; name: string; inputs: Record<string, unknown> }[]
): string {
  // Rename the solution function to _reference_<name>
  const refCode = solutionCode.replace(
    new RegExp(`def\\s+${functionName}\\s*\\(`),
    `def _reference_${functionName}(`
  );

  const testCasesJson = JSON.stringify(testCases);

  return `\${userCode}

# Reference implementation
${refCode}

# Test harness
import json, sys, traceback
import numpy as np

def _compare(user_out, ref_out):
    """Compare outputs with tolerance for floats/arrays."""
    try:
        if user_out is None and ref_out is None:
            return True
        if user_out is None or ref_out is None:
            return False
        # Convert to numpy arrays for comparison
        u = np.array(user_out, dtype=np.float64)
        r = np.array(ref_out, dtype=np.float64)
        if u.shape != r.shape:
            return False
        return bool(np.allclose(u, r, atol=1e-4, rtol=1e-4))
    except (TypeError, ValueError):
        # Fallback to equality for non-numeric types
        return user_out == ref_out

_test_cases = json.loads('${testCasesJson.replace(/'/g, "\\'")}')
_results = []
_passed = 0

for _tc in _test_cases:
    _tc_result = {"id": _tc["id"], "name": _tc["name"], "passed": False}
    try:
        _user_out = ${functionName}(**_tc["inputs"])
        _ref_out = _reference_${functionName}(**_tc["inputs"])
        _is_correct = _compare(_user_out, _ref_out)
        _tc_result["passed"] = _is_correct
        if _is_correct:
            _passed += 1
        else:
            _tc_result["expected"] = repr(_ref_out)
            _tc_result["actual"] = repr(_user_out)
    except Exception as _e:
        _tc_result["error"] = type(_e).__name__ + ": " + str(_e)
    _results.append(_tc_result)

_status = "passed" if _passed == len(_test_cases) else "failed"
print(json.dumps({"status": _status, "tests": _results, "passed": _passed, "total": len(_test_cases)}))
`;
}

// ===== Seed Logic =====

async function seed() {
  console.log("Seeding database...");

  // Clear existing data in reverse FK order
  await db.execute(sql`TRUNCATE section_problem, study_section, study_week, problem, access_code, cohort CASCADE`);
  console.log("Cleared existing data");

  // 1. Seed cohort
  await db.insert(cohort).values({
    id: "sm-batch-1",
    name: "AI Engineering Batch 1",
    startDate: new Date("2025-01-01"),
    endDate: new Date("2026-12-31"),
    isActive: true,
  });
  console.log("Created cohort: aiengg-batch-1");

  // 2. Seed access code
  await db.insert(accessCode).values({
    code: "AIENGG-2026-DEV",
    cohortId: "sm-batch-1",
    maxUses: null,
    currentUses: 0,
    expiresAt: null,
  });
  console.log("Created access code: AIENGG-2026-DEV");

  // 3. Seed study weeks
  const weekValues = SYLLABUS.map((week, index) => ({
    id: `week-${week.weekNumber}`,
    weekNumber: week.weekNumber,
    title: week.title,
    description: week.description,
    objectives: JSON.stringify(week.topics),
    project: week.project || null,
    unlockThreshold: 0.7,
    sortOrder: index,
  }));

  await db.insert(studyWeek).values(weekValues);
  console.log(`Seeded ${weekValues.length} study weeks`);

  // 4. Seed problems
  let codingCount = 0;
  let quizCount = 0;
  let designCount = 0;
  let runnerSkipped = 0;

  const problemValues = PROBLEMS.map((p) => {
    let runnerTemplate: string | null = null;

    if (p.type === "coding" && p.starterCode && p.solution && p.testCases) {
      const funcName = extractFunctionName(p.starterCode);
      const solCode = extractSolutionCode(p.solution);

      if (funcName && solCode) {
        runnerTemplate = generateRunnerTemplate(funcName, solCode, p.testCases);
        codingCount++;
      } else {
        runnerSkipped++;
        console.warn(`  WARN: Could not generate runner for "${p.id}" (funcName=${!!funcName}, solCode=${!!solCode})`);
      }
    }

    if (p.type === "quiz") quizCount++;
    if (p.type === "system_design") designCount++;

    return {
      id: p.id,
      type: p.type,
      title: p.title,
      description: p.description,
      difficulty: p.difficulty,
      weekNumber: p.weekNumber,
      tags: p.tags || "[]",
      theory: p.theory || "",
      hints: p.hints || "[]",
      visualizationComponent: p.visualizationComponent || null,
      sortOrder: p.sortOrder ?? 0,
      starterCode: p.starterCode || null,
      runnerTemplate,
      solution: p.solution || null,
      testCases: p.testCases || null,
      functionMetadata: null,
      questions: p.questions || null,
      designPrompt: p.designPrompt || null,
      sampleAnswer: p.sampleAnswer || null,
      rubric: p.rubric || null,
    };
  });

  // Insert in batches of 50 (Postgres parameter limit)
  for (let i = 0; i < problemValues.length; i += 50) {
    const batch = problemValues.slice(i, i + 50);
    await db.insert(problem).values(batch);
  }
  console.log(`Seeded ${problemValues.length} problems (${codingCount} coding with runners, ${quizCount} quiz, ${designCount} system_design, ${runnerSkipped} runners skipped)`);

  // 5. Seed study sections (one per week)
  const sectionValues = SYLLABUS.map((week) => ({
    id: `week-${week.weekNumber}-problems`,
    weekId: `week-${week.weekNumber}`,
    title: "Problems",
    sortOrder: 0,
  }));

  await db.insert(studySection).values(sectionValues);
  console.log(`Seeded ${sectionValues.length} study sections`);

  // 6. Map problems to sections
  const sectionProblemValues: { sectionId: string; problemId: string; sortOrder: number }[] = [];

  for (const p of PROBLEMS) {
    sectionProblemValues.push({
      sectionId: `week-${p.weekNumber}-problems`,
      problemId: p.id,
      sortOrder: p.sortOrder ?? 0,
    });
  }

  // Insert in batches
  for (let i = 0; i < sectionProblemValues.length; i += 50) {
    const batch = sectionProblemValues.slice(i, i + 50);
    await db.insert(sectionProblem).values(batch);
  }
  console.log(`Mapped ${sectionProblemValues.length} problems to sections`);

  console.log("\nSeed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
