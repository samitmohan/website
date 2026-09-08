import Link from "next/link";
import { SECTION_LINKS, SOCIAL_LINKS } from "@/config/links";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * The site header and footer. Deliberately identical on every page, homepage
 * included - same markup, same sizes, same position. An earlier version gave
 * inner pages a sticky bar with text links and the homepage a different set of
 * corner marks, which meant the chrome re-arranged itself as you moved through
 * the site.
 *
 * It is words now, not drawings. It used to be six hand-drawn marks - a house,
 * a monogram and four social icons - painted as CSS masks. Two problems. They
 * were a second drawing style competing with the one thing on the site that is
 * meant to be a drawing, the wordmark at the top of the homepage. And an icon
 * with no label is not a label: the sections were unreachable, so /blog had no
 * way to /projects except back through the homepage, which a comment in
 * globals.css claimed was already fixed and was not.
 *
 * Navigation up, everything else down. The outbound links moved to the footer:
 * eight words in the header need 467px, which on a phone wrapped to a second
 * row and spent the top of every screen on "github linkedin spotify email"
 * before the visitor reached the name. Rendering them in both places and
 * hiding one per breakpoint would put every link in the document twice for a
 * screen reader, so they live in one place - beside the copyright and the
 * theme toggle, which is what a footer is for.
 *
 * Named PublicNav/PublicFooter because the interviews pages and blog posts
 * import them under those names.
 */
export function PublicNav() {
  return (
    <header className="site-bar">
      <nav className="site-nav" aria-label="Sections">
        <Link href="/" className="site-id">
          samit
        </Link>
        {SECTION_LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="site-link">
            {l.label}
          </Link>
        ))}
      </nav>

    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="site-foot">
      {/* One group, so space-between has exactly two children and the toggle
          stays on the right at every width. With three children the toggle
          wrapped onto its own line left-aligned on a phone, which is the one
          place it must not be. */}
      <div className="site-meta">
        <span>© 2026 samit</span>

        <nav className="site-socials" aria-label="Elsewhere">
          {SOCIAL_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="site-link"
              {...(l.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Bottom right, opposite the copyright. */}
      <ThemeToggle />
    </footer>
  );
}
