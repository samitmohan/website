import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
      <div className="text-center">
        <p className="font-mono text-[12px] uppercase tracking-wider text-muted-foreground mb-3">404</p>
        <h1 className="text-3xl font-bold tracking-tight mb-3">page not found</h1>
        <p className="text-[14px] text-muted-foreground mb-6">
          the link is wrong or the post moved.
        </p>
        <div className="flex items-center justify-center gap-4 text-[13px]">
          <Link href="/" className="text-primary hover:underline">home</Link>
          <span className="text-muted-foreground/40">·</span>
          <Link href="/blog" className="text-primary hover:underline">posts</Link>
        </div>
      </div>
    </div>
  );
}
