'use client'

import { useState } from 'react'

const milestones = [
  { year: 2017, label: 'Transformer', compute: 0.05, detail: 'Attention Is All You Need. Sequence modeling without recurrence.' },
  { year: 2018, label: 'GPT / BERT', compute: 0.1, detail: 'Large-scale pretraining on unlabeled text. Transfer learning for NLP.' },
  { year: 2019, label: 'GPT-2', compute: 0.2, detail: '1.5B params. "Too dangerous to release." Text generation quality jump.' },
  { year: 2020, label: 'GPT-3', compute: 0.4, detail: '175B params. Few-shot learning emerges. Scaling laws paper published.' },
  { year: 2021, label: 'Codex / DALL-E', compute: 0.55, detail: 'Code generation, text-to-image. Multimodal capabilities emerge.', emergent: true },
  { year: 2022, label: 'ChatGPT / Diffusion', compute: 0.7, detail: 'RLHF alignment. Stable Diffusion open-sourced. Mass adoption begins.', emergent: true },
  { year: 2023, label: 'GPT-4 / Claude 2', compute: 0.85, detail: 'Multimodal reasoning. Long context. Tool use and agents.', emergent: true },
  { year: 2024, label: 'Claude 3.5 / o1', compute: 0.92, detail: 'Chain-of-thought reasoning at scale. Coding agents. Open-weight models.', emergent: true },
  { year: 2025, label: 'Agents / MCP', compute: 0.97, detail: 'Autonomous agents, model context protocol, computer use.', emergent: true },
]

export default function AITrendsViz() {
  const [yearIdx, setYearIdx] = useState(milestones.length - 1)
  const current = milestones[yearIdx]

  const svgW = 500
  const svgH = 120
  const padX = 40
  const padY = 15
  const plotW = svgW - padX * 2
  const plotH = svgH - padY * 2

  const points = milestones.map((m, i) => ({
    x: padX + (i / (milestones.length - 1)) * plotW,
    y: padY + plotH - m.compute * plotH,
    ...m,
  }))

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-1 text-sm font-semibold text-gray-200">AI Milestones and Scaling</h3>
      <p className="mb-3 text-xs text-gray-500">Slide through the timeline. Stars mark emergent capability thresholds.</p>

      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: 140 }}>
        <line x1={padX} y1={padY + plotH} x2={padX + plotW} y2={padY + plotH} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <line x1={padX} y1={padY} x2={padX} y2={padY + plotH} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

        <text x={padX - 4} y={padY + 4} fill="#6B7280" fontSize="7" textAnchor="end">High</text>
        <text x={padX - 4} y={padY + plotH} fill="#6B7280" fontSize="7" textAnchor="end">Low</text>
        <text x={padX + plotW / 2} y={svgH - 1} fill="#6B7280" fontSize="7" textAnchor="middle">Performance / Capability</text>

        <defs>
          <linearGradient id="scalingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7F56D9" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#9E77ED" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        <path d={`${pathD} L ${points[points.length - 1].x} ${padY + plotH} L ${points[0].x} ${padY + plotH} Z`} fill="url(#scalingGrad)" opacity="0.2" />
        <path d={pathD} fill="none" stroke="url(#scalingGrad)" strokeWidth="2" />

        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={i === yearIdx ? 5 : 3}
              fill={i === yearIdx ? '#7F56D9' : p.emergent ? '#9E77ED' : '#4B5563'}
              stroke={i === yearIdx ? '#9E77ED' : 'none'} strokeWidth="2" />
            {p.emergent && i !== yearIdx && (
              <text x={p.x} y={p.y - 7} fill="#F59E0B" fontSize="8" textAnchor="middle">*</text>
            )}
            <text x={p.x} y={padY + plotH + 10} fill={i === yearIdx ? '#9E77ED' : '#6B7280'} fontSize="6" textAnchor="middle">
              {p.year}
            </text>
          </g>
        ))}
      </svg>

      <input
        type="range"
        min={0}
        max={milestones.length - 1}
        value={yearIdx}
        onChange={(e) => setYearIdx(Number(e.target.value))}
        className="mt-2 w-full accent-[#7F56D9]"
      />

      <div className="mt-3 rounded-lg border border-border bg-white/5 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#9E77ED]">{current.year}</span>
          <span className="text-xs font-medium text-gray-200">{current.label}</span>
          {current.emergent && <span className="rounded bg-yellow-500/10 px-1.5 py-0.5 text-sm font-medium text-yellow-400">Emergent</span>}
        </div>
        <p className="mt-1 text-xs text-gray-400">{current.detail}</p>
      </div>
    </div>
  )
}
