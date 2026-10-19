"use client";

import { useEffect, useState } from "react";

/** A run of text; `struck` runs get typed, then crossed out in red. */
export type Run = { text: string; struck?: boolean; em?: boolean };

const total = (runs: Run[]) => runs.reduce((n, r) => n + r.text.length, 0);

/**
 * Types the runs out one character at a time (12-32ms, a little uneven like a
 * person). A struck run pauses after its last letter, the strike draws, and
 * typing carries on. Reduced motion shows the finished sentence.
 */
export function TypedBio({ runs, className = "", delay = 500 }: { runs: Run[]; className?: string; delay?: number }) {
  const [n, setN] = useState(0);
  const [struck, setStruck] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(total(runs));
      setStruck(new Set(runs.map((r, i) => (r.struck ? i : -1)).filter((i) => i >= 0)));
      return;
    }
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const ends = runs.map((_, k) => total(runs.slice(0, k + 1)));
    const tick = () => {
      i++;
      setN(i);
      const run = ends.indexOf(i);
      if (run >= 0 && runs[run].struck) {
        timer = setTimeout(() => {
          setStruck((s) => new Set(s).add(run));
          timer = setTimeout(tick, 420);
        }, 260);
        return;
      }
      if (i < total(runs)) timer = setTimeout(tick, 12 + Math.random() * 20);
    };
    timer = setTimeout(tick, delay);
    return () => clearTimeout(timer);
  }, [runs, delay]);

  let left = n;
  return (
    <p className={className}>
      {/* The finished sentence for screen readers and crawlers; the animation is decoration. */}
      <span className="sr-only">{runs.filter((r) => !r.struck).map((r) => r.text).join("")}</span>
      <span aria-hidden>
        {runs.map((r, i) => {
          const shown = r.text.slice(0, Math.max(0, left));
          left -= r.text.length;
          if (!shown) return null;
          return (
            <span
              key={i}
              className={`relative ${r.em ? "font-serif italic text-ink" : ""} ${r.struck ? "text-muted" : ""}`}
            >
              {shown}
              {r.struck && (
                <span
                  className="absolute left-0 top-[55%] h-[2px] w-full origin-left bg-accent transition-transform duration-300 ease-out"
                  style={{ transform: `scaleX(${struck.has(i) ? 1 : 0}) rotate(-1deg)` }}
                />
              )}
            </span>
          );
        })}
        <span className="ml-px inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-accent align-baseline" style={{ opacity: n >= total(runs) ? 0 : 1 }} />
      </span>
    </p>
  );
}
