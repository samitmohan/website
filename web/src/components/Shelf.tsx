"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

export type Book = { title: string; author: string; kind: string; color: string; url?: string; notes: string[]; placeholder?: boolean };
export type Film = { title: string; year: number; director: string; color: string; placeholder?: boolean };
export type Album = { title: string; artist: string; year: number; color: string; ink: string; placeholder?: boolean };

/* ------------------------------------------------------------------ books */

/** Spines on a plank. Hover pulls one out toward you; click opens it. */
export function Bookshelf({ books }: { books: Book[] }) {
  const [open, setOpen] = useState<Book | null>(null);
  return (
    <>
      <div className="no-scrollbar overflow-x-auto pt-6">
        <div className="flex min-w-max items-end gap-1.5 px-2 [perspective:900px]">
          {books.map((b, i) => (
            <button
              key={b.title}
              type="button"
              onClick={() => setOpen(b)}
              title={`${b.title} - ${b.author}`}
              className="group relative flex w-10 shrink-0 items-center justify-center rounded-t-[3px] px-1 py-3 text-left text-[11px] leading-tight text-white/90 shadow-[inset_-3px_0_0_rgba(0,0,0,.18),inset_2px_0_0_rgba(255,255,255,.08)] transition-transform duration-300 ease-out [transform-style:preserve-3d] [writing-mode:vertical-rl] hover:[transform:rotateY(-34deg)_translateZ(46px)_translateY(-10px)] focus-visible:[transform:rotateY(-34deg)_translateZ(46px)_translateY(-10px)]"
              style={{ height: 170 + ((i * 41) % 80), background: b.color }}
            >
              <span className="line-clamp-2">{b.title}</span>
              <span className="absolute inset-x-2 top-2 h-px bg-white/30" />
              <span className="absolute inset-x-2 bottom-2 h-px bg-white/30" />
            </button>
          ))}
        </div>
        <div className="h-3 rounded-sm bg-[#b57b43] shadow-[0_6px_10px_-4px_rgba(0,0,0,.35)]" />
      </div>
      <AnimatePresence>{open && <Flipbook book={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </>
  );
}

function Flipbook({ book, onClose }: { book: Book; onClose: () => void }) {
  const pages = [null, ...book.notes];
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState(1);
  const go = (d: number) => {
    const n = page + d;
    if (n < 0 || n >= pages.length) return;
    setDir(d);
    setPage(n);
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  const note = pages[page];
  return (
    <motion.div
      className="fixed inset-0 z-[70] grid place-items-center bg-black/35 p-4 backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="relative [perspective:1400px]" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={book.title}>
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={page}
            custom={dir}
            className="flex aspect-[3/4] w-[min(340px,80vw)] origin-left flex-col rounded-r-lg p-7 shadow-2xl"
            style={{ background: note === null ? book.color : "var(--paper)", color: note === null ? "#fff" : "var(--ink)" }}
            variants={{
              enter: (d: number) => ({ rotateY: d > 0 ? 90 : -20, opacity: d > 0 ? 1 : 0 }),
              center: { rotateY: 0, opacity: 1 },
              exit: (d: number) => ({ rotateY: d > 0 ? -180 : 90, opacity: d > 0 ? 0 : 1 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.62, ease: [0.65, 0, 0.25, 1] }}
          >
            {note === null ? (
              <>
                <span className="font-mono text-[11px] uppercase opacity-70">{book.kind}</span>
                <h2 className="mt-auto font-serif text-[34px] leading-none font-normal text-white italic">{book.title}</h2>
                <p className="mt-3 text-[14px] opacity-80">{book.author}</p>
              </>
            ) : (
              <>
                <span className="meta">
                  {page} / {pages.length - 1}
                </span>
                <p className="mt-6 font-serif text-[22px] leading-snug">{note}</p>
                {page === pages.length - 1 && book.url && (
                  <a className="link mt-auto text-[14px]" href={book.url}>
                    read it →
                  </a>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="mt-4 flex justify-center gap-2">
          <button type="button" className="oval bg-bg" onClick={() => go(-1)} disabled={page === 0}>
            ←
          </button>
          <button type="button" className="oval bg-bg" onClick={onClose}>
            close
          </button>
          <button type="button" className="oval bg-bg" onClick={() => go(1)} disabled={page === pages.length - 1}>
            →
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ films */

/** A strip of film that unrolls left to right as it scrolls into view. */
export function FilmStrip({ films }: { films: Film[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 95%", "center 55%"] });
  const clip = useTransform(scrollYProgress, (p) => {
    const t = Math.min(1, Math.max(0, p));
    const s = t * t * (3 - 2 * t); // smoothstep
    return `inset(0 ${(1 - s) * 100}% 0 0)`;
  });
  return (
    <div ref={ref} className="no-scrollbar -mx-4 overflow-x-auto px-4">
      <motion.div
        className="flex w-max gap-0 rounded-sm bg-[linear-gradient(#a3622f,#8b4d24)] p-0"
        style={{ clipPath: clip }}
      >
        {films.map((f) => (
          <div key={f.title} className="flex flex-col bg-[#1b140f] px-2">
            <Sprockets />
            <a
              href={`https://letterboxd.com/search/${encodeURIComponent(f.title)}/`}
              className="group relative flex h-36 w-48 flex-col justify-end overflow-hidden p-3"
              style={{ background: `linear-gradient(160deg, ${f.color}, #0e0b08)` }}
            >
              <span className="absolute top-2 right-2 font-mono text-[10px] text-white/50">{f.year}</span>
              <span className="font-serif text-[22px] leading-none text-white italic transition-transform duration-300 group-hover:-translate-y-1">
                {f.title}
              </span>
              <span className="mt-1 text-[11px] text-white/60">{f.director}</span>
            </a>
            <Sprockets />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function Sprockets() {
  return (
    <div className="flex justify-between py-1.5">
      {Array.from({ length: 8 }, (_, i) => (
        <span key={i} className="h-2 w-3 rounded-[2px] bg-[#f3eadb]/80" />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ music */

/** Typographic sleeves; each one tilts toward the pointer. */
export function Records({ albums }: { albums: Album[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {albums.map((a, i) => (
        <a
          key={a.title}
          href={`https://open.spotify.com/search/${encodeURIComponent(`${a.title} ${a.artist}`)}`}
          className="group relative block aspect-square [perspective:600px]"
        >
          <span className="absolute inset-y-[6%] right-[6%] aspect-square rounded-full bg-[radial-gradient(circle,#2a2a2a_0_18%,#111_19%_100%)] transition-transform duration-500 group-hover:translate-x-[34%] group-hover:rotate-90" />
          <span
            className="relative flex size-full flex-col justify-between p-3 shadow-[var(--shadow-card)] transition-transform duration-300 group-hover:[transform:rotateY(-8deg)_rotateX(4deg)]"
            style={{ background: a.color, color: a.ink }}
          >
            <span className="font-mono text-[10px] opacity-70">
              {String(i + 1).padStart(2, "0")} · {a.year}
            </span>
            <span>
              <span className="block font-serif text-[clamp(18px,3vw,24px)] leading-none italic">{a.title}</span>
              <span className="mt-1 block text-[11px] opacity-80">{a.artist}</span>
            </span>
          </span>
        </a>
      ))}
    </div>
  );
}
