"use client";

import { useEffect, useRef } from "react";

export type GrowMode = "flowers" | "network";

type Flower = {
  kind: "flower";
  o: [number, number]; // origin on the sticker's edge
  c: [number, number]; // bezier control
  t: [number, number]; // tip, near where the pointer was
  born: number;
  size: number;
  spin: number;
  front: boolean;
  leaves: number[]; // positions along the stem, 0..1
};
type Node = { kind: "node"; p: [number, number]; born: number; links: [number, number][]; weight: number };
type Plant = Flower | Node;

const GROW = 650; // ms for a stem to reach its tip
const BLOOM = 280; // ms for a blossom to open after that
const MAX = 220;

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/**
 * A name in a sticker. Moving over it grows things out of the sticker's edge:
 * stems, leaves and five-petal blossoms in the theme accent, or a network of
 * nodes that wire themselves to their neighbours. Pure canvas 2D; the loop only
 * runs while something is still growing.
 */
export function Garden({ text, mode, clearKey }: { text: string; mode: GrowMode; clearKey: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const plants = useRef<Plant[]>([]);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const redraw = useRef<() => void>(() => {});

  useEffect(() => {
    plants.current = [];
    redraw.current();
  }, [clearKey]);

  useEffect(() => {
    const c = ref.current!;
    const g = c.getContext("2d")!;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, dpr = 1, raf = 0;
    let box = { x: 0, y: 0, w: 0, h: 0, r: 18 };
    let colors = { ink: "#111", accent: "#d9261c", stem: "#2f6b45", leaf: "#3f8a55", heart: "#f2c94c", paper: "#fff" };
    let font = "Georgia";
    let last: [number, number] | null = null;

    const readColors = () => {
      const dark = getComputedStyle(document.documentElement).colorScheme.includes("dark") || document.documentElement.dataset.theme === "dark";
      colors = {
        ink: css("--ink") || "#111",
        accent: css("--accent") || "#d9261c",
        stem: dark ? "#6fbf8a" : "#2f6b45",
        leaf: dark ? "#8fd3a5" : "#3f8a55",
        heart: "#f2c94c",
        paper: css("--surface") || "#f2f1ed",
      };
      font = css("--font-instrument") || "Georgia";
    };

    const resize = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      W = c.clientWidth;
      H = c.clientHeight;
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
      const bw = Math.min(520, W * 0.78), bh = Math.min(150, bw * 0.3);
      box = { x: (W - bw) / 2, y: (H - bh) / 2, w: bw, h: bh, r: 18 };
      draw();
    };

    // Nearest point on the sticker's border to (x, y), so stems start at the edge.
    const edge = (x: number, y: number): [number, number] => {
      const cx = Math.max(box.x, Math.min(box.x + box.w, x));
      const cy = Math.max(box.y, Math.min(box.y + box.h, y));
      const inside = x > box.x && x < box.x + box.w && y > box.y && y < box.y + box.h;
      if (!inside) return [cx, cy];
      const d = [x - box.x, box.x + box.w - x, y - box.y, box.y + box.h - y];
      const m = d.indexOf(Math.min(...d));
      return m === 0 ? [box.x, y] : m === 1 ? [box.x + box.w, y] : m === 2 ? [x, box.y] : [x, box.y + box.h];
    };

    const spawn = (x: number, y: number) => {
      const now = performance.now();
      const ps = plants.current;
      if (modeRef.current === "flowers") {
        const o = edge(x, y);
        const dx = x - o[0], dy = y - o[1];
        // Reach past the pointer a little, away from the sticker.
        const len = Math.hypot(dx, dy) || 1;
        const reach = 30 + Math.random() * 40;
        const t: [number, number] = [x + (dx / len) * reach * 0.4 + (Math.random() - 0.5) * 20, y + (dy / len) * reach * 0.4 + (Math.random() - 0.5) * 20];
        const ctl: [number, number] = [(o[0] + t[0]) / 2 + (Math.random() - 0.5) * 60, (o[1] + t[1]) / 2 + (Math.random() - 0.5) * 60];
        ps.push({ kind: "flower", o, c: ctl, t, born: now, size: 9 + Math.random() * 9, spin: Math.random() * Math.PI, front: Math.random() < 0.2, leaves: [0.3 + Math.random() * 0.15, 0.55 + Math.random() * 0.2] });
      } else {
        const nodes = ps.filter((p): p is Node => p.kind === "node");
        const near = nodes.find((n) => Math.hypot(n.p[0] - x, n.p[1] - y) < 22);
        if (near) {
          near.weight = Math.min(5, near.weight + 0.6);
          near.born = now - GROW; // no regrow, just thicken
        } else {
          const close = nodes
            .map((n) => [n, Math.hypot(n.p[0] - x, n.p[1] - y)] as const)
            .filter(([, d]) => d < 170)
            .sort((a, b) => a[1] - b[1])
            .slice(0, 2)
            .map(([n]) => n.p);
          const links = close.length ? close : [edge(x, y)];
          ps.push({ kind: "node", p: [x, y], born: now, links, weight: 1 });
        }
      }
      while (ps.length > MAX) ps.shift();
      kick();
    };

    const bez = (f: Flower, u: number): [number, number] => {
      const a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, d = u * u;
      return [a * f.o[0] + b * f.c[0] + d * f.t[0], a * f.o[1] + b * f.c[1] + d * f.t[1]];
    };

    const drawFlower = (f: Flower, now: number) => {
      const age = still ? GROW + BLOOM : now - f.born;
      const p = Math.min(1, age / GROW);
      g.strokeStyle = colors.stem;
      g.lineWidth = 2.2;
      g.lineCap = "round";
      g.beginPath();
      const steps = 22;
      for (let i = 0; i <= steps * p; i++) {
        const [x, y] = bez(f, i / steps);
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
      for (const lu of f.leaves) {
        if (p < lu) continue;
        const [x, y] = bez(f, lu), [x2, y2] = bez(f, lu + 0.02);
        const ang = Math.atan2(y2 - y, x2 - x) + (lu > 0.5 ? 0.9 : -0.9);
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        g.fillStyle = colors.leaf;
        g.beginPath();
        g.ellipse(7, 0, 8, 3.4, 0, 0, Math.PI * 2);
        g.fill();
        g.restore();
      }
      if (age > GROW) {
        const b = Math.min(1, (age - GROW) / BLOOM);
        const s = f.size * (0.4 + 0.6 * (1 - (1 - b) ** 3));
        g.save();
        g.translate(f.t[0], f.t[1]);
        g.rotate(f.spin);
        g.fillStyle = colors.accent;
        for (let k = 0; k < 5; k++) {
          g.rotate((Math.PI * 2) / 5);
          g.beginPath();
          g.ellipse(s * 0.62, 0, s * 0.62, s * 0.42, 0, 0, Math.PI * 2);
          g.fill();
        }
        g.fillStyle = colors.heart;
        g.beginPath();
        g.arc(0, 0, s * 0.24, 0, Math.PI * 2);
        g.fill();
        g.restore();
      }
    };

    const drawNode = (n: Node, now: number) => {
      const p = still ? 1 : Math.min(1, (now - n.born) / GROW);
      g.strokeStyle = colors.accent;
      g.globalAlpha = 0.55;
      g.lineWidth = 0.8 + n.weight * 0.9;
      for (const l of n.links) {
        g.beginPath();
        g.moveTo(l[0], l[1]);
        g.lineTo(l[0] + (n.p[0] - l[0]) * p, l[1] + (n.p[1] - l[1]) * p);
        g.stroke();
      }
      g.globalAlpha = 1;
      if (p >= 1) {
        g.fillStyle = colors.ink;
        g.beginPath();
        g.arc(n.p[0], n.p[1], 2.5 + n.weight, 0, Math.PI * 2);
        g.fill();
      }
    };

    const drawSticker = () => {
      g.lineWidth = 5;
      g.strokeStyle = colors.ink;
      g.fillStyle = colors.paper;
      g.beginPath();
      g.roundRect(box.x, box.y, box.w, box.h, box.r);
      g.fill();
      g.stroke();
      g.fillStyle = colors.ink;
      g.textAlign = "center";
      g.textBaseline = "middle";
      let size = box.h * 0.72;
      g.font = `${size}px ${font}`;
      while (g.measureText(text).width > box.w * 0.86 && size > 10) {
        size -= 2;
        g.font = `${size}px ${font}`;
      }
      g.fillText(text, box.x + box.w / 2, box.y + box.h / 2 + size * 0.05);
    };

    function draw() {
      const now = performance.now();
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      const ps = plants.current;
      for (const p of ps) if (p.kind === "node" || !p.front) p.kind === "node" ? drawNode(p, now) : drawFlower(p, now);
      drawSticker();
      for (const p of ps) if (p.kind === "flower" && p.front) drawFlower(p, now);
      return ps.some((p) => now - p.born < GROW + BLOOM);
    }

    function kick() {
      if (raf) return;
      const loop = () => {
        raf = 0;
        if (draw()) raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    const onMove = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (last && Math.hypot(x - last[0], y - last[1]) < 24) return;
      last = [x, y];
      spawn(x, y);
    };
    const onLeave = () => (last = null);
    const onTheme = () => requestAnimationFrame(() => {
      readColors();
      draw();
    });

    readColors();
    resize();
    document.fonts?.ready.then(() => {
      readColors();
      draw();
    });
    redraw.current = draw;
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    c.addEventListener("pointermove", onMove);
    c.addEventListener("pointerleave", onLeave);
    addEventListener("themechange", onTheme);
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", onTheme);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      c.removeEventListener("pointermove", onMove);
      c.removeEventListener("pointerleave", onLeave);
      removeEventListener("themechange", onTheme);
      mq.removeEventListener("change", onTheme);
    };
  }, [text]);

  return (
    <canvas
      ref={ref}
      className="block h-[260px] w-full cursor-crosshair touch-pan-y sm:h-[340px]"
      aria-label={`"${text}" on a sticker. Move over it and ${mode === "flowers" ? "flowers grow" : "a network grows"} out of the edges.`}
    />
  );
}
