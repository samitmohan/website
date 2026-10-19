#!/usr/bin/env node
/**
 * Generates the Open Graph cards into public/og/ - one for the site, one per
 * post.
 *
 * Run by hand (`npm run og`). Output is committed like the other generated
 * art, so a deploy never depends on this running.
 *
 * It replaces two Next route files that used `new ImageResponse(<jsx/>)` from
 * next/og. That is satori underneath, so this is the same renderer with the
 * framework taken out: satori returns SVG, sharp writes the PNG, and both were
 * already dependencies of this repo.
 *
 * Instrument Serif comes from scripts/fonts/*.ttf because satori parses
 * ttf/otf and not the woff2 that next/font serves.
 */
import { mkdirSync, readFileSync } from "fs";
import path from "path";
import satori from "satori";
import sharp from "sharp";
import { getAllPosts, formatPostDate } from "../src/lib/blog.ts";

const HERE = import.meta.dirname;
const FONTS = path.join(HERE, "fonts");
const OUT = path.join(HERE, "..", "public", "og");

const W = 1200;
const H = 630;

/* Straight off the palette in globals.css. */
const GROUND = "#FBFAF7";
const INK = "#111111";
const INK_2 = "#6B6A66";
const INK_4 = "#8D8B85";
const ACCENT = "#D9261C";

const fonts = [
  { name: "Instrument Serif", data: readFileSync(path.join(FONTS, "InstrumentSerif-Regular.ttf")), weight: 400, style: "normal" },
];

const el = (type, style, children) => ({ type, props: { style, children } });

/**
 * satori has no block layout, so every container states display: flex. A div
 * with two children and no display is a satori error, not a browser's
 * best guess.
 */
function card({ title, sub, footer, titleSize }) {
  return el(
    "div",
    {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "72px 80px",
      background: GROUND,
      color: INK,
      fontFamily: "Instrument Serif",
    },
    [
      el("div", { display: "flex", alignItems: "center", gap: "14px", fontSize: 18, letterSpacing: 2, color: INK_4 }, [
        el("div", { width: 14, height: 14, borderRadius: 7, background: ACCENT, display: "flex" }, []),
        el("div", { display: "flex", fontSize: 26, letterSpacing: 0 }, "samitmohan.in"),
      ]),
      /* marginTop rather than gap: satori accepts `gap` and then ignores it
         on a column, so the description sat against the title's descenders. */
      el("div", { display: "flex", flexDirection: "column" }, [
        el("div", { display: "flex", fontSize: titleSize, lineHeight: 1.05, letterSpacing: -1, color: INK }, title),
        sub
          ? el("div", { display: "flex", marginTop: 26, fontSize: 30, lineHeight: 1.4, color: INK_2 }, sub)
          : null,
      ].filter(Boolean)),
      el("div", { display: "flex", fontSize: 26, color: ACCENT }, footer),
    ],
  );
}

async function write(name, node) {
  const svg = await satori(node, { width: W, height: H, fonts });
  const file = path.join(OUT, `${name}.png`);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(file);
  const bytes = readFileSync(file).length;
  console.log(`  public/og/${name}.png`.padEnd(46) + `${bytes} B`);
}

mkdirSync(OUT, { recursive: true });

await write(
  "index",
  card({
    title: "samit mohan",
    sub: "I rebuild ML from scratch and write about it.",
    footer: "AI scientist at beltech.ai",
    titleSize: 112,
  }),
);

// One card per top-level page, so a shared /projects link does not look like the home page.
const PAGES = [
  ["blog", "Writing", "Rebuilding ML from scratch, written down."],
  ["projects", "Projects", "A small GPT, an autograd engine, a coding agent, and more."],
  ["things", "Things", "Widgets, things I like, a gallery, and my top four."],
  ["about", "About", "AI scientist at beltech.ai."],
];
for (const [name, title, sub] of PAGES) {
  await write(name, card({ title, sub, footer: "samit mohan", titleSize: 112 }));
}

for (const post of getAllPosts()) {
  /* Long titles get a smaller size rather than a clipped card. The thresholds
     are where 1040px of usable width runs out at each step, measured by
     rendering the longest title on the blog. */
  const n = post.title.length;
  const titleSize = n > 58 ? 60 : n > 38 ? 76 : 96;
  await write(
    post.slug,
    card({
      title: post.title,
      sub: post.description ?? "",
      footer: `${formatPostDate(post.date)} · ${post.readingTime} min`,
      titleSize,
    }),
  );
}
