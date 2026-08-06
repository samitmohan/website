import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { PublicNav, PublicFooter } from "@/components/public-nav";
import { RevealOnScroll } from "@/components/reveal";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export const revalidate = 30;

// Ordered from-scratch ladder. Each rung assumes the last.
const CURRICULUM: { slug: string; gloss: string }[] = [
  { slug: "math", gloss: "gradients and the chain rule, from scratch" },
  { slug: "nn", gloss: "a digit classifier in pure NumPy" },
  { slug: "torch", gloss: "tensors and autograd, then the same net in PyTorch" },
  { slug: "minitorch", gloss: "a working framework in ~1300 lines" },
  { slug: "attention-residuals", gloss: "why attention and residual streams work" },
  { slug: "microgpt", gloss: "a GPT built and trained end to end" },
  { slug: "how-chatgpt-works", gloss: "the full pipeline: data, alignment, inference" },
  { slug: "inference", gloss: "the KV cache, batching, what makes tokens fast" },
];

const PROJECTS = [
  {
    name: "mathLM",
    description:
      "40M GPT trained from scratch on math. Custom BPE, GQA + RoPE + SwiGLU, sparse MoE, SFT + GRPO reasoning RL. Evaluated on GSM8K.",
    url: "https://github.com/samitmohan/mathLM",
  },
  {
    name: "minitorch",
    description:
      "PyTorch in ~1300 lines. Reverse-mode autograd, conv2d, optimizers, LR schedulers. 96%+ on MNIST.",
    url: "https://github.com/samitmohan/minitorch",
  },
  {
    name: "mini-code",
    description:
      "Built to figure out what's actually inside an agent loop. Turns out it's 250 lines: tool calls, shell exec, streaming.",
    url: "https://github.com/samitmohan/minicode",
  },
  {
    name: "tennis-analysis",
    description:
      "YOLO + ResNet on match footage. Court detection, ball tracking, shot classification. Tested on Wimbledon clips.",
    url: "https://github.com/samitmohan/tennis-analysis",
  },
];

const EXPERIENCE = [
  {
    company: "Beltech AI",
    role: "AI Scientist",
    period: "Jun 2025 - Present",
    summary:
      "City-traffic computer vision on live CCTV: **≤10ms** inference, **0.9+ F1** in production, **100+ cameras** per server.",
  },
  {
    company: "Genpact",
    role: "Data Science Intern",
    period: "Oct 2023 - Dec 2023",
    summary:
      "Built an **NLP resume screener** for data-team hiring and a **churn-prediction model** (POC), plus dashboards and ETL. **Alteryx certified**.",
  },
  {
    company: "MakeMyTrip",
    role: "Machine Learning Intern",
    period: "Aug 2022 - Oct 2022",
    summary:
      "Personalization API with multi-armed bandits and an RLHF reward model for itinerary ranking.",
  },
];

const TEACHING = [
  {
    company: "aiengg.dev",
    role: "AI Cohort TA",
    period: "Dec 2025 - May 2026",
    href: "https://aiengg.dev/",
    summary:
      "TA'd a 16-week AI engineering cohort for **200+ engineers**: RAG, agents, fine-tuning, inference.",
  },
  {
    company: "TensorTonic",
    role: "Contributor",
    period: "Ongoing",
    href: "https://www.tensortonic.com/ml-math",
    summary:
      "**300+** implementation and system-design problems; the platform serves **40k+ users**.",
  },
];

// Renders **text** segments as bold foreground spans
function emphasize(text: string) {
  return text.split("**").map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-medium text-ink">
        {part}
      </strong>
    ) : (
      part
    )
  );
}

type RoleRow = {
  company: string;
  role: string;
  period: string;
  href?: string;
  summary: string;
};

function RoleRows({ items }: { items: RoleRow[] }) {
  return (
    <div className="rows">
      {items.map((item) => {
        const inner = (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="text-[16px] text-ink">
                <span className="row-title font-medium">{item.company}</span>
                <span className="text-ink-2"> ・{item.role}</span>
              </h3>
              <span className="meta shrink-0">{item.period}</span>
            </div>
            <p className="mt-1.5 max-w-3xl text-pretty text-[15px] leading-[155%] text-ink-2">
              {emphasize(item.summary)}
            </p>
          </>
        );

        return item.href ? (
          <a
            key={`${item.company}-${item.period}`}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="row"
          >
            {inner}
          </a>
        ) : (
          <div key={`${item.company}-${item.period}`} className="row">
            {inner}
          </div>
        );
      })}
    </div>
  );
}

export default async function HomePage() {
  const allPosts = getAllPosts();
  const ladder = CURRICULUM.map(({ slug, gloss }) => {
    const post = allPosts.find((p) => p.slug === slug);
    return post ? { post, gloss } : null;
  }).filter(Boolean) as { post: (typeof allPosts)[number]; gloss: string }[];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <RevealOnScroll />
      <PublicNav />

      <main id="main">
        {/* Hero */}
        <section className="shell py-16 md:py-24">
          <div className="flex flex-col items-start gap-8 sm:flex-row sm:gap-10">
            <div className="min-w-0 shrink-0">
              <Image
                src="/photo.jpeg"
                alt="Samit Mohan"
                width={400}
                height={400}
                className="h-[88px] w-[88px] rounded-[16px] object-cover sm:h-[132px] sm:w-[132px]"
                priority
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="display text-[52px] text-ink md:text-[88px]">
                Samit Mohan
              </h1>
              <p className="mt-7 max-w-xl text-pretty text-[17px] leading-[155%] text-ink-2">
                I&apos;m an AI Scientist at{" "}
                <a
                  href="https://beltech.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline decoration-brand/40 underline-offset-4 transition-colors hover:text-orange hover:decoration-orange"
                >
                  Beltech AI
                </a>{" "}
                in Bangalore, building computer-vision systems for city traffic:
                live CCTV, ≤10ms inference, 0.9+ F1 in production. In my free
                time I rebuild ML from scratch and write{" "}
                <Link
                  href="/blog"
                  className="text-ink underline decoration-brand/40 underline-offset-4 transition-colors hover:text-orange hover:decoration-orange"
                >
                  engineering blogs
                </Link>
                .
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-2">
                <a
                  href="https://github.com/samitmohan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill pill-ghost"
                >
                  GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/samit-mohan/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill pill-ghost"
                >
                  LinkedIn
                </a>
                <a
                  href="mailto:samitmohan@gmail.com"
                  className="pill pill-ghost"
                >
                  Email
                </a>
                <a href="#" className="pill pill-ghost">
                  CV
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Posts - from-scratch ladder */}
        <section className="reveal border-t border-rule">
          <div className="shell py-14">
          <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="section-title">From Scratch</h2>
            <Link
              href="/blog"
              className="label group transition-colors duration-200 hover:text-orange"
            >
              View all
              <span
                aria-hidden
                className="ml-1.5 inline-block transition-transform duration-200 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>
          <div className="rows">
            {ladder.map(({ post, gloss }, i) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="row">
                <div className="flex items-baseline gap-4">
                  <span className="row-index w-6 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="min-w-0 flex-1 text-[16px] leading-relaxed">
                    <span className="row-title text-ink">{post.title}</span>
                    <span className="text-ink-2"> - {gloss}</span>
                  </p>
                  <span
                    aria-hidden
                    className="row-arrow hidden shrink-0 text-[13px] text-orange sm:block"
                  >
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
          </div>
        </section>

        {/* Projects */}
        <section className="reveal border-t border-rule">
          <div className="shell py-14">
          <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="section-title">Projects</h2>
            <a
              href="https://github.com/samitmohan"
              target="_blank"
              rel="noopener noreferrer"
              className="label group transition-colors duration-200 hover:text-orange"
            >
              View all
              <span
                aria-hidden
                className="ml-1.5 inline-block transition-transform duration-200 group-hover:translate-x-1"
              >
                →
              </span>
            </a>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {PROJECTS.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card-surface group flex flex-col p-5"
              >
                <div className="mb-2.5 flex items-center gap-2">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden
                    className="h-4 w-4 shrink-0 text-ink-3"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.34 9.34 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.95.68 1.92 0 1.39-.01 2.51-.01 2.85 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
                  </svg>
                  <span className="font-mono text-[14px] font-medium text-ink transition-colors group-hover:text-orange">
                    {p.name}
                  </span>
                  <span
                    aria-hidden
                    className="out-arrow ml-auto scale-90 text-[12px] text-ink-4 transition-[color,transform] duration-200 group-hover:scale-100"
                  >
                    ↗
                  </span>
                </div>
                <p className="text-pretty text-[14px] leading-[155%] text-ink-2">
                  {p.description}
                </p>
              </a>
            ))}
          </div>
          </div>
        </section>

        {/* Experience */}
        <section className="reveal border-t border-rule">
          <div className="shell py-14">
            <h2 className="section-title mb-8">Experience</h2>
            <RoleRows items={EXPERIENCE} />
          </div>
        </section>

        {/* Teaching */}
        <section className="reveal border-t border-rule">
          <div className="shell py-14">
            <h2 className="section-title mb-8">Teaching &amp; Writing</h2>
            <RoleRows items={TEACHING} />
          </div>
        </section>

        {/* Education */}
        <section className="reveal border-t border-rule">
          <div className="shell py-14 pb-20">
            <h2 className="section-title mb-8">Education</h2>
            <RoleRows
              items={[
                {
                  company: "NHCE, VTU",
                  role: "B.Tech Information Technology",
                  period: "2020 - 2024",
                  summary: "CGPA **9.4 / 10** · Founder, Coding Club NHCE.",
                },
              ]}
            />
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
