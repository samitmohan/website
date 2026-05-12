'use client'

import { useState, useMemo } from 'react'

const examples = [
  { question: 'What causes rain?', answer: 'Water evaporates, forms clouds, and precipitates as rain.', similarity: 0.92 },
  { question: 'What causes rain?', answer: 'Photosynthesis converts sunlight to energy in plants.', similarity: 0.12 },
  { question: 'How does TCP work?', answer: 'TCP establishes connections with a three-way handshake and ensures reliable delivery.', similarity: 0.88 },
  { question: 'How does TCP work?', answer: 'The weather forecast predicts sunshine tomorrow.', similarity: 0.05 },
]

const W = 320, H = 320, CX = W / 2, CY = H / 2

export default function RelevancyViz() {
  const [selected, setSelected] = useState(0)
  const [threshold, setThreshold] = useState(0.5)

  const ex = examples[selected]
  const isRelevant = ex.similarity >= threshold

  // Position question at center, answer at distance proportional to (1 - similarity)
  const dist = useMemo(() => {
    const maxDist = 120
    return maxDist * (1 - ex.similarity)
  }, [ex.similarity])

  const ansAngle = -Math.PI / 4
  const ansX = CX + dist * Math.cos(ansAngle)
  const ansY = CY + dist * Math.sin(ansAngle)

  // Concentric rings for similarity zones
  const rings = [
    { r: 30, label: '0.9+', color: '#10b981' },
    { r: 60, label: '0.7+', color: '#7F56D9' },
    { r: 90, label: '0.5+', color: '#eab308' },
    { r: 120, label: '<0.5', color: '#ef4444' },
  ]

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-200">Relevancy Scoring</h3>
          <p className="text-xs text-gray-500">Semantic similarity in embedding space</p>
        </div>
        <div className={`px-2 py-1 rounded-lg text-xs font-bold ${isRelevant ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
          {isRelevant ? 'RELEVANT' : 'NOT RELEVANT'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="p-4 flex justify-center bg-white/[0.02]">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-xs">
            {/* Concentric rings */}
            {rings.map((ring, i) => (
              <circle key={i} cx={CX} cy={CY} r={ring.r} fill="none" stroke={ring.color} strokeWidth={0.5} strokeDasharray="4,4" opacity={0.3} />
            ))}

            {/* Threshold ring */}
            <circle cx={CX} cy={CY} r={120 * (1 - threshold)} fill="none" stroke="#7F56D9" strokeWidth={1.5} strokeDasharray="6,3" opacity={0.6} />
            <text x={CX + 120 * (1 - threshold) + 4} y={CY - 4} fill="#9E77ED" fontSize={8}>threshold</text>

            {/* Connection line */}
            <line x1={CX} y1={CY} x2={ansX} y2={ansY} stroke={isRelevant ? '#10b981' : '#ef4444'} strokeWidth={1.5} strokeDasharray={isRelevant ? 'none' : '4,3'} opacity={0.6} />

            {/* Question point */}
            <circle cx={CX} cy={CY} r={8} fill="#7F56D9" stroke="#9E77ED" strokeWidth={1.5} />
            <text x={CX} y={CY - 14} fill="#9E77ED" fontSize={9} fontWeight="bold" textAnchor="middle">Q</text>

            {/* Answer point */}
            <circle cx={ansX} cy={ansY} r={8} fill={isRelevant ? '#10b981' : '#ef4444'} stroke={isRelevant ? '#34d399' : '#f87171'} strokeWidth={1.5} />
            <text x={ansX} y={ansY - 14} fill={isRelevant ? '#34d399' : '#f87171'} fontSize={9} fontWeight="bold" textAnchor="middle">A</text>

            {/* Similarity label */}
            <text x={(CX + ansX) / 2 + 10} y={(CY + ansY) / 2 - 6} fill="#e5e7eb" fontSize={10} fontWeight="bold" textAnchor="middle">
              {ex.similarity.toFixed(2)}
            </text>

            {/* Ring labels */}
            {rings.map((ring, i) => (
              <text key={i} x={CX + ring.r - 2} y={CY + 12} fill={ring.color} fontSize={7} textAnchor="end" opacity={0.5}>{ring.label}</text>
            ))}
          </svg>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <div className="text-xs uppercase font-bold text-gray-500 mb-1">Select Example</div>
            <div className="space-y-1">
              {examples.map((e, i) => (
                <button key={i} onClick={() => setSelected(i)}
                  className={`w-full text-left p-2 rounded-lg text-sm border transition-colors ${
                    selected === i ? 'bg-[#7F56D9]/10 border-[#7F56D9]/30 text-gray-200' : 'bg-white/5 border-border text-gray-500 hover:bg-white/10'}`}>
                  <span className="text-gray-400">Q:</span> {e.question.slice(0, 25)}... <span className="font-mono text-[#9E77ED]">{e.similarity.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase font-bold text-gray-500 mb-1">Threshold: {threshold.toFixed(2)}</div>
            <input type="range" min={0} max={1} step={0.05} value={threshold} onChange={e => setThreshold(+e.target.value)}
              className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-[#7F56D9]" />
          </div>

          <div className="bg-white/5 border border-border rounded-lg p-2 space-y-1.5">
            <div>
              <span className="text-xs uppercase font-bold text-gray-500">Question: </span>
              <span className="text-xs text-gray-300">{ex.question}</span>
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-gray-500">Answer: </span>
              <span className="text-xs text-gray-300">{ex.answer}</span>
            </div>
          </div>

          <div className="bg-[#7F56D9]/5 border border-[#7F56D9]/10 p-2 rounded-lg">
            <p className="text-xs text-gray-400 leading-relaxed">
              Relevancy measures how well an answer addresses a question. Points closer to the center share more semantic meaning. The threshold ring determines the accept/reject boundary.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
