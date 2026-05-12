'use client';
import React, { useState } from 'react';

const models = [
  { name: 'GPT-4', inputCost: 30, outputCost: 60, color: '#7F56D9' },
  { name: 'Claude-3', inputCost: 15, outputCost: 75, color: '#9E77ED' },
  { name: 'GPT-3.5', inputCost: 0.5, outputCost: 1.5, color: '#6941C6' },
  { name: 'Llama-70B', inputCost: 0.9, outputCost: 0.9, color: '#53389E' },
];

export default function CostTrackerViz() {
  const [requestVolume, setRequestVolume] = useState(50);
  const [optimized, setOptimized] = useState(false);

  // Tokens per request (avg)
  const inputTokens = 500;
  const outputTokens = 200;

  const getDistribution = () => {
    if (optimized) return [0.1, 0.2, 0.5, 0.2]; // route most to cheap models
    return [0.4, 0.3, 0.2, 0.1]; // default: heavy on expensive
  };

  const dist = getDistribution();
  const breakdown = models.map((m, i) => {
    const reqs = Math.round(requestVolume * dist[i]);
    const inCost = (reqs * inputTokens * m.inputCost) / 1_000_000;
    const outCost = (reqs * outputTokens * m.outputCost) / 1_000_000;
    return { ...m, reqs, inputTokensTotal: reqs * inputTokens, outputTokensTotal: reqs * outputTokens, inCost, outCost, totalCost: inCost + outCost };
  });

  const totalCost = breakdown.reduce((s, b) => s + b.totalCost, 0);
  const totalInput = breakdown.reduce((s, b) => s + b.inputTokensTotal, 0);
  const totalOutput = breakdown.reduce((s, b) => s + b.outputTokensTotal, 0);
  const maxCost = Math.max(...breakdown.map((b) => b.totalCost), 0.001);

  return (
    <div className="p-6 bg-card rounded-xl border border-border max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold text-white mb-1">Cost Tracker</h2>
      <p className="text-gray-400 text-sm mb-4">Token usage breakdown by model. Toggle optimization to route traffic to cheaper models.</p>

      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-2xl font-bold text-[#9E77ED]">${totalCost.toFixed(3)}</div>
          <div className="text-xs text-gray-500">Total Cost</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-300">{(totalInput / 1000).toFixed(0)}K</div>
          <div className="text-xs text-gray-500">Input Tokens</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-300">{(totalOutput / 1000).toFixed(0)}K</div>
          <div className="text-xs text-gray-500">Output Tokens</div>
        </div>
      </div>

      <div className="mb-4">
        <label className="text-gray-400 text-xs block mb-1">Request Volume: {requestVolume}</label>
        <input type="range" min={10} max={500} value={requestVolume} onChange={(e) => setRequestVolume(+e.target.value)}
          className="w-full accent-[#7F56D9]" />
      </div>

      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2">Cost per Model ($/1M tokens in|out)</div>
        <svg viewBox="0 0 400 140" className="w-full">
          {breakdown.map((b, i) => {
            const barW = (b.totalCost / maxCost) * 280;
            const y = i * 34 + 4;
            return (
              <g key={i}>
                <text x="0" y={y + 16} className="text-sm" fill="#9CA3AF" fontFamily="monospace">{b.name}</text>
                <rect x="80" y={y} width={barW} height={14} rx="3" fill={b.color} opacity={0.7} />
                <rect x="80" y={y + 14} width={(b.inCost / maxCost) * 280} height={6} rx="2" fill={b.color} opacity={0.4} />
                <rect x={80 + (b.inCost / maxCost) * 280} y={y + 14} width={(b.outCost / maxCost) * 280} height={6} rx="2" fill={b.color} opacity={0.25} />
                <text x={88 + barW} y={y + 13} className="text-xs" fill="#D1D5DB" fontFamily="monospace">
                  ${b.totalCost.toFixed(4)} ({b.reqs} req)
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => setOptimized(!optimized)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${optimized ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-400 border border-border hover:bg-white/10'}`}>
          {optimized ? 'Optimized Routing ON' : 'Enable Cost Optimization'}
        </button>
        {optimized && (
          <span className="text-xs text-emerald-400">Routing 70% of traffic to cheaper models</span>
        )}
      </div>

      <div className="flex gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-6 h-2 rounded bg-[#7F56D9]/70" /> Total</span>
        <span className="flex items-center gap-1.5"><span className="w-6 h-2 rounded bg-[#7F56D9]/40" /> Input</span>
        <span className="flex items-center gap-1.5"><span className="w-6 h-2 rounded bg-[#7F56D9]/25" /> Output</span>
      </div>
    </div>
  );
}
