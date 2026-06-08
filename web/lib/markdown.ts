import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import { createHighlighter } from "shiki";
import type { Element, Root } from "hast";

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
