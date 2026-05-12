'use client'

import { useState, useMemo } from 'react'

export default function ProbabilityBasicsViz() {
  const [pA, setPa] = useState(0.01)       // Prior: e.g. disease prevalence
  const [pBgivenA, setPBgivenA] = useState(0.9) // Sensitivity: true positive rate
  const [pBgivenNotA, setPBgivenNotA] = useState(0.05) // False positive rate

  const computed = useMemo(() => {
    const pNotA = 1 - pA
    const pB = pBgivenA * pA + pBgivenNotA * pNotA
    const pAgivenB = pB > 0 ? (pBgivenA * pA) / pB : 0
    return { pNotA, pB, pAgivenB }
  }, [pA, pBgivenA, pBgivenNotA])

  const barHeight = (value: number) => Math.max(4, value * 160)

  const bars = [
    { label: 'P(A)', value: pA, color: '#818cf8', desc: 'Prior' },
    { label: 'P(B|A)', value: pBgivenA, color: '#f472b6', desc: 'Likelihood' },
    { label: 'P(B)', value: computed.pB, color: '#fbbf24', desc: 'Evidence' },
    { label: 'P(A|B)', value: computed.pAgivenB, color: '#34d399', desc: 'Posterior' },
  ]

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-blue-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Bayes Theorem</h3>
          <p className="text-xs text-muted-foreground">P(A|B) = P(B|A) * P(A) / P(B) - posterior updates with evidence</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 space-y-4">
          {/* Formula display */}
          <div className="bg-muted/40 border border-border rounded-lg p-3 text-center">
            <div className="font-mono text-sm space-x-1">
              <span className="text-emerald-400 font-bold">P(A|B)</span>
              <span className="text-foreground/40">=</span>
              <span className="text-pink-400">P(B|A)</span>
              <span className="text-foreground/40">*</span>
              <span className="text-indigo-400">P(A)</span>
              <span className="text-foreground/40">/</span>
              <span className="text-amber-400">P(B)</span>
            </div>
            <div className="font-mono text-xs mt-2 space-x-1">
              <span className="text-emerald-400 font-bold">{computed.pAgivenB.toFixed(4)}</span>
              <span className="text-foreground/40">=</span>
              <span className="text-pink-400">{pBgivenA.toFixed(2)}</span>
              <span className="text-foreground/40">*</span>
              <span className="text-indigo-400">{pA.toFixed(4)}</span>
              <span className="text-foreground/40">/</span>
              <span className="text-amber-400">{computed.pB.toFixed(4)}</span>
            </div>
          </div>

          {/* Probability bars */}
          <div className="flex items-end justify-center gap-6 h-52">
            {bars.map(bar => (
              <div key={bar.label} className="flex flex-col items-center gap-1">
                <span className="text-xs font-mono font-bold" style={{ color: bar.color }}>{bar.value.toFixed(4)}</span>
                <div className="w-12 bg-muted/40 rounded-t-md relative" style={{ height: '170px' }}>
                  <div
                    className="absolute bottom-0 w-full rounded-t-md transition-all duration-500"
                    style={{ height: `${barHeight(bar.value)}px`, backgroundColor: `${bar.color}40`, borderTop: `2px solid ${bar.color}` }}
                  />
                </div>
                <span className="text-xs font-mono" style={{ color: bar.color }}>{bar.label}</span>
                <span className="text-[8px] text-muted-foreground">{bar.desc}</span>
              </div>
            ))}
          </div>

          {/* Intuition: area diagram */}
          <div className="bg-muted/30 border border-border rounded-lg p-3">
            <div className="text-sm uppercase font-bold text-muted-foreground mb-2">Intuition (per 10,000 people)</div>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-indigo-400">Have disease:</span>{' '}
                <span className="text-foreground/70">{Math.round(pA * 10000)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Healthy:</span>{' '}
                <span className="text-foreground/70">{Math.round((1 - pA) * 10000)}</span>
              </div>
              <div>
                <span className="text-pink-400">True positives:</span>{' '}
                <span className="text-foreground/70">{Math.round(pBgivenA * pA * 10000)}</span>
              </div>
              <div>
                <span className="text-red-400">False positives:</span>{' '}
                <span className="text-foreground/70">{Math.round(pBgivenNotA * (1 - pA) * 10000)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          {/* Sliders */}
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">
              P(A) Prior: <span className="text-indigo-400">{pA.toFixed(3)}</span>
            </label>
            <input type="range" min={0.001} max={0.5} step={0.001} value={pA} onChange={e => setPa(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
            <div className="flex justify-between text-[8px] text-muted-foreground"><span>Rare (0.1%)</span><span>Common (50%)</span></div>
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">
              P(B|A) Sensitivity: <span className="text-pink-400">{pBgivenA.toFixed(2)}</span>
            </label>
            <input type="range" min={0.01} max={1.0} step={0.01} value={pBgivenA} onChange={e => setPBgivenA(parseFloat(e.target.value))} className="w-full accent-pink-500" />
            <div className="flex justify-between text-[8px] text-muted-foreground"><span>Low (1%)</span><span>Perfect (100%)</span></div>
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">
              P(B|~A) False Positive: <span className="text-red-400">{pBgivenNotA.toFixed(2)}</span>
            </label>
            <input type="range" min={0.001} max={0.5} step={0.001} value={pBgivenNotA} onChange={e => setPBgivenNotA(parseFloat(e.target.value))} className="w-full accent-red-500" />
            <div className="flex justify-between text-[8px] text-muted-foreground"><span>Rare (0.1%)</span><span>High (50%)</span></div>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl">
            <div className="text-xs uppercase font-bold text-muted-foreground">Posterior</div>
            <div className="text-2xl font-mono font-bold text-emerald-400">{(computed.pAgivenB * 100).toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">chance of A given positive test</div>
          </div>

          <div className="mt-auto bg-blue-500/5 border border-blue-500/10 p-3 rounded-lg">
            <p className="text-xs text-blue-300 leading-relaxed italic">
              The base rate fallacy: even with a 90% sensitive test, a positive result on a rare disease (1% prevalence) only means ~15% chance of having it. Most positives are false positives.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
