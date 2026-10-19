import type { Metadata } from "next";
import Link from "next/link";
import { BlogTabs } from "@/components/BlogTabs";
import { Page } from "@/components/Page";
import { Reveal } from "@/components/Reveal";
import { formatPostDate, getPersonalPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Personal",
  description: "Trips, lists, and things that are not about machine learning.",
};

/** Numbered like a tracklist, newest on top. */
export default function Personal() {
  const posts = getPersonalPosts();
  return (
    <Page personal>
      <Reveal slot={0} as="header">
        <h1 className="text-[40px] leading-none italic">the other half</h1>
        <p className="mt-3">Trips, lists, and things that are not about machine learning.</p>
      </Reveal>
      <Reveal slot={1} className="mt-6">
        <BlogTabs active="personal" />
      </Reveal>
      <Reveal slot={2} as="section" className="mt-12">
        <ol>
          {posts.map((p, i) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-3 border-b border-hairline py-4">
                <span className="meta">{String(posts.length - i).padStart(2, "0")}</span>
                <span className="font-serif text-[24px] leading-tight text-ink italic transition-colors group-hover:text-accent">{p.title}</span>
                <span className="meta">{formatPostDate(p.date)}</span>
                {p.description && <span className="col-start-2 col-span-2 mt-1 text-[14px]">{p.description}</span>}
              </Link>
            </li>
          ))}
        </ol>
      </Reveal>
    </Page>
  );
}
