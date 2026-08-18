import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, formatPostDate } from "@/lib/blog";
import { RSS_ALTERNATE } from "@/lib/metadata";
import { PublicNav, PublicFooter } from "@/components/public-nav";

// Everything on this page comes from files in the repo, so it can only change
// when a deploy changes them.
export const revalidate = false;

export const metadata: Metadata = {
  // The root layout supplies the "- Samit Mohan" suffix via title.template.
  title: "Blog",
  description:
    "Writing on transformers, inference, GPUs, and rebuilding ML from scratch.",
  alternates: { canonical: "/blog", types: RSS_ALTERNATE },
};

/**
 * One flat reverse-chronological list.
 *
 * An earlier pass split this into the from-scratch ladder and "everything else",
 * which meant maintaining two orderings of one set and pushing recent posts
 * below eight older ones. The homepage already presents the ladder in dependency
 * order for anyone who wants a path through it; the index is for finding a post.
 * Tags came out for the same reason: they were three more chips per row and the
 * titles already say what the posts are.
 */
export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav current="blog" />

      <main id="main" className="shell py-14 md:py-20">
        {/* No standfirst. The count and the topic list restated what the list
            below already shows, and RSS is in the footer on every page. */}
        <h1 className="display mb-10 text-balance text-[24px] text-ink md:text-[30px]">
          Blog
        </h1>

        <div className="rows">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="row">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="row-title text-[17px] font-medium leading-snug tracking-tight text-ink">
                  {post.title}
                  <span
                    aria-hidden
                    className="row-arrow ml-2 hidden text-[13px] text-brand sm:inline"
                  >
                    →
                  </span>
                </h2>
                <span className="meta shrink-0">
                  {formatPostDate(post.date)} · {post.readingTime} min
                </span>
              </div>
              {post.description ? (
                <p className="mt-1.5 max-w-3xl text-pretty text-[15px] leading-[155%] text-ink-2">
                  {post.description}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
