"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export type Roll = { title: string; stock: string; camera?: string; year?: string; frames: string[] };

const PER = 5; // frames per strip
const MW = 300; // scratch-mask resolution; one mask per frame, shared by every view of it
const MH = 200;

type Frame = { src: string; mask: HTMLCanvasElement; img: HTMLImageElement; dev: boolean; listeners: Set<() => void> };

function makeFrame(src: string): Frame {
  const mask = document.createElement("canvas");
  mask.width = MW;
  mask.height = MH;
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  return { src, mask, img, dev: false, listeners: new Set() };
}

/** A soft round brush stamped into the mask; the negative is erased wherever the mask is opaque. */
function stamp(f: Frame, nx: number, ny: number) {
  const g = f.mask.getContext("2d")!;
  const x = nx * MW, y = ny * MH, r = MW * 0.085;
  const grad = g.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, "rgba(0,0,0,1)");
  grad.addColorStop(0.6, "rgba(0,0,0,.92)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(x - r, y - r, 2 * r, 2 * r);
}

function uncovered(f: Frame) {
  const d = f.mask.getContext("2d")!.getImageData(0, 0, MW, MH).data;
  let on = 0, n = 0;
  for (let i = 3; i < d.length; i += 16) {
    n++;
    if (d[i] > 110) on++;
  }
  return on / n;
}

/**
 * Photos as rolls of colour negative. Strips unspool from the left as they
 * scroll in. Pressing and dragging across a frame develops it, and past 60%
 * the rest clears. A click opens the frame large, with a develop button.
 */
export function FilmRoll({ rolls }: { rolls: Roll[] }) {
  const frames = useRef<Map<string, Frame>>(new Map());
  const [, force] = useState(0);
  const [viewer, setViewer] = useState<{ roll: number; i: number } | null>(null);
  // Frames own canvases and Image objects, so nothing renders until the browser has mounted.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const frame = (src: string) => {
    let f = frames.current.get(src);
    if (!f) frames.current.set(src, (f = makeFrame(src)));
    return f;
  };
  const develop = (src: string) => {
    const f = frame(src);
    if (f.dev) return;
    f.dev = true;
    f.listeners.forEach((l) => l());
    force((n) => n + 1);
  };

  useEffect(() => {
    if (!viewer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewer(null);
      if (e.key === "ArrowRight") setViewer((v) => v && { ...v, i: Math.min(v.i + 1, rolls[v.roll].frames.length - 1) });
      if (e.key === "ArrowLeft") setViewer((v) => v && { ...v, i: Math.max(v.i - 1, 0) });
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [viewer, rolls]);

  if (!ready) return <div className="h-[420px]" />;

  return (
    <>
      {rolls.map((roll, ri) => {
        const strips: (string | "lead" | "empty")[][] = [];
        let k = 0;
        for (let s = 0; k < roll.frames.length; s++) {
          const row: (string | "lead" | "empty")[] = s === 0 ? ["lead"] : [];
          while (row.length < PER) row.push(k < roll.frames.length ? roll.frames[k++] : "empty");
          strips.push(row);
        }
        const allDev = roll.frames.every((f) => frame(f).dev);
        return (
          <section key={roll.title} className="mt-10 first:mt-0">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div className="flex items-baseline gap-3">
                <h3 className="font-serif text-[30px] leading-none font-normal">{roll.title}</h3>
                <span className="text-[12px]">{[roll.stock, roll.camera, roll.year].filter(Boolean).join("  ·  ")}</span>
              </div>
              {!allDev && (
                <button
                  type="button"
                  className="pill"
                  onClick={() => roll.frames.forEach((f, i) => setTimeout(() => develop(f), i * 110))}
                >
                  develop all
                </button>
              )}
            </div>
            <div className="mt-4" style={{ marginRight: "calc(50% - 50vw)" }}>
              {strips.map((row, si) => {
                return (
                  <Strip key={si} stock={roll.stock} index={ri * 3 + si}>
                    {row.map((cell, ci) => {
                      if (cell === "lead") return <div key="lead" className="aspect-[3/2] w-[var(--fw)] shrink-0" />;
                      if (cell === "empty") return <div key={`e${ci}`} className="aspect-[3/2] w-[var(--fw)] shrink-0 bg-[#6c3a1b]" />;
                      const idx = roll.frames.indexOf(cell);
                      return (
                        <Negative
                          key={cell}
                          f={frame(cell)}
                          label={`→ ${idx + 1}A`}
                          onDevelop={() => develop(cell)}
                          onOpen={() => setViewer({ roll: ri, i: idx })}
                        />
                      );
                    })}
                  </Strip>
                );
              })}
            </div>
          </section>
        );
      })}

      <AnimatePresence>
        {viewer && (
          <motion.div
            className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-4 bg-[#0e0b08]/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setViewer(null)}
            data-lenis-prevent
          >
            <motion.div
              key={viewer.i}
              className="w-[min(92vw,1000px)]"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0, duration: 0.45 }}
            >
              <Negative
                big
                f={frame(rolls[viewer.roll].frames[viewer.i])}
                label={`${viewer.i + 1}A`}
                onDevelop={() => develop(rolls[viewer.roll].frames[viewer.i])}
              />
            </motion.div>
            <div className="flex gap-2">
              {[
                ["←", () => setViewer({ ...viewer, i: Math.max(0, viewer.i - 1) })],
                ["develop", () => develop(rolls[viewer.roll].frames[viewer.i])],
                ["close", () => setViewer(null)],
                ["→", () => setViewer({ ...viewer, i: Math.min(rolls[viewer.roll].frames.length - 1, viewer.i + 1) })],
              ].map(([l, fn]) => (
                <button key={l as string} type="button" className="pill !bg-white/10 !text-[#f3eadb] hover:!bg-white/20" onClick={fn as () => void}>
                  {l as string}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** One strip of film: orange base, sprocket holes, edge print, unspooling as it scrolls in. */
function Strip({ stock, index, children }: { stock: string; index: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const rot = ((index % 2 ? 1 : -1) * (0.25 + ((index * 7) % 6) / 10)).toFixed(2);
  const shift = ((index * 37) % 28) - 14;

  useEffect(() => {
    const el = ref.current!;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ticking = false;
    const spool = () => {
      ticking = false;
      const vh = innerHeight;
      const r = Math.max(0, Math.min(1, (vh * 0.96 - el.getBoundingClientRect().top) / (vh * 0.42)));
      const e = r * r * (3 - 2 * r);
      el.style.clipPath = e >= 1 ? "none" : `inset(0 ${((1 - e) * 100).toFixed(1)}% 0 0)`;
      el.style.setProperty("--tx", `${(-(1 - e) * 70).toFixed(1)}px`);
    };
    const tick = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(spool);
      }
    };
    spool();
    addEventListener("scroll", tick, { passive: true });
    addEventListener("resize", tick);
    return () => {
      removeEventListener("scroll", tick);
      removeEventListener("resize", tick);
    };
  }, []);

  const holes = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='22' height='14'><rect x='4' y='2' width='12' height='10' rx='2.5'/></svg>\") repeat-x";
  return (
    <div className="no-scrollbar mb-5 overflow-x-auto pr-4" data-lenis-prevent>
      <div
        ref={ref}
        className="relative flex w-max gap-1.5 rounded-[3px] bg-[linear-gradient(#a3622f,#8b4d24)] px-3 py-9 [--fw:min(62vw,230px)] sm:[--fw:220px]"
        style={{ marginLeft: shift, transform: `translateX(var(--tx,0)) rotate(${rot}deg)` }}
      >
        <span className="absolute inset-x-0 top-2.5 h-3.5 bg-bg" style={{ mask: holes, WebkitMask: holes }} />
        <span className="absolute inset-x-0 bottom-2.5 h-3.5 bg-bg" style={{ mask: holes, WebkitMask: holes }} />
        <span className="absolute inset-x-4 top-[26px] overflow-hidden font-sans text-[8px] font-semibold tracking-[.14em] whitespace-nowrap text-[rgba(255,224,186,.72)]">
          {Array(14).fill(stock.toUpperCase()).join("      ")}
        </span>
        {children}
      </div>
    </div>
  );
}

/** A frame as a colour negative over the real photo, with the scratch mask cut out of it. */
function Negative({ f, label, big = false, onDevelop, onOpen }: { f: Frame; label: string; big?: boolean; onDevelop: () => void; onOpen?: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [dev, setDev] = useState(f.dev);

  useEffect(() => {
    const c = canvas.current!, el = wrap.current!;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const render = () => {
      setDev(f.dev);
      if (f.dev || !f.img.naturalWidth) return;
      const w = el.clientWidth, h = el.clientHeight;
      if (!w) return;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      const x = c.getContext("2d")!;
      const s = Math.max(c.width / f.img.naturalWidth, c.height / f.img.naturalHeight);
      x.globalCompositeOperation = "source-over";
      x.drawImage(f.img, (c.width - f.img.naturalWidth * s) / 2, (c.height - f.img.naturalHeight * s) / 2, f.img.naturalWidth * s, f.img.naturalHeight * s);
      x.globalCompositeOperation = "destination-out";
      x.drawImage(f.mask, 0, 0, c.width, c.height);
    };
    f.listeners.add(render);
    if (f.img.complete) render();
    else f.img.addEventListener("load", render, { once: true });
    const ro = new ResizeObserver(render);
    ro.observe(el);
    return () => {
      f.listeners.delete(render);
      ro.disconnect();
    };
  }, [f]);

  // Rub to develop; a press that never moves is a click.
  const down = useRef<[number, number, number, number] | null>(null);
  const last = useRef<[number, number] | null>(null);
  const moved = useRef(false);
  const strokes = useRef(0);
  const pt = (e: React.PointerEvent): [number, number, number, number] => {
    const r = wrap.current!.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, e.clientX, e.clientY];
  };
  const rub = (e: React.PointerEvent) => {
    if (f.dev) return;
    const p = pt(e);
    // Only a press rubs; moving over a frame does nothing.
    if (!down.current) return;
    if (!last.current) {
      last.current = [p[0], p[1]];
      return;
    }
    if (down.current && !moved.current && Math.hypot(p[2] - down.current[2], p[3] - down.current[3]) < 5) return;
    moved.current = true;
    const [lx, ly] = last.current;
    const steps = Math.max(1, Math.ceil((Math.hypot(p[0] - lx, p[1] - ly) * MW) / 6));
    for (let i = 1; i <= steps; i++) stamp(f, lx + ((p[0] - lx) * i) / steps, ly + ((p[1] - ly) * i) / steps);
    last.current = [p[0], p[1]];
    f.listeners.forEach((l) => l());
    if (++strokes.current % 6 === 0 && uncovered(f) > 0.6) onDevelop();
  };

  return (
    <div className={big ? "" : "shrink-0"}>
      <div
        ref={wrap}
        role={onOpen ? "button" : undefined}
        tabIndex={onOpen ? 0 : undefined}
        aria-label={onOpen ? `Open frame ${label}` : undefined}
        className={`relative aspect-[3/2] cursor-crosshair overflow-hidden bg-[#3a1d0c] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${big ? "w-full" : "w-[var(--fw)]"}`}
        style={{ touchAction: "pan-y" }}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          down.current = pt(e);
          moved.current = false;
          last.current = [down.current[0], down.current[1]];
        }}
        onPointerMove={rub}
        onPointerUp={() => {
          if (down.current && !moved.current) onOpen?.();
          down.current = null;
        }}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen?.())}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={f.src} alt="" loading="lazy" draggable={false} className="pointer-events-none absolute inset-0 size-full object-cover" />
        <canvas
          ref={canvas}
          className="pointer-events-none absolute inset-0 size-full transition-opacity duration-[900ms]"
          style={{ opacity: dev ? 0 : 1, filter: "invert(1) sepia(1) saturate(3.2) hue-rotate(-18deg) brightness(.7) contrast(1.15)" }}
        />
      </div>
      <span className={`mt-1 block font-sans text-[8px] font-semibold tracking-[.1em] ${big ? "text-[#f3eadb]/70" : "text-[rgba(255,224,186,.72)]"}`}>{label}</span>
    </div>
  );
}
