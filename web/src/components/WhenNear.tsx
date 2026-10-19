"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Renders children only once the box comes within `margin` of the viewport.
 * Keeps below-the-fold toys out of hydration; the box itself holds its size.
 */
export function WhenNear({ children, className, margin = "400px" }: { children: React.ReactNode; className?: string; margin?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(ref.current!);
    return () => io.disconnect();
  }, [margin]);
  return (
    <div ref={ref} className={className}>
      {near ? children : null}
    </div>
  );
}
