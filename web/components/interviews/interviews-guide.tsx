import { SECTIONS } from "@/lib/interviews-data";
import { SectionBlock } from "@/components/interviews/section-block";
import { SubBlock } from "@/components/interviews/sub-block";
import { QACard } from "@/components/interviews/qa-card";
import { PaperCard } from "@/components/interviews/paper-card";
import { PublicFooter } from "@/components/public-nav";

// Strip the leading "N. " ordinal from a section title for display.
const stripNum = (title: string) => title.replace(/^\d+\.\s*/, "");

// Fully static server component. No search, no filter, no sidebar, no client
// JS: every section renders to HTML on the server, and Q&A open/close uses
// native <details>. A plain anchor list at the top serves as the table of
// contents.
export function InterviewsGuide() {
  const sections = SECTIONS.map((sec) => ({ id: sec.id, title: stripNum(sec.title) }));

  let questionCount = 0;
  for (const sec of SECTIONS) {
    if (sec.type === "info" || sec.type === "papers") continue;
    for (const sub of sec.subs) questionCount += sub.qs.length;
  }

  return (
    <>
      <main id="main" className="flex-1 w-full max-w-2xl mx-auto px-6 py-12 md:py-16">
        <header className="mb-10 pb-6 border-b border-border">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-2 leading-[1.1]">
            Interview Preparation
          </h1>
          <p className="text-[15px] text-muted-foreground leading-relaxed">
            Questions I need to prepare for interviews 2026.
          </p>
          <p className="text-[12px] font-mono text-muted-foreground/60 mt-2">
            {questionCount} questions across {sections.length} sections
          </p>
        </header>

        <nav className="mb-14">
          <ul className="space-y-1">
            {sections.map((s, i) => (
              <li key={s.id} className="text-[14px]">
                <a
                  href={`#${s.id}`}
                  className="text-foreground/80 hover:text-primary hover:underline underline-offset-2"
                >
                  <span className="font-mono text-[12px] text-muted-foreground/50 mr-2 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {SECTIONS.map((sec) => {
          const title = stripNum(sec.title);

          if (sec.type === "info") {
            return (
              <SectionBlock key={sec.id} id={sec.id} title={title}>
                <div className="interviews-prose" dangerouslySetInnerHTML={{ __html: sec.html }} />
              </SectionBlock>
            );
          }

          if (sec.type === "papers") {
            return (
              <SectionBlock key={sec.id} id={sec.id} title={title}>
                {sec.papers.map((p, i) => (
                  <PaperCard key={i} paper={p} />
                ))}
              </SectionBlock>
            );
          }

          return (
            <SectionBlock key={sec.id} id={sec.id} title={title}>
              {sec.subs.map((sub, subIdx) => (
                <SubBlock key={sub.title} title={sub.title}>
                  {sub.qs.map((qa, qIdx) => (
                    <QACard
                      key={qIdx}
                      id={`${sec.id}-${subIdx}-${qIdx}`}
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
            </SectionBlock>
          );
        })}
      </main>

      <PublicFooter />
    </>
  );
}
