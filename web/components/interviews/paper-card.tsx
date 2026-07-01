import type { Paper } from "@/lib/interviews-data";

export function PaperCard({ paper }: { paper: Paper }) {
  return (
    <div className="flex items-baseline gap-3 py-2.5 border-b border-border">
      <span className="text-[11px] font-mono text-muted-foreground/60 flex-shrink-0 w-10 tabular-nums">
        {paper.year}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] text-foreground">{paper.title}</div>
        <div className="text-[12px] text-muted-foreground mt-0.5">
          {paper.authors} · {paper.why}
        </div>
      </div>
      <a
        href={paper.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[12px] text-primary hover:underline underline-offset-2 flex-shrink-0"
      >
        arXiv ↗
      </a>
    </div>
  );
}
