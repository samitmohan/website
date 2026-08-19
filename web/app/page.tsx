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
        <Link href="/about" className="wordmark" aria-label="About">
          <span className="wordmark-swap">
            <span className="wordmark-rest">samit</span>
            <span className="wordmark-hover" aria-hidden>
              about
            </span>
          </span>
          <Mark name="computer" ext="png" className="wordmark-computer" />
        </Link>
      </main>

      <div className="home-doors">
        <Link href="/blog" className="door">
          <Figure name="blog-backprop" />
          <span className="door-label">blog</span>
        </Link>
        <Link href="/projects" className="door">
          <Figure name="agent-loop" />
          <span className="door-label">projects</span>
        </Link>
      </div>

      <PublicFooter />
    </div>
  );
}
