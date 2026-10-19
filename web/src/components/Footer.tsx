"use client";

import { useEffect, useState } from "react";
import { Garden, type GrowMode } from "./Garden";
import { WhenNear } from "./WhenNear";
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
  const [mode, setMode] = useState<GrowMode>("flowers");
  const [clearKey, setClearKey] = useState(0);
  useEffect(() => setState(document.documentElement.dataset.accent ?? "red"), []);
  return (
    <footer className="mt-28 bg-surface">
      <WhenNear className="h-[260px] sm:h-[340px]" margin="200px">
        <Garden text="samit mohan" mode={mode} clearKey={clearKey} />
      </WhenNear>
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 pb-6">
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
          className="meta rounded-full bg-bg px-2.5 py-1 hover:text-ink"
          title="or double-click anywhere"
        >
          lights
        </button>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="flex rounded-full bg-bg p-0.5" role="radiogroup" aria-label="What grows">
          {(["flowers", "network"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => setMode(m)}
              className={`meta rounded-full px-2.5 py-1 transition-colors ${mode === m ? "bg-ink !text-bg" : "hover:text-ink"}`}
            >
              {m}
            </button>
          ))}
        </div>
        <button type="button" className="meta rounded-full bg-bg px-2.5 py-1 hover:text-ink" onClick={() => setClearKey((k) => k + 1)}>
          clear
        </button>
      </div>
      <Clock />
      </div>
    </footer>
  );
}
