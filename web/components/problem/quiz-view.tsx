"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import ProblemPreview from "@/components/problem/ProblemPreview";
import { useSubmission } from "@/hooks/use-api";
import { useProgressStore } from "@/stores/progressStore";
import type { Problem, QuizQuestion, QuizResult } from "@/types/problem";

interface QuizViewProps {
  problem: Problem;
}

export function QuizView({ problem }: QuizViewProps) {
  const questions: QuizQuestion[] = (problem.questions as QuizQuestion[]) || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<QuizResult[] | null>(null);
  const [score, setScore] = useState<{ score: number; total: number; percentage: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submitMutation = useSubmission(problem.id);
  const recordAttempt = useProgressStore((s) => s.recordAttempt);
  const currentQuestion = questions[currentIndex];
  const allAnswered = questions.every((q) => answers[q.id]);

  const tags: string[] = (() => {
    try { return JSON.parse(problem.tags || "[]"); } catch { return []; }
  })();

  const handleSelect = useCallback((questionId: string, option: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }, [submitted]);

  // Keyboard shortcuts: A/B/C/D to select, Left/Right to navigate, Enter to submit
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      if (["a", "b", "c", "d"].includes(key) && currentQuestion) {
        handleSelect(currentQuestion.id, key);
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
      } else if (e.key === "ArrowRight" && currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentIndex, currentQuestion, questions.length, handleSelect]);

  const gradeClientSide = () => {
    const clientResults: QuizResult[] = questions.map((q) => ({
      questionId: q.id,
      userAnswer: answers[q.id] || "",
      correctAnswer: q.correctAnswer || "",
      isCorrect: answers[q.id] === q.correctAnswer,
      explanation: q.explanation || "",
    }));
    const correct = clientResults.filter((r) => r.isCorrect).length;
    const pct = Math.round((correct / questions.length) * 100);
    return { results: clientResults, score: correct, total: questions.length, percentage: pct };
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}/api/problems/${problem.id}/quiz`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ answers }),
        }
      );

      let data: { results: QuizResult[]; score: number; total: number; percentage: number };

      if (res.ok) {
        data = await res.json();
      } else {
        // Backend unavailable or auth failed - grade locally
        data = gradeClientSide();
      }

      setResults(data.results);
      setScore({ score: data.score, total: data.total, percentage: data.percentage });
      setSubmitted(true);
      setCurrentIndex(0);
      recordAttempt(problem.id, data.percentage >= 70, data.score);

      // Record submission (fire-and-forget, don't redirect on failure)
      submitMutation.mutate({
        status: data.percentage >= 70 ? "passed" : "failed",
        answers,
        score: data.score,
        totalQuestions: data.total,
      });
    } catch {
      // Network error - grade locally
      const data = gradeClientSide();
      setResults(data.results);
      setScore({ score: data.score, total: data.total, percentage: data.percentage });
      setSubmitted(true);
      setCurrentIndex(0);
      recordAttempt(problem.id, data.percentage >= 70, data.score);

      submitMutation.mutate({
        status: data.percentage >= 70 ? "passed" : "failed",
        answers,
        score: data.score,
        totalQuestions: data.total,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getResultForQuestion = (questionId: string): QuizResult | undefined => {
    return results?.find((r) => r.questionId === questionId);
  };

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-center text-muted-foreground">
        No questions available for this quiz.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#7F56D9]/10 text-[#9E77ED] font-medium border border-[#7F56D9]/20">
            Quiz
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
            problem.difficulty === "Easy"
              ? "text-green-400 border-green-900 bg-green-900/20"
              : problem.difficulty === "Medium"
                ? "text-yellow-400 border-yellow-900 bg-yellow-900/20"
                : "text-red-400 border-red-900 bg-red-900/20"
          }`}>
            {problem.difficulty}
          </span>
          <span className="text-xs text-muted-foreground font-mono">Week {problem.weekNumber}</span>
        </div>
        <h1 className="text-2xl font-semibold">{problem.title}</h1>
        {tags.length > 0 && (
          <div className="flex gap-1.5 mt-2">
            {tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-accent text-foreground text-xs rounded border border-border">
                {tag}
              </span>
            ))}
          </div>
        )}
        {problem.description && (
          <div className="mt-3">
            <ProblemPreview content={problem.description} />
          </div>
        )}
      </div>

      {/* Score banner */}
      {submitted && score && (
        <div className={`rounded-lg p-4 mb-6 relative overflow-hidden ${
          score.percentage >= 80 ? "bg-emerald-500/10 border border-emerald-500/20" :
          score.percentage >= 50 ? "bg-amber-500/10 border border-amber-500/20" :
          "bg-red-500/10 border border-red-500/20"
        }`}>
          {score.percentage >= 80 && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <span
                  key={i}
                  className="absolute text-sm animate-bounce"
                  style={{
                    left: `${8 + i * 8}%`,
                    top: `${10 + (i % 3) * 25}%`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: `${0.8 + (i % 3) * 0.3}s`,
                    opacity: 0.7,
                  }}
                >
                  {["*", "+", "*"][i % 3]}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between relative">
            <div>
              <div className="text-lg font-bold">
                {score.percentage >= 80 ? "Excellent! " : ""}{score.score}/{score.total} correct ({score.percentage}%)
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {score.percentage >= 80 ? "Great work!" :
                 score.percentage >= 50 ? "Good effort - review the explanations below." :
                 "Review the material and try again."}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSubmitted(false);
                setResults(null);
                setScore(null);
                setAnswers({});
                setCurrentIndex(0);
              }}
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {!submitted && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>{Object.keys(answers).length} of {questions.length} answered</span>
            <span>{Math.round((Object.keys(answers).length / questions.length) * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-[#7F56D9] rounded-full transition-all duration-300"
              style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Progress pills */}
      <div className="flex items-center gap-1.5 mb-6 flex-wrap">
        {questions.map((q, i) => {
          const result = getResultForQuestion(q.id);
          const isAnswered = !!answers[q.id];
          const isCurrent = i === currentIndex;

          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(i)}
              className={`w-8 h-8 rounded-md text-xs font-medium transition-all ${
                submitted && result
                  ? result.isCorrect
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                  : isCurrent
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : isAnswered
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-secondary text-muted-foreground border border-border"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Current question */}
      {currentQuestion && (
        <div className="border border-border rounded-xl p-6 bg-card">
          <div className="text-xs text-muted-foreground mb-3 font-mono">
            Question {currentIndex + 1} of {questions.length}
          </div>

          <div className="mb-5">
            <ProblemPreview content={currentQuestion.questionText} />
          </div>

          {/* Options */}
          <div className="space-y-2">
            {(["a", "b", "c", "d"] as const).map((key) => {
              const optionText = currentQuestion.options[key];
              if (!optionText) return null;

              const isSelected = answers[currentQuestion.id] === key;
              const result = getResultForQuestion(currentQuestion.id);
              const isCorrect = submitted && result?.correctAnswer === key;
              const isWrong = submitted && isSelected && !result?.isCorrect;

              return (
                <button
                  key={key}
                  onClick={() => handleSelect(currentQuestion.id, key)}
                  disabled={submitted}
                  className={`w-full text-left p-3.5 rounded-lg border text-sm transition-all ${
                    submitted
                      ? isCorrect
                        ? "border-emerald-500/50 bg-emerald-500/10"
                        : isWrong
                          ? "border-red-500/50 bg-red-500/10"
                          : "border-border/50 opacity-50"
                      : isSelected
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border hover:border-primary/40 hover:bg-accent/50"
                  }`}
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-current/20 text-xs font-mono mr-3">
                    {key.toUpperCase()}
                  </span>
                  {optionText}
                </button>
              );
            })}
          </div>

          {/* Explanation after submit */}
          {submitted && getResultForQuestion(currentQuestion.id) && (
            <div className={`mt-4 p-4 rounded-lg border ${
              getResultForQuestion(currentQuestion.id)!.isCorrect
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-amber-500/5 border-amber-500/20"
            }`}>
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                Explanation
              </p>
              <ProblemPreview content={getResultForQuestion(currentQuestion.id)!.explanation} />
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>

        <span className="text-xs text-gray-600 hidden sm:block">
          A/B/C/D to select, arrows to navigate
        </span>

        <div className="flex gap-2">
          {currentIndex < questions.length - 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
            >
              Next
            </Button>
          )}
          {!submitted && currentIndex === questions.length - 1 && (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
            >
              {submitting ? "Checking..." : "Submit Answers"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
