import { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/blog";
import { courses } from "@/config/courses";

const BASE = "https://samitmohan.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const blogSlugs = getAllSlugs().map((slug) => ({
    url: `${BASE}/blog/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const courseSlugs = courses.map((c) => ({
    url: `${BASE}/courses/${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    { url: BASE, changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${BASE}/blog`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE}/courses`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE}/problems`, changeFrequency: "weekly" as const, priority: 0.7 },
    ...blogSlugs,
    ...courseSlugs,
  ];
}
