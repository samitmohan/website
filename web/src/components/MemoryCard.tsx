"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { playBootSound } from "@/lib/ps2-sound";

export type Trip = { title: string; kb: number; frames: { src: string; thumb: string }[] };

const CARD_KB = 8192; // an 8 MB memory card

// three.js is heavy; the boot screen loads it only when the gallery is reached.
const Ps2Boot = dynamic(() => import("./Ps2Boot").then((m) => m.Ps2Boot), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-black" />,
});

/**
 * Trips as save files on a PS2 memory card. The browser screen floats each
 * save's icon in a dark blue haze; select with the pointer or the arrow keys,
 * open with click or Enter. Inside, photos page with the controller glyphs:
 * circle for next, triangle for back a photo, cross to leave.
 */
export function MemoryCard({ trips }: { trips: Trip[] }) {
  // off: the power screen · boot: the startup sequence · dash: the memory card.
  // The boot layer stays mounted while the dashboard fades in over it, so the
  // hand-over is one crossfade inside a screen that never changes size.
  const [phase, setPhase] = useState<"off" | "boot" | "dash">("off");
  const [bootLayer, setBootLayer] = useState(false);
  // Sound is opt-in; the choice is remembered.
  const [sound, setSound] = useState(false);
  const stopSound = useRef<(() => void) | null>(null);
  useEffect(() => {
    try {
      setSound(localStorage.getItem("ps2-sound") === "on");
    } catch {}
    return () => stopSound.current?.();
  }, []);
  const toggleSound = () =>
    setSound((on) => {
      try {
        localStorage.setItem("ps2-sound", on ? "off" : "on");
      } catch {}
      return !on;
    });
  const [sel, setSel] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [i, setI] = useState(0);
  const grid = useRef<HTMLDivElement>(null);
  const used = trips.reduce((n, t) => n + t.kb, 0);

  const enter = (k: number) => {
    setSel(k);
    setI(0);
    setOpen(k);
    setLoading(true);
    setTimeout(() => setLoading(false), matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open === null) return;
      const n = trips[open].frames.length;
      if (e.key === "Escape" || e.key === "Backspace") setOpen(null);
      if (e.key === "ArrowRight" || e.key === " ") (e.preventDefault(), setI((v) => (v + 1) % n));
      if (e.key === "ArrowLeft") setI((v) => (v - 1 + n) % n);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open, trips]);

  const trip = open === null ? null : trips[open];

  const power = () => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return setPhase("dash");
    setBootLayer(true);
    setPhase("boot");
    // The click that powers on is the gesture browsers require before audio.
    if (sound) stopSound.current = playBootSound();
  };
  const toDash = () => {
    stopSound.current?.();
    stopSound.current = null;
    setPhase("dash");
    setTimeout(() => setBootLayer(false), 1000);
  };

  return (
    <>
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[22px] bg-black sm:aspect-[4/3]">
        {phase === "off" && (
          <button
            type="button"
            onClick={power}
            aria-label="Start the memory card"
            className="absolute inset-0 grid place-items-center bg-[radial-gradient(70%_60%_at_50%_55%,#0b1633_0%,#000_75%)]"
          >
            <span className="ps2-text animate-[ps2-blink_1.8s_ease-in-out_infinite] text-[12px] tracking-[.3em] uppercase">
              press <span className="text-[#ff6b6b]">◯</span> to start
            </span>
          </button>
        )}
        {phase === "off" && (
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={sound}
            aria-label={sound ? "Sound on" : "Sound off"}
            title={sound ? "sound on" : "sound off"}
            className="ps2-dim absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 font-mono text-[11px] tracking-[.12em] uppercase hover:text-white"
          >
            <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
              <path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor" />
              {sound ? (
                <path d="M11 5.5c1.2 1.4 1.2 3.6 0 5M12.8 3.8c2.1 2.4 2.1 6 0 8.4" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
              ) : (
                <path d="M11 6l4 4M15 6l-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              )}
            </svg>
            {sound ? "on" : "off"}
          </button>
        )}
        {bootLayer && (
          <div className="absolute inset-0 transition-opacity duration-1000 ease-out" style={{ opacity: phase === "dash" ? 0 : 1 }}>
            <Ps2Boot onDone={toDash} />
            {phase === "boot" && (
              <button type="button" onClick={toDash} className="absolute inset-0" aria-label="Skip to the memory card" />
            )}
          </div>
        )}
        {phase === "dash" && (
      <div
        className="ps2 absolute inset-0 animate-[ps2-on_1s_cubic-bezier(.16,1,.3,1)_backwards] overflow-y-auto px-5 pt-5 pb-6 sm:px-8 sm:pt-7"
        role="group"
        aria-label="Memory card"
        data-lenis-prevent
      >
        <Haze />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="ps2-text text-[12px] tracking-[.2em] uppercase sm:text-[13px]">Memory Card (PS2) / 1</p>
            <p className="ps2-dim mt-1 text-[11px] tracking-[.15em] uppercase">{trips.length} saves</p>
          </div>
          <div className="w-32 text-right sm:w-40">
            <p className="ps2-dim text-[11px] tracking-[.15em] uppercase">
              8 MB · free {Math.max(0, CARD_KB - used).toLocaleString("en-US")} KB
            </p>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[linear-gradient(90deg,#6fa8ff,#b9d6ff)]" style={{ width: `${Math.min(100, (used / CARD_KB) * 100)}%` }} />
            </div>
          </div>
        </div>

        <div
          ref={grid}
          className="relative mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3"
          onKeyDown={(e) => {
            const cols = innerWidth >= 640 ? 3 : 2;
            const d = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[e.key];
            if (d === undefined) return;
            e.preventDefault();
            const next = Math.max(0, Math.min(trips.length - 1, sel + d));
            setSel(next);
            grid.current?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
          }}
        >
          {trips.map((t, k) => (
            <button
              key={t.title}
              type="button"
              onClick={() => enter(k)}
              onPointerEnter={() => setSel(k)}
              onFocus={() => setSel(k)}
              aria-label={`${t.title}, ${t.frames.length} photos, ${t.kb.toLocaleString("en-US")} KB. Open.`}
              className="group flex flex-col items-center outline-none"
            >
              <div className={`ps2-icon relative aspect-square w-[min(130px,34vw)] ${sel === k ? "ps2-icon--on" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.frames[0]?.thumb} alt="" className="size-full rounded-[10px] object-cover" />
                <span className="absolute inset-0 rounded-[10px] bg-[linear-gradient(135deg,rgba(255,255,255,.35),transparent_45%)]" />
              </div>
              {/* the icon's reflection on the floor */}
              <div className="ps2-reflect aspect-[4/1] w-[min(130px,34vw)] overflow-hidden" aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.frames[0]?.thumb} alt="" className="aspect-square w-full -scale-y-100 rounded-[10px] object-cover" />
              </div>
              <span className={`ps2-text mt-1 text-[13px] tracking-[.18em] uppercase ${sel === k ? "opacity-100" : "opacity-60"}`}>{t.title}</span>
              <span className="ps2-dim mt-0.5 text-[11px] tracking-[.12em]">
                {t.frames.length} photos · {t.kb.toLocaleString("en-US")} KB
              </span>
            </button>
          ))}
        </div>

        <div className="ps2-dim relative mt-8 flex justify-end gap-5 text-[11px] tracking-[.15em] uppercase">
          <button type="button" className="hover:text-white" onClick={() => enter(sel)}>
            <Glyph k="circle" /> enter
          </button>
          <button type="button" className="hover:text-white" onClick={() => setPhase("off")}>
            <Glyph k="cross" /> back
          </button>
        </div>
      </div>
        )}
      </div>

      {/* A portal, so no transformed ancestor can trap the fixed viewer inside the panel. */}
      {trip && createPortal(
        <div className="ps2 fixed inset-0 z-[70] flex animate-[fade-in_.3s_both] flex-col" role="dialog" aria-modal="true" aria-label={trip.title} data-lenis-prevent>
          <Haze />
          <div className="relative flex items-center justify-between px-5 pt-5 sm:px-8">
            <p className="ps2-text text-[12px] tracking-[.2em] uppercase sm:text-[13px]">
              {trip.title} · {i + 1} / {trip.frames.length}
            </p>
            <p className="ps2-dim text-[11px] tracking-[.15em] uppercase">{trip.kb.toLocaleString("en-US")} KB</p>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center p-4 sm:p-8">
            {loading ? (
              <div className="w-48 text-center">
                <p className="ps2-text text-[12px] tracking-[.25em] uppercase">Loading...</p>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-1/3 animate-[ps2-load_.65s_linear_both] rounded-full bg-[#b9d6ff]" />
                </div>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={trip.frames[i].src}
                src={trip.frames[i].src}
                alt=""
                className="max-h-full max-w-full animate-[ps2-photo_.5s_cubic-bezier(.16,1,.3,1)_both] rounded-md object-contain shadow-[0_0_60px_rgba(111,168,255,.25)]"
              />
            )}
          </div>

          <div className="ps2-dim relative flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 pb-6 text-[11px] tracking-[.15em] uppercase">
            <button type="button" className="hover:text-white" onClick={() => setI((v) => (v - 1 + trip.frames.length) % trip.frames.length)}>
              <Glyph k="triangle" /> back a photo
            </button>
            <button type="button" className="hover:text-white" onClick={() => setI((v) => (v + 1) % trip.frames.length)} autoFocus>
              <Glyph k="circle" /> next
            </button>
            <button type="button" className="hover:text-white" onClick={() => setOpen(null)}>
              <Glyph k="cross" /> back
            </button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

/** The four controller symbols, in their own colours. */
function Glyph({ k }: { k: "circle" | "cross" | "triangle" }) {
  const c = { circle: "#ff6b6b", cross: "#7fb2ff", triangle: "#5fe3b0" }[k];
  return (
    <svg viewBox="0 0 16 16" className="mr-1 inline size-3.5 -translate-y-px" aria-hidden>
      {k === "circle" && <circle cx="8" cy="8" r="5.5" fill="none" stroke={c} strokeWidth="2" />}
      {k === "cross" && <path d="M3 3 L13 13 M13 3 L3 13" stroke={c} strokeWidth="2" strokeLinecap="round" />}
      {k === "triangle" && <path d="M8 2.5 L14 13 H2 Z" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" />}
    </svg>
  );
}

/** Slow drifting light in the background, like the browser screen. */
function Haze() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="ps2-fog ps2-fog--a" />
      <div className="ps2-fog ps2-fog--b" />
    </div>
  );
}
