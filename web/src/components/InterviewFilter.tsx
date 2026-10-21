"use client";

import { useEffect, useState } from "react";

const LEVELS = ["all", "easy", "med", "hard"] as const;

/**
 * Search and difficulty filter for the interview guide. The questions are
 * server-rendered HTML; this only hides what does not match, so none of the
 * answers ship twice as JavaScript data.
 */
export function InterviewFilter({ total }: { total: number }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("all");
  const [shown, setShown] = useState(total);
  const [open, setOpen] = useState(false);

  // A link to a question (#s5-what-is-...) opens it.
  useEffect(() => {
    const openHash = () => {
      const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (el instanceof HTMLDetailsElement) el.open = true;
    };
    openHash();
    addEventListener("hashchange", openHash);
    return () => removeEventListener("hashchange", openHash);
  }, []);

  useEffect(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    let n = 0;
    for (const q of document.querySelectorAll<HTMLElement>("[data-iv-q][data-d]")) {
      const text = q.textContent!.toLowerCase();
      const hit = (level === "all" || q.dataset.d === level) && words.every((w) => text.includes(w));
      q.hidden = !hit;
      if (hit) n++;
    }
    // Reading list and info sections match on text only; they carry no difficulty.
    for (const q of document.querySelectorAll<HTMLElement>("[data-iv-q]:not([data-d])"))
      q.hidden = level !== "all" || !words.every((w) => q.textContent!.toLowerCase().includes(w));
    // A group hides when nothing in it matches; an info block is its own group and was decided above.
    for (const sub of document.querySelectorAll<HTMLElement>("[data-iv-sub]:not([data-iv-q])"))
      sub.hidden = !sub.querySelector("[data-iv-q]:not([hidden])");
    for (const sec of document.querySelectorAll<HTMLElement>("[data-iv-section]")) {
      sec.hidden = !sec.querySelector("[data-iv-sub]:not([hidden])");
      const chip = document.querySelector<HTMLElement>(`[data-iv-chip="${sec.id}"]`);
      if (chip) chip.hidden = sec.hidden;
    }
    setShown(n);
  }, [query, level]);

  const toggleAll = () => {
    const next = !open;
    for (const d of document.querySelectorAll<HTMLDetailsElement>("[data-iv-q]:not([hidden]) details")) d.open = next;
    setOpen(next);
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 focus-within:ring-2 focus-within:ring-accent">
        <svg viewBox="0 0 16 16" aria-hidden className="size-4 shrink-0 text-muted">
          <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search questions, answers, tags"
          aria-label="Search the interview guide"
          className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-muted"
        />
      </label>
      <div className="flex flex-wrap items-center gap-1.5">
        {LEVELS.map((l) => (
          <button key={l} type="button" className="pill aria-pressed:!bg-ink aria-pressed:!text-bg" aria-pressed={level === l} onClick={() => setLevel(l)}>
            {l}
          </button>
        ))}
        <button type="button" className="pill" onClick={toggleAll}>
          {open ? "close all" : "open all"}
        </button>
        <span className="ml-auto font-mono text-[12px] text-muted" aria-live="polite">
          {shown === total ? `${total} questions` : `${shown} of ${total}`}
        </span>
      </div>
    </div>
  );
}
