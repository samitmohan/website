import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, formatPostDate } from "@/lib/blog";
import { PublicNav, PublicFooter } from "@/components/public-nav";
import { RevealOnScroll } from "@/components/reveal";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Blog — Samit Mohan",
  description: "Writing on ML, computer vision, and rebuilding things from scratch.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <RevealOnScroll />
      <PublicNav />

      <main id="main" className="shell py-14 md:py-20">
        <h1 className="display mb-10 text-balance text-[40px] text-ink md:text-[56px]">
          Blog
        </h1>

        <div className="rows">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="row">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h2 className="row-title flex items-center gap-2.5 text-[18px] font-medium leading-snug tracking-tight text-ink">
                  {post.title}
                  <span
                    aria-hidden
                    className="row-arrow hidden text-[13px] text-orange sm:inline"
                  >
                    →
                  </span>
                </h2>
                <span className="meta shrink-0">
                  {formatPostDate(post.date)}
                </span>
              </div>
              {post.description && (
                // One line keeps the row rhythm even; the full description
                // is the first thing on the post itself.
                <p className="mt-1.5 line-clamp-1 max-w-3xl text-[15px] leading-[155%] text-ink-2">
                  {post.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
