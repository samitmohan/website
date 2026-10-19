# Build-only fonts

Read by `scripts/gen-og.mjs` and never served. satori parses ttf/otf, not the
woff2 files that `next/font` self-hosts for the browser, so the OG cards need
their own copy of the face.

## Instrument Serif - `InstrumentSerif-Regular.ttf`

The site's serif accent face. Licence: `OFL-InstrumentSerif.txt`.

- Source: <https://github.com/google/fonts/tree/main/ofl/instrumentserif>
