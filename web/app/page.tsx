import Image from "next/image";
import Link from "next/link";
import { getAllPosts, formatPostDate } from "@/lib/blog";
import { getViews, formatViews } from "@/lib/views";
import { PublicNav, PublicFooter } from "@/components/public-nav";

export const revalidate = 30;

const FEATURED_SLUGS = [
  "minitorch",
  "inference",
  "how-chatgpt-works",
  "attention-residuals",
  "microgpt",
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

export default async function HomePage() {
  const allPosts = getAllPosts();
  const featuredPosts = FEATURED_SLUGS
    .map((slug) => allPosts.find((p) => p.slug === slug))
    .filter(Boolean) as typeof allPosts;
  const views = await getViews(featuredPosts.map((p) => p.slug));
  const searchEntries = allPosts.map((p) => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    description: p.description,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav searchEntries={searchEntries} />

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
              <p className="text-[12px] font-mono text-muted-foreground/70 mb-4">
                Bangalore · ML engineer at Beltech AI
              </p>
              <p className="text-[15px] text-foreground/80 max-w-xl leading-relaxed">
                <span className="font-semibold text-foreground">≤10ms</span> CV inference at{" "}
                <span className="font-semibold text-foreground">0.9+ F1</span> on city CCTV. I write
                and rebuild things from scratch.
              </p>
            </div>
          </div>
        </section>

        {/* Posts */}
        <section className="py-12">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="text-[13px] font-mono uppercase tracking-wider text-muted-foreground">
              Posts
            </h2>
            <Link
              href="/blog"
              className="text-[13px] text-muted-foreground hover:text-foreground"
            >
              all posts →
            </Link>
          </div>
          <ul className="space-y-2.5">
            {featuredPosts.map((post) => (
              <li
                key={post.slug}
                className="text-[15px] leading-relaxed flex gap-4 items-baseline"
              >
                <span className="font-mono text-[12px] text-muted-foreground/60 w-24 shrink-0 pt-1 whitespace-nowrap">
                  {formatPostDate(post.date)}
                </span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="flex-1 text-foreground/80 hover:text-primary hover:underline underline-offset-2 transition-transform inline-block hover:translate-x-0.5"
                >
                  {post.title}
                </Link>
                <span
                  className="font-mono text-[11px] text-muted-foreground/60 shrink-0 whitespace-nowrap tabular-nums"
                  aria-label={`${views[post.slug] ?? 0} views`}
                  title={`${views[post.slug] ?? 0} views`}
                >
                  ◉ {formatViews(views[post.slug] ?? 0)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Projects */}
        <section className="py-12 pb-20">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="text-[13px] font-mono uppercase tracking-wider text-muted-foreground">
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
              <li key={p.name} className="text-[15px] leading-relaxed">
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

      </main>

      <PublicFooter />
    </div>
  );
}
