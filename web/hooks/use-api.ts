"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useUserStore } from "@/stores/userStore";

// ===== Types =====

export interface UserProgress {
  totalSolved: number;
  totalAttempts: number;
  problems: Record<string, { solved: boolean; bestScore: number | null; attempts: number }>;
  weeks: Record<string, { completed: number; total: number; percent: number }>;
}

interface SubmissionPayload {
  status: "passed" | "failed" | "partial" | "error" | "pending_review";
  code?: string;
  testsPassed?: number;
  totalTests?: number;
  answers?: Record<string, string>;
  score?: number;
  maxScore?: number;
  totalQuestions?: number;
  designResponse?: string;
}

// ===== Hooks =====

export function useUserProgress() {
  const { user } = useUserStore();

  return useQuery<UserProgress>({
    queryKey: ["user-progress"],
    queryFn: () => apiFetch<UserProgress>("/api/submissions/progress"),
    enabled: !!user,
    staleTime: 30_000,
  });
}

export function useSubmission(problemId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmissionPayload) =>
      apiFetch<{ submissionId: string; status: string }>(
        `/api/submissions/${problemId}`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-progress"] });
    },
  });
}

export function useProblemHistory(problemId: string) {
  const { user } = useUserStore();

  return useQuery({
    queryKey: ["problem-history", problemId],
    queryFn: () =>
      apiFetch<{ submissions: any[] }>(`/api/submissions/${problemId}/history`),
    enabled: !!user && !!problemId,
    staleTime: 10_000,
  });
}

// ===== Bookmarks =====

export interface Bookmark {
  problemId: string;
  createdAt: string;
}

export function useBookmarks() {
  const { user } = useUserStore();

  return useQuery<{ bookmarks: Bookmark[] }>({
    queryKey: ["bookmarks"],
    queryFn: () => apiFetch<{ bookmarks: Bookmark[] }>("/api/bookmarks"),
    enabled: !!user,
    staleTime: 60_000,
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (problemId: string) =>
      apiFetch<{ bookmarked: boolean }>(`/api/bookmarks/${problemId}`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}

// ===== Streaks =====

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

export function useStreak() {
  const { user } = useUserStore();

  return useQuery<StreakData>({
    queryKey: ["streak"],
    queryFn: () => apiFetch<StreakData>("/api/streaks"),
    enabled: !!user,
    staleTime: 60_000,
  });
}

export interface ActivityData {
  activity: Record<string, number>;
}

export function useActivity() {
  const { user } = useUserStore();

  return useQuery<ActivityData>({
    queryKey: ["activity"],
    queryFn: () => apiFetch<ActivityData>("/api/streaks/activity"),
    enabled: !!user,
    staleTime: 120_000,
  });
}

// ===== Leaderboard =====

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  image: string | null;
  solved: number;
  streak: number;
  lastActive: string | null;
}

// ===== Admin =====

export function useAdminStats() {
  return useQuery<{ totalUsers: number; totalSubmissions: number; activeUsersLast7d: number; totalSolved: number }>({
    queryKey: ["admin-stats"],
    queryFn: () => apiFetch("/api/admin/stats"),
    staleTime: 30_000,
  });
}

export function useAdminAccessCodes() {
  return useQuery<{ codes: { id: number; code: string; cohortId: string; maxUses: number | null; currentUses: number; expiresAt: string | null; createdAt: string }[] }>({
    queryKey: ["admin-access-codes"],
    queryFn: () => apiFetch("/api/admin/access-codes"),
    staleTime: 30_000,
  });
}

export function useCreateAccessCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { code: string; maxUses?: number; expiresAt?: string }) =>
      apiFetch("/api/admin/access-codes", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-access-codes"] }),
  });
}

export function useDeleteAccessCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/admin/access-codes/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-access-codes"] }),
  });
}

export function useAdminUsers() {
  return useQuery<{ users: { id: string; name: string; email: string; image: string | null; cohortId: string | null; createdAt: string; solved: number; lastSubmission: string | null }[] }>({
    queryKey: ["admin-users"],
    queryFn: () => apiFetch("/api/admin/users"),
    staleTime: 30_000,
  });
}

// ===== Submission History =====

export function useSubmissionHistory(problemId: string) {
  const { user } = useUserStore();
  return useQuery({
    queryKey: ["submission-history", problemId],
    queryFn: () => apiFetch<{ submissions: { id: string; status: string; createdAt: string; testsPassed: number | null; totalTests: number | null; score: number | null; totalQuestions: number | null }[] }>(`/api/submissions/${problemId}/history`),
    enabled: !!user && !!problemId,
    staleTime: 10_000,
  });
}

export function useLeaderboard() {
  const { user } = useUserStore();

  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard"],
    queryFn: () =>
      apiFetch<{ rankings: LeaderboardEntry[] }>("/api/leaderboard").then(
        (r) => r.rankings
      ),
    enabled: !!user,
    staleTime: 60_000,
  });
}
