"use client";

import { useEffect, useState } from "react";
import { THEMES } from "@/content/themes";
import { Clock } from "./Clock";
import { Garden, PALETTES } from "./Garden";
import { toggleTheme } from "./ThemeController";
import { WhenNear } from "./WhenNear";

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
  const [palette, setPalette] = useState(0);
  const [clearKey, setClearKey] = useState(0);
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    setState(document.documentElement.dataset.accent ?? "red");
    try {
      const saved = Number(localStorage.getItem("garden"));
      if (saved > 0 && saved < PALETTES.length) setPalette(saved);
    } catch {}
  }, []);
  const pickPalette = (i: number) => {
    setPalette(i);
    try {
      localStorage.setItem("garden", String(i));
    } catch {}
  };

  const [, bg, , , , ink] = PALETTES[palette];
  const chip = "rounded-full px-2.5 py-1 font-mono text-[12px] transition-colors";

  return (
    <footer className="mt-28 transition-colors duration-500" style={{ background: bg, color: ink }}>
      <div className="relative">
        <WhenNear className="h-[260px] sm:h-[340px]" margin="200px">
          <Garden text="samit mohan" palette={palette} clearKey={clearKey} onGrow={() => setGrown(true)} />
        </WhenNear>
        <p
          className="pointer-events-none absolute bottom-3 left-4 font-mono text-[12px] transition-opacity duration-700"
          style={{ opacity: grown ? 0 : 0.7 }}
          aria-hidden
        >
          move over the sticker · click for a butterfly
        </p>
      </div>

      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 pt-2 pb-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center" role="radiogroup" aria-label="Site colour">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={accent === t.id}
                aria-label={`site colour: ${t.label}`}
                title={`site colour: ${t.label}`}
                onClick={() => {
                  setAccent(t.id);
                  setState(t.id);
                }}
                className="group grid size-6 place-items-center rounded-full"
              >
                <span
                  className="size-3.5 rounded-full transition-transform group-hover:scale-125 group-aria-checked:ring-2 group-aria-checked:ring-current group-aria-checked:ring-offset-1"
                  style={{ background: t.swatch, ["--tw-ring-offset-color" as string]: bg }}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={(e) => toggleTheme(e.clientX, e.clientY)}
            className={chip}
            style={{ border: `1px solid color-mix(in srgb, ${ink} 35%, transparent)` }}
            title="or double-click anywhere"
          >
            lights
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1 rounded-full px-1.5 py-1"
            style={{ border: `1px solid color-mix(in srgb, ${ink} 35%, transparent)` }}
            role="radiogroup"
            aria-label="Garden colours"
          >
            {PALETTES.map((p, i) => (
              <button
                key={p[0]}
                type="button"
                role="radio"
                aria-checked={palette === i}
                aria-label={p[0]}
                title={p[0]}
                onClick={() => pickPalette(i)}
                className="grid size-6 place-items-center rounded-full transition-transform hover:scale-110 aria-checked:scale-110"
                style={{ background: p[1], border: `${palette === i ? 2.5 : 1.5}px solid #111` }}
              >
                <span className="size-2.5 rounded-full" style={{ background: p[2] }} />
              </button>
            ))}
          </div>
          <button
            type="button"
            className={chip}
            style={{ border: `1px solid color-mix(in srgb, ${ink} 35%, transparent)` }}
            onClick={() => {
              setClearKey((k) => k + 1);
              setGrown(false);
            }}
          >
            clear
          </button>
        </div>

        <span className="font-mono text-[12px] opacity-75">
          <Clock bare />
        </span>
      </div>
    </footer>
  );
}
