"use client";

import { createContext, useContext } from "react";
import type { Tag } from "@/lib/interviews-data";

export type IndexEntry = {
  id: string;
  sectionId: string;
  subKey: string;
  q: string;
  tags: Tag[];
};

export type SectionMeta = {
  id: string;
  title: string;
  kind: "qa" | "info" | "papers";
};

export interface InterviewsCtx {
  queryActive: boolean;
  searchActive: boolean;
  allExpanded: boolean;
  flashId: string | null;
  isCardVisible: (id: string) => boolean;
  isSectionVisible: (sectionId: string) => boolean;
  isSubVisible: (sectionId: string, subKey: string) => boolean;
}

export const InterviewsContext = createContext<InterviewsCtx | null>(null);

export function useInterviews(): InterviewsCtx {
  const ctx = useContext(InterviewsContext);
  if (!ctx) throw new Error("useInterviews must be used within InterviewsShell");
  return ctx;
}

export const subKeyOf = (sectionId: string, subTitle: string) => `${sectionId}::${subTitle}`;
