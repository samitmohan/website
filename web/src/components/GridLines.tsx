/**
 * Full-height guide lines behind the page: both edges of the 620px column,
 * its centre, and one more in each margin. Fixed, so they read as the paper
 * the page sits on. Phones keep only the column edges.
 */
export function GridLines() {
  const line = "absolute inset-y-0 w-px bg-[var(--grid-line)]";
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <span className={`${line} left-[max(16px,calc(50%-310px))]`} />
      <span className={`${line} right-[max(16px,calc(50%-310px))]`} />
      <span className={`${line} left-1/2 hidden sm:block`} />
      <span className={`${line} left-[calc((50%-310px)/2)] hidden md:block`} />
      <span className={`${line} right-[calc((50%-310px)/2)] hidden md:block`} />
    </div>
  );
}
