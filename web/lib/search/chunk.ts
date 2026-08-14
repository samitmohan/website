import type { Section } from "./types";

const TARGET_WORDS = 220;
const MIN_WORDS = 12;
const MAX_CHARS = 1400;

export interface SectionChunk {
  sectionIdx: number;
  body: string;
}

/**
 * Split a sentence-ish run of text at word budgets, preferring sentence ends.
 *
 * The RAG post this echoes uses ~200 tokens with 50 tokens of overlap. Overlap
 * is there because a dense embedding compresses a whole chunk into one vector,
 * so a sentence sitting on a boundary is lost from both neighbours. BM25 scores
 * per term instead: a boundary term is fully findable in whichever chunk holds
 * it. Keeping the overlap here would inflate the payload by roughly a third and
 * double-count term frequencies against BM25's saturation curve. Dropped on
 * purpose, and replaced with sentence-aware boundaries so a snippet never opens
 * mid-clause.
 */
function splitByWords(text: string): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= TARGET_WORDS) return [text];

  const out: string[] = [];
  let start = 0;

  while (start < words.length) {
    let end = Math.min(start + TARGET_WORDS, words.length);

    if (end < words.length) {
      // Walk back to a sentence end, but not so far that chunks get tiny.
      const floor = start + Math.floor(TARGET_WORDS * 0.6);
      for (let i = end; i > floor; i--) {
        if (/[.!?]["')\]]?$/.test(words[i - 1])) {
          end = i;
          break;
        }
      }
    }

    out.push(words.slice(start, end).join(" "));
    start = end;
  }

  return out;
}

/** Flatten sections into indexable chunks, dropping anything too thin to rank. */
export function chunkSections(sections: Section[]): SectionChunk[] {
  const chunks: SectionChunk[] = [];

  sections.forEach((section, sectionIdx) => {
    if (!section.text) return;
    for (const piece of splitByWords(section.text)) {
      const body = piece.length > MAX_CHARS ? piece.slice(0, MAX_CHARS) : piece;
      if (body.split(/\s+/).filter(Boolean).length < MIN_WORDS) continue;
      chunks.push({ sectionIdx, body });
    }
  });

  return chunks;
}
