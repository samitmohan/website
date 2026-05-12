'use client'

import { useState, useCallback } from 'react'

export default function LearningRateViz() {
  const [lr, setLr] = useState(0.15)
  const [steps, setSteps] = useState<{ small: number[]; mid: number[]; large: number[] }>({ small: [4], mid: [4], large: [4] })
  const [running, setRunning] = useState(false)

  // Loss = (w - 1)^2, minimum at w=1
  const loss = (w: number) => (w - 1) ** 2
  const grad = (w: number) => 2 * (w - 1)

  const reset = useCallback(() => {
    setSteps({ small: [4], mid: [4], large: [4] })
    setRunning(false)
  }, [])

  const runSteps = useCallback(() => {
    setRunning(true)
    const lrs = { small: lr * 0.2, mid: lr, large: lr * 3.5 }
    let s = { small: [4], mid: [4], large: [4] }
    let step = 0
    const maxSteps = 20

    const tick = () => {
      if (step >= maxSteps) { setRunning(false); return }
      const next = { ...s }
      for (const key of ['small', 'mid', 'large'] as const) {
        const prev = next[key][next[key].length - 1]
        const g = grad(prev)
        let w = prev - lrs[key] * g
        w = Math.max(-5, Math.min(8, w))
        next[key] = [...next[key], w]
      }
      s = next
      setSteps({ ...s })
      step++
      setTimeout(tick, 200)
    }
    tick()
  }, [lr])

  const svgW = 560, svgH = 200, padX = 40, padY = 20
  const xMin = -2, xMax = 6, yMin = 0, yMax = 12

  const toSvg = (wx: number, wy: number) => ({
    x: padX + ((wx - xMin) / (xMax - xMin)) * (svgW - 2 * padX),
    y: padY + (1 - (wy - yMin) / (yMax - yMin)) * (svgH - 2 * padY),
  })

  const curvePts = Array.from({ length: 80 }, (_, i) => {
    const w = xMin + (i / 79) * (xMax - xMin)
    return toSvg(w, loss(w))
  })
  const curvePath = curvePts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  const colors = { small: '#f59e0b', mid: '#22c55e', large: '#ef4444' }
  const labels = { small: 'Too small', mid: 'Good', large: 'Too large' }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-green-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Learning Rate Comparison</h3>
          <p className="text-xs text-muted-foreground">Three learning rates on L(w) = (w-1)^2. Minimum at w=1.</p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <label className="text-xs font-bold text-muted-foreground">Base LR =</label>
          <input type="range" min="0.01" max="0.5" step="0.01" value={lr} onChange={e => { setLr(parseFloat(e.target.value)); reset() }} className="flex-1 accent-green-500" />
          <span className="text-sm font-mono font-bold w-12 text-right">{lr.toFixed(2)}</span>
          <button onClick={running ? reset : runSteps} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${running ? 'bg-red-500/80 text-white' : 'bg-green-500 text-white'}`}>
            {running ? 'Reset' : 'Run'}
          </button>
        </div>

        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full bg-muted/30 rounded-xl border border-border/50">
          {/* Axes */}
          <line x1={padX} y1={svgH - padY} x2={svgW - padX} y2={svgH - padY} stroke="#555" strokeWidth={1} />
          <line x1={padX} y1={padY} x2={padX} y2={svgH - padY} stroke="#555" strokeWidth={1} />
          <text x={svgW / 2} y={svgH - 2} textAnchor="middle" className="fill-muted-foreground text-sm">w</text>
          <text x={12} y={svgH / 2} textAnchor="middle" className="fill-muted-foreground text-sm" transform={`rotate(-90,12,${svgH / 2})`}>Loss</text>

          {/* Loss curve */}
          <path d={curvePath} fill="none" stroke="#6366f1" strokeWidth={2} />

          {/* Minimum marker */}
          {(() => { const p = toSvg(1, 0); return <circle cx={p.x} cy={p.y} r={4} fill="#6366f1" opacity={0.5} /> })()}

          {/* Gradient descent paths */}
          {(['small', 'mid', 'large'] as const).map(key =>
            steps[key].map((w, i) => {
              const p = toSvg(w, loss(w))
              return (
                <g key={`${key}-${i}`}>
                  <circle cx={p.x} cy={p.y} r={i === steps[key].length - 1 ? 5 : 3} fill={colors[key]} opacity={i === steps[key].length - 1 ? 1 : 0.4} />
                  {i > 0 && (() => {
                    const prev = toSvg(steps[key][i - 1], loss(steps[key][i - 1]))
                    return <line x1={prev.x} y1={prev.y} x2={p.x} y2={p.y} stroke={colors[key]} strokeWidth={1} opacity={0.5} />
                  })()}
                </g>
              )
            })
          )}
        </svg>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {(['small', 'mid', 'large'] as const).map(key => {
            const lrVal = key === 'small' ? lr * 0.2 : key === 'mid' ? lr : lr * 3.5
            const lastW = steps[key][steps[key].length - 1]
            return (
              <div key={key} className="rounded-lg border p-2" style={{ borderColor: colors[key] + '40', backgroundColor: colors[key] + '10' }}>
                <p className="text-xs font-bold" style={{ color: colors[key] }}>{labels[key]} (lr={lrVal.toFixed(3)})</p>
                <p className="text-xs text-muted-foreground font-mono">w={lastW.toFixed(2)}, loss={loss(lastW).toFixed(3)}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-3 bg-green-500/5 border border-green-500/10 p-3 rounded-lg">
          <p className="text-xs text-green-300 leading-relaxed italic">
            Too-small LR barely moves. Correct LR converges to minimum. Too-large LR overshoots and may diverge.
          </p>
        </div>
      </div>
    </div>
  )
}
