"use client";

import { useEffect, useRef, useState } from "react";
import { THEME_IDS, THEMES } from "@/content/themes";
import { toggleTheme } from "./ThemeController";

function setAccent(id: string) {
  const root = document.documentElement;
  if (id === THEMES[0].id) delete root.dataset.accent;
  else root.dataset.accent = id;
  try {
    localStorage.setItem("accent", id);
  } catch {}
  window.dispatchEvent(new CustomEvent("themechange"));
}

/**
 * The site's colour and light switches, on a rail tucked into the left edge.
 * At rest only a tab with the current colour shows; hover, focus or tap slides
 * the rail out.
 */
export function ThemeRail() {
  const [accent, setState] = useState<string>(THEMES[0].id);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // A theme saved under an older palette falls back to the default.
    const saved = document.documentElement.dataset.accent;
    setState(saved && THEME_IDS.includes(saved) ? saved : THEMES[0].id);
    const away = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    addEventListener("pointerdown", away);
    return () => removeEventListener("pointerdown", away);
  }, []);

  const current = THEMES.find((t) => t.id === accent) ?? THEMES[0];
  return (
    <div
      ref={ref}
      data-no-theme
      className="fixed top-1/2 left-0 z-40 -translate-y-1/2"
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setOpen(false)}
    >
      <div
        className="flex items-center transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
        style={{ transform: open ? "translateX(0)" : "translateX(calc(-100% + 26px))" }}
      >
        <div
          className="flex flex-col items-center gap-1 rounded-r-2xl bg-surface py-2.5 pr-1.5 pl-2 shadow-[var(--shadow-card)] transition-opacity duration-300"
          style={{ opacity: open ? 1 : 0 }}
          role="radiogroup"
          aria-label="Site colour"
        >
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={accent === t.id}
              aria-label={`site colour: ${t.label}`}
              tabIndex={open || accent === t.id ? 0 : -1}
              onClick={() => {
                setAccent(t.id);
                setState(t.id);
              }}
              className="group relative grid size-7 place-items-center rounded-full"
            >
              <span
                className="size-4 rounded-full transition-transform group-hover:scale-125"
                style={{
                  background: t.swatch,
                  // A hairline keeps the black swatch visible on a dark rail.
                  boxShadow: accent === t.id ? "0 0 0 2px var(--surface), 0 0 0 3.5px var(--ink)" : "inset 0 0 0 1px var(--hairline)",
                }}
              />
              {/* The colour's name slides out beside it on hover or keyboard focus. */}
              <span className="pointer-events-none absolute top-1/2 left-full ml-3 -translate-x-1 -translate-y-1/2 rounded-full bg-ink px-2.5 py-1 font-mono text-[11px] whitespace-nowrap text-bg opacity-0 transition-[opacity,translate] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
                {t.label}
              </span>
            </button>
          ))}
          <span className="my-1 h-px w-5 bg-hairline" />
          <button
            type="button"
            onClick={(e) => toggleTheme(e.clientX, e.clientY)}
            aria-label="switch light and dark"
            title="lights (or double-click anywhere)"
            className="grid size-7 place-items-center rounded-full text-ink hover:bg-surface-2"
          >
            <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
              <path d="M8 1.5a6.5 6.5 0 1 0 0 13z" fill="currentColor" />
              <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </div>
        {/* the tab that peeks out at rest */}
        <button
          type="button"
          aria-label="colour and light switches"
          aria-expanded={open}
          // A mouse has already opened the rail by hovering, so its click only keeps it open; a tap toggles.
          onClick={(e) => setOpen((o) => ((e.nativeEvent as PointerEvent).pointerType === "mouse" ? true : !o))}
          className="-ml-px grid h-14 w-[26px] place-items-center rounded-r-xl bg-surface shadow-[var(--shadow-card)]"
        >
          <span className="h-6 w-1.5 rounded-full" style={{ background: current.swatch }} />
        </button>
      </div>
    </div>
  );
}
