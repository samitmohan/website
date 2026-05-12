'use client'

import { useState, useMemo } from 'react'

const EXPERTS = ['Math', 'Code', 'Language', 'Science', 'Creative', 'Logic', 'Memory', 'Spatial']
const TOKENS = ['def', 'solve(', 'x**2', '+ 3*x', '- 7)', ':', 'return', 'roots']

function computeGating(tokenIdx: number, topK: number): { weights: number[]; topIndices: number[] } {
  // Simulated gating scores per token
  const raw = EXPERTS.map((_, i) => {
    const base = Math.sin((tokenIdx + 1) * (i + 1) * 0.7) * 2
    const bias = (i === 1 || i === 0) ? 1.5 : 0 // Code and Math bias for code tokens
    return base + bias
  })
  const maxR = Math.max(...raw)
  const exps = raw.map(v => Math.exp(v - maxR))
  const sum = exps.reduce((a, b) => a + b, 0)
  const weights = exps.map(e => e / sum)

  const sorted = weights.map((w, i) => ({ w, i })).sort((a, b) => b.w - a.w)
  const topIndices = sorted.slice(0, topK).map(s => s.i)
  return { weights, topIndices }
}

export default function MixtureOfExpertsViz() {
  const [selectedToken, setSelectedToken] = useState(2)
  const [topK, setTopK] = useState(2)

  const { weights, topIndices } = useMemo(
    () => computeGating(selectedToken, topK), [selectedToken, topK]
  )

  // Track usage across all tokens for load balancing
  const usage = useMemo(() => {
    const counts = new Array(EXPERTS.length).fill(0)
    TOKENS.forEach((_, ti) => {
      const { topIndices: ti2 } = computeGating(ti, topK)
      ti2.forEach(idx => { counts[idx] += 1 })
    })
    return counts
  }, [topK])

  const maxUsage = Math.max(...usage, 1)
  const maxWeight = Math.max(...weights)

  return (
    <div className="p-6 bg-card rounded-xl border border-border">
      <h3 className="text-gray-300 text-lg font-semibold mb-1">Mixture of Experts Routing</h3>
      <p className="text-gray-500 text-sm mb-4">Select a token. The gating network routes it to top-K experts.</p>

      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex gap-1">
          {TOKENS.map((tok, i) => (
            <button key={i} onClick={() => setSelectedToken(i)}
              className={`px-2.5 py-1.5 rounded font-mono text-sm border transition-colors ${selectedToken === i ? 'bg-[#7F56D9]/30 border-[#7F56D9] text-[#9E77ED]' : 'bg-white/5 border-border text-gray-400 hover:bg-white/10'}`}>
              {tok}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Top-K:</span>
          {[1, 2, 3].map(k => (
            <button key={k} onClick={() => setTopK(k)}
              className={`w-8 h-8 rounded text-sm border transition-colors ${topK === k ? 'bg-[#7F56D9]/30 border-[#7F56D9] text-[#9E77ED]' : 'bg-white/5 border-border text-gray-400'}`}>
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Expert routing weights */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-5">
        {EXPERTS.map((name, i) => {
          const active = topIndices.includes(i)
          const w = weights[i]
          return (
            <div key={i} className={`flex items-center gap-2 transition-opacity ${active ? 'opacity-100' : 'opacity-30'}`}>
              <span className={`text-xs font-mono w-16 ${active ? 'text-[#9E77ED]' : 'text-gray-500'}`}>{name}</span>
              <div className="flex-1 h-5 bg-black/30 rounded overflow-hidden relative">
                <div className="h-full rounded transition-all duration-300"
                  style={{ width: `${(w / maxWeight) * 100}%`, background: active ? '#7F56D9' : '#333' }} />
                <span className="absolute right-1 top-0.5 text-xs text-gray-400 font-mono">{(w * 100).toFixed(1)}%</span>
              </div>
              {active && <span className="text-xs text-yellow-400">active</span>}
            </div>
          )
        })}
      </div>

      {/* Combined output */}
      <div className="flex gap-6 items-start flex-wrap">
        <div className="bg-black/20 rounded-lg p-3 border border-border flex-1 min-w-[200px]">
          <div className="text-gray-400 text-xs mb-2">Weighted Combination</div>
          <div className="flex gap-1 items-center flex-wrap">
            {topIndices.map((idx, i) => (
              <span key={idx} className="text-sm">
                <span className="text-[#9E77ED] font-mono">{(weights[idx] * 100).toFixed(0)}%</span>
                <span className="text-gray-500"> x </span>
                <span className="text-gray-300">{EXPERTS[idx]}</span>
                {i < topIndices.length - 1 && <span className="text-gray-600 mx-1">+</span>}
              </span>
            ))}
          </div>
        </div>

        <div className="min-w-[220px]">
          <div className="text-gray-400 text-xs mb-2">Load Balance (activations across all tokens)</div>
          <div className="space-y-1">
            {EXPERTS.map((name, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-gray-500 text-xs font-mono w-14">{name}</span>
                <div className="flex-1 h-3 bg-black/30 rounded overflow-hidden">
                  <div className="h-full rounded" style={{
                    width: `${(usage[i] / maxUsage) * 100}%`,
                    background: usage[i] > TOKENS.length * 0.5 ? '#ef4444' : '#7F56D9'
                  }} />
                </div>
                <span className="text-gray-500 text-xs w-4">{usage[i]}</span>
              </div>
            ))}
          </div>
          <div className="text-gray-600 text-xs mt-1">Red = overloaded expert</div>
        </div>
      </div>
    </div>
  )
}
