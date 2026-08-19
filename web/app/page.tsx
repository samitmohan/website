import type { Metadata } from "next";
import Link from "next/link";
import { Figure } from "@/components/figure";
import { Mark } from "@/components/mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { SOCIAL_LINKS } from "@/config/links";
import { RSS_ALTERNATE } from "@/lib/metadata";

export const metadata: Metadata = {
  alternates: { canonical: "/", types: RSS_ALTERNATE },
};

// Nothing here reads anything that can change between deploys.
export const revalidate = false;

/**
 * The landing page is one screen and four doors: the name (about), the two
 * cards (blog, projects) and the corner marks. It deliberately carries no
 * copy - the argument for the work lives on /about, and the writing lives on
 * /blog. Everything that used to be on this page moved to one of those.
 *
 * Server component, no client JS. The three figures animate in CSS inside their
 * own files; the only interactive thing on the page is the theme toggle.
 */
export default function HomePage() {
  return (
    <div className="home">
      <header className="home-bar">
        <div className="home-marks">
          <Link href="/" aria-label="Home" className="home-link">
            <Mark name="home" className="mark-icon" />
          </Link>
          <Link href="/about" aria-label="About" className="home-link">
            <Mark name="sm" className="mark-sm" />
          </Link>
        </div>

        <nav className="home-socials" aria-label="Elsewhere">
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
        </nav>
      </header>

      <main id="main" className="home-stage">
        <Figure name="gradient-descent" className="home-figure" />

        <Link href="/about" className="wordmark">
          samit
          <Mark name="underline" className="mark-underline" aria-hidden />
        </Link>
      </main>

      <div className="home-doors">
        <Link href="/blog" className="door">
          <Figure name="blog-backprop" />
          <span className="door-label">blogs</span>
        </Link>
        <Link href="/projects" className="door">
          <Figure name="agent-loop" />
          <span className="door-label">projects</span>
        </Link>
      </div>

      <footer className="home-foot">
        <span>© 2026 samit</span>
        {/* The only control on the page. It sits down here rather than up in
            the mark row because the top corners are for identity and the feed
            it replaced is still discoverable from <head>. */}
        <ThemeToggle className="-mr-3" />
      </footer>
    </div>
  );
}
