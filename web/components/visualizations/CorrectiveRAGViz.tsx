'use client'

import { useState } from 'react'

const ITERATIONS = [
  { query: 'What causes aurora borealis?', docs: [
    { text: 'Auroras are natural light displays in the sky...', score: 0.42 },
    { text: 'The Northern Lights are visible from polar regions...', score: 0.38 },
  ], avgScore: 0.40, verdict: 'LOW - query too vague', refinedQuery: 'What solar wind particles cause aurora borealis light emissions?' },
  { query: 'What solar wind particles cause aurora borealis light emissions?', docs: [
    { text: 'Charged particles from solar wind interact with magnetosphere...', score: 0.71 },
    { text: 'Electrons collide with oxygen and nitrogen atoms in ionosphere...', score: 0.65 },
  ], avgScore: 0.68, verdict: 'MEDIUM - needs specificity', refinedQuery: 'How do solar wind electrons excite oxygen nitrogen atoms to produce aurora colors?' },
  { query: 'How do solar wind electrons excite oxygen nitrogen atoms to produce aurora colors?', docs: [
    { text: 'Solar electrons excite O and N2; de-excitation emits green (557.7nm) and red (630nm) photons...', score: 0.93 },
    { text: 'Magnetic field lines guide charged particles to polar cusps where collisions produce photon emission...', score: 0.88 },
  ], avgScore: 0.91, verdict: 'HIGH - ready to generate', refinedQuery: null },
]

export default function CorrectiveRAGViz() {
  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState<'query' | 'retrieve' | 'grade' | 'refine'>('query')

  const iter = ITERATIONS[step]
  const isLastIteration = step === ITERATIONS.length - 1

  const handleNext = () => {
    if (phase === 'query') setPhase('retrieve')
    else if (phase === 'retrieve') setPhase('grade')
    else if (phase === 'grade') {
      if (isLastIteration) return
      setPhase('refine')
    } else if (phase === 'refine') {
      setStep(s => Math.min(s + 1, ITERATIONS.length - 1))
      setPhase('query')
    }
  }

  const handleReset = () => { setStep(0); setPhase('query') }

  const scoreColor = (score: number) => {
    if (score >= 0.8) return '#34d399'
    if (score >= 0.6) return '#fbbf24'
    return '#f87171'
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-cyan-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-cyan-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Corrective RAG</h3>
          <p className="text-xs text-muted-foreground">Iterative query refinement until retrieval quality meets threshold</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 space-y-3">
          {/* Iteration indicator */}
          <div className="flex items-center gap-2">
            {ITERATIONS.map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300"
                  style={{
                    borderColor: i <= step ? scoreColor(ITERATIONS[i].avgScore) : 'rgba(255,255,255,0.1)',
                    backgroundColor: i <= step ? `${scoreColor(ITERATIONS[i].avgScore)}15` : 'transparent',
                    color: i <= step ? scoreColor(ITERATIONS[i].avgScore) : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {i + 1}
                </div>
                {i < ITERATIONS.length - 1 && (
                  <div className="w-12 h-px" style={{ backgroundColor: i < step ? 'rgba(34,211,153,0.3)' : 'rgba(255,255,255,0.1)' }} />
                )}
              </div>
            ))}
          </div>

          {/* Current query */}
          <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3">
            <div className="text-sm uppercase font-bold text-cyan-400">Query (Iteration {step + 1})</div>
            <div className="text-xs font-mono text-foreground/80 mt-1">{iter.query}</div>
          </div>

          {/* Retrieved docs */}
          {(phase === 'retrieve' || phase === 'grade' || phase === 'refine') && (
            <div className="space-y-1.5">
              <div className="text-sm uppercase font-bold text-muted-foreground">Retrieved Documents</div>
              {iter.docs.map((doc, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300"
                  style={{
                    borderColor: phase !== 'retrieve' ? `${scoreColor(doc.score)}33` : 'rgba(255,255,255,0.06)',
                    backgroundColor: phase !== 'retrieve' ? `${scoreColor(doc.score)}08` : 'transparent',
                  }}
                >
                  <div className="flex-1 text-xs text-foreground/60 font-mono">{doc.text}</div>
                  {phase !== 'retrieve' && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${doc.score * 100}%`, backgroundColor: scoreColor(doc.score) }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold" style={{ color: scoreColor(doc.score) }}>
                        {doc.score.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {(phase === 'grade' || phase === 'refine') && (
            <div className="rounded-lg p-3 border transition-all duration-300" style={{ borderColor: `${scoreColor(iter.avgScore)}33`, backgroundColor: `${scoreColor(iter.avgScore)}08` }}>
              <div className="flex items-center gap-3">
                <span className="text-sm uppercase font-bold text-muted-foreground">Relevance Grade:</span>
                <span className="text-xs font-bold font-mono" style={{ color: scoreColor(iter.avgScore) }}>{iter.verdict}</span>
                <span className="text-xs text-muted-foreground ml-auto">avg: {iter.avgScore.toFixed(2)}</span>
              </div>
            </div>
          )}
          {phase === 'refine' && iter.refinedQuery && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
              <div className="text-sm uppercase font-bold text-amber-400">Refined Query</div>
              <div className="text-xs font-mono text-amber-300/80 mt-1">{iter.refinedQuery}</div>
            </div>
          )}
          {phase === 'grade' && isLastIteration && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
              <div className="text-xs uppercase font-bold text-emerald-400">Threshold met - generating answer</div>
              <div className="text-xs text-emerald-300/70 mt-1">After {step + 1} iterations, retrieval quality passes threshold.</div>
            </div>
          )}
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              onClick={handleNext}
              disabled={phase === 'grade' && isLastIteration}
              className="text-xs px-4 py-2 rounded-lg border bg-cyan-500/20 border-cyan-500/40 text-cyan-300 transition hover:bg-cyan-500/30 disabled:opacity-30"
            >
              Next Step
            </button>
            <button onClick={handleReset} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition">
              Reset
            </button>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-1">
            <div className="text-xs uppercase font-bold text-muted-foreground">Current Phase</div>
            <div className="text-sm font-mono text-cyan-400 capitalize">{phase}</div>
            <div className="text-xs text-muted-foreground">
              {phase === 'query' && 'Submitting query to retriever'}
              {phase === 'retrieve' && 'Fetching relevant document chunks'}
              {phase === 'grade' && 'Scoring retrieval relevance'}
              {phase === 'refine' && 'LLM rewrites query for better retrieval'}
            </div>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-1">
            <div className="text-xs uppercase font-bold text-muted-foreground">Score Threshold</div>
            <div className="text-xs font-mono space-y-1">
              {[['Low', 'red', '< 0.6'], ['Medium', 'amber', '0.6 - 0.8'], ['High', 'emerald', '> 0.8']].map(([l, c, v]) => (
                <div key={l} className="flex justify-between"><span className={`text-${c}-400`}>{l}</span><span>{v}</span></div>
              ))}
            </div>
          </div>
          <div className="mt-auto bg-cyan-500/5 border border-cyan-500/10 p-3 rounded-lg">
            <p className="text-xs text-cyan-300 leading-relaxed italic">
              Corrective RAG detects low-quality retrievals and rewrites the query before retrying. The loop runs until relevance exceeds threshold.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
