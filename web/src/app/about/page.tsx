import type { Metadata } from "next";
import { DimRows } from "@/components/DimRows";
import { Page } from "@/components/Page";
import { Reveal } from "@/components/Reveal";
import { SOCIAL_LINKS } from "@/config/links";

export const metadata: Metadata = {
  title: "About",
  description: "AI scientist at beltech.ai. Builds models, optimises inference, teaches, and writes.",
  alternates: { canonical: "/about" },
  openGraph: { images: ["/og/about.png"] },
};

const WORK = [
  { a: "beltech.ai", b: "AI Scientist", c: "now", href: "https://beltech.ai" },
  { a: "aiengg.dev", b: "Teaching assistant", c: "16-week cohort", href: "https://aiengg.dev/" },
  { a: "tensortonic.com", b: "Problem writer", c: "50k+ users", href: "https://www.tensortonic.com/" },
  { a: "MakeMyTrip", b: "Intern", c: "reinforcement learning" },
  { a: "Genpact", b: "Intern", c: "classical ML" },
  { a: "New Horizon College", b: "B.E. Computer Science", c: "2024 · 9.4" },
];

export default function About() {
  return (
    <Page>
      <div className="grid gap-10 sm:grid-cols-[1fr_auto]">
        <Reveal slot={0} as="header">
          <h1 className="text-[clamp(26px,4vw,34px)] leading-[1.15] font-medium">
            I rebuild <span className="mark">ML from scratch</span> and <span className="mark">write</span> about it.
          </h1>
        </Reveal>
        <Reveal slot={2} className="justify-self-center sm:justify-self-end">
          <figure className="w-36 rotate-3 bg-paper p-2 pb-6 shadow-[var(--shadow-card)] transition-transform duration-500 hover:rotate-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/photo.jpeg" alt="Samit Mohan" width={460} height={460} className="aspect-square w-full object-cover" />
          </figure>
        </Reveal>
      </div>

      <Reveal slot={3} className="mt-10 space-y-5 text-[16px] leading-[1.75]">
        <p>
          I am an AI Scientist at <a className="link" href="https://beltech.ai">beltech.ai</a>, working on building models and
          optimising inference for security, surveillance, and traffic management across 27 cities, processing 300 cameras 24/7,
          serving models with latency &lt;= 10ms on an edge box. My work focuses on inference management, computer vision, and
          writing business logic for detecting violations in India.
        </p>
        <p>
          I graduated from New Horizon College of Engineering in 2024 with a degree in Computer Science and a 9.4 CGPA.
          Creating multiple programming competitions &amp; mentoring juniors in algorithms led me to start a coding culture in
          my college &amp; create a club around it. I interned at MakeMyTrip and Genpact where I worked on reinforcement
          learning algorithms and classical ML.
        </p>
        <p>
          Apart from this, I love to teach and write. I TA&rsquo;d a 16 week AI Engineering cohort for 200+ senior engineers
          at <a className="link" href="https://aiengg.dev/">aiengg.dev</a>, designing their curriculum, taking classes, and
          solving doubts. Also wrote a few hundred deep learning implementation and system design problems for{" "}
          <a className="link" href="https://www.tensortonic.com/">tensortonic.com</a>, which serves 50k+ users. Writing the
          backward pass is the only way I have found to learn anything which is why the{" "}
          <a className="link" href="/blog">blog</a> exists.
        </p>
        <p>
          <a className="link" href="https://www.youtube.com/watch?v=JuYeHPFR3f0">I want to be the very best, like no one ever was.</a>
        </p>
      </Reveal>

      <Reveal slot={4} as="section" className="mt-16">
        <h2 className="meta">where</h2>
        <div className="mt-2">
          <DimRows rows={WORK} />
        </div>
      </Reveal>

      <Reveal slot={5} as="section" className="mt-16">
        <h2 className="meta">elsewhere</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {SOCIAL_LINKS.map((l) => (
            <a key={l.href} className="pill" href={l.href}>
              {l.label}
            </a>
          ))}
        </div>
      </Reveal>
    </Page>
  );
}
