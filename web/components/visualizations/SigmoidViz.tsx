'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'

export default function SigmoidViz() {
  const [x, setX] = useState(0)

  const sigmoid = (v: number) => 1 / (1 + Math.exp(-v))
  const sigmoidDeriv = (v: number) => {
    const s = sigmoid(v)
    return s * (1 - s)
  }

  const curvePoints = useMemo(() => {
    const pts: { x: number; sig: number; deriv: number }[] = []
    for (let v = -6; v <= 6; v += 0.1) {
      pts.push({ x: v, sig: sigmoid(v), deriv: sigmoidDeriv(v) })
    }
    return pts
  }, [])

  const W = 400
  const H = 200
  const pad = { t: 10, r: 20, b: 30, l: 40 }
  const chartW = W - pad.l - pad.r
  const chartH = H - pad.t - pad.b

  const xScale = (v: number) => pad.l + ((v + 6) / 12) * chartW
  const yScale = (v: number) => pad.t + chartH - v * chartH

  const sigPath = curvePoints
    .map((pt, i) => `${i === 0 ? 'M' : 'L'}${xScale(pt.x).toFixed(1)},${yScale(pt.sig).toFixed(1)}`)
    .join(' ')

  const derivPath = curvePoints
    .map((pt, i) => `${i === 0 ? 'M' : 'L'}${xScale(pt.x).toFixed(1)},${yScale(pt.deriv * 4).toFixed(1)}`)
    .join(' ')

  const currentY = sigmoid(x)
  const currentDeriv = sigmoidDeriv(x)
  const cx = xScale(x)
  const cy = yScale(currentY)

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-emerald-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-emerald-500/10 p-1.5 rounded-lg">
          <Activity className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-base font-bold">Sigmoid Activation</h3>
          <p className="text-xs text-muted-foreground">sigma(x) = 1 / (1 + exp(-x)) and its derivative</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            {/* Grid */}
            {[0, 0.25, 0.5, 0.75, 1].map(v => (
              <g key={v}>
                <line x1={pad.l} y1={yScale(v)} x2={W - pad.r} y2={yScale(v)} stroke="currentColor" strokeOpacity={0.08} />
                <text x={pad.l - 6} y={yScale(v) + 3} textAnchor="end" fill="currentColor" fillOpacity={0.4} fontSize={9}>{v}</text>
              </g>
            ))}

            {/* Vanishing gradient zones */}
            <rect x={xScale(-6)} y={pad.t} width={xScale(-3) - xScale(-6)} height={chartH} fill="#ef4444" fillOpacity={0.05} />
            <rect x={xScale(3)} y={pad.t} width={xScale(6) - xScale(3)} height={chartH} fill="#ef4444" fillOpacity={0.05} />

            {/* Zero line */}
            <line x1={xScale(0)} y1={pad.t} x2={xScale(0)} y2={H - pad.b} stroke="currentColor" strokeOpacity={0.15} />

            {/* 0.5 line */}
            <line x1={pad.l} y1={yScale(0.5)} x2={W - pad.r} y2={yScale(0.5)} stroke="currentColor" strokeOpacity={0.15} strokeDasharray="4 3" />

            {/* Derivative curve */}
            <path d={derivPath} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeOpacity={0.6} strokeDasharray="4 2" />

            {/* Sigmoid curve */}
            <path d={sigPath} fill="none" stroke="#10b981" strokeWidth={2.5} />

            {/* Current point */}
            <line x1={cx} y1={pad.t} x2={cx} y2={H - pad.b} stroke="#10b981" strokeWidth={1} strokeDasharray="4 3" strokeOpacity={0.4} />
            <motion.circle
              cx={cx}
              cy={cy}
              r={5}
              fill="#10b981"
              stroke="#0f172a"
              strokeWidth={2}
              animate={{ cx, cy }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            />

            {/* Legend */}
            <line x1={W - pad.r - 90} y1={pad.t + 10} x2={W - pad.r - 70} y2={pad.t + 10} stroke="#10b981" strokeWidth={2} />
            <text x={W - pad.r - 65} y={pad.t + 14} fill="#10b981" fontSize={9}>sigma(x)</text>
            <line x1={W - pad.r - 90} y1={pad.t + 24} x2={W - pad.r - 70} y2={pad.t + 24} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2" />
            <text x={W - pad.r - 65} y={pad.t + 28} fill="#f59e0b" fontSize={9}>sigma'(x)</text>
          </svg>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-2 block">Input x</label>
            <input
              type="range"
              min={-6}
              max={6}
              step={0.1}
              value={x}
              onChange={(e) => setX(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="text-center text-xs font-mono font-bold text-emerald-400 mt-1">{x.toFixed(1)}</div>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl">
            <div className="text-xs uppercase font-bold text-muted-foreground mb-1">sigma(x)</div>
            <div className="text-2xl font-mono font-bold text-emerald-400">{currentY.toFixed(4)}</div>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl">
            <div className="text-xs uppercase font-bold text-muted-foreground mb-1">sigma'(x)</div>
            <div className="text-2xl font-mono font-bold text-amber-400">{currentDeriv.toFixed(4)}</div>
            {currentDeriv < 0.05 && (
              <div className="text-xs text-red-400 mt-1 font-medium">Vanishing gradient zone</div>
            )}
          </div>

          <div className="mt-auto bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg">
            <p className="text-xs text-emerald-300 leading-relaxed italic">
              {Math.abs(x) > 3
                ? "Gradient near zero here - deep networks struggle to learn through saturated sigmoids."
                : "Gradient is healthy. Sigmoid outputs are between 0 and 1 - useful for binary classification."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
