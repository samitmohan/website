import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="text-center">
        <p className="label mb-4">
          404
        </p>
        <h1 className="display text-balance text-[30px] text-ink md:text-[36px]">
          page not found
        </h1>
        <p className="mt-4 text-[15px] text-ink-2">
          the link is wrong or the post moved.
        </p>
        <div className="mt-7 flex items-center justify-center gap-2">
          <Link href="/" className="pill pill-ghost">
            home
          </Link>
          <Link href="/blog" className="pill pill-ghost">
            posts
          </Link>
        </div>
      </div>
    </div>
  );
}
