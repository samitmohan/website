'use client'

import { useState, useMemo } from 'react'

const models = [
  { name: 'GPT-4o', cost: 5.0, quality: 92, latency: 800 },
  { name: 'GPT-4o-mini', cost: 0.6, quality: 82, latency: 400 },
  { name: 'Claude 3.5 Sonnet', cost: 3.0, quality: 90, latency: 600 },
  { name: 'Claude 3 Haiku', cost: 0.25, quality: 75, latency: 200 },
  { name: 'Gemini 1.5 Pro', cost: 3.5, quality: 88, latency: 700 },
  { name: 'Gemini 1.5 Flash', cost: 0.35, quality: 78, latency: 250 },
  { name: 'Llama 3.1 70B', cost: 0.9, quality: 80, latency: 500 },
  { name: 'Llama 3.1 8B', cost: 0.2, quality: 65, latency: 150 },
  { name: 'Mistral Large', cost: 2.0, quality: 84, latency: 550 },
  { name: 'Mixtral 8x7B', cost: 0.6, quality: 72, latency: 350 },
]

const W = 400, H = 300, PAD = 40

export default function ParetoFrontierViz() {
  const [hovered, setHovered] = useState<number | null>(null)
  const [showLatency, setShowLatency] = useState(false)

  const maxCost = Math.max(...models.map(m => m.cost))
  const maxQuality = Math.max(...models.map(m => m.quality))
  const maxLatency = Math.max(...models.map(m => m.latency))

  const toX = (cost: number) => PAD + (cost / (maxCost * 1.1)) * (W - 2 * PAD)
  const toY = (quality: number) => H - PAD - (quality / (maxQuality * 1.1)) * (H - 2 * PAD)

  const pareto = useMemo(() => {
    const sorted = [...models].sort((a, b) => a.cost - b.cost)
    const front: typeof models = []
    let maxQ = -1
    for (const m of sorted) {
      if (m.quality > maxQ) { front.push(m); maxQ = m.quality }
    }
    return front
  }, [])

  const frontierPath = pareto.map((m, i) => `${i === 0 ? 'M' : 'L'} ${toX(m.cost)} ${toY(m.quality)}`).join(' ')

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-200">Pareto Frontier: Cost vs Quality</h3>
          <p className="text-xs text-gray-500">Hover points for details. Pareto-optimal configs on the frontier line.</p>
        </div>
        <button onClick={() => setShowLatency(!showLatency)}
          className={`px-3 py-1 text-xs rounded-lg transition-colors ${showLatency ? 'bg-[#7F56D9] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
          {showLatency ? 'Size = Latency' : 'Uniform Size'}
        </button>
      </div>

      <div className="p-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(frac => (
            <g key={frac}>
              <line x1={PAD} y1={PAD + frac * (H - 2 * PAD)} x2={W - PAD} y2={PAD + frac * (H - 2 * PAD)} stroke="white" strokeOpacity={0.05} />
              <text x={PAD - 4} y={PAD + frac * (H - 2 * PAD) + 3} fill="#6b7280" fontSize={8} textAnchor="end">
                {Math.round(maxQuality * 1.1 * (1 - frac))}
              </text>
            </g>
          ))}
          {[0, 0.25, 0.5, 0.75, 1].map(frac => (
            <g key={`x-${frac}`}>
              <line x1={PAD + frac * (W - 2 * PAD)} y1={PAD} x2={PAD + frac * (W - 2 * PAD)} y2={H - PAD} stroke="white" strokeOpacity={0.05} />
              <text x={PAD + frac * (W - 2 * PAD)} y={H - PAD + 14} fill="#6b7280" fontSize={8} textAnchor="middle">
                ${(maxCost * 1.1 * frac).toFixed(1)}
              </text>
            </g>
          ))}

          {/* Axis labels */}
          <text x={W / 2} y={H - 4} fill="#9ca3af" fontSize={9} textAnchor="middle">Cost ($/M tokens)</text>
          <text x={10} y={H / 2} fill="#9ca3af" fontSize={9} textAnchor="middle" transform={`rotate(-90, 10, ${H / 2})`}>Quality Score</text>

          {/* Pareto frontier */}
          <path d={frontierPath} fill="none" stroke="#7F56D9" strokeWidth={2} strokeDasharray="6,3" opacity={0.7} />

          {/* Points */}
          {models.map((m, i) => {
            const isPareto = pareto.includes(m)
            const r = showLatency ? 4 + (m.latency / maxLatency) * 8 : 6
            return (
              <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
                <circle cx={toX(m.cost)} cy={toY(m.quality)} r={r}
                  fill={isPareto ? '#7F56D9' : '#374151'}
                  stroke={isPareto ? '#9E77ED' : '#6b7280'}
                  strokeWidth={hovered === i ? 2.5 : 1.5}
                  opacity={hovered === i ? 1 : 0.8}
                  className="cursor-pointer transition-all" />
                {hovered === i && (
                  <g>
                    <rect x={toX(m.cost) - 55} y={toY(m.quality) - 42} width={110} height={36} rx={6} fill="#1f2937" stroke="#7F56D9" strokeWidth={0.5} />
                    <text x={toX(m.cost)} y={toY(m.quality) - 28} fill="#e5e7eb" fontSize={9} fontWeight="bold" textAnchor="middle">{m.name}</text>
                    <text x={toX(m.cost)} y={toY(m.quality) - 16} fill="#9ca3af" fontSize={8} textAnchor="middle">
                      ${m.cost}/M | Q:{m.quality} | {m.latency}ms
                    </text>
                  </g>
                )}
              </g>
            )
          })}
        </svg>

        <div className="flex flex-wrap gap-2 mt-3">
          {models.map((m, i) => {
            const isPareto = pareto.includes(m)
            return (
              <span key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                className={`text-xs px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                  isPareto ? 'bg-[#7F56D9]/15 text-[#9E77ED] border border-[#7F56D9]/30' : 'bg-white/5 text-gray-500 border border-border'
                } ${hovered === i ? 'ring-1 ring-white/20' : ''}`}>
                {m.name}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
