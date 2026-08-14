"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { prefetchSearchIndex } from "@/lib/search/client";

// The palette pulls in MiniSearch and the index loader. Keeping it behind a
// dynamic import means neither reaches the initial bundle; only this button and
// its key listener ship on first paint.
const SearchCommand = dynamic(() => import("./search-command"), { ssr: false });

export function SearchTrigger() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const arm = useCallback(() => {
    setMounted(true);
    prefetchSearchIndex();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Warm the fetch while the user is still reaching for K.
      if ((e.metaKey || e.ctrlKey) && !e.altKey) prefetchSearchIndex();

      const target = e.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setMounted(true);
        setOpen((v) => !v);
        return;
      }
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setMounted(true);
        setOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="Search posts"
        onClick={() => {
          arm();
          setOpen(true);
        }}
        onPointerEnter={arm}
        onFocus={arm}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-transparent text-ink-2 transition-colors duration-200 hover:border-rule hover:bg-surface hover:text-ink"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>
      {mounted && <SearchCommand open={open} onOpenChange={setOpen} />}
    </>
  );
}
