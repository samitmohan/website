import { getEveryPost } from "@/lib/blog";

export const dynamic = "force-static";

const BASE = "https://samitmohan.in";

// https://llmstxt.org - a plain-text map of the site for models that fetch it
// directly. Lists the same posts as RSS and the sitemap: both blog tabs.
export function GET() {
  const posts = getEveryPost();

  const lines = posts.map(
    (post) => `- [${post.title}](${BASE}/blog/${post.slug}): ${post.description ?? ""}`.trimEnd()
  );

  const body = `# Samit Mohan

> AI Scientist at Beltech AI in Bangalore.
> I rebuild ML from scratch and write about it.

- Site: ${BASE}
- About: ${BASE}/about
- Projects: ${BASE}/projects
- Blog: ${BASE}/blog (technical), ${BASE}/blog/personal (personal)
- Shelf: ${BASE}/shelf
- Lab: ${BASE}/lab
- Feed: ${BASE}/blog/rss.xml

## Posts

${lines.join("\n")}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
