import Link from "next/link";
import { LossSurface } from "@/components/LossSurface";
import { Page } from "@/components/Page";
import { Reveal } from "@/components/Reveal";
import { ThingsILike } from "@/components/ThingsILike";
import { TypedBio } from "@/components/TypedBio";
import { BIO, EMAIL, HANDLE, LAB, THINGS } from "@/content/site";
import { formatPostDate, getAllPosts, getPersonalPosts } from "@/lib/blog";

/** Direction A: calm grey column (shwn), warm paper and red ink (stympaul). */
export function HomeBlend() {
  const tech = getAllPosts().slice(0, 4);
  const personal = getPersonalPosts().slice(0, 2);
  return (
    <Page>
      <Reveal slot={0}>
        <LossSurface />
      </Reveal>

      <Reveal slot={2} className="mt-10">
        <p className="text-ink">Hey,</p>
      </Reveal>
      <Reveal slot={3} as="header" className="mt-2">
        <h1 className="text-[22px] leading-snug font-medium text-body">
          I&apos;m <span className="text-ink underline decoration-dotted decoration-muted underline-offset-4">Samit</span>, an AI
          scientist at <a className="link" href="https://beltech.ai">beltech.ai</a>.
        </h1>
        <TypedBio runs={BIO} className="mt-2 text-[22px] leading-snug" delay={900} />
      </Reveal>
      <Reveal slot={5} className="mt-6 text-[15px]">
        Say hi at <a className="chip" href={`mailto:${EMAIL}`}>{EMAIL}</a> or find me as{" "}
        <a className="chip" href={`https://github.com/${HANDLE}`}>@{HANDLE}</a>.
      </Reveal>

      <Reveal slot={6} as="section" className="mt-20">
        <SectionHead title="Writing" href="/blog" more="all posts" />
        <ul className="mt-4">
          {tech.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="group flex items-baseline justify-between gap-4 border-b border-hairline py-3">
                <span className="text-ink transition-colors group-hover:text-accent">{p.title}</span>
                <span className="meta shrink-0">{formatPostDate(p.date)}</span>
              </Link>
            </li>
          ))}
          {personal.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="group flex items-baseline justify-between gap-4 border-b border-hairline py-3">
                <span className="font-serif text-[18px] italic text-ink transition-colors group-hover:text-accent">{p.title}</span>
                <span className="meta shrink-0">personal</span>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal slot={7} as="section" className="mt-20">
        <SectionHead title="Lab" href="/lab" more="open the lab" />
        <div className="no-scrollbar -mx-4 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4">
          {LAB.map((w, i) => (
            <Link
              key={w.id}
              href="/lab"
              className="group relative flex aspect-[420/460] w-[min(260px,70vw)] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-[28px] bg-surface p-5"
            >
              <LabGlyph i={i} />
              <span className="text-ink">{w.name}</span>
              <span className="text-[13px]">{w.blurb}</span>
            </Link>
          ))}
        </div>
      </Reveal>

      <Reveal slot={8} as="section" className="mt-16">
        <SectionHead title="Things I like" href="/shelf" more="the shelf" />
        <div className="mt-6">
          <ThingsILike things={THINGS} />
        </div>
      </Reveal>
    </Page>
  );
}

function SectionHead({ title, href, more }: { title: string; href: string; more: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <h2 className="text-[15px]">{title}</h2>
      <Link href={href} className="meta hover:text-accent">
        {more} →
      </Link>
    </div>
  );
}

/** A different small line drawing per lab card, pure SVG. */
export function LabGlyph({ i }: { i: number }) {
  const paths = [
    "M10 70 L40 30 L70 55 L100 15 L130 45",
    "M10 20 h120 M10 40 h80 M10 60 h110 M10 80 h60",
    "M10 80 C40 80 60 60 70 40 S110 10 130 10",
    "M70 10 L40 45 L100 45 Z M40 45 L25 80 M40 45 L55 80 M100 45 L85 80 M100 45 L115 80",
  ];
  return (
    <svg viewBox="0 0 140 90" className="absolute inset-x-6 top-8 text-ink opacity-70 transition-transform duration-500 group-hover:scale-105" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d={paths[i % paths.length]} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="130" cy="45" r="3" fill="var(--accent)" stroke="none" />
    </svg>
  );
}
