"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

/** One line at a time: holds 5s, leaves up and blurred, the next rises in. */
export function Rotator({ lines }: { lines: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((n) => (n + 1) % lines.length), 5000);
    return () => clearInterval(id);
  }, [lines.length]);
  return (
    <div className="relative min-h-[3.5em] text-[18px] leading-snug text-ink">
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] } }}
          exit={{ opacity: 0, y: -8, filter: "blur(6px)", transition: { duration: 0.29, ease: [0.7, 0, 0.84, 0] } }}
        >
          {lines[i]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
