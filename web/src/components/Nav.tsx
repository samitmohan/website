"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
 * Pill nav whose highlight is a liquid blob: the blob layer runs through a
 * blur + alpha-threshold filter, so the moving highlight and the resting pill
 * melt into each other. Labels sit on a separate, unfiltered layer.
 */
export function Nav() {
  const pathname = usePathname();
  if (pathname === "/mocks/b" || pathname === "/mocks/c") return null;
  return (
    <nav aria-label="Main" className="fixed inset-x-0 top-5 z-50 flex justify-center px-4" data-no-theme>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b" />
          <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -11.5" />
        </filter>
      </svg>
      <div className="relative">
        <ul aria-hidden className="absolute inset-0 flex" style={{ filter: "url(#goo)" }}>
          <li className="absolute inset-y-1 inset-x-0 rounded-full bg-surface" />
          {ITEMS.map((it) => (
            <li key={it.href} className="relative flex-1">
              {active(pathname, it.href) && (
                <motion.span
                  layoutId="nav-blob"
                  className="absolute -inset-y-0.5 inset-x-0 rounded-full bg-ink"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </li>
          ))}
        </ul>
        <ul className="relative flex">
          {ITEMS.map((it) => {
            const on = active(pathname, it.href);
            return (
              <li key={it.href} className="flex-1">
                <Link
                  href={it.href}
                  aria-current={on ? "page" : undefined}
                  className={`block px-3 py-2 text-center text-[13px] transition-colors sm:px-4 ${
                    on ? "text-bg" : "text-body hover:text-ink"
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
