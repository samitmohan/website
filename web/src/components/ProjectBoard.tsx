"use client";

import { AnimatePresence, motion, useMotionValue, animate } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type BoardProject = {
  slug: string;
  name: string;
  stack: string;
  blurb: string;
  repoUrl: string;
  liveUrl?: string;
  figure: string; // inlined SVG markup
  posts: { slug: string; title: string }[];
};

// Board coordinates. The canvas is larger than the viewport and pans by drag.
const W = 1500;
const H = 980;
const CARD = 300;
const SPOTS = [
  { x: 110, y: 90, r: -3 },
  { x: 610, y: 60, r: 2.2 },
  { x: 1090, y: 150, r: -1.6 },
  { x: 380, y: 540, r: 1.4 },
];
const NOTE_SPOTS = [
  [{ x: 90, y: 520 }, { x: 140, y: 720 }],
  [{ x: 760, y: 470 }, { x: 980, y: 560 }],
  [{ x: 1180, y: 560 }, { x: 1220, y: 760 }],
  [{ x: 820, y: 760 }],
];
const NOTE_W = 170;
const NOTE_H = 96;
const TILT = [-4, 3, -2, 5, -3];

export function ProjectBoard({ projects }: { projects: BoardProject[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const project = projects.find((p) => p.slug === open);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-write-up-open", Boolean(open));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    addEventListener("keydown", onKey);
    return () => {
      removeEventListener("keydown", onKey);
      document.documentElement.removeAttribute("data-write-up-open");
    };
  }, [open]);

  return (
    <>
      <Board projects={projects} onOpen={setOpen} />
      <List projects={projects} onOpen={setOpen} />
      <AnimatePresence>{project && <WriteUp p={project} onClose={() => setOpen(null)} />}</AnimatePresence>
    </>
  );
}

function Board({ projects, onOpen }: { projects: BoardProject[]; onOpen: (s: string) => void }) {
  const frame = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const [zoom, setZoom] = useState(1);
  const dragged = useRef(false);

  // Fit the whole board into the frame on load and whenever "fit" is pressed.
  const fit = () => {
    const f = frame.current;
    if (!f) return;
    const s = Math.min(f.clientWidth / W, f.clientHeight / H) * 0.96;
    setZoom(s);
    animate(scale, s, { type: "spring", bounce: 0, duration: 0.6 });
    animate(x, (f.clientWidth - W * s) / 2, { type: "spring", bounce: 0, duration: 0.6 });
    animate(y, (f.clientHeight - H * s) / 2, { type: "spring", bounce: 0, duration: 0.6 });
  };
  useEffect(fit, []); // eslint-disable-line react-hooks/exhaustive-deps

  const zoomBy = (k: number) => {
    const f = frame.current!;
    const next = Math.min(1.6, Math.max(0.35, zoom * k));
    // Zoom about the frame centre.
    const cx = f.clientWidth / 2, cy = f.clientHeight / 2;
    animate(x, cx - ((cx - x.get()) * next) / zoom, { duration: 0.35 });
    animate(y, cy - ((cy - y.get()) * next) / zoom, { duration: 0.35 });
    animate(scale, next, { duration: 0.35 });
    setZoom(next);
  };

  const threads: { from: [number, number]; to: [number, number] }[] = [];
  projects.forEach((p, i) =>
    p.posts.forEach((_, j) => {
      const s = SPOTS[i], n = NOTE_SPOTS[i]?.[j];
      if (n) threads.push({ from: [s.x + CARD / 2, s.y + 14], to: [n.x + NOTE_W / 2, n.y + 10] });
    }),
  );

  return (
    <div
      ref={frame}
      className="relative hidden h-[min(72vh,680px)] touch-none overflow-hidden rounded-[28px] bg-surface md:block"
      style={{ backgroundImage: "radial-gradient(var(--hairline) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
      data-lenis-prevent
    >
      <motion.div
        className="absolute top-0 left-0 origin-top-left cursor-grab active:cursor-grabbing"
        style={{ width: W, height: H, x, y, scale }}
        drag
        dragMomentum
        onDragStart={() => (dragged.current = true)}
        onDragEnd={() => setTimeout(() => (dragged.current = false), 0)}
      >
        <svg className="pointer-events-none absolute inset-0" width={W} height={H} aria-hidden>
          {threads.map((t, k) => {
            const [x1, y1] = t.from, [x2, y2] = t.to;
            const sag = 60 + Math.abs(x2 - x1) * 0.15;
            return (
              <path
                key={k}
                d={`M${x1} ${y1} C ${x1} ${y1 + sag}, ${x2} ${y2 - sag / 2}, ${x2} ${y2}`}
                stroke="var(--accent)"
                strokeWidth="1.5"
                fill="none"
                opacity="0.8"
              />
            );
          })}
        </svg>

        {projects.map((p, i) => {
          const s = SPOTS[i] ?? { x: 100 + i * 340, y: 100, r: 0 };
          return (
            <motion.button
              key={p.slug}
              type="button"
              layoutId={`card-${p.slug}`}
              onClick={() => !dragged.current && onOpen(p.slug)}
              className="group absolute bg-paper p-3 text-left shadow-[var(--shadow-card)]"
              style={{ left: s.x, top: s.y, width: CARD, rotate: s.r }}
              whileHover={{ rotate: 0, scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              <Pin />
              <div className="aspect-[16/10] overflow-hidden text-ink [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: p.figure }} />
              <div className="mt-3 flex items-baseline justify-between gap-2 px-1">
                <span className="font-serif text-[24px] leading-none text-ink italic">{p.name}</span>
                <span className="meta">{p.stack}</span>
              </div>
            </motion.button>
          );
        })}

        {projects.flatMap((p, i) =>
          p.posts.map((post, j) => {
            const n = NOTE_SPOTS[i]?.[j];
            if (!n) return null;
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                onClick={(e) => dragged.current && e.preventDefault()}
                className="absolute flex flex-col justify-between bg-[#fff3a8] p-3 text-[#1b1b1b] shadow-[0_6px_16px_-8px_rgba(0,0,0,.4)] transition-transform hover:scale-105"
                style={{ left: n.x, top: n.y, width: NOTE_W, minHeight: NOTE_H, rotate: `${TILT[(i + j) % TILT.length]}deg` }}
              >
                <span className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full bg-accent shadow" />
                <span className="font-serif text-[17px] leading-tight italic">{post.title}</span>
                <span className="mt-2 font-mono text-[10px] opacity-60">read the post →</span>
              </Link>
            );
          }),
        )}
      </motion.div>

      <div className="absolute right-4 bottom-4 flex gap-1.5">
        <button type="button" className="oval bg-bg" onClick={() => zoomBy(1 / 1.25)} aria-label="Zoom out">−</button>
        <button type="button" className="oval bg-bg" onClick={fit}>fit</button>
        <button type="button" className="oval bg-bg" onClick={() => zoomBy(1.25)} aria-label="Zoom in">+</button>
      </div>
      <p className="meta pointer-events-none absolute bottom-5 left-5">drag to look around</p>
    </div>
  );
}

function List({ projects, onOpen }: { projects: BoardProject[]; onOpen: (s: string) => void }) {
  return (
    <div className="flex flex-col gap-6 md:hidden">
      {projects.map((p, i) => (
        <motion.button
          key={p.slug}
          type="button"
          layoutId={`card-m-${p.slug}`}
          onClick={() => onOpen(p.slug)}
          className="relative bg-paper p-3 text-left shadow-[var(--shadow-card)]"
          style={{ rotate: SPOTS[i]?.r ? SPOTS[i].r / 2 : 0 }}
        >
          <Pin />
          <div className="aspect-[16/10] overflow-hidden text-ink [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: p.figure }} />
          <div className="mt-3 flex items-baseline justify-between gap-2 px-1">
            <span className="font-serif text-[24px] leading-none text-ink italic">{p.name}</span>
            <span className="meta">{p.stack}</span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

function WriteUp({ p, onClose }: { p: BoardProject; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/30 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      data-lenis-prevent
    >
      <motion.article
        role="dialog"
        aria-modal="true"
        aria-label={p.name}
        className="max-h-[92dvh] w-full max-w-[620px] overflow-y-auto rounded-t-[28px] bg-bg p-6 shadow-2xl sm:rounded-[28px] sm:p-8"
        initial={{ y: 40, opacity: 0, filter: "blur(10px)" }}
        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
        exit={{ y: 30, opacity: 0, filter: "blur(10px)" }}
        transition={{ type: "spring", bounce: 0, duration: 0.5 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="meta">{p.stack}</p>
            <h2 className="mt-1 font-serif text-[40px] leading-none font-normal italic">{p.name}</h2>
          </div>
          <button type="button" className="oval" onClick={onClose} autoFocus>
            close
          </button>
        </div>
        <div className="mt-6 aspect-[16/10] overflow-hidden rounded-2xl bg-surface p-4 text-ink [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: p.figure }} />
        <p className="mt-6 text-[16px] leading-relaxed">{p.blurb}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <a className="oval" href={p.repoUrl}>source</a>
          {p.liveUrl && <a className="oval" href={p.liveUrl}>live</a>}
        </div>
        {p.posts.length > 0 && (
          <>
            <h3 className="meta mt-8">written about in</h3>
            <ul className="mt-2">
              {p.posts.map((post) => (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}`} className="block border-b border-hairline py-3 text-ink hover:text-accent">
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </motion.article>
    </motion.div>
  );
}

function Pin() {
  return <span className="absolute -top-2 left-1/2 z-10 size-4 -translate-x-1/2 rounded-full bg-accent shadow-[0_2px_3px_rgba(0,0,0,.4)]" />;
}
