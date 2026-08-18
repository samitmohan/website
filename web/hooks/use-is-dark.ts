"use client";

import { useEffect, useState } from "react";

/**
 * Reactive read of the current theme, for the rare client component that has to
 * rebuild itself when the theme flips (CodeMirror, which bakes its theme into
 * an EditorState at construction).
 *
 * The inline head script and ThemeToggle both own the `dark` class on <html>,
 * so watching that class is the entire contract. Starts false and corrects
 * after mount: the server has no theme to render, and the observed value would
 * mismatch anything rendered during hydration.
 */
export function useIsDark(): boolean {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const read = () => setDark(root.classList.contains("dark"));
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return dark;
}
