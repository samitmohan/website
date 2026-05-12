'use client'

import { useState, useMemo } from 'react'

const VOCAB = ['the', 'cat', 'sat', 'on', 'a', 'mat', 'dog', 'ran']
const BASE_LOGITS = [2.5, 1.8, 0.9, 0.5, 0.3, -0.2, -0.8, -1.5]

function softmax(logits: number[], temperature: number): number[] {
  const scaled = logits.map(l => l / temperature)
  const maxVal = Math.max(...scaled)
  const exps = scaled.map(v => Math.exp(v - maxVal))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map(e => e / sum)
}

function weightedSample(probs: number[]): number {
  const r = Math.random()
  let cumulative = 0
  for (let i = 0; i < probs.length; i++) {
    cumulative += probs[i]
    if (r <= cumulative) return i
  }
  return probs.length - 1
}

export default function TemperatureSamplingViz() {
  const [temperature, setTemperature] = useState(1.0)
  const [sampledIdx, setSampledIdx] = useState<number | null>(null)
  const [sampleHistory, setSampleHistory] = useState<string[]>([])

  const probs = useMemo(() => softmax(BASE_LOGITS, temperature), [temperature])

  const maxProb = Math.max(...probs)
  const barMaxH = 160

  function handleSample() {
    const idx = weightedSample(probs)
    setSampledIdx(idx)
    setSampleHistory(prev => [...prev.slice(-11), VOCAB[idx]])
  }

  function handleReset() {
    setSampledIdx(null)
    setSampleHistory([])
  }

  const tempLabel = temperature <= 0.3 ? 'Greedy (peaked)' : temperature <= 0.8 ? 'Focused' : temperature <= 1.5 ? 'Balanced' : temperature <= 2.2 ? 'Creative' : 'Uniform (flat)'

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-blue-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v6m0 8v6m-4-10a4 4 0 108 0 4 4 0 00-8 0z"/></svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Temperature Sampling</h3>
          <p className="text-xs text-muted-foreground">softmax(logits / T) controls randomness in token selection</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4">
          <div className="bg-muted/40 border border-border/30 rounded-lg px-3 py-1.5 mb-4 text-center">
            <span className="text-xs font-mono text-muted-foreground">P(token) = </span>
            <span className="text-xs font-mono text-blue-400">exp(logit_i / T) / sum(exp(logit_j / T))</span>
          </div>

          <svg viewBox={`0 0 400 ${barMaxH + 60}`} className="w-full h-auto">
            {probs.map((p, i) => {
              const barW = 36
              const gap = (400 - VOCAB.length * barW) / (VOCAB.length + 1)
              const x = gap + i * (barW + gap)
              const barH = (p / (maxProb || 1)) * barMaxH
              const y = barMaxH - barH + 10
              const isSampled = sampledIdx === i
              const fill = isSampled ? 'rgba(59, 130, 246, 0.8)' : `rgba(59, 130, 246, ${0.15 + p * 0.7})`
              const stroke = isSampled ? '#3b82f6' : 'rgba(59, 130, 246, 0.3)'
              return (
                <g key={i}>
                  <rect x={x} y={y} width={barW} height={barH} rx={3} fill={fill} stroke={stroke} strokeWidth={isSampled ? 2 : 0.5} />
                  <text x={x + barW / 2} y={y - 4} textAnchor="middle" fill="currentColor" fillOpacity={0.7} fontSize={9} fontFamily="monospace">
                    {(p * 100).toFixed(1)}%
                  </text>
                  <text x={x + barW / 2} y={barMaxH + 24} textAnchor="middle" fill="currentColor" fillOpacity={isSampled ? 1 : 0.5} fontSize={10} fontWeight={isSampled ? 'bold' : 'normal'}>
                    {VOCAB[i]}
                  </text>
                  {isSampled && (
                    <text x={x + barW / 2} y={barMaxH + 38} textAnchor="middle" fill="#3b82f6" fontSize={8} fontWeight="bold">
                      SAMPLED
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">
              Temperature: {temperature.toFixed(1)} - {tempLabel}
            </label>
            <input type="range" min={0.1} max={3.0} step={0.1} value={temperature} onChange={e => { setTemperature(parseFloat(e.target.value)); setSampledIdx(null) }} className="w-full accent-blue-500" />
            <div className="flex justify-between text-sm text-muted-foreground mt-0.5">
              <span>0.1 (greedy)</span><span>3.0 (uniform)</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSample} className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 hover:bg-blue-500/30 transition">
              Sample Token
            </button>
            <button onClick={handleReset} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted/50 transition">
              Reset
            </button>
          </div>

          {sampleHistory.length > 0 && (
            <div className="bg-muted border border-border p-3 rounded-xl">
              <div className="text-xs uppercase font-bold text-muted-foreground mb-1">Sample History</div>
              <div className="text-xs font-mono text-blue-400 flex flex-wrap gap-1">
                {sampleHistory.map((tok, i) => (
                  <span key={i} className="bg-blue-500/10 px-1.5 py-0.5 rounded">{tok}</span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-muted border border-border p-3 rounded-xl">
            <div className="text-xs uppercase font-bold text-muted-foreground mb-1">Entropy</div>
            <div className="text-sm font-mono text-blue-400">
              H = {(-probs.reduce((s, p) => s + (p > 0 ? p * Math.log2(p) : 0), 0)).toFixed(3)} bits
            </div>
          </div>

          <div className="mt-auto bg-blue-500/5 border border-blue-500/10 p-3 rounded-lg">
            <p className="text-xs text-blue-300 leading-relaxed italic">
              Low T concentrates probability on the top token. High T spreads probability across all tokens. T=1.0 uses raw model logits unchanged.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
