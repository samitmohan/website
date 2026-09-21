/**
 * The two numbers behind --trim-top and --trim-bottom in src/styles/globals.css.
 *
 * A line box is taller than the letters in it: half-leading and the unused
 * slice of the ascender above the caps, the descender below the baseline. The
 * .trim rules subtract that, and these are the amounts to subtract.
 *
 *   trim-top    = capHeight - (ascent - descent) / 2
 *   trim-bottom = (ascent - descent) / 2
 *
 * Both fall out of where the cap top and the baseline sit relative to the
 * middle of the line box, which is the term .trim subtracts as -0.5lh. No
 * line-height appears in either, so one pair is right at every leading.
 *
 *   node scripts/font-metrics.mjs
 *
 * Cross-checked against canvas measureText() in a real browser on 2026-09-21:
 * fontBoundingBoxAscent/Descent for the box, the ink top of "H" for the cap.
 * The two methods agreed to 0.003em. Re-run this after replacing a font file.
 */
import { openSync } from "fontkit";

/* fontkit hands back the font's own hhea sign convention, and the two faces
   here disagree about it: Charter stores its descender positive, Geist Mono
   negative. Taking the magnitude is the only reading that is right for both. */
const FACES = [
  ["Charter", "public/fonts/charter_regular.woff2"],
  ["Geist Mono", "public/fonts/geist-mono-400.woff2"],
];

for (const [name, file] of FACES) {
  const f = openSync(file);
  const em = f.unitsPerEm;
  const ascent = Math.abs(f.ascent) / em;
  const descent = Math.abs(f.descent) / em;
  const cap = f.capHeight / em;
  const half = (ascent - descent) / 2;

  console.log(`${name}  (${file})`);
  console.log(`  ascent ${ascent.toFixed(3)}  descent ${descent.toFixed(3)}  cap ${cap.toFixed(3)}`);
  console.log(`  --trim-top:    ${(cap - half).toFixed(3)}em`);
  console.log(`  --trim-bottom: ${half.toFixed(3)}em`);
}
