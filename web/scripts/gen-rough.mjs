#!/usr/bin/env node
/**
 * Generates the rough-drawn marks in public/rough/ from drawably's geometry
 * primitives.
 *
 * Run by hand (`npm run rough`), not by the build. The output is committed, so
 * a deploy never depends on the package resolving and the marks cannot drift
 * between builds. drawably stays a devDependency: nothing it ships reaches the
 * browser.
 *
 * Why generate rather than import drawably/react:
 *
 *   - Its React controls draw inside useEffect, so every one of them is a
 *     client component. These marks are decoration on otherwise static pages
 *     and have no business pulling a client boundary onto them.
 *   - The blog pipeline is remark -> rehype-stringify to an HTML string, not
 *     MDX (lib/markdown.ts), so a React decoration cannot appear inside a post
 *     at all. A generated SVG can.
 *   - drawably/style.css sets `font-family: Inter, system-ui` on its own
 *     components, which fights the site's tokens, and it is not tree-shaken:
 *     1.65 KB gzip whether you use one control or sixteen.
 *
 * The primitives are pure functions of (geometry, seed) returning an SVG path
 * `d` string, seeded through mulberry32. Same seed, byte-identical path - which
 * is what makes committing the output sane. The seeds below are arbitrary and
 * chosen by eye; changing one redraws that mark.
 */
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { roughLine } from "drawably";

const OUT = path.join(import.meta.dirname, "..", "public", "rough");

/**
 * pathLength normalises the path to 100 user units no matter how long it
 * actually is, so CSS can dash-animate the stroke with a literal 100 instead
 * of measuring the geometry at runtime with getTotalLength(). That is the whole
 * reason these can animate with no JS.
 *
 * No width/height: inlineSvg strips those anyway, and CSS owns the box.
 */
function svg({ w, h, d, title }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-hidden="true"><title>${title}</title><path pathLength="100" d="${d}"/></svg>\n`;
}

const marks = {
  /* The gesture under the "samit" wordmark. Drawn at 200x14 and stretched to
     the width of the word; the wobble scales with it, which is what keeps it
     reading as one stroke rather than as a texture. Roughness is low on
     purpose - at 1.0 a 200-unit line wanders far enough to look like a
     mistake under type this size. */
  underline: svg({
    w: 200,
    h: 14,
    title: "underline",
    d: roughLine(3, 7, 197, 7, { seed: 20260902, roughness: 0.7 }),
  }),
};

mkdirSync(OUT, { recursive: true });
for (const [name, markup] of Object.entries(marks)) {
  const file = path.join(OUT, `${name}.svg`);
  writeFileSync(file, markup);
  console.log(`  ${path.relative(process.cwd(), file)}  ${markup.length} B`);
}
