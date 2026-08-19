/**
 * A hand-drawn sketch from public/marks/, painted as a mask over currentColor.
 * See the ".mark" block in globals.css for why these are masks and not <img>.
 */
export function Mark({
  name,
  className,
  ...rest
}: { name: string; className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden
      className={`mark ${className ?? ""}`}
      style={{ ["--mark" as string]: `url(/marks/${name}.svg)` }}
      {...rest}
    />
  );
}
