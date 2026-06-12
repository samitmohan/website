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

function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / 200);
}

function formatDate(raw: string): string {
  const d = new Date(raw);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(POSTS_DIR).filter((f) =>
    f.match(/\.(md|markdown)$/)
  );

  const posts = files
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
        published: data.published !== false,
      };
    })
    .filter((p) => p.published)
    .sort((a, b) => b.date.localeCompare(a.date));

  return posts;
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
