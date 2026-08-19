import type { Metadata } from "next";
import Link from "next/link";
import { Figure } from "@/components/figure";
import { Mark } from "@/components/mark";
import { PublicNav, PublicFooter } from "@/components/public-nav";
import { RSS_ALTERNATE } from "@/lib/metadata";

export const metadata: Metadata = {
  alternates: { canonical: "/", types: RSS_ALTERNATE },
};

// Nothing here reads anything that can change between deploys.
export const revalidate = false;

/**
 * One screen, three doors: the name (about) and the two figures (blog,
 * projects). No copy - the argument for the work is on /about and the writing
 * is on /blog.
 *
 * The gradient-descent figure hangs from the top edge rather than sitting in
 * the column: the drawing is a weight on a thread, so anywhere below the top of
 * the page it reads as hung from nothing.
 *
 * Server component, no client JS beyond the theme toggle. The figures animate
 * in CSS inside their own files.
 */
export default function HomePage() {
  return (
    <div className="home">
      <PublicNav />

      <Figure name="gradient-descent" className="home-hang" />

      <main id="main" className="home-stage">
        {/* The page is a wordmark and three drawings, so there is no text to
            promote into a heading - and a page with no h1 announces nothing to
            a screen reader landing on it. */}
        <h1 className="sr-only">Samit Mohan</h1>

        <Link href="/about" className="wordmark" aria-label="About">
          <span className="hover-tile">about</span>
          <span className="wordmark-word">samit</span>
          <Mark name="computer" ext="png" className="wordmark-computer" />
        </Link>
      </main>

      <div className="home-doors">
        <Link href="/blog" className="door">
          <span className="hover-tile">blog</span>
          <Figure name="blog-backprop" />
        </Link>
        <Link href="/projects" className="door">
          <span className="hover-tile">projects</span>
          <Figure name="agent-loop" />
        </Link>
      </div>

      <PublicFooter />
    </div>
  );
}
