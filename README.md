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
| `web/app/(public)` | Homepage, blog, RSS, `/fun`, `/interviews` |
| `web/app/(platform)` | Signed-in practice platform: problems, syllabus, admin |
| `web/content/posts` | Posts as markdown with frontmatter. Filename carries the date |
| `web/lib/series.ts` | The from-scratch ladder, in dependency order |
| `web/app/globals.css` | Design tokens and every shared component class |
| `server/` | Python code execution backend for the editor |

## Things worth knowing before editing

**The token layer is contrast-measured.** Every grey step in `globals.css` has
its measured ratio against the background written next to it, because the ramp is
compressed by WCAG AA and the 3:1 large-text exemption does not apply to 10-13px
metadata. Changing a hex silently breaks a documented measurement. Hierarchy
comes from size and weight, not lightness.

**Orange is punctuation, never a fill and never a link colour.** Three jobs:
hovered list index, outbound arrows, blockquote rule. `--orange-text` is the
darker step for anywhere orange carries text at reading size.

**The theme toggle has no state and no effect.** Both icons always render and
`.dark` picks which one shows, so the markup never depends on the theme and
there is nothing to hydrate or mismatch. `lib/theme-script.ts` runs in `<head>`
before first paint and owns the `theme-color` meta tag; `layout.tsx` deliberately
does not export `viewport.themeColor`, because two writers on one tag means the
wrong one wins on load.

**The nav needs no JavaScript.** The hairline on scroll and the name fading in
behind the hero are both scroll-timeline animations in CSS. Browsers without
scroll-driven animations get the settled state, which is the correct fallback.

**Reading time counts prose only.** Raw markdown put the math post at 59 minutes
because LaTeX source and code fences dominate the word count. `readingTime()` in
`lib/blog.ts` strips fenced code, display and inline math, inline code, images
and HTML first.

**Most pages are `revalidate = false`.** Their content comes from files in the
repo, so it can only change when a deploy changes it. `/blog` is the exception at
`revalidate = 30`, because view counts come from Redis.

**The CV has one home:** `web/public/samit-resume.pdf`, served at
`/samit-resume.pdf` and referenced by `app/llms.txt`. Do not keep a second copy
elsewhere in the repo.
