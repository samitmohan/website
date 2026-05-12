'use client'

import { useState } from 'react'

interface TokenData {
  word: string
  goodProb: number
  badProb: number
}

const SENTENCE: TokenData[] = [
  { word: 'The', goodProb: 0.82, badProb: 0.15 },
  { word: 'cat', goodProb: 0.65, badProb: 0.08 },
  { word: 'sat', goodProb: 0.71, badProb: 0.12 },
  { word: 'on', goodProb: 0.88, badProb: 0.20 },
  { word: 'the', goodProb: 0.91, badProb: 0.14 },
  { word: 'warm', goodProb: 0.42, badProb: 0.05 },
  { word: 'mat', goodProb: 0.55, badProb: 0.07 },
  { word: '.', goodProb: 0.93, badProb: 0.22 },
]

function computePerplexity(tokens: TokenData[], model: 'good' | 'bad'): number {
  const n = tokens.length
  const sumLogProb = tokens.reduce((s, t) => s + Math.log(model === 'good' ? t.goodProb : t.badProb), 0)
  return Math.exp(-sumLogProb / n)
}

export default function PerplexityViz() {
  const [selectedToken, setSelectedToken] = useState<number | null>(null)
  const [activeModel, setActiveModel] = useState<'good' | 'bad' | 'both'>('both')

  const goodPPL = computePerplexity(SENTENCE, 'good')
  const badPPL = computePerplexity(SENTENCE, 'bad')

  function probColor(prob: number): string {
    if (prob >= 0.7) return 'text-green-400'
    if (prob >= 0.4) return 'text-yellow-400'
    return 'text-red-400'
  }

  function barColor(prob: number): string {
    if (prob >= 0.7) return 'rgba(74, 222, 128, 0.6)'
    if (prob >= 0.4) return 'rgba(250, 204, 21, 0.6)'
    return 'rgba(248, 113, 113, 0.5)'
  }

  const showGood = activeModel === 'good' || activeModel === 'both'
  const showBad = activeModel === 'bad' || activeModel === 'both'

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-purple-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6m6 0h10M7 19V9l5-5 5 5v10"/></svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Perplexity Comparison</h3>
          <p className="text-xs text-muted-foreground">PPL = exp(-1/N * sum(log P(t_i))) - lower is better</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4">
          <div className="bg-muted/40 border border-border/30 rounded-lg px-3 py-1.5 mb-4 text-center">
            <span className="text-xs font-mono text-purple-400">PPL = exp( -1/N * sum( log P(t_i) ) )</span>
          </div>

          {/* Sentence with per-token probabilities */}
          <div className="flex flex-wrap gap-1 mb-4 justify-center">
            {SENTENCE.map((tok, i) => {
              const isSelected = selectedToken === i
              return (
                <button key={i} onClick={() => setSelectedToken(isSelected ? null : i)} className={`flex flex-col items-center px-2 py-1 rounded-lg border transition cursor-pointer ${isSelected ? 'bg-purple-500/20 border-purple-500/40' : 'bg-muted/30 border-border/30 hover:bg-muted/50'}`}>
                  {showGood && <span className={`text-sm font-mono ${probColor(tok.goodProb)}`}>{tok.goodProb.toFixed(2)}</span>}
                  <span className="text-sm font-medium">{tok.word}</span>
                  {showBad && <span className={`text-sm font-mono ${probColor(tok.badProb)}`}>{tok.badProb.toFixed(2)}</span>}
                </button>
              )
            })}
          </div>

          {/* Bar chart comparison */}
          <svg viewBox="0 0 400 120" className="w-full h-auto">
            {SENTENCE.map((tok, i) => {
              const barW = 36
              const gap = (400 - SENTENCE.length * barW) / (SENTENCE.length + 1)
              const x = gap + i * (barW + gap)
              const isSelected = selectedToken === i
              return (
                <g key={i}>
                  {showGood && (
                    <rect x={x} y={80 - tok.goodProb * 70} width={barW / 2 - 1} height={tok.goodProb * 70} rx={2} fill={barColor(tok.goodProb)} stroke={isSelected ? '#a855f7' : 'none'} strokeWidth={1} />
                  )}
                  {showBad && (
                    <rect x={x + barW / 2 + 1} y={80 - tok.badProb * 70} width={barW / 2 - 1} height={tok.badProb * 70} rx={2} fill={barColor(tok.badProb)} stroke={isSelected ? '#a855f7' : 'none'} strokeWidth={1} opacity={0.7} />
                  )}
                  <text x={x + barW / 2} y={95} textAnchor="middle" fill="currentColor" fillOpacity={isSelected ? 1 : 0.5} fontSize={9}>{tok.word}</text>
                  {isSelected && <line x1={x} y1={0} x2={x} y2={80} stroke="#a855f7" strokeWidth={0.5} strokeDasharray="2,2" />}
                </g>
              )
            })}
            {/* Legend */}
            {showGood && <><rect x={310} y={100} width={8} height={8} rx={1} fill="rgba(74, 222, 128, 0.6)" /><text x={322} y={108} fill="currentColor" fillOpacity={0.5} fontSize={8}>Good</text></>}
            {showBad && <><rect x={350} y={100} width={8} height={8} rx={1} fill="rgba(248, 113, 113, 0.5)" /><text x={362} y={108} fill="currentColor" fillOpacity={0.5} fontSize={8}>Bad</text></>}
          </svg>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">Show Model</label>
            <div className="flex gap-1">
              {(['both', 'good', 'bad'] as const).map(m => (
                <button key={m} onClick={() => setActiveModel(m)} className={`text-xs px-3 py-1 rounded-lg border transition ${activeModel === m ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'border-border text-muted-foreground hover:bg-muted/50'}`}>
                  {m === 'both' ? 'Both' : m === 'good' ? 'Good' : 'Bad'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl">
            <div className="text-xs uppercase font-bold text-muted-foreground mb-2">Perplexity Scores</div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-green-400">Good Model</span>
              <span className="text-xs font-mono text-green-400">{goodPPL.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-red-400">Bad Model</span>
              <span className="text-xs font-mono text-red-400">{badPPL.toFixed(2)}</span>
            </div>
          </div>

          {selectedToken !== null && (
            <div className="bg-muted border border-border p-3 rounded-xl">
              <div className="text-xs uppercase font-bold text-muted-foreground mb-1">Token: "{SENTENCE[selectedToken].word}"</div>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-green-400">P(good)</span>
                  <span className="font-mono text-green-400">{SENTENCE[selectedToken].goodProb.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-400">P(bad)</span>
                  <span className="font-mono text-red-400">{SENTENCE[selectedToken].badProb.toFixed(3)}</span>
                </div>
                <div className="flex justify-between border-t border-border/50 pt-1 mt-1">
                  <span className="text-muted-foreground">-log P (good)</span>
                  <span className="font-mono text-green-400">{(-Math.log(SENTENCE[selectedToken].goodProb)).toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">-log P (bad)</span>
                  <span className="font-mono text-red-400">{(-Math.log(SENTENCE[selectedToken].badProb)).toFixed(3)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-auto bg-purple-500/5 border border-purple-500/10 p-3 rounded-lg">
            <p className="text-xs text-purple-300 leading-relaxed italic">
              A good model assigns high probability to the correct next token, yielding low perplexity. Click individual tokens to inspect their contribution.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
