import type { Options, SearchOptions } from "minisearch";
import type { SearchDoc } from "./types";

/**
 * Split on non-alphanumerics but also emit the sub-parts of dotted and hyphenated
 * identifiers, so `torch.nn.functional` is reachable from `torch`, `nn` and
 * `functional`, and `KV-cache` from both halves. This inflates the in-memory
 * index but costs nothing on the wire, because the index is built in the browser
 * from plain documents.
 */
function tokenize(text: string): string[] {
  const out: string[] = [];
  for (const raw of text.split(/[^\p{L}\p{N}_.-]+/u)) {
    if (!raw) continue;
    out.push(raw);
    if (/[.-]/.test(raw)) {
      for (const part of raw.split(/[.-]+/)) {
        if (part) out.push(part);
      }
    }
  }
  return out;
}

function processTerm(term: string): string | null {
  const t = term.toLowerCase().replace(/^[._-]+|[._-]+$/g, "");
  if (t.length < 2) return null;
  if (/^\d+$/.test(t)) return null;
  return t;
}

export const MINISEARCH_OPTIONS: Options<SearchDoc> = {
  fields: ["title", "heading", "crumb", "tags", "body"],
  // Nothing is stored: results are looked up by id against the arrays we
  // already hold in memory, so letting MiniSearch keep a second copy of every
  // body would double the footprint for no gain.
  storeFields: [],
  tokenize,
  processTerm,
};

export const SEARCH_OPTIONS: SearchOptions = {
  boost: { title: 4, heading: 3, tags: 2.5, crumb: 1.6, body: 1 },
  // Prefix-match only the token still being typed. Prefixing every token makes
  // short words match nearly everything as you type.
  prefix: (_term, i, terms) => i === terms.length - 1,
  fuzzy: (term) => (term.length > 4 ? 0.2 : false),
  combineWith: "AND",
};
