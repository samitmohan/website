import Link from "next/link";
import { getAllPosts, formatPostDate } from "@/lib/blog";
import { PublicNav, PublicFooter } from "@/components/public-nav";

export default function BlogPage() {
  const posts = getAllPosts();
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
                <span className="shrink-0 text-[12px] text-muted-foreground/60 font-mono whitespace-nowrap">
                  {formatPostDate(post.date)}
                </span>
              </div>
              {post.description && (
                <p className="text-[14px] text-muted-foreground leading-relaxed line-clamp-2">
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
