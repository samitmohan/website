/**
 * Blur-to-sharp entrance in CSS, so pages that only need this ship no
 * animation library. `slot` orders the page: each slot waits 0.1s more.
 */
export function Reveal({
  slot = 0,
  as: Tag = "div",
  className = "",
  children,
}: {
  slot?: number;
  as?: "div" | "section" | "header" | "footer" | "li";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag className={`reveal ${className}`} style={{ "--slot": slot } as React.CSSProperties}>
      {children}
    </Tag>
  );
}
