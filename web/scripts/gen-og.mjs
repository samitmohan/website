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
 * Charter comes from scripts/fonts/*.ttf rather than public/fonts/*.woff2
 * because satori parses ttf/otf and not woff2. Same typeface, same design,
 * different container.
 *
 * The old card's accent square was #E6651B, an orange left over from a
 * colourway the site has not had for two redesigns. It is the current accent.
 */
import { mkdirSync, readFileSync, writeFileSync } from "fs";
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
const GROUND = "#FFFDF8";
const INK = "#141414";
const INK_2 = "#5C5A55";
const INK_4 = "#767369";
const ACCENT = "#1C1CA8";

const fonts = [
  { name: "Charter", data: readFileSync(path.join(FONTS, "Charter-Regular.ttf")), weight: 400, style: "normal" },
  { name: "Charter", data: readFileSync(path.join(FONTS, "Charter-Bold.ttf")), weight: 700, style: "normal" },
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
      fontFamily: "Charter",
    },
    [
      el("div", { display: "flex", alignItems: "center", gap: "14px", fontSize: 18, letterSpacing: 2, color: INK_4 }, [
        el("div", { width: 14, height: 14, borderRadius: 3, background: ACCENT, display: "flex" }, []),
        el("div", { display: "flex" }, "SAMITMOHAN.IN"),
      ]),
      /* marginTop rather than gap: satori accepts `gap` and then ignores it
         on a column, so the description sat against the title's descenders. */
      el("div", { display: "flex", flexDirection: "column" }, [
        el("div", { display: "flex", fontSize: titleSize, lineHeight: 1.05, letterSpacing: -3, color: INK }, title),
        sub
          ? el("div", { display: "flex", marginTop: 26, fontSize: 26, lineHeight: 1.4, color: INK_2 }, sub)
          : null,
      ].filter(Boolean)),
      el("div", { display: "flex", fontSize: 20, color: ACCENT }, footer),
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
    footer: "AI Scientist, Beltech AI",
    titleSize: 112,
  }),
);

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
