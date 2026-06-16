import { SECTIONS } from "@/lib/interviews-data";
import { InterviewsShell } from "@/components/interviews/interviews-shell";
import { SectionBlock } from "@/components/interviews/section-block";
import { SubBlock } from "@/components/interviews/sub-block";
import { QACard } from "@/components/interviews/qa-card";
import { PaperCard } from "@/components/interviews/paper-card";
import type { IndexEntry, SectionMeta } from "@/components/interviews/interviews-context";

// Strip the leading "N. " ordinal from a section title for display.
const stripNum = (title: string) => title.replace(/^\d+\.\s*/, "");

// This is a Server Component: it imports the full dataset, renders every
// answer to HTML on the server, and hands the client shell only a lightweight
// index (question text + tags) for search/filter. The heavy answer bodies
// never enter the client JS bundle.
export function InterviewsGuide() {
  const sectionMeta: SectionMeta[] = SECTIONS.map((sec) => ({
    id: sec.id,
    title: stripNum(sec.title),
    kind: sec.type === "info" ? "info" : sec.type === "papers" ? "papers" : "qa",
  }));

  const index: IndexEntry[] = [];
  for (const sec of SECTIONS) {
    if (sec.type === "info" || sec.type === "papers") continue;
    sec.subs.forEach((sub, subIdx) => {
      sub.qs.forEach((qa, qIdx) => {
        index.push({
          id: `${sec.id}-${subIdx}-${qIdx}`,
          sectionId: sec.id,
          subKey: sub.title,
          q: qa.q,
          tags: qa.tags,
        });
      });
    });
  }

  return (
    <InterviewsShell sections={sectionMeta} index={index}>
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
              <SubBlock key={sub.title} sectionId={sec.id} subKey={sub.title} title={sub.title}>
                {sub.qs.map((qa, qIdx) => (
                  <QACard
                    key={qIdx}
                    id={`${sec.id}-${subIdx}-${qIdx}`}
                    q={qa.q}
                    difficulty={qa.difficulty}
                    tags={qa.tags}
                  >
                    <div dangerouslySetInnerHTML={{ __html: qa.a }} />
                  </QACard>
                ))}
              </SubBlock>
            ))}
          </SectionBlock>
        );
      })}
    </InterviewsShell>
  );
}
