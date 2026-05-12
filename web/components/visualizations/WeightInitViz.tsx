'use client'

import { useState, useMemo } from 'react'

type InitMethod = 'zeros' | 'random' | 'xavier' | 'he'

function seededRandom(seed: number) {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

function gaussianFromUniform(rng: () => number): number {
  const u1 = rng(), u2 = rng()
  return Math.sqrt(-2 * Math.log(u1 || 0.001)) * Math.cos(2 * Math.PI * u2)
}

export default function WeightInitViz() {
  const [method, setMethod] = useState<InitMethod>('xavier')

  const gridSize = 10
  const nIn = 64, nOut = 32 // for fan_in / fan_out

  const weights = useMemo(() => {
    const rng = seededRandom(12345)
    const n = gridSize * gridSize

    switch (method) {
      case 'zeros':
        return Array(n).fill(0)
      case 'random':
        return Array.from({ length: n }, () => gaussianFromUniform(rng))
      case 'xavier': {
        const std = Math.sqrt(2 / (nIn + nOut))
        return Array.from({ length: n }, () => gaussianFromUniform(rng) * std)
      }
      case 'he': {
        const std = Math.sqrt(2 / nIn)
        return Array.from({ length: n }, () => gaussianFromUniform(rng) * std)
      }
    }
  }, [method])

  const histogram = useMemo(() => {
    const bins = 20
    const min = -2.5, max = 2.5
    const counts = Array(bins).fill(0)
    for (const w of weights) {
      const idx = Math.floor(((w - min) / (max - min)) * bins)
      if (idx >= 0 && idx < bins) counts[idx]++
    }
    const maxCount = Math.max(...counts, 1)
    return { counts, maxCount, min, max, bins }
  }, [weights])

  const weightColor = (w: number) => {
    if (Math.abs(w) < 0.001) return '#4b5563' // grey for zeros
    const intensity = Math.min(Math.abs(w) * 2, 1)
    return w > 0
      ? `rgba(59,130,246,${0.2 + intensity * 0.8})`
      : `rgba(239,68,68,${0.2 + intensity * 0.8})`
  }

  const methods: { id: InitMethod; label: string; risk: string; riskColor: string; desc: string }[] = [
    { id: 'zeros', label: 'Zeros', risk: 'Dead neurons', riskColor: '#ef4444', desc: 'All weights = 0. Every neuron computes the same gradient. Network cannot learn.' },
    { id: 'random', label: 'Random N(0,1)', risk: 'Exploding gradients', riskColor: '#f59e0b', desc: 'Std=1 is too large for deep networks. Activations grow/shrink exponentially per layer.' },
    { id: 'xavier', label: 'Xavier', risk: 'Low risk', riskColor: '#22c55e', desc: 'Std = sqrt(2/(fan_in+fan_out)). Keeps variance stable across layers. Best for sigmoid/tanh.' },
    { id: 'he', label: 'He', risk: 'Low risk', riskColor: '#22c55e', desc: 'Std = sqrt(2/fan_in). Accounts for ReLU killing half the distribution. Best for ReLU networks.' },
  ]

  const current = methods.find(m => m.id === method)!
  const wMean = weights.reduce((a, b) => a + b, 0) / weights.length
  const wStd = Math.sqrt(weights.reduce((a, b) => a + (b - wMean) ** 2, 0) / weights.length)

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-amber-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" /></svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Weight Initialization</h3>
          <p className="text-xs text-muted-foreground">Compare initialization strategies. fan_in={nIn}, fan_out={nOut}.</p>
        </div>
      </div>

      <div className="p-4">
        {/* Method buttons */}
        <div className="flex gap-2 mb-4">
          {methods.map(m => (
            <button key={m.id} onClick={() => setMethod(m.id)}
              className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-bold border transition-colors ${method === m.id ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-muted border-border text-muted-foreground'}`}
            >{m.label}</button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Weight grid */}
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-1 text-center">Neuron weights ({gridSize}x{gridSize})</p>
            <div className="grid gap-[2px] bg-muted/30 rounded-lg border border-border/50 p-2" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
              {weights.map((w, i) => (
                <div key={i} className="aspect-square rounded-sm transition-colors duration-300" style={{ backgroundColor: weightColor(w) }} title={w.toFixed(4)} />
              ))}
            </div>
            <div className="mt-1 text-center">
              <span className="text-sm text-muted-foreground font-mono">mean={wMean.toFixed(4)} std={wStd.toFixed(4)}</span>
            </div>
          </div>

          {/* Histogram */}
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-1 text-center">Weight distribution</p>
            <svg viewBox="0 0 240 140" className="w-full bg-muted/30 rounded-lg border border-border/50">
              {/* Zero line */}
              {(() => {
                const zx = 20 + ((0 - histogram.min) / (histogram.max - histogram.min)) * 200
                return <line x1={zx} y1={10} x2={zx} y2={125} stroke="#555" strokeWidth={1} strokeDasharray="3 2" />
              })()}
              {histogram.counts.map((count, i) => {
                const x = 20 + (i / histogram.bins) * 200
                const w = 200 / histogram.bins - 1
                const h = (count / histogram.maxCount) * 100
                const midVal = histogram.min + (i + 0.5) / histogram.bins * (histogram.max - histogram.min)
                return (
                  <rect key={i} x={x} y={125 - h} width={w} height={h} rx={1}
                    fill={midVal > 0 ? '#3b82f6' : midVal < 0 ? '#ef4444' : '#6b7280'} opacity={0.7} />
                )
              })}
              <text x={20} y={137} className="fill-muted-foreground text-[7px]">{histogram.min}</text>
              <text x={120} y={137} textAnchor="middle" className="fill-muted-foreground text-[7px]">0</text>
              <text x={220} y={137} textAnchor="end" className="fill-muted-foreground text-[7px]">{histogram.max}</text>
            </svg>
          </div>
        </div>

        {/* Risk indicator */}
        <div className="mt-3 rounded-lg border p-2.5" style={{ borderColor: current.riskColor + '40', backgroundColor: current.riskColor + '10' }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold" style={{ color: current.riskColor }}>{current.label}</span>
            <span className="text-sm px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: current.riskColor + '20', color: current.riskColor }}>{current.risk}</span>
          </div>
          <p className="text-xs text-muted-foreground">{current.desc}</p>
        </div>
      </div>
    </div>
  )
}
