'use client'

import { useState, useMemo } from 'react'

const EXAMPLES = [
  { reference: 'the cat sat on the mat', candidate: 'the cat sat on the mat' },
  { reference: 'the cat sat on the mat', candidate: 'the the the the the the' },
  { reference: 'the cat sat on the mat', candidate: 'the cat on the mat sat' },
  { reference: 'the cat sat on the mat', candidate: 'a cat was sitting on a mat' },
]

function getNgrams(tokens: string[], n: number): Map<string, number> {
  const map = new Map<string, number>()
  for (let i = 0; i <= tokens.length - n; i++) {
    const gram = tokens.slice(i, i + n).join(' ')
    map.set(gram, (map.get(gram) ?? 0) + 1)
  }
  return map
}

function clippedPrecision(ref: string[], cand: string[], n: number): { precision: number; matches: number; total: number; matchedGrams: Set<string> } {
  const candNgrams = getNgrams(cand, n)
  const refNgrams = getNgrams(ref, n)
  let matches = 0
  let total = 0
  const matchedGrams = new Set<string>()
  for (const [gram, count] of candNgrams) {
    const clipped = Math.min(count, refNgrams.get(gram) ?? 0)
    matches += clipped
    total += count
    if (clipped > 0) matchedGrams.add(gram)
  }
  return { precision: total > 0 ? matches / total : 0, matches, total, matchedGrams }
}

const NGRAM_COLORS = ['#7F56D9', '#9E77ED', '#B692F6', '#D6BBFB']

export default function BLEUScoreViz() {
  const [exIdx, setExIdx] = useState(0)
  const [maxN, setMaxN] = useState(4)

  const ref = EXAMPLES[exIdx].reference.split(' ')
  const cand = EXAMPLES[exIdx].candidate.split(' ')

  const analysis = useMemo(() => {
    const results = []
    for (let n = 1; n <= maxN; n++) {
      results.push(clippedPrecision(ref, cand, n))
    }
    return results
  }, [exIdx, maxN])

  const bp = Math.min(1, Math.exp(1 - ref.length / Math.max(cand.length, 1)))
  const logAvg = analysis.reduce((s, a) => s + Math.log(Math.max(a.precision, 1e-10)), 0) / maxN
  const bleu = bp * Math.exp(logAvg)

  const [highlightN, setHighlightN] = useState(1)
  const matchedGrams = analysis[highlightN - 1]?.matchedGrams ?? new Set()

  // Check if a token at position i is part of a matching n-gram
  const isTokenHighlighted = (tokens: string[], i: number): boolean => {
    for (let start = Math.max(0, i - highlightN + 1); start <= i && start + highlightN <= tokens.length; start++) {
      const gram = tokens.slice(start, start + highlightN).join(' ')
      if (matchedGrams.has(gram)) return true
    }
    return false
  }

  return (
    <div className="p-6 bg-card rounded-xl border border-border max-w-2xl mx-auto">
      <h3 className="text-gray-300 font-semibold text-lg mb-1">BLEU Score Computation</h3>
      <p className="text-gray-500 text-sm mb-4">
        Matching n-grams between reference and candidate. Higher overlap means higher BLEU.
      </p>

      {/* Example selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {EXAMPLES.map((_, i) => (
          <button key={i} onClick={() => setExIdx(i)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              exIdx === i ? 'border-[#7F56D9] bg-[#7F56D9]/15 text-white' : 'border-border text-gray-500 hover:bg-white/5'
            }`}>Example {i + 1}</button>
        ))}
      </div>

      {/* Sentences with highlighting */}
      <div className="space-y-3 mb-5">
        <div>
          <span className="text-gray-500 text-xs uppercase tracking-wider">Reference</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {ref.map((tok, i) => (
              <span key={i} className={`px-1.5 py-0.5 rounded text-sm font-mono ${
                isTokenHighlighted(ref, i)
                  ? 'text-white' : 'text-gray-500 bg-white/[0.03]'
              }`} style={isTokenHighlighted(ref, i) ? { background: NGRAM_COLORS[highlightN - 1] + '40' } : undefined}>{tok}</span>
            ))}
          </div>
        </div>
        <div>
          <span className="text-gray-500 text-xs uppercase tracking-wider">Candidate</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {cand.map((tok, i) => (
              <span key={i} className={`px-1.5 py-0.5 rounded text-sm font-mono ${
                isTokenHighlighted(cand, i)
                  ? 'text-white' : 'text-gray-500 bg-white/[0.03]'
              }`} style={isTokenHighlighted(cand, i) ? { background: NGRAM_COLORS[highlightN - 1] + '40' } : undefined}>{tok}</span>
            ))}
          </div>
        </div>
      </div>

      {/* N-gram slider */}
      <div className="mb-4">
        <label className="text-gray-400 text-sm">
          Highlight n-gram: <span className="text-white font-mono">{highlightN}-gram</span>
        </label>
        <input type="range" min={1} max={maxN} step={1} value={highlightN}
          onChange={e => setHighlightN(Number(e.target.value))} className="w-full accent-[#7F56D9] mt-1" />
      </div>

      {/* Max N control */}
      <div className="mb-5">
        <label className="text-gray-400 text-sm">
          Max n-gram order: <span className="text-white font-mono">{maxN}</span>
        </label>
        <input type="range" min={1} max={4} step={1} value={maxN}
          onChange={e => { setMaxN(Number(e.target.value)); setHighlightN(Math.min(highlightN, Number(e.target.value))) }}
          className="w-full accent-[#7F56D9] mt-1" />
      </div>

      {/* Precision table */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {analysis.map((a, i) => (
          <div key={i} className={`p-2 rounded-lg border text-center ${
            highlightN === i + 1 ? 'border-[#7F56D9]/50 bg-[#7F56D9]/10' : 'border-border bg-white/[0.02]'
          }`} onClick={() => setHighlightN(i + 1)}>
            <div className="text-xs text-gray-500">{i + 1}-gram</div>
            <div className="font-mono text-sm" style={{ color: NGRAM_COLORS[i] }}>{(a.precision * 100).toFixed(1)}%</div>
            <div className="text-xs text-gray-600">{a.matches}/{a.total}</div>
          </div>
        ))}
      </div>

      {/* Final score */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-white/[0.02]">
        <div className="text-sm">
          <span className="text-gray-500">Brevity penalty: </span>
          <span className="text-gray-300 font-mono">{bp.toFixed(3)}</span>
          <span className="text-gray-600 text-xs ml-2">(ref={ref.length}, cand={cand.length})</span>
        </div>
        <div className="text-right">
          <span className="text-gray-500 text-sm">BLEU = </span>
          <span className={`font-mono text-lg font-bold ${bleu > 0.5 ? 'text-green-400' : bleu > 0.2 ? 'text-yellow-400' : 'text-red-400'}`}>
            {(bleu * 100).toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  )
}
