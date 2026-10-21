import type { Metadata } from "next";
import { InterviewFilter } from "@/components/InterviewFilter";
import { Page } from "@/components/Page";
import { Reveal } from "@/components/Reveal";
import { TocRail } from "@/components/TocRail";
import { getInterviews, type Question } from "@/lib/interviews";

// Prep notes for job applications: reachable by link, kept out of search and the nav.
export const metadata: Metadata = {
  title: "Interviews",
  robots: { index: false, follow: false },
  alternates: { canonical: "/interviews" },
};

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);

export default async function Interviews() {
  const sections = await getInterviews();
  const total = sections.reduce((n, s) => n + (s.type === "qa" ? s.subs.reduce((m, sub) => m + sub.qs.length, 0) : 0), 0);
  const toc = sections.map((s) => ({ id: s.id, text: s.title }));

  return (
    <Page>
      <TocRail toc={toc} />
      <Reveal slot={0} as="header">
        <h1 className="text-[22px]">Interviews</h1>
      </Reveal>

      <Reveal slot={1} className="mt-8">
        <InterviewFilter total={total} />
      </Reveal>

      <Reveal slot={2} className="mt-6 xl:hidden">
        <nav aria-label="Sections" className="flex flex-wrap gap-1.5">
          {sections.map((s, i) => (
            <a key={s.id} href={`#${s.id}`} className="pill" data-iv-chip={s.id}>
              <span className="font-mono text-[11px] opacity-60">{String(i + 1).padStart(2, "0")}</span> {s.title}
            </a>
          ))}
        </nav>
      </Reveal>

      <Reveal slot={3} className="mt-14 space-y-20">
        {sections.map((s, i) => (
          <section key={s.id} id={s.id} data-iv-section className="scroll-mt-24">
            <h2 className="flex items-baseline gap-3 font-serif text-[clamp(30px,5vw,40px)] leading-none font-normal">
              <span className="font-mono text-[12px] text-muted">{String(i + 1).padStart(2, "0")}</span>
              {s.title}
            </h2>

            {s.type === "qa" &&
              s.subs.map((sub) => (
                <div key={sub.title} data-iv-sub className="mt-8">
                  <h3 className="meta mb-2">{sub.title}</h3>
                  <ul className="divide-y divide-hairline border-y border-hairline">
                    {sub.qs.map((q) => (
                      <QA key={q.q} q={q} id={`${s.id}-${slug(q.q)}`} />
                    ))}
                  </ul>
                </div>
              ))}

            {s.type === "papers" && (
              <ol className="mt-8 divide-y divide-hairline border-y border-hairline" data-iv-sub>
                {s.papers.map((p) => (
                  <li key={p.url} data-iv-q className="grid grid-cols-[3.25rem_1fr] gap-x-3 py-3.5">
                    <span className="pt-0.5 font-mono text-[12px] text-muted">{p.year}</span>
                    <div>
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-ink underline decoration-hairline underline-offset-4 hover:decoration-accent">
                        {p.title}
                      </a>
                      <p className="text-[13px] text-muted">{p.authors}</p>
                      <p className="mt-1 text-[14px] text-body">{p.why}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}

            {s.type === "info" && <div data-iv-sub data-iv-q className="iv-info prose mt-8" dangerouslySetInnerHTML={{ __html: s.html }} />}
          </section>
        ))}
      </Reveal>
    </Page>
  );
}

function QA({ q, id }: { q: Question; id: string }) {
  return (
    <li data-iv-q data-d={q.difficulty}>
      <details id={id} className="group scroll-mt-24">
        <summary className="flex cursor-pointer list-none items-start gap-3 py-3.5 [&::-webkit-details-marker]:hidden">
          <span className={`iv-level iv-${q.difficulty} mt-[3px] shrink-0`}>{q.difficulty}</span>
          <span className="flex-1 text-[15px] leading-snug text-ink">{q.q}</span>
          <svg viewBox="0 0 16 16" aria-hidden className="mt-1 size-3.5 shrink-0 text-muted transition-transform group-open:rotate-90">
            <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </summary>
        <div className="prose iv-answer pb-5 pl-[3.25rem] text-[15px]">
          <div dangerouslySetInnerHTML={{ __html: q.a }} />
          {q.codeHtml && <div dangerouslySetInnerHTML={{ __html: q.codeHtml }} />}
          {q.tags.length > 0 && <p className="!mt-4 font-mono text-[11px] text-muted">{q.tags.join(" · ")}</p>}
        </div>
      </details>
    </li>
  );
}
