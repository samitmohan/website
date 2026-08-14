import { buildSearchPayload } from "@/lib/search/build-index";

// Same shape as the sibling rss.xml route: prerendered once at build, served
// from the CDN as a static asset. The corpus only changes on redeploy, so a
// long s-maxage is safe; max-age=0 keeps browsers revalidating cheaply after
// a new deploy rather than pinning a stale index.
export const dynamic = "force-static";

export async function GET() {
  const payload = buildSearchPayload();

  return new Response(JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control":
        "public, max-age=0, s-maxage=31536000, stale-while-revalidate=86400, must-revalidate",
    },
  });
}
