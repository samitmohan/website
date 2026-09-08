import type { Metadata } from "next";
import Link from "next/link";
import { Figure } from "@/components/figure";
import { PublicNav, PublicFooter } from "@/components/public-nav";
import { RSS_ALTERNATE } from "@/lib/metadata";

export const metadata: Metadata = {
  alternates: { canonical: "/", types: RSS_ALTERNATE },
};

// Nothing here reads anything that can change between deploys.
export const revalidate = false;

/**
 * One screen, three doors: the name (about) and the two figures (blog,
 * projects), under one line saying what the work is. The argument for it is on
 * /about and the writing is on /blog.
 *
 * The name is the only thing on the site that moves. It draws itself once, as
 * one unbroken pen stroke, and then holds as solid type - see
 * scripts/gen-wordmark.mjs. Nothing else here loops: the two door figures are
 * static diagrams. A page where every drawing is always moving reads as a
 * cartoon, and the gradient-descent ball that used to hang from the top edge
 * was the loudest part of that.
 *
 * Server component, no client JS at all.
 */
export default function HomePage() {
  return (
    <div className="home">
      <PublicNav />

      <main id="main" className="home-stage">
        {/* The drawn name is the heading, so it is inside the h1 rather than
            beside an sr-only copy of it. The svg carries its own title, but a
            heading a screen reader announces as "samit" and a page about Samit
            Mohan are not the same string, so the full name is spelled out. */}
        <h1 className="wordmark-head">
          <Link href="/about" className="wordmark" aria-label="About">
            <Figure name="wordmark" className="wordmark-word" />
            {/* The drawing the favicon is cut from, back beside the name. It
                arrives with the ink rather than with the pen: the stroke
                writes the word, then the word and the machine land together. */}
            <span className="wordmark-computer" aria-hidden />
            <span className="sr-only">Samit Mohan</span>
          </Link>
        </h1>

        {/* The page was a name and two drawings, with no answer to the only
            question a first-time visitor has. The role and the employer are
            not that answer - they are on /about, one click away, and they date
            the page. What the work is does not. */}
        <p className="home-line">
          I rebuild ML from scratch and write about it.
        </p>
      </main>

      {/* The label is a caption under the drawing rather than a tile that
          rises on hover: a hover label is no label at all on a touch screen,
          and it hid the only text that said which drawing was the blog. The
          doors used to carry an accent each - blue, crimson - which put three
          accents on one screen and read as a crayon box. There is one now. */}
      <div className="home-doors">
        <Link href="/blog" className="door door-blog">
          <Figure name="blog-backprop" className="door-figure" />
          <span className="door-label">Blog</span>
        </Link>
        <Link href="/projects" className="door door-projects">
          <Figure name="agent-loop" className="door-figure" />
          <span className="door-label">Projects</span>
        </Link>
      </div>

      <PublicFooter />
    </div>
  );
}
