"use client";

import { useState } from "react";
import type { QA, Tag } from "@/lib/learning-data";

// Only the tags that map to filter chips — shown as plain colored text, no pill background
const SPECIAL_TAGS: Partial<Record<Tag, string>> = {
  key: "text-[#ca8a04]",
  frontier: "text-purple-500 dark:text-purple-400",
  startup: "text-primary",
};

const SPECIAL_LABELS: Partial<Record<Tag, string>> = {
  key: "key",
  frontier: "frontier",
  startup: "startup",
};

const DIFFICULTY_DOT: Record<QA["difficulty"], string> = {
  easy: "bg-[#16a34a]",
  med: "bg-[#ca8a04]",
  hard: "bg-destructive",
};

export function QACard({ qa, id }: { qa: QA; id: string }) {
  const [expanded, setExpanded] = useState(false);
  const isKey = qa.tags.includes("key");
  const specialTags = qa.tags.filter((t): t is keyof typeof SPECIAL_TAGS => t in SPECIAL_TAGS && t !== "key");

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
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-px ${DIFFICULTY_DOT[qa.difficulty]}`}
          title={qa.difficulty}
        />
        <div className="flex-1 min-w-0">
          <span className="text-[13px] text-foreground leading-snug">{qa.q}</span>
          {specialTags.length > 0 && (
            <span className="ml-2">
              {specialTags.map((t) => (
                <span key={t} className={`text-[10px] font-medium mr-1.5 ${SPECIAL_TAGS[t]}`}>
                  {SPECIAL_LABELS[t]}
                </span>
              ))}
            </span>
          )}
        </div>
        <span
          className={`text-muted-foreground/50 text-[9px] flex-shrink-0 transition-transform ${
            expanded ? "rotate-90" : ""
          }`}
        >
          ▶
        </span>
      </button>
      {expanded && (
        <div className="learning-prose px-3.5 pb-3.5 pt-2 border-t border-border">
          <div dangerouslySetInnerHTML={{ __html: qa.a }} />
        </div>
      )}
    </div>
  );
}
