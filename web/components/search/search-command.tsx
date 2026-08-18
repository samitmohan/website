"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  allPosts,
  groupByPost,
  loadSearchIndex,
  makeSnippet,
  runSearch,
  type Loaded,
  type PostGroup,
} from "@/lib/search/client";
import { PixelLoader } from "@/components/ui/pixel-loader";

/** One selectable line: either a post header or a section under it. */
interface Row {
  key: string;
  href: string;
  kind: "post" | "section";
  title: string;
  heading?: string;
  crumb?: string;
  snippet?: { text: string; parts: { text: string; hit: boolean }[] };
}

function toRows(groups: PostGroup[]): Row[] {
  const rows: Row[] = [];
  for (const g of groups) {
    rows.push({
      key: g.slug,
      href: `/blog/${g.slug}`,
      kind: "post",
      title: g.title,
    });
    for (const hit of g.hits) {
      rows.push({
        key: `${g.slug}#${hit.anchor}:${rows.length}`,
        href: hit.anchor ? `/blog/${g.slug}#${hit.anchor}` : `/blog/${g.slug}`,
        kind: "section",
        title: g.title,
        heading: hit.heading || "Introduction",
        crumb: hit.crumb,
        snippet: makeSnippet(hit.body, hit.terms),
      });
    }
  }
  return rows;
}

export default function SearchCommand({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const deferred = useDeferredValue(query);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    loadSearchIndex().then(
      (l) => alive && setLoaded(l),
      () => alive && setFailed(true)
    );
    return () => {
      alive = false;
    };
  }, [open]);

  const rows = useMemo(() => {
    if (!loaded) return [];
    const q = deferred.trim();
    // Resting state lists everything, so the palette is useful before you type.
    if (!q) return toRows(allPosts(loaded));
    return toRows(groupByPost(loaded, runSearch(loaded, q)));
  }, [loaded, deferred]);

  // Reset the cursor when the results change. Comparing against the previous
  // query during render is React's documented way to derive state from a
  // changing value; an effect here would render once with a stale selection and
  // cascade a second render.
  const [prevDeferred, setPrevDeferred] = useState(deferred);
  if (prevDeferred !== deferred) {
    setPrevDeferred(deferred);
    setActive(0);
  }

  // Keep the active row in view without moving DOM focus off the input.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, rows.length]);

  // Clearing on close keeps the next open fresh without an effect watching
  // `open` and setting state on every close render.
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        setQuery("");
        setActive(0);
      }
      onOpenChange(next);
    },
    [onOpenChange]
  );

  const go = useCallback(
    (row: Row | undefined, newTab: boolean) => {
      if (!row) return;
      if (newTab) {
        window.open(row.href, "_blank", "noopener,noreferrer");
        return;
      }
      handleOpenChange(false);
      router.push(row.href);
    },
    [handleOpenChange, router]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (rows.length ? (i + 1) % rows.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (rows.length ? (i - 1 + rows.length) % rows.length : 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(Math.max(0, rows.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(rows[active], e.metaKey || e.ctrlKey);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-[12vh] z-[101] w-[min(640px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-[14px] border border-rule bg-surface shadow-[0_24px_60px_-12px_rgba(0,0,0,0.35)]"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement)
              .querySelector<HTMLInputElement>("input")
              ?.focus();
          }}
        >
          <Dialog.Title className="sr-only">Search posts</Dialog.Title>

          <div className="flex items-center gap-3 border-b border-rule px-4">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="shrink-0 text-ink-3"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search posts"
              aria-label="Search posts"
              role="combobox"
              aria-expanded
              aria-controls="search-results"
              aria-activedescendant={rows.length ? `search-row-${active}` : undefined}
              autoComplete="off"
              spellCheck={false}
              className="h-14 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3"
            />
            <kbd className="hidden shrink-0 rounded border border-rule px-1.5 py-0.5 text-[11px] text-ink-3 sm:block">
              esc
            </kbd>
          </div>

          <div
            ref={listRef}
            id="search-results"
            role="listbox"
            aria-label="Search results"
            className="max-h-[min(60vh,420px)] overflow-y-auto overscroll-contain py-2"
          >
            {failed && (
              <p className="px-4 py-8 text-center text-[13px] text-ink-2">
                Could not load the search index.
              </p>
            )}
            {!failed && !loaded && (
              <div className="flex justify-center px-4 py-8">
                <PixelLoader label="Loading index" />
              </div>
            )}
            {loaded && !rows.length && (
              <p className="px-4 py-8 text-center text-[13px] text-ink-2">
                No matches for &ldquo;{deferred.trim()}&rdquo;
              </p>
            )}

            {rows.map((row, i) => (
              <div
                key={row.key}
                id={`search-row-${i}`}
                data-idx={i}
                role="option"
                aria-selected={i === active}
                onMouseMove={() => setActive(i)}
                onClick={(e) => go(row, e.metaKey || e.ctrlKey)}
                className={`cursor-pointer px-4 ${row.kind === "post" ? "py-2" : "py-1.5 pl-9"} ${
                  i === active ? "bg-surface-2" : ""
                }`}
              >
                {row.kind === "post" ? (
                  <span className="text-[14px] font-medium text-ink">{row.title}</span>
                ) : (
                  <>
                    <span className="block truncate text-[13px] text-ink-2">
                      <span className="text-ink-3">§ </span>
                      {row.heading}
                    </span>
                    {row.snippet && (
                      <span className="mt-0.5 block text-[12px] leading-relaxed text-ink-3">
                        {row.snippet.parts.map((p, j) =>
                          p.hit ? (
                            <mark
                              key={j}
                              className="bg-transparent font-medium text-brand"
                            >
                              {p.text}
                            </mark>
                          ) : (
                            <span key={j}>{p.text}</span>
                          )
                        )}
                      </span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
