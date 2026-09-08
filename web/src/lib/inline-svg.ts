import fs from "fs";
import path from "path";

/**
 * Reads an SVG out of public/ and returns its markup for inlining.
 *
 * The three figures on the site (wordmark, blog-backprop, agent-loop)
 * are inlined rather than served through <img> on purpose: their text and ink
 * use `currentColor`, and an SVG loaded through <img> is its own document, so
 * `currentColor` there resolves against the SVG's own root rather than the
 * page. Inlined, the ink inherits the page's colour and follows hover states
 * and any future palette change with no second copy of each file.
 *
 * Inlining is also what lets the host page drive the drawing's palette. Each
 * file declares `svg { --struct; --brand }`; because an inlined svg is not the
 * document root, a rule in globals.css outranks it, which is how a figure
 * takes the accent of the page it sits on. Through <img> none of that is
 * reachable and every copy would be identical.
 *
 * Read once per file per process in a build, and on every call in dev.
 *
 * The `server-only` import that used to sit at the top of this file is gone
 * with React: there is no client bundle for a Node builtin to leak into.
 *
 * "These are build-time assets; they cannot change between requests" is true
 * of a deployed build and false of the thing you do while working on one. The
 * cache used to be unconditional, so editing a figure - or regenerating one
 * with `npm run figure` - changed nothing on screen until the dev server was
 * restarted, because the first request had already read the old bytes and
 * nothing in the dependency graph knew a file in public/ had moved. Half an
 * hour of "the animation is the same" is the cost of that comment being right
 * about production and silent about dev.
 *
 * These are 13 KB text files, so re-reading them per request in dev is not
 * worth a staleness check on the mtime.
 */
const cache = new Map<string, string>();
const CACHEABLE = import.meta.env.PROD;

const PUBLIC_DIR = path.join(process.cwd(), "public");

export function inlineSvg(name: string): string {
  const hit = CACHEABLE ? cache.get(name) : undefined;
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

  if (CACHEABLE) cache.set(name, markup);
  return markup;
}
