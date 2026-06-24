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
  code,
  children,
}: {
  id: string;
  q: string;
  difficulty: Difficulty;
  tags: Tag[];
  code?: string;
  children: React.ReactNode;
}) {
  const { isCardVisible, queryActive } = useInterviews();
  const [localOpen, setLocalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!queryActive) setLocalOpen(false);
  }, [queryActive]);

  // Open when linked from in-page jump links (#question-id).
  useEffect(() => {
    const syncFromHash = () => {
      if (window.location.hash === `#${id}`) setLocalOpen(true);
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [id]);

  if (!isCardVisible(id)) return null;

  const open = localOpen || queryActive;
  const isKey = tags.includes("key");
  const specialTags = tags.filter((t): t is keyof typeof SPECIAL_TAGS => t in SPECIAL_TAGS);

  const copyCode = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div
      id={id}
      className={`bg-card border rounded-md mb-1.5 overflow-hidden scroll-mt-32 ${
        isKey ? "border-l-2 border-l-[#ca8a04] border-y-border border-r-border" : "border-border"
      }`}
    >
      <button
        type="button"
        onClick={() => setLocalOpen((e) => !e)}
        className="w-full flex items-center gap-3 px-3.5 py-2 text-left hover:bg-muted/30 transition-colors"
        aria-expanded={open}
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
            open ? "rotate-90" : ""
          }`}
        >
          ▶
        </span>
      </button>
      {open && (
        <div className="interviews-prose px-3.5 border-t border-border pb-2.5 pt-1.5">
          {children}
          {code && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Code</span>
                <button
                  type="button"
                  onClick={copyCode}
                  className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="text-[12px] leading-relaxed overflow-x-auto">
                <code>{code}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
