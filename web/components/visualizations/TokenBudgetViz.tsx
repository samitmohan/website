'use client'

import { useState } from 'react'

interface BudgetSlice { label: string; color: string; min: number; max: number; default: number }

const SLICES: BudgetSlice[] = [
  { label: 'System Prompt', color: '#7F56D9', min: 100, max: 4000, default: 600 },
  { label: 'Few-Shot Examples', color: '#9E77ED', min: 0, max: 6000, default: 1200 },
  { label: 'User Context / RAG', color: '#B692F6', min: 0, max: 8000, default: 3000 },
  { label: 'Response Reserve', color: '#D6BBFB', min: 256, max: 4096, default: 2048 },
]

export default function TokenBudgetViz() {
  const [maxBudget, setMaxBudget] = useState(8192)
  const [values, setValues] = useState(SLICES.map(s => s.default))

  const total = values.reduce((a, b) => a + b, 0)
  const exceeded = total > maxBudget
  const remaining = maxBudget - total
  const barH = 32

  const update = (idx: number, val: number) => {
    const next = [...values]
    next[idx] = val
    setValues(next)
  }

  return (
    <div className="p-6 bg-card rounded-xl border border-border max-w-2xl mx-auto">
      <h3 className="text-gray-300 font-semibold text-lg mb-1">Token Budget Planner</h3>
      <p className="text-gray-500 text-sm mb-5">Allocate tokens across prompt sections. Keep within the model's context limit.</p>

      <div className="mb-5">
        <label className="text-gray-400 text-sm">
          Context limit: <span className="text-white font-mono">{maxBudget.toLocaleString()}</span>
        </label>
        <input type="range" min={2048} max={32768} step={512} value={maxBudget}
          onChange={e => setMaxBudget(Number(e.target.value))} className="w-full accent-[#7F56D9] mt-1" />
      </div>

      {/* Stacked bar */}
      <div className="mb-5">
        <svg width="100%" height={barH + 8} viewBox={`0 0 500 ${barH + 8}`} preserveAspectRatio="none">
          {(() => {
            let x = 0
            const denom = Math.max(total, maxBudget)
            return values.map((v, i) => {
              const w = (v / denom) * 500
              const rect = (
                <rect key={i} x={x} y={4} width={Math.max(w - 0.5, 1)} height={barH}
                  fill={exceeded ? '#EF4444' : SLICES[i].color} rx={i === 0 ? 4 : 0} opacity={0.85} />
              )
              x += w
              return rect
            })
          })()}
          {!exceeded && remaining > 0 && (
            <rect x={(total / Math.max(total, maxBudget)) * 500} y={4}
              width={Math.max((remaining / maxBudget) * 500, 0)} height={barH} fill="#1E293B" rx={0} />
          )}
        </svg>
      </div>

      {/* Sliders */}
      <div className="space-y-4 mb-5">
        {SLICES.map((slice, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ background: slice.color }} />
                <span className="text-gray-300 text-sm">{slice.label}</span>
              </div>
              <span className="font-mono text-sm text-gray-400">{values[i].toLocaleString()}</span>
            </div>
            <input type="range" min={slice.min} max={slice.max} step={64} value={values[i]}
              onChange={e => update(i, Number(e.target.value))} className="w-full accent-[#7F56D9]" />
            <div className="flex justify-between text-gray-600 text-xs">
              <span>{slice.min}</span><span>{slice.max}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className={`flex items-center justify-between text-sm p-3 rounded-lg border ${
        exceeded ? 'border-red-500/40 bg-red-500/10' : 'border-border bg-white/[0.02]'
      }`}>
        <div>
          <span className="text-gray-400">Total: </span>
          <span className={`font-mono ${exceeded ? 'text-red-400' : 'text-white'}`}>{total.toLocaleString()}</span>
          <span className="text-gray-500"> / {maxBudget.toLocaleString()}</span>
        </div>
        {exceeded ? (
          <span className="text-red-400 font-medium text-sm">
            Over by {(total - maxBudget).toLocaleString()} tokens
          </span>
        ) : (
          <span className="text-green-400/70 text-sm">{remaining.toLocaleString()} remaining</span>
        )}
      </div>

      {exceeded && (
        <p className="text-red-400/70 text-xs mt-2">
          Reduce allocations or increase the context limit to fit within budget.
        </p>
      )}
    </div>
  )
}
