'use client';
import React, { useState } from 'react';

export default function NoiseScheduleViz() {
  const [timestep, setTimestep] = useState(50);
  const [schedule, setSchedule] = useState<'linear' | 'cosine'>('linear');
  const T = 100;
  const W = 400;
  const H = 200;
  const pad = 40;

  const linearBeta = (t: number) => 0.0001 + (0.02 - 0.0001) * (t / T);
  const cosineBeta = (t: number) => {
    const s = 0.008;
    const f = (x: number) => Math.cos(((x / T + s) / (1 + s)) * (Math.PI / 2)) ** 2;
    return Math.min(1 - f(t + 1) / f(t), 0.999);
  };

  const points = (fn: (t: number) => number) =>
    Array.from({ length: T + 1 }, (_, i) => {
      const x = pad + (i / T) * (W - 2 * pad);
      const y = H - pad - (fn(i) / 0.025) * (H - 2 * pad);
      return `${x},${Math.max(pad, Math.min(H - pad, y))}`;
    }).join(' ');

  const noiseLevel = schedule === 'linear' ? linearBeta(timestep) : cosineBeta(timestep);
  const noisePct = Math.min(noiseLevel / 0.025, 1);

  const sampleSteps = [0, 25, 50, 75, 100];

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-200">Noise Schedule: Linear vs Cosine</h3>

      <div className="mb-4 flex gap-3">
        <button
          onClick={() => setSchedule('linear')}
          className={`rounded px-3 py-1 text-sm font-medium ${schedule === 'linear' ? 'bg-[#7F56D9] text-white' : 'border border-border text-gray-400'}`}
        >
          Linear
        </button>
        <button
          onClick={() => setSchedule('cosine')}
          className={`rounded px-3 py-1 text-sm font-medium ${schedule === 'cosine' ? 'bg-[#7F56D9] text-white' : 'border border-border text-gray-400'}`}
        >
          Cosine
        </button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mb-4 w-full" style={{ maxWidth: 500 }}>
        <rect x={pad} y={pad} width={W - 2 * pad} height={H - 2 * pad} fill="none" stroke="rgba(255,255,255,0.1)" />
        <polyline points={points(linearBeta)} fill="none" stroke="#9E77ED" strokeWidth="2" opacity={schedule === 'linear' ? 1 : 0.3} />
        <polyline points={points(cosineBeta)} fill="none" stroke="#7F56D9" strokeWidth="2" opacity={schedule === 'cosine' ? 1 : 0.3} strokeDasharray={schedule === 'cosine' ? 'none' : '4,4'} />
        {/* Timestep indicator */}
        <line
          x1={pad + (timestep / T) * (W - 2 * pad)} y1={pad}
          x2={pad + (timestep / T) * (W - 2 * pad)} y2={H - pad}
          stroke="#F97066" strokeWidth="1.5" strokeDasharray="4,3"
        />
        <text x={pad - 5} y={H - pad + 15} fill="#9CA3AF" fontSize="10" textAnchor="end">0</text>
        <text x={W - pad + 5} y={H - pad + 15} fill="#9CA3AF" fontSize="10">T={T}</text>
        <text x={pad - 5} y={pad + 4} fill="#9CA3AF" fontSize="10" textAnchor="end">beta</text>
      </svg>

      <div className="mb-4">
        <label className="mb-1 block text-sm text-gray-400">
          Timestep: <span className="text-[#9E77ED] font-mono">{timestep}</span> | beta = <span className="font-mono text-[#9E77ED]">{noiseLevel.toFixed(5)}</span>
        </label>
        <input
          type="range" min={0} max={T} value={timestep}
          onChange={e => setTimestep(+e.target.value)}
          className="w-full accent-[#7F56D9]"
        />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">Clean</span>
        {sampleSteps.map(t => {
          const nl = schedule === 'linear' ? linearBeta(t) : cosineBeta(t);
          const pct = Math.min(nl / 0.025, 1);
          return (
            <div key={t} className="flex flex-col items-center gap-1">
              <div
                className="h-12 w-12 rounded border border-border"
                style={{
                  background: `linear-gradient(135deg, #7F56D9 0%, #3B1D8E 100%)`,
                  opacity: 1 - pct * 0.7,
                  filter: `blur(${pct * 3}px) grayscale(${pct * 80}%)`,
                }}
              />
              <span className="text-xs text-gray-500">t={t}</span>
            </div>
          );
        })}
        <span className="text-xs text-gray-500">Noisy</span>
      </div>
    </div>
  );
}
