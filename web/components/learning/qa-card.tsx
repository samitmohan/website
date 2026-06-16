"use client";

import { useState } from "react";
import type { QA, Tag } from "@/lib/learning-data";

const TAG_LABELS: Partial<Record<Tag, string>> = {
  key: "Key",
  frontier: "Frontier",
  startup: "Startup",
  coding: "Coding",
  math: "Math",
  dl: "DL",
  cv: "CV",
  llm: "LLM",
  generative: "Gen",
  system: "SysDesign",
  mlops: "MLOps",
  behavioral: "Behavioral",
  classical: "Classical ML",
  transformers: "Transformers",
};

const DIFFICULTY_STYLES: Record<QA["difficulty"], string> = {
  easy: "bg-[#16a34a]/10 text-[#16a34a]",
  med: "bg-[#ca8a04]/10 text-[#ca8a04]",
  hard: "bg-destructive/10 text-destructive",
};

const DIFFICULTY_LABELS: Record<QA["difficulty"], string> = {
  easy: "Easy",
  med: "Med",
  hard: "Hard",
};

export function QACard({ qa, id }: { qa: QA; id: string }) {
  const [expanded, setExpanded] = useState(false);
  const isKey = qa.tags.includes("key");

  return (
    <div
      id={id}
      className={`bg-card border rounded-lg mb-2 overflow-hidden transition-colors ${
        isKey ? "border-l-[3px] border-l-[#ca8a04] border-y-border border-r-border" : "border-border"
      }`}
    >
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-start gap-3 px-3.5 py-3 text-left hover:bg-muted/40 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] text-foreground leading-snug">{qa.q}</div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${DIFFICULTY_STYLES[qa.difficulty]}`}
            >
              {DIFFICULTY_LABELS[qa.difficulty]}
            </span>
            {qa.tags
              .filter((t) => TAG_LABELS[t])
              .map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-muted text-muted-foreground"
                >
                  {TAG_LABELS[t]}
                </span>
              ))}
          </div>
        </div>
        <span
          className={`text-muted-foreground text-[10px] flex-shrink-0 mt-1 transition-transform ${
            expanded ? "rotate-90" : ""
          }`}
        >
          &#9658;
        </span>
      </button>
      {expanded && (
        <div className="learning-prose px-3.5 pb-3.5 pt-1 border-t border-border">
          <div dangerouslySetInnerHTML={{ __html: qa.a }} />
        </div>
      )}
    </div>
  );
}
