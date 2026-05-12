'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Scaling } from 'lucide-react'

export default function LayerNormViz() {
  const [inputValues, setInputValues] = useState([3.2, -1.5, 0.8, 4.1, -0.3, 2.0, -2.7, 1.4])
  const [gamma, setGamma] = useState(1.0)
  const [beta, setBeta] = useState(0.0)
  const [applyGammaBeta, setApplyGammaBeta] = useState(false)
  const [showNormalized, setShowNormalized] = useState(true)

  const eps = 1e-5

  const stats = useMemo(() => {
    const n = inputValues.length
    const mean = inputValues.reduce((a, b) => a + b, 0) / n
    const variance = inputValues.reduce((a, v) => a + (v - mean) ** 2, 0) / n
    const std = Math.sqrt(variance + eps)
    const normalized = inputValues.map(x => (x - mean) / std)
    const output = applyGammaBeta
      ? normalized.map(x => x * gamma + beta)
      : normalized
    return { mean, variance, std, normalized, output }
  }, [inputValues, gamma, beta, applyGammaBeta])

  const handleSlider = useCallback((idx: number, val: number) => {
    setInputValues(prev => {
      const next = [...prev]
      next[idx] = val
      return next
    })
  }, [])

  const barW = 36
  const barGap = 8
  const n = inputValues.length
  const svgW = n * (barW + barGap) + 60
  const svgH = 220
  const baseY = svgH / 2
  const maxBarH = 80

  // Scale factor: map value range to pixel height
  const displayValues = showNormalized ? stats.output : inputValues
  const absMax = Math.max(...displayValues.map(Math.abs), 0.01)
  const scale = maxBarH / absMax

  const barColors = [
    '#6366f1', '#818cf8', '#a78bfa', '#c084fc',
    '#e879f9', '#f472b6', '#fb7185', '#f43f5e',
  ]

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-sky-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-sky-500/10 p-1.5 rounded-lg">
          <Scaling className="w-4 h-4 text-sky-400" />
        </div>
        <div>
          <h3 className="text-base font-bold">Layer Normalization</h3>
          <p className="text-xs text-muted-foreground">
            (x - mean) / sqrt(var + eps) * gamma + beta
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 flex flex-col items-center">
          <div className="text-xs uppercase font-bold text-muted-foreground mb-2">
            {showNormalized ? (applyGammaBeta ? 'Output (after gamma/beta)' : 'Normalized') : 'Input Vector'}
          </div>

          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto max-w-lg">
            {/* Zero / mean line */}
            <line
              x1={20} y1={baseY} x2={svgW - 20} y2={baseY}
              stroke="currentColor" strokeOpacity={0.15} strokeWidth={1}
            />
            <text x={14} y={baseY + 3} textAnchor="end" fill="currentColor" fillOpacity={0.3} fontSize={8} fontFamily="monospace">
              0
            </text>

            {/* Mean line for input view */}
            {!showNormalized && (
              <>
                <motion.line
                  x1={30} x2={svgW - 20}
                  animate={{ y1: baseY - stats.mean * scale, y2: baseY - stats.mean * scale }}
                  stroke="#38bdf8" strokeWidth={1.5} strokeDasharray="4 3" strokeOpacity={0.8}
                />
                <motion.text
                  x={svgW - 16}
                  animate={{ y: baseY - stats.mean * scale + 3 }}
                  textAnchor="start" fill="#38bdf8" fontSize={8} fontFamily="monospace"
                >
                  mu={stats.mean.toFixed(2)}
                </motion.text>

                {/* Variance band */}
                <motion.rect
                  x={30}
                  width={svgW - 50}
                  animate={{
                    y: baseY - (stats.mean + stats.std) * scale,
                    height: 2 * stats.std * scale,
                  }}
                  fill="#38bdf8" fillOpacity={0.06}
                  stroke="#38bdf8" strokeOpacity={0.15} strokeWidth={0.5}
                  rx={4}
                />
              </>
            )}

            {/* Bars */}
            {displayValues.map((val, i) => {
              const x = 30 + i * (barW + barGap)
              const h = Math.abs(val) * scale
              const y = val >= 0 ? baseY - h : baseY
              return (
                <g key={i}>
                  <motion.rect
                    x={x}
                    width={barW}
                    rx={4}
                    animate={{ y, height: Math.max(h, 1) }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    fill={barColors[i % barColors.length]}
                    fillOpacity={0.75}
                    stroke={barColors[i % barColors.length]}
                    strokeOpacity={0.3}
                    strokeWidth={1}
                  />
                  <motion.text
                    x={x + barW / 2}
                    animate={{ y: val >= 0 ? baseY - h - 6 : baseY + h + 12 }}
                    textAnchor="middle"
                    fill="currentColor"
                    fillOpacity={0.7}
                    fontSize={8}
                    fontFamily="monospace"
                  >
                    {val.toFixed(2)}
                  </motion.text>
                  <text
                    x={x + barW / 2}
                    y={svgH - 4}
                    textAnchor="middle"
                    fill="currentColor"
                    fillOpacity={0.3}
                    fontSize={8}
                  >
                    x{i}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-3">
          <div className="text-xs uppercase font-bold text-muted-foreground">Input Values</div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {inputValues.map((val, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm font-mono text-muted-foreground w-5">x{i}</span>
                <input
                  type="range" min={-5} max={5} step={0.1}
                  value={val}
                  onChange={(e) => handleSlider(i, parseFloat(e.target.value))}
                  className="flex-1 accent-sky-500"
                />
                <span className="text-sm font-mono w-8 text-right" style={{ color: barColors[i % barColors.length] }}>
                  {val.toFixed(1)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNormalized(!showNormalized)}
              className={`text-xs px-3 py-1 rounded-lg border transition ${
                showNormalized
                  ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                  : 'border-border text-muted-foreground'
              }`}
            >
              {showNormalized ? 'Normalized' : 'Raw Input'}
            </button>
            <button
              onClick={() => setApplyGammaBeta(!applyGammaBeta)}
              className={`text-xs px-3 py-1 rounded-lg border transition ${
                applyGammaBeta
                  ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                  : 'border-border text-muted-foreground'
              }`}
            >
              gamma/beta
            </button>
          </div>

          {applyGammaBeta && (
            <div className="space-y-2">
              <div>
                <label className="text-xs uppercase font-bold text-muted-foreground mb-0.5 block">
                  gamma: {gamma.toFixed(2)}
                </label>
                <input
                  type="range" min={0.1} max={3} step={0.05}
                  value={gamma}
                  onChange={(e) => setGamma(parseFloat(e.target.value))}
                  className="w-full accent-sky-500"
                />
              </div>
              <div>
                <label className="text-xs uppercase font-bold text-muted-foreground mb-0.5 block">
                  beta: {beta.toFixed(2)}
                </label>
                <input
                  type="range" min={-3} max={3} step={0.05}
                  value={beta}
                  onChange={(e) => setBeta(parseFloat(e.target.value))}
                  className="w-full accent-sky-500"
                />
              </div>
            </div>
          )}

          <div className="bg-muted border border-border p-3 rounded-xl space-y-1">
            <div className="text-xs uppercase font-bold text-muted-foreground">Statistics</div>
            <div className="text-xs font-mono space-y-0.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">mean</span>
                <span className="text-sky-400">{stats.mean.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">variance</span>
                <span className="text-sky-400">{stats.variance.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">std</span>
                <span className="text-sky-400">{stats.std.toFixed(4)}</span>
              </div>
            </div>
          </div>

          <div className="mt-auto bg-sky-500/5 border border-sky-500/10 p-3 rounded-lg">
            <p className="text-xs text-sky-300 leading-relaxed italic">
              Layer norm centers each vector to zero mean and unit variance, then applies learnable gamma (scale) and beta (shift). This stabilizes training by removing dependence on input magnitude.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
