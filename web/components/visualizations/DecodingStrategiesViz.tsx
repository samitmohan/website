'use client'

import { useState, useMemo } from 'react'

const VOCAB = ['the', 'cat', 'sat', 'on', 'a', 'mat', 'dog', 'ran', 'big', 'was']
const RAW_PROBS = [0.28, 0.18, 0.14, 0.11, 0.08, 0.07, 0.05, 0.04, 0.03, 0.02]

type Strategy = 'greedy' | 'topk' | 'topp' | 'beam'

function getSelectedSet(strategy: Strategy, k: number, p: number, beamWidth: number): boolean[] {
  const selected = new Array(VOCAB.length).fill(false)
  if (strategy === 'greedy') {
    selected[0] = true
  } else if (strategy === 'topk') {
    for (let i = 0; i < Math.min(k, VOCAB.length); i++) selected[i] = true
  } else if (strategy === 'topp') {
    let cumulative = 0
    for (let i = 0; i < VOCAB.length; i++) {
      cumulative += RAW_PROBS[i]
      selected[i] = true
      if (cumulative >= p) break
    }
  } else if (strategy === 'beam') {
    for (let i = 0; i < Math.min(beamWidth, VOCAB.length); i++) selected[i] = true
  }
  return selected
}

function renormalize(probs: number[], selected: boolean[]): number[] {
  const sum = probs.reduce((s, p, i) => s + (selected[i] ? p : 0), 0)
  return probs.map((p, i) => selected[i] ? p / sum : 0)
}

export default function DecodingStrategiesViz() {
  const [strategy, setStrategy] = useState<Strategy>('greedy')
  const [topK, setTopK] = useState(5)
  const [topP, setTopP] = useState(0.8)
  const [beamWidth, setBeamWidth] = useState(3)

  const selected = useMemo(() => getSelectedSet(strategy, topK, topP, beamWidth), [strategy, topK, topP, beamWidth])
  const renormed = useMemo(() => renormalize(RAW_PROBS, selected), [selected])

  const barMaxH = 130
  const maxProb = Math.max(...RAW_PROBS)

  const strategies: { key: Strategy; label: string; desc: string; color: string }[] = [
    { key: 'greedy', label: 'Greedy', desc: 'Always pick highest probability', color: 'red' },
    { key: 'topk', label: 'Top-K', desc: `Sample from top ${topK} tokens`, color: 'blue' },
    { key: 'topp', label: 'Top-P (Nucleus)', desc: `Smallest set summing to P=${topP}`, color: 'green' },
    { key: 'beam', label: 'Beam Search', desc: `Keep ${beamWidth} candidates`, color: 'orange' },
  ]

  const activeStrat = strategies.find(s => s.key === strategy)!
  const accentMap: Record<Strategy, string> = { greedy: 'rgba(248, 113, 113', topk: 'rgba(59, 130, 246', topp: 'rgba(74, 222, 128', beam: 'rgba(251, 146, 60' }
  const accent = accentMap[strategy]
  const cssAccent: Record<Strategy, string> = { greedy: 'red', topk: 'blue', topp: 'green', beam: 'orange' }

  const numSelected = selected.filter(Boolean).length
  const cumulativeP = RAW_PROBS.reduce((s, p, i) => s + (selected[i] ? p : 0), 0)

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-amber-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className={`bg-${cssAccent[strategy]}-500/10 p-1.5 rounded-lg`}>
          <svg className={`w-4 h-4 text-${cssAccent[strategy]}-400`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v18m-6-6l6 6 6-6"/></svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Decoding Strategies</h3>
          <p className="text-xs text-muted-foreground">Compare how different strategies select tokens from a probability distribution</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4">
          <div className="flex gap-1 mb-3 flex-wrap">
            {strategies.map(s => (
              <button key={s.key} onClick={() => setStrategy(s.key)} className={`text-xs px-3 py-1 rounded-lg border transition ${strategy === s.key ? `bg-${s.color}-500/20 border-${s.color}-500/40 text-${s.color}-300` : 'border-border text-muted-foreground hover:bg-muted/50'}`}>
                {s.label}
              </button>
            ))}
          </div>

          <svg viewBox={`0 0 440 ${barMaxH + 55}`} className="w-full h-auto">
            {RAW_PROBS.map((p, i) => {
              const barW = 32
              const gap = (440 - VOCAB.length * barW) / (VOCAB.length + 1)
              const x = gap + i * (barW + gap)
              const barH = (p / maxProb) * barMaxH
              const y = barMaxH - barH + 10
              const inSet = selected[i]
              const fillColor = inSet ? `${accent}, 0.6)` : 'rgba(100, 100, 120, 0.15)'
              const strokeColor = inSet ? `${accent}, 0.8)` : 'rgba(100, 100, 120, 0.2)'

              return (
                <g key={i}>
                  <rect x={x} y={y} width={barW} height={barH} rx={3} fill={fillColor} stroke={strokeColor} strokeWidth={inSet ? 1.5 : 0.5} />
                  {/* Original prob */}
                  <text x={x + barW / 2} y={y - 4} textAnchor="middle" fill="currentColor" fillOpacity={inSet ? 0.8 : 0.3} fontSize={8} fontFamily="monospace">
                    {(p * 100).toFixed(0)}%
                  </text>
                  {/* Renormalized prob */}
                  {inSet && renormed[i] > 0 && (
                    <text x={x + barW / 2} y={y - 14} textAnchor="middle" fill={`${accent}, 1)`} fontSize={7} fontFamily="monospace">
                      {(renormed[i] * 100).toFixed(0)}%
                    </text>
                  )}
                  {/* Token label */}
                  <text x={x + barW / 2} y={barMaxH + 24} textAnchor="middle" fill="currentColor" fillOpacity={inSet ? 0.8 : 0.3} fontSize={9} fontWeight={inSet ? 'bold' : 'normal'}>
                    {VOCAB[i]}
                  </text>
                  {/* Excluded marker */}
                  {!inSet && (
                    <line x1={x + 4} y1={barMaxH + 30} x2={x + barW - 4} y2={barMaxH + 30} stroke="rgba(248, 113, 113, 0.3)" strokeWidth={1.5} />
                  )}
                </g>
              )
            })}
            {/* Cumulative probability line for topp */}
            {strategy === 'topp' && (() => {
              let cum = 0
              const barW = 32
              const gap = (440 - VOCAB.length * barW) / (VOCAB.length + 1)
              return RAW_PROBS.map((p, i) => {
                cum += p
                const x = gap + i * (barW + gap) + barW / 2
                const prevCum = cum - p
                if (!selected[i] && prevCum >= topP) return null
                return (
                  <circle key={`cum-${i}`} cx={x} cy={barMaxH + 42} r={3} fill={cum <= topP ? 'rgba(74, 222, 128, 0.6)' : 'rgba(74, 222, 128, 0.3)'} stroke={cum >= topP && selected[i] ? '#4ade80' : 'none'} strokeWidth={1} />
                )
              })
            })()}
          </svg>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div className="bg-muted border border-border p-3 rounded-xl">
            <div className="text-xs uppercase font-bold text-muted-foreground mb-1">{activeStrat.label}</div>
            <div className="text-xs text-muted-foreground">{activeStrat.desc}</div>
          </div>

          {strategy === 'topk' && (
            <div>
              <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">K = {topK}</label>
              <input type="range" min={1} max={10} step={1} value={topK} onChange={e => setTopK(parseInt(e.target.value))} className="w-full accent-blue-500" />
            </div>
          )}

          {strategy === 'topp' && (
            <div>
              <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">P = {topP.toFixed(2)}</label>
              <input type="range" min={0.1} max={1.0} step={0.05} value={topP} onChange={e => setTopP(parseFloat(e.target.value))} className="w-full accent-green-500" />
            </div>
          )}

          {strategy === 'beam' && (
            <div>
              <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">Beam Width = {beamWidth}</label>
              <input type="range" min={1} max={10} step={1} value={beamWidth} onChange={e => setBeamWidth(parseInt(e.target.value))} className="w-full accent-orange-500" />
            </div>
          )}

          <div className="bg-muted border border-border p-3 rounded-xl">
            <div className="text-xs uppercase font-bold text-muted-foreground mb-2">Selection Stats</div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tokens in set</span>
                <span className="font-mono">{numSelected} / {VOCAB.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cumulative P</span>
                <span className="font-mono">{(cumulativeP * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mass excluded</span>
                <span className="font-mono">{((1 - cumulativeP) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="mt-auto bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg">
            <p className="text-xs text-amber-300 leading-relaxed italic">
              Greedy always picks the mode. Top-K fixes the candidate count. Top-P adapts the count to concentrate probability mass. Beam search tracks multiple full sequences.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
