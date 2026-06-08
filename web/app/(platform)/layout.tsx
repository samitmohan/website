"use client";

import { PublicNav, PublicFooter } from "@/components/public-nav";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/toaster";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-background">
          <PublicNav />
          <main className="flex-1 min-w-0">{children}</main>
          <PublicFooter />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryProvider>
  );
}
