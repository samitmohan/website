'use client'

import { useState, useMemo } from 'react'

const GRID = 12
const energyFn = (x: number, y: number) => {
  const cx1 = 3, cy1 = 3, cx2 = 8, cy2 = 8
  const well1 = 2 * Math.exp(-((x - cx1) ** 2 + (y - cy1) ** 2) / 4)
  const well2 = 1.5 * Math.exp(-((x - cx2) ** 2 + (y - cy2) ** 2) / 3)
  return 3 - well1 - well2 + 0.05 * ((x - 6) ** 2 + (y - 6) ** 2)
}

function colorForEnergy(e: number, min: number, max: number) {
  const t = (e - min) / (max - min + 1e-9)
  const r = Math.round(40 + t * 200)
  const g = Math.round(20 + (1 - t) * 40)
  const b = Math.round(180 - t * 120)
  return `rgb(${r},${g},${b})`
}

export default function EnergyLandscapeViz() {
  const [particle, setParticle] = useState({ x: 6, y: 6 })

  const { grid, min, max } = useMemo(() => {
    const cells: { x: number; y: number; e: number }[] = []
    let mn = Infinity, mx = -Infinity
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        const e = energyFn(x, y)
        cells.push({ x, y, e })
        mn = Math.min(mn, e)
        mx = Math.max(mx, e)
      }
    }
    return { grid: cells, min: mn, max: mx }
  }, [])

  const particleEnergy = energyFn(particle.x, particle.y)

  const gradient = useMemo(() => {
    const h = 0.5
    const dEdx = (energyFn(particle.x + h, particle.y) - energyFn(particle.x - h, particle.y)) / (2 * h)
    const dEdy = (energyFn(particle.x, particle.y + h) - energyFn(particle.x, particle.y - h)) / (2 * h)
    const mag = Math.sqrt(dEdx ** 2 + dEdy ** 2) + 1e-9
    return { dx: -dEdx / mag, dy: -dEdy / mag }
  }, [particle])

  const cellSize = 36

  return (
    <div className="p-6 bg-card rounded-xl border border-border">
      <h3 className="text-gray-300 text-lg font-semibold mb-1">Energy-Based Model Landscape</h3>
      <p className="text-gray-500 text-sm mb-4">Click a cell to place the particle. Purple = low energy (good). Red = high energy (bad).</p>

      <div className="flex gap-6 items-start flex-wrap">
        <svg width={GRID * cellSize + 2} height={GRID * cellSize + 2} className="border border-border rounded">
          {grid.map(({ x, y, e }) => (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize + 1}
              y={y * cellSize + 1}
              width={cellSize - 1}
              height={cellSize - 1}
              fill={colorForEnergy(e, min, max)}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setParticle({ x, y })}
            />
          ))}
          {/* Gradient arrow */}
          <line
            x1={particle.x * cellSize + cellSize / 2}
            y1={particle.y * cellSize + cellSize / 2}
            x2={particle.x * cellSize + cellSize / 2 + gradient.dx * 28}
            y2={particle.y * cellSize + cellSize / 2 + gradient.dy * 28}
            stroke="#22d3ee" strokeWidth={2} markerEnd="url(#arrowhead)"
          />
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#22d3ee" />
            </marker>
          </defs>
          {/* Particle */}
          <circle
            cx={particle.x * cellSize + cellSize / 2}
            cy={particle.y * cellSize + cellSize / 2}
            r={10} fill="#7F56D9" stroke="white" strokeWidth={2}
          />
        </svg>

        <div className="space-y-3 min-w-[200px]">
          <div className="bg-black/30 rounded-lg p-3 border border-border">
            <div className="text-gray-400 text-xs mb-1">Particle Position</div>
            <div className="text-gray-200 font-mono">({particle.x}, {particle.y})</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-border">
            <div className="text-gray-400 text-xs mb-1">Energy Value</div>
            <div className="text-gray-200 font-mono text-xl">{particleEnergy.toFixed(3)}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-border">
            <div className="text-gray-400 text-xs mb-1">Gradient Direction</div>
            <div className="text-cyan-400 font-mono text-sm">
              ({gradient.dx.toFixed(2)}, {gradient.dy.toFixed(2)})
            </div>
            <div className="text-gray-500 text-xs mt-1">Cyan arrow = downhill direction</div>
          </div>
          <div className="flex gap-2 mt-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ background: colorForEnergy(min, min, max) }} />
              <span className="text-gray-500 text-xs">Low E</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ background: colorForEnergy(max, min, max) }} />
              <span className="text-gray-500 text-xs">High E</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
