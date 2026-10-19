import fs from "node:fs";
import path from "node:path";
import { getPost } from "@/lib/blog";
import type { Trip } from "@/components/MemoryCard";
import { variantUrl } from "@/lib/responsive";

/** Every bullet of the "things i like" post, so the page and the post never drift. */
export function thingsILike(): string[] {
  const post = getPost("things-i-like");
  if (!post) return [];
  return [...post.content.matchAll(/^- (.+)$/gm)].map((m) => m[1].replace(/\*/g, "").trim());
}

const IMAGES = path.join(process.cwd(), "public/assets/images");

/** One record per trip folder. Add a folder under public/assets/images/ and an entry here. */
// `post` is the trip's blog post: its frontmatter thumbnail becomes the save's
// icon and the first photo.
const ROLLS = [
  { dir: "goa", title: "Goa", post: "week-in-goa" },
  { dir: "bombay", title: "Bombay", post: "week-in-bombay" },
];

export function records(): Trip[] {
  return ROLLS.map(({ dir, title, post }) => ({
    title,
    // Real bytes on disk, shown as the save's size on the memory card.
    kb: Math.round(
      fs
        .readdirSync(path.join(IMAGES, dir))
        .filter((f) => f.endsWith(".webp") && !f.includes("-poster"))
        .reduce((n, f) => n + fs.statSync(path.join(IMAGES, dir, f)).size, 0) / 1024,
    ),
    frames: fs
      .readdirSync(path.join(IMAGES, dir))
      .filter((f) => f.endsWith(".webp") && !f.includes("-poster"))
      .sort()
      .sort((a, b) => Number(isCover(post, dir, b)) - Number(isCover(post, dir, a)))
      .map((f) => {
        const src = `/assets/images/${dir}/${f}`;
        // Sleeves, labels and tracklist use the 420w variant; the large view loads `src`.
        return { src, thumb: variantUrl(src, 420) };
      }),
  }));
}

function isCover(post: string, dir: string, file: string): boolean {
  return getPost(post)?.thumbnail === `/assets/images/${dir}/${file}`;
}
