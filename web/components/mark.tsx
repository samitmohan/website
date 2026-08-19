/**
 * A hand-drawn mark from public/marks/, painted as a mask over currentColor.
 * See the ".mark" block in globals.css for why these are masks and not <img>.
 *
 * Most are traced SVG. Two are PNG (`ext="png"`): the computer and the house.
 * Tracing a dry-brush drawing either flattens the broken edge that is the whole
 * point of it or explodes into thousands of segments, and the 40x40 house had
 * no detail left to recover. For those the greyscale ink becomes the alpha
 * channel, which a mask reads exactly the same way.
 */
export function Mark({
  name,
  ext = "svg",
  className,
  ...rest
}: {
  name: string;
  ext?: "svg" | "png";
  className?: string;
} & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden
      className={`mark ${className ?? ""}`}
      style={{ ["--mark" as string]: `url(/marks/${name}.${ext})` }}
      {...rest}
    />
  );
}
