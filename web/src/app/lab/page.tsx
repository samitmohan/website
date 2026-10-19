import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/components/Page";
import { Reveal } from "@/components/Reveal";
import { RunScripts } from "@/components/RunScripts";
import { LAB } from "@/content/site";
import { deferScripts } from "@/lib/defer-scripts";

export const metadata: Metadata = {
  title: "Lab",
  description: "Small interactive ML widgets: step a tiny GPT, watch continuous batching, see residual growth.",
};

export default function Lab() {
  return (
    <Page>
      <Reveal slot={0} as="header">
        <h1 className="text-[22px]">Lab</h1>
        <p className="mt-1">Small machines from the posts, pulled out so you can poke them directly.</p>
      </Reveal>
      {LAB.map((w, i) => (
        <Reveal key={w.id} slot={1 + i} as="section" className="mt-14">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-[17px]">{w.name}</h2>
            <Link href={`/blog/${w.post}`} className="meta shrink-0 hover:text-accent">
              from the post →
            </Link>
          </div>
          <p className="mt-1 text-[14px]">{w.blurb}</p>
          <RunScripts
            className="prose mt-5"
            html={deferScripts(
              `<link rel="stylesheet" href="/widgets/${w.id}.css"><div id="${w.id}"></div><script src="/widgets/${w.id}.js"></script>`,
            )}
          />
        </Reveal>
      ))}
    </Page>
  );
}
