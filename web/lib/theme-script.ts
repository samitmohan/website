// Kept in step with --background in globals.css.
export const CHROME_COLOR = { light: "#FAFAFA", dark: "#0D0D0F" } as const;

export const THEME_STORAGE_KEY = "theme";

// Runs in <head> before first paint, so a stored dark preference never flashes
// light. Replaces next-themes: the site has two themes, ignores
// prefers-color-scheme, and needs no provider or context to hold one boolean.
//
// This also owns the theme-color meta tag. layout.tsx deliberately does not
// export viewport.themeColor: two writers on one tag means the wrong one wins
// on load, and browser chrome ends up light around a dark page.
export const THEME_SCRIPT = `
try {
  var d = localStorage.getItem("${THEME_STORAGE_KEY}") === "dark";
  var e = document.documentElement;
  e.classList.toggle("dark", d);
  e.style.colorScheme = d ? "dark" : "light";
  var m = document.querySelector('meta[name="theme-color"]');
  if (!m) {
    m = document.createElement("meta");
    m.name = "theme-color";
    document.head.appendChild(m);
  }
  m.content = d ? "${CHROME_COLOR.dark}" : "${CHROME_COLOR.light}";
} catch (_) {}
`
  .replace(/\s+/g, " ")
  .trim();
