/** A table whose other rows fade when one is hovered, and the hovered one nudges right. */
export function DimRows({ rows }: { rows: { a: string; b: string; c: string; href?: string }[] }) {
  return (
    <ul className="group/rows">
      {rows.map((r) => {
        const inner = (
          <>
            <span className="text-ink">{r.a}</span>
            <span>{r.b}</span>
            <span className="meta col-span-2 sm:col-span-1 sm:text-right">{r.c}</span>
          </>
        );
        const cls =
          "grid grid-cols-[1fr_1fr] sm:grid-cols-[1fr_1fr_11rem] gap-x-4 border-b border-hairline py-3 text-[14px] transition-[opacity,translate] duration-300 group-hover/rows:opacity-45 hover:!opacity-100 hover:translate-x-0.5";
        return (
          <li key={r.a}>
            {r.href ? <a href={r.href} className={cls}>{inner}</a> : <div className={cls}>{inner}</div>}
          </li>
        );
      })}
    </ul>
  );
}
