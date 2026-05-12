import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ProblemProgress {
  solved: boolean;
  bestScore: number | null;
  attempts: number;
  lastAttempt: string;
}

interface ProgressState {
  problems: Record<string, ProblemProgress>;
  bookmarks: string[];

  recordAttempt: (problemId: string, passed: boolean, score?: number) => void;
  getProblemProgress: (problemId: string) => ProblemProgress | undefined;

  toggleBookmark: (problemId: string) => void;
  isBookmarked: (problemId: string) => boolean;
  getBookmarks: () => string[];
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      problems: {},
      bookmarks: [],

      recordAttempt: (problemId, passed, score) =>
        set((state) => {
          const prev = state.problems[problemId];
          const bestScore =
            score != null
              ? prev?.bestScore != null
                ? Math.max(prev.bestScore, score)
                : score
              : prev?.bestScore ?? null;

          return {
            problems: {
              ...state.problems,
              [problemId]: {
                solved: prev?.solved || passed,
                bestScore,
                attempts: (prev?.attempts ?? 0) + 1,
                lastAttempt: new Date().toISOString(),
              },
            },
          };
        }),

      getProblemProgress: (problemId) => get().problems[problemId],

      toggleBookmark: (problemId) =>
        set((state) => {
          const idx = state.bookmarks.indexOf(problemId);
          if (idx >= 0) {
            return { bookmarks: state.bookmarks.filter((id) => id !== problemId) };
          }
          return { bookmarks: [...state.bookmarks, problemId] };
        }),

      isBookmarked: (problemId) => get().bookmarks.includes(problemId),

      getBookmarks: () => get().bookmarks,
    }),
    { name: "sm-progress" }
  )
);
