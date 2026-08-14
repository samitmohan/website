import MiniSearch, { type SearchResult } from "minisearch";
import { MINISEARCH_OPTIONS, SEARCH_OPTIONS } from "./config";
import type { SearchDoc, SearchPayload } from "./types";

export const SEARCH_INDEX_URL = "/blog/search-index.json";

export interface Loaded {
  mini: MiniSearch<SearchDoc>;
  payload: SearchPayload;
}

export interface Hit {
  /** Index into payload.chunks. */
  chunk: number;
  section: number;
  score: number;
  terms: string[];
}

export interface PostGroup {
  slug: string;
  title: string;
  date: string;
  description?: string;
  score: number;
  hits: { heading: string; anchor: string; crumb?: string; body: string; terms: string[] }[];
}

// Memoized at module scope, not in component state, so the fetch and the built
// index survive unmount across client-side navigation. Reopening the palette
// after the first time costs nothing.
let loading: Promise<Loaded> | null = null;

export function loadSearchIndex(): Promise<Loaded> {
  if (loading) return loading;

  loading = (async () => {
    const res = await fetch(SEARCH_INDEX_URL);
    if (!res.ok) throw new Error(`search index ${res.status}`);
    const payload = (await res.json()) as SearchPayload;

    const docs: SearchDoc[] = payload.chunks.map((chunk, id) => {
      const section = payload.sections[chunk.s];
      const post = payload.posts[section.p];
      return {
        id,
        title: post.t,
        heading: section.h,
        crumb: section.c ?? "",
        tags: (post.g ?? []).join(" "),
        body: chunk.b,
      };
    });

    const mini = new MiniSearch<SearchDoc>(MINISEARCH_OPTIONS);
    await mini.addAllAsync(docs, { chunkSize: 200 });
    return { mini, payload };
  })().catch((err) => {
    // Let a failed load retry on the next open rather than caching the rejection.
    loading = null;
    throw err;
  });

  return loading;
}

/** Warm the fetch without forcing the caller to await it. */
export function prefetchSearchIndex(): void {
  if (loading) return;
  const conn = (navigator as { connection?: { saveData?: boolean; effectiveType?: string } })
    .connection;
  if (conn?.saveData) return;
  if (conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g") return;
  void loadSearchIndex().catch(() => {});
}

function toHits(results: SearchResult[]): Hit[] {
  return results.map((r) => ({
    chunk: r.id as number,
    section: -1,
    score: r.score,
    terms: r.terms,
  }));
}

export function runSearch(loaded: Loaded, query: string, limit = 80): Hit[] {
  const q = query.trim();
  if (!q) return [];

  let results = loaded.mini.search(q, SEARCH_OPTIONS);
  // AND is the right default for multi-word queries, but it goes empty fast on
  // a typo or an unusual pairing. Fall back to OR rather than showing nothing.
  if (results.length < 5) {
    const or = loaded.mini.search(q, { ...SEARCH_OPTIONS, combineWith: "OR" });
    if (or.length > results.length) results = or;
  }

  return toHits(results.slice(0, limit));
}

/**
 * Collapse chunk hits into per-post groups: best chunk per section, at most a
 * few sections per post, posts ordered by their strongest chunk.
 */
export function groupByPost(
  loaded: Loaded,
  hits: Hit[],
  { maxPosts = 6, maxSectionsPerPost = 3 } = {}
): PostGroup[] {
  const byPost = new Map<number, { score: number; bySection: Map<number, Hit> }>();

  for (const hit of hits) {
    const chunk = loaded.payload.chunks[hit.chunk];
    const sectionIdx = chunk.s;
    const postIdx = loaded.payload.sections[sectionIdx].p;

    let entry = byPost.get(postIdx);
    if (!entry) {
      entry = { score: 0, bySection: new Map() };
      byPost.set(postIdx, entry);
    }
    entry.score = Math.max(entry.score, hit.score);

    const existing = entry.bySection.get(sectionIdx);
    if (!existing || hit.score > existing.score) {
      entry.bySection.set(sectionIdx, { ...hit, section: sectionIdx });
    }
  }

  return [...byPost.entries()]
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, maxPosts)
    .map(([postIdx, entry]) => {
      const post = loaded.payload.posts[postIdx];
      return {
        slug: post.s,
        title: post.t,
        date: post.d,
        description: post.e,
        score: entry.score,
        hits: [...entry.bySection.values()]
          .sort((a, b) => b.score - a.score)
          .slice(0, maxSectionsPerPost)
          .map((hit) => {
            const section = loaded.payload.sections[hit.section];
            return {
              heading: section.h,
              anchor: section.a,
              crumb: section.c,
              body: loaded.payload.chunks[hit.chunk].b,
              terms: hit.terms,
            };
          }),
      };
    });
}

/** All posts, for the resting state before anything is typed. */
export function allPosts(loaded: Loaded): PostGroup[] {
  return loaded.payload.posts.map((p) => ({
    slug: p.s,
    title: p.t,
    date: p.d,
    description: p.e,
    score: 0,
    hits: [],
  }));
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Window the body around the first match and split it for highlighting.
 *
 * Matches on the terms MiniSearch actually matched, not the raw query: a fuzzy
 * hit typed as "tokeniser" needs to highlight "tokenizer", and a prefix hit on
 * "token" needs to highlight "tokenization".
 */
export function makeSnippet(
  body: string,
  terms: string[],
  width = 200
): { text: string; parts: { text: string; hit: boolean }[] } {
  const cleaned = terms.filter(Boolean).sort((a, b) => b.length - a.length).map(escapeRe);
  const re = cleaned.length ? new RegExp(`(${cleaned.join("|")})`, "gi") : null;

  let start = 0;
  if (re) {
    const m = re.exec(body);
    re.lastIndex = 0;
    if (m && m.index > width / 2) start = m.index - Math.floor(width / 3);
  }
  if (start > 0) {
    const space = body.indexOf(" ", start);
    start = space === -1 ? start : space + 1;
  }

  let text = body.slice(start, start + width);
  if (start + width < body.length) {
    const lastSpace = text.lastIndexOf(" ");
    if (lastSpace > width * 0.6) text = text.slice(0, lastSpace);
    text += "...";
  }
  if (start > 0) text = `...${text}`;

  if (!re) return { text, parts: [{ text, hit: false }] };

  // split() with a capturing group interleaves separators at odd indices, so
  // parity identifies the matches without re-testing a stateful global regex.
  const parts = text
    .split(re)
    .map((s, i) => ({ text: s, hit: i % 2 === 1 }))
    .filter((p) => p.text !== "");

  return { text, parts };
}
