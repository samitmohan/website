'use client'

import { useState, useMemo } from 'react'

type Precision = 'FP32' | 'FP16' | 'INT8' | 'INT4'

const PRECISIONS: Precision[] = ['FP32', 'FP16', 'INT8', 'INT4']
const MEMORY_PCT: Record<Precision, number> = { FP32: 100, FP16: 50, INT8: 25, INT4: 12.5 }
const BITS: Record<Precision, number> = { FP32: 32, FP16: 16, INT8: 8, INT4: 4 }

function quantize(val: number, precision: Precision): number {
  if (precision === 'FP32') return val
  if (precision === 'FP16') return Math.round(val * 1000) / 1000
  if (precision === 'INT8') {
    const scaled = Math.round(((val + 2) / 4) * 255)
    return Math.round(((scaled / 255) * 4 - 2) * 100) / 100
  }
  // INT4
  const scaled = Math.round(((val + 2) / 4) * 15)
  return Math.round(((scaled / 15) * 4 - 2) * 100) / 100
}

function errorColor(error: number): string {
  const t = Math.min(Math.abs(error) * 10, 1)
  const r = Math.round(239 * t + 100 * (1 - t))
  const g = Math.round(68 * t + 200 * (1 - t))
  const b = Math.round(68 * t + 100 * (1 - t))
  return `rgb(${r}, ${g}, ${b})`
}

export default function QuantizationViz() {
  const [precision, setPrecision] = useState<Precision>('FP32')
  const [showQLoRA, setShowQLoRA] = useState(false)

  const originalWeights = useMemo(() => {
    const w: number[][] = []
    for (let i = 0; i < 6; i++) {
      const row: number[] = []
      for (let j = 0; j < 6; j++) {
        const v = Math.sin((i + 1) * 2.31 + (j + 1) * 3.71) * 1.5
        row.push(Math.round(v * 100000) / 100000)
      }
      row.push(0) // padding col for display
      w.push(row)
    }
    return w
  }, [])

  const quantizedWeights = useMemo(() => {
    return originalWeights.map(row => row.slice(0, 6).map(v => quantize(v, precision)))
  }, [originalWeights, precision])

  const loraA = useMemo(() => {
    const a: number[][] = []
    for (let i = 0; i < 6; i++) {
      a.push([
        Math.round(Math.sin(i * 1.3 + 10) * 50) / 100,
        Math.round(Math.cos(i * 0.7 + 5) * 50) / 100,
      ])
    }
    return a
  }, [])

  const loraB = useMemo(() => {
    const b: number[][] = []
    for (let r = 0; r < 2; r++) {
      const row: number[] = []
      for (let j = 0; j < 6; j++) {
        row.push(Math.round(Math.sin(r * 2.1 + j * 1.7 + 20) * 50) / 100)
      }
      b.push(row)
    }
    return b
  }, [])

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-purple-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Weight Quantization</h3>
          <p className="text-xs text-muted-foreground">Reduce precision to shrink model size: FP32 -&gt; FP16 -&gt; INT8 -&gt; INT4</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 overflow-x-auto">
          {/* Weight matrix */}
          <div className="text-xs uppercase font-bold text-muted-foreground mb-2">
            Weight Matrix ({precision} - {BITS[precision]} bits per weight)
          </div>
          <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(6, 72px)` }}>
            {quantizedWeights.map((row, i) =>
              row.map((val, j) => {
                const orig = originalWeights[i][j]
                const err = val - orig
                return (
                  <div
                    key={`${i}-${j}`}
                    className="h-10 rounded flex items-center justify-center font-mono text-xs border transition-all duration-300"
                    style={{
                      backgroundColor: precision === 'FP32' ? 'rgba(139,92,246,0.15)' : `${errorColor(err)}22`,
                      borderColor: precision === 'FP32' ? 'rgba(139,92,246,0.25)' : errorColor(err),
                      color: precision === 'FP32' ? 'rgb(196,181,253)' : errorColor(err),
                    }}
                  >
                    {precision === 'FP32' ? orig.toFixed(5) : val.toFixed(precision === 'FP16' ? 3 : 2)}
                  </div>
                )
              })
            )}
          </div>

          {/* Memory bar chart */}
          <div className="mt-4">
            <div className="text-xs uppercase font-bold text-muted-foreground mb-2">Memory Usage</div>
            <div className="flex items-end gap-3 h-24">
              {PRECISIONS.map(p => (
                <div key={p} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-sm font-mono text-muted-foreground">{MEMORY_PCT[p]}%</span>
                  <div
                    className="w-full rounded-t transition-all duration-500"
                    style={{
                      height: `${MEMORY_PCT[p] * 0.8}px`,
                      backgroundColor: p === precision ? 'rgb(139,92,246)' : 'rgba(139,92,246,0.2)',
                    }}
                  />
                  <span className={`text-sm font-mono ${p === precision ? 'text-purple-400 font-bold' : 'text-muted-foreground'}`}>{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* QLoRA section */}
          {showQLoRA && (
            <div className="mt-4 border-t border-border/50 pt-3">
              <div className="text-xs uppercase font-bold text-muted-foreground mb-2">QLoRA: Quantized Base + LoRA Adapters</div>
              <div className="flex items-center gap-3 flex-wrap">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Base (INT4, frozen)</div>
                  <div className="inline-grid gap-px" style={{ gridTemplateColumns: 'repeat(6, 18px)' }}>
                    {quantizedWeights.map((row, i) => row.map((_, j) => (
                      <div key={`b-${i}-${j}`} className="w-[18px] h-[18px] rounded-sm bg-purple-500/20 border border-purple-500/30" />
                    )))}
                  </div>
                  <div className="text-[8px] text-muted-foreground mt-0.5">6x6</div>
                </div>
                <span className="text-muted-foreground text-lg">+</span>
                <div>
                  <div className="text-sm text-amber-400 mb-1">A (FP16, trainable)</div>
                  <div className="inline-grid gap-px" style={{ gridTemplateColumns: 'repeat(2, 18px)' }}>
                    {loraA.map((row, i) => row.map((v, j) => (
                      <div key={`a-${i}-${j}`} className="w-[18px] h-[18px] rounded-sm bg-amber-500/30 border border-amber-500/40 flex items-center justify-center text-[7px] font-mono text-amber-300">
                        {v.toFixed(1)}
                      </div>
                    )))}
                  </div>
                  <div className="text-[8px] text-amber-400 mt-0.5">6x2</div>
                </div>
                <span className="text-muted-foreground">x</span>
                <div>
                  <div className="text-sm text-amber-400 mb-1">B (FP16, trainable)</div>
                  <div className="inline-grid gap-px" style={{ gridTemplateColumns: 'repeat(6, 18px)' }}>
                    {loraB.map((row, i) => row.map((v, j) => (
                      <div key={`b2-${i}-${j}`} className="w-[18px] h-[18px] rounded-sm bg-amber-500/30 border border-amber-500/40 flex items-center justify-center text-[7px] font-mono text-amber-300">
                        {v.toFixed(1)}
                      </div>
                    )))}
                  </div>
                  <div className="text-[8px] text-amber-400 mt-0.5">2x6</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div>
            <div className="text-xs uppercase font-bold text-muted-foreground mb-2">Precision</div>
            <div className="flex flex-wrap gap-1.5">
              {PRECISIONS.map(p => (
                <button
                  key={p}
                  onClick={() => setPrecision(p)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                    precision === p
                      ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                      : 'border-border text-muted-foreground hover:border-purple-500/30'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => { setShowQLoRA(!showQLoRA); if (!showQLoRA) setPrecision('INT4') }}
            className={`text-xs px-3 py-1.5 rounded-lg border transition ${
              showQLoRA ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'border-border text-muted-foreground'
            }`}
          >
            {showQLoRA ? 'Hide QLoRA' : 'Show QLoRA'}
          </button>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-2">
            <div className="text-xs uppercase font-bold text-muted-foreground">Stats</div>
            <div className="text-xs font-mono space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Bits/weight</span><span className="text-purple-400">{BITS[precision]}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Memory</span><span className="text-purple-400">{MEMORY_PCT[precision]}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Max error</span><span className="text-purple-400">{precision === 'FP32' ? '0' : precision === 'FP16' ? '~0.001' : precision === 'INT8' ? '~0.01' : '~0.13'}</span></div>
            </div>
          </div>

          <div className="mt-auto bg-purple-500/5 border border-purple-500/10 p-3 rounded-lg">
            <p className="text-xs text-purple-300 leading-relaxed italic">
              Quantization maps {BITS.FP32}-bit floats to {BITS[precision]}-bit values. {precision === 'INT4' ? 'INT4 loses the most precision but shrinks the model to 12.5% of original size. QLoRA compensates by adding small FP16 adapter matrices.' : precision === 'FP32' ? 'Full precision preserves all information but uses the most memory.' : `${precision} reduces memory to ${MEMORY_PCT[precision]}% with acceptable accuracy loss.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}