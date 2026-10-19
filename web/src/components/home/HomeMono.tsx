import Link from "next/link";
import { LossSurface } from "@/components/LossSurface";
import { Reveal } from "@/components/Reveal";
import { Rotator } from "@/components/home/Rotator";
import { EMAIL } from "@/content/site";
import { PROJECTS } from "@/config/projects";
import { inlineSvg } from "@/lib/inline-svg";

const pill = "rounded-full bg-surface-2 px-4 py-2 text-[14px] text-ink transition-colors hover:bg-hairline";

/** Direction B: monochrome product-designer (colehardik). One weight, ghost grey, full-bleed plates. */
export function HomeMono() {
  return (
    <div className="mono min-h-dvh px-3 sm:px-5">
      <nav className="sticky top-0 z-40 flex items-center justify-between bg-bg/90 py-4 backdrop-blur" aria-label="Main">
        <div className="flex gap-2">
          <Link className={pill} href="/blog">Blog</Link>
          <Link className={pill} href="/projects">Projects</Link>
          <Link className={`${pill} hidden sm:block`} href="/about">About</Link>
        </div>
        <Link href="/mocks/b" aria-label="Top" className="size-8 overflow-hidden rounded-full bg-surface-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/photo.jpeg" alt="" className="size-full object-cover" />
        </Link>
        <a href={`mailto:${EMAIL}`} className="rounded-full bg-ink px-4 py-2 text-[14px] text-bg">Say hi</a>
      </nav>

      <section className="relative grid min-h-[calc(100dvh-72px)] grid-rows-[1fr_auto] pb-10 sm:px-5">
        <Reveal slot={1} className="mx-auto w-full max-w-[900px] self-center">
          <LossSurface />
        </Reveal>
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <Reveal slot={3}>
            <h1 className="max-w-[18ch] text-[26px] leading-[1.1] sm:text-[32px]">
              Samit Mohan builds models from scratch. <span className="text-[var(--ghost)]">Then makes them run on 60k cameras.</span>
            </h1>
          </Reveal>
          <Reveal slot={4} className="sm:max-w-[300px]">
            <Rotator
              lines={[
                "Serving models at 10ms or under on an edge box.",
                "TA'd a 16-week AI engineering cohort for 200+ engineers.",
                "Wrote a few hundred DL problems for 50k+ learners.",
              ]}
            />
          </Reveal>
        </div>
      </section>

      <section className="flex flex-col gap-5 pb-10">
        {PROJECTS.map((p, i) => (
          <Reveal key={p.slug} slot={5 + i}>
            <a href={p.repoUrl} className="group block rounded-xl bg-surface p-5 sm:p-10">
              <div
                className="mx-auto aspect-[16/9] max-w-[960px] overflow-hidden rounded-lg text-ink [&>svg]:size-full"
                dangerouslySetInnerHTML={{ __html: p.figure ? inlineSvg(p.figure) : "" }}
              />
              <div className="mt-5 flex items-baseline justify-between text-[14px]">
                <span className="text-ink">{p.name}</span>
                <span className="text-body transition-colors group-hover:text-ink">{p.blurb}</span>
              </div>
            </a>
          </Reveal>
        ))}
      </section>

      <footer className="pt-[150px] pb-8 sm:px-5">
        <p className="text-[14px] text-body">Contact</p>
        <a href={`mailto:${EMAIL}`} className="mt-2 block text-[26px] text-[var(--ghost)] transition-colors hover:text-ink sm:text-[32px]">
          {EMAIL}
        </a>
        <div className="mt-16 flex items-center justify-between border-t border-hairline pt-5 text-[14px]">
          <span className="text-body">Double-click anywhere for the lights.</span>
          <div className="flex gap-2">
            <a className={pill} href="https://github.com/samitmohan">GitHub</a>
            <a className={pill} href="https://www.linkedin.com/in/samit-mohan/">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
