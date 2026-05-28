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
    stack: "CV infra startup · PyTorch · YOLO · PARSeq · Triton · TensorRT · FastAPI · Kubernetes · Docker",
    bullets: [
      "Designed and deployed an end-to-end vision system processing live RTSP streams across 10+ detection modules (LPR, phone, helmet, wrong-way, PUCC) at 0.9+ F1 on Indian CCTV infrastructure.",
      "Cut inference latency by 54% to ≤10 ms on edge by replacing anchor-based detection with NMS-free YOLOv10 and tuning Triton / TensorRT serving. Sustained 0.90+ mAP across 8 classes.",
      "Rebuilt the license-plate pipeline: swapped the CRAFT text detector for YOLOv11s and the BiLSTM recognizer for a PARSeq ViT, then exported to TensorRT FP16 for edge. Dropped latency from 150 ms to 40 ms (~100 MB GPU per 100 images) while raising read accuracy.",
      "Built a PUCC pollution-certificate module as a FastAPI service: YOLO confirms the emission probe is inserted in the vehicle, LPR reads the plate, and the detected testing-center name is validated against the government registry of authorized centers.",
      "Built a continuous-learning pipeline that ingests live misclassifications on a 2-week cadence, retrains, validates via mAP50 quality gate, and hot-swaps on Triton with zero downtime.",
      "Shipped vehicle-attribute microservices (color, type) at 0.92+ Macro-F1 with Grafana monitoring, structured logging, and A/B testing for rollouts.",
      "Owned managed deployment of 10 real-time models across T4 GPUs: scheduling which model runs on which card and autoscaling pods to prevent OOM and crashes under load.",
      "Automated agent-driven research to find the optimal image size per model, cutting weights to 1.2 MB and inference to 30 ms/frame across all production models.",
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
      "NLP-based resume screening using text similarity and keyword extraction for Data team hiring.",
    ],
  },
];

const TEACHING = [
  {
    company: "InterviewReady",
    role: "Teaching Assistant",
    period: "Dec 2025 — May 2026",
    stack: "Python · PyTorch · LLMs",
    bullets: [
      "Designed and taught an AI engineering curriculum for 200+ engineers in a live cohort. Restructured content for 10k+ subscribers; technical posts reached 20k+ readers.",
    ],
  },
  {
    company: "ML Interview Practice",
    role: "Side project",
    period: "Ongoing",
    stack: "Python · PyTorch · Markdown",
    href: "/problems",
    bullets: [
      "200+ implementation problems on gradients, optimizers, attention, and ML systems. Paired with the AI engineering cohort so each module has matching problems.",
    ],
  },
];

const STACK = [
  {
    label: "ML / DL",
    items: ["PyTorch", "NumPy", "ONNX", "YOLO", "CNNs", "Transformers", "LLMs", "RAG", "Embeddings", "Reranking", "LoRA", "QLoRA", "PEFT", "MCP", "Function calling", "HuggingFace", "OpenCV", "CUDA", "Quantization", "Scikit-learn"],
  },
  {
    label: "Infra",
    items: ["Triton Inference Server", "TensorRT", "vLLM", "SGLang", "MetaFlow", "MLflow", "Docker", "Kubernetes", "Grafana", "CI/CD"],
  },
  {
    label: "Tools",
    items: ["Python", "C/C++", "SQL", "FastAPI", "gRPC", "Redis", "FAISS", "Linux", "Git"],
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav />

      <main className="max-w-3xl mx-auto px-6">
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
                  Innately passionate about intelligent systems, understanding
                  them, implementing them and writing about them.
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
        <section className="py-10">
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
                      className="text-[14px] text-foreground/80 leading-relaxed flex gap-3"
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
        <section className="py-10">
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
                        className="text-[14px] text-foreground/80 leading-relaxed flex gap-3"
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
        <section className="py-10">
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
              <li className="text-[14px] text-foreground/80 leading-relaxed flex gap-3">
                <span className="text-muted-foreground/40 shrink-0">·</span>
                <span>Founder, Coding Club NHCE.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Stack */}
        <section className="py-10 pb-16">
          <h2 className="text-[13px] font-mono uppercase tracking-wider text-muted-foreground mb-6">
            Stack
          </h2>
          <div className="space-y-4">
            {STACK.map((s) => (
              <div
                key={s.label}
                className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6"
              >
                <div className="text-[12px] font-mono text-muted-foreground/70 md:w-[140px] md:shrink-0">
                  {s.label}
                </div>
                <p className="text-[14px] text-foreground/80 leading-relaxed flex-1">
                  {s.items.join(", ")}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
