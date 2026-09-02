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

// Everything on this page comes from files in the repo, so it can only change
// when a deploy changes them. Revalidating on a timer re-renders pages that
// cannot have changed.
export const revalidate = false;

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
    <div className="page accent-blue">
      {post.math && (
        // eslint-disable-next-line @next/next/no-css-tags -- precedence-hoisted, loaded only for math posts
        <link rel="stylesheet" href="/katex/katex.min.css" precedence="default" />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <BackToTop />
      <PostTOC scope="article" />
      <PostKeyboardNav prevHref={prevHref} nextHref={nextHref} />
      <PublicNav />

      <main id="main" className="mx-auto max-w-[44rem] px-6 py-14 md:py-20">
        {/* Breadcrumb */}
        <div className="label mb-10 flex items-center gap-2">
          <Link
            href={post.hidden ? "/fun" : "/blog"}
            className="transition-colors hover:text-brand"
          >
            {post.hidden ? "fun" : "Posts"}
          </Link>
          <span className="text-ink-4">/</span>
          <span className="truncate text-ink-2">{post.title}</span>
        </div>

        {/* Header */}
        <header className="mb-8">
          <h1 className="display text-balance text-[30px] text-ink md:text-[40px]">
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
          <BlogContent html={html} className="blog-prose" />
          </SelectionShare>
        </article>

        {related.length > 0 && (
          <section className="mt-16 border-t border-rule pt-10">
            <h2 className="label mb-6">Related posts</h2>
            {/* Rows, matching the blog index and the homepage. These were the
                last rounded cards on the site; a 3-up card grid also had no room
                for the description, so it asked readers to pick from titles
                alone. */}
            <div className="rows">
              {related.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="row">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="row-title text-[16px] font-medium leading-snug text-ink">
                      {p.title}
                    </h3>
                    <span className="meta shrink-0">
                      {formatPostDate(p.date)} · {p.readingTime} min
                    </span>
                  </div>
                  {p.description ? (
                    <p className="mt-1.5 max-w-3xl text-pretty text-[14px] leading-[155%] text-ink-2">
                      {p.description}
                    </p>
                  ) : null}
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
                <p className="text-[15px] leading-snug text-ink-2 transition-colors group-hover:text-brand">
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
                <p className="text-[15px] leading-snug text-ink-2 transition-colors group-hover:text-brand">
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
