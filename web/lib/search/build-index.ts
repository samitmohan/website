import "server-only";

import { getAllPosts, getPost } from "@/lib/blog";
import { chunkSections } from "./chunk";
import { extractSections } from "./extract";
import type { SearchPayload } from "./types";

/**
 * Build the wire payload from the post corpus.
 *
 * Enumerates with getAllPosts(), never getAllSlugs(). getAllSlugs deliberately
 * includes hidden posts so they still prerender; indexing those would make the
 * unlisted /fun posts searchable and quietly undo their noindex.
 */
export function buildSearchPayload(): SearchPayload {
  const payload: SearchPayload = { v: 1, posts: [], sections: [], chunks: [] };

  for (const meta of getAllPosts()) {
    const post = getPost(meta.slug);
    if (!post || post.hidden) continue;

    const sections = extractSections(post.content, { math: post.math });
    const chunks = chunkSections(sections);
    if (!chunks.length) continue;

    const postIdx = payload.posts.length;
    payload.posts.push({
      s: post.slug,
      t: post.title,
      d: post.date,
      ...(post.tags.length ? { g: post.tags } : {}),
      ...(post.description ? { e: post.description } : {}),
    });

    // Only sections that survived chunking earn a slot, so empty headings do
    // not pad the payload. Remap local section indices onto global ones.
    const remap = new Map<number, number>();
    for (const chunk of chunks) {
      let globalIdx = remap.get(chunk.sectionIdx);
      if (globalIdx === undefined) {
        const section = sections[chunk.sectionIdx];
        globalIdx = payload.sections.length;
        remap.set(chunk.sectionIdx, globalIdx);
        payload.sections.push({
          p: postIdx,
          h: section.heading ?? "",
          a: section.anchor,
          ...(section.crumb ? { c: section.crumb } : {}),
        });
      }
      payload.chunks.push({ s: globalIdx, b: chunk.body });
    }
  }

  return payload;
}
