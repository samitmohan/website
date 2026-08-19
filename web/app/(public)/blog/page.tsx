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
 * One flat reverse-chronological list: date, title, nothing else.
 *
 * The descriptions and reading times that used to sit under each row were
 * doing the work of the post itself. An index is for finding something you
 * half-remember, and a title plus a date is what you remember. Descriptions
 * are still in the frontmatter and still feed RSS, the OG cards and llms.txt -
 * they just are not this page's job.
 */
export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav current="blog" />

      <main id="main" className="shell py-14 md:py-20">
        <h1 className="mb-10 font-[family-name:var(--font-mark)] text-[40px] leading-none text-ink md:text-[52px]">
          blog
        </h1>

        <ul className="post-list">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="post-row">
                <time className="post-date" dateTime={post.date}>
                  {formatPostDate(post.date)}
                </time>
                <span className="post-title">{post.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <PublicFooter />
    </div>
  );
}
