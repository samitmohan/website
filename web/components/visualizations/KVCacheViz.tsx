'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Database } from 'lucide-react'

export default function KVCacheViz() {
  const [step, setStep] = useState(0)
  const [maxTokens] = useState(6)

  const tokens = ['The', 'cat', 'sat', 'on', 'a', 'mat']

  // At each generation step, we've generated tokens[0..step]
  // step=0 means token 0 just computed; step=5 means all 6 tokens done
  const filledRows = step + 1
  const currentToken = step

  // Simulated K/V values per token (3 dims each for display)
  const kvDims = 4
  const kvData = useMemo(() => {
    const seed = [0.3, 0.7, 0.2, 0.9, 0.5, 0.1, 0.8, 0.4, 0.6, 0.35, 0.85, 0.55,
                  0.15, 0.65, 0.45, 0.75, 0.25, 0.95, 0.38, 0.72, 0.18, 0.88, 0.52, 0.08,
                  0.82, 0.42, 0.62, 0.32, 0.78, 0.28, 0.98, 0.48, 0.68, 0.22, 0.92, 0.58,
                  0.12, 0.82, 0.42, 0.62, 0.32, 0.78, 0.28, 0.98, 0.48, 0.68, 0.22, 0.92]
    const keys: number[][] = []
    const values: number[][] = []
    for (let t = 0; t < maxTokens; t++) {
      const k: number[] = []
      const v: number[] = []
      for (let d = 0; d < kvDims; d++) {
        k.push(seed[(t * kvDims + d) % seed.length])
        v.push(seed[(t * kvDims + d + 7) % seed.length])
      }
      keys.push(k)
      values.push(v)
    }
    return { keys, values }
  }, [maxTokens, kvDims])

  // Memory cost comparison
  const dModel = 512 // pretend
  const withoutCache = useMemo(() => {
    // Without cache: at step t, recompute all t tokens' K and V
    // Total ops across all steps = sum(i=1..filledRows) of i = filledRows*(filledRows+1)/2
    let total = 0
    for (let t = 1; t <= filledRows; t++) total += t
    return total * dModel * 2 // K + V
  }, [filledRows, dModel])

  const withCache = useMemo(() => {
    // With cache: at each step, compute only 1 new K and 1 new V
    return filledRows * dModel * 2
  }, [filledRows, dModel])

  const savings = withoutCache > 0 ? ((1 - withCache / withoutCache) * 100) : 0

  const handleStep = useCallback(() => {
    setStep(prev => (prev + 1) % maxTokens)
  }, [maxTokens])

  const handleReset = useCallback(() => {
    setStep(0)
  }, [])

  // Grid sizing
  const cellW = 40
  const cellH = 32
  const labelW = 50
  const headerH = 24
  const gapBetweenKV = 24
  const kBlockW = kvDims * cellW
  const vBlockW = kvDims * cellW
  const totalW = labelW + kBlockW + gapBetweenKV + vBlockW + 20
  const totalH = headerH + maxTokens * cellH + 20

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-emerald-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-emerald-500/10 p-1.5 rounded-lg">
          <Database className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-base font-bold">KV Cache</h3>
          <p className="text-xs text-muted-foreground">Cache key/value vectors to avoid recomputation during autoregressive generation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 flex justify-center">
          <svg viewBox={`0 0 ${totalW} ${totalH}`} className="w-full h-auto max-w-lg">
            {/* K header */}
            <text
              x={labelW + kBlockW / 2}
              y={14}
              textAnchor="middle"
              fill="#34d399"
              fontSize={10}
              fontWeight="bold"
            >
              Key Cache
            </text>

            {/* V header */}
            <text
              x={labelW + kBlockW + gapBetweenKV + vBlockW / 2}
              y={14}
              textAnchor="middle"
              fill="#a78bfa"
              fontSize={10}
              fontWeight="bold"
            >
              Value Cache
            </text>

            {/* Rows */}
            {tokens.map((tok, row) => {
              const y = headerH + row * cellH
              const isFilled = row < filledRows
              const isCurrent = row === currentToken
              const isRead = row < currentToken

              return (
                <g key={row}>
                  {/* Row label */}
                  <text
                    x={labelW - 6}
                    y={y + cellH / 2 + 3}
                    textAnchor="end"
                    fill="currentColor"
                    fillOpacity={isFilled ? (isCurrent ? 1 : 0.6) : 0.15}
                    fontSize={9}
                    fontWeight={isCurrent ? 'bold' : 'normal'}
                  >
                    {tok}
                  </text>

                  {/* K cells */}
                  {Array.from({ length: kvDims }).map((_, d) => {
                    const cx = labelW + d * cellW
                    return (
                      <g key={`k-${row}-${d}`}>
                        <motion.rect
                          x={cx} y={y}
                          width={cellW} height={cellH}
                          rx={3}
                          animate={{
                            fill: isFilled
                              ? isCurrent
                                ? `rgba(52, 211, 153, ${kvData.keys[row][d]})`
                                : `rgba(52, 211, 153, ${kvData.keys[row][d] * 0.5})`
                              : 'rgba(30, 30, 46, 0.4)',
                          }}
                          transition={{ duration: 0.3 }}
                          stroke={isCurrent ? '#34d399' : isRead && isFilled ? '#34d399' : 'currentColor'}
                          strokeOpacity={isCurrent ? 0.8 : isRead && isFilled ? 0.3 : 0.06}
                          strokeWidth={isCurrent ? 1.5 : 0.5}
                        />
                        {isFilled && (
                          <text
                            x={cx + cellW / 2}
                            y={y + cellH / 2 + 3}
                            textAnchor="middle"
                            fill="currentColor"
                            fillOpacity={isCurrent ? 0.9 : 0.4}
                            fontSize={7}
                            fontFamily="monospace"
                          >
                            {kvData.keys[row][d].toFixed(2)}
                          </text>
                        )}
                      </g>
                    )
                  })}

                  {/* V cells */}
                  {Array.from({ length: kvDims }).map((_, d) => {
                    const cx = labelW + kBlockW + gapBetweenKV + d * cellW
                    return (
                      <g key={`v-${row}-${d}`}>
                        <motion.rect
                          x={cx} y={y}
                          width={cellW} height={cellH}
                          rx={3}
                          animate={{
                            fill: isFilled
                              ? isCurrent
                                ? `rgba(167, 139, 250, ${kvData.values[row][d]})`
                                : `rgba(167, 139, 250, ${kvData.values[row][d] * 0.5})`
                              : 'rgba(30, 30, 46, 0.4)',
                          }}
                          transition={{ duration: 0.3 }}
                          stroke={isCurrent ? '#a78bfa' : isRead && isFilled ? '#a78bfa' : 'currentColor'}
                          strokeOpacity={isCurrent ? 0.8 : isRead && isFilled ? 0.3 : 0.06}
                          strokeWidth={isCurrent ? 1.5 : 0.5}
                        />
                        {isFilled && (
                          <text
                            x={cx + cellW / 2}
                            y={y + cellH / 2 + 3}
                            textAnchor="middle"
                            fill="currentColor"
                            fillOpacity={isCurrent ? 0.9 : 0.4}
                            fontSize={7}
                            fontFamily="monospace"
                          >
                            {kvData.values[row][d].toFixed(2)}
                          </text>
                        )}
                      </g>
                    )
                  })}

                  {/* Read indicator: arrow from current token to cached rows */}
                  {isRead && isFilled && isCurrent === false && step > 0 && row < step && (
                    <motion.line
                      x1={labelW - 10}
                      y1={headerH + currentToken * cellH + cellH / 2}
                      x2={labelW - 10}
                      y2={y + cellH / 2}
                      stroke="#fbbf24"
                      strokeWidth={1}
                      strokeOpacity={0.4}
                      strokeDasharray="2 2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4 }}
                    />
                  )}
                </g>
              )
            })}

            {/* Current token read bracket */}
            {step > 0 && (
              <>
                <motion.line
                  x1={labelW - 14} y1={headerH + cellH / 2}
                  x2={labelW - 14}
                  animate={{ y2: headerH + currentToken * cellH + cellH / 2 }}
                  stroke="#fbbf24" strokeWidth={1.5} strokeOpacity={0.5}
                />
                <text
                  x={labelW - 18}
                  y={headerH + (currentToken * cellH) / 2 + cellH / 2}
                  textAnchor="end"
                  fill="#fbbf24"
                  fillOpacity={0.6}
                  fontSize={7}
                >
                  reads
                </text>
              </>
            )}
          </svg>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleStep}
              className="text-xs px-4 py-1.5 rounded-lg border bg-emerald-500/20 border-emerald-500/40 text-emerald-300 transition hover:bg-emerald-500/30"
            >
              Step ({step + 1}/{maxTokens})
            </button>
            <button
              onClick={handleReset}
              className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground transition hover:text-foreground"
            >
              Reset
            </button>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-2">
            <div className="text-xs uppercase font-bold text-muted-foreground">Current Step</div>
            <div className="text-sm font-mono text-emerald-400">
              Token "{tokens[currentToken]}" (pos {currentToken})
            </div>
            <div className="text-xs text-muted-foreground">
              Computes new K,V for pos {currentToken}
            </div>
            <div className="text-xs text-muted-foreground">
              Reads cached K,V from pos 0..{currentToken}
            </div>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-2">
            <div className="text-xs uppercase font-bold text-muted-foreground">Memory Comparison</div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Without cache (recompute)</span>
                <span className="font-mono text-red-400">{(withoutCache / 1000).toFixed(0)}K</span>
              </div>
              <div className="w-full h-1.5 bg-accent rounded-full overflow-hidden">
                <div className="h-full bg-red-500/60 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">With KV cache</span>
                <span className="font-mono text-emerald-400">{(withCache / 1000).toFixed(0)}K</span>
              </div>
              <div className="w-full h-1.5 bg-accent rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500/60 rounded-full"
                  animate={{ width: `${withoutCache > 0 ? (withCache / withoutCache) * 100 : 100}%` }}
                />
              </div>
            </div>
            <div className="text-xs font-mono text-emerald-400 text-center">
              {savings.toFixed(0)}% compute saved
            </div>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-1">
            <div className="text-xs uppercase font-bold text-muted-foreground">Legend</div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-emerald-400/70" />
              <span className="text-muted-foreground">Key vectors</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-violet-400/70" />
              <span className="text-muted-foreground">Value vectors</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-0.5 bg-yellow-400/60" />
              <span className="text-muted-foreground">Read from cache</span>
            </div>
          </div>

          <div className="mt-auto bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg">
            <p className="text-xs text-emerald-300 leading-relaxed italic">
              Without caching, generating token N requires recomputing K and V for all N previous tokens. The KV cache stores past results so each step computes only one new K,V pair and reads the rest from memory.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
