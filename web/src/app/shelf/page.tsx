import type { Metadata } from "next";
import { Page } from "@/components/Page";
import { Reveal } from "@/components/Reveal";
import { Bookshelf, FilmStrip, Records } from "@/components/Shelf";
import { getAlbums, getBooks, getFilms } from "@/lib/shelf";

export const metadata: Metadata = {
  title: "Shelf",
  description: "Books, papers, films and records Samit keeps coming back to.",
};

export default function Shelf() {
  return (
    <Page personal>
      <Reveal slot={0} as="header">
        <h1 className="text-[44px] leading-none italic">the shelf</h1>
        <p className="mt-3">What I read, watch and play on repeat. Pull a book out to open it.</p>
      </Reveal>

      <Reveal slot={2} as="section" className="mt-14">
        <h2 className="text-[26px] italic">reading</h2>
        <Bookshelf books={getBooks()} />
      </Reveal>

      <Reveal slot={3} as="section" className="mt-16">
        <h2 className="text-[26px] italic">watching</h2>
        <div className="mt-6">
          <FilmStrip films={getFilms()} />
        </div>
      </Reveal>

      <Reveal slot={4} as="section" className="mt-16">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[26px] italic">listening</h2>
          <a className="meta hover:text-accent" href="https://open.spotify.com/user/rajabetaa">spotify →</a>
        </div>
        <div className="mt-6">
          <Records albums={getAlbums()} />
        </div>
      </Reveal>

      <Reveal slot={5} as="section" className="mt-16">
        <p>
          The photos live on <a className="link" href="/photos">the film roll</a>.
        </p>
      </Reveal>
    </Page>
  );
}
