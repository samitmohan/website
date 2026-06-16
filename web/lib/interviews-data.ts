// Source of truth: web/lib/interviews-data.json
// To regenerate from the HTML guide: node scripts/extract-interviews-data.mjs
// (warning: the JSON has hand-added Q&As beyond the HTML source — re-running
// the extractor overwrites them).

export type Difficulty = "easy" | "med" | "hard";

export type Tag =
  | "math"
  | "general"
  | "frontier"
  | "key"
  | "classical"
  | "dl"
  | "cv"
  | "transformers"
  | "coding"
  | "llm"
  | "startup"
  | "generative"
  | "system"
  | "mlops"
  | "behavioral";

export interface QA {
  q: string;
  a: string;
  difficulty: Difficulty;
  tags: Tag[];
}

export interface Subsection {
  title: string;
  qs: QA[];
}

export interface QASection {
  id: string;
  title: string;
  type?: never;
  subs: Subsection[];
}

export interface InfoSection {
  id: string;
  title: string;
  type: "info";
  html: string;
}

export interface Paper {
  year: string;
  title: string;
  authors: string;
  why: string;
  url: string;
}

export interface PapersSection {
  id: string;
  title: string;
  type: "papers";
  papers: Paper[];
}

export type Section = QASection | InfoSection | PapersSection;

import rawData from "./interviews-data.json";
export const SECTIONS = rawData as Section[];
