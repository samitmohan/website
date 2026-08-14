import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/login",
          "/problems",
          "/syllabus",
          // A search payload, not a page. Nothing to gain from indexing it.
          "/blog/search-index.json",
        ],
      },
    ],
    sitemap: "https://samitmohan.in/sitemap.xml",
    host: "https://samitmohan.in",
  };
}
