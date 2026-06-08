"use client";

import { useEffect, useRef } from "react";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function BlogContent({ html, className }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    type LazyWidget = (id: string, fn: () => void) => void;
    const w = window as unknown as { lazyWidget?: LazyWidget };
    if (!w.lazyWidget) {
      w.lazyWidget = (id, fn) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (!("IntersectionObserver" in window)) {
          fn();
          return;
        }
        const io = new IntersectionObserver((entries, obs) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              obs.disconnect();
              try { fn(); } catch (err) { console.error("[lazyWidget]", id, err); }
              break;
            }
          }
        }, { rootMargin: "200px" });
        io.observe(el);
      };
    }

    const scripts = Array.from(root.querySelectorAll("script"));
    for (const old of scripts) {
      const s = document.createElement("script");
      for (const attr of Array.from(old.attributes)) {
        s.setAttribute(attr.name, attr.value);
      }
      s.text = old.textContent ?? "";
      old.parentNode?.replaceChild(s, old);
    }

    const headings = Array.from(root.querySelectorAll("h2, h3, h4"));
    for (const h of headings) {
      if (!h.id) {
        const id = slugify(h.textContent || "");
        if (id) h.id = id;
      }
    }

    const videos = Array.from(root.querySelectorAll("video")) as HTMLVideoElement[];
    const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    for (const v of videos) {
      v.pause();
      v.removeAttribute("autoplay");
      try { v.currentTime = 0; } catch {}
      if (reducedMotion) v.setAttribute("controls", "");
    }
    let videoObs: IntersectionObserver | null = null;
    if (!reducedMotion && "IntersectionObserver" in window && videos.length > 0) {
      videoObs = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            const v = e.target as HTMLVideoElement;
            if (e.isIntersecting) {
              const p = v.play();
              if (p && typeof p.catch === "function") p.catch(() => {});
            } else {
              v.pause();
            }
          }
        },
        { threshold: 0.25 }
      );
      for (const v of videos) videoObs.observe(v);
    }

    const figures = Array.from(root.querySelectorAll("figure[data-rehype-pretty-code-figure]"));
    for (const fig of figures) {
      if (fig.querySelector("[data-blog-copy]")) continue;
      const pre = fig.querySelector("pre");
      const code = fig.querySelector("code");
      if (!pre || !code) continue;

      const lang = code.getAttribute("data-language") || "";
      const figEl = fig as HTMLElement;
      figEl.style.position = "relative";

      const toolbar = document.createElement("div");
      toolbar.setAttribute("data-blog-copy", "");
      toolbar.style.cssText =
        "position:absolute;top:6px;right:8px;display:flex;align-items:center;gap:8px;font-family:var(--font-jetbrains-mono),monospace;font-size:11px;color:var(--muted-foreground);opacity:0.55;transition:opacity 0.15s;pointer-events:none;";

      if (lang) {
        const tag = document.createElement("span");
        tag.textContent = lang;
        tag.style.cssText = "letter-spacing:0.04em;";
        toolbar.appendChild(tag);
      }

      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "copy";
      btn.style.cssText =
        "pointer-events:auto;background:transparent;border:0;color:inherit;cursor:pointer;font:inherit;padding:2px 4px;";
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const text = code.textContent || "";
        navigator.clipboard.writeText(text).then(() => {
          btn.textContent = "copied";
          setTimeout(() => { btn.textContent = "copy"; }, 1200);
        });
      });
      toolbar.appendChild(btn);

      figEl.addEventListener("mouseenter", () => { toolbar.style.opacity = "1"; });
      figEl.addEventListener("mouseleave", () => { toolbar.style.opacity = "0.55"; });

      figEl.appendChild(toolbar);
    }

    return () => {
      if (videoObs) videoObs.disconnect();
    };
  }, [html]);

  return (
    <div
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
