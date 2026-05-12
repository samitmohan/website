"use client";

import Link from "next/link";
import { SYLLABUS } from "@/config/syllabus";
import { PROBLEMS, getProblemsByWeek } from "@/config/problems";
import { useUserProgress } from "@/hooks/use-api";

const TYPE_COLORS: Record<string, string> = {
  coding: "bg-[#7F56D9]/10 text-[#9E77ED] border-[#7F56D9]/20",
  quiz: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  system_design: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const TYPE_LABELS: Record<string, string> = {
  coding: "Coding",
  quiz: "Quiz",
  system_design: "Design",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-emerald-400",
  Medium: "text-amber-400",
  Hard: "text-red-400",
};

export default function SyllabusPage() {
  const { data: progress } = useUserProgress();

  return (
    <div className="max-w-[720px] mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-xl font-bold text-foreground">Syllabus</h1>
      </div>

      <div>
        {SYLLABUS.map((week, i) => {
          const weekProblems = getProblemsByWeek(week.weekNumber);
          const wp = progress?.weeks?.[`week-${week.weekNumber}`];
          return (
            <div
              key={week.weekNumber}
              className={`${
                i < SYLLABUS.length - 1 ? "border-b border-border" : ""
              }${week.supplementary ? " opacity-70" : ""}`}
            >
              <div className="flex gap-5 pt-5 pb-3">
                <span className="text-[24px] font-bold text-muted-foreground/50 font-mono tabular-nums leading-none pt-0.5 w-9 shrink-0 select-none">
                  {String(week.weekNumber).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/problems?week=${week.weekNumber}`}
                      className="text-sm font-semibold text-foreground hover:text-[#9E77ED] transition-colors"
                    >
                      {week.title}
                    </Link>
                    {week.supplementary && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                        Supplementary
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-muted-foreground mt-0.5 leading-relaxed">
                    {week.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {week.topics.map((topic) => (
                      <span
                        key={topic}
                        className="text-xs px-2 py-[2px] rounded-full bg-muted text-muted-foreground"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                  {weekProblems.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground/70">{weekProblems.length} problems</span>
                      <span className="text-xs text-muted-foreground/50">|</span>
                      {(() => {
                        const e = weekProblems.filter((p) => p.difficulty === "Easy").length;
                        const m = weekProblems.filter((p) => p.difficulty === "Medium").length;
                        const h = weekProblems.filter((p) => p.difficulty === "Hard").length;
                        return (
                          <>
                            {e > 0 && <span className="text-xs text-emerald-500/70">{e} Easy</span>}
                            {m > 0 && <span className="text-xs text-amber-500/70">{m} Med</span>}
                            {h > 0 && <span className="text-xs text-red-500/70">{h} Hard</span>}
                          </>
                        );
                      })()}
                      {wp && wp.completed > 0 && (
                        <>
                          <span className="text-xs text-muted-foreground/50">|</span>
                          <span className="text-xs text-emerald-400">{wp.completed}/{wp.total} solved</span>
                          <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${Math.round(wp.percent * 100)}%` }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  {week.project && (
                    <p className="text-[13px] text-muted-foreground/70 mt-2 font-medium">
                      Project: {week.project}
                    </p>
                  )}
                </div>
              </div>

              {/* Problems */}
              {weekProblems.length > 0 ? (
                <div className="ml-14 pb-5 space-y-0">
                  {weekProblems.map((problem) => (
                    <Link
                      key={problem.id}
                      href={`/problems/${problem.id}`}
                      className="flex items-center gap-2.5 py-[5px] group"
                    >
                      <span
                        className={`text-xs font-medium px-1.5 py-[1px] rounded border shrink-0 ${TYPE_COLORS[problem.type]}`}
                      >
                        {TYPE_LABELS[problem.type]}
                      </span>
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1 truncate">
                        {problem.title}
                      </span>
                      <span
                        className={`text-xs shrink-0 ${DIFFICULTY_COLORS[problem.difficulty]}`}
                      >
                        {problem.difficulty}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="ml-14 pb-5 text-[13px] text-muted-foreground/50">
                  Coming soon
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
