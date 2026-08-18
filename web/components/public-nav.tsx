import Link from "next/link";
import { SearchTrigger } from "@/components/search/search-trigger";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Footer links. Deliberately not the same four as the hero pills: GitHub,
 * LinkedIn, Email and CV already sit at the top of the homepage, so repeating
 * them here spent a row on nothing. The footer carries the surfaces with no
 * other entry point instead: the feed and the source.
 */
const FOOTER_LINKS: { label: string; href: string; external?: boolean }[] = [
  { label: "Blog", href: "/blog" },
  { label: "RSS", href: "/blog/rss.xml" },
  {
    label: "Source",
    href: "https://github.com/samitmohan/website",
    external: true,
  },
  { label: "Email", href: "mailto:samitmohan@gmail.com" },
];

/**
 * Server component. The two behaviours that used to need client state, the
 * hairline that appears once the page moves and the homepage name that fades in
 * behind the hero, are both driven by a scroll-timeline animation in
 * globals.css. Browsers without scroll-driven animations get the settled state
 * (hairline on, name visible), which is the correct fallback rather than a
 * broken one.
 *
 * `current` replaces usePathname. Every caller already knows which page it is.
 */
export function PublicNav({ current }: { current?: "home" | "blog" } = {}) {
  const onHome = current === "home";
  const onBlog = current === "blog";

  return (
    <nav
      className={`nav-sticky sticky top-0 z-50 border-b border-rule bg-[var(--nav-bg)] backdrop-blur-xl ${
        onHome ? "nav-on-home" : ""
      }`}
    >
      <div className="shell flex h-14 items-center justify-between">
        <Link
          href="/"
          className="nav-name -my-2 inline-flex min-h-[44px] items-center py-2 text-[15px] font-medium tracking-tight text-ink transition-colors duration-200 hover:text-brand"
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
        {FOOTER_LINKS.map((l) => (
          <a
            key={l.label}
            href={l.href}
            {...(l.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="inline-flex min-h-[44px] items-center text-ink-2 transition-colors hover:text-brand"
          >
            {l.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
