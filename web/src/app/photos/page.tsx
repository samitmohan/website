import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { FilmRoll, type Photo } from "@/components/FilmRoll";
import { Page } from "@/components/Page";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Photos",
  description: "Film rolls from trips. Rub a frame to develop it.",
};

// One roll per folder. Add a folder under public/assets/images/ and list it here.
const ROLLS = [
  { dir: "goa", name: "goa" },
  { dir: "bombay", name: "bombay" },
];

function photos(): Photo[] {
  return ROLLS.flatMap(({ dir, name }) =>
    fs
      .readdirSync(path.join(process.cwd(), "public/assets/images", dir))
      .filter((f) => f.endsWith(".webp") && !f.includes("-poster"))
      .sort()
      .map((f) => ({ src: `/assets/images/${dir}/${f}`, roll: name })),
  );
}

export default function Photos() {
  return (
    <Page personal>
      <Reveal slot={0} as="header">
        <h1 className="text-[44px] leading-none italic">film roll</h1>
        <p className="mt-3">Every frame comes out as a negative. Rub it to develop; tap to see it big.</p>
      </Reveal>
      <Reveal slot={2} className="mt-10">
        <FilmRoll photos={photos()} />
      </Reveal>
    </Page>
  );
}
