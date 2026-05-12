export default function PlatformLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground mt-3">Loading...</p>
    </div>
  );
}
