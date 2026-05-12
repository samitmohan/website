import Image from "next/image";
import Link from "next/link";
import { courses } from "@/config/courses";
import { getAllPosts, formatPostDate } from "@/lib/blog";
import { PROBLEMS } from "@/config/problems";
import { PublicNav, PublicFooter } from "@/components/public-nav";

const FEATURED_SLUGS = ["minitorch", "how-chatgpt-works", "inference"];

const PROJECTS = [
  {
    name: "mathLM",
    description:
      "GPT with GQA, RoPE, Sparse MoE, SwiGLU, KV cache. SFT on OpenWebMath. Started from Karpathy's nanoGPT, then went deeper.",
    url: "https://github.com/samitmohan/mathLM",
    tags: ["GPT", "SFT"],
  },
  {
    name: "minitorch",
    description:
      "Wanted to understand PyTorch, so built it. Reverse-mode autograd, conv2d, optimizers. MNIST in ~1300 lines.",
    url: "https://github.com/samitmohan/minitorch",
    tags: ["Python", "Autograd"],
  },
  {
    name: "mini-code",
    description:
      "Claude Code clone, no libraries. File read/edit, shell exec, multi-turn agent loop, streaming. ~500 lines.",
    url: "https://github.com/samitmohan/minicode",
    tags: ["Agents", "LLMs"],
  },
  {
    name: "tennis-analysis",
    description:
      "YOLO + ResNet on match footage with physics. Court detection, ball tracking, shot classification. Tested on Wimbledon footage. I love tennis.",
    url: "https://github.com/samitmohan/tennis-analysis",
    tags: ["YOLO", "CV"],
  },
];

export default function HomePage() {
  const activeCourse = courses.find((c) => c.status === "active");
  const allPosts = getAllPosts();
  const featuredPosts = FEATURED_SLUGS
    .map((slug) => allPosts.find((p) => p.slug === slug))
    .filter(Boolean) as typeof allPosts;

  const codingCount = PROBLEMS.filter((p) => p.type === "coding").length;
  const quizCount = PROBLEMS.filter((p) => p.type === "quiz").length;
  const designCount = PROBLEMS.filter((p) => p.type === "system_design").length;
  const sampleProblems = [
    PROBLEMS.find((p) => p.type === "coding" && p.id === "matrix-multiplication"),
    PROBLEMS.find((p) => p.type === "quiz" && p.id === "neural-networks-quiz"),
    PROBLEMS.find((p) => p.type === "system_design"),
  ].filter(Boolean) as typeof PROBLEMS;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav />

      <main className="max-w-4xl mx-auto px-6">
        {/* Hero + Bio */}
        <section className="py-14 md:py-20">
          <div className="flex flex-col sm:flex-row gap-10 items-start">
            <div className="shrink-0">
              <Image
                src="/photo.jpeg"
                alt="Samit Mohan"
                width={160}
                height={210}
                className="rounded-xl object-cover w-[160px] h-[210px]"
                priority
              />
            </div>
            <div className="flex-1 pt-1">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4 leading-[1.1]">
                Samit Mohan
              </h1>
              <p className="text-[16px] text-muted-foreground max-w-xl mb-2 leading-relaxed">
                ML/AI engineer at{" "}
                <a
                  href="https://beltech.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  beltech.ai
                </a>
                , building CV systems for city infrastructure. I learn by implementing things from first principles and try to teach the same.
              </p>
              <p className="text-[13px] font-mono text-muted-foreground/40 mb-5">
                probably doing matrix multiplications
              </p>
              <a
                href="https://drive.google.com/file/d/1bDYvQaRKyh31Qr0THOY51_i-UKl91UHq/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
              >
                Resume
              </a>
            </div>
          </div>
        </section>

        <div className="border-t border-border" />

        {/* Course */}
        {activeCourse && (
          <section className="py-16">
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4">
              Course
            </h2>
            <Link
              href={`/courses/${activeCourse.slug}`}
              className="block border border-border rounded-xl p-6 bg-card hover:border-primary/40 transition-colors"
            >
              <h3 className="text-[17px] font-semibold text-foreground mb-2">
                {activeCourse.title}
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed max-w-xl mb-4">
                {activeCourse.tagline}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {activeCourse.tags.slice(0, 5).map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-[13px] font-medium text-primary">
                View curriculum
              </span>
            </Link>
          </section>
        )}

        <div className="border-t border-border" />

        {/* Posts */}
        <section className="py-16">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Posts
            </h2>
            <Link
              href="/blog"
              className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
            >
              All posts
            </Link>
          </div>
          <div className="space-y-8">
            {featuredPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                <div className="flex items-baseline justify-between mb-1.5">
                  <h3 className="text-[15px] font-medium text-foreground group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <span className="text-[12px] text-muted-foreground/60 ml-4 shrink-0 font-mono">
                    {formatPostDate(post.date)}
                  </span>
                </div>
                {post.description && (
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    {post.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>

        <div className="border-t border-border" />

        {/* Projects */}
        <section className="py-16">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Projects
            </h2>
            <a
              href="https://github.com/samitmohan"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROJECTS.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group border border-border rounded-xl p-5 bg-card hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-[15px] font-semibold text-foreground group-hover:text-primary transition-colors font-mono">
                    {p.name}
                  </h3>
                  <div className="flex gap-1.5 ml-3 shrink-0">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {p.description}
                </p>
              </a>
            ))}
          </div>
        </section>

        <div className="border-t border-border" />

        {/* Practice */}
        <section className="py-16">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">
              Practice Problems
            </h2>
            <p className="text-[13px] text-muted-foreground mb-5">
              Built to pair with the course - each module has matching problems so you can implement what you just learned. {PROBLEMS.length} problems &mdash; {codingCount} coding &middot; {quizCount} quizzes &middot; {designCount} system design.
            </p>
            <div className="space-y-2 mb-6">
              {sampleProblems.map((p) => (
                <Link
                  key={p.id}
                  href={`/problems/${p.id}`}
                  className="flex items-center gap-3 group"
                >
                  <span className="text-[11px] font-mono text-muted-foreground/60 w-14 shrink-0">
                    {p.type === "system_design" ? "design" : p.type}
                  </span>
                  <span className="text-[13px] text-muted-foreground group-hover:text-foreground transition-colors">
                    {p.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <Link
            href="/problems"
            className="inline-flex px-5 py-2.5 rounded-md border border-border text-foreground text-[13px] font-medium hover:bg-muted transition-colors"
          >
            Browse Problems
          </Link>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
