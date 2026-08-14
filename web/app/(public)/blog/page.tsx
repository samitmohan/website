import type { Metadata } from "next";
import { getAllPosts, getAllTags, formatPostDate } from "@/lib/blog";
import { RSS_ALTERNATE } from "@/lib/metadata";
import { BlogTagFilter } from "@/components/blog-tag-filter";
import { PublicNav, PublicFooter } from "@/components/public-nav";

export const revalidate = 30;

export const metadata: Metadata = {
  // The root layout supplies the "- Samit Mohan" suffix via title.template.
  title: "Blog",
  description: "Writing on ML, computer vision, and rebuilding things from scratch.",
  alternates: { canonical: "/blog", types: RSS_ALTERNATE },
};

export default function BlogPage() {
  const posts = getAllPosts().map((post) => ({
    slug: post.slug,
    title: post.title,
    dateLabel: formatPostDate(post.date),
    description: post.description,
    tags: post.tags,
  }));
  const tags = getAllTags();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav />

      <main id="main" className="shell py-14 md:py-20">
        <h1 className="display mb-10 text-balance text-[24px] text-ink md:text-[30px]">
          Blog
        </h1>

        <BlogTagFilter posts={posts} tags={tags} />
      </main>

      <PublicFooter />
    </div>
  );
}
