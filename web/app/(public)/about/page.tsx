import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav, PublicFooter } from "@/components/public-nav";

export const metadata: Metadata = {
  title: "About — Samit Mohan",
  description:
    "ML engineer working on computer-vision systems for city infrastructure. Background, work, education, and what I build with.",
};

const EXPERIENCE = [
  {
    company: "Beltech AI",
    role: "Computer Vision Engineer",
    period: "Jun 2025 — Present",
    location: "Bangalore",
    stack: "PyTorch · YOLO · PARSeq · DeepStream · Triton · TensorRT · FastAPI · Kubernetes · Docker",
    bullets: [
      "Shipped a 10+ module CV system (LPR, PUCC, helmet, phone, wrong-way) over live RTSP at 0.9+ F1 on Indian CCTV.",
      "Wrote a custom-C DeepStream pipeline that keeps decode → detect → track on-GPU, removing CPU↔GPU copies. Scaled per-server capacity to 100+ cameras on multi-GPU.",
      "Cut detection latency 54% to ≤10 ms by replacing anchor-based heads with NMS-free YOLOv10 on Triton + TensorRT. 0.90+ mAP across 8 classes.",
      "PUCC pollution-certificate FastAPI service: YOLO verifies probe insertion, LPR reads the plate, OCR'd testing-center name validated against the government registry.",
      "Rebuilt LPR end-to-end: YOLOv11s for text detection, PARSeq ViT for recognition, TensorRT FP16 on edge. 150 ms → 40 ms with higher read accuracy.",
      "Continuous-learning loop on a 2-week cadence: live misclassifications → retrain → mAP50 gate → hot-swap on Triton with zero downtime.",
      "Vehicle-attribute microservices (color, type) at 0.92+ Macro-F1 with Grafana SLOs and A/B rollout.",
      "Owned T4 fleet scheduling for 10 production models: per-card placement and pod autoscaling to prevent OOM under load.",
      "Agent-driven sweep on input size per model: cut weights to 1.2 MB and inference to 30 ms/frame across all prod models.",
    ],
  },
  {
    company: "MakeMyTrip",
    role: "Machine Learning Intern",
    period: "Aug — Oct 2022",
    location: "Gurgaon",
    stack: "Scala · Redis · MySQL · Kafka · AWS",
    bullets: [
      "Personalization API using multi-armed bandits (ε-greedy, Thompson Sampling, UCB) for homepage engagement. Benchmarked variants and shipped the best to production.",
      "Trained an RLHF reward model on annotated user-preference data to rank itinerary recommendations; integrated into the bandit policy for online A/B.",
      "NLP-based resume screening using text similarity and keyword extraction for the Data team's hiring pipeline.",
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
      "TA'd a 16-week live AI engineering cohort: ran weekly classes on RAG, agents, fine-tuning, and inference for 200+ engineers. Designed assignments, debugged student projects, took office hours.",
      "Parent platform: InterviewReady. Restructured content for 10k+ subscribers; technical posts reached 20k+ readers.",
    ],
  },
  {
    company: "TensorTonic",
    role: "Contributor",
    period: "Ongoing",
    stack: "Python · PyTorch · ML systems",
    href: "https://www.tensortonic.com/ml-math",
    bullets: [
      "Contributed 300+ implementation problems, ML system-design problems, interactive quizzes, paper-implementation questions, and the study plan for pro users. Platform serves 40k+ users.",
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav />

      <main id="main" className="max-w-3xl mx-auto px-6">
        {/* Hero */}
        <section className="py-12 md:py-16">
          <div>
            <div className="pt-1">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-2 leading-[1.1]">
                About
              </h1>
              <p className="text-[12px] font-mono text-muted-foreground/70 mb-5">
                Bangalore · B.Tech IT, VTU &apos;24 (CGPA 9.4)
              </p>
              <div className="space-y-3 max-w-2xl text-[15px] text-foreground/80 leading-relaxed">
                <p>
                  I&apos;m an ML engineer working on computer-vision systems for
                  city infrastructure at{" "}
                  <a
                    href="https://beltech.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline underline-offset-2"
                  >
                    Beltech AI
                  </a>
                  .
                </p>
                <p>
                  Reach me at{" "}
                  <a
                    href="mailto:samitmohan@gmail.com"
                    className="text-primary hover:underline underline-offset-2"
                  >
                    samitmohan@gmail.com
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Experience */}
        <section className="py-12">
          <h2 className="text-[13px] font-mono uppercase tracking-wider text-muted-foreground mb-6">
            Experience
          </h2>
          <div className="space-y-9">
            {EXPERIENCE.map((job) => (
              <div key={`${job.company}-${job.period}`}>
                <div className="flex items-baseline justify-between mb-1 flex-wrap gap-x-4">
                  <h3 className="text-[15px] font-medium text-foreground">
                    {job.company}
                    <span className="text-muted-foreground font-normal">
                      , {job.role.toLowerCase()}
                    </span>
                  </h3>
                  <span className="text-[12px] font-mono text-muted-foreground/60 shrink-0">
                    {job.period}
                  </span>
                </div>
                <p className="text-[12px] font-mono text-muted-foreground/60 mb-3">
                  {job.stack} · {job.location}
                </p>
                <ul className="space-y-1.5">
                  {job.bullets.map((b) => (
                    <li
                      key={b}
                      className="text-[15px] text-foreground/80 leading-relaxed flex gap-3"
                    >
                      <span className="text-muted-foreground/40 shrink-0">·</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Teaching */}
        <section className="py-12">
          <h2 className="text-[13px] font-mono uppercase tracking-wider text-muted-foreground mb-6">
            Teaching &amp; Writing
          </h2>
          <div className="space-y-9">
            {TEACHING.map((job) => {
              const titleNode = (
                <>
                  {job.company}
                  <span className="text-muted-foreground font-normal">
                    , {job.role.toLowerCase()}
                  </span>
                </>
              );
              return (
                <div key={`${job.company}-${job.period}`}>
                  <div className="flex items-baseline justify-between mb-1 flex-wrap gap-x-4">
                    <h3 className="text-[15px] font-medium text-foreground">
                      {"href" in job && job.href ? (
                        <Link
                          href={job.href}
                          className="hover:text-primary hover:underline underline-offset-2"
                        >
                          {titleNode}
                        </Link>
                      ) : (
                        titleNode
                      )}
                    </h3>
                    <span className="text-[12px] font-mono text-muted-foreground/60 shrink-0">
                      {job.period}
                    </span>
                  </div>
                  <p className="text-[12px] font-mono text-muted-foreground/60 mb-3">
                    {job.stack}
                  </p>
                  <ul className="space-y-1.5">
                    {job.bullets.map((b) => (
                      <li
                        key={b}
                        className="text-[15px] text-foreground/80 leading-relaxed flex gap-3"
                      >
                        <span className="text-muted-foreground/40 shrink-0">·</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Education */}
        <section className="py-12 pb-20">
          <h2 className="text-[13px] font-mono uppercase tracking-wider text-muted-foreground mb-6">
            Education
          </h2>
          <div>
            <div className="flex items-baseline justify-between mb-1 flex-wrap gap-x-4">
              <h3 className="text-[15px] font-medium text-foreground">
                NHCE, VTU
                <span className="text-muted-foreground font-normal">
                  , b.tech information technology
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
              <li className="text-[15px] text-foreground/80 leading-relaxed flex gap-3">
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
