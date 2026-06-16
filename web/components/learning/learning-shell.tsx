"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SECTIONS, type Tag } from "@/lib/learning-data";
import { QACard } from "@/components/learning/qa-card";
import { PaperCard } from "@/components/learning/paper-card";

const FILTERS: { label: string; tag: Tag | "all" }[] = [
  { label: "All", tag: "all" },
  { label: "Frontier", tag: "frontier" },
  { label: "Startups", tag: "startup" },
  { label: "Key", tag: "key" },
  { label: "Coding", tag: "coding" },
  { label: "System", tag: "system" },
];

// Strip leading "N. " from section titles for display
function stripNum(title: string) {
  return title.replace(/^\d+\.\s*/, "");
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ");
}

export function LearningShell() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Tag | "all">("all");
  const [activeSection, setActiveSection] = useState(SECTIONS[0]?.id);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const searchIndex = useMemo(() => {
    const index = new Map<string, string>();
    SECTIONS.forEach((sec) => {
      if (sec.type === "info" || sec.type === "papers") return;
      sec.subs.forEach((sub, subIdx) => {
        sub.qs.forEach((qa, qIdx) => {
          const id = `${sec.id}-${subIdx}-${qIdx}`;
          index.set(id, `${qa.q} ${stripHtml(qa.a)}`.toLowerCase());
        });
      });
    });
    return index;
  }, []);

  const lowerQuery = query.trim().toLowerCase();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-120px 0px -70% 0px" }
    );
    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex-1 flex min-h-0">
      {/* Sidebar */}
      <aside className="hidden md:flex w-[220px] flex-shrink-0 border-r border-border flex-col sticky top-14 h-[calc(100vh-56px)] overflow-y-auto bg-sidebar-bg">
        <nav className="py-4 px-3">
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className={`w-full text-left px-2.5 py-1.5 rounded text-[12px] mb-0.5 transition-colors truncate ${
                activeSection === sec.id
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {stripNum(sec.title)}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar: search + filters */}
        <div className="sticky top-14 z-10 bg-background/95 backdrop-blur border-b border-border px-5 sm:px-8 py-3 flex flex-col gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full max-w-sm bg-transparent border-b border-border text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none pb-1 focus:border-foreground/40 transition-colors"
          />
          <div className="flex gap-4">
            {FILTERS.map((f) => (
              <button
                key={f.tag}
                onClick={() => setFilter(f.tag)}
                className={`text-[12px] transition-colors pb-0.5 ${
                  filter === f.tag
                    ? "text-foreground font-medium border-b border-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-5 sm:px-8 py-8 max-w-2xl">
          {SECTIONS.map((sec) => {
            if (sec.type === "info") {
              return (
                <div
                  key={sec.id}
                  id={sec.id}
                  ref={(el) => { sectionRefs.current[sec.id] = el; }}
                  className="mb-12 scroll-mt-32"
                >
                  <h2 className="text-[14px] font-semibold text-foreground mb-4">{stripNum(sec.title)}</h2>
                  <div className="learning-prose" dangerouslySetInnerHTML={{ __html: sec.html }} />
                </div>
              );
            }

            if (sec.type === "papers") {
              return (
                <div
                  key={sec.id}
                  id={sec.id}
                  ref={(el) => { sectionRefs.current[sec.id] = el; }}
                  className="mb-12 scroll-mt-32"
                >
                  <h2 className="text-[14px] font-semibold text-foreground mb-4">{stripNum(sec.title)}</h2>
                  {sec.papers.map((p, i) => (
                    <PaperCard key={i} paper={p} />
                  ))}
                </div>
              );
            }

            const subsWithVisible = sec.subs.map((sub, subIdx) => ({
              sub,
              visibleQs: sub.qs
                .map((qa, qIdx) => ({ qa, id: `${sec.id}-${subIdx}-${qIdx}` }))
                .filter(({ qa, id }) => {
                  const matchesSearch = !lowerQuery || (searchIndex.get(id) ?? "").includes(lowerQuery);
                  const matchesFilter = filter === "all" || qa.tags.includes(filter);
                  return matchesSearch && matchesFilter;
                }),
            }));

            const sectionTotal = subsWithVisible.reduce((n, s) => n + s.visibleQs.length, 0);
            if (sectionTotal === 0 && (lowerQuery || filter !== "all")) return null;

            return (
              <div
                key={sec.id}
                id={sec.id}
                ref={(el) => { sectionRefs.current[sec.id] = el; }}
                className="mb-12 scroll-mt-32"
              >
                <h2 className="text-[14px] font-semibold text-foreground mb-4">{stripNum(sec.title)}</h2>
                {subsWithVisible.map(
                  ({ sub, visibleQs }) =>
                    visibleQs.length > 0 && (
                      <div key={sub.title} className="mb-6">
                        <div className="text-[11px] text-muted-foreground mb-2">{sub.title}</div>
                        {visibleQs.map(({ qa, id }) => (
                          <QACard key={id} qa={qa} id={id} />
                        ))}
                      </div>
                    )
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
