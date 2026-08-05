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

    const COPY_ICON =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    const CHECK_ICON =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';

    const figures = Array.from(root.querySelectorAll("figure[data-rehype-pretty-code-figure]"));
    for (const fig of figures) {
      if (fig.querySelector(".code-header")) continue;
      const pre = fig.querySelector("pre");
      const code = fig.querySelector("code");
      if (!pre || !code) continue;

      const lang = code.getAttribute("data-language") || "";
      const title = fig.querySelector("figcaption")?.textContent || "";

      const header = document.createElement("div");
      header.className = "code-header";

      const label = document.createElement("span");
      label.className = "code-lang";
      label.textContent = title || lang;
      header.appendChild(label);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "code-copy";
      btn.setAttribute("aria-label", "Copy code");
      const setLabel = (icon: string, text: string) => {
        btn.innerHTML = `${icon}<span>${text}</span>`;
      };
      setLabel(COPY_ICON, "Copy");
      let resetTimer: ReturnType<typeof setTimeout> | undefined;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(code.textContent || "").then(() => {
          btn.classList.add("copied");
          setLabel(CHECK_ICON, "Copied");
          if (resetTimer) clearTimeout(resetTimer);
          resetTimer = setTimeout(() => {
            btn.classList.remove("copied");
            setLabel(COPY_ICON, "Copy");
          }, 1400);
        });
      });
      header.appendChild(btn);

      fig.insertBefore(header, fig.firstChild);
    }

    return () => {
      if (videoObs) videoObs.disconnect();
    };
  }, [html]);

  // Post HTML carries inline <style>/<script> widgets. The browser runs those
  // scripts while parsing the server response, so the DOM has already been
  // mutated by the time React hydrates and it flags the innerHTML as changed.
  // The markup is authored, not derived from state, so there is nothing for
  // React to reconcile here.
  return (
    <div
      ref={ref}
      className={className}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
