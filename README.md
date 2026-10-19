# samitmohan.in

Personal site and blog. Next.js 16 App Router as a static export
(`output: "export"`), Tailwind 4 over a CSS-variable token layer, Motion for
springs, Lenis for scroll, three.js for the home-page hero.

```bash
cd web && npm install && npm run dev      # http://localhost:3000
npm run build                             # static site in web/out, plus /_img variants
```

The look borrows from three sites: shwn.design (the 620px column, blur-in
reveals, gooey nav, prototype carousel, projects desk), colehardik.in (dark
palette, double-click theme switch, row hover-dim) and stympaul.com (warm paper
and red ink, oval buttons, typed bio with strike-throughs, pinboard, bookshelf,
film strip). Patterns only: none of their copy, assets or code.

## Layout

| Path | What lives there |
|---|---|
| `web/src/app/` | Routes: `/`, `/about`, `/blog`, `/blog/personal`, `/blog/[slug]`, `/projects`, `/things`, RSS, sitemap, robots, `llms.txt` |
| `web/src/app/globals.css` | Tokens (light, dark, personal scope) and the prose styles for posts |
| `web/src/components/` | The shell (`Nav`, `Page`, `Footer`, `Reveal`, `ThemeController`, `SmoothScroll`) and the set pieces |
| `web/src/content/site.ts` | Home-page bio, the objects in "Things in my vicinity", and the post widgets in the lab |
| `web/content/posts/` | Posts as markdown with frontmatter. Filename carries the date |
| `web/content/shelf/` | `books.json`, `films.json`, `music.json` for "On repeat" on `/things` |
| `web/src/config/` | `projects.ts` (the board, with the posts each project threads to) and `links.ts` |
| `web/scripts/` | `smoke.mjs`, `interact.mjs`, `gen-og.mjs`, `gen-images.mjs`, `gen-icons.mjs` |

## Things worth knowing before editing

**Two blog tabs, one content folder.** A post with `hidden: true` in its
frontmatter is personal: it lists under `/blog/personal`, renders in the warm
serif scope, and its prev/next stays among personal posts. The flag name is a
leftover from when those posts were the unlinked `/fun` section, which now
redirects to `/blog/personal`.

**Post scripts are replayed, not parsed.** Several posts embed widgets as
`<script>` tags. React never runs scripts that arrive through
`dangerouslySetInnerHTML`, so `lib/defer-scripts.ts` marks them
`type="text/x-deferred"` at build time and `components/RunScripts.tsx` re-creates
them in order after mount. That is what makes widgets work on client-side
navigation as well as a fresh load. The lab on `/things` mounts the same widgets the same way, in a sheet.

**Mock content is flagged.** Anything in `content/shelf/*.json` with
`"placeholder": true` is a stand-in until the real list replaces it.

**Photos are folders.** The gallery on `/things` is a crate of records, one per
folder listed in `ROLLS` in `src/lib/things.ts`; every `.webp` in the folder
(minus `-poster` frames) is a track. "Things I like" is a deck of cards built
from the bullets of the things-i-like post, each matched to a drawing in
`src/components/things-art.tsx`; give a bullet a cut-out photo in
`THING_PHOTOS` and it replaces the drawing.

**The footer is a garden.** `components/Garden.tsx` draws the name sticker on a
canvas and grows flowers or a network from its edges under the pointer. It
mounts only near the viewport, and its colours follow the theme swatches.

**three.js loads after first paint.** `LossSurfaceLazy` keeps the 135 KB
gzipped chunk out of the home page's critical path.

**Responsive images only exist after a build.** `gen-images.mjs` reads the
exported HTML for `/_img/` URLs and writes the variants into `out/`, so those
URLs 404 under `next dev`. Run the checks against the export:

```bash
npx serve out -l 3211 &
node scripts/smoke.mjs http://localhost:3211 shots   # every sitemap route, 1440 + 390 px
node scripts/smoke.mjs http://localhost:3211 shots --dark
node scripts/interact.mjs                           # theme, widgets, write-up, deck, crate, garden
```

**The CV has one home:** `web/public/samit-resume.pdf`. Do not keep a second
copy elsewhere in the repo.
