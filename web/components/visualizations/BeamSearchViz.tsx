'use client'

import { useState, useMemo } from 'react'

interface Beam {
  tokens: string[]
  logProb: number
  finished: boolean
}

const CANDIDATES: string[][] = [
  ['the', 'a', 'one', 'my', 'this'],
  ['cat', 'dog', 'bird', 'fox', 'fish'],
  ['sat', 'ran', 'flew', 'slept', 'ate'],
  ['quietly', 'fast', 'away', 'here', 'well'],
]

function getLogProbs(step: number, parentIdx: number): number[] {
  const base = [
    [-0.3, -0.9, -1.6, -2.1, -2.8],
    [-0.4, -0.7, -1.3, -2.0, -2.5],
    [-0.5, -1.0, -1.5, -1.9, -2.6],
    [-0.3, -0.8, -1.4, -2.2, -2.7],
  ]
  return base[step].map((v, i) => v - parentIdx * 0.15 + (i % 2 === 0 ? 0.05 : -0.05))
}

export default function BeamSearchViz() {
  const [beamWidth, setBeamWidth] = useState(3)
  const [currentStep, setCurrentStep] = useState(0)

  const { beams, history } = useMemo(() => {
    const hist: Beam[][] = [[{ tokens: ['<s>'], logProb: 0, finished: false }]]
    let active: Beam[] = [{ tokens: ['<s>'], logProb: 0, finished: false }]

    for (let step = 0; step < Math.min(currentStep, 4); step++) {
      const allCandidates: Beam[] = []
      active.forEach((beam, bIdx) => {
        if (beam.finished) { allCandidates.push(beam); return }
        const words = CANDIDATES[step]
        const lps = getLogProbs(step, bIdx)
        words.forEach((word, wIdx) => {
          allCandidates.push({
            tokens: [...beam.tokens, word],
            logProb: beam.logProb + lps[wIdx],
            finished: step === 3,
          })
        })
      })
      allCandidates.sort((a, b) => b.logProb - a.logProb)
      active = allCandidates.slice(0, beamWidth)
      hist.push([...active])
    }
    return { beams: active, history: hist }
  }, [beamWidth, currentStep])

  const maxSteps = 4
  const nodeW = 60
  const nodeH = 28
  const stepGap = 90
  const beamGap = 38
  const svgW = (maxSteps + 1) * stepGap + 40
  const svgH = Math.max(beamWidth * beamGap + 60, 200)

  function nodeX(step: number) { return 30 + step * stepGap }
  function nodeY(idx: number, total: number) {
    const blockH = (total - 1) * beamGap
    return (svgH - blockH) / 2 + idx * beamGap
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-green-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-green-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h4l3-9 4 18 3-9h4"/></svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Beam Search</h3>
          <p className="text-xs text-muted-foreground">Keep top-B candidates at each step by cumulative log probability</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 overflow-x-auto">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto min-w-[500px]">
            {/* Step labels */}
            {Array.from({ length: maxSteps + 1 }).map((_, s) => (
              <text key={s} x={nodeX(s) + nodeW / 2} y={14} textAnchor="middle" fill="currentColor" fillOpacity={0.4} fontSize={9}>
                {s === 0 ? 'Start' : `Step ${s}`}
              </text>
            ))}

            {/* Draw edges between consecutive history steps */}
            {history.map((stepBeams, step) => {
              if (step === 0) return null
              const prevBeams = history[step - 1]
              return stepBeams.map((beam, bIdx) => {
                const parentIdx = prevBeams.findIndex(pb =>
                  beam.tokens.slice(0, -1).join(' ') === pb.tokens.join(' ')
                )
                const pIdx = parentIdx >= 0 ? parentIdx : Math.min(bIdx, prevBeams.length - 1)
                const x1 = nodeX(step - 1) + nodeW
                const y1 = nodeY(pIdx, prevBeams.length)
                const x2 = nodeX(step)
                const y2 = nodeY(bIdx, stepBeams.length)
                const opacity = 0.2 + Math.exp(beam.logProb) * 0.6
                return (
                  <line key={`e-${step}-${bIdx}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(74, 222, 128, 0.4)" strokeWidth={1.5} strokeOpacity={opacity} />
                )
              })
            })}

            {/* Draw nodes */}
            {history.map((stepBeams, step) =>
              stepBeams.map((beam, bIdx) => {
                const x = nodeX(step)
                const y = nodeY(bIdx, stepBeams.length) - nodeH / 2
                const intensity = Math.exp(beam.logProb)
                const lastToken = beam.tokens[beam.tokens.length - 1]
                const isFinished = beam.finished && step === history.length - 1
                return (
                  <g key={`n-${step}-${bIdx}`}>
                    <rect x={x} y={y} width={nodeW} height={nodeH} rx={6} fill={isFinished ? 'rgba(74, 222, 128, 0.15)' : `rgba(74, 222, 128, ${0.05 + intensity * 0.2})`} stroke={isFinished ? '#4ade80' : 'rgba(74, 222, 128, 0.3)'} strokeWidth={isFinished ? 1.5 : 0.5} />
                    <text x={x + nodeW / 2} y={y + nodeH / 2 - 2} textAnchor="middle" fill="currentColor" fillOpacity={0.8} fontSize={9} fontWeight="bold">{lastToken}</text>
                    <text x={x + nodeW / 2} y={y + nodeH / 2 + 8} textAnchor="middle" fill="currentColor" fillOpacity={0.4} fontSize={7} fontFamily="monospace">{beam.logProb.toFixed(2)}</text>
                  </g>
                )
              })
            )}
          </svg>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">Beam Width: {beamWidth}</label>
            <input type="range" min={1} max={5} step={1} value={beamWidth} onChange={e => { setBeamWidth(parseInt(e.target.value)); setCurrentStep(0) }} className="w-full accent-green-500" />
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">Step: {currentStep} / {maxSteps}</label>
            <div className="flex gap-2">
              <button onClick={() => setCurrentStep(s => Math.min(s + 1, maxSteps))} disabled={currentStep >= maxSteps} className="text-xs px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/40 text-green-300 hover:bg-green-500/30 transition disabled:opacity-30">
                Next Step
              </button>
              <button onClick={() => setCurrentStep(0)} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted/50 transition">
                Reset
              </button>
            </div>
          </div>

          {currentStep > 0 && (
            <div className="bg-muted border border-border p-3 rounded-xl">
              <div className="text-xs uppercase font-bold text-muted-foreground mb-1">Active Beams</div>
              {beams.filter(b => !b.finished || currentStep === maxSteps).map((beam, i) => (
                <div key={i} className="text-xs font-mono text-green-400 flex justify-between mt-1">
                  <span>{beam.tokens.join(' ')}</span>
                  <span className="text-muted-foreground">{beam.logProb.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-auto bg-green-500/5 border border-green-500/10 p-3 rounded-lg">
            <p className="text-xs text-green-300 leading-relaxed italic">
              Beam search expands each candidate, scores all children, then prunes to keep the top B. Wider beams find better sequences but cost more compute.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
