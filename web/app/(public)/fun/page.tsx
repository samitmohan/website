import type { Metadata } from "next";
import Link from "next/link";
import { getHiddenPosts } from "@/lib/blog";
import { funFontVars } from "@/lib/fun-fonts";
import { FunThemeToggle } from "@/components/fun-theme-toggle";

// Everything on this page comes from files in the repo, so it can only change
// when a deploy changes them. Revalidating on a timer re-renders pages that
// cannot have changed.
export const revalidate = false;

export const metadata: Metadata = {
  title: "fun",
  robots: { index: false, follow: false },
  alternates: { canonical: "/fun" },
};

const R = ["r2", "r3", "r4", "r5"];

export default function FunPage() {
  const posts = getHiddenPosts();

  return (
    <div className={`candy ${funFontVars}`}>
      <FunThemeToggle />
      <main id="main" className="mx-auto max-w-2xl px-6 py-20 md:py-28">
        <header className="rise r1">
          <h1 className="fun-word" style={{ fontSize: "clamp(2.4rem, 9.5vw, 4.5rem)" }}>
            fun
          </h1>
          <div className="fun-rule" />
        </header>

        <div className="fun-list">
          {posts.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className={`fun-row rise ${R[i % R.length]}`}
            >
              <span className="fun-idx">{String(i + 1).padStart(2, "0")}</span>
              <span className="fun-name">{post.title}</span>
              <span className="fun-year">{new Date(post.date).getFullYear()}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
