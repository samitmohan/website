import { notFound } from "next/navigation";
import Link from "next/link";
import { getPost, getAllPosts, getAllSlugs, formatPostDate } from "@/lib/blog";
import { markdownToHtml } from "@/lib/markdown";
import { PublicNav, PublicFooter } from "@/components/public-nav";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article" as const,
    },
    twitter: {
      card: "summary_large_image" as const,
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const html = await markdownToHtml(post.content, post.math);

  const allPosts = getAllPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav />

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground mb-10">
          <Link href="/blog" className="hover:text-foreground transition-colors">
            Posts
          </Link>
          <span>/</span>
          <span className="text-foreground truncate">{post.title}</span>
        </div>

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4 leading-tight">
            {post.title}
          </h1>
          {post.description && (
            <p className="text-[16px] text-muted-foreground leading-relaxed mb-5">
              {post.description}
            </p>
          )}
          <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
            <time className="font-mono">{formatPostDate(post.date)}</time>
            <span className="text-muted-foreground/30">·</span>
            <span>{post.readingTime} min read</span>
          </div>
        </header>

        <div className="border-t border-border mb-12" />

        {/* Content */}
        <article
          className="
            max-w-[65ch]
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-foreground [&_h1]:mt-10 [&_h1]:mb-4
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-border
            [&_h3]:text-[17px] [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-8 [&_h3]:mb-2
            [&_h4]:text-[15px] [&_h4]:font-semibold [&_h4]:text-foreground [&_h4]:mt-6 [&_h4]:mb-2
            [&_p]:text-[15px] [&_p]:text-muted-foreground [&_p]:leading-[1.75] [&_p]:mb-4
            [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5
            [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5
            [&_li]:text-[15px] [&_li]:text-muted-foreground [&_li]:leading-[1.75] [&_li]:mb-1
            [&_a]:text-primary [&_a:hover]:underline
            [&_strong]:text-foreground [&_strong]:font-semibold
            [&_em]:italic
            [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_blockquote]:italic [&_blockquote]:my-6
            [&_pre]:rounded-lg [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-border [&_pre]:bg-card [&_pre]:text-[13px] [&_pre]:leading-6 [&_pre]:p-4
            [&_[data-rehype-pretty-code-figure]]:max-w-none [&_[data-rehype-pretty-code-figure]]:-mx-4 [&_[data-rehype-pretty-code-figure]]:my-6
            [&_code]:font-mono [&_code]:text-[0.875em]
            [&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:text-foreground [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:rounded [&_:not(pre)>code]:text-[0.85em]
            [&_img]:rounded-lg [&_img]:max-w-full [&_img]:my-6 [&_img]:border [&_img]:border-border
            [&_hr]:border-border [&_hr]:my-10
            [&_table]:w-full [&_table]:text-[14px] [&_table]:my-6 [&_table]:border-collapse
            [&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:bg-muted [&_th]:text-foreground
            [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-muted-foreground
          "
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <div className="mt-16 pt-8 border-t border-border flex items-start justify-between gap-8">
          <div>
            {prevPost && (
              <Link href={`/blog/${prevPost.slug}`} className="group block">
                <p className="text-[11px] font-mono text-muted-foreground/60 mb-1">← older</p>
                <p className="text-[13px] text-muted-foreground group-hover:text-foreground transition-colors">
                  {prevPost.title}
                </p>
              </Link>
            )}
          </div>
          <div className="text-right">
            {nextPost && (
              <Link href={`/blog/${nextPost.slug}`} className="group block">
                <p className="text-[11px] font-mono text-muted-foreground/60 mb-1">newer →</p>
                <p className="text-[13px] text-muted-foreground group-hover:text-foreground transition-colors">
                  {nextPost.title}
                </p>
              </Link>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
