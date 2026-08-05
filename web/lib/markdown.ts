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
import type { Element, Root, Text } from "hast";

const highlighterPromise = createHighlighter({
  themes: ["github-dark", "github-light"],
  langs: ["python", "bash", "json", "c", "cpp", "yaml", "markdown", "text"],
});

function rehypeMediaPerf() {
  return (tree: Root) => {
    let imgIdx = 0;
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "img") {
        node.properties = node.properties || {};
        if (imgIdx === 0) {
          if (!node.properties.fetchpriority) node.properties.fetchpriority = "high";
        } else {
          if (!node.properties.loading) node.properties.loading = "lazy";
        }
        if (!node.properties.decoding) node.properties.decoding = "async";
        imgIdx++;
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
