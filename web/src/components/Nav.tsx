"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const ITEMS = [
  { href: "/", label: "home" },
  { href: "/blog", label: "blog" },
  { href: "/projects", label: "projects" },
  { href: "/things", label: "things" },
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
              {/* Each item owns a blob that grows in when it is current or hovered.
                  Two growing and shrinking side by side is what reads as liquid. */}
              <span
                className="absolute inset-y-0.5 inset-x-0.5 rounded-full bg-ink transition-[scale,opacity] duration-300 ease-[cubic-bezier(.16,1,.3,1)]"
                style={{
                  scale: active(pathname, it.href) ? "1 1.12" : hover === it.href ? "1" : "0.55",
                  opacity: active(pathname, it.href) || hover === it.href ? 1 : 0,
                }}
              />
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
