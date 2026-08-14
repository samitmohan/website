export function SubBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div data-sub="" className="mb-7">
      <div className="text-[11px] font-mono uppercase tracking-wide text-muted-foreground/70 mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}
