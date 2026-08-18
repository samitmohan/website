import { getAllPosts } from "@/lib/blog";

export const dynamic = "force-static";

const BASE = "https://samitmohan.in";

// https://llmstxt.org - a plain-text map of the site for models that fetch it
// directly. Mirrors the source list getAllPosts() feeds to RSS and the sitemap,
// so hidden posts stay out of it for free.
export async function GET() {
  const posts = getAllPosts();

  const lines = posts.map(
    (post) => `- [${post.title}](${BASE}/blog/${post.slug}): ${post.description ?? ""}`.trimEnd()
  );

  const body = `# Samit Mohan

> AI Scientist at Beltech AI in Bangalore.
> I rebuild ML from scratch and write about it.

- Site: ${BASE}
- Blog: ${BASE}/blog
- Feed: ${BASE}/blog/rss.xml
- CV: ${BASE}/samit-resume.pdf

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
