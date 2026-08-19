import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

const BASE = "https://samitmohan.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const blogEntries = posts.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: p.date ? new Date(p.date) : undefined,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const newest = posts[0]?.date ? new Date(posts[0].date) : new Date();

  return [
    { url: BASE, lastModified: newest, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/about`, changeFrequency: "yearly", priority: 0.8 },
    { url: `${BASE}/projects`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/blog`, lastModified: newest, changeFrequency: "weekly", priority: 0.8 },
    ...blogEntries,
  ];
}
