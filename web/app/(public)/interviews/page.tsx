import type { Metadata } from "next";
import { PublicNav, PublicFooter } from "@/components/public-nav";
import { InterviewsIndex } from "@/components/interviews/interviews-index";

export const metadata: Metadata = {
  // The root layout appends " - Samit Mohan" via title.template. Repeating
  // it here rendered "Interviews - Samit Mohan - Samit Mohan".
  title: "Interviews",
  description:
    "ML interview prep for 2026: math, deep learning, LLMs, CV, systems, inference/MLOps, NeetCode 150, and projects to build.",
  robots: { index: false, follow: true },
};

// Everything on this page comes from files in the repo, so it can only change
// when a deploy changes them. Revalidating on a timer re-renders pages that
// cannot have changed.
export const revalidate = false;

export default function InterviewsPage() {
  return (
    <div className="page">
      <PublicNav />
      <InterviewsIndex />
      <PublicFooter />
    </div>
  );
}
