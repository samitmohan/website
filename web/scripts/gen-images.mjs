#!/usr/bin/env node
/**
 * Writes the responsive image variants the built HTML asks for.
 *
 * Runs after `next build`, reads out/**\/*.html for the /_img/ URLs the
 * markdown pipeline emitted, and writes exactly those files. The HTML is the
 * contract: the pipeline decides which widths a source can fill and this
 * produces them, so the two cannot disagree about what exists.
 *
 * They go into dist rather than public because they are derived. 287 images at
 * up to four widths is tens of megabytes of downscales that regenerate from
 * the originals in seconds, and none of it belongs in git.
 *
 * A variant's filename is a sanitised basename plus a hash of its source path
 * (see src/lib/responsive.ts for why), so the URL does not say where the bytes
 * came from. Rather than have the pipeline write a mapping into the markup -
 * four URLs per image across 287 images is real weight on the heaviest pages -
 * this rebuilds the index by walking public/ and hashing every candidate path
 * the same way. Same function, same input, same answer.
 *
 * This replaces Next's /_next/image, which re-encoded on demand at the edge.
 * The trade is a slower build for no server: plain files on a CDN behind an
 * immutable cache header, and no runtime at all.
 */
import { mkdirSync, readFileSync, existsSync, statSync } from "fs";
import { readdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { IMAGE_WIDTHS, variantUrl } from "../src/lib/responsive.ts";

const HERE = import.meta.dirname;
const DIST = path.join(HERE, "..", "out");
const PUBLIC = path.join(HERE, "..", "public");
const IMAGE_EXT = /\.(webp|png|jpe?g|avif|gif|tiff?)$/i;

async function walk(dir, test) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p, test)));
    else if (test(e.name)) out.push(p);
  }
  return out;
}

/* url -> source path, for every width every source could be asked at. */
const index = new Map();
for (const abs of await walk(PUBLIC, (n) => IMAGE_EXT.test(n))) {
  const src = "/" + path.relative(PUBLIC, abs).split(path.sep).join("/");
  for (const w of IMAGE_WIDTHS) index.set(variantUrl(src, w), src);
}

/* Only what the built pages actually reference. */
const wanted = new Set();
for (const file of await walk(DIST, (n) => n.endsWith(".html"))) {
  for (const m of readFileSync(file, "utf8").matchAll(/\/_img\/\d+\/[A-Za-z0-9-]+\.webp/g)) {
    wanted.add(m[0]);
  }
}

let made = 0;
let bytes = 0;
let skipped = 0;
const orphans = [];

await Promise.all(
  [...wanted].map(async (url) => {
    const src = index.get(url);
    if (!src) {
      /* A URL in the HTML with no source behind it means the pipeline and this
         script disagree about the hash - a real bug, not a missing asset. */
      orphans.push(url);
      return;
    }
    const width = Number(url.split("/")[2]);
    const from = path.join(PUBLIC, src);
    if (!existsSync(from)) {
      orphans.push(url);
      return;
    }
    const to = path.join(DIST, url.replace(/^\//, ""));
    mkdirSync(path.dirname(to), { recursive: true });
    try {
      /* webp for everything: the sources are already webp, jpg or png, and one
         output format keeps the srcset a single list of URLs rather than a
         <picture> with a branch per type. */
      await sharp(from).resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toFile(to);
      made += 1;
      bytes += statSync(to).size;
    } catch {
      /* Unreadable or not an image. The original stays as the src, so the page
         still shows something. */
      skipped += 1;
    }
  }),
);

console.log(`  ${made} variants, ${(bytes / 1024 / 1024).toFixed(1)} MB in out/_img`);
if (skipped) console.log(`  ${skipped} unreadable, left to their original src`);
if (orphans.length) {
  console.error(`  ${orphans.length} URLs with no source - pipeline/script hash mismatch:`);
  for (const o of orphans.slice(0, 8)) console.error(`    ${o}`);
  process.exit(1);
}
