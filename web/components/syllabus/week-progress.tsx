"use client";

import { useUserProgress } from "@/hooks/use-api";

/**
 * The only part of the syllabus that needs a client. Everything else is static
 * and renders on the server, which keeps config/problems.ts (5k lines of
 * descriptions, starter code, test cases and solutions) out of the bundle.
 *
 * Every instance reads the same react-query key, so the fetch happens once.
 */
export function WeekProgress({ weekNumber }: { weekNumber: number }) {
  const { data: progress } = useUserProgress();
  const week = progress?.weeks?.[`week-${weekNumber}`];
  if (!week || week.completed === 0) return null;

  return (
    <>
      <span className="text-xs text-muted-foreground/50">|</span>
      <span className="text-xs text-emerald-400">
        {week.completed}/{week.total} solved
      </span>
      <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all"
          style={{ width: `${Math.round(week.percent * 100)}%` }}
        />
      </div>
    </>
  );
}
