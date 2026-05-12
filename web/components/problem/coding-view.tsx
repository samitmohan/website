"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { PythonEditor } from "@/components/editor/python-editor";
import { Button } from "@/components/ui/button";
import ProblemVisualization from "@/components/problem/ProblemVisualization";
import ProblemPreview from "@/components/problem/ProblemPreview";
import { useSubmission, useSubmissionHistory } from "@/hooks/use-api";
import { useProgressStore } from "@/stores/progressStore";
import type { Problem, CodeRunResult } from "@/types/problem";

type TabKey = "description" | "theory" | "solution";

interface CodingViewProps {
  problem: Problem;
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return "None";
  if (typeof val === "string") return `"${val}"`;
  if (typeof val === "boolean") return val ? "True" : "False";
  if (typeof val === "number") return String(val);
  if (Array.isArray(val)) {
    if (val.length === 0) return "[]";
    if (Array.isArray(val[0])) {
      // 2D array
      const inner = val.map((row) => `[${(row as unknown[]).map(formatValue).join(", ")}]`);
      return `[${inner.join(", ")}]`;
    }
    return `[${val.map(formatValue).join(", ")}]`;
  }
  if (typeof val === "object") {
    const entries = Object.entries(val as Record<string, unknown>);
    const inner = entries.map(([k, v]) => `"${k}": ${formatValue(v)}`);
    return `{${inner.join(", ")}}`;
  }
  return String(val);
}

export function CodingView({ problem }: CodingViewProps) {
  const storageKey = `autosave-${problem.id}-code`;
  const [code, setCode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(storageKey) || problem.starterCode || "";
    }
    return problem.starterCode || "";
  });
  const [result, setResult] = useState<CodeRunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("description");
  const [testTab, setTestTab] = useState<"testcase" | "result" | "history">("testcase");
  const { data: historyData } = useSubmissionHistory(problem.id);
  const [selectedTestIdx, setSelectedTestIdx] = useState(0);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [codeSaved, setCodeSaved] = useState(false);
  const codeSaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Autosave code to localStorage
  useEffect(() => {
    clearTimeout(codeSaveTimer.current);
    codeSaveTimer.current = setTimeout(() => {
      localStorage.setItem(storageKey, code);
      setCodeSaved(true);
      setTimeout(() => setCodeSaved(false), 1500);
    }, 1000);
    return () => clearTimeout(codeSaveTimer.current);
  }, [code, storageKey]);

  const hints: string[] = (() => {
    try { return JSON.parse(problem.hints || "[]"); } catch { return []; }
  })();

  const tags: string[] = (() => {
    try { return JSON.parse(problem.tags || "[]"); } catch { return []; }
  })();

  const publicTests = (problem.testCases || []).filter((t) => t.isPublic);

  const handleRun = async () => {
    setRunning(true);
    setResult(null);
    setTestTab("result");
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, testCases: problem.testCases || [] }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({
        status: "error",
        message: "Failed to connect to execution server.",
        tests: [],
        passed: 0,
        total: 0,
        durationMs: 0,
      });
    } finally {
      setRunning(false);
    }
  };

  const submitMutation = useSubmission(problem.id);
  const recordAttempt = useProgressStore((s) => s.recordAttempt);

  const handleSubmit = async () => {
    setRunning(true);
    setResult(null);
    setTestTab("result");
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, testCases: problem.testCases || [] }),
      });
      const data: CodeRunResult = await res.json();
      setResult(data);

      // Record to local progress store
      recordAttempt(problem.id, data.status === "passed");

      // Record the submission (fire-and-forget for when backend exists)
      submitMutation.mutate({
        status: data.status === "passed" ? "passed" : "failed",
        code,
        testsPassed: data.passed,
        totalTests: data.total,
      });
    } catch {
      setResult({
        status: "error",
        message: "Failed to connect to execution server.",
        tests: [],
        passed: 0,
        total: 0,
        durationMs: 0,
      });
    } finally {
      setRunning(false);
    }
  };

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
  }, [code]);

  // Ctrl+Enter = Run, Ctrl+Shift+Enter = Submit
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) {
          handleSubmit();
        } else {
          handleRun();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [code]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReset = useCallback(() => {
    setCode(problem.starterCode || "");
  }, [problem.starterCode]);

  return (
    <div className="dark h-[calc(100vh-33px)] overflow-hidden bg-background text-foreground">
      <PanelGroup direction="horizontal" className="h-full bg-card border-t border-border">
        {/* Left panel - Description */}
        <Panel defaultSize={50} minSize={25} maxSize={75}>
          <div className="h-full flex flex-col">
            <nav role="tablist" aria-label="Problem details" className="flex gap-4 px-4 h-12 items-end border-b border-border text-sm">
              {(["description", "theory", "solution"] as TabKey[]).map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 capitalize ${
                    activeTab === tab
                      ? "border-b-2 border-foreground text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>

            <section role="tabpanel" className="px-5 py-4 overflow-auto text-base leading-7 text-foreground flex-1">
              {activeTab === "description" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-semibold">{problem.title}</h1>
                      {tags.length > 0 && (
                        <div className="flex gap-1.5 mt-1">
                          {tags.map((tag: string) => (
                            <span key={tag} className="px-2 py-0.5 bg-accent text-foreground text-xs rounded border border-border">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${
                      problem.difficulty === "Easy"
                        ? "text-green-400 border-green-900 bg-green-900/20"
                        : problem.difficulty === "Medium"
                          ? "text-yellow-400 border-yellow-900 bg-yellow-900/20"
                          : "text-red-400 border-red-900 bg-red-900/20"
                    }`}>
                      {problem.difficulty}
                    </span>
                  </div>
                  <div className="border-b border-border" />

                  <ProblemVisualization componentName={problem.visualizationComponent} />
                  <ProblemPreview content={problem.description} />

                  {hints.length > 0 && (
                    <div className="border-t border-border pt-4">
                      {hints.map((hint, i) => (
                        <details key={i} className="mb-2">
                          <summary className="text-sm text-primary cursor-pointer hover:underline">
                            Hint {i + 1}
                          </summary>
                          <div className="mt-2 p-3 bg-muted/50 border border-border rounded">
                            <ProblemPreview content={hint} />
                          </div>
                        </details>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "theory" && (
                <div>
                  {problem.theory ? (
                    <ProblemPreview content={problem.theory} />
                  ) : (
                    <em className="text-muted-foreground">No theory notes yet.</em>
                  )}
                </div>
              )}

              {activeTab === "solution" && (
                <div>
                  {problem.solution ? (
                    solutionRevealed ? (
                      <ProblemPreview content={problem.solution} />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-sm text-muted-foreground mb-4">
                          Try solving the problem first. Reveal the solution when you need it.
                        </p>
                        <button
                          onClick={() => setSolutionRevealed(true)}
                          className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent transition-colors"
                        >
                          Reveal Solution
                        </button>
                      </div>
                    )
                  ) : (
                    <p className="text-sm text-muted-foreground">Solution coming soon.</p>
                  )}
                </div>
              )}
            </section>
          </div>
        </Panel>

        <PanelResizeHandle className="w-1.5 bg-border hover:bg-[#7F56D9]/50 transition-colors cursor-col-resize" />

        {/* Right panel - Editor + Tests */}
        <Panel defaultSize={50} minSize={25}>
          <PanelGroup direction="vertical" className="h-full">
            {/* Editor */}
            <Panel defaultSize={65} minSize={30}>
              <div className="h-full flex flex-col">
                {/* Toolbar */}
                <div className="border-b border-border px-3 py-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-muted-foreground mr-2">Python</span>
                    <button
                      onClick={handleReset}
                      className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      title="Reset code"
                      aria-label="Reset code to starter template"
                    >
                      <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 3v5h-5" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-5h5" />
                      </svg>
                    </button>
                    <button
                      onClick={handleCopy}
                      className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      title="Copy code"
                      aria-label="Copy code to clipboard"
                    >
                      <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {codeSaved && (
                      <span className="text-[10px] text-emerald-400/70">Saved</span>
                    )}
                    <span className="text-[10px] text-muted-foreground hidden lg:block">
                      {typeof navigator !== "undefined" && /Mac|iPhone/.test(navigator.platform) ? "Cmd" : "Ctrl"}+Enter: Run
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRun}
                      disabled={running}
                      className="h-7 text-xs gap-1.5"
                    >
                      <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none" />
                      </svg>
                      {running ? "Running..." : "Run"}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmit}
                      disabled={running}
                      className="h-7 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                    >
                      <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      Submit
                    </Button>
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                  <PythonEditor value={code} onChange={setCode} />
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="h-1.5 bg-border hover:bg-[#7F56D9]/50 transition-colors cursor-row-resize" />

            {/* Test Cases */}
            <Panel defaultSize={35} minSize={10}>
              <div className="h-full flex flex-col">
                {/* Tab bar */}
                <div className="flex items-center border-b border-border px-4">
                  <div role="tablist" aria-label="Test output" className="flex gap-4 h-10 items-end text-xs">
                    <button
                      role="tab"
                      aria-selected={testTab === "testcase"}
                      onClick={() => setTestTab("testcase")}
                      className={`pb-2 ${testTab === "testcase" ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Testcase
                    </button>
                    <button
                      role="tab"
                      aria-selected={testTab === "result"}
                      onClick={() => setTestTab("result")}
                      className={`pb-2 ${testTab === "result" ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Test Result
                      {result && (
                        <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                          result.status === "passed" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                        }`}>
                          {result.passed ?? 0}/{result.total ?? 0}
                        </span>
                      )}
                    </button>
                    <button
                      role="tab"
                      aria-selected={testTab === "history"}
                      onClick={() => setTestTab("history")}
                      className={`pb-2 ${testTab === "history" ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      History
                      {historyData?.submissions && historyData.submissions.length > 0 && (
                        <span className="ml-1.5 text-xs text-gray-500">
                          ({historyData.submissions.length})
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-3">
                  {testTab === "history" && (
                    <div>
                      {historyData?.submissions && historyData.submissions.length > 0 ? (
                        <div className="space-y-2">
                          {historyData.submissions.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between text-xs px-3 py-2.5 rounded-md border border-white/5 bg-white/[0.02]"
                            >
                              <div className="flex items-center gap-2">
                                <span className={`font-mono font-semibold ${sub.status === "passed" ? "text-emerald-400" : "text-red-400"}`}>
                                  {sub.status === "passed" ? "PASS" : "FAIL"}
                                </span>
                                {sub.testsPassed != null && sub.totalTests != null && (
                                  <span className="text-gray-500">
                                    {sub.testsPassed}/{sub.totalTests} tests
                                  </span>
                                )}
                              </div>
                              <span className="text-gray-600">
                                {new Date(sub.createdAt).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground text-center py-6">
                          No submissions yet
                        </div>
                      )}
                    </div>
                  )}

                  {testTab === "testcase" && (
                    <div>
                      {publicTests.length > 0 ? (
                        <>
                          {/* Case tabs */}
                          <div className="flex gap-1 mb-3">
                            {publicTests.map((tc, i) => (
                              <button
                                key={tc.id}
                                onClick={() => setSelectedTestIdx(i)}
                                className={`text-xs px-3 py-1 rounded-md transition-colors ${
                                  selectedTestIdx === i
                                    ? "bg-white/10 text-white font-medium"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                }`}
                              >
                                Case {i + 1}
                              </button>
                            ))}
                          </div>

                          {/* Selected case fields */}
                          {publicTests[selectedTestIdx] && (
                            <div className="space-y-2.5">
                              {Object.entries(publicTests[selectedTestIdx].inputs).map(([key, val]) => (
                                <div key={key}>
                                  <div className="text-xs text-muted-foreground mb-1">{key} =</div>
                                  <div className="bg-[#1a1f2e] rounded-md px-3 py-2 font-mono text-sm text-foreground">
                                    {formatValue(val)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-xs text-muted-foreground">No public test cases</div>
                      )}
                    </div>
                  )}

                  {testTab === "result" && (
                    <div>
                      {running ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-8">
                          <div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin mb-3" />
                          <div className="text-sm text-muted-foreground animate-pulse">Running...</div>
                        </div>
                      ) : result ? (
                        <div>
                          {/* Status header */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                              result.status === "passed"
                                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                                : result.status === "error"
                                  ? "text-red-400 bg-red-500/10 border-red-500/20"
                                  : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                            }`}>
                              {result.status === "passed" ? "Accepted" : result.status === "error" ? "Error" : "Wrong Answer"}
                            </span>
                            {result.durationMs > 0 && (
                              <span className="text-xs text-muted-foreground">{result.durationMs}ms</span>
                            )}
                          </div>

                          {/* Error message */}
                          {result.message && (
                            <pre className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 rounded-md p-3 mb-3 whitespace-pre-wrap font-mono overflow-x-auto">
                              {result.message}
                            </pre>
                          )}

                          {/* Test results list */}
                          {result.tests && result.tests.length > 0 && (
                            <div className="space-y-1.5">
                              {result.tests.map((test, i) => (
                                <div
                                  key={i}
                                  className={`flex items-center gap-2.5 text-xs px-3 py-2 rounded-md border ${
                                    test.ok
                                      ? "border-emerald-500/10 bg-emerald-500/5"
                                      : "border-red-500/10 bg-red-500/5"
                                  }`}
                                >
                                  <span className={`font-mono font-semibold ${test.ok ? "text-emerald-400" : "text-red-400"}`}>
                                    {test.ok ? "PASS" : "FAIL"}
                                  </span>
                                  <span className="text-muted-foreground flex-1">{test.name}</span>
                                  {test.msg && !test.ok && (
                                    <span className="text-red-400/70 text-xs truncate max-w-[200px] font-mono">{test.msg}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center py-8">
                          <div className="text-muted-foreground text-xs">Run your code to see results</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {result && (
                  <div className="border-t border-border px-3 py-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {`${result.passed}/${result.total} passed${result.durationMs ? ` | ${result.durationMs}ms` : ""}`}
                    </span>
                  </div>
                )}
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
}
