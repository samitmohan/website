import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { PublicNav } from "@/components/public-nav";
import { InterviewsGuide } from "@/components/interviews/interviews-guide";

export const metadata: Metadata = {
  title: "Interviews — Samit Mohan",
  description:
    "End-to-end ML interview prep: 197 questions plus a build roadmap covering math, deep learning, LLMs, CV, systems, and from-scratch projects.",
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
