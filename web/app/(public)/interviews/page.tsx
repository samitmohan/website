import type { Metadata } from "next";
import { PublicNav } from "@/components/public-nav";
import { InterviewsGuide } from "@/components/interviews/interviews-guide";

export const metadata: Metadata = {
  title: "Interviews — Samit Mohan",
  description:
    "ML interview prep for 2026: math, deep learning, LLMs, CV, systems, inference/MLOps, NeetCode 150, and projects to build.",
  robots: { index: false, follow: true },
};

export const revalidate = 30;

export default function InterviewsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav />
      <InterviewsGuide />
    </div>
  );
}
