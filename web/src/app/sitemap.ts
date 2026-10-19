import type { MetadataRoute } from "next";
import { getEveryPost } from "@/lib/blog";

export const dynamic = "force-static";

const BASE = "https://samitmohan.in";
const PAGES = ["", "/about", "/blog", "/blog/personal", "/projects", "/shelf", "/lab", "/photos"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PAGES.map((p) => ({ url: `${BASE}${p}` })),
    ...getEveryPost().map((p) => ({ url: `${BASE}/blog/${p.slug}`, lastModified: p.date })),
  ];
}
