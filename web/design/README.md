# Sources

The original drawings. These are **not** in `public/`, so they are not deployed -
everything under `public/` ships, and 500 KB of source art that no page requests
is 500 KB on every build.

`public/marks/` holds what the site actually loads, derived from these:

| source | mark | how |
|---|---|---|
| `logo.png` | `sm.svg` | OpenCV contour trace |
| `githublogo.jpg` | `github.svg` | ,, |
| `linkedin.jpg` | `linkedin.svg` | ,, |
| `email.jpg` | `email.svg` | ,, |
| `spotifylogo.jpg` | `spotify.svg` | ,, |
| `resumelogo.png` | `cv.svg` | ,, |
| `logo.png` (the bar only) | `underline.svg` | widest contour, lifted out |
| `computer_logo.jpg` | `computer.png` | ink -> alpha channel |
| `home.webp` | `home.png` | ink -> alpha channel |

Tracing suits a clean line drawing. It ruins a dry-brush one - it either
flattens the broken edge that is the whole point of the drawing or explodes
into thousands of segments - so the computer and the house keep their pixels
and carry the ink in an alpha channel instead. A mask reads both the same way.

`masterji-logo.*` is reference only: the lettering the wordmark was matched to.
