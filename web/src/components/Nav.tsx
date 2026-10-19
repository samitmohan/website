"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const ITEMS = [
  { href: "/", label: "home" },
  { href: "/blog", label: "blog" },
  { href: "/projects", label: "projects" },
  { href: "/shelf", label: "shelf" },
  { href: "/lab", label: "lab" },
  { href: "/about", label: "about" },
];

function active(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/**
 * Pill nav with liquid highlights. Two ink blobs, one on the current page and
 * one following the pointer, run through a blur + alpha-threshold filter, so
 * they stretch and melt into each other. Only same-coloured shapes go through
 * the filter: mixing in the pale base pill leaves grey halos at the threshold.
 */
export function Nav() {
  const pathname = usePathname();
  const [hover, setHover] = useState<string | null>(null);
  return (
    <nav aria-label="Main" className="fixed inset-x-0 top-5 z-50 flex justify-center px-4" data-no-theme>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b" />
          <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -11.5" />
        </filter>
      </svg>
      <div className="relative" onPointerLeave={() => setHover(null)}>
        <div aria-hidden className="absolute inset-y-1 inset-x-0 rounded-full bg-surface" />
        <ul aria-hidden className="absolute -inset-2 flex p-2" style={{ filter: "url(#goo)" }}>
          {ITEMS.map((it) => (
            <li key={it.href} className="relative flex-1">
              {active(pathname, it.href) && (
                <motion.span
                  layoutId="nav-blob"
                  className="absolute -inset-y-0.5 inset-x-0 rounded-full bg-ink"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              {hover === it.href && (
                <motion.span
                  layoutId="nav-hover"
                  className="absolute inset-y-1 inset-x-1 rounded-full bg-ink"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
            </li>
          ))}
        </ul>
        <ul className="relative flex">
          {ITEMS.map((it) => {
            const on = active(pathname, it.href);
            return (
              <li key={it.href} className="flex-1" onPointerEnter={() => setHover(it.href)}>
                <Link
                  href={it.href}
                  aria-current={on ? "page" : undefined}
                  className={`block px-3 py-2 text-center text-[13px] transition-colors sm:px-4 ${
                    on || hover === it.href ? "text-bg" : "text-body"
                  }`}
                >
                  {it.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
