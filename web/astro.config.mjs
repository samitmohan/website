// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@tailwindcss/vite";

/**
 * Static, and no UI framework.
 *
 * Every route on this site was already `export const revalidate = false`
 * under Next - fully prerendered, nothing dynamic - and it still shipped
 * 149 KB of gzipped JavaScript, of which 132 KB was react-dom plus the App
 * Router runtime. That is the floor for any App Router page, so the only way
 * under it is to stop rendering with it. There is no React here and no
 * integration that would bring one back: the two interactive things on the
 * site are a class swap and an index, and they are a few lines of DOM each.
 *
 * build.format "file" emits about.html rather than about/index.html, and
 * vercel.json sets cleanUrls so it serves at /about with no trailing slash -
 * the same URLs the Next build produced, so nothing that links here breaks.
 */
export default defineConfig({
  site: "https://samitmohan.in",
  output: "static",
  trailingSlash: "never",
  build: { format: "file" },
  devToolbar: { enabled: false },
  vite: { plugins: [tailwind()] },
});
