'use client'

import { useState } from 'react'

interface Candidate {
  id: string
  title: string
  biScore: number
  crossScore: number
  relevant: boolean
}

const QUERY = 'How does dropout prevent overfitting?'

const CANDIDATES: Candidate[] = [
  { id: 'D1', title: 'Dropout: A Simple Way to Prevent Neural Networks from Overfitting', biScore: 0.89, crossScore: 0.97, relevant: true },
  { id: 'D2', title: 'Regularization Techniques in Deep Learning', biScore: 0.87, crossScore: 0.82, relevant: true },
  { id: 'D3', title: 'Batch Normalization: Accelerating Training', biScore: 0.85, crossScore: 0.45, relevant: false },
  { id: 'D4', title: 'Overfitting and Underfitting Explained', biScore: 0.83, crossScore: 0.78, relevant: true },
  { id: 'D5', title: 'Understanding Dropout Layers in Practice', biScore: 0.81, crossScore: 0.94, relevant: true },
  { id: 'D6', title: 'Learning Rate Scheduling Strategies', biScore: 0.79, crossScore: 0.30, relevant: false },
  { id: 'D7', title: 'Data Augmentation as Regularization', biScore: 0.77, crossScore: 0.68, relevant: true },
  { id: 'D8', title: 'Early Stopping in Neural Network Training', biScore: 0.75, crossScore: 0.62, relevant: false },
  { id: 'D9', title: 'Monte Carlo Dropout for Uncertainty', biScore: 0.73, crossScore: 0.91, relevant: true },
  { id: 'D10', title: 'Weight Decay vs Dropout Comparison', biScore: 0.71, crossScore: 0.88, relevant: true },
  { id: 'D11', title: 'Activation Functions Survey', biScore: 0.69, crossScore: 0.22, relevant: false },
  { id: 'D12', title: 'Transfer Learning Best Practices', biScore: 0.67, crossScore: 0.35, relevant: false },
]

export default function RerankingViz() {
  const [stage, setStage] = useState<'retrieve' | 'rerank' | 'compare'>('retrieve')
  const [topN, setTopN] = useState(5)

  const biEncoderResults = [...CANDIDATES].sort((a, b) => b.biScore - a.biScore)
  const crossEncoderResults = [...CANDIDATES].sort((a, b) => b.crossScore - a.crossScore)
  const displayList = stage === 'retrieve' ? biEncoderResults : crossEncoderResults

  const biTop = biEncoderResults.slice(0, topN)
  const crossTop = crossEncoderResults.slice(0, topN)
  const biPrecision = biTop.filter((d) => d.relevant).length / topN
  const crossPrecision = crossTop.filter((d) => d.relevant).length / topN

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-purple-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h12M3 18h6" /></svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Two-Stage Retrieval with Reranking</h3>
          <p className="text-xs text-muted-foreground">Bi-encoder retrieves fast, cross-encoder reranks for precision</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Query */}
        <div className="bg-muted/40 border border-border rounded-lg px-3 py-2">
          <span className="text-xs uppercase font-bold text-muted-foreground">Query: </span>
          <span className="text-xs font-mono text-purple-300">&quot;{QUERY}&quot;</span>
        </div>

        {/* Stage buttons */}
        <div className="flex gap-2">
          {[
            { key: 'retrieve' as const, label: 'Stage 1: Bi-Encoder', color: 'indigo' },
            { key: 'rerank' as const, label: 'Stage 2: Cross-Encoder', color: 'purple' },
            { key: 'compare' as const, label: 'Compare', color: 'emerald' },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setStage(s.key)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex-1 ${
                stage === s.key
                  ? `bg-${s.color}-500/20 border-${s.color}-500/40 text-${s.color}-300 font-bold`
                  : 'border-border text-muted-foreground hover:bg-accent'
              }`}
              style={stage === s.key ? {
                backgroundColor: s.color === 'indigo' ? 'rgb(99 102 241 / 0.2)' : s.color === 'purple' ? 'rgb(168 85 247 / 0.2)' : 'rgb(52 211 153 / 0.2)',
                borderColor: s.color === 'indigo' ? 'rgb(99 102 241 / 0.4)' : s.color === 'purple' ? 'rgb(168 85 247 / 0.4)' : 'rgb(52 211 153 / 0.4)',
                color: s.color === 'indigo' ? 'rgb(165 180 252)' : s.color === 'purple' ? 'rgb(216 180 254)' : 'rgb(110 231 183)',
              } : {}}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Architecture diagram */}
        <div className="flex items-center gap-1 text-sm font-mono text-muted-foreground justify-center">
          <div className={`px-2 py-1 rounded border ${stage === 'retrieve' ? 'border-indigo-500/50 text-indigo-300 bg-indigo-500/10' : 'border-border'}`}>
            Full Corpus (1M docs)
          </div>
          <span>-&gt;</span>
          <div className={`px-2 py-1 rounded border ${stage === 'retrieve' ? 'border-indigo-500/50 text-indigo-300 bg-indigo-500/10' : 'border-border'}`}>
            Bi-Encoder (fast, ~5ms)
          </div>
          <span>-&gt;</span>
          <div className="px-2 py-1 rounded border border-border">Top-{CANDIDATES.length}</div>
          <span>-&gt;</span>
          <div className={`px-2 py-1 rounded border ${stage === 'rerank' ? 'border-purple-500/50 text-purple-300 bg-purple-500/10' : 'border-border'}`}>
            Cross-Encoder (slow, ~200ms)
          </div>
          <span>-&gt;</span>
          <div className={`px-2 py-1 rounded border ${stage === 'rerank' ? 'border-purple-500/50 text-purple-300 bg-purple-500/10' : 'border-border'}`}>
            Top-{topN}
          </div>
        </div>

        {/* Slider for top-N */}
        <div>
          <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">
            Return top {topN} results
          </label>
          <input type="range" min={3} max={8} step={1} value={topN} onChange={(e) => setTopN(parseInt(e.target.value))} className="w-full accent-purple-500" />
        </div>

        {stage !== 'compare' ? (
          /* Single list view */
          <div className="bg-muted/20 border border-border rounded-xl p-3">
            <div className="text-xs uppercase font-bold text-muted-foreground mb-2">
              {stage === 'retrieve' ? 'Bi-Encoder Rankings (embed query and docs separately)' : 'Cross-Encoder Rankings (embed query+doc pairs jointly)'}
            </div>
            <div className="space-y-1">
              {displayList.map((d, i) => {
                const score = stage === 'retrieve' ? d.biScore : d.crossScore
                const isTop = i < topN
                const color = stage === 'retrieve' ? '#6366f1' : '#a855f7'
                return (
                  <div
                    key={d.id}
                    className={`flex items-center gap-2 text-xs px-2 py-1 rounded transition-all duration-500 ${
                      isTop ? 'bg-muted/40' : 'opacity-40'
                    }`}
                    style={{ transition: 'all 0.4s ease' }}
                  >
                    <span className="w-4 text-right font-mono font-bold" style={{ color: isTop ? color : undefined }}>{i + 1}</span>
                    <div className={`w-2 h-2 rounded-full ${d.relevant ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    <span className="flex-1 truncate">{d.title}</span>
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score * 100}%`, backgroundColor: color }} />
                    </div>
                    <span className="font-mono text-muted-foreground w-8 text-right">{score.toFixed(2)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* Compare view */
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Bi-Encoder Top-' + topN, list: biTop, color: '#6366f1', precision: biPrecision },
              { label: 'Cross-Encoder Top-' + topN, list: crossTop, color: '#a855f7', precision: crossPrecision },
            ].map((panel) => (
              <div key={panel.label} className="bg-muted/20 border border-border rounded-xl p-3">
                <div className="text-xs uppercase font-bold mb-2" style={{ color: panel.color }}>{panel.label}</div>
                <div className="space-y-1 mb-2">
                  {panel.list.map((d, i) => (
                    <div key={d.id} className="flex items-center gap-1 text-sm">
                      <span className="font-mono w-3" style={{ color: panel.color }}>{i + 1}</span>
                      <div className={`w-1.5 h-1.5 rounded-full ${d.relevant ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      <span className="truncate flex-1">{d.title}</span>
                    </div>
                  ))}
                </div>
                <div className="text-xs font-mono">
                  P@{topN} = <span style={{ color: panel.color }}>{panel.precision.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Explanation */}
        <div className="bg-purple-500/5 border border-purple-500/10 p-3 rounded-lg space-y-1">
          <div className="flex items-center gap-2 text-xs mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400" /> <span className="text-muted-foreground">Relevant</span>
            <div className="w-2 h-2 rounded-full bg-red-400" /> <span className="text-muted-foreground">Irrelevant</span>
          </div>
          <p className="text-xs text-purple-300 leading-relaxed">
            {stage === 'retrieve' && 'Bi-encoder embeds query and documents independently - fast enough for millions of docs but cannot capture fine-grained query-document interactions.'}
            {stage === 'rerank' && 'Cross-encoder processes [query, document] pairs jointly through the full transformer - sees word-level interactions but costs O(n) forward passes, so only runs on a small candidate set.'}
            {stage === 'compare' && `Cross-encoder reranking improved Precision@${topN} from ${biPrecision.toFixed(2)} to ${crossPrecision.toFixed(2)} by pushing truly relevant docs higher and demoting keyword-matched but irrelevant results.`}
          </p>
        </div>
      </div>
    </div>
  )
}
