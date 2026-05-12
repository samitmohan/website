'use client';
import React, { useState } from 'react';

export default function VAELatentViz() {
  const [mean, setMean] = useState(0);
  const [variance, setVariance] = useState(1);
  const [samples, setSamples] = useState<number[]>(() => Array.from({ length: 8 }, () => Math.random() * 2 - 1));

  const reparameterize = () => {
    const eps = Array.from({ length: 8 }, () => {
      const u1 = Math.random();
      const u2 = Math.random();
      return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    });
    setSamples(eps.map(e => mean + Math.sqrt(variance) * e));
  };

  const gaussianY = (x: number) => Math.exp(-((x - mean) ** 2) / (2 * variance)) / Math.sqrt(2 * Math.PI * variance);
  const W = 300;
  const H = 120;
  const pad = 20;

  const curvePts = Array.from({ length: 100 }, (_, i) => {
    const x = -4 + (i / 99) * 8;
    const px = pad + ((x + 4) / 8) * (W - 2 * pad);
    const py = H - pad - gaussianY(x) * (H - 2 * pad) * 2.5;
    return `${px},${Math.max(pad, py)}`;
  }).join(' ');

  const Block = ({ label, color, children }: { label: string; color: string; children?: React.ReactNode }) => (
    <div className="flex flex-col items-center gap-1">
      <div className={`rounded-lg border border-border px-4 py-3 text-center`} style={{ backgroundColor: color }}>
        <div className="text-xs font-semibold text-gray-200">{label}</div>
        {children}
      </div>
    </div>
  );

  const Arrow = () => <div className="text-gray-500 text-lg">&#8594;</div>;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-200">VAE: Variational Autoencoder</h3>

      <div className="mb-5 flex items-center justify-center gap-2 flex-wrap">
        <Block label="Input x" color="#1E2432" />
        <Arrow />
        <Block label="Encoder" color="#2D1B69">
          <div className="text-xs text-gray-400 mt-1">q(z|x)</div>
        </Block>
        <Arrow />
        <Block label="mu, sigma" color="#1E2432">
          <div className="text-xs text-[#9E77ED] mt-1">mu={mean.toFixed(1)}, var={variance.toFixed(1)}</div>
        </Block>
        <Arrow />
        <Block label="z = mu + sigma * eps" color="#3B1D6E">
          <div className="text-xs text-gray-400 mt-1">Reparameterization</div>
        </Block>
        <Arrow />
        <Block label="Decoder" color="#2D1B69">
          <div className="text-xs text-gray-400 mt-1">p(x|z)</div>
        </Block>
        <Arrow />
        <Block label="Output x'" color="#1E2432" />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-gray-400">Mean (mu): <span className="text-[#9E77ED] font-mono">{mean.toFixed(1)}</span></label>
          <input type="range" min={-3} max={3} step={0.1} value={mean} onChange={e => setMean(+e.target.value)} className="w-full accent-[#7F56D9]" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-400">Variance: <span className="text-[#9E77ED] font-mono">{variance.toFixed(1)}</span></label>
          <input type="range" min={0.1} max={4} step={0.1} value={variance} onChange={e => setVariance(+e.target.value)} className="w-full accent-[#7F56D9]" />
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mb-3 w-full" style={{ maxWidth: 400 }}>
        <rect x={pad} y={pad} width={W - 2 * pad} height={H - 2 * pad} fill="none" stroke="rgba(255,255,255,0.08)" />
        <polyline points={curvePts} fill="none" stroke="#9E77ED" strokeWidth="2" />
        {samples.map((s, i) => {
          const sx = pad + ((s + 4) / 8) * (W - 2 * pad);
          return <circle key={i} cx={Math.min(W - pad, Math.max(pad, sx))} cy={H - pad - 5} r="4" fill="#7F56D9" opacity="0.8" />;
        })}
        <text x={W / 2} y={H - 3} fill="#9CA3AF" fontSize="9" textAnchor="middle">Latent Space z</text>
      </svg>

      <button onClick={reparameterize} className="rounded bg-[#7F56D9] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#9E77ED] transition-colors">
        Sample (Reparameterize)
      </button>

      <div className="mt-3 flex gap-2 flex-wrap">
        {samples.map((s, i) => (
          <span key={i} className="rounded bg-white/5 px-2 py-0.5 font-mono text-xs text-gray-400">{s.toFixed(2)}</span>
        ))}
      </div>
    </div>
  );
}
