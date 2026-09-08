# Build-only fonts

Read by `scripts/gen-wordmark.mjs` and never served. This directory is outside
`public/` for exactly that reason: the homepage wordmark is a *drawing*, traced
from these outlines at build time into `public/wordmark.svg`, so the typeface
costs a visitor nothing and does not need a `@font-face` or a Google Fonts
request. Fonts the browser actually downloads live in `public/fonts/`.

The `FONT` constant at the top of the generator picks which one is in use.
Changing it is the whole switch; then update the multiplier in
`.wordmark-word` to whatever `npm run figure` prints.

## Instrument Serif — `InstrumentSerif-Regular.ttf` (in use)

What the wordmark was set in before it became a drawing. Narrow, high
contrast, display-drawn. Licence: `OFL-InstrumentSerif.txt`.

- Source: <https://github.com/google/fonts/tree/main/ofl/instrumentserif>

A TrueType outline, so quadratic curves. Multiplier `1.891`.

## Latin Modern Roman 10 — `lmroman10-regular.otf` (alternative)

Knuth's Computer Modern, redrawn and extended by GUST, the type TeX sets.
Wider and rounder than Instrument Serif, with a bookish feel. Licence:
`GUST-FONT-LICENSE.txt`, which permits redistribution — keep it next to the
font.

- Source: <https://mirrors.ctan.org/fonts/lm/fonts/opentype/public/lm/lmroman10-regular.otf>
- Project: <https://www.gust.org.pl/projects/e-foundry/lm>

A CFF/PostScript OTF, so **cubic** curves where Instrument Serif and Charter
are quadratic. The generator handles both; it did not at first, and said so
rather than emitting a broken path. Multiplier `2.344`.

`lmroman10`, not the `12` or `17` display cuts: all three hold their hairlines
at 120px and 17 is spindly on a page this empty, while 10 carries the most
contrast, which is what gives a drawn outline its variety.
