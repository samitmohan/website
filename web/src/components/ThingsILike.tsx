"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type Thing = { label: string; kind: string; glyph: string };

/**
 * Small objects that bob in place and lean away from the cursor, with a
 * shuffle button. Each one is a link into the shelf.
 */
export function ThingsILike({ things, show = 6 }: { things: Thing[]; show?: number }) {
  const [seed, setSeed] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const picked = shuffle(things, seed).slice(0, show);

  useEffect(() => {
    const el = box.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-thing]"));
    const off = items.map(() => ({ x: 0, y: 0 }));
    const goal = items.map(() => ({ x: 0, y: 0 }));
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      items.forEach((it, i) => {
        const r = it.getBoundingClientRect();
        const dx = r.left + r.width / 2 - e.clientX, dy = r.top + r.height / 2 - e.clientY;
        const d = Math.hypot(dx, dy);
        const push = d < 240 ? (1 - d / 240) * 26 : 0;
        goal[i] = { x: (dx / (d || 1)) * push, y: (dy / (d || 1)) * push };
      });
    };
    const loop = () => {
      items.forEach((it, i) => {
        off[i].x += (goal[i].x - off[i].x) * 0.08;
        off[i].y += (goal[i].y - off[i].y) * 0.08;
        it.style.translate = `${off[i].x.toFixed(2)}px ${off[i].y.toFixed(2)}px`;
      });
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [seed]);

  return (
    <div>
      <div ref={box} className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {picked.map((t, i) => (
          <Link
            key={t.label + seed}
            href="/shelf"
            data-thing
            className="group flex flex-col items-center gap-2 rounded-2xl p-2 text-center"
            style={{ animation: `bob 7s ease-in-out ${-i * 1.3}s infinite` }}
          >
            <span className="grid size-14 place-items-center rounded-full bg-surface text-2xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
              {t.glyph}
            </span>
            <span className="text-[12px] leading-tight text-ink">{t.label}</span>
            <span className="meta -mt-1.5 text-[10px]">{t.kind}</span>
          </Link>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <button type="button" className="oval" onClick={() => setSeed((s) => s + 1)}>
          shuffle
        </button>
      </div>
      <style>{`@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}

function shuffle<T>(xs: T[], seed: number): T[] {
  if (seed === 0) return xs;
  const a = xs.slice();
  let s = seed * 9301 + 49297;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
