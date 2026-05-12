'use client'

import { useState, useMemo } from 'react'

const reference = 'The cat sat on the mat and looked out the window at the birds'
const candidate = 'The cat sat on the rug and watched the birds from the window'

function tokenize(s: string): string[] {
  return s.toLowerCase().split(/\s+/)
}

function bigrams(tokens: string[]): string[] {
  return tokens.slice(0, -1).map((t, i) => `${t} ${tokens[i + 1]}`)
}

function lcs(a: string[], b: string[]): string[] {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])
  const result: string[] = []
  let i = m, j = n
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) { result.unshift(a[i - 1]); i--; j-- }
    else if (dp[i - 1][j] > dp[i][j - 1]) i--
    else j--
  }
  return result
}

export default function ROUGEScoreViz() {
  const [mode, setMode] = useState<'1' | '2' | 'L'>('1')

  const refTokens = useMemo(() => tokenize(reference), [])
  const canTokens = useMemo(() => tokenize(candidate), [])

  const { overlap, recall, precision, f1, refHighlight, canHighlight } = useMemo(() => {
    if (mode === '1') {
      const refSet = new Set(refTokens)
      const canSet = new Set(canTokens)
      const common = new Set([...canSet].filter(t => refSet.has(t)))
      const rh = refTokens.map(t => common.has(t))
      const ch = canTokens.map(t => common.has(t))
      const hits = [...common].reduce((s, t) => s + Math.min(refTokens.filter(r => r === t).length, canTokens.filter(c => c === t).length), 0)
      const r = hits / refTokens.length
      const p = hits / canTokens.length
      return { overlap: hits, recall: r, precision: p, f1: r + p > 0 ? (2 * r * p) / (r + p) : 0, refHighlight: rh, canHighlight: ch }
    } else if (mode === '2') {
      const refB = bigrams(refTokens)
      const canB = bigrams(canTokens)
      const refSet = new Set(refB)
      const common = canB.filter(b => refSet.has(b))
      const hits = common.length
      const r = refB.length > 0 ? hits / refB.length : 0
      const p = canB.length > 0 ? hits / canB.length : 0
      const commonSet = new Set(common)
      return { overlap: hits, recall: r, precision: p, f1: r + p > 0 ? (2 * r * p) / (r + p) : 0, refHighlight: refB.map(b => commonSet.has(b)), canHighlight: canB.map(b => commonSet.has(b)) }
    } else {
      const seq = lcs(refTokens, canTokens)
      const len = seq.length
      const r = len / refTokens.length
      const p = len / canTokens.length
      const lcsSet = new Set(seq)
      return { overlap: len, recall: r, precision: p, f1: r + p > 0 ? (2 * r * p) / (r + p) : 0, refHighlight: refTokens.map(t => lcsSet.has(t)), canHighlight: canTokens.map(t => lcsSet.has(t)) }
    }
  }, [mode, refTokens, canTokens])

  const items = mode === '2' ? { ref: bigrams(refTokens), can: bigrams(canTokens) } : { ref: refTokens, can: canTokens }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-200">ROUGE Score Computation</h3>
          <p className="text-xs text-gray-500">Compare reference and candidate overlap</p>
        </div>
        <div className="flex gap-1">
          {(['1', '2', 'L'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-3 py-1 text-xs rounded-lg font-mono transition-colors ${mode === m ? 'bg-[#7F56D9] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              ROUGE-{m}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <div className="text-xs uppercase font-bold text-gray-500 mb-1">Reference</div>
          <div className="flex flex-wrap gap-1">
            {items.ref.map((t, i) => (
              <span key={i} className={`px-1.5 py-0.5 rounded text-xs font-mono ${refHighlight[i] ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-gray-500'}`}>
                {t}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase font-bold text-gray-500 mb-1">Candidate</div>
          <div className="flex flex-wrap gap-1">
            {items.can.map((t, i) => (
              <span key={i} className={`px-1.5 py-0.5 rounded text-xs font-mono ${canHighlight[i] ? 'bg-[#9E77ED]/20 text-[#9E77ED] border border-[#9E77ED]/30' : 'bg-white/5 text-gray-500'}`}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {mode === 'L' && (
          <div className="bg-white/5 border border-border rounded-lg p-2">
            <div className="text-xs uppercase font-bold text-gray-500 mb-1">Longest Common Subsequence</div>
            <p className="text-xs font-mono text-emerald-300">{lcs(refTokens, canTokens).join(' ')}</p>
          </div>
        )}

        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Overlap', value: overlap, color: 'text-gray-200' },
            { label: 'Recall', value: recall.toFixed(3), color: 'text-emerald-400' },
            { label: 'Precision', value: precision.toFixed(3), color: 'text-[#9E77ED]' },
            { label: 'F1', value: f1.toFixed(3), color: 'text-[#7F56D9]' },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-border p-2 rounded-xl text-center">
              <div className="text-xs uppercase font-bold text-gray-500">{s.label}</div>
              <div className={`text-lg font-mono font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-[#7F56D9]/5 border border-[#7F56D9]/10 p-2 rounded-lg">
          <p className="text-xs text-gray-400 leading-relaxed">
            {mode === '1' && 'ROUGE-1 measures unigram overlap between reference and candidate. Higher recall means the candidate covers more of the reference content.'}
            {mode === '2' && 'ROUGE-2 measures bigram overlap, capturing phrase-level similarity. Stricter than ROUGE-1 since consecutive word pairs must match.'}
            {mode === 'L' && 'ROUGE-L uses the longest common subsequence. Tokens need not be consecutive, capturing sentence-level structure similarity.'}
          </p>
        </div>
      </div>
    </div>
  )
}
