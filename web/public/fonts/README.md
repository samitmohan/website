# Berkeley Mono

Licensed font, not committed. Buy at https://usgraphics.com/products/berkeley-mono

Export woff2 and drop in here as:

- BerkeleyMono-Regular.woff2
- BerkeleyMono-Bold.woff2

The @font-face rules at the top of app/globals.css pick them up with no
further changes. Until then the stack falls through to JetBrains Mono,
then Geist Mono, then the platform mono.
