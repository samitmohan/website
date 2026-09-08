import { SECTIONS, type Section, type QASection } from "./interviews-data";

/**
 * Facet counts for the filter bar. This type used to live in the filter
 * component and be imported back here, which put a lib's type inside a UI
 * file. It is data about the questions, so it belongs with them.
 */
export interface Facets {
  total: number;
  difficulty: Record<string, number>;
  tags: Record<string, number>;
}

/** Strip the leading "N. " ordinal from a section title for display. */
export const stripNum = (title: string) => title.replace(/^\d+\.\s*/, "");

export const isQASection = (sec: Section): sec is QASection =>
  sec.type !== "info" && sec.type !== "papers";

/** Stable anchor for one question, shared by the index links and section pages. */
export const qaId = (sectionId: string, subIdx: number, qIdx: number) =>
  `${sectionId}-${subIdx}-${qIdx}`;

export const sectionHref = (sectionId: string) => `/interviews/${sectionId}`;

export function getSection(id: string): Section | undefined {
  return SECTIONS.find((s) => s.id === id);
}

export function sectionNav() {
  return SECTIONS.map((sec) => ({ id: sec.id, title: stripNum(sec.title) }));
}

export function questionCount(sec: Section): number {
  if (!isQASection(sec)) return 0;
  return sec.subs.reduce((n, sub) => n + sub.qs.length, 0);
}

/** Facet counts over whichever sections the caller is painting. */
export function facetsFor(sections: Section[]): Facets {
  const facets: Facets = { total: 0, difficulty: {}, tags: {} };
  for (const sec of sections) {
    if (!isQASection(sec)) continue;
    for (const sub of sec.subs) {
      for (const qa of sub.qs) {
        facets.total += 1;
        facets.difficulty[qa.difficulty] = (facets.difficulty[qa.difficulty] ?? 0) + 1;
        for (const tag of qa.tags) facets.tags[tag] = (facets.tags[tag] ?? 0) + 1;
      }
    }
  }
  return facets;
}
