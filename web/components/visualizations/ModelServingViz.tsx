'use client';

import React, { useState, useEffect } from 'react';

interface Replica {
  id: number;
  gpuUtil: number;
  processing: number;
  queueDepth: number;
}

function initReplicas(count: number): Replica[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    gpuUtil: Math.floor(Math.random() * 40) + 20,
    processing: Math.floor(Math.random() * 3),
    queueDepth: Math.floor(Math.random() * 5),
  }));
}

export default function ModelServingViz() {
  const [replicas, setReplicas] = useState<Replica[]>(() => initReplicas(3));
  const [globalQueue, setGlobalQueue] = useState(8);
  const [autoScale, setAutoScale] = useState(true);
  const [rps, setRps] = useState(50);

  useEffect(() => {
    const interval = setInterval(() => {
      setReplicas(prev => prev.map(r => ({
        ...r,
        gpuUtil: Math.min(99, Math.max(10, r.gpuUtil + Math.floor(Math.random() * 20) - 10 + (rps > 70 ? 5 : rps < 30 ? -5 : 0))),
        processing: Math.max(0, Math.floor(Math.random() * (rps > 60 ? 5 : 3))),
        queueDepth: Math.max(0, Math.floor(Math.random() * (rps > 70 ? 8 : 3))),
      })));
      setGlobalQueue(Math.max(0, Math.floor(rps / 8) + Math.floor(Math.random() * 6) - 2));
    }, 1000);
    return () => clearInterval(interval);
  }, [rps]);

  // Auto-scaler
  useEffect(() => {
    if (!autoScale) return;
    const interval = setInterval(() => {
      const avgUtil = replicas.reduce((s, r) => s + r.gpuUtil, 0) / replicas.length;
      if (avgUtil > 80 && replicas.length < 6) {
        setReplicas(prev => [...prev, { id: prev.length, gpuUtil: 20, processing: 0, queueDepth: 0 }]);
      } else if (avgUtil < 30 && replicas.length > 1) {
        setReplicas(prev => prev.slice(0, -1));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [autoScale, replicas]);

  const avgUtil = replicas.length > 0 ? replicas.reduce((s, r) => s + r.gpuUtil, 0) / replicas.length : 0;
  const utilColor = avgUtil > 80 ? '#f43f5e' : avgUtil > 50 ? '#facc15' : '#34d399';

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-200">Model Serving Architecture</h3>
          <p className="text-xs text-gray-400">Load balancer, replicas, and auto-scaling</p>
        </div>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <span className="text-xs text-gray-400">Auto-scale</span>
          <div className={`w-7 h-4 rounded-full relative transition cursor-pointer ${autoScale ? 'bg-[#7F56D9]' : 'bg-white/10'}`}
            onClick={() => setAutoScale(a => !a)}>
            <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all ${autoScale ? 'left-3.5' : 'left-0.5'}`} />
          </div>
        </label>
      </div>

      <div className="p-4 space-y-4">
        {/* RPS slider */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-400">Requests/sec</span>
            <span className="text-xs font-mono text-[#9E77ED]">{rps}</span>
          </div>
          <input type="range" min={10} max={100} value={rps} onChange={e => setRps(Number(e.target.value))}
            className="w-full accent-[#7F56D9] h-1" />
        </div>

        {/* Architecture diagram */}
        <div className="flex items-start gap-3">
          {/* Load Balancer */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="bg-[#7F56D9]/20 border border-[#7F56D9]/40 rounded-lg px-3 py-2 text-center">
              <div className="text-sm text-gray-400">Load Balancer</div>
              <div className="text-xs font-bold text-[#9E77ED]">Round Robin</div>
            </div>
            <div className="bg-white/5 border border-border rounded px-2 py-1">
              <div className="text-[8px] text-gray-500">Queue: {globalQueue}</div>
              <div className="w-16 bg-white/10 rounded-full h-1 mt-0.5">
                <div className="h-1 rounded-full bg-[#7F56D9] transition-all" style={{ width: `${Math.min(100, globalQueue * 10)}%` }} />
              </div>
            </div>
            <svg width="20" height="30" className="text-gray-600"><path d="M10 0 L10 20 M5 15 L10 20 L15 15" stroke="currentColor" fill="none" strokeWidth="1.5" /></svg>
          </div>

          {/* Replicas */}
          <div className="flex-1 grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(replicas.length, 3)}, 1fr)` }}>
            {replicas.map(r => (
              <div key={r.id} className="bg-white/5 border border-border rounded-lg p-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-base font-bold text-gray-400">GPU #{r.id}</span>
                  <span className="text-sm font-mono" style={{ color: r.gpuUtil > 80 ? '#f43f5e' : r.gpuUtil > 50 ? '#facc15' : '#34d399' }}>
                    {r.gpuUtil}%
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mb-1">
                  <div className="h-2 rounded-full transition-all duration-700"
                    style={{ width: `${r.gpuUtil}%`, backgroundColor: r.gpuUtil > 80 ? '#f43f5e' : r.gpuUtil > 50 ? '#facc15' : '#34d399' }} />
                </div>
                <div className="flex justify-between text-[8px] text-gray-500">
                  <span>{r.processing} active</span>
                  <span>{r.queueDepth} queued</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white/5 border border-border p-2 rounded-lg">
            <div className="text-xs text-gray-400">Replicas</div>
            <div className="text-sm font-mono font-bold text-[#9E77ED]">{replicas.length}</div>
          </div>
          <div className="bg-white/5 border border-border p-2 rounded-lg">
            <div className="text-xs text-gray-400">Avg GPU</div>
            <div className="text-sm font-mono font-bold" style={{ color: utilColor }}>{avgUtil.toFixed(0)}%</div>
          </div>
          <div className="bg-white/5 border border-border p-2 rounded-lg">
            <div className="text-xs text-gray-400">Queue</div>
            <div className="text-sm font-mono font-bold text-gray-300">{globalQueue}</div>
          </div>
          <div className="bg-white/5 border border-border p-2 rounded-lg">
            <div className="text-xs text-gray-400">RPS</div>
            <div className="text-sm font-mono font-bold text-gray-300">{rps}</div>
          </div>
        </div>

        <div className="bg-[#7F56D9]/5 border border-[#7F56D9]/10 p-3 rounded-lg">
          <p className="text-xs text-[#B692F6] leading-relaxed">
            {autoScale
              ? `Auto-scaler monitors average GPU utilization. Above 80% it adds replicas (max 6). Below 30% it removes them (min 1). Current: ${replicas.length} replica(s).`
              : 'Auto-scaling disabled. Increase RPS to see GPU utilization spike without new replicas being added.'}
          </p>
        </div>
      </div>
    </div>
  );
}
