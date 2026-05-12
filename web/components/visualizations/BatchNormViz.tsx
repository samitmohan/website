'use client'

import { useState, useMemo } from 'react'

function seededRandom(seed: number) {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

export default function BatchNormViz() {
  const [gamma, setGamma] = useState(1.0)
  const [beta, setBeta] = useState(0.0)

  const rawData = useMemo(() => {
    const rng = seededRandom(42)
    return Array.from({ length: 30 }, () => ({
      x: rng() * 8 - 2,
      y: rng() * 12 - 3,
    }))
  }, [])

  const stats = useMemo(() => {
    const xs = rawData.map(d => d.x)
    const ys = rawData.map(d => d.y)
    const meanX = xs.reduce((a, b) => a + b, 0) / xs.length
    const meanY = ys.reduce((a, b) => a + b, 0) / ys.length
    const stdX = Math.sqrt(xs.reduce((a, b) => a + (b - meanX) ** 2, 0) / xs.length) || 1
    const stdY = Math.sqrt(ys.reduce((a, b) => a + (b - meanY) ** 2, 0) / ys.length) || 1
    return { meanX, meanY, stdX, stdY }
  }, [rawData])

  const normalizedData = useMemo(() => {
    return rawData.map(d => ({
      x: ((d.x - stats.meanX) / stats.stdX) * gamma + beta,
      y: ((d.y - stats.meanY) / stats.stdY) * gamma + beta,
    }))
  }, [rawData, stats, gamma, beta])

  const normStats = useMemo(() => {
    const xs = normalizedData.map(d => d.x)
    const ys = normalizedData.map(d => d.y)
    const meanX = xs.reduce((a, b) => a + b, 0) / xs.length
    const meanY = ys.reduce((a, b) => a + b, 0) / ys.length
    const stdX = Math.sqrt(xs.reduce((a, b) => a + (b - meanX) ** 2, 0) / xs.length) || 0
    const stdY = Math.sqrt(ys.reduce((a, b) => a + (b - meanY) ** 2, 0) / ys.length) || 0
    return { meanX, meanY, stdX, stdY }
  }, [normalizedData])

  const plotW = 240, plotH = 180, pad = 25

  const toSvg = (val: { x: number; y: number }, rangeX: [number, number], rangeY: [number, number]) => ({
    x: pad + ((val.x - rangeX[0]) / (rangeX[1] - rangeX[0])) * (plotW - 2 * pad),
    y: pad + (1 - (val.y - rangeY[0]) / (rangeY[1] - rangeY[0])) * (plotH - 2 * pad),
  })

  const rawRange: [number, number] = [-4, 10]
  const normRange: [number, number] = [-4, 4]

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-cyan-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Batch Normalization</h3>
          <p className="text-xs text-muted-foreground">Before/after normalization with learnable gamma and beta.</p>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-muted-foreground w-14">gamma</label>
            <input type="range" min="0.1" max="3" step="0.05" value={gamma} onChange={e => setGamma(parseFloat(e.target.value))} className="flex-1 accent-cyan-500" />
            <span className="text-xs font-mono w-8 text-right">{gamma.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-muted-foreground w-14">beta</label>
            <input type="range" min="-3" max="3" step="0.1" value={beta} onChange={e => setBeta(parseFloat(e.target.value))} className="flex-1 accent-cyan-500" />
            <span className="text-xs font-mono w-8 text-right">{beta.toFixed(1)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Raw data */}
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-1 text-center">Before (raw activations)</p>
            <svg viewBox={`0 0 ${plotW} ${plotH}`} className="w-full bg-muted/30 rounded-xl border border-border/50">
              {/* mean lines */}
              {(() => {
                const mx = pad + ((stats.meanX - rawRange[0]) / (rawRange[1] - rawRange[0])) * (plotW - 2 * pad)
                const my = pad + (1 - (stats.meanY - rawRange[0]) / (rawRange[1] - rawRange[0])) * (plotH - 2 * pad)
                return (
                  <>
                    <line x1={mx} y1={pad} x2={mx} y2={plotH - pad} stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 2" opacity={0.6} />
                    <line x1={pad} y1={my} x2={plotW - pad} y2={my} stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 2" opacity={0.6} />
                    <text x={mx + 3} y={pad + 8} className="fill-amber-400 text-[7px]">mean</text>
                  </>
                )
              })()}
              {rawData.map((d, i) => {
                const p = toSvg(d, rawRange, rawRange)
                return <circle key={i} cx={p.x} cy={p.y} r={4} fill="#f43f5e" opacity={0.7} />
              })}
            </svg>
            <div className="mt-1 text-sm text-muted-foreground text-center font-mono">
              mu=({stats.meanX.toFixed(1)},{stats.meanY.toFixed(1)}) sigma=({stats.stdX.toFixed(1)},{stats.stdY.toFixed(1)})
            </div>
          </div>

          {/* Normalized data */}
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-1 text-center">After (gamma * norm + beta)</p>
            <svg viewBox={`0 0 ${plotW} ${plotH}`} className="w-full bg-muted/30 rounded-xl border border-border/50">
              {/* Zero crosshair */}
              {(() => {
                const zx = pad + ((0 - normRange[0]) / (normRange[1] - normRange[0])) * (plotW - 2 * pad)
                const zy = pad + (1 - (0 - normRange[0]) / (normRange[1] - normRange[0])) * (plotH - 2 * pad)
                return (
                  <>
                    <line x1={zx} y1={pad} x2={zx} y2={plotH - pad} stroke="#555" strokeWidth={1} opacity={0.4} />
                    <line x1={pad} y1={zy} x2={plotW - pad} y2={zy} stroke="#555" strokeWidth={1} opacity={0.4} />
                  </>
                )
              })()}
              {/* mean lines */}
              {(() => {
                const mx = pad + ((normStats.meanX - normRange[0]) / (normRange[1] - normRange[0])) * (plotW - 2 * pad)
                const my = pad + (1 - (normStats.meanY - normRange[0]) / (normRange[1] - normRange[0])) * (plotH - 2 * pad)
                return (
                  <>
                    <line x1={mx} y1={pad} x2={mx} y2={plotH - pad} stroke="#22c55e" strokeWidth={1} strokeDasharray="4 2" opacity={0.6} />
                    <line x1={pad} y1={my} x2={plotW - pad} y2={my} stroke="#22c55e" strokeWidth={1} strokeDasharray="4 2" opacity={0.6} />
                    <text x={mx + 3} y={pad + 8} className="fill-green-400 text-[7px]">mean</text>
                  </>
                )
              })()}
              {normalizedData.map((d, i) => {
                const p = toSvg(d, normRange, normRange)
                return <circle key={i} cx={p.x} cy={p.y} r={4} fill="#3b82f6" opacity={0.7} />
              })}
            </svg>
            <div className="mt-1 text-sm text-muted-foreground text-center font-mono">
              mu=({normStats.meanX.toFixed(2)},{normStats.meanY.toFixed(2)}) sigma=({normStats.stdX.toFixed(2)},{normStats.stdY.toFixed(2)})
            </div>
          </div>
        </div>

        <div className="mt-3 bg-cyan-500/5 border border-cyan-500/10 p-3 rounded-lg">
          <p className="text-xs text-cyan-300 leading-relaxed italic">
            BatchNorm normalizes to zero mean and unit variance, then applies learnable gamma (scale) and beta (shift).
            With gamma=1 and beta=0, output has mean 0 and std 1.
          </p>
        </div>
      </div>
    </div>
  )
}
