"use client";

import { useEffect, useState } from "react";
import { THEMES } from "@/content/themes";
import { Clock } from "./Clock";
import { toggleTheme } from "./ThemeController";

function setAccent(id: string) {
  const root = document.documentElement;
  if (id === "red") delete root.dataset.accent;
  else root.dataset.accent = id;
  try {
    localStorage.setItem("accent", id);
  } catch {}
  window.dispatchEvent(new CustomEvent("themechange"));
}

export function Footer() {
  const [accent, setState] = useState("red");
  useEffect(() => setState(document.documentElement.dataset.accent ?? "red"), []);
  return (
    <footer className="mt-24 flex items-center justify-between gap-4 border-t border-hairline pt-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center" role="radiogroup" aria-label="Colour theme">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={accent === t.id}
              aria-label={t.label}
              title={t.label}
              onClick={() => {
                setAccent(t.id);
                setState(t.id);
              }}
              className="group grid size-6 place-items-center rounded-full"
            >
              <span
                className="size-3.5 rounded-full transition-transform group-hover:scale-125 group-aria-checked:ring-2 group-aria-checked:ring-ink group-aria-checked:ring-offset-2 group-aria-checked:ring-offset-bg"
                style={{ background: t.swatch }}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={(e) => toggleTheme(e.clientX, e.clientY)}
          className="meta rounded-full bg-surface px-2.5 py-1 hover:text-ink"
          title="or double-click anywhere"
        >
          lights
        </button>
      </div>
      <Clock />
    </footer>
  );
}
