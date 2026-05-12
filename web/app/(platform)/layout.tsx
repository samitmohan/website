"use client";

import { PublicNav, PublicFooter } from "@/components/public-nav";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNav />
      <main className="flex-1 min-w-0">{children}</main>
      <PublicFooter />
    </div>
  );
}
