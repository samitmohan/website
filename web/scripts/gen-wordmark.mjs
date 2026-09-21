#!/usr/bin/env node
/**
 * Generates public/wordmark.svg, the name at the top of the homepage.
 *
 * Run by hand (`npm run figure`). The output is committed like the other
 * drawings in public/, so a deploy never depends on the font parsing and the
 * mark cannot drift between builds.
 *
 * What it draws: "samit" as ONE continuous pen stroke. Charter's outlines for
 * those five letters are seven closed contours - s(1), a(2, bowl and counter),
 * m(1), i(2, stem and tittle), t(1) - and a pen plotter sent this text would
 * draw each one and travel to the next without lifting. That is what this
 * emits: seven contours joined by six straight travel segments, in one path,
 * with no `M` after the first and no `Z` anywhere.
 *
 * The travel segments are the point, not a compromise. They are the only part
 * of the drawing that is not a letter, and they are what makes it read as one
 * machine drawing one name rather than as an outlined font.
 *
 * The letterforms are emitted a second time as a fill group at
 * fill-opacity:0. The stroke draws over 1400ms, then the fill inks in over
 * 250ms, and the mark's resting state is solid Charter - visually identical to
 * live text. Whoever just arrived sees a drawing; whoever scrolls back sees
 * typography. It runs once. Nothing on this page loops.
 *
 * The face is Instrument Serif, which is what the wordmark was set in before
 * this became a drawing - Samit asked for that back. It is the wordmark's
 * alone; everything else on the site is Charter.
 *
 * It costs visitors nothing. The wordmark is a drawing, so the font is only
 * ever read here at build time and never shipped: scripts/fonts/ is outside
 * public/ for exactly that reason. Which also means the display face can be
 * any size on disk without anyone paying for it - and Instrument Serif no
 * longer has to be a Google Fonts request on every route.
 *
 * scripts/fonts/ also holds lmroman10-regular.otf, Knuth's Computer Modern.
 * Switching the FONT constant to it is the whole change; it is wider and
 * rounder where Instrument Serif is narrow and high-contrast. Update the
 * multiplier in .wordmark-word to whatever this prints when you do.
 */
import { writeFileSync } from "fs";
import path from "path";
import { openSync } from "fontkit";
import sharp from "sharp";

const HERE = import.meta.dirname;
const FONT = path.join(HERE, "fonts", "InstrumentSerif-Regular.ttf");
const OUT = path.join(HERE, "..", "public", "wordmark.svg");

const WORD = "samit";
/* Font units are 1000/em here; 0.1 puts the viewBox in the same ballpark as
   the rendered pixel size, which keeps the path data short and makes the
   stroke width below readable as "about a pixel". */
const S = 0.1;
/* Half the stroke width plus its round cap, in viewBox units, doubled for
   margin. The measured edge clearance at the real render size is printed
   below; if it reads 0 the mark is clipping and this is the number to raise. */
const PAD = 2;
/* The pen. Off since 2026-09-20: the homepage opens on one blur-in stagger, and
   a name that spends 1.65s writing itself in the middle of it is a second
   entrance on the same load. The mark now arrives with the rest of the page on
   the blur-in in globals.css.

   Everything that draws it is still below - flip this to true and re-run
   `npm run figure` to put it back. Off, the file is the inked outline alone:
   10.1 KB -> 4.9 KB, and that file is inlined into the homepage HTML. */
const PEN = false;

const DRAW_MS = 1400;
const INK_MS = 250;

/* ------------------------------------------------------------------ outline */

const font = openSync(FONT);
const run = font.layout(WORD);

/**
 * One closed contour as a start node plus the segments that walk back to it.
 * Segments are {c: "L"|"Q"|"C", ctrl?, c1?, c2?, to} in SVG coordinates - y
 * already flipped, because font y goes up and SVG y goes down.
 *
 * Both curve kinds, because both kinds of font turn up here: a TrueType outline
 * is quadratic and a CFF/PostScript one is cubic. Latin Modern is CFF, Charter
 * is TrueType, and a generator that only knew one of them would fail on the
 * other - which is exactly what it did, loudly, the first time it was pointed
 * at Latin Modern.
 */
function contoursOf(glyph, dx) {
  const out = [];
  const P = (x, y) => [(x + dx) * S, -y * S];
  let cur = null;

  const close = () => {
    if (!cur) return;
    // closePath implies a line back to the start when the pen is not there.
    const [lx, ly] = cur.segs.length
      ? cur.segs[cur.segs.length - 1].to
      : cur.start;
    if (Math.hypot(lx - cur.start[0], ly - cur.start[1]) > 1e-9) {
      cur.segs.push({ c: "L", to: cur.start });
    }
    if (cur.segs.length) out.push(cur);
    cur = null;
  };

  for (const cmd of glyph.path.commands) {
    const a = cmd.args;
    switch (cmd.command) {
      case "moveTo":
        close();
        cur = { start: P(a[0], a[1]), segs: [] };
        break;
      case "lineTo":
        cur.segs.push({ c: "L", to: P(a[0], a[1]) });
        break;
      case "quadraticCurveTo":
        cur.segs.push({ c: "Q", ctrl: P(a[0], a[1]), to: P(a[2], a[3]) });
        break;
      case "bezierCurveTo":
        cur.segs.push({
          c: "C",
          c1: P(a[0], a[1]),
          c2: P(a[2], a[3]),
          to: P(a[4], a[5]),
        });
        break;
      case "closePath":
        close();
        break;
      default:
        throw new Error(
          `unhandled path command "${cmd.command}" in "${WORD}". This ` +
            `generator handles moveTo/lineTo/closePath plus quadratic ` +
            `(TrueType) and cubic (CFF) curves; add the new one to seg() and ` +
            `to the control points in the bounding box as well.`,
        );
    }
  }
  close();
  return out;
}

const contours = [];
let pen = 0;
for (let i = 0; i < run.glyphs.length; i++) {
  contours.push(...contoursOf(run.glyphs[i], pen));
  pen += run.positions[i].xAdvance;
}
/* Not an assertion on the number, because a different face legitimately gives
   a different one - a single-storey `a` would drop to six. But zero or one is
   a parse that went wrong rather than a font with an opinion. */
if (contours.length < 5) {
  throw new Error(
    `only ${contours.length} contours for "${WORD}" - that is a failed parse, ` +
      `not a typeface. Check the font actually contains these glyphs.`,
  );
}

/* --------------------------------------------------------------- pen routing */

/** Every on-curve node of a contour, in order, starting at its start point. */
const nodesOf = (k) => [k.start, ...k.segs.map((s) => s.to)];

/**
 * Re-cut a closed contour so it begins at node j. A loop can start anywhere,
 * and starting it where the pen arrives is what lets the travel stay on the
 * baseline instead of cutting across the letter.
 */
function rotate(k, j) {
  if (j === 0) return k;
  const n = k.segs.length;
  const segs = [];
  for (let i = 0; i < n; i++) segs.push(k.segs[(j + i) % n]);
  return { start: nodesOf(k)[j], segs };
}

/**
 * The route is not the shortest one. Shortest is a scribble: greedy
 * nearest-node over these seven contours travels 242.5 units across a mark
 * only 234.3 units wide, in six diagonals that cut over the letters, and
 * re-cutting each contour to meet the pen makes it worse rather than better
 * (264.6 units, and the order backtracks t before the tittle of the i).
 * Both measured.
 *
 * So the travel is routed rather than minimised: it all runs along the
 * baseline. The pen starts at the left edge on the baseline, runs right, rises
 * into each contour where that contour meets the baseline, traces it, drops
 * back down, and carries on right to the next. Every horizontal link lies on
 * one line, which is a rule the letters grow out of rather than six diagonals
 * over them - and because the path is drawn left to right, the animation is a
 * rule extending with the letters blooming off it as it passes.
 *
 * Two contours do not touch the baseline: the counter of the a and the tittle
 * of the i. Those get a vertical spur up and back down. The i's lies along its
 * own stem and is invisible; the a's crosses the bowl and reads as
 * construction, which is the honest thing for it to look like.
 */
const BASE = 0; // font y=0 is the baseline, and P() flips y, so SVG y=0 too.

/**
 * Where the pen enters a contour: its lowest node, by distance from the
 * baseline in y alone. Ignoring x is what makes every spur vertical - the pen
 * runs along the baseline to directly beneath the entry and rises straight up.
 * A vertical line through the bowl of the a reads as a construction line; the
 * diagonal that a nearest-point entry produces there reads as a scratch.
 */
function entryOf(k) {
  const nodes = nodesOf(k);
  let at = 0;
  let best = Infinity;
  // The final node is the start again after closing, so it is the same stop.
  for (let i = 0; i < k.segs.length; i++) {
    const d = Math.abs(nodes[i][1] - BASE);
    if (d < best - 1e-9 || (Math.abs(d - best) < 1e-9 && nodes[i][0] < nodes[at][0])) {
      [best, at] = [d, i];
    }
  }
  return { at, p: nodes[at] };
}

/* Left to right by entry point. Deterministic, so the committed file is
   stable, and no ordering search is needed at all. */
const route = contours
  .map((k) => ({ k, e: entryOf(k) }))
  .sort((a, b) => a.e.p[0] - b.e.p[0] || a.e.p[1] - b.e.p[1])
  .map(({ k, e }) => ({ ...rotate(k, e.at), entry: e.p }));

/* ------------------------------------------------------------------ emitting */

const f = (n) => {
  const r = Math.round(n * 10) / 10;
  return Object.is(r, -0) ? "0" : String(r);
};
const seg = (s) => {
  if (s.c === "L") return `L${f(s.to[0])} ${f(s.to[1])}`;
  if (s.c === "Q")
    return `Q${f(s.ctrl[0])} ${f(s.ctrl[1])} ${f(s.to[0])} ${f(s.to[1])}`;
  return (
    `C${f(s.c1[0])} ${f(s.c1[1])} ${f(s.c2[0])} ${f(s.c2[1])} ` +
    `${f(s.to[0])} ${f(s.to[1])}`
  );
};

/* One path. `M` once, on the baseline at the left edge; after that the pen
   only ever moves along ink, along the baseline, or up a spur to a contour
   that does not reach it. It never lifts: no second `M`, no `Z`. */
const nodes0 = route.flatMap((k) => nodesOf(k).map((p) => p[0]));
const X_L = Math.min(...nodes0);
const X_R = Math.max(...nodes0);

let travel = 0;
const link = (from, to) => {
  travel += Math.hypot(to[0] - from[0], to[1] - from[1]);
  return `L${f(to[0])} ${f(to[1])}`;
};

let at = [X_L, BASE];
let stroke = `M${f(at[0])} ${f(at[1])}`;
for (const k of route) {
  const foot = [k.entry[0], BASE];
  // Along the baseline to under the contour, then up the spur into it. When
  // the contour already meets the baseline these collapse to one short move.
  stroke += link(at, foot);
  stroke += link(foot, k.entry);
  stroke += k.segs.map(seg).join("");
  // Tracing a closed contour returns the pen to where it entered.
  stroke += link(k.entry, foot);
  at = foot;
}
stroke += link(at, [X_R, BASE]);

/* The same letterforms as closed subpaths, for the fill that arrives after the
   stroke finishes. Charter's contours wind in opposite directions, so the
   default nonzero rule punches the counters out on its own. */
const fill = contours
  .map(
    (k) =>
      `M${f(k.start[0])} ${f(k.start[1])}${k.segs.map(seg).join("")}Z`,
  )
  .join("");

/* Control points count. A quadratic can bulge outside the box its endpoints
   describe, which is the difference fontkit documents between bbox and cbox,
   and on the s and the t it is enough to clip the mark at the right edge. This
   is the conservative box; any slack it adds is slack PAD was providing. */
const pts = contours.flatMap((k) => [
  k.start,
  ...k.segs.flatMap((g) =>
    g.c === "Q" ? [g.ctrl, g.to] : g.c === "C" ? [g.c1, g.c2, g.to] : [g.to],
  ),
]);
const xs = pts.map((p) => p[0]);
const ys = pts.map((p) => p[1]);
const minX = Math.min(...xs) - PAD;
const minY = Math.min(...ys) - PAD;
const W = Math.max(...xs) + PAD - minX;
const H = Math.max(...ys) + PAD - minY;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f(minX)} ${f(minY)} ${f(W)} ${f(H)}" role="img">
<title>samit</title>
<desc>${
  PEN
    ? "The word samit drawn as a single unbroken pen stroke: the seven contours of the five letters, joined by six straight travel segments, in the order a pen plotter would take them."
    : "The word samit, set in Charter and cut as a single filled outline."
}</desc>
${
  PEN
    ? `<style><![CDATA[
  /* 0.6 viewBox units, and in viewBox units on purpose - the pen has to stay
     thinner than the thinnest part of the letterform or both sides of a
     hairline merge and the outline fills in solid. Charter's thin strokes are
     about 0.7 units here, so 0.8 starts closing them and 1.25 loses the s
     entirely. Measured on a rendered ladder at 0.3 / 0.45 / 0.6 / 0.8 / 1.25.
     A non-scaling stroke would hold one pixel width at every size and so eat
     the counters on a phone; scaling with the box keeps the ratio. */
  .wm-pen {
    fill: none;
    stroke: currentColor;
    stroke-width: 0.6;
    stroke-linecap: round;
    stroke-linejoin: round;
    /* pathLength normalises the path to 100 units, so the dash animation is a
       literal 100 and needs no getTotalLength() at runtime. That is the whole
       reason this animates with no JS. */
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation:
      wm-draw ${DRAW_MS}ms var(--motion-draw, cubic-bezier(0.16,1,0.3,1)) forwards,
      wm-lift ${INK_MS}ms linear ${DRAW_MS}ms forwards;
  }
  /* Arrives as the pen lifts, so the mark settles into plain solid Charter and
     the drawing leaves nothing behind - no outline halo, no leftover rule. */
  .wm-ink {
    fill: currentColor;
    fill-opacity: 0;
    animation: wm-ink ${INK_MS}ms linear ${DRAW_MS}ms forwards;
  }
  @keyframes wm-draw { to { stroke-dashoffset: 0; } }
  @keyframes wm-lift { to { opacity: 0; } }
  @keyframes wm-ink  { to { fill-opacity: 1; } }
  /* Motion off: the resting state, with no flash of outline on the way to it. */
  @media (prefers-reduced-motion: reduce) {
    .wm-pen { animation: none; stroke-dashoffset: 0; opacity: 0; }
    .wm-ink { animation: none; fill-opacity: 1; }
  }
]]></style>`
    : `<style><![CDATA[ .wm-ink { fill: currentColor; } ]]></style>`
}
<path class="wm-ink" d="${fill}"/>${PEN ? `\n<path class="wm-pen" pathLength="100" d="${stroke}"/>` : ""}
</svg>
`;

writeFileSync(OUT, svg);

/* ------------------------------------------------------------------ measured */

/* globals.css sizes .wordmark-word as clamp(...) * emWide, so that the drawn
   name is exactly as big as the live text it replaced. Both numbers below are
   what that rule has to agree with. */
const emWide = (W * (1 / S)) / font.unitsPerEm;
console.log(`  ${path.relative(process.cwd(), OUT)}  ${svg.length} B`);
console.log(`  viewBox      ${f(W)} x ${f(H)}  (aspect ${(W / H).toFixed(3)})`);
console.log(`  width        ${emWide.toFixed(3)}em   <- .wordmark-word multiplier`);
console.log(`  advance      ${(run.advanceWidth / font.unitsPerEm).toFixed(3)}em of live "${WORD}"`);
console.log(`  contours     ${contours.length}, baseline travel ${travel.toFixed(1)} units`);
console.log(`  stroke d     ${stroke.length} B    fill d  ${fill.length} B`);

/* The mark is 96px tall at most on the page only if the CSS says so; what the
   CSS actually sets is the width. Rasterise at the real one and report the ink,
   because "it generated" is not the same as "it looks like a word". */
const PX = 227;
/* The file's own CSS is an animation, and a rasteriser renders the state
   before it runs: ink still at fill-opacity 0, pen still dashed to nothing.
   So measure the resting state explicitly - solid letterforms, no pen - which
   is what the mark actually looks like on the page for all but its first
   1.65 seconds. */
const rest = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f(minX)} ${f(minY)} ${f(W)} ${f(H)}"><path d="${fill}" fill="#141414"/></svg>`;
const png = await sharp(Buffer.from(rest), { density: 600 })
  .resize({ width: PX })
  .png()
  .toBuffer();
const meta = await sharp(png).metadata();
const { data, info } = await sharp(png)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
let lit = 0;
for (let i = 3; i < data.length; i += info.channels) if (data[i] > 8) lit++;
const px = info.width * info.height;
console.log(
  `  raster       ${meta.width}x${meta.height}px, ink ${((lit / px) * 100).toFixed(1)}% of ${px} px`,
);

/**
 * Blank pixels between the ink and each edge. Zero on any side means PAD is
 * too small and the mark is clipping. Both states get measured: the resting
 * letterforms carry no stroke, so it is the pen - half its width plus its
 * round cap, past the outermost point of the outline - that clips first.
 */
async function clearance(markup) {
  const { data, info } = await sharp(Buffer.from(markup), { density: 600 })
    .resize({ width: PX })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const lit = (x, y) => data[(y * info.width + x) * info.channels + 3] > 8;
  const col = (x) => { for (let y = 0; y < info.height; y++) if (lit(x, y)) return true; return false; };
  const row = (y) => { for (let x = 0; x < info.width; x++) if (lit(x, y)) return true; return false; };
  const e = { L: 0, R: 0, T: 0, B: 0 };
  while (e.L < info.width && !col(e.L)) e.L++;
  while (e.R < info.width && !col(info.width - 1 - e.R)) e.R++;
  while (e.T < info.height && !row(e.T)) e.T++;
  while (e.B < info.height && !row(info.height - 1 - e.B)) e.B++;
  return e;
}

const box = `viewBox="${f(minX)} ${f(minY)} ${f(W)} ${f(H)}"`;
const drawn = `<svg xmlns="http://www.w3.org/2000/svg" ${box}><path d="${stroke}" fill="none" stroke="#141414" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
for (const [name, markup] of [
  ["rest", rest],
  ["pen", drawn],
]) {
  const e = await clearance(markup);
  const min = Math.min(e.L, e.R, e.T, e.B);
  console.log(
    `  clearance    ${name.padEnd(5)} L${e.L} R${e.R} T${e.T} B${e.B} px${min === 0 ? "   CLIPPING - raise PAD" : ""}`,
  );
}
