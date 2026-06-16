"use client";

import { useInterviews } from "@/components/interviews/interviews-context";

export function SubBlock({
  sectionId,
  subKey,
  title,
  children,
}: {
  sectionId: string;
  subKey: string;
  title: string;
  children: React.ReactNode;
}) {
  const { isSubVisible } = useInterviews();
  if (!isSubVisible(sectionId, subKey)) return null;

  return (
    <div className="mb-6">
      <div className="text-[11px] text-muted-foreground mb-2">{title}</div>
      {children}
    </div>
  );
}
