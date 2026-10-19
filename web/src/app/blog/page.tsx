import type { Metadata } from "next";
import Link from "next/link";
import { BlogTabs } from "@/components/BlogTabs";
import { Page } from "@/components/Page";
import { Reveal } from "@/components/Reveal";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes from rebuilding ML from scratch: transformers, inference, training, and the maths underneath.",
};

export default function Blog() {
  const posts = getAllPosts();
  const years = Map.groupBy(posts, (p) => p.date.slice(0, 4));
  return (
    <Page>
      <Reveal slot={0} as="header" className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px]">Writing</h1>
          <p className="mt-1">Building things to understand them, then writing down what broke.</p>
        </div>
      </Reveal>
      <Reveal slot={1} className="mt-6">
        <BlogTabs active="technical" />
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
