"use client";

import { useEffect } from "react";

type Theme = "light" | "dark";

function current(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === "dark" || set === "light") return set;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Flip the theme, revealing the new one as a circle grown from (x, y). */
export function toggleTheme(x = innerWidth / 2, y = innerHeight / 2) {
  const next: Theme = current() === "dark" ? "light" : "dark";
  const apply = () => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    window.dispatchEvent(new CustomEvent("themechange", { detail: next }));
  };
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || still) return apply();
  const root = document.documentElement.style;
  root.setProperty("--vt-x", `${x}px`);
  root.setProperty("--vt-y", `${y}px`);
  root.setProperty("--vt-r", `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);
  document.startViewTransition(apply);
}

/** Double-click anywhere that is not a control or text the visitor is selecting. */
export function ThemeController() {
  useEffect(() => {
    const onDbl = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("a, button, input, textarea, select, label, canvas, [data-no-theme], .prose")) return;
      getSelection()?.removeAllRanges();
      toggleTheme(e.clientX, e.clientY);
    };
    document.addEventListener("dblclick", onDbl);
    return () => document.removeEventListener("dblclick", onDbl);
  }, []);
  return null;
}
