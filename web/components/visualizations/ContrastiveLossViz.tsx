'use client';
import React, { useState } from 'react';

const ITEMS = [
  { img: 'A cat on sofa', text: 'a cat sitting on a couch' },
  { img: 'Sunset over sea', text: 'sunset over the ocean' },
  { img: 'Red sports car', text: 'a red sports car' },
  { img: 'Mountain trail', text: 'hiking trail in mountains' },
];

export default function ContrastiveLossViz() {
  const [toggled, setToggled] = useState<Set<string>>(new Set());

  const baseSim = (i: number, j: number) => (i === j ? 0.85 - Math.random() * 0.1 : 0.15 + Math.random() * 0.15);
  const [simMatrix] = useState(() => ITEMS.map((_, i) => ITEMS.map((_, j) => +baseSim(i, j).toFixed(2))));

  const togglePair = (i: number, j: number) => {
    const key = `${i}-${j}`;
    setToggled(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const isPositive = (i: number, j: number) => {
    const key = `${i}-${j}`;
    if (toggled.has(key)) return i !== j;
    return i === j;
  };

  const loss = () => {
    let total = 0;
    for (let i = 0; i < ITEMS.length; i++) {
      const positiveIdx = ITEMS.findIndex((_, j) => isPositive(i, j));
      if (positiveIdx < 0) continue;
      const expPos = Math.exp(simMatrix[i][positiveIdx] * 5);
      const denom = ITEMS.reduce((s, _, j) => s + Math.exp(simMatrix[i][j] * 5), 0);
      total -= Math.log(expPos / denom);
    }
    return (total / ITEMS.length).toFixed(3);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-200">Contrastive Loss (CLIP-style)</h3>

      <div className="mb-5 flex gap-8 flex-wrap">
        {/* Pairs view */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-gray-400 mb-1">Image-Text Pairs</span>
          {ITEMS.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-28 truncate rounded bg-[#7F56D9]/15 px-2 py-1.5 text-xs text-gray-300 border border-[#7F56D9]/30">
                {item.img}
              </div>
              <div className="flex gap-1">
                {ITEMS.map((_, j) => {
                  const pos = isPositive(i, j);
                  return (
                    <button key={j} onClick={() => togglePair(i, j)}
                      className={`h-5 w-5 rounded-full border text-[8px] font-bold transition-colors ${pos ? 'border-green-500 bg-green-500/20 text-green-400' : 'border-red-500/40 bg-red-500/10 text-red-400'}`}
                    >
                      {j}
                    </button>
                  );
                })}
              </div>
              <div className="w-32 truncate rounded bg-white/5 px-2 py-1.5 text-xs text-gray-400 border border-border">
                {item.text}
              </div>
            </div>
          ))}
          <span className="text-xs text-gray-500 mt-1">Click circles to toggle positive/negative</span>
        </div>

        {/* Similarity matrix */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-400 mb-1">Similarity Matrix</span>
          <div className="grid gap-0.5" style={{ gridTemplateColumns: `32px repeat(${ITEMS.length}, 1fr)` }}>
            <div />
            {ITEMS.map((_, j) => (
              <div key={j} className="flex h-7 w-14 items-center justify-center text-xs text-gray-500">T{j}</div>
            ))}
            {ITEMS.map((_, i) => (
              <React.Fragment key={i}>
                <div className="flex h-10 items-center text-xs text-gray-500">I{i}</div>
                {ITEMS.map((_, j) => {
                  const sim = simMatrix[i][j];
                  const pos = isPositive(i, j);
                  const intensity = Math.floor(sim * 255);
                  return (
                    <div key={j}
                      className={`flex h-10 w-14 items-center justify-center rounded text-xs font-mono border ${pos ? 'border-green-500/40' : 'border-border'}`}
                      style={{
                        backgroundColor: pos
                          ? `rgba(34, 197, 94, ${sim * 0.4})`
                          : `rgba(239, 68, 68, ${sim * 0.3})`,
                        color: sim > 0.5 ? '#fff' : '#9CA3AF',
                      }}
                    >
                      {sim}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="rounded bg-white/5 px-3 py-1.5 font-mono text-gray-300">
          InfoNCE Loss = <span className="text-[#9E77ED] font-bold">{loss()}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500/50" /> positive
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500/50" /> negative
        </div>
      </div>
    </div>
  );
}
