#!/usr/bin/env node
/**
 * Generates the favicons in app/ from public/marks/computer.png, the brush
 * drawing of a CRT desktop that used to sit beside the wordmark.
 *
 * Run by hand (`npm run icons`). Output is committed like the other generated
 * art, so a deploy never depends on this running.
 *
 * Two icons, from two different crops of one drawing, because one crop cannot
 * do both jobs:
 *
 *   icon0.png  32px   the monitor alone. A browser tab renders the favicon at
 *                     16 CSS px, so 16-32 device px, and at that size the whole
 *                     machine is mud - the keyboard and mouse average out into
 *                     grey and the screen stops reading as a screen. Cropped to
 *                     the monitor it still reads as a CRT at 16px. Measured by
 *                     downsampling both crops to 16 and 32 and looking at them.
 *   icon1.png  192px  the whole drawing, keyboard and mouse included, for
 *                     anywhere with room for it: bookmarks, tiles, the tab on
 *                     a high-DPI display asking for a bigger source.
 *
 * Browsers pick by the `sizes` Next emits for each. app/layout.tsx must NOT set
 * metadata.icons - an explicit value there overrides the file convention and
 * these are ignored.
 *
 * The drawing is a mask: the PNG's colour channels are unused and its alpha
 * carries the ink. So the plate below is the alpha channel, joined onto a solid
 * --foreground fill. It is composited onto the page ground rather than left
 * transparent, because a black-on-transparent icon disappears into dark browser
 * chrome and the site has one ground anyway.
 */
import { statSync } from "fs";
import path from "path";
import sharp from "sharp";

const HERE = import.meta.dirname;
const SRC = path.join(HERE, "..", "public", "marks", "computer.png");
const OUT = path.join(HERE, "..", "app");

const INK = "#141414"; // --foreground
const GROUND = "#FFFDF8"; // --background

/* Crops in source pixels. The drawing's alpha has brush spatter reaching every
   edge of the 240x197 canvas, so a bounding box over it returns the whole
   canvas and is useless. FULL is the box holding all but 0.5% of the ink mass
   per side, found by summing alpha per row and column. */
const FULL = { left: 7, top: 3, width: 225, height: 190 };
const MONITOR = { left: 28, top: 3, width: 155, height: 135 };

/* Pushes the mid-greys of the brush texture apart before downsampling. At 32px
   it is the difference between a screen with an edge and a soft blob; at full
   size it is barely visible. */
const CONTRAST = [1.8, -55];

/* Ink box to square-canvas ratio. 1.14 leaves the drawing room to breathe
   without shrinking it into the middle of a mostly empty tile. */
const MARGIN = 1.14;

async function icon({ file, crop, px, contrast }) {
  const { width: W, height: H } = await sharp(SRC).metadata();

  let plate = sharp(SRC).ensureAlpha().extractChannel(3);
  if (contrast) plate = plate.linear(contrast[0], contrast[1]);
  const mask = await plate.raw().toBuffer();

  const plated = await sharp({
    create: { width: W, height: H, channels: 3, background: INK },
  })
    .joinChannel(mask, { raw: { width: W, height: H, channels: 1 } })
    .png()
    .toBuffer();

  /* extract() in its own pass. Chained onto the joinChannel pipeline above it
     is silently ignored and the result comes back at the full 240x197 - which
     then fails to composite onto the smaller square. Verified by reading the
     metadata of both forms. */
  const ink = await sharp(plated).extract(crop).png().toBuffer();

  /* Squaring and scaling are separate passes too: sharp resizes before it
     composites whatever order the calls are in, so doing both at once shrinks
     the canvas to px first and then refuses the full-size ink. */
  const side = Math.round(Math.max(crop.width, crop.height) * MARGIN);
  const square = await sharp({
    create: { width: side, height: side, channels: 4, background: GROUND },
  })
    .composite([{ input: ink, gravity: "center" }])
    .png()
    .toBuffer();

  const out = path.join(OUT, file);
  await sharp(square)
    .resize({ width: px, height: px, kernel: "lanczos3" })
    .png({ compressionLevel: 9 })
    .toFile(out);

  /* Measured, not asserted: how much of the tile is ink at the size it ships.
     Under about 8% and the drawing has been shrunk into a mostly empty tile. */
  const { data, info } = await sharp(out).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let dark = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    if ((data[i] + data[i + 1] + data[i + 2]) / 3 < 140) dark++;
  }
  const bytes = statSync(out).size;
  console.log(
    `  app/${file.padEnd(10)} ${px}x${px}  ${String(bytes).padStart(6)} B  ink ${((dark / (px * px)) * 100).toFixed(1)}%`,
  );
}

await icon({ file: "icon0.png", crop: MONITOR, px: 32, contrast: CONTRAST });
await icon({ file: "icon1.png", crop: FULL, px: 192 });
