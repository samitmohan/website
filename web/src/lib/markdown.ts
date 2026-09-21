import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import { createHighlighter } from "shiki";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import type { Element, Root, Text } from "hast";
import { IMAGE_WIDTHS, SIZES_ATTR, variantUrl } from "./responsive";

const highlighterPromise = createHighlighter({
  themes: ["github-dark", "github-light"],
  langs: ["python", "bash", "json", "c", "cpp", "yaml", "markdown", "text"],
});

const PUBLIC_DIR = path.join(process.cwd(), "public");



// Build-time only, and the same image repeats across posts, so cache by src.
const dimCache = new Map<string, { width: number; height: number } | null>();

async function intrinsicSize(src: string) {
  const cached = dimCache.get(src);
  if (cached !== undefined) return cached;

  let dims: { width: number; height: number } | null = null;
  // Local, root-relative paths only. Remote images have no file to measure
  // and "//host/x" is protocol-relative, not a local path.
  if (src.startsWith("/") && !src.startsWith("//")) {
    const file = path.join(PUBLIC_DIR, decodeURIComponent(src.split("?")[0]));
    // Keep the read inside public/ even if a post writes "/../../etc".
    if (file.startsWith(PUBLIC_DIR) && fs.existsSync(file)) {
      try {
        const meta = await sharp(file).metadata();
        if (meta.width && meta.height) {
          dims = { width: meta.width, height: meta.height };
        }
      } catch {
        // Unreadable or not an image. Fall through to null and emit the tag
        // unchanged rather than failing the whole build over one asset.
      }
    }
  }
  dimCache.set(src, dims);
  return dims;
}

function rehypeMediaPerf() {
  return async (tree: Root) => {
    const imgs: Element[] = [];

    visit(tree, "element", (node: Element) => {
      if (node.tagName === "img") {
        imgs.push(node);
      } else if (node.tagName === "video") {
        node.properties = node.properties || {};
        if (!node.properties.preload) node.properties.preload = "none";
        if (node.properties.preload === "auto" || node.properties.preload === "metadata") {
          node.properties.preload = "none";
        }
      } else if (node.tagName === "iframe") {
        node.properties = node.properties || {};
        if (!node.properties.loading) node.properties.loading = "lazy";
      }
    });

    await Promise.all(
      imgs.map(async (node, i) => {
        const props = (node.properties = node.properties || {});

        if (i === 0) {
          if (!props.fetchpriority) props.fetchpriority = "high";
        } else {
          if (!props.loading) props.loading = "lazy";
        }
        if (!props.decoding) props.decoding = "async";

        const src = typeof props.src === "string" ? props.src : "";
        if (!src) return;

        const dims = await intrinsicSize(src);
        if (!dims) return;

        // Width and height reserve the box before the bytes land, so text
        // below an image no longer jumps down as it decodes.
        if (props.width === undefined) props.width = dims.width;
        if (props.height === undefined) props.height = dims.height;

        // Offer the column's widths rather than the original. 234 of the 287
        // images the posts reference are wider than the 704px prose column and
        // the widest is 4200px, so serving the source to a phone is most of a
        // post's weight.
        //
        // These URLs point at files scripts/gen-images.mjs writes into dist
        // after the build, reading them back out of this very markup. Never
        // upscale, so only offer widths the source can actually fill.
        if (props.srcset === undefined && props.srcSet === undefined) {
          const widths = IMAGE_WIDTHS.filter((w) => w <= dims.width);
          if (widths.length) {
            props.srcset = widths.map((w) => `${variantUrl(src, w)} ${w}w`).join(", ");
            if (props.sizes === undefined) props.sizes = SIZES_ATTR;
          }
        }
      })
    );
  };
}


/**
 * Demote an in-content `# heading` to h2.
 *
 * The page already renders the post title as the document's h1, so a markdown
 * h1 is a second one - which is invalid, and reads to a screen reader as two
 * documents. It also fell out of the table of contents, which collects h2 and
 * h3 only: the "gradient descent" section of the neural-networks post was
 * invisible in the TOC for exactly this reason.
 *
 * Only h1 moves. Shifting the whole ladder would push every other post's h2
 * sections down a level to fix one post's mistake.
 */
function rehypeDemoteH1() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "h1") node.tagName = "h2";
    });
  };
}

// GitHub-style alerts: `> [!NOTE]` blockquotes become styled callout boxes.
const CALLOUT_LABELS: Record<string, string> = {
  note: "Note",
  tip: "Tip",
  important: "Important",
  warning: "Warning",
  caution: "Caution",
};

function rehypeCallouts() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "blockquote") return;
      const firstP = node.children.find(
        (c): c is Element => c.type === "element" && c.tagName === "p"
      );
      if (!firstP) return;
      const firstText = firstP.children.find(
        (c): c is Text => c.type === "text"
      );
      if (!firstText) return;

      const match = firstText.value.match(
        /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*\n?/
      );
      if (!match) return;

      const type = match[1].toLowerCase();
      firstText.value = firstText.value.slice(match[0].length);

      // Drop the now-empty marker text node and a trailing hard break.
      if (firstText.value === "") {
        const idx = firstP.children.indexOf(firstText);
        firstP.children.splice(idx, 1);
        if (firstP.children[idx]?.type === "element" && (firstP.children[idx] as Element).tagName === "br") {
          firstP.children.splice(idx, 1);
        }
      }

      node.properties = node.properties || {};
      node.properties.className = ["callout", `callout-${type}`];
      node.children.unshift({
        type: "element",
        tagName: "div",
        properties: { className: ["callout-title"] },
        children: [{ type: "text", value: CALLOUT_LABELS[type] }],
      });
    });
  };
}

/**
 * Highlight a bare code string with the same dual-theme highlighter the blog
 * uses, for code that arrives outside markdown (the interviews answers). The
 * `code[data-theme*=" "]` rules in globals.css already swap light/dark, so the
 * output themes itself with no extra CSS.
 */

/**
 * The header strip above every code block: the language or the caption on the
 * left, a copy button on the right.
 *
 * This used to be built in the browser. BlogContent walked every
 * figure[data-rehype-pretty-code-figure] on mount, created the div, the span
 * and the button with document.createElement, and attached a click handler per
 * button. None of that depends on anything only the browser knows - the
 * language and the caption are in the tree right here - so it is markup, and
 * markup belongs in the build.
 *
 * What is left for the browser is one delegated listener on document, in
 * src/scripts/post.ts, which is why the button carries data-code-copy and the
 * icons are static markup rather than innerHTML swapped at click time.
 */
function rehypeCodeHeader() {
  const icon = (paths: Element[]): Element => ({
    type: "element",
    tagName: "svg",
    properties: {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      ariaHidden: "true",
    },
    children: paths,
  });
  const rect = (props: Record<string, string>): Element => ({
    type: "element",
    tagName: "rect",
    properties: props,
    children: [],
  });
  const path = (d: string): Element => ({
    type: "element",
    tagName: "path",
    properties: { d },
    children: [],
  });
  const polyline = (points: string): Element => ({
    type: "element",
    tagName: "polyline",
    properties: { points },
    children: [],
  });
  const span = (cls: string | null, text: string): Element => ({
    type: "element",
    tagName: "span",
    properties: cls ? { className: [cls] } : {},
    children: [{ type: "text", value: text } as Text],
  });

  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "figure") return;
      if (!("data-rehype-pretty-code-figure" in (node.properties ?? {}))) return;
      const kids = node.children as Element[];
      if (kids.some((c) => c.tagName === "div" &&
          (c.properties?.className as string[] | undefined)?.includes("code-header"))) return;

      const pre = kids.find((c) => c.tagName === "pre");
      const code = pre?.children?.find(
        (c) => (c as Element).tagName === "code",
      ) as Element | undefined;
      if (!pre || !code) return;

      const lang = String(code.properties?.["data-language"] ?? "");
      const cap = kids.find((c) => c.tagName === "figcaption");
      const title = cap
        ? (cap.children.find((c) => c.type === "text") as Text | undefined)?.value ?? ""
        : "";

      const header: Element = {
        type: "element",
        tagName: "div",
        properties: { className: ["code-header"] },
        children: [
          span("code-lang", title || lang),
          {
            type: "element",
            tagName: "button",
            properties: {
              type: "button",
              className: ["code-copy"],
              "aria-label": "Copy code",
              "data-code-copy": "",
            },
            children: [
              // Both icons ship; CSS shows one, and .copied shows the other.
              icon([
                rect({ x: "9", y: "9", width: "13", height: "13", rx: "2" }),
                path("M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"),
              ]),
              icon([polyline("20 6 9 17 4 12")]),
              span(null, "Copy"),
            ],
          } as Element,
        ],
      };
      node.children.unshift(header);
    });
  };
}

export async function highlightCode(code: string, lang = "python"): Promise<string> {
  const highlighter = await highlighterPromise;
  return highlighter.codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });
}

/**
 * A rule at the very top of a post body draws a second line directly under the
 * byline, which already closes with one - two rules bounding an empty 33px
 * band. Only one post opens that way today; this is here so the next one
 * cannot. Skips <style> and <script>, which render nothing, so a post that
 * opens with an inline stylesheet is still caught.
 */
function rehypeDropLeadingRule() {
  return (tree: Root) => {
    for (const node of tree.children) {
      if (node.type === "text" && !node.value.trim()) continue;
      if (node.type !== "element") break;
      if (node.tagName === "style" || node.tagName === "script") continue;
      if (node.tagName === "hr") tree.children.splice(tree.children.indexOf(node), 1);
      break;
    }
  };
}

export type Heading = { id: string; text: string };

/** Section headings, in order, for the contents list on a long post. */
function rehypeCollectHeadings(into: Heading[]) {
  return () => (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "h2") return;
      const id = String(node.properties?.id ?? "");
      const text = textOf(node).trim();
      if (id && text) into.push({ id, text });
    });
  };
}

function textOf(node: Element): string {
  let out = "";
  visit(node, "text", (t: Text) => {
    out += t.value;
  });
  return out;
}

export async function markdownToHtml(
  content: string,
  hasMath = false,
  headings?: Heading[]
): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(hasMath ? remarkMath : () => {})
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    // Before rehypeSlug, so the demoted heading keeps the id its text produces.
    .use(rehypeDemoteH1)
    .use(rehypeSlug)
    .use(rehypeDropLeadingRule)
    .use(headings ? rehypeCollectHeadings(headings) : () => {})
    .use(rehypeCallouts)
    .use(rehypeMediaPerf)
    .use(rehypePrettyCode, {
      theme: {
        dark: "github-dark",
        light: "github-light",
      },
      keepBackground: false,
      getHighlighter: () => highlighterPromise,
    })
    .use(rehypeCodeHeader)
    .use(hasMath ? rehypeKatex : () => {})
    .use(rehypeStringify);

  const result = await processor.process(content);
  return String(result);
}
