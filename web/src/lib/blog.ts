import fs from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  math: boolean;
  readingTime: number;
  tags: string[];
  thumbnail?: string;
  hidden: boolean;
}

export interface Post extends PostMeta {
  content: string;
}

function fileToSlug(filename: string): string {
  return filename
    .replace(/^\d{4}-\d{2}-\d{2}-/, "")
    .replace(/\.(md|markdown)$/, "");
}

function fileToDate(filename: string): string {
  const m = filename.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : "";
}

/**
 * Words per minute over prose only.
 *
 * Counting raw markdown put the math post at 59 minutes and microGPT at 58,
 * because LaTeX source and fenced code dominate the word count on exactly the
 * posts that matter most. A `\frac{\partial L}{\partial w}` is one glance, not
 * six words, and a 40-line code block is not 200 words of reading. Measured
 * after stripping: math 59 -> 35, microGPT 58 -> 22, how-chatgpt-works 49 -> 40.
 * The long ones are still long; they are no longer wrong.
 */
function readingTime(content: string): number {
  const prose = content
    .replace(/```[\s\S]*?```/g, "")      // fenced code
    .replace(/\$\$[\s\S]*?\$\$/g, "")    // display math
    .replace(/\$[^$\n]+\$/g, "")         // inline math
    .replace(/`[^`\n]+`/g, "")           // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
    .replace(/<[^>]+>/g, "");            // raw html
  const words = prose.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(raw: string): string {
  const d = new Date(raw);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Read + normalize every published post (both public and hidden).
function readAllPosts() {
  const files = fs.readdirSync(POSTS_DIR).filter((f) =>
    f.match(/\.(md|markdown)$/)
  );

  return files
    .map((filename) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf8");
      const { data, content } = matter(raw);
      const slug = fileToSlug(filename);
      const dateStr = data.date
        ? new Date(data.date).toISOString().slice(0, 10)
        : fileToDate(filename);

      return {
        slug,
        title: (data.title as string) || slug,
        date: dateStr,
        description: (data.description as string) || "",
        math: Boolean(data.math),
        readingTime: readingTime(content),
        tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
        thumbnail: (data.thumbnail as string) || undefined,
        hidden: data.hidden === true,
        published: data.published !== false,
      };
    })
    .filter((p) => p.published)
    .sort((a, b) => b.date.localeCompare(a.date));
}

// Technical posts: everything without `hidden: true`. The /blog tab.
export function getAllPosts(): PostMeta[] {
  return readAllPosts().filter((p) => !p.hidden);
}

// Personal posts: `hidden: true` in frontmatter, a holdover from when they were
// the unlisted /fun section. The /blog/personal tab.
export function getPersonalPosts(): PostMeta[] {
  return readAllPosts().filter((p) => p.hidden);
}

// Both tabs, newest first. Feeds RSS, the sitemap and llms.txt.
export function getEveryPost(): PostMeta[] {
  return readAllPosts();
}

// Strip Liquid tags. Rewrite internal Jekyll post links to /blog/[slug].
// Images live in /public/assets and are served locally (no rewrite needed).
function preprocessContent(content: string): string {
  return content
    // Internal Jekyll post links: /tech/YYYY/MM/DD/slug.html → /blog/slug
    .replace(/\(\/tech\/\d{4}\/\d{2}\/\d{2}\/([^).]+)\.html\)/g, "(/blog/$1)")
    // Href versions
    .replace(/href="\/tech\/\d{4}\/\d{2}\/\d{2}\/([^"]+)\.html"/g, 'href="/blog/$1"')
    // Strip Jekyll Liquid tags
    .replace(/\{%[^%]*%\}/g, "")
    .replace(/\{\{[^}]*\}\}/g, "")
    // Strip Jekyll inline attribute syntax e.g. {: loading="lazy"}
    .replace(/\{:[^}]*\}/g, "");
}

export function getPost(slug: string): Post | null {
  const files = fs.readdirSync(POSTS_DIR).filter((f) =>
    f.match(/\.(md|markdown)$/)
  );

  const filename = files.find((f) => fileToSlug(f) === slug);
  if (!filename) return null;

  const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf8");
  const { data, content } = matter(raw);
  if (data.published === false) return null;
  const dateStr = data.date
    ? new Date(data.date).toISOString().slice(0, 10)
    : fileToDate(filename);

  return {
    slug,
    title: (data.title as string) || slug,
    date: dateStr,
    description: (data.description as string) || "",
    math: Boolean(data.math),
    readingTime: readingTime(content),
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    thumbnail: (data.thumbnail as string) || undefined,
    hidden: data.hidden === true,
    content: preprocessContent(content),
  };
}

export function formatPostDate(dateStr: string): string {
  return formatDate(dateStr);
}

export function getAllSlugs(): string[] {
  const files = fs.readdirSync(POSTS_DIR).filter((f) =>
    f.match(/\.(md|markdown)$/)
  );
  return files.filter((filename) => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf8");
    const { data } = matter(raw);
    return data.published !== false;
  }).map(fileToSlug);
}
