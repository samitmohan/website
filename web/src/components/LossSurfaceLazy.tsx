"use client";

import dynamic from "next/dynamic";

/** three.js is the heaviest chunk on the site; it loads after the page has painted. */
export const LossSurfaceLazy = dynamic(() => import("./LossSurface").then((m) => m.LossSurface), {
  ssr: false,
  loading: () => <div className="aspect-[3/2] w-full rounded-xl bg-surface/60" />,
});
