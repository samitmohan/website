export default function ProblemsLoading() {
  return (
    <div className="max-w-[720px] mx-auto px-6 py-10">
      <div className="mb-6">
        <div className="h-6 w-24 bg-muted rounded animate-pulse" />
        <div className="h-4 w-56 bg-muted rounded animate-pulse mt-2" />
      </div>

      {/* Search skeleton */}
      <div className="mb-4">
        <div className="h-9 w-full bg-muted rounded-lg animate-pulse" />
      </div>

      {/* Filter skeletons */}
      <div className="flex flex-wrap gap-2 mb-8">
        <div className="h-8 w-16 bg-muted rounded-lg animate-pulse" />
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
        <div className="h-8 w-40 bg-muted rounded-lg animate-pulse" />
      </div>

      {/* Problem rows */}
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, weekIdx) => (
          <div key={weekIdx}>
            <div className="flex items-baseline gap-3 mb-3">
              <div className="w-9 h-6 bg-muted rounded animate-pulse" />
              <div className="h-4 w-40 bg-muted rounded animate-pulse" />
            </div>
            <div className="space-y-1.5 ml-[46px]">
              {Array.from({ length: 4 }).map((_, rowIdx) => (
                <div key={rowIdx} className="flex items-center gap-3 py-2.5 px-3">
                  <div className="h-5 w-14 bg-muted rounded animate-pulse shrink-0" />
                  <div className="h-4 flex-1 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-14 bg-muted rounded animate-pulse shrink-0" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
