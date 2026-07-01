import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, formatPostDate } from "@/lib/blog";
import { PublicNav, PublicFooter } from "@/components/public-nav";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Posts — Samit Mohan",
  description: "Writing on ML, computer vision, and rebuilding things from scratch.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav />

      <main id="main" className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground mb-10">
          Posts
        </h1>

        <ul className="space-y-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex items-baseline justify-between gap-6"
              >
                <h2 className="text-[17px] font-medium tracking-tight text-foreground group-hover:text-primary leading-snug">
                  {post.title}
                </h2>
                <span className="shrink-0 font-mono text-[12px] text-muted-foreground/60 whitespace-nowrap tabular-nums">
                  {formatPostDate(post.date)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <PublicFooter />
    </div>
  );
}
