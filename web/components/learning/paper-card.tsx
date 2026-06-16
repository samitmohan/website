import type { Paper } from "@/lib/learning-data";

export function PaperCard({ paper }: { paper: Paper }) {
  return (
    <div className="flex items-center gap-3 bg-card border border-border rounded-lg px-3.5 py-2.5 mb-1.5">
      <span className="text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5 flex-shrink-0">
        {paper.year}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-foreground">{paper.title}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{paper.authors}</div>
        <span className="text-[10px] text-[#16a34a] bg-[#16a34a]/10 rounded px-1.5 py-0.5 mt-1 inline-block">
          {paper.why}
        </span>
      </div>
      <a
        href={paper.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[11px] text-primary hover:underline flex-shrink-0"
      >
        arXiv ↗
      </a>
    </div>
  );
}
