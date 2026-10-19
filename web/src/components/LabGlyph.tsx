/** A different small line drawing per lab card, pure SVG. */
export function LabGlyph({ i }: { i: number }) {
  const paths = [
    "M10 70 L40 30 L70 55 L100 15 L130 45",
    "M10 20 h120 M10 40 h80 M10 60 h110 M10 80 h60",
    "M10 80 C40 80 60 60 70 40 S110 10 130 10",
    "M70 10 L40 45 L100 45 Z M40 45 L25 80 M40 45 L55 80 M100 45 L85 80 M100 45 L115 80",
  ];
  return (
    <svg viewBox="0 0 140 90" className="absolute inset-x-6 top-8 text-ink opacity-70 transition-transform duration-500 group-hover:scale-105" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d={paths[i % paths.length]} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="130" cy="45" r="3" fill="var(--accent)" stroke="none" />
    </svg>
  );
}
