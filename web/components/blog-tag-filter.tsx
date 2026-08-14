"use client";

import Link from "next/link";
import { useState } from "react";

// Dates arrive pre-formatted. lib/blog.ts reaches for fs, so nothing from it
// can be imported here without dragging Node built-ins into the client bundle.
export interface TagFilterPost {
  slug: string;
  title: string;
  dateLabel: string;
  description: string;
  tags: string[];
}

/**
 * Tag chips over the flat post list. Filtering happens client-side against the
 * already-rendered set, so /blog stays statically rendered rather than going
 * dynamic on a search param.
 */
export function BlogTagFilter({ posts, tags }: { posts: TagFilterPost[]; tags: string[] }) {
  const [active, setActive] = useState<string | null>(null);
  const visible = active ? posts.filter((p) => p.tags.includes(active)) : posts;

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActive(null)}
          aria-pressed={active === null}
          className={`inline-flex min-h-[36px] items-center rounded-full border px-3 text-[13px] transition-colors duration-200 ${
            active === null
              ? "border-rule-strong bg-surface-2 text-ink"
              : "border-rule text-ink-2 hover:border-rule-strong hover:text-ink"
          }`}
        >
          All
          <span className="ml-1.5 text-ink-3">{posts.length}</span>
        </button>
        {tags.map((tag) => {
          const count = posts.filter((p) => p.tags.includes(tag)).length;
          const on = active === tag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => setActive(on ? null : tag)}
              aria-pressed={on}
              className={`inline-flex min-h-[36px] items-center rounded-full border px-3 text-[13px] transition-colors duration-200 ${
                on
                  ? "border-rule-strong bg-surface-2 text-ink"
                  : "border-rule text-ink-2 hover:border-rule-strong hover:text-ink"
              }`}
            >
              {tag}
              <span className="ml-1.5 text-ink-3">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="rows">
        {visible.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="row">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h2 className="row-title flex items-center gap-2.5 text-[18px] font-medium leading-snug tracking-tight text-ink">
                {post.title}
                <span
                  aria-hidden
                  className="row-arrow hidden text-[13px] text-orange sm:inline"
                >
                  →
                </span>
              </h2>
              <span className="meta shrink-0">{post.dateLabel}</span>
            </div>
            {post.description && (
              // One line keeps the row rhythm even; the full description
              // is the first thing on the post itself.
              <p className="mt-1.5 line-clamp-2 min-h-[47px] max-w-3xl text-[15px] leading-[155%] text-ink-2">
                {post.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </>
  );
}
