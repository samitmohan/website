"use client";

import { use } from "react";
import Link from "next/link";
import { getProblemById } from "@/config/problems";
import { SYLLABUS } from "@/config/syllabus";
import { CodingView } from "@/components/problem/coding-view";
import { QuizView } from "@/components/problem/quiz-view";
import { SystemDesignView } from "@/components/problem/system-design-view";
import { useProgressStore } from "@/stores/progressStore";

function BookmarkButton({ problemId }: { problemId: string }) {
  const toggleBookmark = useProgressStore((s) => s.toggleBookmark);
  const isBookmarked = useProgressStore((s) => s.isBookmarked(problemId));

  return (
    <button
      onClick={() => toggleBookmark(problemId)}
      className={`p-1.5 rounded transition-colors ${
        isBookmarked
          ? "text-amber-400 hover:text-amber-300"
          : "text-gray-600 hover:text-gray-400"
      }`}
      title={isBookmarked ? "Remove bookmark" : "Bookmark this problem"}
      aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this problem"}
    >
      <svg className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    </button>
  );
}

function Breadcrumbs({ weekNumber, title, problemId }: { weekNumber: number; title: string; problemId: string }) {
  const weekMeta = SYLLABUS.find((w) => w.weekNumber === weekNumber);
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 px-4 py-2 text-xs text-muted-foreground border-b border-border bg-background">
      <Link href="/problems" className="hover:text-foreground transition-colors">
        Problems
      </Link>
      <span className="text-muted-foreground/30">/</span>
      <Link
        href={`/problems?week=${weekNumber}`}
        className="hover:text-foreground transition-colors"
      >
        Week {weekNumber}{weekMeta ? `: ${weekMeta.title}` : ""}
      </Link>
      <span className="text-muted-foreground/30">/</span>
      <span className="text-foreground truncate max-w-[200px]">{title}</span>
      <div className="ml-auto">
        <BookmarkButton problemId={problemId} />
      </div>
    </nav>
  );
}

export default function ProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const problem = getProblemById(slug);

  if (!problem) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 className="text-xl font-bold mb-2">Problem not found</h1>
        <p className="text-muted-foreground mb-4">
          No problem with slug &quot;{slug}&quot;
        </p>
        <Link href="/problems" className="text-primary hover:underline text-sm">
          Back to Problems
        </Link>
      </div>
    );
  }

  const view = (() => {
    switch (problem.type) {
      case "coding":
        return <CodingView problem={problem} />;
      case "quiz":
        return <QuizView problem={problem} />;
      case "system_design":
        return <SystemDesignView problem={problem} />;
      default:
        return <div>Unknown problem type</div>;
    }
  })();

  return (
    <>
      <Breadcrumbs weekNumber={problem.weekNumber} title={problem.title} problemId={problem.id} />
      {view}
    </>
  );
}
