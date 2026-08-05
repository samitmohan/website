"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export function PublicNav() {
  const pathname = usePathname();
  const onBlog = pathname === "/blog" || pathname.startsWith("/blog/");

  // Hairline only once the page has moved, so the nav sits flush at rest.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 border-b bg-[var(--nav-bg)] backdrop-blur-xl transition-colors duration-300 ${
        scrolled ? "border-rule" : "border-transparent"
      }`}
    >
      <div className="shell flex h-14 items-center justify-between">
        <Link
          href="/"
          className="text-[15px] font-medium tracking-tight text-ink transition-colors hover:text-orange"
        >
          Samit Mohan
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/blog"
            aria-current={onBlog ? "page" : undefined}
            className={`rounded-full px-3 py-1.5 text-[13px] transition-colors ${
              onBlog ? "text-ink" : "text-ink-2 hover:text-ink"
            }`}
          >
            Blog
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

export function PublicFooter() {
  return (
    <footer className="mt-4 border-t border-rule">
      <div className="shell flex flex-wrap items-center justify-center gap-x-5 gap-y-2 py-8 text-[13px]">
        <a
          href="https://github.com/samitmohan"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink-2 transition-colors hover:text-orange"
        >
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/samit-mohan/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink-2 transition-colors hover:text-orange"
        >
          LinkedIn
        </a>
        <a
          href="mailto:samitmohan@gmail.com"
          className="text-ink-2 transition-colors hover:text-orange"
        >
          Email
        </a>
        <a href="#" className="text-ink-2 transition-colors hover:text-orange">
          CV
        </a>
      </div>
    </footer>
  );
}
