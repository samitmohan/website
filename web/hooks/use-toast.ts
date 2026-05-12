"use client";

import { useState, useCallback } from "react";

export interface Toast {
  id: string;
  message: string;
  variant: "success" | "error" | "info";
}

let toastId = 0;
const listeners: Set<(toast: Toast) => void> = new Set();

export function toast(message: string, variant: Toast["variant"] = "info") {
  const t: Toast = { id: String(++toastId), message, variant };
  listeners.forEach((fn) => fn(t));
}

export function useToastState() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((t: Toast) => {
    setToasts((prev) => [...prev, t]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id));
    }, 4000);
  }, []);

  // Register listener
  useState(() => {
    listeners.add(addToast);
    return () => { listeners.delete(addToast); };
  });

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, dismiss };
}
