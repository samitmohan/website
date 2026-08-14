// Shared between the build-time indexer and the browser. Must stay free of any
// server-only import, since the client fetches and rehydrates this shape.

/** A heading-delimited slice of a post, before chunking. */
export interface Section {
  /** Heading text, or null for the lead paragraphs above the first heading. */
  heading: string | null;
  /** rehype-slug id, or "" for the lead (links to the top of the post). */
  anchor: string;
  /** Ancestor headings joined with a separator, e.g. "Retrieval > Reranking". */
  crumb: string;
  /** Cleaned plain text: no code fences, no HTML, no math. */
  text: string;
}

/**
 * The wire format. Posts and sections are interned so a chunk costs an index
 * plus its body, rather than repeating title/slug/tags/heading/anchor across
 * every chunk in the post. Keys are short because there are hundreds of chunks;
 * brotli handles most of that, but the raw payload matters for parse time too.
 */
export interface SearchPayload {
  v: 1;
  /** slug, title, date, tags, description */
  posts: { s: string; t: string; d: string; g?: string[]; e?: string }[];
  /** postIdx, heading, anchor, crumb */
  sections: { p: number; h: string; a: string; c?: string }[];
  /** sectionIdx, body */
  chunks: { s: number; b: string }[];
}

/** Flattened form handed to MiniSearch in the browser. */
export interface SearchDoc {
  id: number;
  title: string;
  heading: string;
  crumb: string;
  tags: string;
  body: string;
}
