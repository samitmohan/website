import fs from "node:fs";
import path from "node:path";
import { getPost } from "@/lib/blog";
import type { Trip } from "@/components/Crate";
import { variantUrl } from "@/lib/responsive";

/** Every bullet of the "things i like" post, so the page and the post never drift. */
export function thingsILike(): string[] {
  const post = getPost("things-i-like");
  if (!post) return [];
  return [...post.content.matchAll(/^- (.+)$/gm)].map((m) => m[1].replace(/\*/g, "").trim());
}

const IMAGES = path.join(process.cwd(), "public/assets/images");

/** One record per trip folder. Add a folder under public/assets/images/ and an entry here. */
const ROLLS = [
  { dir: "goa", title: "Goa" },
  { dir: "bombay", title: "Bombay" },
];

export function records(): Trip[] {
  return ROLLS.map(({ dir, title }) => ({
    title,
    frames: fs
      .readdirSync(path.join(IMAGES, dir))
      .filter((f) => f.endsWith(".webp") && !f.includes("-poster"))
      .sort()
      .map((f) => {
        const src = `/assets/images/${dir}/${f}`;
        // Sleeves, labels and tracklist use the 420w variant; the large view loads `src`.
        return { src, thumb: variantUrl(src, 420) };
      }),
  }));
}
