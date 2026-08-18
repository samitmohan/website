import { PROBLEMS } from "@/config/problems";
import { ProblemsBrowser, type ProblemRow } from "@/components/problem/problems-browser";

function parseTags(raw: string | undefined): string[] {
  try {
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

// Server component. It reduces the 988 KB catalogue to the ~31 KB of fields a
// row and its filters need, so descriptions, theory, solutions, starter code
// and test cases stay on the server.
//
// Search covers title and tags. It used to cover descriptions too, which meant
// shipping all 113 KB of them to the browser to support substring matching.
export default function ProblemsPage() {
  const rows: ProblemRow[] = PROBLEMS.map((p) => {
    const tags = parseTags(p.tags);
    return {
      id: p.id,
      title: p.title,
      type: p.type,
      difficulty: p.difficulty,
      weekNumber: p.weekNumber,
      sortOrder: p.sortOrder ?? 99,
      tags,
      search: `${p.title} ${tags.join(" ")}`.toLowerCase(),
    };
  });

  return <ProblemsBrowser problems={rows} />;
}
