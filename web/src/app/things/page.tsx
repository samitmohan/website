import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { MemoryCard } from "@/components/MemoryCard";
import { Page } from "@/components/Page";
import { Reveal } from "@/components/Reveal";
import { Deck } from "@/components/Deck";
import { Top4 } from "@/components/Top4";
import { THING_PHOTOS } from "@/content/site";
import { getTop4 } from "@/lib/top4";
import { records, thingsILike } from "@/lib/things";

export const metadata: Metadata = {
  title: "Things",
  description: "Things Samit likes, a gallery of trips, and his top four of everything.",
  alternates: { canonical: "/things" },
  openGraph: { images: ["/og/things.png"] },
};

export default function Things() {
  const list = thingsILike();
  for (const [thing, src] of Object.entries(THING_PHOTOS)) {
    if (!list.includes(thing)) throw new Error(`THING_PHOTOS: "${thing}" matches no bullet in the things-i-like post`);
    for (const f of [src, src.replace("/things/", "/things/sm/")])
      if (!fs.existsSync(path.join(process.cwd(), "public", f))) throw new Error(`THING_PHOTOS: ${f} does not exist`);
  }
  const top4 = getTop4();
  return (
    <Page>
      <Reveal slot={0} as="header">
        <h1 className="text-[22px]">Things</h1>
      </Reveal>

      <Reveal slot={1} as="section" className="mt-14">
        <Deck things={list} photos={THING_PHOTOS} />
      </Reveal>

      <section id="gallery" className="mt-28">
        <h2 className="text-center font-serif text-[clamp(40px,7vw,64px)] leading-none font-normal">Gallery</h2>
        <div className="mt-10">
          <MemoryCard trips={records()} />
        </div>
      </section>

      <section id="top4" className="mt-28">
        <Top4 data={top4} />
      </section>
    </Page>
  );
}
