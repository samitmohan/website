@AGENTS.md

<user-constraints>
  <!-- Constraints defined by the user during conversation. Mandatory. -->
  <constraint added="2026-08-20">
    Never deploy to Vercel without explicit permission. No `vercel deploy`,
    no `vercel --prod`, no push to a branch that triggers a deploy. Verify
    changes locally (`npm run dev`, `npm run build`) and hand the result back
    for review instead.
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
</user-constraints>

Before calling a change done, build and run the checks against the export:
`npm run build`, `npx serve out -l 3211`, `node scripts/smoke.mjs
http://localhost:3211 shots`, `node scripts/interact.mjs`.
