import Image from "next/image";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { PublicFooter } from "@/components/public-nav";

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
    period: "Jun 2025 — Present",
    location: "Bangalore",
    stack: "PyTorch · YOLO · PARSeq · Triton · TensorRT · FastAPI · Kubernetes · Docker",
    bullets: [
      "Shipped a 10+ module CV system (LPR, PUCC, helmet, phone, wrong-way) over live RTSP at **0.9+ F1** on Indian CCTV.",
      "Led the Bangalore on-ground demo end to end with a 2-person team: picked junctions, set up and routed cameras, trained models, built the pipeline, and managed annotators. Integrated a DeepStream pipeline in C that keeps decode → detect → track on-GPU, removing CPU↔GPU copies. Captured **20k+ violations/day across 6 junctions**, scaling to **100+ cameras** per server on multi-GPU.",
      "Cut detection latency **54% to ≤10 ms** by replacing anchor-based heads with NMS-free YOLOv10 on Triton + TensorRT. 0.90+ mAP across 8 classes.",
      "Rebuilt LPR end-to-end: YOLOv11s for text detection, PARSeq ViT for recognition, TensorRT FP16 on edge. **150 ms → 40 ms** with higher read accuracy.",
      "Continuous-learning loop on a 2-week cadence: live misclassifications → retrain → mAP50 gate → hot-swap on Triton with **zero downtime**.",
      "Owned T4 fleet scheduling for **10 production models**: per-card placement and pod autoscaling to prevent OOM under load.",
    ],
  },
  {
    company: "MakeMyTrip",
    role: "Machine Learning Intern",
    period: "Aug 2022 — Oct 2022",
    location: "Gurgaon",
    stack: "Scala · Redis · MySQL · Kafka · AWS",
    bullets: [
      "Built a personalization API with multi-armed bandits (ε-greedy, Thompson Sampling, UCB), an RLHF reward model for itinerary ranking, and NLP resume screening for the Data team.",
    ],
  },
];

const TEACHING = [
  {
    company: "aiengg.dev",
    role: "AI Cohort TA",
    period: "Dec 2025 — May 2026",
    stack: "Python · PyTorch · LLMs · RAG · Agents",
    href: "https://aiengg.dev/",
    bullets: [
      "TA'd a 16-week live AI engineering cohort for **200+ engineers**: weekly classes on RAG, agents, fine-tuning, and inference. Designed the syllabus and assignments, ran doubt sessions.",
      "InterviewReady: restructured content for 10k+ subscribers; technical posts reached **20k+ readers**.",
    ],
  },
  {
    company: "TensorTonic",
    role: "Contributor",
    period: "Ongoing",
    stack: "Python · PyTorch · ML systems",
    href: "https://www.tensortonic.com/ml-math",
    bullets: [
      "Contributed **300+ implementation and system-design problems**, quizzes, and paper-implementation questions, plus the pro study plan. Platform serves **40k+ users**.",
    ],
  },
];

// Renders **text** segments in bullet strings as bold foreground spans
function emphasize(text: string) {
  return text.split("**").map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-foreground">
        {part}
      </strong>
    ) : (
      part
    )
  );
}

export default async function HomePage() {
  const allPosts = getAllPosts();
  const ladder = CURRICULUM
    .map(({ slug, gloss }) => {
      const post = allPosts.find((p) => p.slug === slug);
      return post ? { post, gloss } : null;
    })
    .filter(Boolean) as { post: (typeof allPosts)[number]; gloss: string }[];
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main id="main" className="max-w-3xl mx-auto px-6">
        {/* Hero */}
        <section className="py-12 md:py-16">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div className="shrink-0">
              <Image
                src="/photo.jpeg"
                alt="Samit Mohan"
                width={240}
                height={240}
                className="rounded-md object-cover w-[88px] h-[88px] sm:w-[120px] sm:h-[120px]"
                priority
              />
            </div>
            <div className="flex-1 pt-1">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-2 leading-[1.1]">
                Samit Mohan
              </h1>
              <p className="text-[16px] text-foreground/80 max-w-xl leading-relaxed">
                Hello! I&apos;m an AI Scientist at{" "}
                <a
                  href="https://beltech.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  Beltech AI
                </a>{" "}
                in Bangalore, building computer-vision systems for city traffic:
                live CCTV, ≤10ms inference, 0.9+ F1 in production. In my free time
                I rebuild ML from scratch and write{" "}
                <Link
                  href="/blog"
                  className="text-primary underline underline-offset-2"
                >
                  engineering blogs
                </Link>
                .
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px]">
                <a
                  href="https://github.com/samitmohan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline underline-offset-2"
                >
                  GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/samit-mohan/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline underline-offset-2"
                >
                  LinkedIn
                </a>
                <a
                  href="mailto:samitmohan@gmail.com"
                  className="text-primary hover:underline underline-offset-2"
                >
                  Email
                </a>
                {/* TODO: replace href with the CV link Samit provides */}
                <a
                  href="#"
                  className="text-primary hover:underline underline-offset-2"
                >
                  CV
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Posts — from-scratch ladder */}
        <section className="border-t border-border py-16">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-[18px] font-semibold tracking-tight text-foreground">
              Posts
            </h2>
            <Link
              href="/blog"
              className="text-[13px] text-muted-foreground hover:text-foreground"
            >
              all posts →
            </Link>
          </div>
          <ol className="space-y-3">
            {ladder.map(({ post, gloss }, i) => (
              <li
                key={post.slug}
                className="text-[16px] leading-relaxed flex gap-4 items-baseline"
              >
                <span className="font-mono text-[12px] text-muted-foreground/50 w-6 shrink-0 pt-0.5 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-foreground/80 hover:text-primary hover:underline underline-offset-2"
                  >
                    {post.title}
                  </Link>
                  <span className="text-muted-foreground"> — {gloss}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Projects */}
        <section className="border-t border-border py-16">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="text-[18px] font-semibold tracking-tight text-foreground">
              Projects
            </h2>
            <a
              href="https://github.com/samitmohan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-muted-foreground hover:text-foreground"
            >
              github →
            </a>
          </div>
          <ul className="space-y-3">
            {PROJECTS.map((p) => (
              <li key={p.name} className="text-[16px] leading-relaxed">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-foreground hover:text-primary hover:underline underline-offset-2"
                >
                  {p.name}
                  <span aria-hidden className="text-muted-foreground/50 text-[12px] ml-1 align-baseline">
                    ↗
                  </span>
                </a>
                <span className="text-muted-foreground"> — {p.description}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Experience */}
        <section className="border-t border-border py-16">
          <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-6">
            Experience
          </h2>
          <div className="space-y-10">
            {EXPERIENCE.map((job) => (
              <div key={`${job.company}-${job.period}`}>
                <div className="flex items-baseline justify-between mb-1 flex-wrap gap-x-4">
                  <h3 className="text-[16px] font-medium text-foreground">
                    {job.company}
                    <span className="text-muted-foreground font-normal">
                      , {job.role}
                    </span>
                  </h3>
                  <span className="text-[12px] font-mono text-muted-foreground/60 shrink-0">
                    {job.period}
                  </span>
                </div>
                <p className="text-[12px] font-mono text-muted-foreground/60 mb-3">
                  {job.stack} · {job.location}
                </p>
                <ul className="space-y-2.5">
                  {job.bullets.map((b) => (
                    <li
                      key={b}
                      className="text-[16px] text-foreground/80 leading-relaxed flex gap-3"
                    >
                      <span className="text-muted-foreground/40 shrink-0">·</span>
                      <span>{emphasize(b)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Teaching */}
        <section className="border-t border-border py-16">
          <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-6">
            Teaching &amp; Writing
          </h2>
          <div className="space-y-10">
            {TEACHING.map((job) => (
              <div key={`${job.company}-${job.period}`}>
                <div className="flex items-baseline justify-between mb-1 flex-wrap gap-x-4">
                  <h3 className="text-[16px] font-medium text-foreground">
                    <Link
                      href={job.href}
                      className="hover:text-primary hover:underline underline-offset-2"
                    >
                      {job.company}
                      <span className="text-muted-foreground font-normal">
                        , {job.role}
                      </span>
                    </Link>
                  </h3>
                  <span className="text-[12px] font-mono text-muted-foreground/60 shrink-0">
                    {job.period}
                  </span>
                </div>
                <p className="text-[12px] font-mono text-muted-foreground/60 mb-3">
                  {job.stack}
                </p>
                <ul className="space-y-2.5">
                  {job.bullets.map((b) => (
                    <li
                      key={b}
                      className="text-[16px] text-foreground/80 leading-relaxed flex gap-3"
                    >
                      <span className="text-muted-foreground/40 shrink-0">·</span>
                      <span>{emphasize(b)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section className="border-t border-border py-16 pb-24">
          <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-6">
            Education
          </h2>
          <div>
            <div className="flex items-baseline justify-between mb-1 flex-wrap gap-x-4">
              <h3 className="text-[16px] font-medium text-foreground">
                NHCE, VTU
                <span className="text-muted-foreground font-normal">
                  , B.Tech Information Technology
                </span>
              </h3>
              <span className="text-[12px] font-mono text-muted-foreground/60 shrink-0">
                2020 — 2024
              </span>
            </div>
            <p className="text-[12px] font-mono text-muted-foreground/60 mb-3">
              CGPA 9.4 / 10 · Bangalore
            </p>
            <ul className="space-y-1.5">
              <li className="text-[16px] text-foreground/80 leading-relaxed flex gap-3">
                <span className="text-muted-foreground/40 shrink-0">·</span>
                <span>Founder, Coding Club NHCE.</span>
              </li>
            </ul>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
