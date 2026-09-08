import type { Difficulty, Tag } from "@/lib/interviews-data";
import { CodeCard } from "@/components/ui/code-card";

const SPECIAL_TAGS: Partial<Record<Tag, string>> = {
  frontier: "text-purple-600",
  startup: "text-primary",
};

const DIFFICULTY_DOT: Record<Difficulty, string> = {
  easy: "bg-[#16a34a]",
  med: "bg-[#ca8a04]",
  hard: "bg-destructive",
};

// Static, zero-JS expandable Q&A. Native <details>/<summary> handles
// open/close with no client bundle.
export function QACard({
  id,
  q,
  difficulty,
  tags,
  code,
  children,
}: {
  id: string;
  q: string;
  difficulty: Difficulty;
  tags: Tag[];
  code?: string;
  children: React.ReactNode;
}) {
  const isKey = tags.includes("key");
  const specialTags = tags.filter((t): t is keyof typeof SPECIAL_TAGS => t in SPECIAL_TAGS);

  return (
    <details
      id={id}
      // Facets live on the node so InterviewFilters can filter the painted DOM
      // without any of this content entering the client bundle.
      data-qa=""
      data-difficulty={difficulty}
      data-tags={tags.join(" ")}
      data-q={q.toLowerCase()}
      className={`group mb-1 scroll-mt-24 border-l-2 pl-3 ${
        isKey ? "border-l-[#ca8a04]" : "border-l-transparent"
      }`}
    >
      <summary className="flex items-center gap-3 py-1.5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${DIFFICULTY_DOT[difficulty]}`}
          title={difficulty}
        />
        <span className="flex-1 min-w-0 text-small text-foreground leading-snug">
          {q}
          {specialTags.length > 0 && (
            <span className="ml-2">
              {specialTags.map((t) => (
                <span key={t} className={`text-micro font-medium mr-1.5 ${SPECIAL_TAGS[t]}`}>
                  {t}
                </span>
              ))}
            </span>
          )}
        </span>
        <span className="text-muted-foreground/50 text-micro flex-shrink-0 group-open:rotate-90">
          ▶
        </span>
      </summary>
      <div className="interviews-prose pb-3 pt-1">
        {children}
        {code && <CodeCard code={code} />}
      </div>
    </details>
  );
}
