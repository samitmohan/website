'use client'

import { useState } from 'react'

const D_MODEL = 6
const D_FF = 24

function relu(x: number) { return Math.max(0, x) }
function gelu(x: number) {
  return 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x * x * x)))
}

function seeded(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return (x - Math.floor(x)) * 2 - 1
}

export default function FeedForwardViz() {
  const [activation, setActivation] = useState<'relu' | 'gelu'>('relu')
  const [inputIdx, setInputIdx] = useState(0)

  const inputs = [
    [0.8, -0.3, 0.5, -0.7, 0.2, 0.9],
    [-0.4, 0.6, -0.1, 0.8, -0.5, 0.3],
    [0.1, 0.9, -0.6, 0.2, 0.7, -0.8],
  ]
  const input = inputs[inputIdx]

  // Simulated first linear projection: d_model -> d_ff
  const hidden = Array.from({ length: D_FF }, (_, j) => {
    let sum = 0
    for (let i = 0; i < D_MODEL; i++) sum += input[i] * seeded(i * 100 + j * 7)
    return sum * 0.4
  })

  const activated = hidden.map(v => activation === 'relu' ? relu(v) : gelu(v))

  // Second linear projection: d_ff -> d_model
  const output = Array.from({ length: D_MODEL }, (_, i) => {
    let sum = 0
    for (let j = 0; j < D_FF; j++) sum += activated[j] * seeded(j * 50 + i * 13 + 200)
    return Math.round(sum * 0.15 * 100) / 100
  })

  const maxAbs = (arr: number[]) => Math.max(...arr.map(Math.abs), 0.01)
  const barColor = (v: number) => v > 0 ? '#ef4444' : '#3b82f6'

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-orange-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-orange-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h4l3-9 4 18 3-9h4" /></svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Feed-Forward Network</h3>
          <p className="text-xs text-muted-foreground">Expand to d_ff (4x), activate, project back to d_model</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Controls */}
        <div className="flex gap-4 items-end">
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">Activation</label>
            <div className="flex gap-1">
              {(['relu', 'gelu'] as const).map(a => (
                <button key={a} onClick={() => setActivation(a)} className={`px-3 py-1 text-xs font-mono rounded border transition-all ${activation === a ? 'bg-orange-500/30 border-orange-500/50 text-orange-200' : 'bg-muted border-border text-muted-foreground hover:border-orange-500/30'}`}>
                  {a.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">Input Vector</label>
            <div className="flex gap-1">
              {inputs.map((_, i) => (
                <button key={i} onClick={() => setInputIdx(i)} className={`px-3 py-1 text-xs font-mono rounded border transition-all ${inputIdx === i ? 'bg-orange-500/30 border-orange-500/50 text-orange-200' : 'bg-muted border-border text-muted-foreground hover:border-orange-500/30'}`}>
                  #{i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dimension expansion diagram */}
        <svg viewBox="0 0 400 170" className="w-full">
          {/* Input bar (narrow) */}
          <rect x={10} y={55} width={20} height={60} rx={3} className="fill-blue-500/30 stroke-blue-500/50" strokeWidth="1" />
          <text x={20} y={48} textAnchor="middle" className="fill-blue-300 text-[7px] font-bold">d_model</text>
          <text x={20} y={128} textAnchor="middle" className="fill-muted-foreground text-[6px]">{D_MODEL}</text>

          {/* Arrow */}
          <line x1={35} y1={85} x2={60} y2={85} stroke="#f97316" strokeWidth="1" />
          <text x={48} y={78} textAnchor="middle" className="fill-muted-foreground text-[6px]">W1</text>

          {/* Hidden bar (wide) */}
          <rect x={65} y={15} width={40} height={140} rx={3} className="fill-orange-500/20 stroke-orange-500/40" strokeWidth="1" />
          <text x={85} y={10} textAnchor="middle" className="fill-orange-300 text-[7px] font-bold">d_ff (4x)</text>
          <text x={85} y={165} textAnchor="middle" className="fill-muted-foreground text-[6px]">{D_FF}</text>

          {/* Activation */}
          <line x1={110} y1={85} x2={140} y2={85} stroke="#f97316" strokeWidth="1" />
          <rect x={140} y={70} width={50} height={30} rx={4} className="fill-orange-500/30 stroke-orange-400" strokeWidth="1" />
          <text x={165} y={89} textAnchor="middle" className="fill-orange-200 text-[8px] font-bold">{activation.toUpperCase()}</text>

          {/* Arrow */}
          <line x1={195} y1={85} x2={225} y2={85} stroke="#f97316" strokeWidth="1" />
          <text x={210} y={78} textAnchor="middle" className="fill-muted-foreground text-[6px]">W2</text>

          {/* Activated hidden (wide) */}
          <rect x={230} y={15} width={40} height={140} rx={3} className="fill-orange-500/15 stroke-orange-500/30" strokeWidth="1" />
          <text x={250} y={10} textAnchor="middle" className="fill-orange-300/70 text-[6px]">activated</text>

          {/* Arrow */}
          <line x1={275} y1={85} x2={305} y2={85} stroke="#f97316" strokeWidth="1" />

          {/* Output bar (narrow) */}
          <rect x={310} y={55} width={20} height={60} rx={3} className="fill-emerald-500/30 stroke-emerald-500/50" strokeWidth="1" />
          <text x={320} y={48} textAnchor="middle" className="fill-emerald-300 text-[7px] font-bold">d_model</text>
          <text x={320} y={128} textAnchor="middle" className="fill-muted-foreground text-[6px]">{D_MODEL}</text>

          {/* Formula */}
          <text x={200} y={165} textAnchor="middle" className="fill-muted-foreground text-[7px] font-mono">FFN(x) = W2 * {activation}(W1 * x + b1) + b2</text>
        </svg>

        {/* Actual values */}
        <div className="grid grid-cols-3 gap-3">
          {/* Input */}
          <div>
            <div className="text-sm uppercase font-bold text-blue-300 mb-1">Input ({D_MODEL}d)</div>
            <div className="flex gap-[2px]">
              {input.map((v, i) => (
                <div key={i} className="flex-1 text-center">
                  <div className="h-8 rounded-sm relative overflow-hidden bg-muted/30">
                    <div className="absolute bottom-0 left-0 right-0 transition-all" style={{ height: `${(Math.abs(v) / maxAbs(input)) * 100}%`, backgroundColor: barColor(v), opacity: 0.5 }} />
                  </div>
                  <div className="text-[7px] font-mono text-muted-foreground mt-0.5">{v.toFixed(1)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hidden (sample of first 12) */}
          <div>
            <div className="text-sm uppercase font-bold text-orange-300 mb-1">Hidden (first 12/{D_FF})</div>
            <div className="flex gap-[1px]">
              {activated.slice(0, 12).map((v, i) => (
                <div key={i} className="flex-1 text-center">
                  <div className="h-8 rounded-sm relative overflow-hidden bg-muted/30">
                    <div className="absolute bottom-0 left-0 right-0 transition-all" style={{ height: `${Math.min((Math.abs(v) / maxAbs(activated.slice(0, 12))) * 100, 100)}%`, backgroundColor: v === 0 ? '#4b5563' : barColor(v), opacity: 0.5 }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[7px] text-muted-foreground mt-0.5">{activation === 'relu' ? `${activated.filter(v => v === 0).length}/${D_FF} zeroed` : 'All non-zero (GELU)'}</div>
          </div>

          {/* Output */}
          <div>
            <div className="text-sm uppercase font-bold text-emerald-300 mb-1">Output ({D_MODEL}d)</div>
            <div className="flex gap-[2px]">
              {output.map((v, i) => (
                <div key={i} className="flex-1 text-center">
                  <div className="h-8 rounded-sm relative overflow-hidden bg-muted/30">
                    <div className="absolute bottom-0 left-0 right-0 transition-all" style={{ height: `${(Math.abs(v) / maxAbs(output)) * 100}%`, backgroundColor: barColor(v), opacity: 0.5 }} />
                  </div>
                  <div className="text-[7px] font-mono text-muted-foreground mt-0.5">{v.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-orange-500/5 border border-orange-500/10 p-3 rounded-lg">
          <div className="text-xs text-orange-300 leading-relaxed">
            <span className="font-bold">Key insight:</span> The FFN expands to {D_FF} dimensions (4x), applies a nonlinearity, then projects back to {D_MODEL}. {activation === 'relu' ? 'ReLU zeros out negative values, creating sparse activations.' : 'GELU allows small negative values through, providing smoother gradients.'} This expansion acts as a memory bank where the model stores learned patterns.
          </div>
        </div>
      </div>
    </div>
  )
}
