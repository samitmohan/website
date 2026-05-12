'use client'

import { useState, useMemo } from 'react'

type ActivationType = 'relu' | 'leaky' | 'elu' | 'gelu' | 'swish'

const activations: Record<ActivationType, {
  label: string; color: string; formula: string; derivFormula: string
  fn: (x: number) => number; dfn: (x: number) => number
}> = {
  relu: {
    label: 'ReLU', color: '#3b82f6', formula: 'max(0, x)', derivFormula: 'x > 0 ? 1 : 0',
    fn: x => Math.max(0, x),
    dfn: x => x > 0 ? 1 : 0,
  },
  leaky: {
    label: 'LeakyReLU', color: '#f59e0b', formula: 'x > 0 ? x : 0.01x', derivFormula: 'x > 0 ? 1 : 0.01',
    fn: x => x > 0 ? x : 0.01 * x,
    dfn: x => x > 0 ? 1 : 0.01,
  },
  elu: {
    label: 'ELU', color: '#22c55e', formula: 'x > 0 ? x : e^x - 1', derivFormula: 'x > 0 ? 1 : e^x',
    fn: x => x > 0 ? x : Math.exp(x) - 1,
    dfn: x => x > 0 ? 1 : Math.exp(x),
  },
  gelu: {
    label: 'GELU', color: '#a855f7', formula: 'x * phi(x)', derivFormula: 'phi(x) + x * phi\'(x)',
    fn: x => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3))),
    dfn: x => {
      const c = Math.sqrt(2 / Math.PI)
      const t = Math.tanh(c * (x + 0.044715 * x ** 3))
      const sech2 = 1 - t * t
      return 0.5 * (1 + t) + 0.5 * x * sech2 * c * (1 + 3 * 0.044715 * x * x)
    },
  },
  swish: {
    label: 'Swish', color: '#f43f5e', formula: 'x * sigmoid(x)', derivFormula: 'sig(x) + x*sig(x)*(1-sig(x))',
    fn: x => x / (1 + Math.exp(-x)),
    dfn: x => { const s = 1 / (1 + Math.exp(-x)); return s + x * s * (1 - s) },
  },
}

export default function ReLUViz() {
  const [selected, setSelected] = useState<ActivationType>('relu')
  const [pointX, setPointX] = useState(1.0)

  const act = activations[selected]
  const pointY = act.fn(pointX)
  const pointDy = act.dfn(pointX)

  const svgW = 500, svgH = 260, padX = 40, padY = 30
  const xMin = -4, xMax = 4, yMin = -2, yMax = 4

  const toSvg = (vx: number, vy: number) => ({
    x: padX + ((vx - xMin) / (xMax - xMin)) * (svgW - 2 * padX),
    y: padY + (1 - (vy - yMin) / (yMax - yMin)) * (svgH - 2 * padY),
  })

  const makePath = (fn: (x: number) => number) => {
    const pts = Array.from({ length: 160 }, (_, i) => {
      const vx = xMin + (i / 159) * (xMax - xMin)
      const vy = Math.max(yMin, Math.min(yMax, fn(vx)))
      return toSvg(vx, vy)
    })
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  }

  const allTypes = Object.keys(activations) as ActivationType[]

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-blue-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" /></svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Activation Functions</h3>
          <p className="text-xs text-muted-foreground">Compare ReLU, LeakyReLU, ELU, GELU, Swish. Drag the point.</p>
        </div>
      </div>

      <div className="p-4">
        {/* Radio buttons */}
        <div className="flex flex-wrap gap-2 mb-3">
          {allTypes.map(key => {
            const a = activations[key]
            return (
              <button key={key} onClick={() => setSelected(key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${selected === key ? 'text-white' : 'text-muted-foreground bg-muted border-border'}`}
                style={selected === key ? { backgroundColor: a.color, borderColor: a.color } : {}}
              >{a.label}</button>
            )
          })}
        </div>

        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full bg-muted/30 rounded-xl border border-border/50">
          {/* Grid */}
          {[-2, 0, 2, 4].map(v => {
            const p = toSvg(0, v)
            return <line key={`h${v}`} x1={padX} y1={p.y} x2={svgW - padX} y2={p.y} stroke="#333" strokeWidth={v === 0 ? 1 : 0.5} />
          })}
          {[-4, -2, 0, 2, 4].map(v => {
            const p = toSvg(v, 0)
            return <line key={`v${v}`} x1={p.x} y1={padY} x2={p.x} y2={svgH - padY} stroke="#333" strokeWidth={v === 0 ? 1 : 0.5} />
          })}

          {/* All curves dim */}
          {allTypes.filter(k => k !== selected).map(key => (
            <path key={key} d={makePath(activations[key].fn)} fill="none" stroke={activations[key].color} strokeWidth={1} opacity={0.2} />
          ))}

          {/* Selected curve bold */}
          <path d={makePath(act.fn)} fill="none" stroke={act.color} strokeWidth={2.5} />

          {/* Draggable point */}
          {(() => {
            const p = toSvg(pointX, pointY)
            return (
              <>
                <line x1={p.x} y1={padY} x2={p.x} y2={svgH - padY} stroke={act.color} strokeWidth={0.5} strokeDasharray="3 2" opacity={0.5} />
                <circle cx={p.x} cy={p.y} r={6} fill={act.color} stroke="white" strokeWidth={2} />
              </>
            )
          })()}

          {/* Axis labels */}
          <text x={svgW - padX + 5} y={toSvg(0, 0).y + 4} className="fill-muted-foreground text-sm">x</text>
          <text x={toSvg(0, 0).x - 10} y={padY - 5} className="fill-muted-foreground text-sm">y</text>
        </svg>

        {/* Point slider */}
        <div className="flex items-center gap-3 mt-3">
          <label className="text-xs font-bold text-muted-foreground">x =</label>
          <input type="range" min="-3.5" max="3.5" step="0.05" value={pointX} onChange={e => setPointX(parseFloat(e.target.value))} className="flex-1" style={{ accentColor: act.color }} />
          <span className="text-xs font-mono w-10 text-right">{pointX.toFixed(2)}</span>
        </div>

        {/* Info panel */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="bg-muted/50 rounded-lg border border-border/50 p-2 text-center">
            <p className="text-sm text-muted-foreground">f(x) formula</p>
            <p className="text-xs font-mono font-bold" style={{ color: act.color }}>{act.formula}</p>
          </div>
          <div className="bg-muted/50 rounded-lg border border-border/50 p-2 text-center">
            <p className="text-sm text-muted-foreground">f({pointX.toFixed(2)})</p>
            <p className="text-sm font-mono font-bold" style={{ color: act.color }}>{pointY.toFixed(4)}</p>
          </div>
          <div className="bg-muted/50 rounded-lg border border-border/50 p-2 text-center">
            <p className="text-sm text-muted-foreground">f'({pointX.toFixed(2)})</p>
            <p className="text-sm font-mono font-bold" style={{ color: act.color }}>{pointDy.toFixed(4)}</p>
          </div>
        </div>

        <div className="mt-2 bg-muted/30 rounded-lg border border-border/30 p-2 text-center">
          <p className="text-sm text-muted-foreground">f'(x) = <span className="font-mono" style={{ color: act.color }}>{act.derivFormula}</span></p>
        </div>
      </div>
    </div>
  )
}
