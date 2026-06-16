"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Tag } from "@/lib/interviews-data";
import {
  InterviewsContext,
  subKeyOf,
  type IndexEntry,
  type SectionMeta,
} from "@/components/interviews/interviews-context";

const FILTERS: { label: string; tag: Tag | "all" }[] = [
  { label: "All", tag: "all" },
  { label: "Frontier", tag: "frontier" },
  { label: "Startups", tag: "startup" },
  { label: "Key", tag: "key" },
  { label: "Coding", tag: "coding" },
  { label: "System", tag: "system" },
];

export function InterviewsShell({
  sections,
  index,
  children,
}: {
  sections: SectionMeta[];
  index: IndexEntry[];
  children: React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Tag | "all">("all");
  const [activeSection, setActiveSection] = useState(sections[0]?.id);
  const [allExpanded, setAllExpanded] = useState(false);
  const [flashId, setFlashId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lowerQuery = query.trim().toLowerCase();
  const queryActive = lowerQuery.length > 0;
  const searchActive = queryActive || filter !== "all";

  const { visibleCards, visibleSections, visibleSubs, matchCount } = useMemo(() => {
    const cards = new Set<string>();
    const subs = new Set<string>();
    const secs = new Set<string>();
    for (const e of index) {
      const matchesSearch = !queryActive || e.q.toLowerCase().includes(lowerQuery);
      const matchesFilter = filter === "all" || e.tags.includes(filter);
      if (matchesSearch && matchesFilter) {
        cards.add(e.id);
        subs.add(subKeyOf(e.sectionId, e.subKey));
        secs.add(e.sectionId);
      }
    }
    if (!searchActive) {
      for (const s of sections) if (s.kind !== "qa") secs.add(s.id);
    }
    return { visibleCards: cards, visibleSections: secs, visibleSubs: subs, matchCount: cards.size };
  }, [index, sections, lowerQuery, queryActive, filter, searchActive]);

  const ctx = useMemo(
    () => ({
      queryActive,
      searchActive,
      allExpanded,
      flashId,
      isCardVisible: (id: string) => visibleCards.has(id),
      isSectionVisible: (sectionId: string) => visibleSections.has(sectionId),
      isSubVisible: (sectionId: string, subKey: string) =>
        visibleSubs.has(subKeyOf(sectionId, subKey)),
    }),
    [queryActive, searchActive, allExpanded, flashId, visibleCards, visibleSections, visibleSubs]
  );

  // Scroll-spy over the server-rendered section elements.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActiveSection(entry.target.id);
      },
      { rootMargin: "-120px 0px -70% 0px" }
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Active recall: jump to a random visible question, highlight it, leave it
  // collapsed so you answer in your head before revealing.
  const drill = useCallback(() => {
    const ids = [...visibleCards];
    if (ids.length === 0) return;
    setAllExpanded(false);
    const pick = ids[Math.floor(Math.random() * ids.length)];
    const el = document.getElementById(pick);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    setFlashId(pick);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlashId(null), 1400);
  }, [visibleCards]);

  // Keyboard: "/" focus search, "r" random drill, "e" expand/collapse all,
  // Escape clears the search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if (e.key === "Escape") {
        setQuery("");
        searchRef.current?.blur();
        return;
      }
      if (typing) return;
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "r") {
        e.preventDefault();
        drill();
      } else if (e.key === "e") {
        e.preventDefault();
        setAllExpanded((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drill]);

  const noResults = searchActive && matchCount === 0;

  return (
    <InterviewsContext.Provider value={ctx}>
      <div className="flex-1 flex min-h-0">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:flex w-[220px] flex-shrink-0 border-r border-border flex-col sticky top-14 h-[calc(100vh-56px)] overflow-y-auto bg-sidebar-bg">
          <nav className="py-4 px-3">
            {sections.map((s) => {
              const active = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className={`w-full text-left pl-3 pr-2.5 py-1.5 rounded text-[12px] mb-0.5 transition-colors truncate border-l-2 ${
                    active
                      ? "text-foreground font-medium border-l-primary"
                      : "text-muted-foreground hover:text-foreground border-l-transparent"
                  }`}
                >
                  {s.title}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col">
          {/* Topbar: search + filters + drill controls + mobile section picker */}
          <div className="sticky top-14 z-10 bg-background/95 backdrop-blur border-b border-border px-5 sm:px-8 py-3 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search...  ( / )"
                className="flex-1 max-w-sm bg-transparent border-b border-border text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none pb-1 focus:border-foreground/40 transition-colors"
              />
              <button
                onClick={drill}
                className="text-[12px] text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                title="Jump to a random question (r)"
              >
                Random
              </button>
              <button
                onClick={() => setAllExpanded((v) => !v)}
                className="text-[12px] text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                title="Expand or collapse all (e)"
              >
                {allExpanded ? "Collapse" : "Expand"}
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-4 overflow-x-auto">
                {FILTERS.map((f) => (
                  <button
                    key={f.tag}
                    onClick={() => setFilter(f.tag)}
                    className={`text-[12px] whitespace-nowrap transition-colors pb-0.5 ${
                      filter === f.tag
                        ? "text-foreground font-medium border-b border-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {/* Mobile section jump */}
              <select
                className="md:hidden ml-auto bg-card border border-border rounded text-[12px] text-foreground px-2 py-1 outline-none"
                value={activeSection}
                onChange={(e) => scrollToSection(e.target.value)}
                aria-label="Jump to section"
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 sm:px-8 py-8 max-w-2xl">
            {children}
            {noResults && (
              <p className="text-[13px] text-muted-foreground py-8">
                No questions match{query ? ` "${query}"` : ""}
                {filter !== "all" ? ` in ${FILTERS.find((f) => f.tag === filter)?.label}` : ""}.
              </p>
            )}
          </div>
        </div>
      </div>
    </InterviewsContext.Provider>
  );
}
