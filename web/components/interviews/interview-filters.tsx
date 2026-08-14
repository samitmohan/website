"use client";

import { useEffect, useRef, useState } from "react";
import type { Difficulty } from "@/lib/interviews-data";

/* Facet chips over the question list. Chip anatomy (dot, label, trailing count
 * pill, raised surface when active) is adapted from Beautiful UI's Filter Table
 * primitive (beautiful-ui-five.vercel.app, built by Turbo).
 *
 * The guide stays a zero-JS server component: every answer is server-rendered
 * HTML and this bar filters by toggling [hidden] on the already-painted nodes.
 * Nothing about the 234 answers crosses into the client bundle. */

export interface Facets {
  total: number;
  difficulty: Record<string, number>;
  tags: Record<string, number>;
}

const DIFFICULTY_ORDER: Difficulty[] = ["easy", "med", "hard"];

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "Easy",
  med: "Medium",
  hard: "Hard",
};

// Same three colours the difficulty dot already uses on each card.
const DIFFICULTY_DOT: Record<Difficulty, string> = {
  easy: "#16a34a",
  med: "#ca8a04",
  hard: "var(--destructive)",
};

const chip =
  "flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium transition-[background-color,box-shadow,color] duration-200";

function Chip({
  active,
  onClick,
  dot,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  dot?: string;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`${chip} ${
        active
          ? "bg-background text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.08)] ring-1 ring-border"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {dot && (
        <span
          aria-hidden
          className="size-1.5 shrink-0 rounded-full"
          style={{ background: dot }}
        />
      )}
      {label}
      <span
        className={`rounded px-1 text-[10.5px] tabular-nums ${
          active ? "bg-muted text-muted-foreground" : "text-muted-foreground/60"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

export function InterviewFilters({ facets }: { facets: Facets }) {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const countRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const tags = Object.entries(facets.tags)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);

  const active = Boolean(difficulty || tag || query.trim());

  // Sync the rendered DOM with the current facets. The count readout is written
  // straight to its node rather than held in state: it is derived from the same
  // pass and would otherwise cascade a second render on every keystroke.
  useEffect(() => {
    const root = document.getElementById("interviews-body");
    if (!root) return;

    const q = query.trim().toLowerCase();
    let shown = 0;

    for (const card of root.querySelectorAll<HTMLElement>("[data-qa]")) {
      const matches =
        (!difficulty || card.dataset.difficulty === difficulty) &&
        (!tag || (card.dataset.tags ?? "").split(" ").includes(tag)) &&
        (!q || (card.dataset.q ?? "").includes(q));
      card.hidden = !matches;
      if (matches) shown += 1;
    }

    for (const sub of root.querySelectorAll<HTMLElement>("[data-sub]")) {
      sub.hidden = !sub.querySelector("[data-qa]:not([hidden])");
    }
    for (const section of root.querySelectorAll<HTMLElement>("[data-section]")) {
      // Company Guide, Reading List and NeetCode hold no tagged questions, so
      // they drop out entirely once a facet is on rather than sitting empty.
      section.hidden =
        section.dataset.section === "static"
          ? active
          : !section.querySelector("[data-qa]:not([hidden])");
    }

    const toc = document.querySelector<HTMLElement>("[data-toc]");
    if (toc) toc.hidden = active;

    if (countRef.current) {
      countRef.current.textContent = active
        ? `${shown} of ${facets.total} questions`
        : `${facets.total} questions`;
    }
  }, [difficulty, tag, query, active, facets.total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && typing) inputRef.current?.blur();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const clear = () => {
    setDifficulty(null);
    setTag(null);
    setQuery("");
  };

  return (
    <div className="mb-10">
      <div className="mb-3 flex h-9 items-center gap-2 rounded-lg border border-border bg-muted/40 px-3">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
          className="shrink-0 text-muted-foreground/60"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter questions"
          aria-label="Filter questions"
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground/60"
        />
        <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground/60 sm:block">
          /
        </kbd>
      </div>

      <div className="-mx-1 flex flex-wrap items-center gap-1 px-1">
        {DIFFICULTY_ORDER.map((d) => (
          <Chip
            key={d}
            active={difficulty === d}
            onClick={() => setDifficulty(difficulty === d ? null : d)}
            dot={DIFFICULTY_DOT[d]}
            label={DIFFICULTY_LABEL[d]}
            count={facets.difficulty[d] ?? 0}
          />
        ))}

        <span aria-hidden className="mx-1 h-4 w-px bg-border" />

        {tags.map(([t, n]) => (
          <Chip
            key={t}
            active={tag === t}
            onClick={() => setTag(tag === t ? null : t)}
            label={t}
            count={n}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span
          ref={countRef}
          className="font-mono text-[12px] text-muted-foreground/60"
        >
          {facets.total} questions
        </span>
        {active && (
          <button
            type="button"
            onClick={clear}
            className="text-[12px] text-primary underline-offset-2 hover:underline"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
