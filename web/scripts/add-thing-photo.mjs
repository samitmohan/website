// Adds a photo to a "Things I like" card.
// Usage: node scripts/add-thing-photo.mjs <photo> "<bullet text, exactly as in the post>"
//
// Writes public/things/<slug>.webp (800px) and public/things/sm/<slug>.webp (360px),
// both without EXIF/GPS, and adds the entry to THING_PHOTOS in src/content/site.ts.
// iPhone HEIC files are converted with macOS `sips` first (sharp cannot read HEIC).
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";

const [photo, thing] = process.argv.slice(2);
if (!photo || !thing) {
  console.error('usage: node scripts/add-thing-photo.mjs <photo> "<bullet text>"');
  process.exit(1);
}

const post = readFileSync("content/posts/2025-01-01-things-i-like.md", "utf8");
const bullets = [...post.matchAll(/^- (.+)$/gm)].map((m) => m[1].replace(/\*/g, "").trim());
if (!bullets.includes(thing)) {
  const near = bullets.filter((b) => b.toLowerCase().includes(thing.toLowerCase().split(" ")[0]));
  console.error(`"${thing}" is not a bullet in the things-i-like post.${near.length ? `\nDid you mean:\n  ${near.join("\n  ")}` : ""}`);
  process.exit(1);
}

let src = photo;
if (/\.heic$/i.test(photo)) {
  src = path.join(mkdtempSync(path.join(tmpdir(), "thing-")), "photo.jpg");
  execFileSync("sips", ["-s", "format", "jpeg", photo, "--out", src], { stdio: "ignore" });
}

const slug = thing.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const url = `/things/${slug}.webp`;
// rotate() applies the camera's orientation; sharp drops all metadata unless asked to keep it.
await sharp(src).rotate().resize(800, 800, { fit: "inside" }).webp({ quality: 78 }).toFile(`public${url}`);
await sharp(src).rotate().resize(360, 360, { fit: "inside" }).webp({ quality: 76 }).toFile(`public/things/sm/${slug}.webp`);

const file = "src/content/site.ts";
const site = readFileSync(file, "utf8");
const key = JSON.stringify(thing);
if (site.includes(`${key}:`)) {
  console.log(`${url} written; ${file} already has an entry for ${key}, left as is.`);
} else {
  const start = site.indexOf("export const THING_PHOTOS");
  const end = site.indexOf("\n};", start);
  writeFileSync(file, `${site.slice(0, end)}\n  ${key}: "${url}",${site.slice(end)}`);
  console.log(`${url} written and added to THING_PHOTOS.`);
}
