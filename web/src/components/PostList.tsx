import Link from "next/link";
import { BlogTabs } from "@/components/BlogTabs";
import { Page } from "@/components/Page";
import { Reveal } from "@/components/Reveal";
import type { PostMeta } from "@/lib/blog";

/** One layout for both blog tabs: posts grouped by year, title, minutes, and a line of description. */
export function PostList({ tab, intro, posts }: { tab: "technical" | "personal"; intro: string; posts: PostMeta[] }) {
  const years = Map.groupBy(posts, (p) => p.date.slice(0, 4));
  return (
    <Page>
      <Reveal slot={0} as="header">
        <h1 className="text-[22px]">Writing</h1>
        <p className="mt-1">{intro}</p>
      </Reveal>
      <Reveal slot={1} className="mt-6">
        <BlogTabs active={tab} />
      </Reveal>
      {[...years].map(([year, list], i) => (
        <Reveal key={year} slot={2 + i} as="section" className="mt-12">
          <h2 className="meta">{year}</h2>
          <ul className="mt-2">
            {list.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="group grid grid-cols-[1fr_auto] gap-x-4 border-b border-hairline py-3">
                  <span className="text-ink transition-colors group-hover:text-accent">{p.title}</span>
                  <span className="meta self-baseline">{p.readingTime} min</span>
                  {p.description && <span className="col-span-2 mt-0.5 line-clamp-1 text-[13px]">{p.description}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      ))}
    </Page>
  );
}
