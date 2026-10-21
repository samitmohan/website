import fs from "node:fs";
import path from "node:path";
import { highlightCode } from "./markdown";

export type Difficulty = "easy" | "med" | "hard";
export type Question = { q: string; a: string; difficulty: Difficulty; tags: string[]; code?: string; codeHtml?: string };
export type Paper = { year: string; title: string; authors: string; why: string; url: string };
export type Section =
  | { id: string; title: string; type: "qa"; subs: { title: string; qs: Question[] }[] }
  | { id: string; title: string; type: "info"; html: string }
  | { id: string; title: string; type: "papers"; papers: Paper[] };

const FILE = path.join(process.cwd(), "content/interviews.json");
const LEVELS: Difficulty[] = ["easy", "med", "hard"];

/**
 * The interview guide from content/interviews.json. Titles lose their "1. "
 * prefix (the page numbers sections itself) and code samples are highlighted
 * at build time with the blog's highlighter. Fails the build on a malformed entry.
 */
export async function getInterviews(): Promise<Section[]> {
  const raw = JSON.parse(fs.readFileSync(FILE, "utf8")) as Section[];
  return Promise.all(
    raw.map(async (s) => {
      const title = s.title.replace(/^\d+\.\s*/, "");
      if (s.type !== "qa") return { ...s, title };
      const subs = await Promise.all(
        s.subs.map(async (sub) => ({
          ...sub,
          qs: await Promise.all(
            sub.qs.map(async (q) => {
              if (!q.q || !q.a || !LEVELS.includes(q.difficulty)) throw new Error(`interviews.json ${s.id}: bad entry "${q.q?.slice(0, 60)}"`);
              return q.code ? { ...q, codeHtml: asFigure(await highlightCode(q.code, "python")) } : q;
            }),
          ),
        })),
      );
      return { ...s, title, subs };
    }),
  );
}

/**
 * Dress Shiki's raw output like a post's code block, so the blog's code styles (both themes, frame)
 * apply. The <pre> loses its inline style: its theme background is a CSS variable every token would
 * inherit and paint behind itself.
 */
const asFigure = (html: string) =>
  `<figure data-rehype-pretty-code-figure>${html.replace(/(<pre[^>]*?) style="[^"]*"/, "$1").replace("<code>", '<code data-theme="light dark">')}</figure>`;
