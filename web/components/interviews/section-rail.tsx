"use client";

import { useEffect, useRef, useState } from "react";

/* Sticky section rail for the guide. The sliding highlight - one absolutely
 * positioned pill that animates top/height between entries instead of a
 * background per row - is adapted from Beautiful UI's Sidebar Nav primitive
 * (beautiful-ui-five.vercel.app, built by Turbo).
 *
 * Only renders from xl up, where the centred column leaves a free gutter. The
 * anchor list at the top of the page stays as the narrow-screen fallback. */

export function SectionRail({
  sections,
}: {
  sections: { id: string; title: string }[];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const targets = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    // Track the topmost section intersecting the upper band of the viewport, so
    // the rail marks what you are reading rather than what just scrolled past.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-88px 0px -65% 0px", threshold: 0 }
    );

    for (const el of targets) observer.observe(el);
    return () => observer.disconnect();
  }, [sections]);

  // The highlight is positioned by writing to the node directly. Holding its
  // geometry in state would re-render the whole rail on every hover.
  useEffect(() => {
    const list = listRef.current;
    const box = boxRef.current;
    if (!list || !box) return;

    const key = hovered ?? activeId;
    const target = key
      ? list.querySelector<HTMLElement>(`[data-rail-id="${key}"]`)
      : null;

    if (!target) {
      box.style.opacity = "0";
      return;
    }

    box.style.opacity = "1";
    box.style.top = `${target.offsetTop}px`;
    box.style.height = `${target.offsetHeight}px`;
  }, [hovered, activeId]);

  return (
    <nav
      aria-label="Sections"
      className="fixed top-28 left-[max(1.5rem,calc(50%-38rem))] z-30 hidden w-52 xl:block"
    >
      <div className="mb-2 px-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground/60">
        Sections
      </div>
      <div
        ref={listRef}
        onMouseLeave={() => setHovered(null)}
        className="relative flex flex-col gap-px"
      >
        <span
          ref={boxRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 rounded-md bg-muted opacity-0"
          style={{
            transition:
              "top 220ms var(--motion-ease), height 220ms var(--motion-ease), opacity 150ms ease",
          }}
        />
        {sections.map((s, i) => {
          const isActive = s.id === activeId;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              data-rail-id={s.id}
              onMouseEnter={() => setHovered(s.id)}
              onFocus={() => setHovered(s.id)}
              onBlur={() => setHovered(null)}
              aria-current={isActive ? "true" : undefined}
              className="relative z-10 flex items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px] transition-colors duration-150"
            >
              <span className="font-mono text-[10.5px] tabular-nums text-muted-foreground/40">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={`min-w-0 flex-1 truncate transition-colors duration-150 ${
                  isActive ? "font-medium text-foreground" : "text-muted-foreground"
                }`}
              >
                {s.title}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
