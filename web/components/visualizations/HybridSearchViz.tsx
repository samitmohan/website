'use client'

import { useState, useMemo } from 'react'

type SearchMode = 'dense' | 'sparse' | 'hybrid'

interface Doc {
  id: string
  title: string
  denseScore: number
  sparseScore: number
  keywords: string[]
  x: number
  y: number
}

const QUERY = 'machine learning optimization'
const QUERY_KEYWORDS = ['machine', 'learning', 'optimization']

const DOCS: Doc[] = [
  { id: 'D1', title: 'Neural Network Optimization', denseScore: 0.92, sparseScore: 0.85, keywords: ['neural', 'network', 'optimization', 'gradient'], x: 72, y: 35 },
  { id: 'D2', title: 'Machine Learning Basics', denseScore: 0.88, sparseScore: 0.91, keywords: ['machine', 'learning', 'basics', 'intro'], x: 68, y: 42 },
  { id: 'D3', title: 'Deep Learning Frameworks', denseScore: 0.85, sparseScore: 0.40, keywords: ['deep', 'learning', 'pytorch', 'tensorflow'], x: 60, y: 50 },
  { id: 'D4', title: 'SGD and Adam Optimizer', denseScore: 0.82, sparseScore: 0.78, keywords: ['sgd', 'adam', 'optimization', 'learning', 'rate'], x: 65, y: 38 },
  { id: 'D5', title: 'Convex Optimization Theory', denseScore: 0.55, sparseScore: 0.88, keywords: ['convex', 'optimization', 'machine', 'theory'], x: 30, y: 70 },
  { id: 'D6', title: 'Transformer Architecture', denseScore: 0.78, sparseScore: 0.20, keywords: ['transformer', 'attention', 'architecture'], x: 55, y: 55 },
  { id: 'D7', title: 'Bayesian Machine Learning', denseScore: 0.75, sparseScore: 0.72, keywords: ['bayesian', 'machine', 'learning', 'probability'], x: 50, y: 45 },
  { id: 'D8', title: 'Hyperparameter Optimization', denseScore: 0.70, sparseScore: 0.82, keywords: ['hyperparameter', 'optimization', 'tuning', 'machine'], x: 42, y: 60 },
]

function rrfScore(denseRank: number, sparseRank: number, k = 60): number {
  return 1 / (k + denseRank) + 1 / (k + sparseRank)
}

export default function HybridSearchViz() {
  const [mode, setMode] = useState<SearchMode>('hybrid')
  const [showFusion, setShowFusion] = useState(true)

  const denseRanked = useMemo(() => [...DOCS].sort((a, b) => b.denseScore - a.denseScore), [])
  const sparseRanked = useMemo(() => [...DOCS].sort((a, b) => b.sparseScore - a.sparseScore), [])

  const hybridRanked = useMemo(() => {
    const denseRankMap = new Map(denseRanked.map((d, i) => [d.id, i + 1]))
    const sparseRankMap = new Map(sparseRanked.map((d, i) => [d.id, i + 1]))
    return [...DOCS]
      .map((d) => ({
        ...d,
        rrfScore: rrfScore(denseRankMap.get(d.id)!, sparseRankMap.get(d.id)!),
        denseRank: denseRankMap.get(d.id)!,
        sparseRank: sparseRankMap.get(d.id)!,
      }))
      .sort((a, b) => b.rrfScore - a.rrfScore)
  }, [denseRanked, sparseRanked])

  const activeList = mode === 'dense' ? denseRanked : mode === 'sparse' ? sparseRanked : hybridRanked

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-cyan-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-cyan-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /><path d="M8 11h6" /><path d="M11 8v6" /></svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Hybrid Search</h3>
          <p className="text-xs text-muted-foreground">Dense vectors + sparse BM25 fused with Reciprocal Rank Fusion</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Query display */}
        <div className="bg-muted/40 border border-border rounded-lg px-3 py-2 flex items-center gap-2">
          <span className="text-xs uppercase font-bold text-muted-foreground">Query:</span>
          <span className="text-xs font-mono text-cyan-300">&quot;{QUERY}&quot;</span>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2">
          {(['dense', 'sparse', 'hybrid'] as SearchMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex-1 ${
                mode === m
                  ? m === 'dense' ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 font-bold'
                    : m === 'sparse' ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                    : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold'
                  : 'border-border text-muted-foreground hover:bg-accent'
              }`}
            >
              {m === 'dense' ? 'Dense (Vector)' : m === 'sparse' ? 'Sparse (BM25)' : 'Hybrid (RRF)'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Dense search panel */}
          <div className={`border rounded-xl p-3 transition-all ${mode === 'sparse' ? 'opacity-30 border-border' : 'opacity-100 border-indigo-500/30'}`}>
            <div className="text-xs uppercase font-bold text-indigo-400 mb-2">Dense Search - Embedding Space</div>
            <svg viewBox="0 0 100 100" className="w-full h-32 bg-muted/20 rounded-lg mb-2">
              {/* Query point */}
              <circle cx="75" cy="30" r="4" fill="#f43f5e" opacity="0.8" />
              <text x="75" y="24" textAnchor="middle" fill="#f43f5e" fontSize="4" fontWeight="bold">Q</text>
              {/* Doc points */}
              {DOCS.map((d, i) => {
                const rank = denseRanked.findIndex((r) => r.id === d.id) + 1
                const isTop3 = rank <= 3
                return (
                  <g key={d.id}>
                    {isTop3 && <line x1="75" y1="30" x2={d.x} y2={d.y} stroke="#6366f1" strokeWidth="0.5" opacity="0.4" />}
                    <circle cx={d.x} cy={d.y} r={isTop3 ? 3 : 2} fill={isTop3 ? '#6366f1' : '#6366f1'} opacity={isTop3 ? 0.9 : 0.3} />
                    <text x={d.x} y={d.y - 4} textAnchor="middle" fill={isTop3 ? '#6366f1' : '#9ca3af'} fontSize="3">{d.id}</text>
                  </g>
                )
              })}
            </svg>
            <div className="text-sm text-muted-foreground">Finds semantically similar docs via cosine similarity in vector space.</div>
          </div>

          {/* Sparse search panel */}
          <div className={`border rounded-xl p-3 transition-all ${mode === 'dense' ? 'opacity-30 border-border' : 'opacity-100 border-amber-500/30'}`}>
            <div className="text-xs uppercase font-bold text-amber-400 mb-2">Sparse Search - BM25 Keyword Match</div>
            <div className="space-y-1 mb-2">
              {sparseRanked.slice(0, 4).map((d, i) => (
                <div key={d.id} className="flex items-center gap-1 text-sm">
                  <span className="text-amber-400 font-mono w-3">{i + 1}</span>
                  <span className="text-muted-foreground flex-1 truncate">{d.title}</span>
                  <div className="flex gap-0.5">
                    {d.keywords.map((kw) => (
                      <span key={kw} className={`px-1 rounded text-[8px] ${
                        QUERY_KEYWORDS.includes(kw) ? 'bg-amber-500/20 text-amber-300' : 'bg-muted text-muted-foreground'
                      }`}>{kw}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">Counts exact keyword matches weighted by term frequency and document length.</div>
          </div>
        </div>

        {/* Fusion / Results */}
        {mode === 'hybrid' && showFusion && (
          <div className="bg-muted/30 border border-cyan-500/20 rounded-xl p-3">
            <div className="text-xs uppercase font-bold text-cyan-400 mb-2">Reciprocal Rank Fusion</div>
            <div className="text-sm font-mono text-muted-foreground mb-2">RRF(d) = 1/(k + rank_dense) + 1/(k + rank_sparse), k=60</div>
          </div>
        )}

        {/* Ranked results */}
        <div className="bg-muted/20 border border-border rounded-xl p-3">
          <div className="text-xs uppercase font-bold text-muted-foreground mb-2">
            {mode === 'hybrid' ? 'Hybrid' : mode === 'dense' ? 'Dense' : 'Sparse'} Results
          </div>
          <div className="space-y-1">
            {activeList.slice(0, 6).map((d, i) => {
              const score = mode === 'dense' ? d.denseScore : mode === 'sparse' ? d.sparseScore : (d as typeof hybridRanked[0]).rrfScore
              const color = mode === 'dense' ? '#6366f1' : mode === 'sparse' ? '#f59e0b' : '#06b6d4'
              return (
                <div key={d.id} className="flex items-center gap-2 text-xs" style={{ transition: 'all 0.3s ease' }}>
                  <span className="w-4 text-right font-mono font-bold" style={{ color }}>{i + 1}</span>
                  <span className="font-medium text-foreground flex-1 truncate">{d.title}</span>
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score * 100}%`, backgroundColor: color }} />
                  </div>
                  <span className="font-mono text-muted-foreground w-10 text-right">{score.toFixed(3)}</span>
                  {mode === 'hybrid' && (
                    <span className="text-[8px] text-muted-foreground font-mono">
                      D{(d as typeof hybridRanked[0]).denseRank} S{(d as typeof hybridRanked[0]).sparseRank}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <button
          onClick={() => setShowFusion(!showFusion)}
          className="text-xs text-cyan-400 hover:text-cyan-300 transition"
        >
          {showFusion ? 'Hide' : 'Show'} fusion details
        </button>

        <div className="bg-cyan-500/5 border border-cyan-500/10 p-3 rounded-lg">
          <p className="text-xs text-cyan-300 leading-relaxed">
            {mode === 'dense' && 'Dense search excels at semantic similarity - "optimization" matches "SGD and Adam" because they share meaning, not keywords.'}
            {mode === 'sparse' && 'Sparse search excels at exact keyword matching - "Convex Optimization Theory" ranks high because it contains the exact query terms.'}
            {mode === 'hybrid' && 'Hybrid search combines both signals. RRF merges ranked lists without needing score normalization - a doc ranked high by both methods rises to the top.'}
          </p>
        </div>
      </div>
    </div>
  )
}
