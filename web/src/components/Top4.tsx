"use client";

import { useState } from "react";
import type { Top4 as Data } from "@/lib/top4";

const TABS = [
  ["books", "books"],
  ["videos", "youtube"],
  ["movies", "movies"],
  ["artists", "artists"],
] as const;

const TILT = [-2.2, 1.6, -1.2, 2.4];

/** Tile shape follows the medium: posters stand tall, records are square, videos are wide. */
const SHAPE = {
  books: { aspect: "aspect-[2/3]", cols: "grid-cols-2 sm:grid-cols-4" },
  movies: { aspect: "aspect-[2/3]", cols: "grid-cols-2 sm:grid-cols-4" },
  artists: { aspect: "aspect-square", cols: "grid-cols-2 sm:grid-cols-4" },
  videos: { aspect: "aspect-video", cols: "grid-cols-2" },
} as const;

/** Four picks per category, as covers with their rank, dealt in when the category changes. */
export function Top4({ data }: { data: Data }) {
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("books");
  return (
    <div>
      <h2 className="text-center font-serif text-[clamp(40px,7vw,64px)] leading-none font-normal">#Top4</h2>
      <div className="mt-6 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Category">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className="pill aria-selected:!bg-ink aria-selected:!text-bg"
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {/* Every category is laid out in the same cell, only the chosen one visible, so the block is
          always as tall as the tallest category and switching never moves the page below it. */}
      <div className="mt-8 grid">
        {TABS.map(([cat]) => (
          <Panel key={cat} cat={cat} on={tab === cat} data={data} />
        ))}
      </div>
    </div>
  );
}

function Panel({ cat, on, data }: { cat: (typeof TABS)[number][0]; on: boolean; data: Data }) {
  return (
    <ol
      key={on ? `${cat}-on` : cat}
      aria-hidden={!on}
      inert={!on}
      className={`grid gap-x-3 gap-y-6 sm:gap-x-4 ${SHAPE[cat].cols} [grid-area:1/1] ${on ? "" : "invisible pointer-events-none"}`}
    >
      {data[cat].map((p, i) => {
        const body = (
          <>
            <span className={`relative block overflow-hidden rounded-[14px] bg-surface shadow-[var(--shadow-card)] ${SHAPE[cat].aspect}`}>
              {p.img && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.img} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" />
              )}
              <span className="absolute top-2 left-2 grid size-7 place-items-center rounded-full bg-black/70 font-serif text-[17px] leading-none text-white backdrop-blur-sm">
                {i + 1}
              </span>
            </span>
            <span className="mt-2 block px-0.5">
              <span className="line-clamp-2 block font-serif text-[17px] leading-tight text-ink italic transition-colors group-hover:text-accent">{p.title}</span>
              {p.by && <span className="mt-0.5 block text-[12px]">{p.by}</span>}
            </span>
          </>
        );
        return (
          <li
            key={i}
            className="animate-[top4-in_.6s_cubic-bezier(.16,1,.3,1)_backwards]"
            style={{ animationDelay: `${i * 80}ms`, rotate: `${TILT[i]}deg` }}
          >
            {p.url ? (
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="group block transition-transform duration-300 hover:-translate-y-1 hover:rotate-0">
                {body}
              </a>
            ) : (
              <div className="group block transition-transform duration-300 hover:-translate-y-1">{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
