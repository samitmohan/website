"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SECTIONS, type Tag } from "@/lib/learning-data";
import { QACard } from "@/components/learning/qa-card";
import { PaperCard } from "@/components/learning/paper-card";

const FILTERS: { label: string; tag: Tag | "all" }[] = [
  { label: "All", tag: "all" },
  { label: "Frontier Labs", tag: "frontier" },
  { label: "Indian Startups", tag: "startup" },
  { label: "Key Questions", tag: "key" },
  { label: "Coding", tag: "coding" },
  { label: "System Design", tag: "system" },
];

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
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
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

  const totalQuestions = useMemo(() => {
    let count = 0;
    SECTIONS.forEach((sec) => {
      if (sec.type !== "info" && sec.type !== "papers") {
        sec.subs.forEach((sub) => (count += sub.qs.length));
      }
    });
    return count;
  }, []);

  return (
    <div className="flex-1 flex min-h-0">
      <aside className="hidden md:flex w-[240px] flex-shrink-0 border-r border-border flex-col sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">
        <nav className="p-3">
          {SECTIONS.map((sec) => {
            const qCount =
              sec.type !== "info" && sec.type !== "papers"
                ? sec.subs.reduce((n, s) => n + s.qs.length, 0)
                : 0;
            return (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className={`w-full flex items-center justify-between gap-2 text-left px-2.5 py-1.5 rounded-md text-[12.5px] mb-0.5 transition-colors ${
                  activeSection === sec.id
                    ? "bg-sidebar-active-bg text-primary"
                    : "text-sidebar-text hover:text-sidebar-text-hover hover:bg-sidebar-hover-bg"
                }`}
              >
                <span className="truncate">{sec.title}</span>
                {qCount > 0 && (
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">{qCount}</span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="sticky top-14 z-10 bg-background/95 backdrop-blur border-b border-border px-4 sm:px-6 py-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions..."
            className="w-full bg-muted border border-border rounded-md px-3 py-1.5 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors mb-2"
          />
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.tag}
                onClick={() => setFilter(f.tag)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                  filter === f.tag
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 sm:px-6 py-6 max-w-3xl">
          <div className="text-[12px] text-muted-foreground mb-6">
            {totalQuestions} questions across {SECTIONS.length} sections
          </div>

          {SECTIONS.map((sec) => {
            if (sec.type === "info") {
              return (
                <div
                  key={sec.id}
                  id={sec.id}
                  ref={(el) => {
                    sectionRefs.current[sec.id] = el;
                  }}
                  className="mb-10 scroll-mt-32"
                >
                  <h2 className="text-[15px] font-semibold text-foreground mb-3">{sec.title}</h2>
                  <div className="learning-prose" dangerouslySetInnerHTML={{ __html: sec.html }} />
                </div>
              );
            }

            if (sec.type === "papers") {
              return (
                <div
                  key={sec.id}
                  id={sec.id}
                  ref={(el) => {
                    sectionRefs.current[sec.id] = el;
                  }}
                  className="mb-10 scroll-mt-32"
                >
                  <h2 className="text-[15px] font-semibold text-foreground mb-3">{sec.title}</h2>
                  {sec.papers.map((p, i) => (
                    <PaperCard key={i} paper={p} />
                  ))}
                </div>
              );
            }

            const subsWithVisible = sec.subs.map((sub, subIdx) => {
              const visibleQs = sub.qs
                .map((qa, qIdx) => ({ qa, id: `${sec.id}-${subIdx}-${qIdx}` }))
                .filter(({ qa, id }) => {
                  const matchesSearch = !lowerQuery || (searchIndex.get(id) ?? "").includes(lowerQuery);
                  const matchesFilter = filter === "all" || qa.tags.includes(filter);
                  return matchesSearch && matchesFilter;
                });
              return { sub, visibleQs };
            });

            const sectionTotal = subsWithVisible.reduce((n, s) => n + s.visibleQs.length, 0);
            if (sectionTotal === 0 && (lowerQuery || filter !== "all")) return null;

            return (
              <div
                key={sec.id}
                id={sec.id}
                ref={(el) => {
                  sectionRefs.current[sec.id] = el;
                }}
                className="mb-10 scroll-mt-32"
              >
                <div className="flex items-baseline justify-between mb-4">
                  <h2 className="text-[15px] font-semibold text-foreground">{sec.title}</h2>
                  <span className="text-[11px] text-muted-foreground">{sectionTotal} questions</span>
                </div>
                {subsWithVisible.map(
                  ({ sub, visibleQs }) =>
                    visibleQs.length > 0 && (
                      <div key={sub.title} className="mb-5">
                        <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-2">
                          {sub.title}
                        </div>
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
