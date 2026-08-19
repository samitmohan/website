import Link from "next/link";
import { Mark } from "@/components/mark";
import { SOCIAL_LINKS } from "@/config/links";

/**
 * The site header and footer. Deliberately identical on every page, homepage
 * included - same markup, same sizes, same position. An earlier version gave
 * inner pages a sticky bar with text links and the homepage a different set of
 * corner marks, which meant the chrome re-arranged itself as you moved through
 * the site.
 *
 * Named PublicNav/PublicFooter because the interviews pages and blog posts
 * import them under those names.
 */
export function PublicNav() {
  return (
    <header className="site-bar">
      <div className="site-marks">
        <Link href="/" aria-label="Home" className="mark-link">
          <Mark name="home" ext="png" className="mark-home" />
        </Link>
        <Link href="/about" aria-label="About" className="mark-link">
          <Mark name="sm" className="mark-sm" />
        </Link>
      </div>

      <nav className="site-socials" aria-label="Elsewhere">
        {SOCIAL_LINKS.map((l) => (
          <a
            key={l.label}
            href={l.href}
            aria-label={l.label}
            className="mark-link"
            {...(l.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            <Mark name={l.mark} className="mark-icon" />
          </a>
        ))}
      </nav>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="site-foot">
      <span>© 2026 samit</span>
    </footer>
  );
}
