'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Layers } from 'lucide-react'

export default function LoRAViz() {
  const d = 8
  const [rank, setRank] = useState(2)
  const [showDelta, setShowDelta] = useState(false)
  const [animateMultiply, setAnimateMultiply] = useState(false)

  // Deterministic pseudo-random
  const seeded = useCallback((i: number, j: number, offset: number) => {
    const x = Math.sin((i + 1) * 17.3 + (j + 1) * 31.7 + offset * 43.1) * 0.5 + 0.5
    return Math.round(x * 100) / 100
  }, [])

  const { W, A, B, AB, Wnew } = useMemo(() => {
    // Original weight matrix
    const w: number[][] = []
    for (let i = 0; i < d; i++) {
      const row: number[] = []
      for (let j = 0; j < d; j++) {
        row.push(seeded(i, j, 0))
      }
      w.push(row)
    }

    // A matrix: d x rank
    const a: number[][] = []
    for (let i = 0; i < d; i++) {
      const row: number[] = []
      for (let r = 0; r < rank; r++) {
        row.push(seeded(i, r, 100))
      }
      a.push(row)
    }

    // B matrix: rank x d
    const b: number[][] = []
    for (let r = 0; r < rank; r++) {
      const row: number[] = []
      for (let j = 0; j < d; j++) {
        row.push(seeded(r, j, 200))
      }
      b.push(row)
    }

    // A*B: d x d
    const ab: number[][] = []
    for (let i = 0; i < d; i++) {
      const row: number[] = []
      for (let j = 0; j < d; j++) {
        let sum = 0
        for (let r = 0; r < rank; r++) {
          sum += a[i][r] * b[r][j]
        }
        row.push(Math.round(sum * 100) / 100)
      }
      ab.push(row)
    }

    // W + A*B
    const wnew: number[][] = []
    for (let i = 0; i < d; i++) {
      const row: number[] = []
      for (let j = 0; j < d; j++) {
        row.push(Math.round((w[i][j] + ab[i][j] * 0.1) * 100) / 100) // scale delta by 0.1 for visibility
      }
      wnew.push(row)
    }

    return { W: w, A: a, B: b, AB: ab, Wnew: wnew }
  }, [d, rank, seeded])

  // Parameter counts
  const fullParams = d * d
  const loraParams = d * rank + rank * d

  // Grid cell rendering
  const cellSize = 22
  const gap = 1

  const renderMatrix = (
    mat: number[][],
    rows: number,
    cols: number,
    baseColor: string,
    offsetX: number,
    offsetY: number,
    label: string,
    highlight: boolean = false,
  ) => {
    const w = cols * (cellSize + gap)
    const h = rows * (cellSize + gap)
    return (
      <g>
        <text
          x={offsetX + w / 2}
          y={offsetY - 6}
          textAnchor="middle"
          fill="currentColor"
          fillOpacity={0.6}
          fontSize={8}
          fontWeight="bold"
        >
          {label}
        </text>
        <text
          x={offsetX + w / 2}
          y={offsetY + h + 12}
          textAnchor="middle"
          fill="currentColor"
          fillOpacity={0.3}
          fontSize={7}
          fontFamily="monospace"
        >
          {rows}x{cols}
        </text>
        {mat.map((row, i) =>
          row.map((val, j) => (
            <motion.rect
              key={`${i}-${j}`}
              x={offsetX + j * (cellSize + gap)}
              y={offsetY + i * (cellSize + gap)}
              width={cellSize}
              height={cellSize}
              rx={2}
              animate={{
                fill: `rgba(${baseColor}, ${Math.min(val, 1)})`,
                strokeWidth: highlight ? 1 : 0.3,
              }}
              transition={{ duration: 0.4 }}
              stroke={highlight ? `rgba(${baseColor}, 0.6)` : 'currentColor'}
              strokeOpacity={highlight ? 0.6 : 0.06}
            />
          ))
        )}
      </g>
    )
  }

  // Layout
  const matW = d * (cellSize + gap)
  const matSmallW = rank * (cellSize + gap)
  const labelH = 20
  const bottomLabel = 16
  const pad = 16

  // Positions
  const wX = pad
  const wY = labelH + pad
  const plusX = wX + matW + 10
  const aX = plusX + 16
  const aY = wY
  const timesX = aX + matSmallW + 6
  const bX = timesX + 16
  const bY = wY
  const eqX = bX + matW + 10

  const totalW = eqX + 20
  const totalH = wY + matW + bottomLabel + pad

  // For delta view
  const deltaX = aX
  const resultX = deltaX + matW + 30

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-amber-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-amber-500/10 p-1.5 rounded-lg">
          <Layers className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <h3 className="text-base font-bold">LoRA (Low-Rank Adaptation)</h3>
          <p className="text-xs text-muted-foreground">W_new = W + A * B, where A is d x r and B is r x d</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 flex flex-col items-center overflow-x-auto">
          {!showDelta ? (
            <svg viewBox={`0 0 ${totalW} ${totalH}`} className="w-full h-auto max-w-2xl">
              {/* W matrix */}
              {renderMatrix(W, d, d, '99, 102, 241', wX, wY, 'W (frozen)', false)}

              {/* Plus sign */}
              <text
                x={plusX + 6} y={wY + matW / 2 + 3}
                textAnchor="middle" fill="currentColor" fillOpacity={0.5} fontSize={14}
              >
                +
              </text>

              {/* A matrix */}
              {renderMatrix(A, d, rank, '251, 146, 60', aX, aY, `A (d x r)`, animateMultiply)}

              {/* Times sign */}
              <text
                x={timesX + 6} y={wY + matW / 2 + 3}
                textAnchor="middle" fill="currentColor" fillOpacity={0.5} fontSize={12}
              >
                x
              </text>

              {/* B matrix */}
              {renderMatrix(B, rank, d, '251, 146, 60', bX, bY, `B (r x d)`, animateMultiply)}

            </svg>
          ) : (
            <svg viewBox={`0 0 ${resultX + matW + pad * 2} ${totalH}`} className="w-full h-auto max-w-2xl">
              {/* Delta = A*B */}
              {renderMatrix(AB, d, d, '251, 146, 60', deltaX, wY, 'delta = A*B', true)}

              {/* Arrow */}
              <text
                x={deltaX + matW + 14} y={wY + matW / 2 + 3}
                textAnchor="middle" fill="currentColor" fillOpacity={0.5} fontSize={12}
              >
                +W=
              </text>

              {/* W_new */}
              {renderMatrix(Wnew, d, d, '52, 211, 153', resultX, wY, 'W_new = W + delta', true)}
            </svg>
          )}
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">
              Rank (r): {rank}
            </label>
            <input
              type="range" min={1} max={4} step={1}
              value={rank}
              onChange={(e) => setRank(parseInt(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>r=1</span>
              <span>r=4</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowDelta(!showDelta)}
              className={`text-xs px-3 py-1 rounded-lg border transition ${
                showDelta
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'border-border text-muted-foreground'
              }`}
            >
              {showDelta ? 'Show A*B result' : 'Show W + A*B'}
            </button>
            <button
              onClick={() => setAnimateMultiply(!animateMultiply)}
              className={`text-xs px-3 py-1 rounded-lg border transition ${
                animateMultiply
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'border-border text-muted-foreground'
              }`}
            >
              {animateMultiply ? 'Highlight LoRA' : 'Highlight LoRA'}
            </button>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-2">
            <div className="text-xs uppercase font-bold text-muted-foreground">Parameter Count</div>
            <div className="space-y-1.5">
              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Full fine-tune (d x d)</span>
                  <span className="font-mono text-red-400">{fullParams}</span>
                </div>
                <div className="w-full h-1.5 bg-accent rounded-full overflow-hidden">
                  <div className="h-full bg-red-500/60 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">LoRA (2 x d x r)</span>
                  <span className="font-mono text-amber-400">{loraParams}</span>
                </div>
                <div className="w-full h-1.5 bg-accent rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-amber-500/60 rounded-full"
                    animate={{ width: `${(loraParams / fullParams) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-xs font-mono text-amber-400 text-center">
                {((loraParams / fullParams) * 100).toFixed(1)}% of full params
              </div>
            </div>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-1">
            <div className="text-xs uppercase font-bold text-muted-foreground">Dimensions</div>
            <div className="text-xs font-mono space-y-0.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">W</span>
                <span>{d} x {d}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">A</span>
                <span className="text-amber-400">{d} x {rank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">B</span>
                <span className="text-amber-400">{rank} x {d}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">A*B</span>
                <span>{d} x {d}</span>
              </div>
            </div>
          </div>

          <div className="mt-auto bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg">
            <p className="text-xs text-amber-300 leading-relaxed italic">
              LoRA freezes the original weight matrix W and trains only two small matrices A and B. The product A*B approximates the weight update. With rank {rank}, this uses {loraParams} parameters instead of {fullParams} - a {((1 - loraParams / fullParams) * 100).toFixed(0)}% reduction.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
