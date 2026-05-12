'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingDown } from 'lucide-react'

export default function CrossEntropyViz() {
  const [prediction, setPrediction] = useState(0.7)
  const trueLabel = 1

  const loss = useMemo(() => {
    const eps = 1e-15
    const p = Math.max(eps, Math.min(1 - eps, prediction))
    if (trueLabel === 1) return -Math.log(p)
    return -Math.log(1 - p)
  }, [prediction])

  // Generate curve points
  const curvePoints = useMemo(() => {
    const pts: { x: number; y: number }[] = []
    for (let p = 0.01; p <= 0.99; p += 0.01) {
      pts.push({ x: p, y: -Math.log(p) })
    }
    return pts
  }, [])

  const W = 400
  const H = 200
  const pad = { t: 10, r: 20, b: 30, l: 40 }
  const chartW = W - pad.l - pad.r
  const chartH = H - pad.t - pad.b

  const xScale = (v: number) => pad.l + v * chartW
  const yScale = (v: number) => pad.t + chartH - (v / 5) * chartH

  const pathD = curvePoints
    .map((pt, i) => `${i === 0 ? 'M' : 'L'}${xScale(pt.x).toFixed(1)},${yScale(pt.y).toFixed(1)}`)
    .join(' ')

  const cx = xScale(prediction)
  const cy = yScale(loss)

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-rose-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-rose-500/10 p-1.5 rounded-lg">
          <TrendingDown className="w-4 h-4 text-rose-400" />
        </div>
        <div>
          <h3 className="text-base font-bold">Cross-Entropy Loss</h3>
          <p className="text-xs text-muted-foreground">-log(p) when true label = 1</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            {/* Grid */}
            {[0, 1, 2, 3, 4, 5].map(v => (
              <g key={v}>
                <line x1={pad.l} y1={yScale(v)} x2={W - pad.r} y2={yScale(v)} stroke="currentColor" strokeOpacity={0.1} />
                <text x={pad.l - 6} y={yScale(v) + 3} textAnchor="end" fill="currentColor" fillOpacity={0.4} fontSize={9}>{v}</text>
              </g>
            ))}
            {[0, 0.25, 0.5, 0.75, 1].map(v => (
              <g key={v}>
                <line x1={xScale(v)} y1={pad.t} x2={xScale(v)} y2={H - pad.b} stroke="currentColor" strokeOpacity={0.1} />
                <text x={xScale(v)} y={H - pad.b + 14} textAnchor="middle" fill="currentColor" fillOpacity={0.4} fontSize={9}>{v}</text>
              </g>
            ))}

            {/* Curve */}
            <path d={pathD} fill="none" stroke="#f43f5e" strokeWidth={2} />

            {/* Current point */}
            <line x1={cx} y1={pad.t} x2={cx} y2={H - pad.b} stroke="#f43f5e" strokeWidth={1} strokeDasharray="4 3" strokeOpacity={0.4} />
            <motion.circle
              cx={cx}
              cy={cy}
              r={5}
              fill="#f43f5e"
              stroke="#0f172a"
              strokeWidth={2}
              animate={{ cx, cy }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            />

            {/* Labels */}
            <text x={W / 2} y={H - 2} textAnchor="middle" fill="currentColor" fillOpacity={0.5} fontSize={10}>Predicted probability (p)</text>
            <text x={12} y={H / 2} textAnchor="middle" fill="currentColor" fillOpacity={0.5} fontSize={10} transform={`rotate(-90, 12, ${H / 2})`}>Loss</text>
          </svg>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-2 block">Predicted Probability</label>
            <input
              type="range"
              min={0.01}
              max={0.99}
              step={0.01}
              value={prediction}
              onChange={(e) => setPrediction(parseFloat(e.target.value))}
              className="w-full accent-rose-500"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0</span>
              <span className="font-mono font-bold text-rose-400">{prediction.toFixed(2)}</span>
              <span>1</span>
            </div>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl">
            <div className="text-xs uppercase font-bold text-muted-foreground mb-1">Loss Value</div>
            <div className="text-2xl font-mono font-bold text-rose-400">{loss.toFixed(3)}</div>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl">
            <div className="text-xs uppercase font-bold text-muted-foreground mb-1">True Label</div>
            <div className="text-lg font-mono font-bold">1 (positive)</div>
          </div>

          <div className="mt-auto bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg">
            <p className="text-xs text-rose-300 leading-relaxed italic">
              The closer p is to the true label, the lower the loss. Wrong confident predictions get penalized heavily.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
