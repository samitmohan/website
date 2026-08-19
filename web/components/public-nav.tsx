import Link from "next/link";
import { Mark } from "@/components/mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { SOCIAL_LINKS } from "@/config/links";

type Page = "about" | "blog" | "projects";

const PAGES: { label: string; href: string; key: Page }[] = [
  { label: "about", href: "/about", key: "about" },
  { label: "blog", href: "/blog", key: "blog" },
  { label: "projects", href: "/projects", key: "projects" },
];

/**
 * The inner-page bar. The homepage does not use it - there the corner marks
 * are the navigation - so this exists for /about, /blog, /projects, posts and
 * the interviews pages.
 *
 * Server component. The hairline that appears once the page moves is a
 * scroll-timeline animation in globals.css, so there is still no JavaScript
 * here beyond the theme toggle. Browsers without scroll-driven animations get
 * the settled state, which reads as a normal sticky bar rather than a broken
 * one.
 *
 * The name is `PublicNav` rather than something newer because seven call sites
 * import it and renaming it would be the whole diff.
 */
export function PublicNav({ current }: { current?: Page } = {}) {
  return (
    <nav className="nav-sticky sticky top-0 z-50 border-b border-rule bg-[var(--nav-bg)] backdrop-blur-xl">
      <div className="shell flex h-14 items-center justify-between">
        <Link
          href="/"
          aria-label="Home"
          className="home-link -ml-1 text-ink"
        >
          <Mark name="sm" className="mark-sm" />
        </Link>

        <div className="flex items-center gap-1">
          {PAGES.map((p) => (
            <Link
              key={p.key}
              href={p.href}
              aria-current={current === p.key ? "page" : undefined}
              className={`inline-flex min-h-[44px] items-center px-3 text-[14px] transition-colors duration-200 ${
                current === p.key ? "text-ink" : "text-ink-2 hover:text-ink"
              }`}
            >
              {p.label}
            </Link>
          ))}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

/**
 * Footer. The five sketch marks live here on inner pages, which is the only
 * place they appear off the homepage. The feed link that used to sit on the
 * right is gone; `<link rel="alternate">` in the root layout still advertises
 * /blog/rss.xml to anything that reads feeds, which is what actually finds it.
 */
export function PublicFooter() {
  return (
    <footer className="mt-4 border-t border-rule">
      <div className="shell flex flex-wrap items-center justify-between gap-x-6 gap-y-4 py-8 text-[13px] text-ink-2">
        <span>© 2026 samit</span>

        <div className="home-socials">
          {SOCIAL_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              aria-label={l.label}
              className="home-link"
              {...(l.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              <Mark name={l.mark} className="mark-icon" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
