import Link from "next/link";
import { SYLLABUS } from "@/config/syllabus";
import { getProblemsByWeek } from "@/config/problems";
import { WeekProgress } from "@/components/syllabus/week-progress";

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

// Server component. It reads config/problems.ts at build time and paints only
// the four fields a row needs, so none of the problem bodies reach the browser.
export default function SyllabusPage() {
  const weeks = SYLLABUS.map((week) => {
    const problems = getProblemsByWeek(week.weekNumber);
    return {
      ...week,
      counts: {
        total: problems.length,
        easy: problems.filter((p) => p.difficulty === "Easy").length,
        med: problems.filter((p) => p.difficulty === "Medium").length,
        hard: problems.filter((p) => p.difficulty === "Hard").length,
      },
      problems: problems.map((p) => ({
        id: p.id,
        title: p.title,
        type: p.type,
        difficulty: p.difficulty,
      })),
    };
  });

  return (
    <div className="max-w-[720px] mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-xl font-bold text-foreground">Syllabus</h1>
      </div>

      <div>
        {weeks.map((week, i) => (
          <div
            key={week.weekNumber}
            className={`${
              i < weeks.length - 1 ? "border-b border-border" : ""
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
                {week.counts.total > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground/70">
                      {week.counts.total} problems
                    </span>
                    <span className="text-xs text-muted-foreground/50">|</span>
                    {week.counts.easy > 0 && (
                      <span className="text-xs text-emerald-500/70">
                        {week.counts.easy} Easy
                      </span>
                    )}
                    {week.counts.med > 0 && (
                      <span className="text-xs text-amber-500/70">{week.counts.med} Med</span>
                    )}
                    {week.counts.hard > 0 && (
                      <span className="text-xs text-red-500/70">{week.counts.hard} Hard</span>
                    )}
                    <WeekProgress weekNumber={week.weekNumber} />
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
            {week.problems.length > 0 ? (
              <div className="ml-14 pb-5 space-y-0">
                {week.problems.map((problem) => (
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
              <p className="ml-14 pb-5 text-[13px] text-muted-foreground/50">Coming soon</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
