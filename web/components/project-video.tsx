"use client";

import { useRef } from "react";

/**
 * Hover to play, leave to pause and rewind.
 *
 * This is the only client component on /projects, and it exists because there
 * is no CSS way to start a video. The alternative - `autoPlay` on every card -
 * decodes four videos at once on a phone to show something nobody has scrolled
 * to yet. `preload="metadata"` means an untouched card costs a few KB of
 * container header, not the file.
 *
 * On touch there is no hover, so the poster frame is what the card shows and
 * tapping it follows the card's link to the repo. That is the right outcome:
 * a phone user gets a still and a destination rather than four autoplaying
 * loops.
 */
export function ProjectVideo({
  src,
  poster,
  label,
}: {
  src: string;
  poster?: string;
  label: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  return (
    <video
      ref={ref}
      className="project-video"
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={`${label} demo`}
      onMouseEnter={() => {
        // play() rejects if the element is torn down mid-gesture; nothing to do
        // about it and nothing to report.
        void ref.current?.play().catch(() => {});
      }}
      onMouseLeave={() => {
        const v = ref.current;
        if (!v) return;
        v.pause();
        v.currentTime = 0;
      }}
    />
  );
}
