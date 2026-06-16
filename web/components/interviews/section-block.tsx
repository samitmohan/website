"use client";

import { useInterviews } from "@/components/interviews/interviews-context";

export function SectionBlock({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  const { isSectionVisible } = useInterviews();
  if (!isSectionVisible(id)) return null;

  return (
    <section id={id} className="mb-12 scroll-mt-32">
      <h2 className="text-[14px] font-semibold text-foreground mb-4">{title}</h2>
      {children}
    </section>
  );
}
