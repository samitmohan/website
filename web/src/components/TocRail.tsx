"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/markdown";

/** Contents pinned in the left margin on wide screens, marking the section in view. */
export function TocRail({ toc }: { toc: Heading[] }) {
  const [current, setCurrent] = useState(toc[0]?.id);
  useEffect(() => {
    const els = toc.map((h) => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];
    const onScroll = () => {
      const line = innerHeight * 0.3;
      let cur = els[0]?.id;
      for (const el of els) if (el.getBoundingClientRect().top <= line) cur = el.id;
      setCurrent(cur);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, [toc]);
  return (
    <aside className="fixed top-32 hidden w-[190px] xl:block" style={{ left: "calc(50% - 310px - 230px)" }} aria-label="Contents">
      <p className="meta">contents</p>
      <ol className="mt-3 space-y-1.5 border-l border-hairline text-[12px] leading-snug">
        {toc.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`-ml-px block border-l pl-3 transition-colors ${current === h.id ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"}`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}
