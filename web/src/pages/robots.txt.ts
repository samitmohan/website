/**
 * Nothing is disallowed. The list this replaced named /api/, /admin, /login,
 * /problems, /syllabus and /blog/search-index.json - every one a route that no
 * longer exists. The two paths that should stay out of an index, /interviews
 * and /fun, carry their own noindex meta.
 */
export function GET() {
  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    "Sitemap: https://samitmohan.in/sitemap.xml",
    "Host: https://samitmohan.in",
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
