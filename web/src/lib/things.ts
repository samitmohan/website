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
// One save per folder. `post` is optional: when a save has a blog post, its
// frontmatter thumbnail becomes the save's icon and first photo; otherwise
// the first photo by filename leads. Missing or empty folders are skipped.
const ROLLS: { dir: string; title: string; post?: string }[] = [
  { dir: "life", title: "Life" },
  { dir: "goa", title: "Goa", post: "week-in-goa" },
  { dir: "bombay", title: "Bombay", post: "week-in-bombay" },
];

const photosIn = (dir: string) => {
  const abs = path.join(IMAGES, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs).filter((f) => f.endsWith(".webp") && !f.includes("-poster"));
};

export function records(): Trip[] {
  return ROLLS.map(({ dir, title, post }) => ({
    title,
    // Real bytes on disk, shown as the save's size on the memory card.
    kb: Math.round(photosIn(dir).reduce((n, f) => n + fs.statSync(path.join(IMAGES, dir, f)).size, 0) / 1024),
    frames: photosIn(dir)
      .sort()
      .sort((a, b) => Number(isCover(post, dir, b)) - Number(isCover(post, dir, a)))
      .map((f) => {
        const src = `/assets/images/${dir}/${f}`;
        // Icons and the photo strip use the 420w variant; the large view loads `src`.
        return { src, thumb: variantUrl(src, 420) };
      }),
  })).filter((t) => t.frames.length > 0);
}

function isCover(post: string | undefined, dir: string, file: string): boolean {
  return post !== undefined && getPost(post)?.thumbnail === `/assets/images/${dir}/${file}`;
}
