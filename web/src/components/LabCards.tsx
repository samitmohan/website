"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LabGlyph } from "./LabGlyph";
import { RunScripts } from "./RunScripts";
import { AttentionToy, ConvToy, DropoutToy, SoftmaxToy, TokenizerToy } from "./toys/Toys";

const TOYS = [
  { name: "softmax temperature", el: <SoftmaxToy /> },
  { name: "attention", el: <AttentionToy /> },
  { name: "convolution", el: <ConvToy /> },
  { name: "dropout", el: <DropoutToy /> },
  { name: "tokenizer", el: <TokenizerToy /> },
];

export type PostWidget = { id: string; name: string; blurb: string; post: string; html: string };

const card = "relative grid aspect-[420/460] w-[min(340px,78vw)] shrink-0 snap-start place-items-center overflow-hidden rounded-[28px] bg-surface";

/**
 * A row of cards with a live toy in each; it starts on the text column and
 * runs off the right edge. The widgets from posts are too big for a card, so
 * their cards open the full widget in a sheet.
 */
export function LabCards({ widgets }: { widgets: PostWidget[] }) {
  const [open, setOpen] = useState<PostWidget | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        style={{ marginRight: "calc(50% - 50vw)", paddingRight: "max(16px, calc(50vw - 50%))" }}
        data-lenis-prevent
      >
        {TOYS.map((t) => (
          <figure key={t.name} className="shrink-0">
            <div className={card}>{t.el}</div>
            <figcaption className="mt-2 px-1 text-[13px] text-ink">{t.name}</figcaption>
          </figure>
        ))}
        {widgets.map((w, i) => (
          <figure key={w.id} className="shrink-0">
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

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-end justify-center bg-black/30 backdrop-blur-[2px] sm:items-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            data-lenis-prevent
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={open.name}
              className="max-h-[92dvh] w-full max-w-[720px] overflow-y-auto rounded-t-[28px] bg-bg p-6 shadow-2xl sm:rounded-[28px]"
              initial={{ y: 40, opacity: 0, filter: "blur(10px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: 30, opacity: 0, filter: "blur(10px)" }}
              transition={{ type: "spring", bounce: 0, duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[17px]">{open.name}</h3>
                  <Link href={`/blog/${open.post}`} className="meta hover:text-accent">
                    from the post →
                  </Link>
                </div>
                <button type="button" className="oval" onClick={() => setOpen(null)} autoFocus>
                  close
                </button>
              </div>
              <RunScripts html={open.html} className="prose mt-5" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
