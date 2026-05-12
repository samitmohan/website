'use client'

import { useState, useMemo } from 'react'

const GRID_SIZE = 6
const PATCH_SIZE = 40

function hashColor(idx: number, masked: boolean): string {
  if (masked) return '#1a1a2e'
  const hue = (idx * 47 + 20) % 360
  return `hsl(${hue}, 55%, 45%)`
}

function latentBar(idx: number, predicted: boolean): number {
  // Simulated latent representation values
  const base = Math.sin(idx * 1.3 + 0.5) * 0.4 + 0.5
  if (predicted) return base + (Math.sin(idx * 2.1) * 0.15) // Prediction has slight error
  return base
}

export default function JEPAMaskingViz() {
  const totalPatches = GRID_SIZE * GRID_SIZE
  const [maskRatio, setMaskRatio] = useState(0.4)
  const [showLatent, setShowLatent] = useState(false)

  const maskedIndices = useMemo(() => {
    const count = Math.round(totalPatches * maskRatio)
    const indices = Array.from({ length: totalPatches }, (_, i) => i)
    // Deterministic-ish masking: block masking from center
    const cx = GRID_SIZE / 2, cy = GRID_SIZE / 2
    const sorted = indices.sort((a, b) => {
      const ax = a % GRID_SIZE - cx, ay = Math.floor(a / GRID_SIZE) - cy
      const bx = b % GRID_SIZE - cx, by = Math.floor(b / GRID_SIZE) - cy
      return (ax * ax + ay * ay) - (bx * bx + by * by)
    })
    return new Set(sorted.slice(0, count))
  }, [maskRatio, totalPatches])

  const visibleCount = totalPatches - maskedIndices.size

  return (
    <div className="p-6 bg-card rounded-xl border border-border">
      <h3 className="text-gray-300 text-lg font-semibold mb-1">JEPA: Predicting in Latent Space</h3>
      <p className="text-gray-500 text-sm mb-4">JEPA masks patches and predicts their latent representations (not raw pixels).</p>

      <div className="flex items-center gap-4 mb-4">
        <label className="text-gray-400 text-sm">Mask Ratio: {(maskRatio * 100).toFixed(0)}%</label>
        <input type="range" min={0.1} max={0.8} step={0.05} value={maskRatio}
          onChange={e => setMaskRatio(Number(e.target.value))}
          className="flex-1 max-w-[200px] accent-[#7F56D9]" />
        <button onClick={() => setShowLatent(!showLatent)}
          className={`px-3 py-1.5 rounded text-sm border transition-colors ${showLatent ? 'bg-[#7F56D9]/30 border-[#7F56D9] text-[#9E77ED]' : 'bg-white/5 border-border text-gray-400'}`}>
          {showLatent ? 'Showing Latent' : 'Show Latent Space'}
        </button>
      </div>

      <div className="flex gap-8 items-start flex-wrap">
        {/* Input patches */}
        <div>
          <div className="text-gray-400 text-xs mb-2">Input Patches ({visibleCount} visible, {maskedIndices.size} masked)</div>
          <svg width={GRID_SIZE * PATCH_SIZE + 2} height={GRID_SIZE * PATCH_SIZE + 2}>
            {Array.from({ length: totalPatches }, (_, i) => {
              const x = (i % GRID_SIZE) * PATCH_SIZE + 1
              const y = Math.floor(i / GRID_SIZE) * PATCH_SIZE + 1
              const isMasked = maskedIndices.has(i)
              return (
                <g key={i}>
                  <rect x={x} y={y} width={PATCH_SIZE - 2} height={PATCH_SIZE - 2}
                    fill={hashColor(i, isMasked)} rx={3}
                    stroke={isMasked ? '#333' : 'transparent'} strokeWidth={1}
                    strokeDasharray={isMasked ? '3,3' : 'none'} />
                  {isMasked && (
                    <text x={x + PATCH_SIZE / 2 - 1} y={y + PATCH_SIZE / 2 + 1}
                      fill="#555" fontSize={10} textAnchor="middle" dominantBaseline="middle">?</text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center justify-center self-center gap-1">
          <div className="text-[#9E77ED] text-xs">Encoder</div>
          <svg width={40} height={20}><path d="M5 10 L30 10 M25 5 L30 10 L25 15" stroke="#9E77ED" fill="none" strokeWidth={2} /></svg>
          <div className="text-[#9E77ED] text-xs">Predictor</div>
        </div>

        {/* Latent representations */}
        {showLatent && (
          <div>
            <div className="text-gray-400 text-xs mb-2">Latent Representations</div>
            <div className="space-y-1">
              {Array.from({ length: Math.min(8, totalPatches) }, (_, i) => {
                const isMasked = maskedIndices.has(i)
                const actual = latentBar(i, false)
                const pred = latentBar(i, true)
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs w-6 font-mono">{i}</span>
                    <div className="relative h-4 w-32 bg-black/30 rounded overflow-hidden">
                      <div className="absolute top-0 left-0 h-full rounded transition-all"
                        style={{ width: `${actual * 100}%`, background: '#22d3ee', opacity: 0.5 }} />
                      {isMasked && (
                        <div className="absolute top-0 left-0 h-full rounded border-r-2 border-[#9E77ED] transition-all"
                          style={{ width: `${pred * 100}%`, background: '#9E77ED', opacity: 0.4 }} />
                      )}
                    </div>
                    <span className="text-xs" style={{ color: isMasked ? '#9E77ED' : '#22d3ee' }}>
                      {isMasked ? 'predicted' : 'encoded'}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="mt-3 p-2 bg-black/20 rounded border border-border">
              <div className="text-gray-500 text-xs">Key insight: JEPA predicts abstract representations,</div>
              <div className="text-gray-500 text-xs">not pixel values. This avoids modeling irrelevant detail.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
