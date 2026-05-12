'use client'

import { useState } from 'react'

const CRITERIA = [
  { key: 'relevance', label: 'Relevance', description: 'How well does the response address the question?' },
  { key: 'coherence', label: 'Coherence', description: 'Is the response logically structured and readable?' },
  { key: 'factuality', label: 'Factuality', description: 'Are the claims accurate and verifiable?' },
  { key: 'completeness', label: 'Completeness', description: 'Does the response cover all aspects of the question?' },
]

const RESPONSES = {
  prompt: 'Explain how neural networks learn from data.',
  a: {
    label: 'Response A',
    text: 'Neural networks learn by adjusting weights through backpropagation. The loss function measures prediction error, and gradient descent updates weights to minimize it. Training iterates over batches of data until convergence.',
    scores: { relevance: 0.92, coherence: 0.88, factuality: 0.95, completeness: 0.72 },
  },
  b: {
    label: 'Response B',
    text: 'Neural networks use layers of neurons. Each layer transforms the input. They are inspired by the human brain and can recognize patterns. Deep learning uses many layers. Training requires lots of data and GPUs.',
    scores: { relevance: 0.65, coherence: 0.71, factuality: 0.80, completeness: 0.55 },
  },
}

export default function LLMJudgeViz() {
  const [activeCriterion, setActiveCriterion] = useState<string | null>(null)

  const avgScore = (scores: Record<string, number>) => {
    const vals = Object.values(scores)
    return vals.reduce((a, b) => a + b, 0) / vals.length
  }

  const avgA = avgScore(RESPONSES.a.scores)
  const avgB = avgScore(RESPONSES.b.scores)
  const winner = avgA > avgB ? 'A' : 'B'

  const barColor = (score: number) => {
    if (score >= 0.85) return '#34d399'
    if (score >= 0.7) return '#fbbf24'
    return '#f87171'
  }

  const displayCriteria = activeCriterion ? CRITERIA.filter(c => c.key === activeCriterion) : CRITERIA

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-indigo-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold">LLM-as-Judge</h3>
          <p className="text-xs text-muted-foreground">Evaluating response quality across multiple criteria</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 space-y-3">
          {/* Prompt */}
          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-2">
            <div className="text-sm uppercase font-bold text-indigo-400">Prompt</div>
            <div className="text-sm text-foreground/80 mt-1 font-mono">{RESPONSES.prompt}</div>
          </div>

          {/* Side by side responses */}
          <div className="grid grid-cols-2 gap-3">
            {(['a', 'b'] as const).map(key => {
              const resp = RESPONSES[key]
              const avg = key === 'a' ? avgA : avgB
              const isWinner = (key === 'a' && winner === 'A') || (key === 'b' && winner === 'B')
              return (
                <div
                  key={key}
                  className="border rounded-lg p-3 transition-all duration-300"
                  style={{
                    borderColor: isWinner ? '#34d39944' : 'rgba(255,255,255,0.06)',
                    backgroundColor: isWinner ? 'rgba(52,211,153,0.03)' : 'transparent',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold" style={{ color: key === 'a' ? '#818cf8' : '#f472b6' }}>
                      {resp.label}
                    </span>
                    {isWinner && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">WINNER</span>
                    )}
                  </div>
                  <div className="text-xs text-foreground/60 leading-relaxed">{resp.text}</div>
                  <div className="mt-2 text-sm font-mono text-muted-foreground">
                    Avg: <span style={{ color: barColor(avg) }}>{avg.toFixed(2)}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Score bars */}
          <div className="space-y-2">
            {displayCriteria.map(criterion => {
              const scoreA = RESPONSES.a.scores[criterion.key as keyof typeof RESPONSES.a.scores]
              const scoreB = RESPONSES.b.scores[criterion.key as keyof typeof RESPONSES.b.scores]
              return (
                <div key={criterion.key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground/70">{criterion.label}</span>
                    <span className="text-sm text-muted-foreground">{criterion.description}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-indigo-400 w-6">A</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${scoreA * 100}%`, backgroundColor: barColor(scoreA) }} />
                      </div>
                      <span className="text-sm font-mono w-8" style={{ color: barColor(scoreA) }}>{scoreA.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-pink-400 w-6">B</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${scoreB * 100}%`, backgroundColor: barColor(scoreB) }} />
                      </div>
                      <span className="text-sm font-mono w-8" style={{ color: barColor(scoreB) }}>{scoreB.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div className="space-y-1.5">
            <div className="text-xs uppercase font-bold text-muted-foreground">Filter by Criterion</div>
            <button
              onClick={() => setActiveCriterion(null)}
              className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg border transition ${!activeCriterion ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'border-border text-muted-foreground hover:bg-accent'}`}
            >
              All Criteria
            </button>
            {CRITERIA.map(c => (
              <button
                key={c.key}
                onClick={() => setActiveCriterion(c.key)}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg border transition ${activeCriterion === c.key ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'border-border text-muted-foreground hover:bg-accent'}`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-1">
            <div className="text-xs uppercase font-bold text-muted-foreground">Verdict</div>
            <div className="text-lg font-bold text-emerald-400">Response {winner} Wins</div>
            <div className="text-xs text-muted-foreground">
              A: {avgA.toFixed(2)} vs B: {avgB.toFixed(2)}
            </div>
          </div>

          <div className="mt-auto bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-lg">
            <p className="text-xs text-indigo-300 leading-relaxed italic">
              LLM-as-Judge uses a strong model to evaluate weaker model outputs across rubrics. Multi-criteria scoring reduces bias compared to single holistic ratings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
