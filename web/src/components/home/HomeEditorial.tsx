import Link from "next/link";
import { CornerControls } from "@/components/home/CornerControls";
import { LossSurface } from "@/components/LossSurface";
import { Reveal } from "@/components/Reveal";
import { ThingsILike } from "@/components/ThingsILike";
import { TypedBio } from "@/components/TypedBio";
import { BIO, THINGS } from "@/content/site";
import { PROJECTS } from "@/config/projects";
import { getAllPosts } from "@/lib/blog";

const SECTIONS = [
  { id: "bio", label: "Bio" },
  { id: "surface", label: "The Loss Surface" },
  { id: "vicinity", label: "Things in My Vicinity" },
  { id: "repository", label: "The Repository" },
  { id: "shelf", label: "The Shelf" },
  { id: "writing", label: "The Writing Desk" },
];

const hd = "font-serif text-[clamp(2.6rem,5vw,4.4rem)] leading-none text-ink text-center";

/** Direction C: warm editorial (stympaul). One long page of scenes, oval buttons, red ink. */
export function HomeEditorial() {
  const posts = getAllPosts().slice(0, 5);
  return (
    <div className="min-h-dvh">
      <CornerControls sections={SECTIONS} />

      <section id="bio" className="mx-auto grid min-h-[92svh] max-w-[1240px] items-center gap-12 px-6 pt-24 md:grid-cols-[1fr_auto]">
        <Reveal slot={1}>
          <h1 className="text-[clamp(1.4rem,2.2vw,2rem)] font-medium">
            Samit Mohan <span className="font-serif text-[1.2em] font-normal italic text-accent">@samitmohan</span>
          </h1>
          <TypedBio runs={BIO} className="mt-5 max-w-[min(56ch,90vw)] text-[clamp(1.05rem,1.4vw,1.25rem)] leading-[1.7]" delay={700} />
          <p className="mt-8 text-[clamp(1.05rem,1.4vw,1.25rem)]">
            Mostly, a <span className="font-serif text-[2.2em] leading-none italic text-ink">backward-pass enthusiast.</span>
          </p>
        </Reveal>
        <Reveal slot={3} className="justify-self-center">
          <figure className="group relative w-56 rotate-3 bg-paper p-3 pb-10 shadow-[0_10px_30px_-10px_rgba(0,0,0,.35)] transition-transform duration-500 hover:rotate-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/photo.jpeg" alt="Samit" className="aspect-square w-full object-cover grayscale-[30%]" />
            <figcaption className="absolute inset-x-3 bottom-2 font-serif text-[15px] italic text-ink">bangalore, mostly</figcaption>
          </figure>
        </Reveal>
      </section>

      <section id="surface" className="mx-auto max-w-[1000px] px-6 py-[10svh]">
        <h2 className={hd}>The Loss Surface</h2>
        <p className="mx-auto mt-4 max-w-[48ch] text-center text-[14px]">Two optimisers, one landscape. Red is SGD, black is Adam.</p>
        <div className="mt-10">
          <LossSurface />
        </div>
      </section>

      <section id="vicinity" className="mx-auto max-w-[840px] px-6 py-[10svh]">
        <h2 className={hd}>Things in My Vicinity</h2>
        <div className="mt-12">
          <ThingsILike things={THINGS} />
        </div>
      </section>

      <section id="repository" className="py-[10svh]">
        <h2 className={hd}>The Repository</h2>
        <div className="relative mx-auto mt-12 grid max-w-[1100px] gap-10 px-6 sm:grid-cols-2">
          <svg className="pointer-events-none absolute inset-0 z-0 hidden size-full sm:block" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <path d="M 25 2 C 40 -4, 60 10, 75 3 M 75 3 C 85 30, 30 40, 25 55" stroke="var(--accent)" strokeWidth="1.5" fill="none" vectorEffect="non-scaling-stroke" />
          </svg>
          {PROJECTS.map((p, i) => (
            <a
              key={p.slug}
              href={p.repoUrl}
              className="group relative z-[1] bg-paper p-6 shadow-[0_8px_24px_-12px_rgba(0,0,0,.35)] transition-transform duration-300 hover:rotate-0"
              style={{ rotate: `${[-2.5, 1.8, 1.2, -1.6][i % 4]}deg` }}
            >
              <span className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rounded-full bg-accent shadow-[0_2px_3px_rgba(0,0,0,.4)]" />
              <span className="meta">{p.stack}</span>
              <h3 className="mt-2 font-serif text-[2rem] leading-none font-normal italic">{p.name}</h3>
              <p className="mt-3 text-[14px]">{p.blurb}</p>
            </a>
          ))}
          <div className="absolute -right-2 bottom-0 hidden rotate-[4deg] bg-[#fff3a8] p-4 font-serif text-[18px] text-[#1b1b1b] italic shadow-md sm:block">
            the full board lives
            <br />
            on <Link href="/projects" className="underline decoration-[#d9261c]">/projects</Link>
          </div>
        </div>
      </section>

      <section id="shelf" className="mx-auto max-w-[840px] px-6 py-[10svh]">
        <h2 className={hd}>The Shelf</h2>
        <Link href="/shelf" className="mt-12 flex items-end justify-center gap-1.5 border-b-[10px] border-[#b57b43] px-6 [perspective:900px]">
          {["Fantastic Mr. Fox", "Attention Is All You Need", "Chinchilla", "LoRA", "FlashAttention", "DPO", "InstructGPT"].map((t, i) => (
            <span
              key={t}
              className="flex w-9 items-center justify-center rounded-t-sm py-3 text-[11px] text-white transition-transform duration-300 [writing-mode:vertical-rl] hover:-translate-y-3 hover:[transform:rotateY(-34deg)_translateZ(46px)]"
              style={{ height: `${150 + ((i * 37) % 70)}px`, background: ["#2d4a3e", "#7a2e2a", "#2c3e64", "#8a6d2b", "#4b3a5e", "#1f1f1f", "#5e4632"][i] }}
            >
              {t}
            </span>
          ))}
        </Link>
      </section>

      <section id="writing" className="mx-auto max-w-[720px] px-6 py-[10svh]">
        <h2 className={hd}>The Writing Desk</h2>
        <ul className="mt-12">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="group flex items-baseline justify-between gap-6 border-b border-dashed border-hairline py-4">
                <span className="text-ink group-hover:text-accent">{p.title}</span>
                <span className="font-serif italic">{p.readingTime} min</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/blog" className="oval">Technical</Link>
          <Link href="/blog/personal" className="oval">Personal</Link>
        </div>
      </section>

      <footer className="flex items-center justify-between px-6 py-8">
        <span className="font-serif text-[18px] italic text-ink">go train something.</span>
        <span className="meta">double-click for the lights</span>
      </footer>
    </div>
  );
}
