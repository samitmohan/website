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

const R = 76; // arc radius in px, from the knob's centre on the left edge
const ITEM = 28;
// The five colours plus the light switch, spread over a half-wheel from -75deg to 75deg.
const SLOTS = THEMES.length + 1;
const at = (i: number) => {
  const a = ((-75 + (150 * i) / (SLOTS - 1)) * Math.PI) / 180;
  return { x: Math.cos(a) * R - ITEM / 2, y: Math.sin(a) * R - ITEM / 2 };
};

/**
 * The site's colour and light switches as a half-wheel on the left edge. At
 * rest only a knob with the current colour peeks out; hover, focus or tap fans
 * the swatches out around it. Until a visitor flips light and dark once, a
 * note beside the knob says double-click does it.
 */
export function ThemeRail() {
  const [accent, setState] = useState<string>(THEMES[0].id);
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  // The light switch's reveal briefly covers the page with a snapshot; the browser reports that as the
  // pointer leaving the wheel. Ignore leave and blur until the reveal ends.
  const flipping = useRef(false);

  useEffect(() => {
    // A theme saved under an older palette falls back to the default.
    const saved = document.documentElement.dataset.accent;
    setState(saved && THEME_IDS.includes(saved) ? saved : THEMES[0].id);
    try {
      setHint(!localStorage.getItem("theme") && !localStorage.getItem("theme-hint"));
    } catch {}
    const away = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    // Only a light/dark flip carries a detail; colour changes do not retire the note.
    const flipped = (e: Event) => {
      if (!(e as CustomEvent).detail) return;
      setHint(false);
      try {
        localStorage.setItem("theme-hint", "seen");
      } catch {}
    };
    addEventListener("pointerdown", away);
    addEventListener("themechange", flipped);
    return () => {
      removeEventListener("pointerdown", away);
      removeEventListener("themechange", flipped);
    };
  }, []);

  const current = THEMES.find((t) => t.id === accent) ?? THEMES[0];
  const item = (i: number) => ({
    transform: open ? `translate(${at(i).x}px, ${at(i).y}px) scale(1)` : `translate(${-ITEM / 2}px, ${-ITEM / 2}px) scale(.3)`,
    opacity: open ? 1 : 0,
    transitionDelay: open ? `${i * 35}ms` : "0ms",
  });
  const fan = "absolute top-0 left-0 transition-[transform,opacity] duration-500 ease-[cubic-bezier(.16,1,.3,1)]";

  return (
    <div
      ref={ref}
      data-no-theme
      className="fixed top-1/2 left-0 z-40 size-0"
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && !flipping.current && setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => !flipping.current && !e.currentTarget.contains(e.relatedTarget as Node) && setOpen(false)}
    >
      {/* the disc the wheel sits on; it also keeps the hover alive between swatches */}
      <div
        className={`absolute rounded-full bg-surface shadow-[var(--shadow-card)] transition-[transform,opacity] duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${open ? "" : "pointer-events-none"}`}
        style={{ width: 2 * (R + 26), height: 2 * (R + 26), left: -(R + 26), top: -(R + 26), transform: `scale(${open ? 1 : 0.2})`, opacity: open ? 1 : 0 }}
      />

      <div role="radiogroup" aria-label="Site colour">
        {THEMES.map((t, i) => (
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
            className={`group grid size-7 place-items-center rounded-full ${fan} ${open ? "" : "pointer-events-none"}`}
            style={item(i)}
          >
            <span
              className="size-4 rounded-full transition-transform group-hover:scale-125"
              style={{
                background: t.swatch,
                // A ring in the text colour keeps the black swatch visible on a dark disc.
                boxShadow: accent === t.id ? "0 0 0 2px var(--surface), 0 0 0 3.5px var(--ink)" : "0 0 0 1px color-mix(in srgb, var(--ink) 35%, transparent)",
              }}
            />
            {/* The colour's name slides out beside it on hover or keyboard focus. */}
            <span className="pointer-events-none absolute top-1/2 left-full ml-2 -translate-x-1 -translate-y-1/2 rounded-full bg-ink px-2.5 py-1 font-mono text-[11px] whitespace-nowrap text-bg opacity-0 transition-[opacity,translate] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
              {t.label}
            </span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={(e) => {
          flipping.current = true;
          Promise.resolve(toggleTheme(e.clientX, e.clientY)).finally(() => (flipping.current = false));
        }}
        aria-label="switch light and dark"
        title="lights (or double-click anywhere)"
        tabIndex={open ? 0 : -1}
        className={`grid size-7 place-items-center rounded-full text-ink hover:bg-surface-2 ${fan} ${open ? "" : "pointer-events-none"}`}
        style={item(THEMES.length)}
      >
        <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
          <path d="M8 1.5a6.5 6.5 0 1 0 0 13z" fill="currentColor" />
          <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>

      {/* the knob that peeks out at rest */}
      <button
        type="button"
        aria-label="colour and light switches"
        aria-expanded={open}
        // A mouse has already opened the wheel by hovering, so its click only keeps it open; a tap toggles.
        onClick={(e) => setOpen((o) => ((e.nativeEvent as PointerEvent).pointerType === "mouse" ? true : !o))}
        className="absolute top-0 left-0 grid h-14 w-7 -translate-y-1/2 place-items-center rounded-r-full bg-surface shadow-[var(--shadow-card)]"
      >
        <span className="-ml-1 size-3 rounded-full" style={{ background: current.swatch, boxShadow: "inset 0 0 0 1px var(--hairline)" }} />
      </button>

      {/* Mouse and trackpad only: double-tap on phones is not a dependable gesture. */}
      <p
        aria-hidden
        className={`theme-hint pointer-events-none absolute top-9 left-10 hidden w-40 -rotate-3 font-serif text-[15px] leading-tight text-muted italic transition-opacity duration-300 lg:block [@media(pointer:coarse)]:!hidden ${hint && !open ? "opacity-100" : "opacity-0"}`}
      >
        <svg viewBox="0 0 40 24" className="mb-1 -ml-4 h-5 w-9 text-muted" aria-hidden>
          <path d="M38 22C26 22 12 18 4 4M4 4l1 7M4 4l7 2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        double-click anywhere to flip black and white
      </p>
    </div>
  );
}
