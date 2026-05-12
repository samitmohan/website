'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'

export default function CausalMaskViz() {
  const [seqLen, setSeqLen] = useState(6)
  const [step, setStep] = useState(3)
  const [showLogits, setShowLogits] = useState(true)

  const tokens = ['The', 'cat', 'sat', 'on', 'the', 'mat', '.', 'It', 'was', 'soft']
    .slice(0, seqLen)

  // Generate mask and attention
  const { mask, attention } = useMemo(() => {
    const m: boolean[][] = []
    for (let i = 0; i < seqLen; i++) {
      const row: boolean[] = []
      for (let j = 0; j < seqLen; j++) {
        row.push(j <= i) // true = can attend
      }
      m.push(row)
    }

    // Fake attention weights (softmax over allowed positions)
    const att: number[][] = m.map((row, qi) => {
      const allowed = row.map((canAttend, ki) => {
        if (!canAttend) return -Infinity
        // Slight preference for recent tokens and self
        return ki === qi ? 1.5 : 1.0 / (qi - ki + 1)
      })
      const max = Math.max(...allowed.filter(v => v !== -Infinity))
      const exps = allowed.map(v => v === -Infinity ? 0 : Math.exp(v - max))
      const sum = exps.reduce((a, b) => a + b, 0)
      return exps.map(e => sum > 0 ? e / sum : 0)
    })

    return { mask: m, attention: att }
  }, [seqLen])

  const cellSize = 44
  const labelW = 42
  const W = labelW + seqLen * cellSize
  const H = labelW + seqLen * cellSize

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-orange-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-orange-500/10 p-1.5 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-orange-400" />
        </div>
        <div>
          <h3 className="text-base font-bold">Causal (Autoregressive) Mask</h3>
          <p className="text-xs text-muted-foreground">Lower-triangular mask prevents attending to future tokens</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 flex justify-center">
          <svg viewBox={`0 0 ${W} ${H + 16}`} className="w-full h-auto max-w-sm">
            {/* Column labels */}
            {tokens.map((tok, i) => (
              <text
                key={`col-${i}`}
                x={labelW + i * cellSize + cellSize / 2}
                y={labelW - 8}
                textAnchor="middle"
                fill="currentColor"
                fillOpacity={i <= step ? 0.7 : 0.2}
                fontSize={9}
              >
                {tok}
              </text>
            ))}

            {/* Row labels */}
            {tokens.map((tok, i) => (
              <text
                key={`row-${i}`}
                x={labelW - 4}
                y={labelW + i * cellSize + cellSize / 2 + 3}
                textAnchor="end"
                fill="currentColor"
                fillOpacity={i === step ? 1 : 0.4}
                fontSize={9}
                fontWeight={i === step ? 'bold' : 'normal'}
              >
                {tok}
              </text>
            ))}

            {/* Cells */}
            {mask.map((row, qi) =>
              row.map((canAttend, ki) => {
                const isCurrentRow = qi === step
                const w = showLogits ? attention[qi][ki] : (canAttend ? 1 : 0)
                return (
                  <g key={`${qi}-${ki}`}>
                    <motion.rect
                      x={labelW + ki * cellSize}
                      y={labelW + qi * cellSize}
                      width={cellSize}
                      height={cellSize}
                      fill={
                        canAttend
                          ? isCurrentRow
                            ? `rgba(251, 146, 60, ${showLogits ? w : 0.4})`
                            : `rgba(251, 146, 60, ${showLogits ? w * 0.5 : 0.15})`
                          : 'rgba(30, 30, 46, 0.8)'
                      }
                      stroke={isCurrentRow && canAttend ? '#fb923c' : 'currentColor'}
                      strokeOpacity={isCurrentRow && canAttend ? 0.6 : 0.08}
                      strokeWidth={isCurrentRow && canAttend ? 1.5 : 0.5}
                      animate={{
                        fill: canAttend
                          ? isCurrentRow
                            ? `rgba(251, 146, 60, ${showLogits ? w : 0.4})`
                            : `rgba(251, 146, 60, ${showLogits ? w * 0.5 : 0.15})`
                          : 'rgba(30, 30, 46, 0.8)',
                      }}
                    />
                    {canAttend && showLogits && (
                      <text
                        x={labelW + ki * cellSize + cellSize / 2}
                        y={labelW + qi * cellSize + cellSize / 2 + 3}
                        textAnchor="middle"
                        fill="currentColor"
                        fillOpacity={isCurrentRow ? 0.9 : 0.3}
                        fontSize={8}
                        fontFamily="monospace"
                      >
                        {w.toFixed(2)}
                      </text>
                    )}
                    {!canAttend && (
                      <line
                        x1={labelW + ki * cellSize + 8}
                        y1={labelW + qi * cellSize + 8}
                        x2={labelW + ki * cellSize + cellSize - 8}
                        y2={labelW + qi * cellSize + cellSize - 8}
                        stroke="currentColor"
                        strokeOpacity={0.15}
                        strokeWidth={1}
                      />
                    )}
                  </g>
                )
              })
            )}
          </svg>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">Sequence Length: {seqLen}</label>
            <input
              type="range" min={3} max={10} step={1}
              value={seqLen}
              onChange={(e) => { setSeqLen(parseInt(e.target.value)); setStep(Math.min(step, parseInt(e.target.value) - 1)) }}
              className="w-full accent-orange-500"
            />
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">
              Current token: "{tokens[step]}" (pos {step})
            </label>
            <input
              type="range" min={0} max={seqLen - 1} step={1}
              value={step}
              onChange={(e) => setStep(parseInt(e.target.value))}
              className="w-full accent-orange-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLogits(!showLogits)}
              className={`text-xs px-3 py-1 rounded-lg border transition ${
                showLogits
                  ? 'bg-orange-500/20 border-orange-500/40 text-orange-300'
                  : 'border-border text-muted-foreground'
              }`}
            >
              {showLogits ? 'Weights' : 'Mask only'}
            </button>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl">
            <div className="text-xs uppercase font-bold text-muted-foreground mb-1">Can attend to</div>
            <div className="text-sm font-mono text-orange-400">
              {tokens.slice(0, step + 1).join(', ')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {step + 1} of {seqLen} tokens visible
            </div>
          </div>

          <div className="mt-auto bg-orange-500/5 border border-orange-500/10 p-3 rounded-lg">
            <p className="text-xs text-orange-300 leading-relaxed italic">
              GPT can only see past tokens. At position {step}, "{tokens[step]}" attends to positions 0..{step} but not {step + 1}+. This enforces left-to-right autoregressive generation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
