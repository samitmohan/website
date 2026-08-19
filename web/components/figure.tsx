import { inlineSvg } from "@/lib/inline-svg";

/**
 * One of the hand-authored animated figures from public/, inlined.
 *
 * Server component, no client JS: the animation is CSS inside the file and runs
 * on the compositor. Each file already carries its own <title>/<desc> and
 * role="img", so nothing is added here.
 */
export function Figure({
  name,
  className,
}: {
  name: "gradient-descent" | "blog-backprop" | "agent-loop";
  className?: string;
}) {
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: inlineSvg(name) }}
    />
  );
}
