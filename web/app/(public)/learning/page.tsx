import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { PublicNav } from "@/components/public-nav";

export const metadata: Metadata = {
  title: "Learning — Samit Mohan",
  description:
    "ML interview prep guide: 500+ questions covering math, deep learning, LLMs, CV, system design, and MLOps.",
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
      <iframe
        src="/ml-guide.html"
        className="flex-1 w-full border-0"
        title="ML Interview Guide"
        sandbox="allow-same-origin allow-scripts allow-forms"
      />
    </div>
  );
}
