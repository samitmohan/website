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

const highlighterPromise = createHighlighter({
  themes: ["github-dark", "github-light"],
  langs: ["python", "bash", "json", "c", "cpp", "yaml", "markdown", "text"],
});

const PUBLIC_DIR = path.join(process.cwd(), "public");

/** Widths the Next image optimizer will serve. Must come from the configured
 *  deviceSizes, since /_next/image rejects any other `w`. */
const SRCSET_WIDTHS = [640, 828, 1080, 1920];

/** Prose column is max-w-[44rem] = 704px, so above the md breakpoint an image
 *  never renders wider than that however large the viewport gets. */
const SIZES_ATTR = "(min-width: 768px) 704px, 100vw";

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

        // Hand the optimizer the work: it re-encodes to AVIF/WebP per browser
        // and ships a size that fits the column instead of the original.
        // Never upscale, so only offer widths the source can actually fill.
        if (props.srcset === undefined && props.srcSet === undefined) {
          const widths = SRCSET_WIDTHS.filter((w) => w <= dims.width);
          if (widths.length) {
            props.srcset = widths
              .map(
                (w) =>
                  `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75 ${w}w`
              )
              .join(", ");
            if (props.sizes === undefined) props.sizes = SIZES_ATTR;
          }
        }
      })
    );
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
export async function highlightCode(code: string, lang = "python"): Promise<string> {
  const highlighter = await highlighterPromise;
  return highlighter.codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });
}

export async function markdownToHtml(
  content: string,
  hasMath = false
): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(hasMath ? remarkMath : () => {})
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
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
    .use(hasMath ? rehypeKatex : () => {})
    .use(rehypeStringify);

  const result = await processor.process(content);
  return String(result);
}
