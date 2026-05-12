'use client'

import { useState } from 'react'

export default function DiffusionProcessViz() {
  const [timestep, setTimestep] = useState(0)
  const totalSteps = 10
  const [showReverse, setShowReverse] = useState(true)

  const generateNoise = (seed: number, amount: number) => {
    const pixels: string[] = []
    for (let i = 0; i < 64; i++) {
      const base = Math.sin(seed * 0.1 + i * 0.3) * 0.5 + 0.5
      const noise = (Math.sin(seed * 7.3 + i * 13.7) * 0.5 + 0.5) * amount
      const val = Math.max(0, Math.min(1, base * (1 - amount) + noise))
      const r = Math.round((0.4 + val * 0.3) * 255)
      const g = Math.round((0.2 + val * 0.5) * 255)
      const b = Math.round((0.6 + val * 0.2) * 255)
      pixels.push(`rgb(${r},${g},${b})`)
    }
    return pixels
  }

  const renderGrid = (noiseAmount: number, label: string, highlight: boolean) => {
    const pixels = generateNoise(42, noiseAmount)
    return (
      <div className="flex flex-col items-center gap-1">
        <div
          className={`grid grid-cols-8 gap-0 rounded border ${
            highlight ? 'border-[#7F56D9] shadow-lg shadow-purple-500/20' : 'border-border'
          }`}
          style={{ width: 48, height: 48 }}
        >
          {pixels.map((color, i) => (
            <div key={i} style={{ backgroundColor: color, width: 6, height: 6 }} />
          ))}
        </div>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
    )
  }

  const forwardSteps = Array.from({ length: totalSteps + 1 }, (_, i) => i / totalSteps)
  const reverseSteps = [...forwardSteps].reverse()

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-1 text-sm font-semibold text-gray-200">Diffusion Process</h3>
      <p className="mb-4 text-xs text-gray-500">
        Forward: add noise. Reverse: denoise. Slide to control timestep t.
      </p>

      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-[#9E77ED]">Forward Process (q)</span>
          <span className="text-xs text-gray-500">t = {timestep}</span>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {forwardSteps.map((noise, i) => (
            <div key={i} className="flex items-center">
              {renderGrid(noise, `t=${i}`, i === timestep)}
              {i < totalSteps && (
                <svg width="12" height="12" className="mx-0.5 text-gray-600">
                  <path d="M2 6 L10 6 M7 3 L10 6 L7 9" stroke="currentColor" fill="none" strokeWidth="1.5" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      {showReverse && (
        <div className="mb-4">
          <span className="mb-1 block text-xs font-medium text-[#9E77ED]">Reverse Process (p)</span>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {reverseSteps.map((noise, i) => (
              <div key={i} className="flex items-center">
                {renderGrid(noise, `t=${totalSteps - i}`, totalSteps - i === timestep)}
                {i < totalSteps && (
                  <svg width="12" height="12" className="mx-0.5 text-gray-600">
                    <path d="M2 6 L10 6 M7 3 L10 6 L7 9" stroke="currentColor" fill="none" strokeWidth="1.5" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <input
          type="range"
          min={0}
          max={totalSteps}
          value={timestep}
          onChange={(e) => setTimestep(Number(e.target.value))}
          className="flex-1 accent-[#7F56D9]"
        />
        <button
          onClick={() => setShowReverse(!showReverse)}
          className={`rounded px-3 py-1 text-xs font-medium transition ${
            showReverse
              ? 'bg-[#7F56D9] text-white'
              : 'border border-border text-gray-400 hover:text-gray-200'
          }`}
        >
          Reverse
        </button>
      </div>

      <div className="mt-3 rounded border border-border bg-white/5 px-3 py-2 text-xs text-gray-400">
        Noise level at t={timestep}:{' '}
        <span className="font-mono text-[#9E77ED]">{(timestep / totalSteps * 100).toFixed(0)}%</span>
        {' '} | Variance schedule: linear
      </div>
    </div>
  )
}
