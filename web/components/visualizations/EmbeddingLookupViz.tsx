'use client'

import { useState } from 'react'

const VOCAB = ['cat', 'dog', 'king', 'queen', 'run', 'walk', 'the', 'a']
const EMBED_DIM = 6

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

function getEmbedding(rowIdx: number): number[] {
  return Array.from({ length: EMBED_DIM }, (_, d) => {
    const val = seededRandom(rowIdx * 100 + d * 7 + 3)
    return Math.round((val * 2 - 1) * 100) / 100
  })
}

function valToColor(v: number): string {
  if (v > 0.5) return 'bg-red-500/60 text-red-100'
  if (v > 0.1) return 'bg-red-500/25 text-red-200'
  if (v < -0.5) return 'bg-blue-500/60 text-blue-100'
  if (v < -0.1) return 'bg-blue-500/25 text-blue-200'
  return 'bg-muted/50 text-muted-foreground'
}

export default function EmbeddingLookupViz() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

  const matrix = VOCAB.map((_, i) => getEmbedding(i))
  const selectedEmbed = selectedIdx !== null ? matrix[selectedIdx] : null

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-purple-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 3v18" /></svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Embedding Lookup</h3>
          <p className="text-xs text-muted-foreground">Token index maps to a row in the embedding matrix</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <label className="text-xs uppercase font-bold text-muted-foreground block">Click a word to look up its embedding</label>

        <div className="flex gap-4 items-start">
          {/* Vocabulary list */}
          <div className="space-y-1 shrink-0">
            <div className="text-sm uppercase font-bold text-muted-foreground mb-1">Vocab (idx)</div>
            {VOCAB.map((word, i) => (
              <button key={i} onClick={() => setSelectedIdx(i === selectedIdx ? null : i)} className={`block w-full text-left text-xs font-mono px-2 py-1 rounded border transition-all ${i === selectedIdx ? 'bg-purple-500/30 border-purple-500/50 text-purple-200 ring-2 ring-purple-400/30' : 'bg-muted/50 border-border text-muted-foreground hover:border-purple-500/30'}`}>
                [{i}] {word}
              </button>
            ))}
          </div>

          {/* Embedding matrix */}
          <div className="flex-1 overflow-x-auto">
            <div className="text-sm uppercase font-bold text-muted-foreground mb-1">
              Embedding Matrix ({VOCAB.length} x {EMBED_DIM})
            </div>
            <div className="space-y-[2px]">
              {/* Header */}
              <div className="flex gap-[2px]">
                <div className="w-10" />
                {Array.from({ length: EMBED_DIM }, (_, d) => (
                  <div key={d} className="w-12 text-center text-[8px] text-muted-foreground font-mono">d{d}</div>
                ))}
              </div>
              {matrix.map((row, ri) => (
                <div key={ri} className={`flex gap-[2px] rounded transition-all ${ri === selectedIdx ? 'ring-2 ring-purple-400/50' : ''}`}>
                  <div className="w-10 text-sm font-mono text-muted-foreground flex items-center">{VOCAB[ri]}</div>
                  {row.map((val, ci) => (
                    <div key={ci} className={`w-12 h-6 flex items-center justify-center text-sm font-mono rounded-sm transition-all ${ri === selectedIdx ? valToColor(val) + ' font-bold' : 'bg-muted/30 text-muted-foreground/50'}`}>
                      {val.toFixed(2)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Output vector */}
        {selectedEmbed && selectedIdx !== null && (
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-2 block">
              Output Embedding for "{VOCAB[selectedIdx]}"
            </label>
            <div className="flex gap-1">
              {selectedEmbed.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-full h-10 rounded flex items-center justify-center text-xs font-mono font-bold ${valToColor(val)}`}>
                    {val.toFixed(2)}
                  </div>
                  <span className="text-[8px] text-muted-foreground">d{i}</span>
                </div>
              ))}
            </div>
            {/* Bar chart of values */}
            <svg viewBox={`0 0 ${EMBED_DIM * 50} 60`} className="w-full h-14 mt-2">
              {selectedEmbed.map((val, i) => {
                const barH = Math.abs(val) * 50
                const y = val > 0 ? 30 - barH : 30
                return (
                  <g key={i}>
                    <line x1={0} y1={30} x2={EMBED_DIM * 50} y2={30} stroke="currentColor" className="text-border" strokeWidth="0.5" />
                    <rect x={i * 50 + 10} y={y} width={30} height={barH} rx={2} fill={val > 0 ? '#ef4444' : '#3b82f6'} opacity={0.6} />
                    <text x={i * 50 + 25} y={55} textAnchor="middle" className="fill-muted-foreground text-[8px]">d{i}</text>
                  </g>
                )
              })}
            </svg>
          </div>
        )}

        <div className="bg-purple-500/5 border border-purple-500/10 p-3 rounded-lg">
          <div className="text-xs text-purple-300 leading-relaxed">
            <span className="font-bold">How it works:</span> Each token maps to an integer index. The embedding layer stores a matrix of shape (vocab_size, d_model). A lookup extracts the row for the given index - no matrix multiplication needed.
          </div>
        </div>
      </div>
    </div>
  )
}
