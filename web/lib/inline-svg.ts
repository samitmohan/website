import "server-only";
import fs from "fs";
import path from "path";

/**
 * Reads an SVG out of public/ and returns its markup for inlining.
 *
 * The three figures on the site (gradient-descent, blog-backprop, agent-loop)
 * are inlined rather than served through <img> on purpose, and the reason is
 * written into the files themselves: their text and ink use `currentColor`.
 * An SVG loaded through <img> is its own document. It cannot see `.dark` on our
 * <html>, so it can only follow `prefers-color-scheme` - which means a visitor
 * with a light OS who toggles this site to dark gets light figures on a dark
 * page. Inlined, the svg is not the root, `currentColor` inherits from the page,
 * and the toggle drives the artwork.
 *
 * Read once per file per process. These are build-time assets; they cannot
 * change between requests.
 */
const cache = new Map<string, string>();

const PUBLIC_DIR = path.join(process.cwd(), "public");

export function inlineSvg(name: string): string {
  const hit = cache.get(name);
  if (hit) return hit;

  const file = path.join(PUBLIC_DIR, `${name}.svg`);
  // Resolve before reading: name comes from our own call sites today, and this
  // keeps that true if it ever comes from a route param.
  if (!path.resolve(file).startsWith(PUBLIC_DIR)) {
    throw new Error(`inlineSvg: refusing to read outside public/: ${name}`);
  }

  const markup = fs
    .readFileSync(file, "utf8")
    // Drop the intrinsic width/height so CSS owns the size. viewBox stays, so
    // the aspect ratio is still intrinsic and the box cannot shift on load.
    .replace(/^(<svg[^>]*?)\s+width="[^"]*"\s+height="[^"]*"/, "$1")
    // These three files are heavily commented - the contrast measurements and
    // the reasoning behind every colour literal are written into them, which is
    // why they are worth reading. None of that is worth sending to a browser.
    // Stripping it is what keeps `/` under its 15 KB HTML budget with all three
    // figures inlined; the source files stay as verbose as they should be.
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    // Indentation between tags only. Text nodes are never touched, so the
    // labels inside <text> keep exactly the spacing they were authored with.
    .replace(/>\s+</g, "><")
    // The CSS left behind by comment-stripping is mostly blank lines.
    .replace(/\n\s*\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .trim();

  cache.set(name, markup);
  return markup;
}
