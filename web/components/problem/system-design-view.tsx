"use client";

import { useState, useEffect, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Button } from "@/components/ui/button";
import ProblemPreview from "@/components/problem/ProblemPreview";
import ProblemVisualization from "@/components/problem/ProblemVisualization";
import { useSubmission } from "@/hooks/use-api";
import { useProgressStore } from "@/stores/progressStore";
import type { Problem, RubricItem } from "@/types/problem";

type LeftTab = "prompt" | "theory" | "answer" | "evaluation";

interface CriterionScore {
  criterion: string;
  score: number;
  feedback: string;
}

interface EvaluationResult {
  scores: CriterionScore[];
  overallFeedback: string;
  strengths: string[];
  improvements: string[];
  weightedScore: number;
  maxScore: number;
}

interface SystemDesignViewProps {
  problem: Problem;
}

export function SystemDesignView({ problem }: SystemDesignViewProps) {
  const storageKey = `autosave-${problem.id}-design`;
  const [response, setResponse] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(storageKey) || "";
    }
    return "";
  });
  const [showAnswer, setShowAnswer] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [leftTab, setLeftTab] = useState<LeftTab>("prompt");
  const [rightTab, setRightTab] = useState<"write" | "preview">("write");
  const [saved, setSaved] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Autosave to localStorage
  useEffect(() => {
    if (submitted) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (response.trim()) {
        localStorage.setItem(storageKey, response);
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }
    }, 1000);
    return () => clearTimeout(saveTimer.current);
  }, [response, storageKey, submitted]);

  const rubric: RubricItem[] = (problem.rubric as RubricItem[]) || [];
  const hints: string[] = (() => {
    try { return JSON.parse(problem.hints || "[]"); } catch { return []; }
  })();
  const tags: string[] = (() => {
    try { return JSON.parse(problem.tags || "[]"); } catch { return []; }
  })();

  const submitMutation = useSubmission(problem.id);
  const recordAttempt = useProgressStore((s) => s.recordAttempt);

  const handleSubmit = async () => {
    setSubmitted(true);
    setShowAnswer(true);
    localStorage.removeItem(storageKey);

    // Start LLM evaluation if rubric exists
    if (rubric.length > 0 && response.trim()) {
      setEvaluating(true);
      setEvalError(null);
      setLeftTab("evaluation");

      try {
        const res = await fetch("/api/evaluate-design", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            response: response.trim(),
            rubric,
            sampleAnswer: problem.sampleAnswer || "",
            problemTitle: problem.title,
            designPrompt: problem.designPrompt || problem.description,
          }),
        });

        if (res.ok) {
          const data: EvaluationResult = await res.json();
          setEvaluation(data);

          // Record submission with score
          const status = data.weightedScore >= 6 ? "passed" : "pending_review";
          submitMutation.mutate({
            status,
            designResponse: response,
            score: data.weightedScore,
            maxScore: data.maxScore,
          });
          recordAttempt(problem.id, data.weightedScore >= 6, data.weightedScore);
        } else {
          const err = await res.json();
          setEvalError(err.error || "Evaluation failed");
          setLeftTab("answer");
          submitMutation.mutate({
            status: "pending_review",
            designResponse: response,
          });
        }
      } catch {
        setEvalError("Could not reach evaluation service");
        setLeftTab("answer");
        submitMutation.mutate({
          status: "pending_review",
          designResponse: response,
        });
      } finally {
        setEvaluating(false);
      }
    } else {
      setLeftTab("answer");
      if (response.trim()) {
        submitMutation.mutate({
          status: "pending_review",
          designResponse: response,
        });
      }
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 6) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-red-400 bg-red-500/10 border-red-500/20";
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 8) return "bg-emerald-500";
    if (score >= 6) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="dark h-[calc(100vh-33px)] md:h-[calc(100vh-33px)] overflow-hidden bg-background text-foreground">
      <PanelGroup direction="horizontal" className="h-full bg-card border-t border-border">
        {/* Left panel - Prompt + Theory + Sample Answer + Evaluation */}
        <Panel defaultSize={50} minSize={25} maxSize={75}>
          <div className="h-full flex flex-col">
            <nav role="tablist" aria-label="Problem details" className="flex gap-4 px-4 h-12 items-end border-b border-border text-sm">
              {(["prompt", "theory", "answer", "evaluation"] as LeftTab[]).map((tab) => {
                if (tab === "evaluation" && !submitted) return null;
                return (
                  <button
                    key={tab}
                    role="tab"
                    aria-selected={leftTab === tab}
                    onClick={() => setLeftTab(tab)}
                    className={`pb-2 capitalize ${
                      leftTab === tab
                        ? "border-b-2 border-foreground text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab === "answer" ? "Sample Answer" : tab === "evaluation" ? "Evaluation" : tab}
                  </button>
                );
              })}
            </nav>

            <section role="tabpanel" className="flex-1 overflow-auto px-5 py-4 text-base leading-7">
              {leftTab === "prompt" && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-semibold">{problem.title}</h1>
                      {tags.length > 0 && (
                        <div className="flex gap-1.5 mt-1">
                          {tags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 bg-accent text-foreground text-xs rounded border border-border">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-900/30">
                        System Design
                      </span>
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
                  </div>
                  <div className="border-b border-border" />

                  {/* Visualization */}
                  <ProblemVisualization componentName={problem.visualizationComponent} />

                  {/* Design Prompt */}
                  <ProblemPreview content={problem.designPrompt || problem.description} />

                  {/* Rubric */}
                  {rubric.length > 0 && (
                    <div className="border-t border-border pt-5">
                      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Evaluation Criteria
                      </h2>
                      <div className="space-y-2">
                        {rubric.map((item, i) => (
                          <div key={i} className="border border-border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-medium text-foreground">{item.criterion}</span>
                              <span className="text-xs font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                                {Math.round(item.weight * 100)}%
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                            <div className="h-1 rounded-full bg-secondary overflow-hidden">
                              <div
                                className="h-full bg-primary/60 rounded-full"
                                style={{ width: `${item.weight * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hints */}
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

              {leftTab === "theory" && (
                <div>
                  {problem.theory ? (
                    <ProblemPreview content={problem.theory} />
                  ) : (
                    <em className="text-muted-foreground">No theory notes yet.</em>
                  )}
                </div>
              )}

              {leftTab === "answer" && (
                <div>
                  {showAnswer && problem.sampleAnswer ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Sample Answer
                      </div>
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-5">
                        <ProblemPreview content={problem.sampleAnswer} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">
                      Submit your response to reveal the sample answer.
                    </div>
                  )}
                </div>
              )}

              {leftTab === "evaluation" && (
                <div className="space-y-5">
                  {evaluating && (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
                      <p className="text-sm text-muted-foreground">Evaluating your response...</p>
                    </div>
                  )}

                  {evalError && !evaluation && (
                    <div className="rounded-lg p-4 bg-red-500/10 border border-red-500/20">
                      <p className="text-sm text-red-400">{evalError}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Your response was saved. Check the Sample Answer tab to self-evaluate.
                      </p>
                    </div>
                  )}

                  {evaluation && (
                    <>
                      {/* Overall score */}
                      <div className="rounded-lg p-5 border border-border bg-secondary/50">
                        <div className="flex items-center justify-between mb-3">
                          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Overall Score</h2>
                          <span className={`text-2xl font-bold font-mono px-3 py-1 rounded-lg border ${getScoreColor(evaluation.weightedScore)}`}>
                            {evaluation.weightedScore}/{evaluation.maxScore}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {evaluation.overallFeedback}
                        </p>
                      </div>

                      {/* Per-criterion scores */}
                      <div>
                        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Criterion Breakdown</h2>
                        <div className="space-y-3">
                          {evaluation.scores.map((score, i) => {
                            const rubricItem = rubric.find((r) => r.criterion === score.criterion);
                            const weight = rubricItem ? Math.round(rubricItem.weight * 100) : null;
                            return (
                              <div key={i} className="border border-border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-foreground">{score.criterion}</span>
                                    {weight && (
                                      <span className="text-[11px] text-muted-foreground font-mono">({weight}%)</span>
                                    )}
                                  </div>
                                  <span className={`text-sm font-bold font-mono px-2 py-0.5 rounded border ${getScoreColor(score.score)}`}>
                                    {score.score}/10
                                  </span>
                                </div>
                                {/* Score bar */}
                                <div className="h-1.5 rounded-full bg-secondary overflow-hidden mb-2">
                                  <div
                                    className={`h-full rounded-full transition-all ${getScoreBarColor(score.score)}`}
                                    style={{ width: `${score.score * 10}%` }}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">{score.feedback}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Strengths & Improvements */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border border-emerald-500/20 rounded-lg p-4 bg-emerald-500/5">
                          <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Strengths</h3>
                          <ul className="space-y-1.5">
                            {evaluation.strengths.map((s, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex gap-2">
                                <span className="text-emerald-400 shrink-0">+</span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="border border-amber-500/20 rounded-lg p-4 bg-amber-500/5">
                          <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Improvements</h3>
                          <ul className="space-y-1.5">
                            {evaluation.improvements.map((imp, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex gap-2">
                                <span className="text-amber-400 shrink-0">-</span>
                                {imp}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </section>
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-accent hover:bg-muted-foreground transition-colors" />

        {/* Right panel - Response Editor */}
        <Panel defaultSize={50} minSize={25}>
          <div className="h-full flex flex-col">
            {/* Editor toolbar */}
            <div className="border-b border-border px-4 py-2 flex items-center justify-between">
              <div role="tablist" aria-label="Response editor" className="flex gap-3 text-xs">
                <button
                  role="tab"
                  aria-selected={rightTab === "write"}
                  onClick={() => setRightTab("write")}
                  className={`pb-0 ${rightTab === "write" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Write
                </button>
                <button
                  role="tab"
                  aria-selected={rightTab === "preview"}
                  onClick={() => setRightTab("preview")}
                  className={`pb-0 ${rightTab === "preview" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Preview
                </button>
              </div>
              <div className="flex items-center gap-2">
                {saved && (
                  <span className="text-xs text-emerald-400 animate-pulse">Saved</span>
                )}
                <span className="text-xs text-muted-foreground font-mono">
                  {response.length} chars
                </span>
              </div>
            </div>

            {/* Editor / Preview */}
            <div className="flex-1 min-h-0 overflow-auto">
              {rightTab === "write" ? (
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  disabled={submitted}
                  placeholder={`Write your system design response here using markdown...\n\nConsider addressing:\n${rubric.map((r) => `- ${r.criterion} (${Math.round(r.weight * 100)}%)`).join("\n")}`}
                  className="w-full h-full resize-none bg-transparent p-4 text-sm font-mono focus:outline-none placeholder:text-muted-foreground/40"
                />
              ) : (
                <div className="p-4">
                  {response.trim() ? (
                    <ProblemPreview content={response} />
                  ) : (
                    <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
                  )}
                </div>
              )}
            </div>

            {/* Action bar */}
            <div className="border-t border-border p-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {submitted
                  ? evaluation
                    ? `Score: ${evaluation.weightedScore}/${evaluation.maxScore}`
                    : evaluating
                      ? "Evaluating..."
                      : "Submitted - compare with the sample answer"
                  : response.trim().length < 50
                    ? `${50 - response.trim().length} more chars needed`
                    : "Ready to submit"}
              </span>
              <div className="flex gap-2">
                {!submitted ? (
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={response.trim().length < 50}
                  >
                    Submit & Evaluate
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSubmitted(false);
                      setShowAnswer(false);
                      setEvaluation(null);
                      setEvalError(null);
                      setResponse("");
                      setLeftTab("prompt");
                    }}
                  >
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
