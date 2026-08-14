"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/* Floating action bar anchored beneath a text selection inside a post.
 * Geometry and placement are adapted from Beautiful UI's Selection Actions
 * primitive (beautiful-ui-five.vercel.app, built by Turbo): a 36px pill wraps
 * 28px controls at a 4px inset so the radii stay concentric, and the bar sits
 * under the *last* line of the selection while centering against the full
 * selection bounds. */

type Mode = "idle" | "copied" | "linked";

const ICON = {
  copy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-3.5 w-3.5">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-3.5 w-3.5">
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-3.5 w-3.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-3 w-3">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
};

const control =
  "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[12.5px] text-ink-2 transition-[background-color,color,transform] duration-200 hover:bg-surface-2 hover:text-ink active:scale-[0.96]";

/** Scroll-to-text fragment. Long selections use the start,end form so a quote
 *  spanning paragraphs still resolves. */
function fragment(text: string): string {
  const enc = (s: string) => encodeURIComponent(s).replace(/-/g, "%2D");
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 8) return enc(text);
  return `${enc(words.slice(0, 5).join(" "))},${enc(words.slice(-5).join(" "))}`;
}

const FINE_POINTER = "(hover: hover) and (pointer: fine)";

function subscribePointer(onChange: () => void) {
  const query = window.matchMedia(FINE_POINTER);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function SelectionShare({
  title,
  children,
  social = true,
}: {
  title: string;
  children: React.ReactNode;
  /** Off for pages that carry noindex, where a public share is the wrong offer. */
  social?: boolean;
}) {
  // Touch devices already show a native selection callout; a second bar fights
  // it for the same gesture. The server snapshot is false, so nothing renders
  // until the client resolves the media query.
  const enabled = useSyncExternalStore(
    subscribePointer,
    () => window.matchMedia(FINE_POINTER).matches,
    () => false
  );
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const [anchor, setAnchor] = useState({ x: 0, y: 0 });

  const hostRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const textRef = useRef("");
  const widthRef = useRef(0);
  const prevModeRef = useRef<Mode>("idle");
  const animRef = useRef<Animation | null>(null);

  const place = useCallback(() => {
    const host = hostRef.current;
    const selection = window.getSelection();
    if (!host || !selection || selection.isCollapsed || selection.rangeCount === 0) {
      setOpen(false);
      return;
    }

    const range = selection.getRangeAt(0);
    if (!host.contains(range.commonAncestorContainer)) {
      setOpen(false);
      return;
    }

    const text = selection.toString().trim();
    if (text.length < 2) {
      setOpen(false);
      return;
    }

    const lines = Array.from(range.getClientRects()).filter((r) => r.width > 0);
    const lastLine = lines.at(-1);
    if (!lastLine) {
      setOpen(false);
      return;
    }

    if (text !== textRef.current) {
      textRef.current = text;
      setMode("idle");
    }

    const bounds = range.getBoundingClientRect();
    const hostBounds = host.getBoundingClientRect();
    const half = (widthRef.current || 220) / 2;
    const next = {
      x: Math.round(
        Math.min(
          Math.max(bounds.left - hostBounds.left + bounds.width / 2, half),
          hostBounds.width - half
        )
      ),
      y: Math.round(lastLine.bottom - hostBounds.top + 10),
    };

    setAnchor((current) =>
      current.x === next.x && current.y === next.y ? current : next
    );
    setOpen(true);
  }, []);

  // requestAnimationFrame batches the flood of selectionchange events fired
  // while dragging, so the bar tracks the cursor without thrashing layout.
  useEffect(() => {
    if (!enabled) return;
    const schedule = () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(place);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("selectionchange", schedule);
    window.addEventListener("resize", schedule);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("selectionchange", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("keydown", onKey);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [enabled, place]);

  // Intrinsic width drives the pill. When the label swaps to a confirmation the
  // content jumps, so animate from the last painted width to the new one.
  useLayoutEffect(() => {
    const bar = barRef.current;
    const content = contentRef.current;
    if (!bar || !content) return;

    const nextWidth = Math.ceil(content.getBoundingClientRect().width) + 8;
    const previousWidth = widthRef.current || nextWidth;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (
      !reduce &&
      prevModeRef.current !== mode &&
      Math.abs(nextWidth - previousWidth) > 1
    ) {
      animRef.current?.cancel();
      const animation = bar.animate(
        [{ width: `${previousWidth}px` }, { width: `${nextWidth}px` }],
        { duration: 280, easing: "cubic-bezier(0.2, 0, 0, 1)" }
      );
      animRef.current = animation;
      animation.onfinish = () => {
        animRef.current = null;
      };
    }

    widthRef.current = nextWidth;
    prevModeRef.current = mode;
  }, [mode, open]);

  const flash = (next: Mode) => {
    setMode(next);
    window.setTimeout(() => setMode("idle"), 1600);
  };

  const copyText = () => {
    navigator.clipboard.writeText(textRef.current).then(() => flash("copied"));
  };

  const copyLink = () => {
    const base = window.location.href.split("#")[0];
    navigator.clipboard
      .writeText(`${base}#:~:text=${fragment(textRef.current)}`)
      .then(() => flash("linked"));
  };

  const tweet = () => {
    const base = window.location.href.split("#")[0];
    const quote = `"${textRef.current}"`;
    const body = quote.length > 200 ? `${quote.slice(0, 197)}..."` : quote;
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(`${body}\n\n${title}`)}&url=${encodeURIComponent(base)}`,
      "_blank",
      "noopener,noreferrer"
    );
    setOpen(false);
  };

  return (
    <div ref={hostRef} className="relative">
      {children}

      {enabled && (
        <div
          className="absolute left-0 top-0 z-40"
          style={{
            transform: `translate3d(${anchor.x}px, ${anchor.y}px, 0) translateX(-50%)`,
            transition:
              "transform 280ms var(--motion-ease), opacity 160ms ease-out",
            opacity: open ? 1 : 0,
            pointerEvents: open ? "auto" : "none",
            willChange: "transform",
          }}
        >
          {/* Clicking the bar must not collapse the selection it acts on. */}
          <div
            ref={barRef}
            onMouseDown={(e) => e.preventDefault()}
            className="flex h-9 w-fit select-none items-center gap-0.5 overflow-hidden rounded-full border border-rule bg-surface p-1 text-ink shadow-[var(--shadow-card)]"
            style={open ? { animation: "pop-in 220ms var(--motion-ease) both" } : undefined}
          >
            <div ref={contentRef} className="flex w-fit shrink-0 items-center gap-0.5">
              {mode === "idle" ? (
                <>
                  <button type="button" onClick={copyText} className={control}>
                    {ICON.copy}
                    Copy
                  </button>
                  <button type="button" onClick={copyLink} className={control}>
                    {ICON.link}
                    Link
                  </button>
                  {social && (
                    <>
                      <span className="mx-0.5 h-4 w-px shrink-0 bg-rule" />
                      <button
                        type="button"
                        onClick={tweet}
                        aria-label="Share selection on X"
                        className="flex size-7 shrink-0 items-center justify-center rounded-full text-ink-2 transition-[background-color,color,transform] duration-200 hover:bg-surface-2 hover:text-ink active:scale-[0.96]"
                      >
                        {ICON.x}
                      </button>
                    </>
                  )}
                </>
              ) : (
                <span className="inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap px-2.5 text-[12.5px] text-positive">
                  {ICON.check}
                  {mode === "copied" ? "Copied" : "Link copied"}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
