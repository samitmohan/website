"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/*
 * Stand-in drawings until real cut-out photos exist. Flat shapes in fixed
 * colours (objects keep their colour in dark mode), each in a 120x120 box.
 */
const ART = {
  book: (
    <svg viewBox="0 0 120 120">
      <rect x="28" y="12" width="64" height="96" rx="3" fill="#c8562a" />
      <rect x="28" y="12" width="7" height="96" fill="#9e3f1c" />
      <path d="M50 58 L60 44 L70 58 L66 74 L54 74 Z" fill="#f3e3c3" />
      <path d="M50 58 L46 46 L56 52 Z M70 58 L74 46 L64 52 Z" fill="#f3e3c3" />
      <rect x="44" y="84" width="34" height="3" rx="1.5" fill="#f3e3c3" opacity=".8" />
      <rect x="50" y="91" width="22" height="2" rx="1" fill="#f3e3c3" opacity=".6" />
    </svg>
  ),
  vinyl: (
    <svg viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="50" fill="#141414" />
      {[44, 38, 32, 26].map((r) => (
        <circle key={r} cx="60" cy="60" r={r} fill="none" stroke="#2c2c2c" strokeWidth="1" />
      ))}
      <circle cx="60" cy="60" r="16" fill="#d9261c" />
      <circle cx="60" cy="60" r="2.5" fill="#f4efe6" />
      <path d="M30 34 A40 40 0 0 1 52 22" stroke="#fff" strokeOpacity=".18" strokeWidth="3" fill="none" />
    </svg>
  ),
  pencil: (
    <svg viewBox="0 0 120 120">
      <g transform="rotate(-38 60 60)">
        <rect x="20" y="54" width="70" height="12" rx="2" fill="#2b4a7a" />
        <rect x="20" y="54" width="70" height="4" fill="#3b5f96" />
        <rect x="90" y="55" width="10" height="10" fill="#c9c9c9" />
        <path d="M100 56 L110 60 L100 64 Z" fill="#9a9a9a" />
        <rect x="108" y="59.2" width="5" height="1.6" fill="#333" />
        <rect x="12" y="55" width="8" height="10" rx="1" fill="#c9c9c9" />
        <rect x="6" y="56" width="6" height="8" rx="2" fill="#efe6d6" />
      </g>
    </svg>
  ),
  card: (
    <svg viewBox="0 0 120 120">
      <rect x="30" y="14" width="60" height="88" rx="6" fill="#fbf8f2" stroke="#ddd5c6" />
      <text x="37" y="32" fontFamily="Georgia, serif" fontSize="14" fill="#141414">A</text>
      <path d="M60 46 C 52 56, 44 60, 48 68 C 51 73, 57 72, 58 68 L 55 80 L 65 80 L 62 68 C 63 72, 69 73, 72 68 C 76 60, 68 56, 60 46 Z" fill="#141414" />
    </svg>
  ),
  uno: (
    <svg viewBox="0 0 120 120">
      <rect x="32" y="12" width="58" height="90" rx="7" fill="#141414" />
      <rect x="36" y="16" width="50" height="82" rx="5" fill="#d9261c" />
      <ellipse cx="61" cy="57" rx="20" ry="32" transform="rotate(28 61 57)" fill="#fbf8f2" />
      <text x="61" y="66" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="26" fill="#d9261c">+2</text>
    </svg>
  ),
  controller: (
    <svg viewBox="0 0 120 120">
      <path d="M30 44 H90 C102 44 110 56 112 74 C114 90 104 96 96 86 L86 74 H34 L24 86 C16 96 6 90 8 74 C10 56 18 44 30 44 Z" fill="#202024" />
      <rect x="27" y="56" width="4" height="12" rx="1" fill="#6b6b72" />
      <rect x="23" y="60" width="12" height="4" rx="1" fill="#6b6b72" />
      <circle cx="90" cy="54" r="3" fill="#4ecb9b" />
      <circle cx="97" cy="61" r="3" fill="#e05a6a" />
      <circle cx="83" cy="61" r="3" fill="#d58ad6" />
      <circle cx="90" cy="68" r="3" fill="#7aa7e8" />
      <circle cx="48" cy="74" r="7" fill="#2f2f35" />
      <circle cx="72" cy="74" r="7" fill="#2f2f35" />
    </svg>
  ),
  coffee: (
    <svg viewBox="0 0 120 120">
      <ellipse cx="58" cy="94" rx="40" ry="8" fill="#e8e0d2" />
      <path d="M30 50 H86 L80 88 C79 92 76 94 72 94 H44 C40 94 37 92 36 88 Z" fill="#fbf8f2" stroke="#ddd5c6" />
      <path d="M86 58 C98 58 98 76 84 78" fill="none" stroke="#ddd5c6" strokeWidth="5" />
      <ellipse cx="58" cy="50" rx="28" ry="5" fill="#4a2c1a" />
      <path d="M48 40 C44 32 52 28 48 20 M62 38 C58 30 66 26 62 18" stroke="#c9bfae" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  ),
  sneaker: (
    <svg viewBox="0 0 120 120">
      <path d="M12 82 C12 70 20 66 30 62 L52 50 C58 47 62 48 66 52 L80 64 C92 70 106 72 108 82 Z" fill="#141414" />
      <path d="M10 82 H110 V90 C110 93 108 95 105 95 H15 C12 95 10 93 10 90 Z" fill="#f4efe6" />
      <rect x="10" y="86" width="100" height="2" fill="#d9261c" />
      <circle cx="98" cy="84" r="5" fill="#f4efe6" />
      <path d="M44 56 L52 66 M50 52 L58 62 M56 50 L64 58" stroke="#f4efe6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
} as const;

/** Which bullets get a drawing. Matched against the post's own wording. */
const DRAWN: [RegExp, keyof typeof ART][] = [
  [/fantastic mr\. fox/i, "book"],
  [/vinyl/i, "vinyl"],
  [/mechanical pencil/i, "pencil"],
  [/card trick/i, "card"],
  [/\buno\b/i, "uno"],
  [/ps2/i, "controller"],
  [/espresso/i, "coffee"],
  [/chuck taylor/i, "sneaker"],
];

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
