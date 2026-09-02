import { MetadataRoute } from "next";

// Nothing is disallowed. The list here used to name /api/, /admin, /login,
// /problems, /syllabus and /blog/search-index.json - every one of them a route
// that no longer exists. The two paths that should stay out of an index,
// /interviews and /fun, say so themselves with `robots: { index: false }` in
// their own metadata, which also covers direct requests a crawler never asks
// this file about.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://samitmohan.in/sitemap.xml",
    host: "https://samitmohan.in",
  };
}
