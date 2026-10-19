import type { Metadata } from "next";
import { MemoryCard } from "@/components/MemoryCard";
import { LabCards } from "@/components/LabCards";
import { Page } from "@/components/Page";
import { Reveal } from "@/components/Reveal";
import { Deck } from "@/components/Deck";
import { LAB, THING_PHOTOS, THING_SNAPS } from "@/content/site";
import { deferScripts } from "@/lib/defer-scripts";
import { getTop4 } from "@/lib/top4";
import { records, thingsILike } from "@/lib/things";

export const metadata: Metadata = {
  title: "Things",
  description: "Interactive ML widgets, things Samit likes, a gallery, and his top four of everything.",
  alternates: { canonical: "/things" },
  openGraph: { images: ["/og/things.png"] },
};

export default function Things() {
  const widgets = LAB.map((w) => ({
    ...w,
    html: deferScripts(`<link rel="stylesheet" href="/widgets/${w.id}.css"><div id="${w.id}"></div><script src="/widgets/${w.id}.js"></script>`),
  }));
  const list = thingsILike();
  const top4 = getTop4();
  return (
    <Page>
      <Reveal slot={0} as="header">
        <h1 className="text-[22px]">Things</h1>
      </Reveal>

      <Reveal slot={1} as="section" className="mt-14" >
        <h2 id="widgets" className="text-[15px]">Widgets</h2>
        <p className="mt-1 text-[14px]">Interactive widgets from my blogs.</p>
        <div className="mt-5">
          <LabCards widgets={widgets} />
        </div>
      </Reveal>

      <Reveal slot={2} as="section" className="mt-24">
        <Deck things={list} photos={THING_PHOTOS} snaps={THING_SNAPS} />
        {list.length > 0 && (
          <details className="group mt-6">
            <summary className="meta cursor-pointer list-none text-center hover:text-accent">
              <span className="group-open:hidden">all {list.length} as a list ↓</span>
              <span className="hidden group-open:inline">close the list ↑</span>
            </summary>
            <ul className="mt-6 columns-1 gap-8 text-[14px] sm:columns-2">
              {list.map((t) => (
                <li key={t} className="mb-2 break-inside-avoid">
                  <span className="text-accent">·</span> {t}
                </li>
              ))}
            </ul>
          </details>
        )}
      </Reveal>

      <section id="gallery" className="mt-28">
        <h2 className="text-center font-serif text-[clamp(40px,7vw,64px)] leading-none font-normal">Gallery</h2>
        <div className="mt-10">
          <MemoryCard trips={records()} />
        </div>
      </section>

      <section id="top4" className="mt-24">
        <h2 className="text-[15px]">#top4</h2>
        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-10">
          {(
            [
              ["books", "books"],
              ["videos", "youtube"],
              ["movies", "movies"],
              ["artists", "artists"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <h3 className="meta">{label}</h3>
              <ol className="mt-2">
                {top4[key].map((p, i) => {
                  const body = (
                    <>
                      <span className="meta w-4">{i + 1}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-ink">{p.title}</span>
                        {p.by && <span className="block truncate text-[12px]">{p.by}</span>}
                      </span>
                    </>
                  );
                  const cls = "flex gap-3 border-b border-hairline py-2.5 text-[14px] transition-colors";
                  return (
                    <li key={i}>
                      {p.url ? <a href={p.url} className={`${cls} hover:text-accent`}>{body}</a> : <div className={cls}>{body}</div>}
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      </section>
    </Page>
  );
}
