# Fonts

## Charter — committed

`charter_regular.woff2`, `charter_italic.woff2`. The site's one typeface: both
the headings and the prose, through `--font-sans` / `--font-display` in
`app/globals.css`. Matthew Carter, 1987, drawn to survive 300dpi laser printers
and fax machines.

Taken from [`charter-webfont@4.1.0`](https://www.npmjs.com/package/charter-webfont),
which repackages the Type 1 originals Bitstream contributed to the X Consortium.
Butterick's copy and the story are at https://practicaltypography.com/charter.html

`LICENSE.fonts.txt` is Bitstream's notice. The grant is for any purpose without
restriction *on the condition that the notice stays intact with the files*, so
that file is a requirement and not a courtesy — do not remove it, and copy it
along with the woff2s anywhere they go.

No bold face: nothing on the site is set in bold Charter, and letting the
browser synthesise one would smear the contrast.

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
