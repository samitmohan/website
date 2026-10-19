"use client";

import { useEffect, useState } from "react";
import { Clock } from "./Clock";
import { Garden, PALETTES } from "./Garden";
import { WhenNear } from "./WhenNear";

export function Footer() {
  const [palette, setPalette] = useState(0);
  const [clearKey, setClearKey] = useState(0);
  useEffect(() => {
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
          <Garden text="samit mohan" palette={palette} clearKey={clearKey} />
        </WhenNear>
      </div>

      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 pt-2 pb-6">
        <div className="flex flex-wrap items-center gap-2">
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
            onClick={() => setClearKey((k) => k + 1)}
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
