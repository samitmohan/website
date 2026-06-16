import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { PublicNav } from "@/components/public-nav";
import { InterviewsGuide } from "@/components/interviews/interviews-guide";

export const metadata: Metadata = {
  title: "Interviews — Samit Mohan",
  description:
    "ML interview prep for 2026: math, deep learning, LLMs, CV, systems, inference/MLOps, NeetCode 150, and projects to build.",
};

export const revalidate = 30;

export default function InterviewsPage() {
  const searchEntries = getAllPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    description: p.description,
  }));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav searchEntries={searchEntries} />
      <InterviewsGuide />
    </div>
  );
}
