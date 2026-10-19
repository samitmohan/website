"use client";

import { Clock } from "./Clock";
import { toggleTheme } from "./ThemeController";

export function Footer() {
  return (
    <footer className="mt-24 flex items-center justify-between gap-4 border-t border-hairline pt-6">
      <span className="meta">
        go train something{" "}
        <button
          type="button"
          onClick={(e) => toggleTheme(e.clientX, e.clientY)}
          className="ml-2 underline decoration-hairline underline-offset-4 hover:text-accent"
          title="or double-click anywhere"
        >
          lights
        </button>
      </span>
      <Clock />
    </footer>
  );
}
