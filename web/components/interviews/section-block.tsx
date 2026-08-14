export function SectionBlock({
  id,
  title,
  children,
  variant = "qa",
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  /** "static" sections hold prose or papers rather than tagged questions, so
   *  the filter bar drops them wholesale instead of emptying them out. */
  variant?: "qa" | "static";
}) {
  return (
    <section id={id} data-section={variant} className="mb-14 scroll-mt-20">
      <h2 className="text-[17px] font-semibold tracking-tight text-foreground mb-4 pb-2 border-b border-border">
        {title}
      </h2>
      {children}
    </section>
  );
}
