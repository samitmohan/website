"use client";

import dynamic from "next/dynamic";

/** three.js is the heaviest chunk on the site; it loads after the page has painted. */
export const LossSurfaceLazy = dynamic(() => import("./LossSurface").then((m) => m.LossSurface), {
  ssr: false,
  // The placeholder has the real caption, so the first paint already shows it
  // instead of waiting for the three.js chunk (it was the LCP element at 6.0s).
  loading: () => (
    <figure className="relative">
      <div className="aspect-[3/2] w-full rounded-xl" />
      <figcaption className="pointer-events-none absolute inset-x-3 bottom-2">
        <span className="meta">click the surface to drop a ball</span>
      </figcaption>
    </figure>
  ),
});
