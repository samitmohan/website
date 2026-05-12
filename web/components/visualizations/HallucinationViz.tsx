'use client'

import { useState } from 'react'

const source = 'The Eiffel Tower was built in 1889 for the World Fair in Paris. It stands 330 meters tall and was designed by Gustave Eiffel. The tower receives about 7 million visitors annually.'

const claims = [
  { text: 'The Eiffel Tower was constructed in 1889', supported: true, evidence: 'Source states "built in 1889"' },
  { text: 'for the World Fair held in Paris.', supported: true, evidence: 'Source confirms "World Fair in Paris"' },
  { text: 'It reaches a height of 330 meters', supported: true, evidence: 'Source says "stands 330 meters tall"' },
  { text: 'and was designed by Gustave Eiffel and his team of 50 engineers.', supported: false, evidence: 'Source only mentions Gustave Eiffel. The "team of 50 engineers" is not in the source.' },
  { text: 'The tower attracts approximately 7 million visitors each year', supported: true, evidence: 'Source confirms "about 7 million visitors annually"' },
  { text: 'making it the most visited paid monument in the world.', supported: false, evidence: 'Source never mentions rankings or comparisons to other monuments.' },
]

export default function HallucinationViz() {
  const [selected, setSelected] = useState<number | null>(null)
  const [showAll, setShowAll] = useState(false)

  const supported = claims.filter(c => c.supported).length
  const total = claims.length
  const score = supported / total

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-200">Hallucination Detection</h3>
          <p className="text-xs text-gray-500">Click claims to inspect evidence</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAll(!showAll)}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${showAll ? 'bg-[#7F56D9] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {showAll ? 'Hide All' : 'Show All'}
          </button>
          <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${score > 0.7 ? 'bg-emerald-400' : score > 0.4 ? 'bg-yellow-400' : 'bg-red-400'}`} />
            <span className="text-xs font-mono text-gray-300">{(score * 100).toFixed(0)}% faithful</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <div className="text-xs uppercase font-bold text-gray-500 mb-1">Source Document</div>
          <div className="bg-white/5 border border-border rounded-lg p-3">
            <p className="text-xs text-gray-300 leading-relaxed">{source}</p>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase font-bold text-gray-500 mb-1">Generated Text (click claims)</div>
          <div className="bg-white/5 border border-border rounded-lg p-3">
            <p className="text-xs leading-relaxed">
              {claims.map((c, i) => (
                <span key={i} onClick={() => setSelected(selected === i ? null : i)}
                  className={`cursor-pointer transition-all rounded px-0.5 ${
                    c.supported
                      ? 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border-b border-emerald-500/30'
                      : 'bg-red-500/15 text-red-300 hover:bg-red-500/25 border-b border-red-500/30'
                  } ${selected === i ? 'ring-1 ring-white/30' : ''}`}>
                  {c.text}{' '}
                </span>
              ))}
            </p>
          </div>
        </div>

        {(selected !== null || showAll) && (
          <div className="space-y-2">
            <div className="text-xs uppercase font-bold text-gray-500">Evidence Analysis</div>
            {(showAll ? claims : [claims[selected!]]).map((c, i) => (
              <div key={i} className={`border rounded-lg p-2.5 ${c.supported ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold uppercase ${c.supported ? 'text-emerald-400' : 'text-red-400'}`}>
                    {c.supported ? 'SUPPORTED' : 'HALLUCINATED'}
                  </span>
                </div>
                <p className="text-sm text-gray-400 italic">"{c.text.trim()}"</p>
                <p className="text-sm text-gray-300 mt-1">{c.evidence}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl text-center">
            <div className="text-xs uppercase font-bold text-emerald-400/70">Supported</div>
            <div className="text-lg font-mono font-bold text-emerald-400">{supported}</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 p-2 rounded-xl text-center">
            <div className="text-xs uppercase font-bold text-red-400/70">Hallucinated</div>
            <div className="text-lg font-mono font-bold text-red-400">{total - supported}</div>
          </div>
          <div className="bg-[#7F56D9]/10 border border-[#7F56D9]/20 p-2 rounded-xl text-center">
            <div className="text-xs uppercase font-bold text-[#9E77ED]/70">Total</div>
            <div className="text-lg font-mono font-bold text-[#9E77ED]">{total}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
