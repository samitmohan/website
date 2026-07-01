import Link from "next/link";

export function PublicNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-[var(--nav-bg)]">
      <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-[15px] font-semibold tracking-tight text-foreground hover:text-primary"
        >
          Samit Mohan
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/blog"
            className="px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground"
          >
            Blog
          </Link>
        </div>
      </div>
    </nav>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border mt-4">
      <div className="max-w-3xl mx-auto px-6 py-8 flex items-center justify-center flex-wrap gap-x-5 gap-y-2 text-[13px]">
        <a
          href="https://github.com/samitmohan"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground"
        >
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/samit-mohan/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground"
        >
          LinkedIn
        </a>
        <a
          href="mailto:samitmohan@gmail.com"
          className="text-muted-foreground hover:text-foreground"
        >
          Email
        </a>
        <a
          href="/blog/rss.xml"
          className="text-muted-foreground hover:text-foreground"
        >
          RSS
        </a>
      </div>
    </footer>
  );
}
