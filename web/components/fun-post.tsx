import Link from "next/link";
import Image from "next/image";
import { funFontVars } from "@/lib/fun-fonts";
import { formatPostDate, type PostMeta, type Post } from "@/lib/blog";
import { BlogContent } from "@/components/blog-content";
import { FunThemeToggle } from "@/components/fun-theme-toggle";

// Clairo "charm" reading layout for hidden "fun" posts. Rendered instead of
// the professional blog chrome when a post has `hidden: true`.
export function FunPost({
  post,
  html,
  prevPost,
  nextPost,
}: {
  post: Post;
  html: string;
  prevPost: PostMeta | null;
  nextPost: PostMeta | null;
}) {
  return (
    <div className={`candy ${funFontVars}`}>
      <FunThemeToggle />
      <main id="main" className="mx-auto max-w-[42rem] px-6 py-14 md:py-20">
        <div className="rise r1 mb-10">
          <Link href="/fun" className="fun-back">
            &larr; fun
          </Link>
        </div>

        <header className="rise r2 mb-9">
          <h1
            className="fun-post-title"
            style={{ fontSize: "clamp(2.4rem, 7.5vw, 4rem)", marginBottom: ".9rem" }}
          >
            {post.title}
          </h1>
          <div className="fun-meta">
            {formatPostDate(post.date)} &middot; {post.readingTime} min
          </div>
        </header>

        {post.thumbnail && (
          <div className="fun-hero rise r3 mb-12">
            <div className="relative aspect-[3/2]">
              <Image
                src={post.thumbnail}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 680px"
              />
            </div>
          </div>
        )}

        <BlogContent html={html} className="fun-prose rise r3" />

        {(prevPost || nextPost) && (
          <nav className="fun-navlinks">
            {prevPost ? (
              <Link href={`/blog/${prevPost.slug}`} className="fun-back">
                &larr; {prevPost.title}
              </Link>
            ) : (
              <span />
            )}
            {nextPost ? (
              <Link href={`/blog/${nextPost.slug}`} className="fun-back">
                {nextPost.title} &rarr;
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </main>
    </div>
  );
}
