export default function SyllabusLoading() {
  return (
    <div className="max-w-[720px] mx-auto px-6 py-10">
      <div className="mb-10">
        <div className="h-6 w-24 bg-muted rounded animate-pulse" />
        <div className="h-4 w-48 bg-muted rounded animate-pulse mt-2" />
      </div>

      <div className="space-y-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border-b border-border py-5">
            <div className="flex gap-5">
              <div className="w-9 h-7 bg-muted rounded animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                <div className="h-3 w-72 bg-muted rounded animate-pulse" />
                <div className="flex gap-1.5 mt-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-5 w-16 bg-muted rounded-full animate-pulse" />
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-4 w-32 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
