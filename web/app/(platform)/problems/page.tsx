"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PROBLEMS } from "@/config/problems";

// Course module groupings - maps to the AI Engineering course structure
const MODULES = [
  { id: "prerequisites", title: "Prerequisites", shortLabel: "Prerequisites", weeks: [0] },
  { id: "neural-networks", title: "Neural Network Foundations", shortLabel: "Neural Nets", weeks: [1] },
  { id: "language-models", title: "Language Model Architecture", shortLabel: "LM Architecture", weeks: [2, 3] },
  { id: "sampling", title: "Sampling & Generation", shortLabel: "Sampling", weeks: [4] },
  { id: "llm-internals", title: "LLM Internals", shortLabel: "LLM Internals", weeks: [16] },
  { id: "training", title: "Training Pipeline", shortLabel: "Training", weeks: [5] },
  { id: "rag", title: "RAG Systems", shortLabel: "RAG", weeks: [6, 7, 8] },
  { id: "agents", title: "Agents & Agentic AI", shortLabel: "Agents", weeks: [9, 10] },
  { id: "evals", title: "Evals & Reliability", shortLabel: "Evals", weeks: [11] },
  { id: "inference", title: "Inference & Deployment", shortLabel: "Inference", weeks: [12] },
  { id: "multimodal", title: "Multimodal AI", shortLabel: "Multimodal", weeks: [13] },
  { id: "capstone", title: "Capstone", shortLabel: "Capstone", weeks: [14, 15] },
] as const;

const TYPE_COLORS: Record<string, string> = {
  coding: "bg-primary/10 text-primary border-primary/20",
  quiz: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  system_design: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const TYPE_LABELS: Record<string, string> = {
  coding: "Coding",
  quiz: "Quiz",
  system_design: "Design",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-emerald-400",
  Medium: "text-amber-400",
  Hard: "text-red-400",
};

export default function ProblemsPage() {
  return (
    <Suspense>
      <ProblemsContent />
    </Suspense>
  );
}

function ProblemsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const moduleParam = searchParams.get("module");
  const typeParam = searchParams.get("type");
  const diffParam = searchParams.get("difficulty");
  const searchParam = searchParams.get("q") || "";

  const [typeFilter, setTypeFilter] = useState<string>(typeParam || "all");
  const [moduleFilter, setModuleFilter] = useState<string>(moduleParam || "all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>(diffParam || "all");
  const [search, setSearch] = useState(searchParam);

  useEffect(() => {
    const params = new URLSearchParams();
    if (moduleFilter !== "all") params.set("module", moduleFilter);
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (difficultyFilter !== "all") params.set("difficulty", difficultyFilter);
    if (search.trim()) params.set("q", search.trim());
    const qs = params.toString();
    router.replace(`/problems${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [moduleFilter, typeFilter, difficultyFilter, search, router]);

  const activeModuleWeeks = useMemo(() => {
    if (moduleFilter === "all") return null;
    const mod = MODULES.find((m) => m.id === moduleFilter);
    return mod ? new Set<number>(mod.weeks) : null;
  }, [moduleFilter]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return PROBLEMS.filter((p) => {
      if (typeFilter !== "all" && p.type !== typeFilter) return false;
      if (activeModuleWeeks && !activeModuleWeeks.has(p.weekNumber)) return false;
      if (difficultyFilter !== "all" && p.difficulty !== difficultyFilter) return false;
      if (q) {
        const inTitle = p.title.toLowerCase().includes(q);
        const inTags = p.tags.toLowerCase().includes(q);
        const inDesc = p.description.toLowerCase().includes(q);
        if (!inTitle && !inTags && !inDesc) return false;
      }
      return true;
    });
  }, [typeFilter, activeModuleWeeks, difficultyFilter, search]);

  const visibleModules =
    moduleFilter === "all"
      ? MODULES
      : MODULES.filter((m) => m.id === moduleFilter);

  return (
    <div className="max-w-[720px] mx-auto px-6 py-10">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Problems</h1>
        <p className="text-sm text-muted-foreground mt-2">
          200+ ML implementation problems I wrote for an AI engineering cohort.
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search problems by title, tag, or keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 px-3 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {/* Type */}
        <div className="flex gap-0.5 p-0.5 bg-muted rounded-lg">
          {(["all", "coding", "quiz", "system_design"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`text-sm px-3 py-1.5 rounded-md transition-all ${
                typeFilter === type
                  ? "bg-secondary text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {type === "all" ? "All" : TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        {/* Difficulty */}
        <div className="flex gap-0.5 p-0.5 bg-muted rounded-lg">
          {(["all", "Easy", "Medium", "Hard"] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`text-sm px-2.5 py-1.5 rounded-md transition-all ${
                difficultyFilter === diff
                  ? "bg-secondary text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {diff === "all" ? "All" : diff}
            </button>
          ))}
        </div>

        {/* Module filter */}
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 cursor-pointer"
        >
          <option value="all">All Modules</option>
          {MODULES.map((mod) => (
            <option key={mod.id} value={mod.id}>{mod.title}</option>
          ))}
        </select>
      </div>

      {/* Problems grouped by course module */}
      <div className="space-y-8">
        {visibleModules.map((mod) => {
          const moduleWeekSet = new Set<number>(mod.weeks);
          const moduleProblems = filtered
            .filter((p) => moduleWeekSet.has(p.weekNumber))
            .sort((a, b) =>
              a.weekNumber !== b.weekNumber
                ? a.weekNumber - b.weekNumber
                : (a.sortOrder ?? 99) - (b.sortOrder ?? 99)
            );
          if (moduleProblems.length === 0) return null;

          const modIndex = MODULES.findIndex((m) => m.id === mod.id);
          const easyCount = moduleProblems.filter((p) => p.difficulty === "Easy").length;
          const medCount = moduleProblems.filter((p) => p.difficulty === "Medium").length;
          const hardCount = moduleProblems.filter((p) => p.difficulty === "Hard").length;

          return (
            <div key={mod.id}>
              {/* Module header */}
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-[22px] font-bold text-muted-foreground/50 font-mono tabular-nums leading-none select-none">
                  {String(modIndex).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-foreground">{mod.title}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground/70">{moduleProblems.length} problems</span>
                    <span className="text-xs text-muted-foreground/50">|</span>
                    {easyCount > 0 && <span className="text-xs text-emerald-500/70">{easyCount}E</span>}
                    {medCount > 0 && <span className="text-xs text-amber-500/70">{medCount}M</span>}
                    {hardCount > 0 && <span className="text-xs text-red-500/70">{hardCount}H</span>}
                  </div>
                </div>
              </div>

              {/* Problem rows */}
              <div className="space-y-1.5 ml-[46px]">
                {moduleProblems.map((problem) => {
                  const tags: string[] = (() => {
                    try { return JSON.parse(problem.tags || "[]"); }
                    catch { return []; }
                  })();

                  return (
                    <Link
                      key={problem.id}
                      href={`/problems/${problem.id}`}
                      className="flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <span className={`text-xs font-medium px-2 py-0.5 rounded border shrink-0 ${TYPE_COLORS[problem.type]}`}>
                        {TYPE_LABELS[problem.type]}
                      </span>
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1 truncate">
                        {problem.title}
                      </span>
                      {tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs text-muted-foreground/70 hidden sm:inline">
                          {tag}
                        </span>
                      ))}
                      <span className={`text-sm shrink-0 ${DIFFICULTY_COLORS[problem.difficulty]}`}>
                        {problem.difficulty}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No problems match your filters.
          </p>
        </div>
      )}
    </div>
  );
}
