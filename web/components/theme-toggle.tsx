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
 * A switch rather than a word. It used to read "dark" / "light" in mono, which
 * put a control in a row of names and made the footer a list of five words
 * where four were destinations.
 *
 * The knob says which theme is on without an icon: hollow and left for light,
 * filled and right for dark - the same distinction a sun and a moon make, in
 * the geometry the rest of the chrome is already drawn in. No iconography,
 * because the six hand-drawn marks came out of the chrome for competing with
 * the one drawing on the site.
 *
 * The state is CSS, not React: nothing here renders differently on the server,
 * so the switch is in the right position before hydration and there is
 * nothing for React to mismatch. The button is labelled with the action rather
 * than the state, so it makes no claim the markup cannot back up.
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
    <button
      type="button"
      onClick={toggle}
      className="theme-toggle"
      aria-label="Switch between light and dark theme"
    >
      <span className="theme-track">
        <span className="theme-knob" />
      </span>
    </button>
  );
}
