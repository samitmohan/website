'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Grid3x3 } from 'lucide-react'

export default function AttentionHeatmapViz() {
  const tokens = ['The', 'cat', 'sat', 'on', 'the', 'mat']
  const [hoveredCell, setHoveredCell] = useState<{ q: number; k: number } | null>(null)
  const [useMask, setUseMask] = useState(false)
  const [temperature, setTemperature] = useState(1.0)

  // Generate Q, K with semantic similarity
  const { weights, scores } = useMemo(() => {
    // Handcrafted attention scores for a meaningful demo
    const rawScores = [
      [1.0, 0.3, 0.1, 0.1, 0.8, 0.1],   // "The" attends to "the"
      [0.2, 1.0, 0.4, 0.1, 0.1, 0.2],   // "cat" attends to itself, "sat"
      [0.1, 0.6, 1.0, 0.3, 0.1, 0.2],   // "sat" attends to "cat"
      [0.1, 0.1, 0.3, 1.0, 0.1, 0.6],   // "on" attends to "mat"
      [0.7, 0.2, 0.1, 0.1, 1.0, 0.2],   // "the" attends to "The"
      [0.1, 0.1, 0.1, 0.5, 0.2, 1.0],   // "mat" attends to "on"
    ]

    // Apply temperature
    const scaled = rawScores.map(row => row.map(v => v / temperature))

    // Apply causal mask if enabled
    const masked = scaled.map((row, qi) =>
      row.map((v, ki) => (useMask && ki > qi ? -1e9 : v))
    )

    // Softmax per row
    const softmaxWeights = masked.map(row => {
      const max = Math.max(...row)
      const exps = row.map(v => Math.exp(v - max))
      const sum = exps.reduce((a, b) => a + b, 0)
      return exps.map(e => e / sum)
    })

    return { weights: softmaxWeights, scores: rawScores }
  }, [useMask, temperature])

  const cellSize = 52
  const labelW = 40
  const totalW = labelW + tokens.length * cellSize
  const totalH = labelW + tokens.length * cellSize

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-teal-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-teal-500/10 p-1.5 rounded-lg">
          <Grid3x3 className="w-4 h-4 text-teal-400" />
        </div>
        <div>
          <h3 className="text-base font-bold">Attention Heatmap</h3>
          <p className="text-xs text-muted-foreground">softmax(Q * K^T / sqrt(d_k)) - which tokens attend to which</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 flex justify-center">
          <svg viewBox={`0 0 ${totalW} ${totalH + 20}`} className="w-full h-auto max-w-md">
            {/* Column labels (Keys) */}
            {tokens.map((tok, i) => (
              <text
                key={`col-${i}`}
                x={labelW + i * cellSize + cellSize / 2}
                y={labelW - 8}
                textAnchor="middle"
                fill="currentColor"
                fillOpacity={hoveredCell?.k === i ? 1 : 0.5}
                fontSize={10}
                fontWeight={hoveredCell?.k === i ? 'bold' : 'normal'}
              >
                {tok}
              </text>
            ))}

            {/* Row labels (Queries) */}
            {tokens.map((tok, i) => (
              <text
                key={`row-${i}`}
                x={labelW - 4}
                y={labelW + i * cellSize + cellSize / 2 + 3}
                textAnchor="end"
                fill="currentColor"
                fillOpacity={hoveredCell?.q === i ? 1 : 0.5}
                fontSize={10}
                fontWeight={hoveredCell?.q === i ? 'bold' : 'normal'}
              >
                {tok}
              </text>
            ))}

            {/* Cells */}
            {weights.map((row, qi) =>
              row.map((w, ki) => {
                const isHovered = hoveredCell?.q === qi && hoveredCell?.k === ki
                const isMasked = useMask && ki > qi
                return (
                  <g key={`${qi}-${ki}`}>
                    <rect
                      x={labelW + ki * cellSize}
                      y={labelW + qi * cellSize}
                      width={cellSize}
                      height={cellSize}
                      fill={isMasked ? '#1e1e2e' : `rgba(45, 212, 191, ${w})`}
                      stroke={isHovered ? '#2dd4bf' : 'currentColor'}
                      strokeOpacity={isHovered ? 1 : 0.1}
                      strokeWidth={isHovered ? 2 : 0.5}
                      onMouseEnter={() => setHoveredCell({ q: qi, k: ki })}
                      onMouseLeave={() => setHoveredCell(null)}
                      className="cursor-crosshair"
                    />
                    {!isMasked && (
                      <text
                        x={labelW + ki * cellSize + cellSize / 2}
                        y={labelW + qi * cellSize + cellSize / 2 + 4}
                        textAnchor="middle"
                        fill="currentColor"
                        fillOpacity={w > 0.3 ? 0.9 : 0.4}
                        fontSize={9}
                        fontFamily="monospace"
                        pointerEvents="none"
                      >
                        {w.toFixed(2)}
                      </text>
                    )}
                    {isMasked && (
                      <text
                        x={labelW + ki * cellSize + cellSize / 2}
                        y={labelW + qi * cellSize + cellSize / 2 + 4}
                        textAnchor="middle"
                        fill="currentColor"
                        fillOpacity={0.2}
                        fontSize={9}
                        pointerEvents="none"
                      >
                        -inf
                      </text>
                    )}
                  </g>
                )
              })
            )}

            {/* Axis labels */}
            <text x={totalW / 2} y={totalH + 14} textAnchor="middle" fill="currentColor" fillOpacity={0.4} fontSize={9}>Keys (what each token offers)</text>
            <text x={6} y={totalH / 2} textAnchor="middle" fill="currentColor" fillOpacity={0.4} fontSize={9} transform={`rotate(-90, 6, ${totalH / 2})`}>Queries</text>
          </svg>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs uppercase font-bold text-muted-foreground">Causal Mask</label>
            <button
              onClick={() => setUseMask(!useMask)}
              className={`text-xs px-3 py-1 rounded-lg border transition ${
                useMask
                  ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {useMask ? 'ON' : 'OFF'}
            </button>
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">
              Temperature: {temperature.toFixed(1)}
            </label>
            <input
              type="range" min={0.1} max={3.0} step={0.1}
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-teal-500"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Sharp (0.1)</span>
              <span>Uniform (3.0)</span>
            </div>
          </div>

          {hoveredCell && (
            <div className="bg-muted border border-border p-3 rounded-xl">
              <div className="text-xs uppercase font-bold text-muted-foreground mb-1">
                "{tokens[hoveredCell.q]}" -&gt; "{tokens[hoveredCell.k]}"
              </div>
              <div className="text-lg font-mono font-bold text-teal-400">
                {weights[hoveredCell.q][hoveredCell.k].toFixed(4)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Raw score: {scores[hoveredCell.q][hoveredCell.k].toFixed(2)}
              </div>
            </div>
          )}

          <div className="mt-auto bg-teal-500/5 border border-teal-500/10 p-3 rounded-lg">
            <p className="text-xs text-teal-300 leading-relaxed italic">
              {useMask
                ? "Causal mask prevents tokens from attending to future positions. Essential for autoregressive (GPT-style) generation."
                : "Each row sums to 1 (softmax). Brighter cells = stronger attention. Try enabling the causal mask to see GPT-style attention."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
