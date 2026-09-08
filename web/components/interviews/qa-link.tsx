import Link from "next/link";
import type { Difficulty, Tag } from "@/lib/interviews-data";

const SPECIAL_TAGS: Partial<Record<Tag, string>> = {
  frontier: "text-purple-600",
  startup: "text-primary",
};

const DIFFICULTY_DOT: Record<Difficulty, string> = {
  easy: "bg-[#16a34a]",
  med: "bg-[#ca8a04]",
  hard: "bg-destructive",
};

/**
 * A question on the index, without its answer. Same shape and same data-*
 * facets as QACard so InterviewFilters filters both without knowing the
 * difference; the answer lives one click away on the section page.
 *
 * Answers are 202 KB of the guide's 300 KB. Keeping them off the index is the
 * entire reason this component exists.
 */
export function QALink({
  href,
  q,
  difficulty,
  tags,
}: {
  href: string;
  q: string;
  difficulty: Difficulty;
  tags: Tag[];
}) {
  const isKey = tags.includes("key");
  const specialTags = tags.filter((t): t is keyof typeof SPECIAL_TAGS => t in SPECIAL_TAGS);

  return (
    <div
      data-qa=""
      data-difficulty={difficulty}
      data-tags={tags.join(" ")}
      data-q={q.toLowerCase()}
      className={`group mb-1 border-l-2 pl-3 ${
        isKey ? "border-l-[#ca8a04]" : "border-l-transparent"
      }`}
    >
      <Link href={href} className="flex items-center gap-3 py-1.5">
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${DIFFICULTY_DOT[difficulty]}`}
          title={difficulty}
        />
        <span className="flex-1 min-w-0 text-small text-foreground leading-snug group-hover:text-primary">
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
        <span className="text-muted-foreground/50 text-micro flex-shrink-0">→</span>
      </Link>
    </div>
  );
}
