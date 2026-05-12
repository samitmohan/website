'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Hash } from 'lucide-react'

export default function PositionalEncodingViz() {
  const [maxLen, setMaxLen] = useState(20)
  const [dModel, setDModel] = useState(32)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const pe = useMemo(() => {
    const matrix: number[][] = []
    for (let pos = 0; pos < maxLen; pos++) {
      const row: number[] = []
      for (let i = 0; i < dModel; i++) {
        const div = Math.pow(10000, (2 * Math.floor(i / 2)) / dModel)
        row.push(i % 2 === 0 ? Math.sin(pos / div) : Math.cos(pos / div))
      }
      matrix.push(row)
    }
    return matrix
  }, [maxLen, dModel])

  // Draw heatmap on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cellW = canvas.width / dModel
    const cellH = canvas.height / maxLen

    for (let pos = 0; pos < maxLen; pos++) {
      for (let d = 0; d < dModel; d++) {
        const val = pe[pos][d]
        // Map [-1, 1] to color
        const r = val > 0 ? Math.round(val * 99 + 30) : 30
        const g = 30
        const b = val < 0 ? Math.round(-val * 99 + 30) : 30
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
        ctx.fillRect(d * cellW, pos * cellH, cellW + 0.5, cellH + 0.5)
      }
    }
  }, [pe, maxLen, dModel])

  // SVG wave for first few dimensions
  const W = 400
  const waveH = 80
  const waveDims = [0, 1, 4, 5, 10, 11]

  const waveColors = ['#6366f1', '#818cf8', '#f43f5e', '#fb7185', '#f59e0b', '#fbbf24']

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-purple-500/10 p-1.5 rounded-lg">
          <Hash className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <h3 className="text-base font-bold">Sinusoidal Positional Encoding</h3>
          <p className="text-xs text-muted-foreground">PE(pos, 2i) = sin(pos / 10000^(2i/d)), PE(pos, 2i+1) = cos(...)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 space-y-4">
          {/* Heatmap */}
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-2 block">
              PE Matrix ({maxLen} positions x {dModel} dimensions)
            </label>
            <canvas
              ref={canvasRef}
              width={320}
              height={160}
              className="w-full rounded-lg border border-border"
              style={{ imageRendering: 'pixelated' }}
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>dim 0</span>
              <span className="text-rose-400">-1</span>
              <span>0</span>
              <span className="text-indigo-400">+1</span>
              <span>dim {dModel - 1}</span>
            </div>
          </div>

          {/* Wave plot */}
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-2 block">Waves by Dimension</label>
            <svg viewBox={`0 0 ${W} ${waveH}`} className="w-full h-auto">
              {/* Zero line */}
              <line x1={0} y1={waveH / 2} x2={W} y2={waveH / 2} stroke="currentColor" strokeOpacity={0.1} />

              {waveDims.map((dim, idx) => {
                const pts: string[] = []
                for (let pos = 0; pos < maxLen; pos++) {
                  const x = (pos / (maxLen - 1)) * W
                  const y = waveH / 2 - pe[pos][dim] * (waveH / 2 - 4)
                  pts.push(`${pts.length === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
                }
                return (
                  <path
                    key={dim}
                    d={pts.join(' ')}
                    fill="none"
                    stroke={waveColors[idx]}
                    strokeWidth={1.5}
                    strokeOpacity={0.7}
                  />
                )
              })}
            </svg>
            <div className="flex flex-wrap gap-2 mt-1">
              {waveDims.map((dim, idx) => (
                <span key={dim} className="text-sm font-mono" style={{ color: waveColors[idx] }}>
                  dim {dim}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">Positions: {maxLen}</label>
            <input
              type="range" min={8} max={64} step={4}
              value={maxLen}
              onChange={(e) => setMaxLen(parseInt(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">Dimensions: {dModel}</label>
            <input
              type="range" min={8} max={64} step={8}
              value={dModel}
              onChange={(e) => setDModel(parseInt(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-2">
            <div className="text-xs uppercase font-bold text-muted-foreground">Properties</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Low dims = high frequency</div>
              <div>High dims = low frequency</div>
              <div>Each position is unique</div>
              <div>Relative positions are learnable</div>
            </div>
          </div>

          <div className="mt-auto bg-purple-500/5 border border-purple-500/10 p-3 rounded-lg">
            <p className="text-xs text-purple-300 leading-relaxed italic">
              Low-index dimensions oscillate fast (capturing local position), high-index dimensions change slowly (capturing global position). This multi-scale encoding lets the model learn relative positions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
