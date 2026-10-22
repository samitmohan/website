@AGENTS.md

<user-constraints>
  <!-- Constraints defined by the user during conversation. Mandatory. -->
  <constraint added="2026-08-20">
    Never deploy to Vercel without explicit permission. No `vercel deploy`,
    no `vercel --prod`, no push to a branch that triggers a deploy. Verify
    changes locally (`npm run dev`, `npm run build`) and hand the result back
    for review instead.
  </constraint>
  <constraint added="2026-10-20">
    Preview deploys are allowed: `vercel deploy` without `--prod`, which gives
    a *.vercel.app URL. Production and the samitmohan.in domain stay off-limits
    until Samit says to publish there. Never `vercel --prod`, never `vercel
    promote`, never alias a deployment to samitmohan.in.
  </constraint>
  <constraint added="2026-10-19">
    The site follows design direction A: shwn.design's calm 620px column and
    blur-in reveals, stympaul.com's warm paper and red ink, colehardik.in's
    dark mode and double-click theme switch. Borrow patterns from those
    sites, never their copy, assets or code.
  </constraint>
  <constraint added="2026-10-19">
    Blog has two tabs: technical (/blog) and personal (/blog/personal,
    frontmatter `hidden: true`). /fun is retired and redirects there.
  </constraint>
  <constraint added="2026-10-19">
    Never invent personal content (likes, captions, lists, facts about Samit).
    Text shown as his must come from his own sources: posts, the about copy,
    or what he says in conversation. Stand-ins are allowed only when marked
    `placeholder: true` in the data. The things-I-like captions are read
    straight from the bullets of content/posts/2025-01-01-things-i-like.md.
  </constraint>
  <constraint added="2026-10-20">
    Technical post prose (content/posts) follows ASD-STE100 Simplified
    Technical English: short sentences, active voice, simple approved words,
    one idea per sentence. No AI slop (see ~/.claude/skills/stop-slop). Keep
    Samit's voice and facts; never invent content. Leave his slang,
    profanity, rhetorical setups ("How? Calculus."), contractions, and
    deliberate double periods or double spaces as they are.
  </constraint>
  <constraint added="2026-10-21">
    Blog check rules for technical posts. Every review of a post checks all of:
    1. ASD-STE100 language and no AI slop (constraint above).
    2. Facts: verify claims, numbers and arithmetic; fix wrong ones, flag the
       ones that cannot be verified.
    3. Flow of the data: the post explains a term, model or step before any
       text, table or figure uses it. Overview figures, summary tables and
       comparisons that depend on later sections go after those sections,
       never at the top (e.g. the YOLO pipeline figure and metrics table sit
       after post-processing, not before "before YOLO"). A term explained in
       another post links there on first use, e.g. "CNN" in the YOLO post
       links to /blog/nn#mnist-from-minitorch-custom-implementation-of-pytorch.
    4. Navigation: a post with a hand-written index gets the side contents
       rail (page.tsx strips the index at render time); every in-page link
       resolves to a real heading id in the build.
    Fixes under rules 1-4 are applied directly. Removing sections, moving
    content around, or adding new voice/style material (e.g. George Hotz
    style openings) is suggested first and applied only after Samit approves.
  </constraint>
  <constraint added="2026-10-19">
    Facts: beltech.ai runs inference on 300 cameras for 24/7 surveillance and
    monitoring. Not 60k.
  </constraint>
  <constraint added="2026-10-19">
    No explanatory intro lines under page titles; headings speak for
    themselves. No sign-off text in the footer.
  </constraint>
  <constraint added="2026-10-19">
    Buttons and link-chips are soft grey filled chips (ink-filled when
    selected). No outlined oval buttons.
  </constraint>
  <constraint added="2026-10-19">
    Personal posts look exactly like technical posts: same background, fonts
    and colours. Only the tab differs.
  </constraint>
</user-constraints>

Before calling a change done, build and run the checks against the export:
`npm run build`, `npx serve out -l 3211`, `node scripts/smoke.mjs
http://localhost:3211 shots`, `node scripts/interact.mjs`,
`node scripts/mobile.mjs http://localhost:3211` (must report 0 issues at 360
and 390px), `node scripts/svg-blocks.mjs` (no blank lines inside inline SVGs
in posts; a blank line silently cuts the rest of the figure out of the SVG),
`node scripts/math-blocks.mjs` (display math needs $$ on their own lines;
single-line $$...$$ silently renders as inline math).
