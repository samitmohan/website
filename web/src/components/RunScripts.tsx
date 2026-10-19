"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    lazyWidget?: (id: string, fn: () => void) => void;
  }
}

/** Mount a widget when its root nears the viewport, not at page load. */
function defineLazyWidget() {
  if (window.lazyWidget) return;
  window.lazyWidget = (id, fn) => {
    const el = document.getElementById(id);
    if (!el) return;
    const io = new IntersectionObserver(
      (entries, obs) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        obs.disconnect();
        try {
          fn();
        } catch (err) {
          console.error("[lazyWidget]", id, err);
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
  };
}

/**
 * Renders trusted HTML from our own markdown and replays its deferred scripts
 * in document order: external ones are awaited so an inline script after a
 * library can rely on it. Also owns the code-copy buttons and post videos.
 */
export function RunScripts({ html, className }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current!;
    defineLazyWidget();
    let cancelled = false;
    (async () => {
      for (const old of Array.from(root.querySelectorAll<HTMLScriptElement>('script[type="text/x-deferred"]'))) {
        if (cancelled) return;
        const s = document.createElement("script");
        for (const a of Array.from(old.attributes)) if (a.name !== "type" && a.name !== "defer") s.setAttribute(a.name, a.value);
        if (old.src) {
          s.async = false;
          await new Promise<void>((done) => {
            s.onload = s.onerror = () => done();
            old.replaceWith(s);
          });
        } else {
          s.textContent = old.textContent;
          old.replaceWith(s);
        }
      }
    })();

    const onClick = (e: MouseEvent) => {
      const btn = (e.target as Element).closest<HTMLElement>("[data-code-copy]");
      if (!btn) return;
      const code = btn.closest("figure")?.querySelector("pre code");
      if (!code) return;
      navigator.clipboard.writeText(code.textContent ?? "").then(() => {
        const label = btn.querySelector("span");
        btn.classList.add("copied");
        if (label) label.textContent = "Copied";
        setTimeout(() => {
          btn.classList.remove("copied");
          if (label) label.textContent = "Copy";
        }, 1400);
      });
    };
    root.addEventListener("click", onClick);

    // Regions that scroll sideways need focus so keyboard users can scroll them.
    for (const el of Array.from(root.querySelectorAll<HTMLElement>("pre, .katex-display, table")))
      if (el.scrollWidth > el.clientWidth && !el.hasAttribute("tabindex")) el.tabIndex = 0;

    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const videos = Array.from(root.querySelectorAll("video"));
    for (const v of videos) {
      v.pause();
      v.removeAttribute("autoplay");
      if (still) v.controls = true;
    }
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => (e.isIntersecting ? (e.target as HTMLVideoElement).play().catch(() => {}) : (e.target as HTMLVideoElement).pause())),
      { threshold: 0.25 },
    );
    if (!still) videos.forEach((v) => io.observe(v));

    return () => {
      cancelled = true;
      root.removeEventListener("click", onClick);
      io.disconnect();
    };
  }, [html]);

  return <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
