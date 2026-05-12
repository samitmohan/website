'use client'

import { useState, useMemo } from 'react'

function lerp(a: number[], b: number[], t: number): number[] {
  return a.map((v, i) => v * (1 - t) + b[i] * t)
}

function slerp(a: number[], b: number[], t: number): number[] {
  const dot = a.reduce((s, v, i) => s + v * b[i], 0)
  const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0))
  const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0))
  const cosTheta = Math.max(-1, Math.min(1, dot / (magA * magB + 1e-9)))
  const theta = Math.acos(cosTheta)
  if (Math.abs(theta) < 1e-6) return lerp(a, b, t)
  const sinTheta = Math.sin(theta)
  const wA = Math.sin((1 - t) * theta) / sinTheta
  const wB = Math.sin(t * theta) / sinTheta
  return a.map((v, i) => v * wA + b[i] * wB)
}

function decodeToPattern(z: number[]): string[] {
  // Map latent vector to a 4x4 color grid
  const colors: string[] = []
  for (let i = 0; i < 16; i++) {
    const zi = z[i % z.length]
    const h = Math.round(((zi + 2) / 4) * 300)
    const s = 50 + Math.round(Math.abs(z[(i + 1) % z.length]) * 15)
    const l = 30 + Math.round(((z[(i + 2) % z.length] + 2) / 4) * 30)
    colors.push(`hsl(${h}, ${s}%, ${l}%)`)
  }
  return colors
}

const POINT_A = [1.2, -0.8, 0.5, 1.9, -1.1, 0.3]
const POINT_B = [-1.5, 1.3, -0.7, 0.2, 1.8, -0.9]

export default function LatentInterpolationViz() {
  const [t, setT] = useState(0.5)
  const [method, setMethod] = useState<'linear' | 'slerp'>('linear')

  const steps = 9
  const interpolations = useMemo(() => {
    return Array.from({ length: steps }, (_, i) => {
      const frac = i / (steps - 1)
      const z = method === 'linear' ? lerp(POINT_A, POINT_B, frac) : slerp(POINT_A, POINT_B, frac)
      return { t: frac, z, pattern: decodeToPattern(z) }
    })
  }, [method])

  const currentZ = method === 'linear' ? lerp(POINT_A, POINT_B, t) : slerp(POINT_A, POINT_B, t)
  const currentPattern = decodeToPattern(currentZ)
  const cellSize = 16

  return (
    <div className="p-6 bg-card rounded-xl border border-border">
      <h3 className="text-gray-300 text-lg font-semibold mb-1">Latent Space Interpolation</h3>
      <p className="text-gray-500 text-sm mb-4">Slide between two points in latent space. Compare linear vs spherical (slerp) paths.</p>

      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex gap-2">
          {(['linear', 'slerp'] as const).map(m => (
            <button key={m} onClick={() => setMethod(m)}
              className={`px-3 py-1.5 rounded text-sm border transition-colors ${method === m ? 'bg-[#7F56D9]/30 border-[#7F56D9] text-[#9E77ED]' : 'bg-white/5 border-border text-gray-400'}`}>
              {m === 'linear' ? 'Linear (Lerp)' : 'Spherical (Slerp)'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-cyan-400 text-xs font-mono">A</span>
          <input type="range" min={0} max={1} step={0.01} value={t}
            onChange={e => setT(Number(e.target.value))}
            className="flex-1 max-w-[300px] accent-[#7F56D9]" />
          <span className="text-orange-400 text-xs font-mono">B</span>
          <span className="text-gray-500 text-xs ml-2">t = {t.toFixed(2)}</span>
        </div>
      </div>

      {/* Current decoded output */}
      <div className="flex items-center gap-6 mb-5">
        <div>
          <div className="text-gray-400 text-xs mb-1">Decoded Output at t={t.toFixed(2)}</div>
          <svg width={cellSize * 4 + 4} height={cellSize * 4 + 4}>
            {currentPattern.map((color, i) => (
              <rect key={i} x={(i % 4) * cellSize + 2} y={Math.floor(i / 4) * cellSize + 2}
                width={cellSize - 1} height={cellSize - 1} fill={color} rx={2} />
            ))}
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-gray-400 text-xs mb-1">Latent Vector z</div>
          <div className="flex gap-1">
            {currentZ.map((v, i) => (
              <div key={i} className="bg-black/30 rounded px-2 py-1 text-xs font-mono text-gray-300 border border-border">
                {v.toFixed(2)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full interpolation strip */}
      <div>
        <div className="text-gray-400 text-xs mb-2">Full {method} interpolation path (A to B)</div>
        <div className="flex gap-2 items-end">
          {interpolations.map((interp, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <svg width={cellSize * 4 + 2} height={cellSize * 4 + 2}>
                {interp.pattern.map((color, i) => (
                  <rect key={i} x={(i % 4) * cellSize + 1} y={Math.floor(i / 4) * cellSize + 1}
                    width={cellSize - 1} height={cellSize - 1} fill={color} rx={1} />
                ))}
              </svg>
              <span className="text-gray-600 text-xs mt-1">{interp.t.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
