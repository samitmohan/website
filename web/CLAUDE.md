@AGENTS.md

<user-constraints>
  <!-- Constraints defined by the user during conversation. Mandatory. -->
  <constraint added="2026-08-20">
    Never deploy to Vercel without explicit permission. No `vercel deploy`,
    no `vercel --prod`, no push to a branch that triggers a deploy. Verify
    changes locally (`npm run dev`, `npm run build`) and hand the result back
    for review instead.
  </constraint>
  <constraint added="2026-08-20">
    Keep the existing layout. Visual work changes colour, type and motion;
    it does not restructure markup, grids or page order unless asked.
  </constraint>
</user-constraints>
