import Link from "next/link";
import { SECTIONS, type Section } from "@/lib/interviews-data";
import { facetsFor, isQASection, qaId, sectionHref, stripNum } from "@/lib/interviews";
import { SubBlock } from "@/components/interviews/sub-block";
import { QACard } from "@/components/interviews/qa-card";
import { PaperCard } from "@/components/interviews/paper-card";
import { InterviewFilters } from "@/components/interviews/interview-filters";
import { SelectionShare } from "@/components/selection-share";
import { PublicFooter } from "@/components/public-nav";

/**
 * One section, answers included. Q&A open/close stays native <details>, so the
 * answer HTML is painted on the server and never enters the client bundle. The
 * filter bar is scoped to this section's questions.
 */
export function InterviewsSection({ section }: { section: Section }) {
  const title = stripNum(section.title);
  const index = SECTIONS.findIndex((s) => s.id === section.id);
  const prev = index > 0 ? SECTIONS[index - 1] : null;
  const next = index < SECTIONS.length - 1 ? SECTIONS[index + 1] : null;
  const facets = facetsFor([section]);

  return (
    <>
      <main id="main" className="flex-1 w-full max-w-2xl mx-auto px-6 py-12 md:py-16">
        <div className="mb-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground/70">
          <Link href="/interviews" className="hover:text-primary">
            Interviews
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="truncate">{title}</span>
        </div>

        <header className="mb-8 pb-6 border-b border-border">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground leading-[1.15]">
            {title}
          </h1>
          {facets.total > 0 && (
            <p className="text-[12px] font-mono text-muted-foreground/60 mt-2">
              {facets.total} questions
            </p>
          )}
        </header>

        {facets.total > 0 && <InterviewFilters facets={facets} />}

        <SelectionShare title={title} social={false}>
          <div id="interviews-body">
            {section.type === "info" && (
              <div
                className="interviews-prose"
                dangerouslySetInnerHTML={{ __html: section.html }}
              />
            )}

            {section.type === "papers" &&
              section.papers.map((p, i) => <PaperCard key={i} paper={p} />)}

            {isQASection(section) &&
              section.subs.map((sub, subIdx) => (
                <SubBlock key={sub.title} title={sub.title}>
                  {sub.qs.map((qa, qIdx) => (
                    <QACard
                      key={qIdx}
                      id={qaId(section.id, subIdx, qIdx)}
                      q={qa.q}
                      difficulty={qa.difficulty}
                      tags={qa.tags}
                      code={qa.code}
                    >
                      <div dangerouslySetInnerHTML={{ __html: qa.a }} />
                    </QACard>
                  ))}
                </SubBlock>
              ))}
          </div>
        </SelectionShare>

        <div className="mt-16 grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
          <div>
            {prev && (
              <Link href={sectionHref(prev.id)} className="group block">
                <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground/60">
                  ← Previous
                </p>
                <p className="text-[14px] leading-snug text-muted-foreground group-hover:text-primary">
                  {stripNum(prev.title)}
                </p>
              </Link>
            )}
          </div>
          <div className="sm:text-right">
            {next && (
              <Link href={sectionHref(next.id)} className="group block">
                <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground/60">
                  Next →
                </p>
                <p className="text-[14px] leading-snug text-muted-foreground group-hover:text-primary">
                  {stripNum(next.title)}
                </p>
              </Link>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
