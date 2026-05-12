'use client'

import { useState } from 'react'

const context = 'Machine learning models require training data to learn patterns. Supervised learning uses labeled datasets where each example has an input-output pair. Neural networks with multiple layers are called deep learning models. Training involves minimizing a loss function through gradient descent.'

const response = 'Machine learning models learn from training data by identifying patterns. In supervised learning, labeled datasets provide input-output pairs for the model. Deep learning uses neural networks with many layers. Models are optimized by minimizing loss via gradient descent. Transformers are the dominant architecture for NLP tasks.'

const initialClaims = [
  { text: 'ML models learn from training data by identifying patterns', contextRef: 'models require training data to learn patterns', defaultSupported: true },
  { text: 'Supervised learning uses labeled datasets with input-output pairs', contextRef: 'Supervised learning uses labeled datasets where each example has an input-output pair', defaultSupported: true },
  { text: 'Deep learning uses neural networks with many layers', contextRef: 'Neural networks with multiple layers are called deep learning models', defaultSupported: true },
  { text: 'Models are optimized by minimizing loss via gradient descent', contextRef: 'minimizing a loss function through gradient descent', defaultSupported: true },
  { text: 'Transformers are the dominant architecture for NLP tasks', contextRef: null, defaultSupported: false },
]

export default function FaithfulnessViz() {
  const [overrides, setOverrides] = useState<Record<number, boolean>>({})
  const [hoveredClaim, setHoveredClaim] = useState<number | null>(null)

  const getSupported = (i: number) => overrides[i] ?? initialClaims[i].defaultSupported

  const toggle = (i: number) => {
    setOverrides(prev => ({ ...prev, [i]: !getSupported(i) }))
  }

  const supported = initialClaims.filter((_, i) => getSupported(i)).length
  const total = initialClaims.length
  const score = supported / total

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-200">Faithfulness Evaluation</h3>
          <p className="text-xs text-gray-500">Toggle claims to mark as supported or unsupported</p>
        </div>
        <div className="bg-white/5 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <span className="text-xs uppercase font-bold text-gray-500">Score</span>
          <span className={`text-sm font-mono font-bold ${score >= 0.8 ? 'text-emerald-400' : score >= 0.5 ? 'text-yellow-400' : 'text-red-400'}`}>
            {(score * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <div className="text-xs uppercase font-bold text-gray-500 mb-1">Context</div>
          <div className="bg-white/5 border border-border rounded-lg p-3">
            <p className="text-xs text-gray-300 leading-relaxed">
              {hoveredClaim !== null && initialClaims[hoveredClaim].contextRef
                ? context.split(initialClaims[hoveredClaim].contextRef!).map((part, i, arr) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && <mark className="bg-[#7F56D9]/30 text-[#9E77ED] rounded px-0.5">{initialClaims[hoveredClaim].contextRef}</mark>}
                    </span>
                  ))
                : context}
            </p>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase font-bold text-gray-500 mb-1">Generated Response</div>
          <div className="bg-white/5 border border-border rounded-lg p-3">
            <p className="text-xs text-gray-400 leading-relaxed">{response}</p>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase font-bold text-gray-500 mb-1">Extracted Claims</div>
          <div className="space-y-1.5">
            {initialClaims.map((claim, i) => {
              const sup = getSupported(i)
              return (
                <div key={i}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                    sup ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10' : 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'
                  }`}
                  onMouseEnter={() => setHoveredClaim(i)}
                  onMouseLeave={() => setHoveredClaim(null)}
                  onClick={() => toggle(i)}>
                  <button className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                    sup ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {sup ? '\u2713' : '\u2717'}
                  </button>
                  <span className="text-xs text-gray-300 flex-1">{claim.text}</span>
                  {claim.contextRef
                    ? <span className="text-sm text-[#9E77ED] bg-[#7F56D9]/10 px-1.5 py-0.5 rounded">has ref</span>
                    : <span className="text-sm text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">no ref</span>}
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white/5 rounded-full h-3 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#7F56D9] to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${score * 100}%` }} />
          </div>
          <span className="text-xs font-mono text-gray-400">{supported}/{total} supported</span>
        </div>

        <div className="bg-[#7F56D9]/5 border border-[#7F56D9]/10 p-2 rounded-lg">
          <p className="text-xs text-gray-400 leading-relaxed">
            Faithfulness measures whether each claim in the generated response can be attributed to the provided context. Hover a claim to highlight its source reference. Click to toggle support status.
          </p>
        </div>
      </div>
    </div>
  )
}
