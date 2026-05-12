import { NextRequest, NextResponse } from "next/server";

const PISTON_URL = "https://emkc.org/api/v2/piston/execute";
const PISTON_TIMEOUT_MS = 15_000;

interface TestCaseInput {
  id: string;
  name: string;
  inputs: Record<string, unknown>;
}

interface ExecuteRequest {
  code: string;
  testCases: TestCaseInput[];
}

function buildPythonScript(userCode: string, testCases: TestCaseInput[]): string {
  const testCasesJson = JSON.stringify(
    testCases.map((tc) => ({ name: tc.name, inputs: tc.inputs }))
  );

  return `import json, sys, time, re

# --- User code ---
${userCode}
# --- End user code ---

# Find the first user-defined function via source inspection
_fn_match = re.search(r'^def\\s+(\\w+)\\s*\\(', ${JSON.stringify(userCode)}, re.MULTILINE)
_main_fn_name = _fn_match.group(1) if _fn_match else None

if _main_fn_name is None or _main_fn_name not in dir():
    print(json.dumps({"status": "error", "message": "No function definition found in your code.", "tests": [], "passed": 0, "total": 0, "durationMs": 0}))
    sys.exit(0)

_fn = eval(_main_fn_name)

_test_cases = json.loads(${JSON.stringify(testCasesJson)})

_start = time.time()
_results = []
_passed = 0

for _tc in _test_cases:
    try:
        _output = _fn(**_tc["inputs"])
        _results.append({"name": _tc["name"], "ok": True, "msg": "Returned: " + repr(_output)})
        _passed += 1
    except Exception as _e:
        _results.append({"name": _tc["name"], "ok": False, "msg": str(_e)})

_elapsed = int((time.time() - _start) * 1000)
_status = "passed" if _passed == len(_test_cases) else "failed"
print(json.dumps({"status": _status, "tests": _results, "passed": _passed, "total": len(_test_cases), "durationMs": _elapsed}))
`;
}

export async function POST(request: NextRequest) {
  let body: ExecuteRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: "error", message: "Invalid JSON body", tests: [], passed: 0, total: 0, durationMs: 0 },
      { status: 400 }
    );
  }

  const { code, testCases } = body;

  if (!code || typeof code !== "string") {
    return NextResponse.json(
      { status: "error", message: "Missing or invalid 'code' field", tests: [], passed: 0, total: 0, durationMs: 0 },
      { status: 400 }
    );
  }

  if (!Array.isArray(testCases) || testCases.length === 0) {
    return NextResponse.json(
      { status: "error", message: "Missing or empty 'testCases' array", tests: [], passed: 0, total: 0, durationMs: 0 },
      { status: 400 }
    );
  }

  const script = buildPythonScript(code, testCases);

  let pistonRes: Response;
  try {
    pistonRes = await fetch(PISTON_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "python",
        version: "3.10.0",
        files: [{ name: "solution.py", content: script }],
      }),
      signal: AbortSignal.timeout(PISTON_TIMEOUT_MS),
    });
  } catch (err) {
    const msg = err instanceof Error && err.name === "TimeoutError"
      ? "Code execution timed out"
      : "Failed to reach execution server";
    return NextResponse.json(
      { status: "error", message: msg, tests: [], passed: 0, total: 0, durationMs: 0 },
      { status: 502 }
    );
  }

  if (!pistonRes.ok) {
    return NextResponse.json(
      { status: "error", message: `Execution server returned ${pistonRes.status}`, tests: [], passed: 0, total: 0, durationMs: 0 },
      { status: 502 }
    );
  }

  let pistonData: { run?: { stdout?: string; stderr?: string; code?: number; signal?: string | null; output?: string } };
  try {
    pistonData = await pistonRes.json();
  } catch {
    return NextResponse.json(
      { status: "error", message: "Invalid response from execution server", tests: [], passed: 0, total: 0, durationMs: 0 },
      { status: 502 }
    );
  }

  const run = pistonData.run;
  if (!run) {
    return NextResponse.json(
      { status: "error", message: "No run data in execution response", tests: [], passed: 0, total: 0, durationMs: 0 },
      { status: 502 }
    );
  }

  // Non-zero exit or stderr indicates an error
  if (run.code !== 0 || (run.stderr && run.stderr.trim().length > 0)) {
    const errMsg = (run.stderr || run.output || "Execution failed").trim();
    return NextResponse.json({
      status: "error" as const,
      message: errMsg.slice(0, 2000),
      tests: [],
      passed: 0,
      total: testCases.length,
      durationMs: 0,
    });
  }

  // Parse the JSON test results from stdout
  const stdout = (run.stdout || "").trim();
  try {
    const result = JSON.parse(stdout);
    return NextResponse.json({
      status: result.status,
      message: result.message,
      tests: result.tests || [],
      passed: result.passed ?? 0,
      total: result.total ?? testCases.length,
      durationMs: result.durationMs ?? 0,
    });
  } catch {
    // stdout wasn't valid JSON - the user's code printed something unexpected
    return NextResponse.json({
      status: "error" as const,
      message: stdout ? `Unexpected output: ${stdout.slice(0, 500)}` : "No output from execution",
      tests: [],
      passed: 0,
      total: testCases.length,
      durationMs: 0,
    });
  }
}
