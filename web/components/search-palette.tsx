"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Entry = { slug: string; title: string; date: string; description: string };

export function SearchPalette({ entries }: { entries: Entry[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (!inField && e.key === "/" && !open) {
        e.preventDefault();
        setOpen(true);
        return;
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10);
      setActive(0);
    } else {
      setQ("");
    }
  }, [open]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return entries.slice(0, 12);
    return entries
      .map((e) => {
        const hay = `${e.title} ${e.description} ${e.slug}`.toLowerCase();
        const score = hay.includes(needle) ? hay.indexOf(needle) : -1;
        return { e, score };
      })
      .filter((r) => r.score >= 0)
      .sort((a, b) => a.score - b.score)
      .slice(0, 12)
      .map((r) => r.e);
  }, [q, entries]);

  useEffect(() => {
    setActive(0);
  }, [q]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4 bg-background/70 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-lg border border-border bg-card shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border px-4">
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((i) => Math.min(results.length - 1, i + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((i) => Math.max(0, i - 1));
              } else if (e.key === "Enter" && results[active]) {
                e.preventDefault();
                router.push(`/blog/${results[active].slug}`);
                setOpen(false);
              }
            }}
            placeholder="Search posts..."
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/60 py-3 text-[14px] outline-none"
          />
        </div>
        <ul className="max-h-[50vh] overflow-y-auto py-1">
          {results.length === 0 && (
            <li className="px-4 py-6 text-center text-[13px] text-muted-foreground">no results</li>
          )}
          {results.map((r, idx) => (
            <li key={r.slug}>
              <Link
                href={`/blog/${r.slug}`}
                onClick={() => setOpen(false)}
                onMouseEnter={() => setActive(idx)}
                className={`block px-4 py-2.5 ${
                  idx === active ? "bg-primary/10" : ""
                }`}
              >
                <div className="text-[14px] text-foreground leading-snug truncate">{r.title}</div>
                {r.description && (
                  <div className="text-[12px] text-muted-foreground leading-snug truncate mt-0.5">
                    {r.description}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
        <div className="border-t border-border px-4 py-2 text-[11px] font-mono text-muted-foreground/70 flex items-center justify-between">
          <span>↑ ↓ to nav · enter to open</span>
          <span>esc · cmd+k</span>
        </div>
      </div>
    </div>
  );
}
