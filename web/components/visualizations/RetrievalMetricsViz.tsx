'use client'

import { useState, useMemo } from 'react'

interface Result {
  id: string
  title: string
  relevant: boolean
}

const INITIAL_RESULTS: Result[] = [
  { id: 'R1', title: 'Dropout prevents overfitting in neural networks', relevant: true },
  { id: 'R2', title: 'Batch normalization accelerates training', relevant: false },
  { id: 'R3', title: 'Dropout as a Bayesian approximation', relevant: true },
  { id: 'R4', title: 'Learning rate scheduling strategies', relevant: false },
  { id: 'R5', title: 'Regularization via random neuron masking', relevant: true },
  { id: 'R6', title: 'Understanding dropout layers in practice', relevant: true },
  { id: 'R7', title: 'Convolutional architecture overview', relevant: false },
  { id: 'R8', title: 'Monte Carlo dropout for uncertainty', relevant: true },
  { id: 'R9', title: 'Activation function survey', relevant: false },
  { id: 'R10', title: 'Weight decay vs dropout comparison', relevant: true },
]

const TOTAL_RELEVANT = 8 // total relevant docs in corpus

function computeMetrics(results: Result[], k: number) {
  const topK = results.slice(0, k)
  const relevantInTopK = topK.filter((r) => r.relevant).length

  const precision = relevantInTopK / k
  const recall = relevantInTopK / TOTAL_RELEVANT

  // MRR: reciprocal rank of first relevant result
  const firstRelevantIdx = results.findIndex((r) => r.relevant)
  const mrr = firstRelevantIdx >= 0 && firstRelevantIdx < k ? 1 / (firstRelevantIdx + 1) : 0

  // NDCG@k
  const dcg = topK.reduce((sum, r, i) => {
    return sum + (r.relevant ? 1 : 0) / Math.log2(i + 2)
  }, 0)
  // Ideal DCG: all relevant docs at top
  const idealTopK = [...topK].sort((a, b) => (b.relevant ? 1 : 0) - (a.relevant ? 1 : 0))
  const idcg = idealTopK.reduce((sum, r, i) => {
    return sum + (r.relevant ? 1 : 0) / Math.log2(i + 2)
  }, 0)
  const ndcg = idcg > 0 ? dcg / idcg : 0

  return { precision, recall, mrr, ndcg, relevantInTopK }
}

export default function RetrievalMetricsViz() {
  const [results, setResults] = useState<Result[]>(INITIAL_RESULTS)
  const [k, setK] = useState(5)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [showFormula, setShowFormula] = useState<string | null>(null)

  const metrics = useMemo(() => computeMetrics(results, k), [results, k])

  const moveItem = (fromIdx: number, toIdx: number) => {
    const newResults = [...results]
    const [item] = newResults.splice(fromIdx, 1)
    newResults.splice(toIdx, 0, item)
    setResults(newResults)
  }

  const FORMULAS: Record<string, { formula: string; explanation: string }> = {
    precision: {
      formula: `P@${k} = relevant_in_top_${k} / ${k} = ${metrics.relevantInTopK} / ${k} = ${metrics.precision.toFixed(3)}`,
      explanation: 'What fraction of retrieved results are relevant? Higher precision means less noise.',
    },
    recall: {
      formula: `R@${k} = relevant_in_top_${k} / total_relevant = ${metrics.relevantInTopK} / ${TOTAL_RELEVANT} = ${metrics.recall.toFixed(3)}`,
      explanation: `What fraction of all ${TOTAL_RELEVANT} relevant docs did we find? Higher recall means fewer missed results.`,
    },
    mrr: {
      formula: `MRR = 1 / rank_of_first_relevant = 1 / ${results.findIndex((r) => r.relevant) + 1} = ${metrics.mrr.toFixed(3)}`,
      explanation: 'How quickly do we surface the first relevant result? MRR=1 means the top result is relevant.',
    },
    ndcg: {
      formula: `NDCG@${k} = DCG@${k} / IDCG@${k} = ${metrics.ndcg.toFixed(3)}`,
      explanation: 'Penalizes relevant results appearing lower. A relevant doc at rank 5 is worth less than at rank 1. NDCG=1 means perfect ranking.',
    },
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-amber-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-amber-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h18v18H3z" /><path d="M3 9h18M3 15h18M9 3v18" /></svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Retrieval Metrics Dashboard</h3>
          <p className="text-xs text-muted-foreground">Drag results to reorder and see how metrics change in real time</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* K slider */}
        <div>
          <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">
            K = {k} (evaluate top-{k} results)
          </label>
          <input type="range" min={1} max={10} step={1} value={k} onChange={(e) => setK(parseInt(e.target.value))} className="w-full accent-amber-500" />
          <div className="flex justify-between text-sm text-muted-foreground"><span>1</span><span>10</span></div>
        </div>

        {/* Metrics cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            { key: 'precision', label: 'Precision@K', value: metrics.precision, color: '#6366f1' },
            { key: 'recall', label: 'Recall@K', value: metrics.recall, color: '#34d399' },
            { key: 'mrr', label: 'MRR', value: metrics.mrr, color: '#f59e0b' },
            { key: 'ndcg', label: 'NDCG@K', value: metrics.ndcg, color: '#f43f5e' },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => setShowFormula(showFormula === m.key ? null : m.key)}
              className={`bg-muted/30 border rounded-xl p-2 text-left transition-all hover:bg-muted/50 ${
                showFormula === m.key ? 'border-opacity-50' : 'border-border'
              }`}
              style={showFormula === m.key ? { borderColor: m.color + '80' } : {}}
            >
              <div className="text-sm uppercase font-bold text-muted-foreground">{m.label}</div>
              <div className="text-lg font-bold font-mono" style={{ color: m.color }}>{m.value.toFixed(3)}</div>
              <div className="w-full h-1 bg-muted rounded-full mt-1 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${m.value * 100}%`, backgroundColor: m.color }} />
              </div>
            </button>
          ))}
        </div>

        {/* Formula display */}
        {showFormula && FORMULAS[showFormula] && (
          <div className="bg-muted/30 border border-border rounded-xl p-3">
            <div className="text-xs font-mono text-amber-300 mb-1">{FORMULAS[showFormula].formula}</div>
            <div className="text-xs text-muted-foreground">{FORMULAS[showFormula].explanation}</div>
          </div>
        )}

        {/* Results list - draggable */}
        <div className="bg-muted/20 border border-border rounded-xl p-3">
          <div className="text-xs uppercase font-bold text-muted-foreground mb-2">
            Retrieved Results (drag to reorder)
          </div>
          <div className="space-y-1">
            {results.map((r, i) => {
              const inTopK = i < k
              const isBeingDragged = dragIdx === i
              return (
                <div
                  key={r.id}
                  draggable
                  onDragStart={() => setDragIdx(i)}
                  onDragOver={(e) => { e.preventDefault() }}
                  onDrop={() => {
                    if (dragIdx !== null && dragIdx !== i) moveItem(dragIdx, i)
                    setDragIdx(null)
                  }}
                  onDragEnd={() => setDragIdx(null)}
                  className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded cursor-grab active:cursor-grabbing transition-all ${
                    isBeingDragged ? 'opacity-50 scale-95' : ''
                  } ${inTopK ? 'bg-muted/40' : 'opacity-40'} ${
                    inTopK && i === k - 1 ? 'border-b-2 border-dashed border-amber-500/30' : ''
                  }`}
                >
                  <span className="w-4 text-right font-mono text-muted-foreground">{i + 1}</span>
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${r.relevant ? 'bg-emerald-400/80' : 'bg-red-400/80'}`} />
                  <span className="flex-1 truncate">{r.title}</span>
                  <span className={`text-sm font-mono ${r.relevant ? 'text-emerald-400' : 'text-red-400'}`}>
                    {r.relevant ? 'relevant' : 'irrelevant'}
                  </span>
                  {inTopK && (
                    <span className="text-[8px] font-mono text-muted-foreground">
                      1/log2({i + 2})={( 1 / Math.log2(i + 2)).toFixed(2)}
                    </span>
                  )}
                  <svg className="w-3 h-3 text-muted-foreground/30 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                  </svg>
                </div>
              )
            })}
          </div>
          {k < results.length && (
            <div className="text-sm text-amber-400/60 mt-1 text-center">--- cutoff at K={k} ---</div>
          )}
        </div>

        {/* Reset button */}
        <button
          onClick={() => setResults(INITIAL_RESULTS)}
          className="text-xs text-muted-foreground hover:text-foreground transition flex items-center gap-1"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 109-9M3 3v9h9" /></svg>
          Reset order
        </button>

        <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg">
          <p className="text-xs text-amber-300 leading-relaxed">
            NDCG is the gold standard for ranking evaluation. Move a relevant document from rank 1 to rank 5 and watch NDCG drop - the log2 discount means position 1 is worth 2.5x more than position 5. Precision treats all positions equally; NDCG captures that users rarely scroll past the first few results.
          </p>
        </div>
      </div>
    </div>
  )
}
