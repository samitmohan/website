import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, formatPostDate } from "@/lib/blog";
import { getViews, formatViews } from "@/lib/views";
import { PublicNav, PublicFooter } from "@/components/public-nav";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Posts — Samit Mohan",
  description: "Writing on ML, computer vision, and rebuilding things from scratch.",
};

export default async function BlogPage() {
  const posts = getAllPosts();
  const views = await getViews(posts.map((p) => p.slug));
  const searchEntries = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    description: p.description,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav searchEntries={searchEntries} />

      <main id="main" className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
            Posts
          </h1>
        </div>

        <div className="space-y-12">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block"
            >
              <div className="flex items-baseline justify-between mb-2 gap-6">
                <h2 className="text-[20px] md:text-[22px] font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors leading-snug">
                  {post.title}
                </h2>
                <div className="shrink-0 flex items-baseline gap-3 font-mono text-[12px] text-muted-foreground/60 whitespace-nowrap tabular-nums">
                  <span>{post.readingTime} min</span>
                  <span aria-label={`${views[post.slug] ?? 0} views`}>
                    ◉ {formatViews(views[post.slug] ?? 0)}
                  </span>
                  <span>{formatPostDate(post.date)}</span>
                </div>
              </div>
              {post.description && (
                <p className="text-[14px] text-muted-foreground leading-relaxed line-clamp-2">
                  {post.description}
                </p>
              )}
              {post.tags.length > 0 && (
                <p className="mt-1.5 font-mono text-[11px] text-muted-foreground/60">
                  {post.tags.map((t) => `#${t}`).join("  ")}
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
