import Link from "next/link";
import { LossSurfaceLazy as LossSurface } from "@/components/LossSurfaceLazy";
import { Page } from "@/components/Page";
import { Reveal } from "@/components/Reveal";
import { TypedBio } from "@/components/TypedBio";
import { LabCards } from "@/components/LabCards";
import { BIO, EMAIL, FEATURED, HANDLE } from "@/content/site";
import { formatPostDate, getPost } from "@/lib/blog";

/** Direction A: calm grey column (shwn), warm paper and red ink (stympaul). */
export function HomeBlend() {
  const featured = FEATURED.flatMap((slug) => {
    const p = getPost(slug);
    return p ? [p] : [];
  });
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
          {featured.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="group flex items-baseline justify-between gap-4 border-b border-hairline py-3">
                <span className="text-ink transition-colors group-hover:text-accent">{p.title}</span>
                <span className="meta shrink-0">{formatPostDate(p.date)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal slot={7} as="section" className="mt-20">
        <SectionHead title="Things" href="/things" more="all things" />
        <div className="mt-4">
          <LabCards widgets={[]} />
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
