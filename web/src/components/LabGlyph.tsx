/**
 * A static preview of each post widget, drawn in the same language as the live toys:
 * mono labels, ink at varying weight, and the accent for the thing that matters.
 */
export function LabGlyph({ id }: { id: string }) {
  const frame = "absolute inset-x-6 top-8 h-[52%] w-[calc(100%-3rem)] text-ink transition-transform duration-500 group-hover:scale-[1.03]";
  const mono = { fontFamily: "var(--font-mono, ui-monospace, monospace)" };

  if (id === "microgpt-stepper") {
    // Context tokens, then the next-token distribution with the sampled token in accent.
    const ctx = ["the", "cat", "sat"];
    const next = [
      { t: "on", h: 70, hit: true },
      { t: "down", h: 34 },
      { t: "by", h: 22 },
      { t: ".", h: 12 },
    ];
    return (
      <svg viewBox="0 0 220 130" className={frame} style={mono} aria-hidden>
        {ctx.map((t, i) => (
          <g key={t}>
            <rect x={8 + i * 50} y={6} width={44} height={22} rx={6} fill="currentColor" fillOpacity={0.12} />
            <text x={30 + i * 50} y={21} fontSize={11} textAnchor="middle" fill="currentColor">{t}</text>
          </g>
        ))}
        <text x={168} y={21} fontSize={12} fill="currentColor" fillOpacity={0.5}>→ ?</text>
        {next.map((b, i) => (
          <g key={b.t}>
            <rect x={14 + i * 52} y={112 - b.h} width={40} height={b.h} rx={4} fill={b.hit ? "var(--accent)" : "currentColor"} fillOpacity={b.hit ? 1 : 0.18 + b.h / 160} />
            <text x={34 + i * 52} y={126} fontSize={11} textAnchor="middle" fill="currentColor">{b.t}</text>
          </g>
        ))}
      </svg>
    );
  }

  if (id === "vllm-batching") {
    // Batch slots over time: a new request starts in a slot the step another one finishes.
    const slots = [
      [[0, 5], [5, 9], [9, 12]],
      [[0, 8], [8, 12]],
      [[1, 4], [4, 10], [10, 12]],
      [[0, 3], [3, 7], [7, 12]],
      [[2, 9], [9, 12]],
      [[0, 6], [6, 12]],
    ];
    const cw = 16;
    return (
      <svg viewBox="0 0 220 130" className={frame} style={mono} aria-hidden>
        {slots.map((reqs, s) =>
          reqs.map(([a, b], r) => (
            <rect
              key={`${s}-${r}`}
              x={12 + a * cw + 1}
              y={6 + s * 18}
              width={(b - a) * cw - 2}
              height={14}
              rx={4}
              fill={(s + r) % 3 === 0 ? "var(--accent)" : "currentColor"}
              fillOpacity={(s + r) % 3 === 0 ? 0.9 : 0.16 + ((s * 2 + r) % 3) * 0.14}
            />
          )),
        )}
        <text x={12} y={126} fontSize={10} fill="currentColor" fillOpacity={0.6}>6 slots · steps →</text>
      </svg>
    );
  }

  if (id === "lru-fib") {
    // fib(4): computed calls in ink, cache hits in accent, the work a hit saves fades out.
    const nodes = [
      { k: "f4", x: 110, y: 14, s: "run" },
      { k: "f3", x: 60, y: 50, s: "run" },
      { k: "f2", x: 160, y: 50, s: "hit" },
      { k: "f2", x: 32, y: 86, s: "run" },
      { k: "f1", x: 88, y: 86, s: "hit" },
      { k: "f1", x: 140, y: 86, s: "skip" },
      { k: "f0", x: 180, y: 86, s: "skip" },
      { k: "f1", x: 16, y: 118, s: "run" },
      { k: "f0", x: 48, y: 118, s: "run" },
    ];
    const edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [3, 7], [3, 8]];
    return (
      <svg viewBox="0 0 220 132" className={frame} style={mono} aria-hidden>
        {edges.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke="currentColor" strokeOpacity={nodes[b].s === "skip" ? 0.15 : 0.45} strokeDasharray={nodes[b].s === "skip" ? "3 3" : undefined} />
        ))}
        {nodes.map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r={11} fill={n.s === "hit" ? "var(--accent)" : "var(--surface)"} stroke={n.s === "hit" ? "var(--accent)" : "currentColor"} strokeOpacity={n.s === "skip" ? 0.2 : 0.7} strokeDasharray={n.s === "skip" ? "3 3" : undefined} />
            <text x={n.x} y={n.y + 4} fontSize={10} textAnchor="middle" fill={n.s === "hit" ? "var(--bg)" : "currentColor"} fillOpacity={n.s === "skip" ? 0.3 : 1}>{n.k}</text>
          </g>
        ))}
      </svg>
    );
  }

  return null;
}
