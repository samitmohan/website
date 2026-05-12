'use client';
import React, { useState } from 'react';

function chiSquare(a: number[], b: number[]) {
  const total = a.reduce((s, v) => s + v, 0) + b.reduce((s, v) => s + v, 0);
  if (total === 0) return 0;
  let chi = 0;
  for (let i = 0; i < a.length; i++) {
    const rowA = a.reduce((s, v) => s + v, 0);
    const rowB = b.reduce((s, v) => s + v, 0);
    const col = a[i] + b[i];
    const eA = (rowA * col) / total;
    const eB = (rowB * col) / total;
    if (eA > 0) chi += ((a[i] - eA) ** 2) / eA;
    if (eB > 0) chi += ((b[i] - eB) ** 2) / eB;
  }
  return chi;
}

export default function ABTestViz() {
  const [scoresA, setScoresA] = useState<number[]>([]);
  const [scoresB, setScoresB] = useState<number[]>([]);
  const [running, setRunning] = useState(false);

  const meanA = scoresA.length ? scoresA.reduce((a, b) => a + b, 0) / scoresA.length : 0;
  const meanB = scoresB.length ? scoresB.reduce((a, b) => a + b, 0) / scoresB.length : 0;

  const binsA = [scoresA.filter((s) => s >= 7).length, scoresA.filter((s) => s < 7).length];
  const binsB = [scoresB.filter((s) => s >= 7).length, scoresB.filter((s) => s < 7).length];
  const chi = chiSquare(binsA, binsB);
  const significant = chi >= 3.84; // p < 0.05 with df=1
  const sigPct = Math.min((chi / 3.84) * 100, 100);
  const n = scoresA.length + scoresB.length;

  const runTrial = () => {
    // Variant A: mean ~6.5, Variant B: mean ~7.2 (B is better)
    const scoreA = Math.min(10, Math.max(1, Math.round(6.5 + (Math.random() - 0.5) * 4)));
    const scoreB = Math.min(10, Math.max(1, Math.round(7.2 + (Math.random() - 0.5) * 4)));
    setScoresA((p) => [...p, scoreA]);
    setScoresB((p) => [...p, scoreB]);
  };

  const runBatch = () => {
    setRunning(true);
    let i = 0;
    const iv = setInterval(() => {
      runTrial();
      i++;
      if (i >= 20) { clearInterval(iv); setRunning(false); }
    }, 100);
  };

  const reset = () => { setScoresA([]); setScoresB([]); };

  const barH = (scores: number[], max: number) => scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length / 10) * max : 0;

  return (
    <div className="p-6 bg-card rounded-xl border border-border max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold text-white mb-1">A/B Prompt Testing</h2>
      <p className="text-gray-400 text-sm mb-4">Compare two prompt variants. Chi-square test determines statistical significance.</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/5 rounded-lg p-3 border border-blue-500/20">
          <div className="text-sm font-medium text-blue-400 mb-1">Variant A - Concise</div>
          <div className="text-xs text-gray-400 font-mono mb-2">&quot;Summarize this text briefly.&quot;</div>
          <div className="flex items-end gap-1">
            <div className="text-2xl font-bold text-white">{meanA.toFixed(1)}</div>
            <div className="text-xs text-gray-500 mb-1">avg ({scoresA.length} trials)</div>
          </div>
          <div className="flex gap-0.5 mt-2 h-8 items-end">
            {scoresA.slice(-20).map((s, i) => (
              <div key={i} className="flex-1 bg-blue-500/60 rounded-t" style={{ height: `${(s / 10) * 100}%` }} />
            ))}
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-[#7F56D9]/20">
          <div className="text-sm font-medium text-[#9E77ED] mb-1">Variant B - Detailed</div>
          <div className="text-xs text-gray-400 font-mono mb-2">&quot;Summarize with key insights and context.&quot;</div>
          <div className="flex items-end gap-1">
            <div className="text-2xl font-bold text-white">{meanB.toFixed(1)}</div>
            <div className="text-xs text-gray-500 mb-1">avg ({scoresB.length} trials)</div>
          </div>
          <div className="flex gap-0.5 mt-2 h-8 items-end">
            {scoresB.slice(-20).map((s, i) => (
              <div key={i} className="flex-1 bg-[#7F56D9]/60 rounded-t" style={{ height: `${(s / 10) * 100}%` }} />
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Significance (chi-sq: {chi.toFixed(2)})</span>
          <span className={significant ? 'text-emerald-400 font-semibold' : 'text-gray-500'}>{significant ? 'SIGNIFICANT (p<0.05)' : `Need more data (n=${n})`}</span>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-300 ${significant ? 'bg-emerald-500' : 'bg-yellow-500/70'}`}
            style={{ width: `${sigPct}%` }} />
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={runTrial} disabled={running}
          className="px-4 py-2 bg-[#7F56D9] hover:bg-[#9E77ED] text-white rounded-lg text-sm transition-colors disabled:opacity-50">
          Run 1 Trial
        </button>
        <button onClick={runBatch} disabled={running}
          className="px-4 py-2 bg-[#7F56D9]/30 hover:bg-[#7F56D9]/50 text-[#9E77ED] border border-[#7F56D9]/50 rounded-lg text-sm transition-colors disabled:opacity-50">
          {running ? 'Running...' : 'Run 20 Trials'}
        </button>
        <button onClick={reset} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-sm transition-colors ml-auto">
          Reset
        </button>
      </div>
    </div>
  );
}
