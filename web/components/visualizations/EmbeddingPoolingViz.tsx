'use client'

import { useState } from 'react'

const TOKENS = [
  { label: '[CLS]', values: [0.8, 0.2, 0.5, 0.1, 0.9, 0.3] },
  { label: 'The', values: [0.3, 0.7, 0.2, 0.6, 0.1, 0.8] },
  { label: 'cat', values: [0.6, 0.4, 0.9, 0.3, 0.5, 0.7] },
  { label: 'sat', values: [0.2, 0.8, 0.3, 0.7, 0.4, 0.2] },
  { label: 'on', values: [0.4, 0.5, 0.6, 0.2, 0.7, 0.5] },
  { label: 'the', values: [0.3, 0.6, 0.2, 0.5, 0.1, 0.9] },
  { label: 'mat', values: [0.7, 0.3, 0.8, 0.4, 0.6, 0.1] },
]

const DIM_COLORS = ['#6366f1', '#f43f5e', '#34d399', '#f59e0b', '#8b5cf6', '#06b6d4']

type Strategy = 'cls' | 'mean' | 'max' | 'last'

function computePooled(strategy: Strategy): number[] {
  const dims = TOKENS[0].values.length
  if (strategy === 'cls') return TOKENS[0].values
  if (strategy === 'last') return TOKENS[TOKENS.length - 1].values
  if (strategy === 'mean') {
    return Array.from({ length: dims }, (_, d) => {
      const sum = TOKENS.reduce((acc, t) => acc + t.values[d], 0)
      return sum / TOKENS.length
    })
  }
  // max pooling
  return Array.from({ length: dims }, (_, d) => {
    return Math.max(...TOKENS.map((t) => t.values[d]))
  })
}

const STRATEGIES: { key: Strategy; label: string; desc: string }[] = [
  { key: 'cls', label: 'CLS Token', desc: 'Takes only the [CLS] token embedding. BERT-style - the CLS token is trained to aggregate sentence meaning during pre-training.' },
  { key: 'mean', label: 'Mean Pool', desc: 'Averages all token embeddings element-wise. Most common for sentence embeddings - captures information from every token equally.' },
  { key: 'max', label: 'Max Pool', desc: 'Takes the element-wise maximum across all tokens. Picks the strongest activation per dimension - good for capturing salient features.' },
  { key: 'last', label: 'Last Token', desc: 'Takes only the final token embedding. Used by GPT-style (causal) models where the last token has seen all prior context.' },
]

export default function EmbeddingPoolingViz() {
  const [strategy, setStrategy] = useState<Strategy>('mean')
  const [collapsed, setCollapsed] = useState(false)
  const pooled = computePooled(strategy)

  const highlightedTokens = strategy === 'cls' ? [0] : strategy === 'last' ? [TOKENS.length - 1] : TOKENS.map((_, i) => i)

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-indigo-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="8" y="14" width="8" height="7" rx="1" /></svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Embedding Pooling Strategies</h3>
          <p className="text-xs text-muted-foreground">How multiple token embeddings collapse into a single sentence vector</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Strategy buttons */}
        <div className="flex flex-wrap gap-2">
          {STRATEGIES.map((s) => (
            <button
              key={s.key}
              onClick={() => { setStrategy(s.key); setCollapsed(false) }}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                strategy === s.key
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 font-bold'
                  : 'border-border text-muted-foreground hover:bg-accent'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Token embeddings grid */}
        <div className="bg-muted/30 border border-border rounded-xl p-3">
          <div className="text-xs uppercase font-bold text-muted-foreground mb-2">Token Embeddings (6 dimensions)</div>
          <div className="space-y-1.5">
            {TOKENS.map((token, ti) => {
              const active = highlightedTokens.includes(ti)
              return (
                <div
                  key={ti}
                  className={`flex items-center gap-2 transition-all duration-300 ${
                    active ? 'opacity-100' : 'opacity-30'
                  } ${collapsed && !active ? 'h-0 overflow-hidden' : ''}`}
                  style={{ transition: 'all 0.4s ease' }}
                >
                  <span className={`text-xs font-mono w-10 text-right ${
                    ti === 0 ? 'text-amber-400 font-bold' : ti === TOKENS.length - 1 ? 'text-cyan-400 font-bold' : 'text-muted-foreground'
                  }`}>
                    {token.label}
                  </span>
                  <div className="flex gap-0.5 flex-1">
                    {token.values.map((v, di) => (
                      <div
                        key={di}
                        className="flex-1 rounded-sm transition-all duration-300"
                        style={{
                          height: `${Math.max(4, v * 32)}px`,
                          backgroundColor: DIM_COLORS[di],
                          opacity: active ? 0.8 : 0.2,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-mono text-muted-foreground w-8">
                    [{token.values[0].toFixed(1)}...]
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Collapse animation button */}
        <div className="flex justify-center">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-xs px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 transition-all flex items-center gap-2"
          >
            <svg className={`w-3 h-3 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 14l-7-7-7 7" />
            </svg>
            {collapsed ? 'Expand tokens' : 'Collapse to pooled vector'}
          </button>
        </div>

        {/* Pooled result */}
        <div className={`transition-all duration-500 ${collapsed ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-0'}`}>
          <div className="bg-muted border border-indigo-500/30 rounded-xl p-3">
            <div className="text-xs uppercase font-bold text-indigo-400 mb-2">
              Pooled Result ({STRATEGIES.find((s) => s.key === strategy)?.label})
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-indigo-300 w-10 text-right">output</span>
              <div className="flex gap-0.5 flex-1">
                {pooled.map((v, di) => (
                  <div key={di} className="flex-1 flex flex-col items-center gap-0.5">
                    <div
                      className="w-full rounded-sm transition-all duration-500"
                      style={{
                        height: `${Math.max(4, v * 32)}px`,
                        backgroundColor: DIM_COLORS[di],
                        opacity: 0.9,
                      }}
                    />
                    <span className="text-[8px] font-mono text-muted-foreground">{v.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Strategy explanation */}
        <div className="bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-lg">
          <p className="text-xs text-indigo-300 leading-relaxed">
            {STRATEGIES.find((s) => s.key === strategy)?.desc}
          </p>
          {strategy === 'mean' && (
            <p className="text-xs text-emerald-400 mt-1 font-bold">
              Mean pooling is the default for most modern sentence transformers (e.g., all-MiniLM, BGE, E5).
            </p>
          )}
        </div>

        {/* Formula */}
        <div className="bg-muted/30 border border-border rounded-lg p-2">
          <div className="text-xs font-mono text-center text-muted-foreground">
            {strategy === 'cls' && 'h_sentence = h_[CLS]'}
            {strategy === 'mean' && 'h_sentence = (1/n) * SUM(h_i) for i=1..n'}
            {strategy === 'max' && 'h_sentence[d] = MAX(h_i[d]) for i=1..n'}
            {strategy === 'last' && 'h_sentence = h_[last]'}
          </div>
        </div>
      </div>
    </div>
  )
}
