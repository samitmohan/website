import type { SearchPayload } from "./types";

export const SEARCH_INDEX_URL = "/blog/search-index.json";

/**
 * Fetching the index and building the index are split on purpose.
 *
 * The nav's search button lives on every public page and warms the fetch on
 * hover, focus and Cmd. If warming reached for the MiniSearch constructor, the
 * library would land in the eager bundle of every page on the site to support a
 * button most visitors never press. This module imports nothing but a type, so
 * prefetching costs the network request and no JavaScript.
 *
 * lib/search/client.ts builds the index on top of this, and only loads once the
 * palette actually opens.
 */
let payloadPromise: Promise<SearchPayload> | null = null;

export function loadSearchPayload(): Promise<SearchPayload> {
  if (payloadPromise) return payloadPromise;

  payloadPromise = fetch(SEARCH_INDEX_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`search index ${res.status}`);
      return res.json() as Promise<SearchPayload>;
    })
    .catch((err) => {
      // Let a failed load retry on the next open rather than caching the rejection.
      payloadPromise = null;
      throw err;
    });

  return payloadPromise;
}

/** Warm the fetch without forcing the caller to await it. */
export function prefetchSearchIndex(): void {
  if (payloadPromise) return;
  const conn = (navigator as { connection?: { saveData?: boolean; effectiveType?: string } })
    .connection;
  if (conn?.saveData) return;
  if (conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g") return;
  void loadSearchPayload().catch(() => {});
}
