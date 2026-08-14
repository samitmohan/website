"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SearchTrigger } from "@/components/search/search-trigger";
import { ThemeToggle } from "@/components/theme-toggle";

export function PublicNav() {
  const pathname = usePathname();
  const onBlog = pathname === "/blog" || pathname.startsWith("/blog/");
  const onHome = pathname === "/";

  // Hairline only once the page has moved, so the nav sits flush at rest.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // On the homepage the name is already the hero headline, so the nav copy of
  // it is redundant until the hero scrolls away. Everywhere else it is the
  // only identity anchor and the way back home, so it stays put.
  const nameHidden = onHome && !scrolled;

  return (
    <nav
      className={`sticky top-0 z-50 border-b bg-[var(--nav-bg)] backdrop-blur-xl transition-colors duration-200 ${
        scrolled ? "border-rule" : "border-transparent"
      }`}
    >
      <div className="shell flex h-14 items-center justify-between">
        <Link
          href="/"
          aria-hidden={nameHidden}
          tabIndex={nameHidden ? -1 : undefined}
          className={`-my-2 inline-flex min-h-[44px] items-center py-2 text-[15px] font-medium tracking-tight text-ink transition-[opacity,transform,color] duration-200 hover:text-orange ${
            nameHidden
              ? "pointer-events-none -translate-y-1 opacity-0"
              : "translate-y-0 opacity-100"
          }`}
        >
          Samit Mohan
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/blog"
            aria-current={onBlog ? "page" : undefined}
            className={`inline-flex min-h-[44px] items-center rounded-full px-3.5 text-[13px] transition-colors duration-200 ${
              onBlog ? "text-ink" : "text-ink-2 hover:text-ink"
            }`}
          >
            Blog
          </Link>
          <SearchTrigger />
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
          className="inline-flex min-h-[44px] items-center text-ink-2 transition-colors hover:text-orange"
        >
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/samit-mohan/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center text-ink-2 transition-colors hover:text-orange"
        >
          LinkedIn
        </a>
        <a
          href="mailto:samitmohan@gmail.com"
          className="inline-flex min-h-[44px] items-center text-ink-2 transition-colors hover:text-orange"
        >
          Email
        </a>
        <a
          href="/samit-resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center text-ink-2 transition-colors hover:text-orange"
        >
          CV
        </a>
      </div>
    </footer>
  );
}
