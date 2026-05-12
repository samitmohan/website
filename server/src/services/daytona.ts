import { Daytona } from "@daytonaio/sdk";

let daytonaClient: Daytona | null = null;

function getDaytonaClient(): Daytona {
  if (!daytonaClient) {
    daytonaClient = new Daytona({ apiKey: process.env.DAYTONA_API_KEY! });
  }
  return daytonaClient;
}

export async function runInDaytona(code: string) {
  try {
    const daytona = getDaytonaClient();
    const sandbox = await daytona.create({
      language: "python",
      autoStopInterval: 1,
      autoDeleteInterval: 0,
    });
    const started = Date.now();

    try {
      const b64Code = Buffer.from(code).toString("base64");
      const wrappedCode = [
        "import sys, json, traceback, base64",
        "",
        '_code = base64.b64decode("' + b64Code + '").decode("utf-8")',
        "",
        "try:",
        '    exec(compile(_code, "<submission>", "exec"))',
        "except SyntaxError as e:",
        "    sys.stdout = sys.__stdout__",
        '    print(json.dumps({"status": "error", "message": type(e).__name__ + ": " + str(e.msg), "tests": [], "passed": 0, "total": 0}))',
        "except Exception as e:",
        "    sys.stdout = sys.__stdout__",
        '    print(json.dumps({"status": "error", "message": type(e).__name__ + ": " + str(e), "tests": [], "passed": 0, "total": 0}))',
      ].join("\n");

      const result = await sandbox.process.codeRun(wrappedCode, undefined, 30);
      const durationMs = Date.now() - started;

      return {
        stdout: result.result || "",
        stderr: "",
        durationMs,
        exitCode: result.exitCode,
      };
    } finally {
      sandbox.delete().catch((err: any) => {
        const isNotFound = err?.message?.toLowerCase().includes("not found");
        if (!isNotFound) {
          console.error("Sandbox cleanup error:", err.message);
        }
      });
    }
  } catch (err) {
    console.error("Daytona execution error:", err);
    throw err;
  }
}
