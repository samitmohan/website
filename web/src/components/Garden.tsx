"use client";

import { useEffect, useRef } from "react";

/**
 * Footer palettes, each named after something that flowers or happens in
 * Bangalore. [name, background, petal, stem, highlight, ink].
 */
export const PALETTES = [
  ["tabebuia", "#f6efe6", "#e46aa3", "#2f5d3a", "#f7d14a", "#141414"],
  ["gulmohar", "#f4ede2", "#e8452c", "#1f4d33", "#ffd166", "#141414"],
  ["jacaranda", "#efeaf6", "#7b5cc9", "#2e5a3c", "#f4e3a1", "#141414"],
  ["copper pod", "#1b1a12", "#f2b705", "#7cc47f", "#fff3c4", "#f6f1e7"],
  ["night jasmine", "#0f1a33", "#f7f3ea", "#7fb3a0", "#f28c28", "#ffffff"],
  ["cubbon", "#1e3b2c", "#ffb3c7", "#a6d49f", "#ffe08a", "#f6f1e7"],
  ["bougainvillea", "#fbe3ec", "#c2185b", "#26532f", "#fff0f5", "#1a1a1a"],
  ["monsoon", "#dce5ea", "#2f6fb0", "#2d4a3a", "#f4d35e", "#142028"],
  ["filter coffee", "#2b1d14", "#f2a65a", "#8cb369", "#fbe7c6", "#fbe7c6"],
  ["mono", "#111111", "#f2f2f2", "#8a8a8a", "#111111", "#ffffff"],
] as const;

type Flower = {
  id: number;
  o: [number, number];
  c: [number, number];
  t: [number, number];
  born: number;
  size: number;
  spin: number;
  front: boolean;
  leaves: number[];
};
type Fly = { id: number; x: number; y: number; tx: number; ty: number; born: number; target: number; leaving: boolean; size: number };

const GROW = 700;
const MAX = 200;
const FRAME = 120; // the boil: everything redraws on a new jitter every 120ms

/** Damped spring from 0 to 1 with a little overshoot. */
const spring = (t: number, k = 6, w = 14) => (t <= 0 ? 0 : 1 - Math.exp(-t * k) * Math.cos(t * w));
/** Repeatable noise in [-1, 1] for an element id and frame. */
const noise = (id: number, f: number, salt: number) => {
  const x = Math.sin(id * 12.9898 + f * 78.233 + salt * 37.719) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};

/**
 * A name on a sticker. Moving over it grows flowering stems from its edges;
 * clicking calls in a butterfly that settles on a flower. Lines boil like a
 * hand-drawn loop and blossoms sway. Canvas 2D, and it only animates while on
 * screen.
 */
export function Garden({ text, palette, clearKey, onGrow }: { text: string; palette: number; clearKey: number; onGrow?: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const flowers = useRef<Flower[]>([]);
  const flies = useRef<Fly[]>([]);
  const pal = useRef(palette);
  pal.current = palette;
  const grew = useRef(onGrow);
  grew.current = onGrow;
  const repaint = useRef<() => void>(() => {});

  // A clear or a palette change repaints at once, even when nothing is animating.
  useEffect(() => {
    flowers.current = [];
    flies.current = [];
    repaint.current();
  }, [clearKey]);
  useEffect(() => repaint.current(), [palette]);

  useEffect(() => {
    const c = ref.current!;
    const g = c.getContext("2d")!;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, dpr = 1, raf = 0, on = false, uid = 1, lastFrame = -1;
    let box = { x: 0, y: 0, w: 0, h: 0 };
    let font = "Georgia";
    let last: [number, number] | null = null;

    const resize = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      W = c.clientWidth;
      H = c.clientHeight;
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
      const bw = Math.min(520, W * 0.8), bh = Math.min(150, bw * 0.3);
      box = { x: (W - bw) / 2, y: (H - bh) / 2, w: bw, h: bh };
      lastFrame = -1;
    };

    const edge = (x: number, y: number): [number, number] => {
      const inside = x > box.x && x < box.x + box.w && y > box.y && y < box.y + box.h;
      if (!inside) return [Math.max(box.x, Math.min(box.x + box.w, x)), Math.max(box.y, Math.min(box.y + box.h, y))];
      const d = [x - box.x, box.x + box.w - x, y - box.y, box.y + box.h - y];
      const m = d.indexOf(Math.min(...d));
      return m === 0 ? [box.x, y] : m === 1 ? [box.x + box.w, y] : m === 2 ? [x, box.y] : [x, box.y + box.h];
    };

    const grow = (x: number, y: number) => {
      const o = edge(x, y);
      const dx = x - o[0], dy = y - o[1], len = Math.hypot(dx, dy) || 1;
      const reach = 16 + Math.random() * 30;
      const t: [number, number] = [x + (dx / len) * reach + (Math.random() - 0.5) * 18, y + (dy / len) * reach + (Math.random() - 0.5) * 18];
      const ctl: [number, number] = [(o[0] + t[0]) / 2 + (Math.random() - 0.5) * 70, (o[1] + t[1]) / 2 + (Math.random() - 0.5) * 70];
      flowers.current.push({
        id: uid++,
        o,
        c: ctl,
        t,
        born: performance.now(),
        size: 9 + Math.random() * 10,
        spin: Math.random() * Math.PI,
        front: Math.random() < 0.2,
        leaves: [0.28 + Math.random() * 0.15, 0.55 + Math.random() * 0.2],
      });
      while (flowers.current.length > MAX) flowers.current.shift();
      grew.current?.();
    };

    const callButterfly = () => {
      const open = flowers.current.filter((f) => performance.now() - f.born > GROW && !flies.current.some((b) => b.target === f.id && !b.leaving));
      if (!open.length) return;
      const f = open[Math.floor(Math.random() * open.length)];
      if (flies.current.filter((b) => !b.leaving).length >= 5) flies.current.find((b) => !b.leaving)!.leaving = true;
      const left = Math.random() < 0.5;
      flies.current.push({ id: uid++, x: left ? -30 : W + 30, y: H * (0.2 + Math.random() * 0.6), tx: f.t[0], ty: f.t[1] - 4, born: performance.now(), target: f.id, leaving: false, size: 16 + Math.random() * 6 });
    };

    const bez = (f: Flower, u: number): [number, number] => {
      const a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, d = u * u;
      return [a * f.o[0] + b * f.c[0] + d * f.t[0], a * f.o[1] + b * f.c[1] + d * f.t[1]];
    };

    const paint = (now: number) => {
      const [, bg, petal, stem, hi, ink] = PALETTES[pal.current];
      const frame = still ? 0 : Math.floor(now / FRAME);
      const amp = still ? 0 : 0.9;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = bg;
      g.fillRect(0, 0, W, H);

      const flower = (f: Flower) => {
        const age = still ? GROW * 2 : now - f.born;
        const p = Math.min(1, spring(age / GROW, 5, 6));
        const jx = (id: number, s: number) => noise(id, frame, s) * amp;
        g.strokeStyle = stem;
        g.lineWidth = 2.4;
        g.lineCap = "round";
        g.beginPath();
        const steps = 20;
        for (let i = 0; i <= Math.round(steps * Math.min(1, p)); i++) {
          const [x, y] = bez(f, i / steps);
          const jj = i === 0 ? 0 : 1;
          if (i === 0) g.moveTo(x, y);
          else g.lineTo(x + jx(f.id * 31 + i, 1) * jj, y + jx(f.id * 31 + i, 2) * jj);
        }
        g.stroke();
        for (const lu of f.leaves) {
          if (p < lu) continue;
          const [x, y] = bez(f, lu), [x2, y2] = bez(f, lu + 0.02);
          const grown = Math.min(1, spring((age - GROW * lu) / 300));
          g.save();
          g.translate(x, y);
          g.rotate(Math.atan2(y2 - y, x2 - x) + (lu > 0.5 ? 0.9 : -0.9) + jx(f.id, 7) * 0.06);
          g.scale(grown, grown);
          g.fillStyle = stem;
          g.beginPath();
          g.ellipse(8, 0, 9, 3.6, 0, 0, Math.PI * 2);
          g.fill();
          g.restore();
        }
        if (age > GROW * 0.85) {
          const open = spring((age - GROW * 0.85) / 420, 5, 11);
          const sway = still ? 0 : Math.sin(now / 900 + f.id) * 0.08;
          const s = f.size * open;
          g.save();
          g.translate(f.t[0] + jx(f.id, 3), f.t[1] + jx(f.id, 4));
          g.rotate(f.spin + sway);
          // Five ruffled petals, the trumpet-flower shape of a tabebuia from above.
          g.fillStyle = petal;
          for (let k = 0; k < 5; k++) {
            g.rotate((Math.PI * 2) / 5);
            g.beginPath();
            g.moveTo(0, 0);
            g.quadraticCurveTo(s * 0.55, -s * 0.62, s * 1.02, -s * 0.12);
            g.quadraticCurveTo(s * 1.12, s * 0.18, s * 0.86, s * 0.32);
            g.quadraticCurveTo(s * 0.5, s * 0.5, 0, 0);
            g.fill();
          }
          g.strokeStyle = hi;
          g.lineWidth = 1.1;
          for (let k = 0; k < 5; k++) {
            g.rotate((Math.PI * 2) / 5);
            g.beginPath();
            g.moveTo(s * 0.22, 0);
            g.quadraticCurveTo(s * 0.5, -s * 0.12, s * 0.7, 0.02 * s);
            g.stroke();
          }
          g.fillStyle = hi;
          g.beginPath();
          g.arc(0, 0, s * 0.2, 0, Math.PI * 2);
          g.fill();
          g.restore();
        }
      };

      const sticker = () => {
        const j = (s: number) => noise(0, frame, s) * amp * 0.6;
        g.lineWidth = 5;
        g.strokeStyle = ink;
        g.fillStyle = bg;
        g.beginPath();
        g.roundRect(box.x + j(1), box.y + j(2), box.w + j(3), box.h + j(4), 18);
        g.fill();
        g.stroke();
        g.fillStyle = ink;
        g.textAlign = "center";
        g.textBaseline = "middle";
        let size = box.h * 0.72;
        g.font = `${size}px ${font}`;
        while (g.measureText(text).width > box.w * 0.86 && size > 10) {
          size -= 2;
          g.font = `${size}px ${font}`;
        }
        g.fillText(text, box.x + box.w / 2 + j(5), box.y + box.h / 2 + size * 0.05 + j(6));
      };

      const butterflies = () => {
        flies.current = flies.current.filter((b) => {
          const t = (now - b.born) / 1000;
          if (b.leaving) {
            b.x += (b.x < W / 2 ? -1 : 1) * 4;
            b.y -= 1.5;
          } else {
            b.x += (b.tx - b.x) * 0.05 + Math.sin(t * 6 + b.id) * 0.8;
            b.y += (b.ty - b.y) * 0.05 + Math.cos(t * 5 + b.id) * 0.8;
          }
          const settled = !b.leaving && Math.hypot(b.tx - b.x, b.ty - b.y) < 3;
          const flap = still ? 0.6 : settled ? 0.55 + Math.sin(now / 420 + b.id) * 0.25 : 0.5 + Math.sin(now / 70 + b.id) * 0.5;
          g.save();
          g.translate(b.x, b.y);
          g.fillStyle = ink;
          for (const side of [-1, 1]) {
            g.save();
            g.scale(side * (0.25 + flap * 0.75), 1);
            g.beginPath();
            g.ellipse(b.size * 0.55, -b.size * 0.25, b.size * 0.6, b.size * 0.42, -0.5, 0, Math.PI * 2);
            g.ellipse(b.size * 0.45, b.size * 0.32, b.size * 0.38, b.size * 0.3, 0.5, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = petal;
            g.beginPath();
            g.arc(b.size * 0.7, -b.size * 0.32, b.size * 0.13, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = ink;
            g.restore();
          }
          g.fillRect(-1, -b.size * 0.4, 2, b.size * 0.8);
          g.restore();
          return b.x > -60 && b.x < W + 60 && b.y > -60;
        });
      };

      for (const f of flowers.current) if (!f.front) flower(f);
      sticker();
      for (const f of flowers.current) if (f.front) flower(f);
      butterflies();
    };

    const loop = (now: number) => {
      raf = 0;
      if (!on) return;
      const frame = Math.floor(now / FRAME);
      const busy = flowers.current.some((f) => now - f.born < GROW * 2.2) || flies.current.length > 0;
      // Growth and butterflies need every frame; the resting boil only needs a new frame every 120ms.
      if (busy || frame !== lastFrame) {
        paint(now);
        lastFrame = frame;
      }
      if (!still) raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (last && Math.hypot(x - last[0], y - last[1]) < 24) return;
      last = [x, y];
      grow(x, y);
      if (still) paint(performance.now());
    };
    const onClick = () => {
      callButterfly();
      if (still) paint(performance.now());
    };

    repaint.current = () => paint(performance.now());
    font = getComputedStyle(document.documentElement).getPropertyValue("--font-instrument").trim() || "Georgia";
    resize();
    paint(performance.now());
    document.fonts?.ready.then(() => paint(performance.now()));
    const ro = new ResizeObserver(() => {
      resize();
      paint(performance.now());
    });
    ro.observe(c);
    const io = new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
      if (on) start();
    });
    io.observe(c);
    c.addEventListener("pointermove", onMove);
    c.addEventListener("pointerleave", () => (last = null));
    c.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      c.removeEventListener("pointermove", onMove);
      c.removeEventListener("click", onClick);
    };
  }, [text]);

  return (
    <canvas
      ref={ref}
      className="block h-[260px] w-full cursor-crosshair touch-pan-y sm:h-[340px]"
      aria-label={`"${text}" on a sticker. Move over it and flowers grow out of the edges; click for a butterfly.`}
    />
  );
}
