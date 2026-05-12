'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Grid3x3, Play, RotateCcw } from 'lucide-react'

const COLORS_A = ['#6366f1', '#8b5cf6', '#a78bfa']
const COLORS_B = ['#f43f5e', '#fb923c', '#facc15']

export default function MatrixMultiplyViz() {
  const [A] = useState([
    [1, 2],
    [3, 4],
    [5, 6],
  ])
  const [B] = useState([
    [7, 8, 9],
    [10, 11, 12],
  ])
  const [activeCell, setActiveCell] = useState<{ r: number; c: number } | null>(null)
  const [step, setStep] = useState(-1)

  const result = useMemo(() => {
    return A.map((row) =>
      B[0].map((_, j) => row.reduce((sum, val, k) => sum + val * B[k][j], 0))
    )
  }, [A, B])

  const totalCells = A.length * B[0].length
  const currentR = step >= 0 ? Math.floor(step / B[0].length) : -1
  const currentC = step >= 0 ? step % B[0].length : -1

  const dotProducts = useMemo(() => {
    if (activeCell) {
      const { r, c } = activeCell
      return A[r].map((val, k) => ({ a: val, b: B[k][c], product: val * B[k][c] }))
    }
    if (step >= 0) {
      return A[currentR].map((val, k) => ({ a: val, b: B[k][currentC], product: val * B[k][currentC] }))
    }
    return null
  }, [activeCell, step, A, B, currentR, currentC])

  const highlightR = activeCell ? activeCell.r : currentR
  const highlightC = activeCell ? activeCell.c : currentC

  const cellSize = 48
  const gap = 4

  const handleStep = () => {
    if (step < totalCells - 1) setStep(step + 1)
  }

  const handleReset = () => {
    setStep(-1)
    setActiveCell(null)
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-indigo-500/10 p-1.5 rounded-lg">
          <Grid3x3 className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-base font-bold">Matrix Multiplication</h3>
          <p className="text-xs text-muted-foreground">A(3x2) x B(2x3) = C(3x3) - row-by-column dot products</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-6 flex flex-col items-center gap-6">
          <div className="flex items-center gap-6 flex-wrap justify-center">
            {/* Matrix A */}
            <div>
              <h4 className="text-xs uppercase font-bold text-muted-foreground text-center mb-2">Matrix A</h4>
              <div className="flex flex-col" style={{ gap }}>
                {A.map((row, r) => (
                  <div key={r} className="flex" style={{ gap }}>
                    {row.map((val, c) => {
                      const isHighlighted = highlightR === r
                      return (
                        <motion.div
                          key={c}
                          className="flex items-center justify-center font-mono text-base font-bold rounded-lg border"
                          style={{ width: cellSize, height: cellSize }}
                          animate={{
                            backgroundColor: isHighlighted ? `${COLORS_A[r]}22` : 'rgba(30,30,46,0.4)',
                            borderColor: isHighlighted ? `${COLORS_A[r]}88` : 'rgba(255,255,255,0.06)',
                            scale: isHighlighted ? 1.05 : 1,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <span style={{ color: isHighlighted ? COLORS_A[r] : 'rgba(255,255,255,0.5)' }}>{val}</span>
                        </motion.div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            <span className="text-muted-foreground text-lg font-bold">x</span>

            {/* Matrix B */}
            <div>
              <h4 className="text-xs uppercase font-bold text-muted-foreground text-center mb-2">Matrix B</h4>
              <div className="flex flex-col" style={{ gap }}>
                {B.map((row, r) => (
                  <div key={r} className="flex" style={{ gap }}>
                    {row.map((val, c) => {
                      const isHighlighted = highlightC === c
                      return (
                        <motion.div
                          key={c}
                          className="flex items-center justify-center font-mono text-base font-bold rounded-lg border"
                          style={{ width: cellSize, height: cellSize }}
                          animate={{
                            backgroundColor: isHighlighted ? `${COLORS_B[c]}22` : 'rgba(30,30,46,0.4)',
                            borderColor: isHighlighted ? `${COLORS_B[c]}88` : 'rgba(255,255,255,0.06)',
                            scale: isHighlighted ? 1.05 : 1,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <span style={{ color: isHighlighted ? COLORS_B[c] : 'rgba(255,255,255,0.5)' }}>{val}</span>
                        </motion.div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            <span className="text-muted-foreground text-lg font-bold">=</span>

            {/* Result Matrix C */}
            <div>
              <h4 className="text-xs uppercase font-bold text-muted-foreground text-center mb-2">Result C</h4>
              <div className="flex flex-col" style={{ gap }}>
                {result.map((row, r) => (
                  <div key={r} className="flex" style={{ gap }}>
                    {row.map((val, c) => {
                      const cellIdx = r * B[0].length + c
                      const isComputed = step >= cellIdx
                      const isCurrent = (highlightR === r && highlightC === c)
                      return (
                        <motion.div
                          key={c}
                          className="flex items-center justify-center font-mono text-base font-bold rounded-lg border cursor-pointer"
                          style={{ width: cellSize, height: cellSize }}
                          animate={{
                            backgroundColor: isCurrent ? 'rgba(52,211,153,0.2)' : isComputed ? 'rgba(52,211,153,0.08)' : 'rgba(30,30,46,0.4)',
                            borderColor: isCurrent ? 'rgba(52,211,153,0.7)' : isComputed ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.06)',
                          }}
                          onMouseEnter={() => setActiveCell({ r, c })}
                          onMouseLeave={() => setActiveCell(null)}
                        >
                          <span className={isComputed || isCurrent ? 'text-emerald-400' : 'text-muted-foreground/30'}>
                            {isComputed || isCurrent ? val : '?'}
                          </span>
                        </motion.div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dot product breakdown */}
          {dotProducts && (
            <motion.div
              className="bg-muted/50 border border-border rounded-xl p-3 w-full max-w-md"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-xs uppercase font-bold text-muted-foreground mb-2">
                C[{highlightR},{highlightC}] dot product
              </div>
              <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
                {dotProducts.map((d, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <span className="text-muted-foreground">+</span>}
                    <span style={{ color: COLORS_A[highlightR] }}>{d.a}</span>
                    <span className="text-muted-foreground">*</span>
                    <span style={{ color: COLORS_B[highlightC] }}>{d.b}</span>
                    <span className="text-muted-foreground">=</span>
                    <span className="text-emerald-400">{d.product}</span>
                  </span>
                ))}
                <span className="text-muted-foreground ml-2">=</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {dotProducts.reduce((s, d) => s + d.product, 0)}
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Dashboard */}
        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              onClick={handleStep}
              disabled={step >= totalCells - 1}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded-lg py-2 hover:bg-indigo-500/30 transition disabled:opacity-30"
            >
              <Play className="w-3 h-3" /> Step ({step + 1}/{totalCells})
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs border border-border rounded-lg py-2 px-3 hover:bg-accent transition text-muted-foreground"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-2">
            <div className="text-xs uppercase font-bold text-muted-foreground">Dimensions</div>
            <div className="text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">A shape</span>
                <span className="text-indigo-400">{A.length} x {A[0].length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">B shape</span>
                <span className="text-rose-400">{B.length} x {B[0].length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">C shape</span>
                <span className="text-emerald-400">{result.length} x {result[0].length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total ops</span>
                <span>{A.length * B[0].length * A[0].length} multiplications</span>
              </div>
            </div>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl">
            <div className="text-xs uppercase font-bold text-muted-foreground mb-1">How it works</div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              Each cell C[i,j] is the dot product of row i from A and column j from B.
              Hover any result cell to see the breakdown.
            </div>
          </div>

          <div className="mt-auto bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-lg">
            <p className="text-xs text-indigo-300 leading-relaxed italic">
              {step >= totalCells - 1
                ? "All cells computed. Hover any result cell to review its dot product."
                : "Step through each cell or hover the result matrix to inspect individual dot products."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
