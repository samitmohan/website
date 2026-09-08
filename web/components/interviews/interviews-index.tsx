import Link from "next/link";
import { SECTIONS } from "@/lib/interviews-data";
import {
  facetsFor,
  isQASection,
  qaId,
  questionCount,
  sectionHref,
  sectionNav,
  stripNum,
} from "@/lib/interviews";
import { SubBlock } from "@/components/interviews/sub-block";
import { QALink } from "@/components/interviews/qa-link";
import { InterviewFilters } from "@/components/interviews/interview-filters";
import { SectionRail } from "@/components/interviews/section-rail";
import { PublicFooter } from "@/components/public-nav";

// Inbound links to the old single-page guide carry a section fragment.
// Forward them to the section's own route so they still land somewhere.
const HASH_FORWARD = `
try {
  var h = location.hash.slice(1);
  if (/^s[0-9]+$/.test(h)) location.replace("/interviews/" + h);
} catch (_) {}
`
  .replace(/\s+/g, " ")
  .trim();

/**
 * Every question, no answers. The 234 answers are 202 KB of the guide's 300 KB,
 * so they live on the per-section routes and this page stays a fast, filterable
 * catalogue. The filter bar still spans the whole corpus because every question
 * is painted here.
 */
export function InterviewsIndex() {
  const sections = sectionNav();
  const facets = facetsFor(SECTIONS);

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: HASH_FORWARD }} />
      <SectionRail sections={sections} />
      <main id="main" className="flex-1 w-full max-w-2xl mx-auto px-6 py-12 md:py-16">
        <header className="mb-10 pb-6 border-b border-border">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-2 leading-[1.1]">
            Interview Preparation
          </h1>
          <p className="text-small text-muted-foreground leading-relaxed">
            Questions I need to prepare for interviews 2026.
          </p>
          <p className="text-small font-mono text-muted-foreground/60 mt-2">
            {facets.total} questions across {sections.length} sections
          </p>
        </header>

        <InterviewFilters facets={facets} />

        <div id="interviews-body">
          {SECTIONS.map((sec) => {
            const title = stripNum(sec.title);
            const href = sectionHref(sec.id);

            const heading = (
              <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-border pb-2">
                <h2 className="text-body font-semibold tracking-tight text-foreground">
                  <Link href={href} className="hover:text-primary">
                    {title}
                  </Link>
                </h2>
                <span className="shrink-0 font-mono text-micro text-muted-foreground/60">
                  {isQASection(sec) ? `${questionCount(sec)} questions` : "read"}
                </span>
              </div>
            );

            if (!isQASection(sec)) {
              return (
                <section
                  key={sec.id}
                  id={sec.id}
                  data-section="static"
                  className="mb-14 scroll-mt-20"
                >
                  {heading}
                  <Link
                    href={href}
                    className="text-small text-muted-foreground hover:text-primary"
                  >
                    Open section →
                  </Link>
                </section>
              );
            }

            return (
              <section key={sec.id} id={sec.id} data-section="qa" className="mb-14 scroll-mt-20">
                {heading}
                {sec.subs.map((sub, subIdx) => (
                  <SubBlock key={sub.title} title={sub.title}>
                    {sub.qs.map((qa, qIdx) => (
                      <QALink
                        key={qIdx}
                        href={`${href}#${qaId(sec.id, subIdx, qIdx)}`}
                        q={qa.q}
                        difficulty={qa.difficulty}
                        tags={qa.tags}
                      />
                    ))}
                  </SubBlock>
                ))}
              </section>
            );
          })}
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
