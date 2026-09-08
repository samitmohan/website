"use client";

import { useEffect, useState } from "react";

/**
 * Light/dark toggle. One word, in the nav, like everything else up there.
 *
 * Three states, two of them implicit: with nothing stored the site follows the
 * OS, and clicking stores an explicit choice that overrides it. The stored
 * value is read by an inline script in app/layout.tsx before first paint, so
 * there is no flash of the wrong theme - that script is the reason this
 * component does not have to render anything on the server.
 *
 * Both labels are always in the markup and CSS shows the right one, rather
 * than the component picking after mount. That means the button reads
 * correctly before hydration and before JS at all, and there is nothing for
 * React to mismatch. The label names the theme you would switch *to*.
 */
export function ThemeToggle() {
  // Only used to keep the button in sync if the OS preference changes while
  // no explicit choice is stored; the label itself is CSS.
  const [, force] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => force((n) => n + 1);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function toggle() {
    const root = document.documentElement;
    const dark =
      root.dataset.theme === "dark" ||
      (!root.dataset.theme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    const next = dark ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode, or site data blocked. The choice just does not persist.
    }
  }

  return (
    <button type="button" onClick={toggle} className="site-link theme-toggle">
      <span className="theme-to-dark">dark</span>
      <span className="theme-to-light">light</span>
    </button>
  );
}
