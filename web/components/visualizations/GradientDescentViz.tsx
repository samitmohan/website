'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowDownCircle } from 'lucide-react'

export default function GradientDescentViz() {
  const [position, setPosition] = useState(3.5)
  const [lr, setLr] = useState(0.1)
  const [history, setHistory] = useState<number[]>([3.5])

  // Loss function: f(x) = (x-1)^2 + 0.5*sin(3x)
  const f = (x: number) => (x - 1) ** 2 + 0.5 * Math.sin(3 * x)
  // Gradient: f'(x) = 2(x-1) + 1.5*cos(3x)
  const grad = (x: number) => 2 * (x - 1) + 1.5 * Math.cos(3 * x)

  const step = useCallback(() => {
    const g = grad(position)
    const next = position - lr * g
    const clamped = Math.max(-2, Math.min(5, next))
    setPosition(clamped)
    setHistory(prev => [...prev.slice(-20), clamped])
  }, [position, lr])

  const reset = () => {
    setPosition(3.5)
    setHistory([3.5])
  }

  const W = 400
  const H = 200
  const pad = { t: 15, r: 20, b: 30, l: 40 }
  const chartW = W - pad.l - pad.r
  const chartH = H - pad.t - pad.b

  const xMin = -2
  const xMax = 5
  const yMin = -1
  const yMax = 10

  const xScale = (v: number) => pad.l + ((v - xMin) / (xMax - xMin)) * chartW
  const yScale = (v: number) => pad.t + chartH - ((v - yMin) / (yMax - yMin)) * chartH

  // Generate curve
  const curvePoints: string[] = []
  for (let x = xMin; x <= xMax; x += 0.05) {
    const px = xScale(x)
    const py = yScale(f(x))
    curvePoints.push(`${curvePoints.length === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`)
  }

  const cx = xScale(position)
  const cy = yScale(f(position))
  const currentGrad = grad(position)

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-amber-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-amber-500/10 p-1.5 rounded-lg">
          <ArrowDownCircle className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <h3 className="text-base font-bold">Gradient Descent</h3>
          <p className="text-xs text-muted-foreground">Optimizing f(x) = (x-1)^2 + 0.5*sin(3x)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            {/* Grid */}
            {[0, 2, 4, 6, 8].map(v => (
              <g key={v}>
                <line x1={pad.l} y1={yScale(v)} x2={W - pad.r} y2={yScale(v)} stroke="currentColor" strokeOpacity={0.08} />
                <text x={pad.l - 6} y={yScale(v) + 3} textAnchor="end" fill="currentColor" fillOpacity={0.4} fontSize={9}>{v}</text>
              </g>
            ))}

            {/* Loss curve */}
            <path d={curvePoints.join(' ')} fill="none" stroke="#f59e0b" strokeWidth={2} />

            {/* History trail */}
            {history.map((pos, i) => (
              <circle
                key={i}
                cx={xScale(pos)}
                cy={yScale(f(pos))}
                r={2}
                fill="#f59e0b"
                fillOpacity={0.2 + (i / history.length) * 0.5}
              />
            ))}

            {/* Gradient arrow */}
            <line
              x1={cx}
              y1={cy}
              x2={cx - currentGrad * 8}
              y2={cy}
              stroke="#6366f1"
              strokeWidth={2}
              markerEnd="url(#arrow)"
            />
            <defs>
              <marker id="arrow" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                <path d="M0,0 L6,2 L0,4 Z" fill="#6366f1" />
              </marker>
            </defs>

            {/* Current point */}
            <motion.circle
              cx={cx}
              cy={cy}
              r={6}
              fill="#f59e0b"
              stroke="#0f172a"
              strokeWidth={2}
              animate={{ cx, cy }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            />

            <text x={W / 2} y={H - 2} textAnchor="middle" fill="currentColor" fillOpacity={0.5} fontSize={10}>x</text>
            <text x={12} y={H / 2} textAnchor="middle" fill="currentColor" fillOpacity={0.5} fontSize={10} transform={`rotate(-90, 12, ${H / 2})`}>f(x)</text>
          </svg>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-3">
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-2 block">Learning Rate</label>
            <input
              type="range" min={0.01} max={0.5} step={0.01}
              value={lr}
              onChange={(e) => setLr(parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="text-center text-xs font-mono text-amber-400">{lr.toFixed(2)}</div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted border border-border p-2 rounded-xl">
              <div className="text-xs uppercase font-bold text-muted-foreground">x</div>
              <div className="text-sm font-mono font-bold text-amber-400">{position.toFixed(3)}</div>
            </div>
            <div className="bg-muted border border-border p-2 rounded-xl">
              <div className="text-xs uppercase font-bold text-muted-foreground">f(x)</div>
              <div className="text-sm font-mono font-bold text-amber-400">{f(position).toFixed(3)}</div>
            </div>
          </div>

          <div className="bg-muted border border-border p-2 rounded-xl">
            <div className="text-xs uppercase font-bold text-muted-foreground">Gradient</div>
            <div className="text-sm font-mono font-bold text-indigo-400">{currentGrad.toFixed(3)}</div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={step}
              className="flex-1 text-xs bg-amber-500 text-white rounded-lg py-2 hover:bg-amber-600 transition font-medium"
            >
              Step
            </button>
            <button
              onClick={() => { for (let i = 0; i < 10; i++) step() }}
              className="flex-1 text-xs border border-border rounded-lg py-2 hover:bg-accent transition"
            >
              10 Steps
            </button>
            <button
              onClick={reset}
              className="text-xs border border-border rounded-lg py-2 px-3 hover:bg-accent transition"
            >
              Reset
            </button>
          </div>

          <div className="text-xs text-muted-foreground">
            Steps: {history.length - 1}
          </div>

          <div className="mt-auto bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg">
            <p className="text-xs text-amber-300 leading-relaxed italic">
              {lr > 0.3
                ? "High learning rate! Watch for overshooting and divergence."
                : Math.abs(currentGrad) < 0.1
                  ? "Gradient near zero - converging to a minimum."
                  : "Blue arrow shows the gradient direction. Step moves opposite to it."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
