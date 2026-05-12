'use client'

import { useState } from 'react'

type Token = { text: string; accepted: boolean | null }

const vocab = ['the', 'model', 'generates', 'tokens', 'using', 'draft', 'neural', 'network', 'predicts', 'next', 'word', 'in', 'sequence', 'parallel', 'decoding', 'fast', 'small', 'large', 'output', 'text']

function randomTokens(n: number): Token[] {
  return Array.from({ length: n }, () => ({ text: vocab[Math.floor(Math.random() * vocab.length)], accepted: null }))
}

export default function SpeculativeDecodingViz() {
  const [draftTokens, setDraftTokens] = useState<Token[]>([])
  const [acceptedTokens, setAcceptedTokens] = useState<string[]>([])
  const [round, setRound] = useState(0)
  const [totalDrafted, setTotalDrafted] = useState(0)
  const [totalAccepted, setTotalAccepted] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'drafting' | 'verifying' | 'done'>('idle')

  const draftSize = 6

  const runRound = () => {
    setPhase('drafting')
    const draft = randomTokens(draftSize)
    setDraftTokens(draft)

    setTimeout(() => {
      setPhase('verifying')
      // Verify: each token has ~70% chance of acceptance, but once rejected, all after are rejected
      let rejected = false
      const verified = draft.map(t => {
        if (rejected) return { ...t, accepted: false }
        const accept = Math.random() < 0.7
        if (!accept) rejected = true
        return { ...t, accepted: accept }
      })
      setDraftTokens(verified)

      setTimeout(() => {
        const accepted = verified.filter(t => t.accepted)
        setAcceptedTokens(prev => [...prev, ...accepted.map(t => t.text)])
        setTotalDrafted(prev => prev + draftSize)
        setTotalAccepted(prev => prev + accepted.length)
        setRound(prev => prev + 1)
        setPhase('done')
      }, 800)
    }, 600)
  }

  const reset = () => {
    setDraftTokens([])
    setAcceptedTokens([])
    setRound(0)
    setTotalDrafted(0)
    setTotalAccepted(0)
    setPhase('idle')
  }

  const acceptRate = totalDrafted > 0 ? totalAccepted / totalDrafted : 0
  const speedup = totalDrafted > 0 ? (totalAccepted / Math.max(round, 1)).toFixed(1) : '0.0'

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-200">Speculative Decoding</h3>
          <p className="text-xs text-gray-500">Draft model proposes tokens, verifier accepts or rejects</p>
        </div>
        <div className="flex gap-2">
          <button onClick={runRound} disabled={phase === 'drafting' || phase === 'verifying'}
            className="px-3 py-1 text-xs rounded-lg bg-[#7F56D9] text-white hover:bg-[#7F56D9]/80 disabled:opacity-40 transition-colors">
            Run Round
          </button>
          <button onClick={reset} className="px-3 py-1 text-xs rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors">
            Reset
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Draft model output */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-xs uppercase font-bold text-gray-500">Draft Model (fast, small)</span>
            {phase === 'drafting' && <span className="text-xs text-yellow-400 animate-pulse">generating...</span>}
          </div>
          <div className="flex gap-1 min-h-[32px] flex-wrap">
            {draftTokens.map((t, i) => (
              <span key={i} className={`px-2 py-1 rounded text-xs font-mono border transition-all duration-300 ${
                t.accepted === null ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
                  : t.accepted ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300 line-through'
              }`}>
                {t.text}
                {t.accepted !== null && (
                  <span className="ml-1 text-xs">{t.accepted ? '\u2713' : '\u2717'}</span>
                )}
              </span>
            ))}
            {draftTokens.length === 0 && <span className="text-xs text-gray-600 italic">Click "Run Round" to start</span>}
          </div>
        </div>

        {/* Verifier */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-[#7F56D9]" />
            <span className="text-xs uppercase font-bold text-gray-500">Verifier Model (accurate, large)</span>
            {phase === 'verifying' && <span className="text-xs text-[#9E77ED] animate-pulse">verifying...</span>}
          </div>
          <div className="bg-white/5 border border-border rounded-lg p-2 min-h-[32px]">
            {phase === 'verifying' && <span className="text-xs text-[#9E77ED] animate-pulse">Checking draft tokens against target distribution...</span>}
            {phase === 'done' && (
              <span className="text-xs text-gray-400">
                Accepted {draftTokens.filter(t => t.accepted).length}/{draftSize} tokens this round.
                {draftTokens.some(t => !t.accepted) && ' Regenerating from first rejection point.'}
              </span>
            )}
            {phase === 'idle' && <span className="text-xs text-gray-600 italic">Waiting for draft tokens...</span>}
          </div>
        </div>

        {/* Accepted sequence */}
        <div>
          <div className="text-xs uppercase font-bold text-gray-500 mb-1">Generated Sequence</div>
          <div className="bg-white/5 border border-border rounded-lg p-2 min-h-[32px]">
            {acceptedTokens.length > 0
              ? <p className="text-xs font-mono text-gray-300">{acceptedTokens.join(' ')}</p>
              : <span className="text-xs text-gray-600 italic">No tokens yet</span>}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Rounds', value: round, color: 'text-gray-200' },
            { label: 'Accept Rate', value: `${(acceptRate * 100).toFixed(0)}%`, color: acceptRate > 0.6 ? 'text-emerald-400' : 'text-yellow-400' },
            { label: 'Speedup', value: `${speedup}x`, color: 'text-[#9E77ED]' },
            { label: 'Tokens', value: totalAccepted, color: 'text-gray-200' },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-border p-2 rounded-xl text-center">
              <div className="text-xs uppercase font-bold text-gray-500">{s.label}</div>
              <div className={`text-lg font-mono font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-[#7F56D9]/5 border border-[#7F56D9]/10 p-2 rounded-lg">
          <p className="text-xs text-gray-400 leading-relaxed">
            Speculative decoding uses a small draft model to propose multiple tokens at once. The large verifier checks all drafts in parallel (single forward pass). Accepted tokens are kept; on first rejection, the verifier corrects from that point. Net effect: multiple tokens per verifier call.
          </p>
        </div>
      </div>
    </div>
  )
}
