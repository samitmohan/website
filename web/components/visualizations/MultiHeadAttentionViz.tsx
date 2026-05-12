'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Layers, ArrowRight } from 'lucide-react'

const TOKENS = ['The', 'cat', 'sat', 'here']

const HEAD_PATTERNS: { label: string; description: string; weights: number[][] }[] = [
  {
    label: 'Previous Token',
    description: 'Each token attends to the token before it',
    weights: [
      [0.8, 0.1, 0.05, 0.05],
      [0.7, 0.2, 0.05, 0.05],
      [0.05, 0.7, 0.2, 0.05],
      [0.05, 0.05, 0.7, 0.2],
    ],
  },
  {
    label: 'First Token',
    description: 'All tokens attend to the first position (CLS-like)',
    weights: [
      [0.85, 0.05, 0.05, 0.05],
      [0.7, 0.15, 0.1, 0.05],
      [0.65, 0.1, 0.15, 0.1],
      [0.6, 0.1, 0.1, 0.2],
    ],
  },
  {
    label: 'Diagonal',
    description: 'Each token attends most to itself (identity-like)',
    weights: [
      [0.7, 0.1, 0.1, 0.1],
      [0.1, 0.7, 0.1, 0.1],
      [0.1, 0.1, 0.7, 0.1],
      [0.1, 0.1, 0.1, 0.7],
    ],
  },
  {
    label: 'Uniform',
    description: 'Equal attention across all positions (averaging)',
    weights: [
      [0.25, 0.25, 0.25, 0.25],
      [0.25, 0.25, 0.25, 0.25],
      [0.25, 0.25, 0.25, 0.25],
      [0.25, 0.25, 0.25, 0.25],
    ],
  },
]

const HEAD_COLORS = ['#6366f1', '#f43f5e', '#f59e0b', '#34d399']

export default function MultiHeadAttentionViz() {
  const [activeHead, setActiveHead] = useState(0)
  const [showConcat, setShowConcat] = useState(false)

  const cellSize = 36
  const labelW = 32

  const concatenated = useMemo(() => {
    return TOKENS.map((_, qi) =>
      HEAD_PATTERNS.map((head) =>
        head.weights[qi].reduce((max, w) => Math.max(max, w), 0).toFixed(2)
      )
    )
  }, [])

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-violet-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-violet-500/10 p-1.5 rounded-lg">
          <Layers className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <h3 className="text-base font-bold">Multi-Head Attention</h3>
          <p className="text-xs text-muted-foreground">4 heads with different attention patterns on a 4-token sequence</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4">
          {/* All 4 heads side by side */}
          <div className="flex gap-3 justify-center flex-wrap mb-4">
            {HEAD_PATTERNS.map((head, hi) => {
              const isActive = activeHead === hi
              const color = HEAD_COLORS[hi]
              const totalW = labelW + TOKENS.length * cellSize
              const totalH = labelW + TOKENS.length * cellSize + 16

              return (
                <motion.div
                  key={hi}
                  className="cursor-pointer rounded-xl border p-2"
                  animate={{
                    borderColor: isActive ? `${color}88` : 'rgba(255,255,255,0.06)',
                    backgroundColor: isActive ? `${color}08` : 'transparent',
                  }}
                  onClick={() => setActiveHead(hi)}
                >
                  <div className="text-base font-bold text-center mb-1" style={{ color }}>{head.label}</div>
                  <svg viewBox={`0 0 ${totalW} ${totalH}`} width={totalW * 0.85} height={totalH * 0.85}>
                    {/* Column labels */}
                    {TOKENS.map((tok, i) => (
                      <text key={`c-${i}`} x={labelW + i * cellSize + cellSize / 2} y={labelW - 6} textAnchor="middle" fill="currentColor" fillOpacity={0.4} fontSize={7}>
                        {tok}
                      </text>
                    ))}
                    {/* Row labels */}
                    {TOKENS.map((tok, i) => (
                      <text key={`r-${i}`} x={labelW - 4} y={labelW + i * cellSize + cellSize / 2 + 3} textAnchor="end" fill="currentColor" fillOpacity={0.4} fontSize={7}>
                        {tok}
                      </text>
                    ))}
                    {/* Cells */}
                    {head.weights.map((row, qi) =>
                      row.map((w, ki) => (
                        <g key={`${qi}-${ki}`}>
                          <rect
                            x={labelW + ki * cellSize}
                            y={labelW + qi * cellSize}
                            width={cellSize}
                            height={cellSize}
                            fill={`${color}`}
                            fillOpacity={w * 0.8}
                            stroke="currentColor"
                            strokeOpacity={0.05}
                            strokeWidth={0.5}
                          />
                          <text
                            x={labelW + ki * cellSize + cellSize / 2}
                            y={labelW + qi * cellSize + cellSize / 2 + 3}
                            textAnchor="middle"
                            fill="currentColor"
                            fillOpacity={w > 0.3 ? 0.8 : 0.3}
                            fontSize={7}
                            fontFamily="monospace"
                          >
                            {w.toFixed(2)}
                          </text>
                        </g>
                      ))
                    )}
                  </svg>
                </motion.div>
              )
            })}
          </div>

          {/* Concatenation visualization */}
          {showConcat && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-muted/50 border border-border rounded-xl p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs uppercase font-bold text-muted-foreground">Concat + Linear Projection</span>
              </div>
              <div className="flex gap-1">
                {concatenated.map((row, qi) => (
                  <div key={qi} className="flex-1">
                    <div className="text-sm text-center text-muted-foreground mb-1">{TOKENS[qi]}</div>
                    <div className="flex gap-0.5">
                      {row.map((val, hi) => (
                        <div
                          key={hi}
                          className="flex-1 text-center py-1 rounded text-[8px] font-mono"
                          style={{ backgroundColor: `${HEAD_COLORS[hi]}22`, color: HEAD_COLORS[hi] }}
                        >
                          {val}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-sm text-muted-foreground mt-2 text-center">
                Each token: concat(head_1, head_2, head_3, head_4) then W_O projection
              </div>
            </motion.div>
          )}
        </div>

        {/* Dashboard */}
        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs uppercase font-bold text-muted-foreground">Show Concat</label>
            <button
              onClick={() => setShowConcat(!showConcat)}
              className={`text-xs px-3 py-1 rounded-lg border transition ${
                showConcat ? 'bg-violet-500/20 border-violet-500/40 text-violet-300' : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {showConcat ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Head selector */}
          <div className="space-y-2">
            <div className="text-xs uppercase font-bold text-muted-foreground">Active Head</div>
            <div className="grid grid-cols-2 gap-2">
              {HEAD_PATTERNS.map((head, hi) => (
                <button
                  key={hi}
                  onClick={() => setActiveHead(hi)}
                  className={`text-xs px-2 py-1.5 rounded-lg border transition font-medium ${
                    activeHead === hi
                      ? 'border-opacity-50'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                  style={activeHead === hi ? { borderColor: HEAD_COLORS[hi], color: HEAD_COLORS[hi], backgroundColor: `${HEAD_COLORS[hi]}15` } : {}}
                >
                  {head.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-1.5">
            <div className="text-xs uppercase font-bold text-muted-foreground">Head {activeHead + 1} Details</div>
            <div className="text-xs font-bold" style={{ color: HEAD_COLORS[activeHead] }}>
              {HEAD_PATTERNS[activeHead].label}
            </div>
            <div className="text-xs text-muted-foreground">
              {HEAD_PATTERNS[activeHead].description}
            </div>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-1">
            <div className="text-xs uppercase font-bold text-muted-foreground">Architecture</div>
            <div className="text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Heads</span>
                <span>4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tokens</span>
                <span>{TOKENS.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Output</span>
                <span className="text-violet-400">Concat + W_O</span>
              </div>
            </div>
          </div>

          <div className="mt-auto bg-violet-500/5 border border-violet-500/10 p-3 rounded-lg">
            <p className="text-xs text-violet-300 leading-relaxed italic">
              Each head learns a different attention pattern. One head tracks positional adjacency, another anchors to the first token. The model concatenates all heads and projects back to the original dimension.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
