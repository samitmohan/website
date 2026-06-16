import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { PublicNav } from "@/components/public-nav";
import { LearningShell } from "@/components/learning/learning-shell";

export const metadata: Metadata = {
  title: "Interviews — Samit Mohan",
  description:
    "ML interview prep guide: 181 questions covering math, deep learning, LLMs, CV, system design, and MLOps.",
};

export const revalidate = 30;

export default function LearningPage() {
  const searchEntries = getAllPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    description: p.description,
  }));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav searchEntries={searchEntries} />
      <LearningShell />
    </div>
  );
}
