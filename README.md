# samitmohan.in

Personal site and blog. Next.js App Router, no CSS framework beyond Tailwind
utilities over a hand-rolled token layer.

```bash
cd web && npm install && npm run dev
```

`npm run build` runs the production build and then `scripts/check-budgets.sh`,
which fails the build on regressions in three things: source line count, gzipped
route JS, and gzipped route HTML. Current headroom is printed on every build.

## Layout

| Path | What lives there |
|---|---|
| `web/app/page.tsx` | The landing page: one screen, four doors |
| `web/app/(public)` | `/about`, `/blog`, `/projects`, RSS, and the unlinked `/fun` and `/interviews` |
| `web/content/posts` | Posts as markdown with frontmatter. Filename carries the date |
| `web/config/` | `links.ts` (the corner marks) and `projects.ts` (the grid) |
| `web/public/marks/` | The hand-drawn sketches, traced to SVG |
| `web/app/globals.css` | Design tokens and every shared component class |

## Things worth knowing before editing

**The landing page carries no copy.** The name goes to `/about`, the two cards
go to `/blog` and `/projects`, the corner marks go off-site. Anything that wants
to argue for the work belongs on `/about`; anything that wants to explain it
belongs in a post. That is the whole reason the page is one screen.

**There are two kinds of SVG here and they are handled oppositely.**
The three animated figures (`gradient-descent`, `blog-backprop`, `agent-loop`)
are *inlined* through `lib/inline-svg.ts`, because their labels use
`currentColor` and an `<img>` is its own document - served that way they follow
`prefers-color-scheme` and go light on a dark-toggled page. The seven
hand-drawn marks in `public/marks/` are the opposite: they are painted as CSS
`mask-image` over `currentColor`, because inlining 70 KB of traced path data
would have blown the homepage's HTML budget. Both end up theme-correct; only
the mechanism differs.

**The marks are traced, not drawn.** They came from the rasters still in
`public/` (`logo.png`, `githublogo.jpg`, and so on) via OpenCV contour tracing.
`home.svg` is the exception - its 40x40 source had no roof left to recover, so
it is hand-authored. Re-tracing is not part of the build; the SVGs are checked in.

**The token layer is contrast-measured.** Every grey step in `globals.css` has
its measured ratio against the background written next to it, because the ramp is
compressed by WCAG AA and the 3:1 large-text exemption does not apply to 10-13px
metadata. Changing a hex silently breaks a documented measurement. Hierarchy
comes from size and weight, not lightness.

**The theme ignores the OS.** `lib/theme-script.ts` reads one key out of
`localStorage` and nothing else, so a visitor gets light until they click the
toggle. It runs in `<head>` before first paint and owns the `theme-color` meta
tag; `layout.tsx` deliberately does not export `viewport.themeColor`, because
two writers on one tag means the wrong one wins on load.

**The nav needs no JavaScript.** The hairline on scroll is a scroll-timeline
animation in CSS. Browsers without scroll-driven animations get the settled
state, which is the correct fallback.

**`/projects` works with no media.** Cards fall back to the project name set
large, and switch to a hover-to-play video the moment a recording lands in
`public/assets/projects/`. See the README in that folder.

**Reading time counts prose only.** `readingTime()` in `lib/blog.ts` strips
fenced code, display and inline math, inline code, images and HTML first, because
raw markdown put the math post at 59 minutes. It no longer appears on the blog
index - that page is date and title - but posts still show it.

**Everything is `revalidate = false`.** All content comes from files in the repo,
so it can only change when a deploy changes it.

**The CV has one home:** `web/public/samit-resume.pdf`, served at
`/samit-resume.pdf` and referenced by `app/llms.txt`. Do not keep a second copy
elsewhere in the repo.
