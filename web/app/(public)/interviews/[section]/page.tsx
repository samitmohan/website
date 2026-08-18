import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SECTIONS } from "@/lib/interviews-data";
import { getSection, stripNum } from "@/lib/interviews";
import { PublicNav } from "@/components/public-nav";
import { InterviewsSection } from "@/components/interviews/interviews-section";

// Everything on this page comes from files in the repo, so it can only change
// when a deploy changes them. Revalidating on a timer re-renders pages that
// cannot have changed.
export const revalidate = false;

export function generateStaticParams() {
  return SECTIONS.map((s) => ({ section: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  const sec = getSection(section);
  if (!sec) return {};
  return {
    title: `${stripNum(sec.title)} — Interviews`,
    robots: { index: false, follow: true },
  };
}

export default async function InterviewsSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const sec = getSection(section);
  if (!sec) notFound();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav />
      <InterviewsSection section={sec} />
    </div>
  );
}
