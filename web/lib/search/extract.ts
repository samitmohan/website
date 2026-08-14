import GithubSlugger from "github-slugger";
import { toString as mdastToString } from "mdast-util-to-string";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { unified } from "unified";
import type { Section } from "./types";

// A second, mdast-only pass over the markdown. Deliberately not reusing
// lib/markdown.ts: once rehypeRaw has run, an inline SVG is indistinguishable
// from prose, and rehypePrettyCode has already exploded every code block into
// hundreds of highlight spans. In mdast, `code`/`html`/`math`/`image` are
// distinct node types we can simply skip. Using .parse() rather than .process()
// also keeps shiki out of the build path entirely.

type MdNode = {
  type: string;
  value?: string;
  depth?: number;
  children?: MdNode[];
};

const HEADING_IN_HTML = /<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi;
const CALLOUT_PREFIX = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i;

/**
 * Reduce a raw HTML block to whatever prose it carries.
 *
 * Posts mix genuine copy (figure captions) with markup whose text content is
 * noise: a token grid flattens to "e 4 m 12 m 12 a 0". Requiring several real
 * words separates the two without pulling in an HTML parser, and the blast
 * radius of a wrong call here is a slightly noisy snippet.
 */
function htmlToProse(raw: string): string {
  const text = raw
    .replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  const substantial = text.split(" ").filter((w) => w.length >= 3);
  return substantial.length >= 4 ? text : "";
}

// Containers whose children are separate blocks. Their text needs an explicit
// separator: list items and table cells otherwise run together into a single
// token, e.g. "...(17 posts, ~1100 chunks).Retrieves relevant text...".
// Inline containers (paragraph, emphasis, link) must not get one, because their
// text nodes already carry the surrounding spaces.
const BLOCK_CONTAINERS = new Set([
  "root",
  "list",
  "listItem",
  "blockquote",
  "table",
  "tableRow",
  "tableCell",
  "footnoteDefinition",
]);

/** Text of a block node, skipping code fences, math, and images. */
function blockText(node: MdNode): string {
  if (node.type === "code" || node.type === "math" || node.type === "image") return "";
  if (node.type === "inlineCode") return node.value ?? "";
  if (node.type === "inlineMath") return "";
  if (node.type === "html") return htmlToProse(node.value ?? "");
  if (node.type === "text") return node.value ?? "";

  if (!node.children?.length) return node.value ?? "";

  const sep = BLOCK_CONTAINERS.has(node.type) ? " " : "";
  return node.children.map(blockText).join(sep);
}

/**
 * Split a post into heading-delimited sections with rehype-slug-compatible
 * anchors.
 *
 * Headings must come from the AST. A `^#{1,3} ` regex over this corpus finds
 * 305 h1s, nearly all of them Python comments inside fences ("# Run it
 * locally"). Splitting on h1-h3 rather than h2-h3 because at least one post
 * uses h1 as its top-level section marker.
 */
export function extractSections(markdown: string, opts: { math: boolean }): Section[] {
  const processor = unified().use(remarkParse).use(remarkGfm);
  if (opts.math) processor.use(remarkMath);

  const tree = processor.parse(markdown) as unknown as MdNode;
  const slugger = new GithubSlugger();

  const sections: Section[] = [];
  const stack: { depth: number; text: string }[] = [];
  let current: Section = { heading: null, anchor: "", crumb: "", text: "" };
  const buffer: string[] = [];

  const flush = () => {
    current.text = buffer.join(" ").replace(/\s+/g, " ").trim();
    if (current.text || current.heading) sections.push(current);
    buffer.length = 0;
  };

  const openSection = (depth: number, text: string) => {
    flush();
    while (stack.length && stack[stack.length - 1].depth >= depth) stack.pop();
    const crumb = stack.map((s) => s.text).join(" > ");
    stack.push({ depth, text });
    current = { heading: text, anchor: slugger.slug(text), crumb, text: "" };
  };

  for (const node of tree.children ?? []) {
    if (node.type === "heading" && (node.depth ?? 0) <= 3) {
      openSection(node.depth ?? 1, mdastToString(node as never).trim());
      continue;
    }

    if (node.type === "html") {
      // rehype-slug also slugs headings authored as raw HTML. Feeding them
      // through the same slugger in document order keeps its dedupe counter in
      // step, so "-1" suffixes land on the same headings the rendered page uses.
      // Headings that already carry an id are skipped by rehype-slug too.
      const raw = node.value ?? "";
      let m: RegExpExecArray | null;
      HEADING_IN_HTML.lastIndex = 0;
      let consumed = false;
      while ((m = HEADING_IN_HTML.exec(raw)) !== null) {
        const depth = Number(m[1]);
        if (/\bid\s*=/.test(m[2])) continue;
        const text = htmlToProse(m[3]) || m[3].replace(/<[^>]+>/g, "").trim();
        if (!text) continue;
        if (depth <= 3) {
          openSection(depth, text);
          consumed = true;
        } else {
          slugger.slug(text);
        }
      }
      if (consumed) continue;
    }

    if (node.type === "heading") {
      // h4-h6 stay inside their parent section but still consume a slug.
      slugger.slug(mdastToString(node as never).trim());
    }

    const text = blockText(node);
    if (node.type === "blockquote") {
      buffer.push(text.replace(CALLOUT_PREFIX, ""));
    } else if (text) {
      buffer.push(text);
    }
  }

  flush();
  return sections;
}
