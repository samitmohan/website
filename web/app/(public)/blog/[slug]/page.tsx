import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { getPost, getAllPosts, getHiddenPosts, getAllSlugs, formatPostDate } from "@/lib/blog";
import { markdownToHtml } from "@/lib/markdown";
import { RSS_ALTERNATE } from "@/lib/metadata";
import { PublicNav, PublicFooter } from "@/components/public-nav";
import { BlogContent } from "@/components/blog-content";
import { SelectionShare } from "@/components/selection-share";
import { ViewBeacon } from "@/components/view-beacon";
import { FunPost } from "@/components/fun-post";

const BackToTop = dynamic(() =>
  import("@/components/blog-post-chrome").then((m) => m.BackToTop)
);
const PostKeyboardNav = dynamic(() =>
  import("@/components/blog-post-chrome").then((m) => m.PostKeyboardNav)
);
const PostTOC = dynamic(() =>
  import("@/components/blog-post-chrome").then((m) => m.PostTOC)
);

export const revalidate = 30;

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
    alternates: { canonical: `/blog/${slug}`, types: RSS_ALTERNATE },
    robots: post.hidden ? { index: false, follow: false } : undefined,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article" as const,
      url: `/blog/${slug}`,
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

  // Keep neighbors/related within the same visibility set so hidden "fun"
  // posts never link out to the public blog (and vice versa).
  const allPosts = post.hidden ? getHiddenPosts() : getAllPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  const related = allPosts
    .filter((p) => p.slug !== slug && p.tags.some((t) => post.tags.includes(t)))
    .slice(0, 3);

  // Hidden "fun" posts get the Clairo-warm reading layout instead of the
  // professional blog chrome.
  if (post.hidden) {
    return (
      <FunPost post={post} html={html} prevPost={prevPost} nextPost={nextPost} />
    );
  }

  const prevHref = prevPost ? `/blog/${prevPost.slug}` : null;
  const nextHref = nextPost ? `/blog/${nextPost.slug}` : null;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    author: { "@type": "Person", name: "Samit Mohan", url: "https://samitmohan.in" },
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://samitmohan.in/blog/${post.slug}` },
    publisher: { "@type": "Person", name: "Samit Mohan" },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {post.math && (
        // eslint-disable-next-line @next/next/no-css-tags -- precedence-hoisted, loaded only for math posts
        <link rel="stylesheet" href="/katex/katex.min.css" precedence="default" />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <ViewBeacon slug={slug} />
      <BackToTop />
      <PostTOC scope="article" />
      <PostKeyboardNav prevHref={prevHref} nextHref={nextHref} />
      <PublicNav />

      <main id="main" className="mx-auto max-w-[44rem] px-6 py-14 md:py-20">
        {/* Breadcrumb */}
        <div className="label mb-10 flex items-center gap-2">
          <Link
            href={post.hidden ? "/fun" : "/blog"}
            className="transition-colors hover:text-orange"
          >
            {post.hidden ? "fun" : "Posts"}
          </Link>
          <span className="text-ink-4">/</span>
          <span className="truncate text-ink-2">{post.title}</span>
        </div>

        {/* Header */}
        <header className="mb-8">
          <h1 className="display text-balance text-[24px] text-ink md:text-[32px]">
            {post.title}
          </h1>
          <div className="mt-7 flex items-center gap-3 border-y border-rule py-4">
            <Image
              src="/photo.jpeg"
              alt=""
              width={72}
              height={72}
              className="h-9 w-9 rounded-full object-cover"
            />
            <span className="text-[14px] font-medium text-ink">
              Samit Mohan
            </span>
            <span className="meta ml-auto flex items-center gap-2">
              <time>{formatPostDate(post.date)}</time>
              <span className="text-ink-4">・</span>
              <span>{post.readingTime} min</span>
            </span>
          </div>
        </header>

        {post.thumbnail && (
          <div className="mb-12 overflow-hidden rounded-[var(--radius-card)] border border-rule bg-surface-2">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={post.thumbnail}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 704px"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <article className="mt-10">
          <SelectionShare title={post.title}>
          <BlogContent
            html={html}
            className="
              blog-prose
              [&_h1]:font-[family-name:var(--font-display)] [&_h1]:text-[2rem] [&_h1]:font-normal [&_h1]:tracking-[-0.02em] [&_h1]:text-ink [&_h1]:mt-14 [&_h1]:mb-5
              [&_h2]:font-[family-name:var(--font-display)] [&_h2]:text-[1.75rem] [&_h2]:font-normal [&_h2]:tracking-[-0.02em] [&_h2]:leading-[130%] [&_h2]:text-ink [&_h2]:mt-14 [&_h2]:mb-4 [&_h2]:pb-3 [&_h2]:border-b [&_h2]:border-rule
              [&_h3]:text-[18px] [&_h3]:font-medium [&_h3]:tracking-tight [&_h3]:leading-[135%] [&_h3]:text-ink [&_h3]:mt-10 [&_h3]:mb-2
              [&_h4]:text-[15px] [&_h4]:font-medium [&_h4]:leading-[135%] [&_h4]:text-ink [&_h4]:mt-7 [&_h4]:mb-2
              [&_p]:text-[17.5px] [&_p]:text-ink-2 [&_p]:leading-[175%] [&_p]:mb-5 [&_p]:text-pretty
              [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:marker:text-ink-4
              [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:marker:text-ink-4 [&_ol]:marker:font-mono [&_ol]:marker:text-[13px]
              [&_li]:text-[17.5px] [&_li]:text-ink-2 [&_li]:leading-[1.75] [&_li]:mb-1.5
              [&_strong]:text-ink [&_strong]:font-medium
              [&_em]:italic
              [&_blockquote]:border-l-2 [&_blockquote]:border-orange [&_blockquote]:bg-surface-2 [&_blockquote]:rounded-r-lg [&_blockquote]:py-3 [&_blockquote]:pl-5 [&_blockquote]:pr-4 [&_blockquote]:text-ink-2 [&_blockquote]:not-italic [&_blockquote]:my-7
              [&_pre]:overflow-x-auto [&_pre]:text-[13px] [&_pre]:leading-6
              [&_[data-rehype-pretty-code-figure]]:max-w-none [&_[data-rehype-pretty-code-figure]]:-mx-4 [&_[data-rehype-pretty-code-figure]]:my-7
              [&_code]:font-mono [&_code]:text-[0.875em]
              [&_:not(pre)>code]:bg-surface-2 [&_:not(pre)>code]:border [&_:not(pre)>code]:border-rule [&_:not(pre)>code]:text-ink [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:rounded-md [&_:not(pre)>code]:text-[0.85em]
              [&_img]:rounded-[var(--radius-card)] [&_img]:max-w-full [&_img]:my-7 [&_img]:border [&_img]:border-rule
              [&_hr]:border-rule [&_hr]:my-12
              [&_table]:w-full [&_table]:text-[14px] [&_table]:my-7 [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-xl
              [&_th]:border [&_th]:border-rule [&_th]:px-3.5 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-medium [&_th]:bg-surface-2 [&_th]:text-ink [&_th]:font-mono [&_th]:text-[11px] [&_th]:uppercase [&_th]:tracking-[0.08em]
              [&_td]:border [&_td]:border-rule [&_td]:px-3.5 [&_td]:py-2.5 [&_td]:text-ink-2
            "
          />
          </SelectionShare>
        </article>

        {related.length > 0 && (
          <section className="mt-16 border-t border-rule pt-10">
            <h2 className="label mb-6">Related posts</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="card-surface group flex flex-col p-4"
                >
                  <h3 className="text-[14.5px] font-medium leading-[135%] text-ink transition-colors group-hover:text-orange">
                    {p.title}
                  </h3>
                  <div className="meta mt-auto pt-4">
                    {formatPostDate(p.date)}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-16 grid gap-4 border-t border-rule pt-8 sm:grid-cols-2">
          <div>
            {prevPost && (
              <Link href={`/blog/${prevPost.slug}`} className="group block">
                <p className="label mb-2">
                  ← Older
                </p>
                <p className="text-[15px] leading-snug text-ink-2 transition-colors group-hover:text-orange">
                  {prevPost.title}
                </p>
              </Link>
            )}
          </div>
          <div className="sm:text-right">
            {nextPost && (
              <Link href={`/blog/${nextPost.slug}`} className="group block">
                <p className="label mb-2">
                  Newer →
                </p>
                <p className="text-[15px] leading-snug text-ink-2 transition-colors group-hover:text-orange">
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
