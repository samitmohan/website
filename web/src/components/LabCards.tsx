"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LabGlyph } from "./LabGlyph";
import { RunScripts } from "./RunScripts";
import { WhenNear } from "./WhenNear";
import { AttentionToy, ConvToy, DropoutToy, KvCacheToy, PositionalToy, SoftmaxToy, TokenizerToy } from "./toys/Toys";

const TOYS = [
  { name: "softmax temperature", el: <SoftmaxToy /> },
  { name: "attention", el: <AttentionToy /> },
  { name: "convolution", el: <ConvToy /> },
  { name: "dropout", el: <DropoutToy /> },
  { name: "tokenizer", el: <TokenizerToy /> },
  { name: "kv cache memory", el: <KvCacheToy /> },
  { name: "positional encoding", el: <PositionalToy /> },
];

export type PostWidget = { id: string; name: string; blurb: string; post: string; html: string };

const card = "relative grid aspect-[420/460] w-[min(280px,76vw)] shrink-0 place-items-center overflow-hidden rounded-[24px] bg-surface";

/**
 * A row of cards with a live toy in each; it starts on the text column and
 * runs off the right edge. The widgets from posts are too big for a card, so
 * their cards open the full widget in a sheet.
 */
export function LabCards({ widgets }: { widgets: PostWidget[] }) {
  const [open, setOpen] = useState<PostWidget | null>(null);
  const row = useRef<HTMLDivElement>(null);
  const [atEnd, setAtEnd] = useState(false);
  const page = (dir: number) => row.current?.scrollBy({ left: dir * 292, behavior: "smooth" });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div
        ref={row}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2"
        onScroll={(e) => {
          const el = e.currentTarget;
          setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
        }}
        // The fade at the right edge says there is more; it lifts at the end of the row.
        style={atEnd ? undefined : { maskImage: "linear-gradient(to right, #000 85%, transparent)", WebkitMaskImage: "linear-gradient(to right, #000 85%, transparent)" }}
        data-lenis-prevent
      >
        {TOYS.map((t) => (
          <figure key={t.name} className="shrink-0 snap-start">
            <WhenNear className={card}>{t.el}</WhenNear>
            <figcaption className="mt-2 px-1 text-[13px] text-ink">{t.name}</figcaption>
          </figure>
        ))}
        {widgets.map((w, i) => (
          <figure key={w.id} className="shrink-0 snap-start">
            <button type="button" onClick={() => setOpen(w)} className={`${card} group text-left`}>
              <LabGlyph i={i} />
              <span className="absolute inset-x-6 bottom-6">
                <span className="block text-[13px]">{w.blurb}</span>
                <span className="meta mt-2 inline-block rounded-full bg-paper px-2.5 py-1 text-ink transition-colors group-hover:text-accent">open it →</span>
              </span>
            </button>
            <figcaption className="mt-2 px-1 text-[13px] text-ink">{w.name}</figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-3 flex justify-end gap-1.5">
        <button type="button" className="pill size-9 !p-0" onClick={() => page(-1)} aria-label="Previous widget">
          ←
        </button>
        <button type="button" className="pill size-9 !p-0" onClick={() => page(1)} aria-label="Next widget">
          →
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex animate-[fade-in_.25s_both] items-end justify-center bg-black/30 backdrop-blur-[2px] sm:items-center sm:p-6"
          onClick={() => setOpen(null)}
          data-lenis-prevent
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={open.name}
            className="max-h-[92dvh] w-full max-w-[720px] animate-[sheet-in_.5s_cubic-bezier(.16,1,.3,1)_both] overflow-y-auto rounded-t-[28px] bg-bg p-6 shadow-2xl sm:rounded-[28px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[17px]">{open.name}</h3>
                <Link href={`/blog/${open.post}`} className="meta hover:text-accent">
                  from the post →
                </Link>
              </div>
              <button type="button" className="pill" onClick={() => setOpen(null)} autoFocus>
                close
              </button>
            </div>
            <RunScripts html={open.html} className="prose mt-5" />
          </div>
        </div>
      )}
    </>
  );
}
