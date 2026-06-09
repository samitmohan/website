"use client";

import { useEffect } from "react";

export function ViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `viewed:${slug}`;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch(`/api/views/${encodeURIComponent(slug)}`, {
      method: "POST",
      keepalive: true,
    }).catch(() => {});
  }, [slug]);
  return null;
}
