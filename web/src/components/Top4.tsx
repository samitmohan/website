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

/** Four picks per category as ranked tiles that deal in when the category changes. */
export function Top4({ data }: { data: Data }) {
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("books");
  return (
    <div>
      <h2 className="text-center font-serif text-[clamp(40px,7vw,64px)] leading-none font-normal">#top4</h2>
      <div className="mt-6 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Category">
        {TABS.map(([key, label]) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} aria-pressed={tab === key} className="pill" onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>
      <ol className="mt-8 grid grid-cols-2 gap-3 sm:gap-4" key={tab}>
        {data[tab].map((p, i) => {
          const body = (
            <>
              <span className="font-serif text-[clamp(56px,10vw,88px)] leading-[.8] text-accent">{i + 1}</span>
              <span className="mt-auto block">
                <span className="block font-serif text-[clamp(19px,2.6vw,24px)] leading-tight text-ink italic">{p.title}</span>
                {p.by && <span className="mt-1 block text-[13px]">{p.by}</span>}
              </span>
            </>
          );
          const cls =
            "flex aspect-[5/4] flex-col rounded-[22px] bg-surface p-4 transition-transform duration-300 hover:-translate-y-1 hover:rotate-0 sm:p-5";
          return (
            <li
              key={i}
              className="animate-[top4-in_.6s_cubic-bezier(.16,1,.3,1)_backwards]"
              style={{ animationDelay: `${i * 80}ms`, rotate: `${TILT[i]}deg` }}
            >
              {p.url ? (
                <a href={p.url} className={`${cls} hover:text-accent`}>
                  {body}
                </a>
              ) : (
                <div className={cls}>{body}</div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
