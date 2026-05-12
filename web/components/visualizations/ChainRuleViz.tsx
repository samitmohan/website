'use client'

import { useState, useMemo } from 'react'

export default function ChainRuleViz() {
  const [x, setX] = useState(1.5)

  const computation = useMemo(() => {
    // f(g(x)) where g(x) = x^2 + 1, f(u) = sin(u)
    const gx = x * x + 1
    const fgx = Math.sin(gx)
    const dgdx = 2 * x
    const dfdu = Math.cos(gx)
    const dfdx = dfdu * dgdx
    return { gx, fgx, dgdx, dfdu, dfdx }
  }, [x])

  const intensityColor = (val: number) => {
    const abs = Math.min(Math.abs(val), 3)
    const alpha = (abs / 3)
    return val >= 0
      ? `rgba(99, 102, 241, ${0.15 + alpha * 0.85})`
      : `rgba(244, 63, 94, ${0.15 + alpha * 0.85})`
  }

  const boxes = [
    { label: 'x', value: x, derivative: null as number | null, desc: 'Input' },
    { label: 'g(x) = x^2 + 1', value: computation.gx, derivative: computation.dgdx, desc: 'dg/dx = 2x' },
    { label: 'f(u) = sin(u)', value: computation.fgx, derivative: computation.dfdu, desc: 'df/du = cos(u)' },
  ]

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-violet-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Chain Rule Visualization</h3>
          <p className="text-xs text-muted-foreground">f(g(x)) = sin(x^2 + 1). Color intensity = gradient magnitude.</p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3 mb-5">
          <label className="text-xs font-bold text-muted-foreground">x =</label>
          <input type="range" min="-3" max="3" step="0.05" value={x} onChange={e => setX(parseFloat(e.target.value))} className="flex-1 accent-violet-500" />
          <span className="text-sm font-mono font-bold w-12 text-right">{x.toFixed(2)}</span>
        </div>

        {/* Function composition boxes */}
        <div className="flex items-center gap-2 mb-5">
          {boxes.map((box, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div
                className="flex-1 rounded-xl border-2 p-3 text-center transition-colors duration-300"
                style={{
                  borderColor: box.derivative !== null ? intensityColor(box.derivative) : '#4338ca',
                  backgroundColor: box.derivative !== null ? intensityColor(box.derivative) : 'rgba(99,102,241,0.08)',
                }}
              >
                <p className="text-xs font-bold text-muted-foreground mb-1">{box.label}</p>
                <p className="text-lg font-mono font-bold">{box.value.toFixed(3)}</p>
                {box.derivative !== null && (
                  <p className="text-xs font-mono text-amber-400 mt-1">{box.desc} = {box.derivative.toFixed(3)}</p>
                )}
              </div>
              {i < boxes.length - 1 && (
                <svg className="w-5 h-5 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              )}
            </div>
          ))}
        </div>

        {/* Chain rule formula */}
        <div className="bg-muted/40 rounded-xl border border-border/50 p-4 mb-4">
          <p className="text-xs font-bold text-muted-foreground mb-3">Chain Rule: df/dx = df/du * dg/dx</p>
          <div className="flex items-center gap-3 justify-center flex-wrap">
            <div className="bg-indigo-500/20 border border-indigo-500/30 rounded-lg px-3 py-2 text-center">
              <p className="text-sm text-muted-foreground">df/du = cos(g(x))</p>
              <p className="text-sm font-mono font-bold text-indigo-300">{computation.dfdu.toFixed(4)}</p>
            </div>
            <span className="text-lg font-bold text-muted-foreground">x</span>
            <div className="bg-violet-500/20 border border-violet-500/30 rounded-lg px-3 py-2 text-center">
              <p className="text-sm text-muted-foreground">dg/dx = 2x</p>
              <p className="text-sm font-mono font-bold text-violet-300">{computation.dgdx.toFixed(4)}</p>
            </div>
            <span className="text-lg font-bold text-muted-foreground">=</span>
            <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg px-3 py-2 text-center">
              <p className="text-sm text-muted-foreground">df/dx</p>
              <p className="text-sm font-mono font-bold text-amber-300">{computation.dfdx.toFixed(4)}</p>
            </div>
          </div>
        </div>

        {/* Gradient magnitude bar */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-muted-foreground w-20">|df/dx|</span>
          <div className="flex-1 h-4 bg-muted/50 rounded-full overflow-hidden border border-border/50">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(Math.abs(computation.dfdx) / 6 * 100, 100)}%`,
                backgroundColor: computation.dfdx >= 0 ? '#6366f1' : '#f43f5e',
              }}
            />
          </div>
          <span className="text-xs font-mono w-16 text-right">{Math.abs(computation.dfdx).toFixed(3)}</span>
        </div>

        <div className="mt-3 bg-violet-500/5 border border-violet-500/10 p-3 rounded-lg">
          <p className="text-xs text-violet-300 leading-relaxed italic">
            The chain rule multiplies local derivatives at each stage. Color brightness tracks gradient magnitude - watch it change as x moves.
          </p>
        </div>
      </div>
    </div>
  )
}
