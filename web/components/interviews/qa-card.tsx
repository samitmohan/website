"use client";

import { useEffect, useState } from "react";
import type { Difficulty, Tag } from "@/lib/interviews-data";
import { useInterviews } from "@/components/interviews/interviews-context";

const SPECIAL_TAGS: Partial<Record<Tag, string>> = {
  frontier: "text-purple-500 dark:text-purple-400",
  startup: "text-primary",
};

const DIFFICULTY_DOT: Record<Difficulty, string> = {
  easy: "bg-[#16a34a]",
  med: "bg-[#ca8a04]",
  hard: "bg-destructive",
};

export function QACard({
  id,
  q,
  difficulty,
  tags,
  children,
}: {
  id: string;
  q: string;
  difficulty: Difficulty;
  tags: Tag[];
  children: React.ReactNode;
}) {
  const { isCardVisible, queryActive } = useInterviews();
  const [expanded, setExpanded] = useState(false);

  // Auto-expand to reveal matching answers while a search query is active;
  // collapse again once the query is cleared.
  useEffect(() => {
    setExpanded(queryActive);
  }, [queryActive]);

  if (!isCardVisible(id)) return null;

  const isKey = tags.includes("key");
  const specialTags = tags.filter((t): t is keyof typeof SPECIAL_TAGS => t in SPECIAL_TAGS);

  return (
    <div
      id={id}
      className={`bg-card border rounded-md mb-1.5 overflow-hidden ${
        isKey ? "border-l-2 border-l-[#ca8a04] border-y-border border-r-border" : "border-border"
      }`}
    >
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-muted/30 transition-colors"
        aria-expanded={expanded}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${DIFFICULTY_DOT[difficulty]}`}
          title={difficulty}
        />
        <span className="flex-1 min-w-0 text-[13px] text-foreground leading-snug">
          {q}
          {specialTags.length > 0 && (
            <span className="ml-2">
              {specialTags.map((t) => (
                <span key={t} className={`text-[10px] font-medium mr-1.5 ${SPECIAL_TAGS[t]}`}>
                  {t}
                </span>
              ))}
            </span>
          )}
        </span>
        <span
          className={`text-muted-foreground/50 text-[9px] flex-shrink-0 transition-transform ${
            expanded ? "rotate-90" : ""
          }`}
        >
          ▶
        </span>
      </button>
      {expanded && (
        <div className="interviews-prose px-3.5 pb-3.5 pt-2 border-t border-border">{children}</div>
      )}
    </div>
  );
}
