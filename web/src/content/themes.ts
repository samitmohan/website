/**
 * The left rail's colour themes. `swatch` is the colour itself, as named; the
 * CSS holds the readable accent shade for each. The first entry is the base
 * palette in the CSS and sets no data-accent attribute. The site's default is
 * "blonde": <html> ships with data-accent="blonde", and the boot script in
 * layout.tsx removes it when a visitor has saved crimson.
 */
export const THEMES = [
  { id: "crimson", label: "crimson red", swatch: "#dc143c" },
  { id: "light-green", label: "light green", swatch: "#9fdc8a" },
  { id: "ubuntu", label: "ubuntu purple", swatch: "#77216f" },
  { id: "vader", label: "darth vader black", swatch: "#0b0b0c" },
  { id: "blonde", label: "frank ocean's head", swatch: "#8bd450" },
] as const;

export const THEME_IDS: readonly string[] = THEMES.map((t) => t.id);
