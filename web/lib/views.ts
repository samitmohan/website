import "server-only";
import { unstable_cache } from "next/cache";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const key = (slug: string) => `views:${slug}`;

const fetchView = unstable_cache(
  async (slug: string): Promise<number> => {
    try {
      const n = await redis.get<number>(key(slug));
      return n ?? 0;
    } catch {
      return 0;
    }
  },
  ["views-single"],
  { revalidate: 30, tags: ["views"] }
);

const fetchViews = unstable_cache(
  async (slugs: string[]): Promise<Record<string, number>> => {
    if (slugs.length === 0) return {};
    try {
      const vals = await redis.mget<(number | null)[]>(...slugs.map(key));
      const out: Record<string, number> = {};
      slugs.forEach((s, i) => {
        out[s] = vals[i] ?? 0;
      });
      return out;
    } catch {
      return Object.fromEntries(slugs.map((s) => [s, 0]));
    }
  },
  ["views-batch"],
  { revalidate: 30, tags: ["views"] }
);

export async function getView(slug: string): Promise<number> {
  return fetchView(slug);
}

export async function getViews(slugs: string[]): Promise<Record<string, number>> {
  return fetchViews(slugs);
}

export async function incrementView(slug: string): Promise<number> {
  try {
    return await redis.incr(key(slug));
  } catch {
    return 0;
  }
}

export function formatViews(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10000) return `${(n / 1000).toFixed(1)}k`;
  return `${Math.round(n / 1000)}k`;
}
