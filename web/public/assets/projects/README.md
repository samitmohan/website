# Project recordings

Drop screen recordings here, named after the project's `slug` in
`web/config/projects.ts`:

- `<slug>.mp4`  - muted H.264, keep it short and looping (5-15s is plenty)
- `<slug>.jpg`  - first frame, used as the poster so the card never flashes empty

Then add the two fields to that project's entry:

```ts
video: "/assets/projects/mathlm.mp4",
poster: "/assets/projects/mathlm.jpg",
```

Nothing else changes - the card switches from the lettered fallback to a
hover-to-play video on its own. Everything under `public/assets/` is served
`immutable`, so give a re-recorded file a new name rather than overwriting.
