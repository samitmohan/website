# Fonts

## Samit Serif (Libron subset) - committed

`samit-serif_regular.woff2`, `samit-serif_italic.woff2`. The site's one
typeface: headings and prose, through `--font-sans` / `--font-display` in
`src/styles/globals.css`. A subset of
[Libron](https://github.com/nicoverbruggen/libron) v0.30 by Nico Verbruggen,
built by `scripts/subset-libron.py` (the command is in its docstring).

Libron is OFL 1.1 with "Libron" as a Reserved Font Name. The OFL FAQ (2.6)
counts subsetting as modification, so the subset carries a different name.
`LICENSE-Libron.txt` is the OFL text and has to travel with the files.

No bold face: nothing on the site is set in bold, and a synthesised one would
smear the contrast.

`LICENSE.fonts.txt` is Bitstream's Charter notice. Charter no longer ships in
public/, but the homepage wordmark is drawn from Charter outlines by
`scripts/gen-wordmark.mjs`.

## Berkeley Mono — licensed, not committed

Buy at https://usgraphics.com/products/berkeley-mono

Export woff2 and drop in here as:

- BerkeleyMono-Regular.woff2
- BerkeleyMono-Bold.woff2

Then add two `@font-face` blocks to `app/globals.css` beside Charter's (weights
400/700, `font-display: swap`). The comment at the top of that file explains why
there is deliberately no `@font-face` for it until the files exist. Until then
`--font-mono` falls through to JetBrains Mono, then Geist Mono, then the
platform mono.
