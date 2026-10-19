"use client";

import { useEffect, useState } from "react";

export type Trip = { title: string; frames: { src: string; thumb: string }[] };

/** Side A takes the first half of the photos, side B the rest. */
const trackName = (i: number, n: number) => {
  const half = Math.ceil(n / 2);
  return i < half ? `A${i + 1}` : `B${i - half + 1}`;
};

/**
 * Trips as records in a crate. Hover lifts a sleeve; click pulls it out:
 * the record slides from the sleeve and spins with the current photo on its
 * label, and the photos are its tracklist.
 */
export function Crate({ records }: { records: Trip[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const [track, setTrack] = useState(0);

  useEffect(() => {
    if (open === null) return;
    const n = records[open].frames.length;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setTrack((t) => Math.min(n - 1, t + 1));
      if (e.key === "ArrowLeft") setTrack((t) => Math.max(0, t - 1));
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open, records]);

  const rec = open === null ? null : records[open];
  const photo = rec?.frames[track];

  return (
    <>
      <div className="mx-auto max-w-[520px]" style={{ perspective: "900px" }}>
        <div className="relative pt-16">
          <div className="relative flex h-[230px] items-end justify-center gap-0 [transform:rotateX(8deg)]">
            {records.map((r, i) => (
              <button
                key={r.title}
                type="button"
                onClick={() => {
                  setTrack(0);
                  setOpen(i);
                }}
                aria-label={`Open ${r.title}, ${r.frames.length} photos`}
                className="group relative -mx-6 w-[210px] shrink-0 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] first:ml-0 last:mr-0 hover:z-20 hover:-translate-y-14 focus-visible:z-20 focus-visible:-translate-y-14"
                style={{ zIndex: i, rotate: `${(i % 2 ? 1 : -1) * (2 + i)}deg` }}
              >
                <Sleeve r={r} />
              </button>
            ))}
          </div>
          {/* the crate's front board covers the bottom of the sleeves */}
          <div className="relative z-30 -mt-16 h-24 rounded-b-md rounded-t-sm bg-[#b57b43] shadow-[0_14px_24px_-12px_rgba(0,0,0,.5)]">
            <div className="absolute inset-x-0 top-0 h-2 rounded-t-sm bg-[#c98d52]" />
            <div className="absolute inset-x-6 top-1/2 h-px bg-[#8f5e30]/50" />
            <div className="absolute top-1/2 left-1/2 h-5 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8f5e30]/60" />
          </div>
        </div>
        <p className="mt-4 text-center font-serif text-[15px] text-muted italic">pull a record out</p>
      </div>

      {rec && photo && (
        <div
          className="fixed inset-0 z-[70] flex animate-[fade-in_.25s_both] items-center justify-center overflow-y-auto bg-[#0e0b08]/96 p-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(null)}
          data-lenis-prevent
        >
          <div role="dialog" aria-modal="true" aria-label={rec.title} className="grid w-full max-w-[980px] gap-8 md:grid-cols-[1fr_260px]">
            <div>
              {/* sleeve and record */}
              <div className="relative mx-auto aspect-[2/1] w-full max-w-[640px]">
                <div className="absolute top-[6%] left-[38%] aspect-square h-[88%] animate-[record-out_.9s_cubic-bezier(.16,1,.3,1)_.15s_both]">
                  <div className="size-full animate-[spin_3.6s_linear_infinite] rounded-full bg-[radial-gradient(circle,#1a1a1a_0_30%,#0b0b0b_31%_100%)] shadow-[0_10px_30px_rgba(0,0,0,.6)]">
                    <div className="absolute inset-[6%] rounded-full border border-white/5" />
                    <div className="absolute inset-[14%] rounded-full border border-white/5" />
                    <div className="absolute inset-[22%] rounded-full border border-white/5" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.thumb} alt="" className="absolute inset-[31%] size-[38%] rounded-full object-cover" />
                    <div className="absolute top-1/2 left-1/2 size-[3%] -translate-1/2 rounded-full bg-[#f3eadb]" />
                  </div>
                </div>
                <div className="absolute top-0 left-0 z-10 aspect-square h-full">
                  <Sleeve r={rec} />
                </div>
              </div>
              {/* the current track, large */}
              <figure className="mx-auto mt-6 max-w-[640px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img key={photo.src} src={photo.src} alt="" className="max-h-[52dvh] w-full animate-[fade-in_.4s_both] rounded-sm object-contain" />
                <figcaption className="mt-2 flex justify-between font-mono text-[11px] text-[#f3eadb]/70">
                  <span>
                    {rec.title} · {trackName(track, rec.frames.length)}
                  </span>
                  <span>
                    {track + 1} / {rec.frames.length}
                  </span>
                </figcaption>
              </figure>
            </div>

            <div className="text-[#f3eadb]">
              <div className="flex items-start justify-between">
                <h3 className="font-serif text-[32px] leading-none font-normal text-[#f3eadb]">{rec.title}</h3>
                <button type="button" className="pill !bg-white/10 !text-[#f3eadb] hover:!bg-white/20" onClick={() => setOpen(null)} autoFocus>
                  close
                </button>
              </div>
              <ol className="mt-5 grid grid-cols-2 gap-1.5 md:grid-cols-1">
                {rec.frames.map((f, i) => (
                  <li key={f.src}>
                    <button
                      type="button"
                      onClick={() => setTrack(i)}
                      aria-current={i === track ? "true" : undefined}
                      className={`flex w-full items-center gap-3 rounded-md p-1.5 text-left font-mono text-[12px] transition-colors ${i === track ? "bg-white/15 text-white" : "text-[#f3eadb]/70 hover:bg-white/8"}`}
                    >
                      <span className="w-6">{trackName(i, rec.frames.length)}</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f.thumb} alt="" loading="lazy" className="h-8 w-12 rounded-[2px] object-cover" />
                      {i === track && <span className="ml-auto text-[#ff4a3d]">▶</span>}
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** A record sleeve: the trip's first photo as the cover, the title on a sticker. */
function Sleeve({ r }: { r: Trip }) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-[3px] bg-[#1b140f] shadow-[0_12px_24px_-10px_rgba(0,0,0,.55)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={r.frames[0]?.thumb} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(0,0,0,.55))]" />
      <span className="absolute top-3 right-3 rounded-full bg-[#fbf8f2] px-2.5 py-1 font-mono text-[10px] text-[#141414]">
        {r.frames.length} tracks
      </span>
      <span className="absolute bottom-3 left-3 font-serif text-[30px] leading-none text-white">{r.title}</span>
    </div>
  );
}
