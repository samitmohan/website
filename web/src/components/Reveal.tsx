"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Blur-to-sharp entrance. `slot` orders the page: each slot waits 0.1s more.
 */
export function Reveal({
  slot = 0,
  as = "div",
  className,
  children,
}: {
  slot?: number;
  as?: "div" | "section" | "header" | "footer" | "li";
  className?: string;
  children: React.ReactNode;
}) {
  const still = useReducedMotion();
  const M = motion[as];
  return (
    <M
      className={className}
      initial={still ? { opacity: 0 } : { opacity: 0, filter: "blur(20px)", scale: 1.1 }}
      animate={still ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)", scale: 1 }}
      transition={still ? { duration: 0.3 } : { type: "spring", bounce: 0, duration: 0.8, delay: slot * 0.1 }}
    >
      {children}
    </M>
  );
}
