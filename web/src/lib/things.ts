import fs from "node:fs";
import path from "node:path";
import { getPost } from "@/lib/blog";
import type { Roll } from "@/components/FilmRoll";
import { variantUrl } from "@/lib/responsive";

/** Every bullet of the "things i like" post, so the page and the post never drift. */
export function thingsILike(): string[] {
  const post = getPost("things-i-like");
  if (!post) return [];
  return [...post.content.matchAll(/^- (.+)$/gm)].map((m) => m[1].replace(/\*/g, "").trim());
}

const IMAGES = path.join(process.cwd(), "public/assets/images");

/** One roll per trip folder. Add a folder under public/assets/images/ and an entry here. */
const ROLLS = [
  { dir: "goa", title: "Goa", year: "July 2026" },
  { dir: "bombay", title: "Bombay", year: "May 2025" },
];

export function rolls(): Roll[] {
  return ROLLS.map(({ dir, title, year }) => ({
    title,
    stock: "samitmohan.in",
    year,
    frames: fs
      .readdirSync(path.join(IMAGES, dir))
      .filter((f) => f.endsWith(".webp") && !f.includes("-poster"))
      .sort()
      .map((f) => {
        const src = `/assets/images/${dir}/${f}`;
        // Strip frames are ~230px wide; the 420w variant covers them at 2x. The viewer loads `src`.
        return { src, thumb: variantUrl(src, 420) };
      }),
  }));
}
