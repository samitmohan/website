"use client";

/* 3x3 pixel grid with a chevron wavefront driving right, paired with a
 * shimmering label. Adapted from Beautiful UI's Loading State primitive
 * (beautiful-ui-five.vercel.app, built by Turbo). The 650ms cycle is shorter
 * than the sweep, so two fronts are always in flight. Reduced motion freezes
 * the grid to its dim state. */

const DELAYS = Array.from({ length: 9 }, (_, i) => {
  const row = Math.floor(i / 3);
  const col = i % 3;
  return (col + Math.abs(row - 1)) * 90;
});

export function PixelLoader({ label }: { label: string }) {
  return (
    <span className="flex w-fit items-center gap-2.5">
      <span aria-hidden className="grid grid-cols-[repeat(3,4px)] gap-[1.5px]">
        {DELAYS.map((delay, i) => (
          <span
            key={i}
            className="pixel-cell size-[4px] rounded-[1px] bg-ink"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </span>
      <span className="shimmer-text text-[13px] font-medium">{label}</span>
    </span>
  );
}
