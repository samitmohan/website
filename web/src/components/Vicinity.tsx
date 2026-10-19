"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ART, DRAWN } from "./things-art";

/** The rest are paper scraps with the bullet written on them. */
const PAPERS = [
  "bg-[#fff3a8] text-[#1b1b1b]", // sticky note
  "bg-[#fbf8f2] text-[#1b1b1b] border border-[#ddd5c6]", // index card
  "bg-[#f2e3c6] text-[#3a2a14] [clip-path:polygon(0_0,100%_0,100%_100%,8%_100%,0_88%)]", // ticket stub
  "bg-[#dfe9f2] text-[#1b2a3a]", // blue note
];

type Item = { text: string; art?: keyof typeof ART; img?: string };

/** Slots around the title, as % of the scene box: three left, three right. */
const SLOTS = [
  { x: 8, y: 10, r: -8 },
  { x: 2, y: 52, r: 6 },
  { x: 20, y: 72, r: -4 },
  { x: 72, y: 6, r: 7 },
  { x: 84, y: 44, r: -6 },
  { x: 68, y: 70, r: 5 },
];

/**
 * Objects around a centred title. They bob, lean away from the cursor, show
 * a caption on hover, and "shuffle" swaps in a different six.
 */
export function Vicinity({ things, photos = {} }: { things: string[]; photos?: Record<string, string> }) {
  const [round, setRound] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);

  // One fixed deck: the drawn things open the first hand, then the rest in a
  // shuffled but stable order. Shuffle deals the next six, so every bullet is
  // seen once before anything comes round again.
  const deck = useMemo(() => {
    const items: Item[] = things.map((text) => ({
      text,
      art: DRAWN.find(([re]) => re.test(text))?.[1],
      img: photos[text],
    }));
    const drawn = items.filter((t) => t.art || t.img);
    const rest = items.filter((t) => !t.art && !t.img);
    let s = 7;
    for (let i = rest.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    // Leftover drawings go one every fifth slot, so later hands are not all paper.
    const mixed = [...rest];
    drawn.slice(SLOTS.length).forEach((t, k) => mixed.splice(Math.min(mixed.length, k * 5 + 2), 0, t));
    return [...drawn.slice(0, SLOTS.length), ...mixed];
  }, [things, photos]);
  const hands = Math.ceil(deck.length / SLOTS.length);
  const shown = SLOTS.map((_, i) => deck[((round % hands) * SLOTS.length + i) % deck.length]);

  useEffect(() => {
    const el = box.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-thing]"));
    const off = items.map(() => ({ x: 0, y: 0 }));
    const goal = items.map(() => ({ x: 0, y: 0 }));
    let raf = 0;
    const onMove = (e: PointerEvent) =>
      items.forEach((it, i) => {
        const r = it.getBoundingClientRect();
        const dx = r.left + r.width / 2 - e.clientX, dy = r.top + r.height / 2 - e.clientY, d = Math.hypot(dx, dy);
        const push = d < 240 ? (1 - d / 240) * 30 : 0;
        goal[i] = { x: (dx / (d || 1)) * push, y: (dy / (d || 1)) * push };
      });
    const loop = () => {
      items.forEach((it, i) => {
        off[i].x += (goal[i].x - off[i].x) * 0.08;
        off[i].y += (goal[i].y - off[i].y) * 0.08;
        it.style.translate = `${off[i].x.toFixed(2)}px ${off[i].y.toFixed(2)}px`;
      });
      raf = requestAnimationFrame(loop);
    };
    addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [round]);

  return (
    <div ref={box} className="relative h-[420px] sm:h-[460px] md:-mx-24">
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <h2 className="font-serif text-[clamp(40px,7vw,64px)] leading-[0.95] font-normal">
            Things
            <br />I like
          </h2>
          <button type="button" className="pill mt-5 bg-bg" onClick={() => setRound((r) => r + 1)}>
            shuffle
          </button>
          <p aria-live="polite" className="mx-auto mt-3 min-h-[2.6em] max-w-[24ch] font-serif text-[15px] leading-tight text-muted italic">
            {hover === null ? "hover over the things" : shown[hover].text}
          </p>
        </div>
      </div>
      {shown.map((t, i) => {
        const s = SLOTS[i];
        return (
          <div
            key={`${round}-${i}-${t.text}`}
            data-thing
            className="absolute w-[clamp(72px,14vw,118px)]"
            style={{ left: `${s.x}%`, top: `${s.y}%`, animation: `vic-in .7s cubic-bezier(.16,1,.3,1) ${i * 0.06}s both, vic-bob 7s ease-in-out ${-i * 1.3}s infinite` }}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            tabIndex={0}
            role="img"
            aria-label={t.text}
          >
            <div
              className="transition-transform duration-300 hover:scale-110 hover:!rotate-0 [&>svg]:w-full [&>svg]:drop-shadow-[0_10px_12px_rgba(0,0,0,.25)]"
              style={{ rotate: `${s.r}deg` }}
              title={t.text}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {t.img ? <img src={t.img} alt={t.text} className="w-full drop-shadow-[0_10px_12px_rgba(0,0,0,.25)]" /> : t.art ? ART[t.art] : (
                <span
                  className={`flex aspect-square w-full items-center p-2.5 font-serif text-[clamp(10px,1.4vw,13px)] leading-tight italic shadow-[0_10px_14px_-6px_rgba(0,0,0,.3)] ${PAPERS[t.text.length % PAPERS.length]}`}
                >
                  <span className="line-clamp-5">{t.text}</span>
                </span>
              )}
            </div>
          </div>
        );
      })}
      <style>{`@keyframes vic-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}@keyframes vic-in{from{opacity:0;scale:.6;filter:blur(8px)}to{opacity:1;scale:1;filter:blur(0)}}`}</style>
    </div>
  );
}
