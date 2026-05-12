"use client";

import { useToastState } from "@/hooks/use-toast";

const VARIANT_STYLES = {
  success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
  error: "bg-red-500/10 border-red-500/20 text-red-300",
  info: "bg-secondary border-border text-muted-foreground",
};

export function Toaster() {
  const { toasts, dismiss } = useToastState();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-lg border text-sm shadow-lg backdrop-blur-sm animate-in slide-in-from-bottom-2 ${VARIANT_STYLES[t.variant]}`}
          onClick={() => dismiss(t.id)}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
