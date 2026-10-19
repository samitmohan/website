import type { Metadata } from "next";
import { DimRows } from "@/components/DimRows";
import { FilmRoll } from "@/components/FilmRoll";
import { LabCards } from "@/components/LabCards";
import { Page } from "@/components/Page";
import { Reveal } from "@/components/Reveal";
import { Vicinity } from "@/components/Vicinity";
import { LAB, THINGS } from "@/content/site";
import { deferScripts } from "@/lib/defer-scripts";
import { getAlbums, getBooks, getFilms } from "@/lib/shelf";
import { rolls, thingsILike } from "@/lib/things";

export const metadata: Metadata = {
  title: "Things",
  description: "Small ML toys to poke, things Samit likes, photos on film, and what is on repeat.",
};

export default function Things() {
  const widgets = LAB.map((w) => ({
    ...w,
    html: deferScripts(`<link rel="stylesheet" href="/widgets/${w.id}.css"><div id="${w.id}"></div><script src="/widgets/${w.id}.js"></script>`),
  }));
  const list = thingsILike();
  return (
    <Page>
      <Reveal slot={0} as="header">
        <h1 className="text-[22px]">Things</h1>
        <p className="mt-1">Machines to poke, things I like, photos, and what is on repeat.</p>
      </Reveal>

      <Reveal slot={1} as="section" className="mt-14" >
        <h2 id="lab" className="text-[15px]">Lab</h2>
        <p className="mt-1 text-[14px]">Every card is live. The last few are the bigger widgets from posts.</p>
        <div className="mt-5">
          <LabCards widgets={widgets} />
        </div>
      </Reveal>

      <Reveal slot={2} as="section" className="mt-24">
        <Vicinity things={THINGS} />
        {list.length > 0 && (
          <details className="group mt-6">
            <summary className="meta cursor-pointer list-none text-center hover:text-accent">
              <span className="group-open:hidden">and {list.length} more small things ↓</span>
              <span className="hidden group-open:inline">fewer things ↑</span>
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

      <section id="film" className="mt-28">
        <div className="text-center">
          <h2 className="font-serif text-[clamp(40px,7vw,64px)] leading-none font-normal">The Film Roll</h2>
          <p className="mt-3 text-[14px]">Trips, kept as negatives.</p>
          <p className="mt-1 font-serif text-[15px] text-muted italic">rub a frame to develop it</p>
        </div>
        <div className="mt-10">
          <FilmRoll rolls={rolls()} />
        </div>
      </section>

      <section id="on-repeat" className="mt-24">
        <h2 className="text-[15px]">On repeat</h2>
        <div className="mt-6 grid gap-10">
          <div>
            <h3 className="meta">reading</h3>
            <div className="mt-2">
              <DimRows rows={getBooks().map((b) => ({ a: b.title, b: b.author, c: b.kind, href: b.url }))} />
            </div>
          </div>
          <div>
            <h3 className="meta">watching</h3>
            <div className="mt-2">
              <DimRows rows={getFilms().map((f) => ({ a: f.title, b: f.director, c: String(f.year) }))} />
            </div>
          </div>
          <div>
            <h3 className="meta">listening</h3>
            <div className="mt-2">
              <DimRows rows={getAlbums().map((a) => ({ a: a.title, b: a.artist, c: String(a.year) }))} />
            </div>
          </div>
        </div>
      </section>
    </Page>
  );
}
