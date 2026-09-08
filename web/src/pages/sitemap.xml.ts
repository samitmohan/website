import { getAllPosts } from "../lib/blog";

/**
 * Was app/sitemap.ts, which returned objects for Next to serialise. Here it is
 * the XML, which is the thing that ships.
 */
const BASE = "https://samitmohan.in";

export function GET() {
  const posts = getAllPosts();
  const newest = posts[0]?.date ? new Date(posts[0].date) : new Date();
  const day = (d: Date) => d.toISOString().slice(0, 10);

  const entries: [string, Date | null, string, string][] = [
    [BASE, newest, "weekly", "1.0"],
    [`${BASE}/about`, null, "yearly", "0.8"],
    [`${BASE}/projects`, null, "monthly", "0.8"],
    [`${BASE}/blog`, newest, "weekly", "0.8"],
    ...posts.map(
      (p) =>
        [`${BASE}/blog/${p.slug}`, p.date ? new Date(p.date) : null, "monthly", "0.7"] as [
          string,
          Date | null,
          string,
          string,
        ],
    ),
  ];

  const urls = entries
    .map(
      ([loc, mod, freq, pri]) =>
        `  <url>\n    <loc>${loc}</loc>\n` +
        (mod ? `    <lastmod>${day(mod)}</lastmod>\n` : "") +
        `    <changefreq>${freq}</changefreq>\n    <priority>${pri}</priority>\n  </url>`,
    )
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
}
