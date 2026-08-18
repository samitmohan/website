"use client";

import { CHROME_COLOR, THEME_STORAGE_KEY } from "@/lib/theme-script";

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

// No state and no effect. Both icons always render and .dark in globals.css
// picks which one shows, so the button's markup never depends on the theme and
// there is nothing to hydrate or mismatch.
function toggleTheme() {
  const dark = document.documentElement.classList.toggle("dark");
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
  localStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light");
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = dark ? CHROME_COLOR.dark : CHROME_COLOR.light;
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      onClick={toggleTheme}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-transparent text-ink-2 transition-colors duration-200 hover:border-rule hover:bg-surface hover:text-ink ${className}`}
    >
      {SunIcon}
      {MoonIcon}
    </button>
  );
}
