import type { Metadata } from "next";
import { PublicNav } from "@/components/public-nav";

export const metadata: Metadata = {
  title: "Learning — Samit Mohan",
  description:
    "ML interview prep guide: 500+ questions covering math, deep learning, LLMs, CV, system design, and MLOps.",
};

export default function LearningPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav />
      <iframe
        src="/ml-guide.html"
        className="flex-1 w-full border-0"
        style={{ height: "calc(100vh - 56px)" }}
        title="ML Interview Guide"
      />
    </div>
  );
}
