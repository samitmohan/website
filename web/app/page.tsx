import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { RSS_ALTERNATE } from "@/lib/metadata";
import { SERIES, SERIES_TITLE } from "@/lib/series";
import { PublicNav, PublicFooter } from "@/components/public-nav";

export const metadata: Metadata = {
  alternates: { canonical: "/", types: RSS_ALTERNATE },
};

// Everything on this page comes from files in the repo, so it can only change
// when a deploy changes them. Revalidating on a timer re-renders pages that
// cannot have changed.
export const revalidate = false;

const HERO_LINKS: { label: string; href: string; external?: boolean }[] = [
  { label: "GitHub", href: "https://github.com/samitmohan", external: true },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/samit-mohan/",
    external: true,
  },
  { label: "Email", href: "mailto:samitmohan@gmail.com" },
  { label: "CV", href: "/samit-resume.pdf", external: true },
];

const PROJECTS = [
  {
    name: "mathLM",
    // Deliberately no benchmark number. A 40M model is not judged on absolute
    // GSM8K, and naming a benchmark without a figure reads as hiding one. The
    // honest result is the SFT -> GRPO delta on a held-out split.
    // TODO: measure that delta, then state it here as "GRPO lifted pass@1 from
    // X% to Y% over the SFT checkpoint".
    stack: "PyTorch",
    description:
      "40M-param GPT trained from scratch on math. Custom BPE, GQA + RoPE + SwiGLU, then SFT and GRPO reasoning RL. The whole pipeline, tokenizer through policy gradient.",
    url: "https://github.com/samitmohan/mathLM",
  },
  {
    name: "minitorch",
    stack: "NumPy · CuPy",
    description:
      "PyTorch in ~1500 lines. Reverse-mode autograd, conv2d, optimizers, LR schedulers. 96%+ on MNIST with the CNN, checked against numerical gradients.",
    url: "https://github.com/samitmohan/minitorch",
  },
  {
    name: "mini-code",
    stack: "Python",
    description:
      "Built to find out what is actually inside an agent loop. Turns out it is ~350 lines: tool calls, shell exec, streamed command output.",
    url: "https://github.com/samitmohan/minicode",
  },
  {
    name: "tennis-analysis",
    stack: "PyTorch · OpenCV",
    description:
      "YOLO + ResNet on match footage. Court keypoint regression, ball detection with interpolation, shot-event detection and speed estimation.",
    url: "https://github.com/samitmohan/tennis-analysis",
  },
];

// Beltech carries bullets because it is the current job and the reason anyone
// technical is on this page. The internships carry one line each. That
// asymmetry is the point: it mirrors what is worth reading.
const EXPERIENCE: RoleRow[] = [
  {
    company: "Beltech AI",
    role: "AI Scientist",
    period: "Jun 2025 - Present",
    bullets: [
      "Built and shipped **10+ detection modules** over live RTSP at **0.9+ F1** (LPR, helmet, seatbelt, side-view-mirror, make-model-colour, no-parking, wrong-way) into an estate of **60k+ cameras across 27+ cities**.",
      "Wrote a custom **NVIDIA DeepStream pipeline in C** keeping decode → detect → track fully on-GPU with **no CPU↔GPU copies**, scaling one server to **100+ cameras on a single GPU**.",
      "Cut detection latency **54% to ≤10 ms** on edge with NMS-free YOLOv10 on Triton/TensorRT at **0.90+ mAP** across 8 classes; an input-size sweep took weights to **1.2 MB** and inference to **30 ms/frame**.",
      "Rebuilt LPR end to end (YOLOv11s text detection + PARSeq ViT recognition, **TensorRT FP16** on edge): **150 ms → 40 ms** with higher read accuracy.",
      "Served a Triton deployment at **7000 fps / 20000 rps**, and a continuous-learning loop that ingests live misclassifications on a 2-week cadence, gates on **mAP50**, and hot-swaps models with **zero downtime**.",
      "Led the Bangalore on-ground deployment with a **3-person team**: picked junctions, routed streams, trained models, managed annotators. **20k+ violations/day across 6 junctions**.",
    ],
  },
  {
    company: "Genpact",
    role: "Data Science Intern",
    period: "Oct 2023 - Dec 2023",
    summary:
      "An **NLP resume screener** for data-team hiring and a **churn-prediction** POC, plus dashboards and ETL.",
  },
  {
    company: "MakeMyTrip",
    role: "Machine Learning Intern",
    period: "Aug 2022 - Oct 2022",
    summary:
      "Personalization API with **multi-armed bandits** (epsilon-greedy, Thompson, UCB) and an RLHF reward model for itinerary ranking.",
  },
  {
    company: "NHCE, VTU",
    role: "B.Tech Information Technology",
    period: "2020 - 2024",
    summary: "CGPA **9.4 / 10** · Founder, Coding Club NHCE.",
  },
];

const TEACHING: RoleRow[] = [
  {
    company: "aiengg.dev",
    role: "AI Cohort TA",
    period: "Dec 2025 - May 2026",
    href: "https://aiengg.dev/",
    summary:
      "TA'd a 16-week AI engineering cohort for **200+ engineers**: RAG, agents, fine-tuning, inference. Ran weekly classes, wrote assignments, built the syllabus.",
  },
  {
    company: "TensorTonic",
    role: "Contributor",
    period: "Past",
    href: "https://www.tensortonic.com/ml-math",
    summary:
      "**300+** implementation and system-design problems on a platform serving **40k+ users**.",
  },
  {
    company: "InterviewReady",
    role: "Technical Writer",
    period: "Past",
    summary:
      "Restructured course content for **10k+ subscribers**; technical posts reaching **20,000+ readers**.",
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
  summary?: string;
  bullets?: string[];
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
            {item.summary ? (
              <p className="mt-1.5 max-w-3xl text-pretty text-[15px] leading-[155%] text-ink-2">
                {emphasize(item.summary)}
              </p>
            ) : null}
            {item.bullets ? (
              <ul className="role-bullets mt-2.5 max-w-3xl">
                {item.bullets.map((b, i) => (
                  <li key={i}>{emphasize(b)}</li>
                ))}
              </ul>
            ) : null}
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

function SectionHead({
  title,
  href,
  external,
  label = "View all",
}: {
  title: string;
  href: string;
  external?: boolean;
  label?: string;
}) {
  const arrow = (
    <span
      aria-hidden
      className="ml-1.5 inline-block transition-transform duration-200 group-hover:translate-x-1"
    >
      →
    </span>
  );
  const cls =
    "label group -my-3 inline-flex min-h-[44px] items-center py-3 transition-colors duration-200 hover:text-brand";

  return (
    <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
      <h2 className="section-title">{title}</h2>
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
          {label}
          {arrow}
        </a>
      ) : (
        <Link href={href} className={cls}>
          {label}
          {arrow}
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const allPosts = getAllPosts();
  // Four on the homepage, not the full eight. Eight rows ran taller than a
  // viewport and duplicated /blog, which the "View all" link sits next to.
  const ladder = (
    SERIES.map(({ slug, gloss }) => {
      const post = allPosts.find((p) => p.slug === slug);
      return post ? { post, gloss } : null;
    }).filter(Boolean) as { post: (typeof allPosts)[number]; gloss: string }[]
  ).slice(0, 4);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav current="home" />

      <main id="main">
        {/* Hero */}
        <section className="shell py-12 md:py-16">
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
              <h1 className="display text-[26px] text-ink md:text-[34px]">
                Samit Mohan
              </h1>
              {/* Two sentences. An earlier version front-loaded the inference
                  numbers here, which turned the hero into a stat sheet and said
                  the same things the Experience bullets say one screen down with
                  full context. The hero introduces; Experience argues. */}
              <p className="mt-7 max-w-xl text-pretty text-[17px] leading-[155%] text-ink-2">
                AI Scientist at{" "}
                <a
                  href="https://beltech.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline decoration-rule-strong underline-offset-4 transition-colors hover:text-brand hover:decoration-brand"
                >
                  Beltech AI
                </a>{" "}
                in Bangalore. I rebuild ML from scratch and{" "}
                <Link
                  href="/blog"
                  className="text-ink underline decoration-rule-strong underline-offset-4 transition-colors hover:text-brand hover:decoration-brand"
                >
                  write about it
                </Link>
                .
              </p>
              {/* Was four ghost pills. A 999px radius with a lip shadow is
                  consumer-app furniture on a page built from hairline rows. */}
              <div className="hero-links mt-5">
                {HERO_LINKS.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    {...(l.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="hero-link"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Experience sits directly under the hero. It used to be fourth, under
            the blog ladder and the project grid, which put the hardest and most
            verifiable work below two screens of scrolling. */}
        <section className="reveal border-t border-rule">
          <div className="shell py-10">
            <h2 className="section-title mb-6">Experience</h2>
            <RoleRows items={EXPERIENCE} />
          </div>
        </section>

        {/* Projects */}
        <section className="reveal border-t border-rule">
          <div className="shell py-10">
            <SectionHead
              title="Projects"
              href="https://github.com/samitmohan"
              external
            />
            {/* Rows, not cards. Four rounded cards in a 2x2 grid was the one
                place this page ran a second visual system, and it was the more
                generic of the two. The repo name sits where a company name sits
                in Experience and the stack sits where the date does, so
                Projects and Experience now scan as one list. */}
            <div className="rows">
              {PROJECTS.map((p) => (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="row"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="flex items-baseline gap-2 font-mono text-[15px] font-medium">
                      <span className="row-title text-ink">{p.name}</span>
                      <span
                        aria-hidden
                        className="out-arrow text-[11px] text-ink-4 transition-colors duration-200"
                      >
                        ↗
                      </span>
                    </h3>
                    <span className="meta shrink-0">{p.stack}</span>
                  </div>
                  <p className="mt-1.5 max-w-3xl text-pretty text-[15px] leading-[155%] text-ink-2">
                    {p.description}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Writing. Titled by subject rather than by method: "From Scratch"
            described how the posts are written, not what they are about, so a
            reader scanning headings for LLM work saw nothing. */}
        <section className="reveal border-t border-rule">
          <div className="shell py-10">
            <SectionHead title={SERIES_TITLE} href="/blog" />
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
                    <span className="meta hidden shrink-0 sm:block">
                      {post.readingTime} min
                    </span>
                    <span
                      aria-hidden
                      className="row-arrow hidden shrink-0 text-[13px] text-brand sm:block"
                    >
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Teaching */}
        <section className="reveal border-t border-rule">
          <div className="shell py-10 pb-16">
            <h2 className="section-title mb-6">Teaching &amp; Writing</h2>
            <RoleRows items={TEACHING} />
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
