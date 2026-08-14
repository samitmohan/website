"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

// Kept in step with --background in globals.css.
const CHROME_COLOR = { light: "#FAFAFA", dark: "#0D0D0F" } as const;

const SunIcon = (
  <svg
    className="theme-icon theme-icon-sun"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const MoonIcon = (
  <svg
    className="theme-icon theme-icon-moon"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  // The static themeColor in layout.tsx only covers the light default. Track
  // the theme actually in effect, including a dark value restored from
  // localStorage on load, so mobile browser chrome matches the page.
  useEffect(() => {
    const color = CHROME_COLOR[resolvedTheme === "dark" ? "dark" : "light"];
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) meta.content = color;
  }, [resolvedTheme]);

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-transparent text-ink-2 transition-colors duration-200 hover:border-rule hover:bg-surface hover:text-ink ${className}`}
    >
      {SunIcon}
      {MoonIcon}
    </button>
  );
}
