import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Mark } from "@/components/mark";
import { PublicNav, PublicFooter } from "@/components/public-nav";
import { RSS_ALTERNATE } from "@/lib/metadata";

export const revalidate = false;

export const metadata: Metadata = {
  title: "About",
  description:
    "AI Scientist at Beltech AI in Bangalore. Detection over live video at city scale, and ML rebuilt from scratch on the side.",
  alternates: { canonical: "/about", types: RSS_ALTERNATE },
};

/**
 * DRAFT COPY. Samit is writing the real text; this is rewritten from what the
 * old homepage said so the page is complete and true in the meantime. Replace
 * the paragraphs below - the layout does not depend on their length.
 */
const INTRO = [
  `I am an AI Scientist at Beltech AI in Bangalore, where I work on computer
   vision over live video: detection models that read number plates, helmets,
   seatbelts and wrong-way traffic off RTSP streams, running across an estate of
   more than 60,000 cameras in 27 cities.`,
  `Most of what I have learned came from rebuilding things that already exist.
   An autograd engine, a tokenizer, a small GPT, an agent loop - not because the
   originals needed replacing, but because writing the backward pass yourself is
   the only way I have found to actually understand it. I write those up as I go.`,
  `Before this I interned at Genpact and MakeMyTrip, and studied information
   technology at NHCE. I also teach: a 16-week AI engineering cohort, a few
   hundred problems on TensorTonic, and course material read by rather more
   people than I expected.`,
];

type Role = {
  org: string;
  role: string;
  period: string;
  href?: string;
  summary: string;
};

const WORK: Role[] = [
  {
    org: "Beltech AI",
    role: "AI Scientist",
    period: "Jun 2025 - Present",
    href: "https://beltech.ai",
    summary:
      "10+ detection modules over live RTSP at 0.9+ F1, into 60k+ cameras across 27+ cities. A custom NVIDIA DeepStream pipeline in C that keeps decode, detect and track on-GPU, scaling one server to 100+ cameras on a single GPU. Detection latency down 54% to ≤10 ms with NMS-free YOLOv10 on Triton/TensorRT, and LPR rebuilt end to end from 150 ms to 40 ms. Led the Bangalore deployment: 20k+ violations a day across 6 junctions.",
  },
  {
    org: "Genpact",
    role: "Data Science Intern",
    period: "Oct 2023 - Dec 2023",
    summary:
      "An NLP resume screener for data-team hiring and a churn-prediction POC, plus dashboards and ETL.",
  },
  {
    org: "MakeMyTrip",
    role: "Machine Learning Intern",
    period: "Aug 2022 - Oct 2022",
    summary:
      "Personalization API with multi-armed bandits (epsilon-greedy, Thompson, UCB) and an RLHF reward model for itinerary ranking.",
  },
  {
    org: "NHCE, VTU",
    role: "B.Tech, Information Technology",
    period: "2020 - 2024",
    summary: "CGPA 9.4/10. Founder of the Coding Club.",
  },
];

const TEACHING: Role[] = [
  {
    org: "aiengg.dev",
    role: "AI Cohort TA",
    period: "Dec 2025 - May 2026",
    href: "https://aiengg.dev/",
    summary:
      "TA'd a 16-week AI engineering cohort for 200+ engineers: RAG, agents, fine-tuning, inference. Weekly classes, assignments, syllabus.",
  },
  {
    org: "TensorTonic",
    role: "Contributor",
    period: "Past",
    href: "https://www.tensortonic.com/ml-math",
    summary:
      "300+ implementation and system-design problems on a platform serving 40k+ users.",
  },
  {
    org: "InterviewReady",
    role: "Technical Writer",
    period: "Past",
    summary:
      "Restructured course content for 10k+ subscribers; technical posts reaching 20,000+ readers.",
  },
];

function RoleList({ items }: { items: Role[] }) {
  return (
    <div className="rows">
      {items.map((item) => {
        const inner = (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="text-[16px] text-ink">
                <span className="row-title font-medium">{item.org}</span>
                <span className="text-ink-2"> ・{item.role}</span>
              </h3>
              <span className="meta shrink-0">{item.period}</span>
            </div>
            <p className="mt-1.5 max-w-3xl text-pretty text-[15px] leading-[155%] text-ink-2">
              {item.summary}
            </p>
          </>
        );
        return item.href ? (
          <a
            key={item.org}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="row"
          >
            {inner}
          </a>
        ) : (
          <div key={item.org} className="row">
            {inner}
          </div>
        );
      })}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav current="about" />

      <main id="main" className="shell py-14 md:py-20">
        {/* A face and the mark. The traced chalk drawing is set large here -
            the one place on the site it is more than a 46px link target - and
            the photo is the only photograph anywhere on the site, which is
            about the right amount for a page that is otherwise all drawing. */}
        <div className="about-head">
          <Image
            src="/photo.jpeg"
            alt="Samit Mohan"
            width={400}
            height={400}
            className="about-photo"
            priority
          />
          <Mark name="sm" className="about-mark text-ink" />
        </div>

        <h1 className="sr-only">About Samit Mohan</h1>

        <div className="about-prose">
          {INTRO.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <section className="mt-14 border-t border-rule pt-10">
          <h2 className="section-title mb-6">Work</h2>
          <RoleList items={WORK} />
        </section>

        <section className="mt-12 border-t border-rule pt-10">
          <h2 className="section-title mb-6">Teaching &amp; Writing</h2>
          <RoleList items={TEACHING} />
        </section>

        <p className="mt-12 text-[15px] text-ink-2">
          The code is on{" "}
          <a
            href="https://github.com/samitmohan"
            target="_blank"
            rel="noopener noreferrer"
            className="about-link"
          >
            GitHub
          </a>
          , the writing is on <Link href="/blog" className="about-link">the blog</Link>, and
          the CV is{" "}
          <a href="/samit-resume.pdf" className="about-link">
            here
          </a>
          .
        </p>
      </main>

      <PublicFooter />
    </div>
  );
}
