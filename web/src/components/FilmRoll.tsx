"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export type Photo = { src: string; roll: string };

/**
 * Each frame starts as its own negative, painted on a canvas over the photo.
 * Rubbing the pointer across it erases the negative; once about 60% is gone
 * the rest dissolves. A tap without rubbing opens the photo large.
 */
export function FilmRoll({ photos }: { photos: Photo[] }) {
  const [viewer, setViewer] = useState<Photo | null>(null);
  const [all, setAll] = useState(false);
  const rolls = [...new Set(photos.map((p) => p.roll))];
  return (
    <>
      <div className="flex justify-end">
        <button type="button" className="oval" onClick={() => setAll(true)} disabled={all}>
          develop all
        </button>
      </div>
      {rolls.map((roll) => (
        <section key={roll} className="mt-8">
          <h2 className="text-[26px] italic">{roll}</h2>
          <div className="mt-4 rounded-sm bg-[#1b140f] px-3 py-1">
            <Holes />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos
                .filter((p) => p.roll === roll)
                .map((p, i) => (
                  <Frame key={p.src} photo={p} n={i + 1} developAll={all} onOpen={() => setViewer(p)} />
                ))}
            </div>
            <Holes />
          </div>
        </section>
      ))}
      <AnimatePresence>
        {viewer && (
          <motion.div
            className="fixed inset-0 z-[70] grid place-items-center bg-black/80 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewer(null)}
          >
            <motion.img
              src={viewer.src}
              alt=""
              className="max-h-[88dvh] max-w-full rounded-sm shadow-2xl"
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Frame({ photo, n, developAll, onOpen }: { photo: Photo; n: number; developAll: boolean; onOpen: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [developed, setDeveloped] = useState(false);
  const moved = useRef(0);

  useEffect(() => {
    if (developAll) setDeveloped(true);
  }, [developAll]);

  useEffect(() => {
    const c = canvas.current!;
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    const img = new Image();
    img.src = photo.src;
    img.onload = () => {
      c.width = 320;
      c.height = Math.round((320 * img.naturalHeight) / img.naturalWidth) || 240;
      ctx.filter = "invert(1) sepia(0.7) saturate(1.4) hue-rotate(-12deg) contrast(1.1)";
      ctx.drawImage(img, 0, 0, c.width, c.height);
      ctx.filter = "none";
    };
  }, [photo.src]);

  const scratch = (e: React.PointerEvent) => {
    if (developed) return;
    const c = canvas.current!;
    const r = c.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * c.width;
    const y = ((e.clientY - r.top) / r.height) * c.height;
    const ctx = c.getContext("2d")!;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    moved.current++;
    if (moved.current % 8 === 0) {
      // Sample every 8th pixel's alpha to estimate how much is uncovered.
      const data = ctx.getImageData(0, 0, c.width, c.height).data;
      let clear = 0, total = 0;
      for (let i = 3; i < data.length; i += 32) {
        total++;
        if (data[i] === 0) clear++;
      }
      if (clear / total > 0.6) setDeveloped(true);
    }
  };

  return (
    <figure className="relative">
      <button
        type="button"
        className="relative block aspect-[4/3] w-full cursor-pointer overflow-hidden bg-black [touch-action:pan-y]"
        onPointerDown={() => (moved.current = 0)}
        onPointerMove={scratch}
        onClick={() => moved.current < 3 && onOpen()}
        aria-label={`Frame ${n}. Rub to develop, tap to enlarge.`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.src} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
        <canvas
          ref={canvas}
          className="absolute inset-0 size-full object-cover transition-opacity duration-700"
          style={{ opacity: developed ? 0 : 1 }}
        />
      </button>
      <figcaption className="mt-1 flex justify-between font-mono text-[10px] text-[#f3eadb]/60">
        <span>{String(n).padStart(2, "0")}A</span>
        <span>{developed ? "developed" : "rub me"}</span>
      </figcaption>
    </figure>
  );
}

function Holes() {
  return (
    <div className="flex justify-between py-2" aria-hidden>
      {Array.from({ length: 14 }, (_, i) => (
        <span key={i} className="h-2.5 w-3.5 rounded-[2px] bg-[#f3eadb]/80" />
      ))}
    </div>
  );
}
