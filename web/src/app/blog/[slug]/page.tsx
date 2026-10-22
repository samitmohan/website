import { preload } from "react-dom";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Page } from "@/components/Page";
import { Reveal } from "@/components/Reveal";
import { RunScripts } from "@/components/RunScripts";
import { TocRail } from "@/components/TocRail";
import { formatPostDate, getAllPosts, getAllSlugs, getPersonalPosts, getPost } from "@/lib/blog";
import { deferScripts } from "@/lib/defer-scripts";
import { markdownToHtml, type Heading } from "@/lib/markdown";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  const og = post.hidden ? "/og/index.png" : `/og/${post.slug}.png`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.description, publishedTime: post.date, images: [og] },
  };
}

/** Drops a hand-written "## index" / "## table of contents" section; the rail and contents box replace it. */
function withoutOwnIndex(md: string): string {
  const lines = md.split("\n");
  const start = lines.findIndex((l) => /^##\s+(index|contents|table of contents)\s*$/i.test(l));
  if (start < 0) return md;
  const len = lines.slice(start + 1).findIndex((l) => /^(#{1,6}\s|---\s*$)/.test(l));
  lines.splice(start, len < 0 ? lines.length - start : len + 1);
  return lines.join("\n");
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const headings: Heading[] = [];
  const html = deferScripts(await markdownToHtml(withoutOwnIndex(post.content), post.math, headings));

  // A contents list only earns its space on a post with real sections.
  const toc = headings.length >= 4 ? headings : [];

  const siblings = post.hidden ? getPersonalPosts() : getAllPosts();
  const i = siblings.findIndex((p) => p.slug === slug);
  const prev = i < siblings.length - 1 ? siblings[i + 1] : null;
  const next = i > 0 ? siblings[i - 1] : null;
  const related = post.hidden
    ? []
    : siblings.filter((p) => p.slug !== slug && p.tags.some((t) => post.tags.includes(t))).slice(0, 3);

  // KaTeX hides maths until its fonts load (font-display: block, so glyphs never land in the wrong
  // font); fetching the two that most equations use alongside the stylesheet shortens that wait.
  if (post.math)
    for (const f of ["KaTeX_Main-Regular", "KaTeX_Math-Italic"])
      preload(`/katex/fonts/${f}.woff2`, { as: "font", type: "font/woff2", crossOrigin: "" });

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    author: { "@type": "Person", name: "Samit Mohan", url: "https://samitmohan.in" },
    datePublished: post.date,
    mainEntityOfPage: `https://samitmohan.in/blog/${post.slug}`,
  };

  return (
    <Page>
      {post.math && <link rel="stylesheet" href="/katex/katex.min.css" precedence="default" />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {post.readingTime >= 10 && <div className="read-progress" aria-hidden />}
      {toc.length > 0 && <TocRail toc={toc} />}
      <Reveal slot={0} as="header">
        <Link href={post.hidden ? "/blog/personal" : "/blog"} className="meta -my-1 inline-block py-1 hover:text-accent">
          ← {post.hidden ? "personal" : "writing"}
        </Link>
        <h1 className="mt-4 text-[28px] leading-tight">{post.title}</h1>
        <p className="meta mt-3">
          {formatPostDate(post.date)} · {post.readingTime} min read
          {post.tags.length > 0 && !post.hidden && <> · {post.tags.join(", ")}</>}
        </p>
      </Reveal>

      {toc.length > 0 && (
        <Reveal slot={1} as="section" className="mt-8 rounded-2xl bg-surface p-5 xl:hidden">
          <h2 className="meta">contents</h2>
          <ol className="mt-2 space-y-1 text-[14px]">
            {toc.map((h, n) => (
              <li key={h.id} className="flex gap-3">
                <span className="meta w-5">{n + 1}</span>
                <a href={`#${h.id}`} className="inline-block py-0.5 text-ink hover:text-accent">{h.text}</a>
              </li>
            ))}
          </ol>
        </Reveal>
      )}

      <Reveal slot={2}>
        <RunScripts html={html} className={`prose mt-10 ${post.hidden ? "prose-reveal" : ""}`} />
      </Reveal>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="meta">related</h2>
          <ul className="mt-2">
            {related.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="block border-b border-hairline py-3 text-ink hover:text-accent">{p.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav aria-label="More posts" className="mt-16 grid grid-cols-2 gap-4">
        {prev ? (
          <Link href={`/blog/${prev.slug}`} className="group rounded-2xl bg-surface p-4">
            <span className="meta">← older</span>
            <span className="mt-1 block text-ink group-hover:text-accent">{prev.title}</span>
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/blog/${next.slug}`} className="group rounded-2xl bg-surface p-4 text-right">
            <span className="meta">newer →</span>
            <span className="mt-1 block text-ink group-hover:text-accent">{next.title}</span>
          </Link>
        ) : <span />}
      </nav>
    </Page>
  );
}
