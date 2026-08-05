"use client";

import { useEffect, useRef } from "react";

const THEMES = ["charm", "dusk"] as const;
type Theme = (typeof THEMES)[number];

// Two color palettes for the /fun section: warm olive "charm" (default) and
// dusky mauve/plum "dusk". Persists the choice in localStorage and applies it
// as data-fun-theme on the nearest .candy wrapper (which the scoped CSS reads).
// DOM-driven (no React state) so the stored choice can sync after mount without
// a hydration mismatch.
export function FunThemeToggle() {
  const ref = useRef<HTMLDivElement>(null);

  function apply(t: Theme) {
    const root = ref.current;
    if (!root) return;
    root.closest(".candy")?.setAttribute("data-fun-theme", t);
    root.querySelectorAll<HTMLButtonElement>(".fun-swatch").forEach((b) => {
      const on = b.dataset.theme === t;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", String(on));
    });
  }

  useEffect(() => {
    const saved = localStorage.getItem("fun-theme");
    apply(saved === "dusk" ? "dusk" : "charm");
  }, []);

  return (
    <div className="fun-swatches" ref={ref} role="group" aria-label="color palette">
      {THEMES.map((t) => (
        <button
          key={t}
          type="button"
          data-theme={t}
          onClick={() => {
            localStorage.setItem("fun-theme", t);
            apply(t);
          }}
          aria-pressed={t === "charm"}
          aria-label={`${t} palette`}
          title={`${t} palette`}
          className={`fun-swatch fun-swatch-${t}${t === "charm" ? " is-on" : ""}`}
        />
      ))}
    </div>
  );
}
