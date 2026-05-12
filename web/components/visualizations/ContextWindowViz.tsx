'use client'

import { useState, useMemo } from 'react'

interface Section {
  label: string
  baseTokens: number
  color: string
}

const SECTIONS: Section[] = [
  { label: 'System Prompt', baseTokens: 800, color: '#7F56D9' },
  { label: 'Context / RAG', baseTokens: 2000, color: '#9E77ED' },
  { label: 'Conversation History', baseTokens: 1500, color: '#B692F6' },
  { label: 'User Message', baseTokens: 400, color: '#D6BBFB' },
  { label: 'Response Reserve', baseTokens: 1300, color: '#6941C6' },
]

export default function ContextWindowViz() {
  const [maxTokens, setMaxTokens] = useState(8192)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

  const totalBase = SECTIONS.reduce((s, sec) => s + sec.baseTokens, 0)

  const scaled = useMemo(() => {
    const scale = maxTokens / 8192
    return SECTIONS.map(sec => ({
      ...sec,
      tokens: Math.round(sec.baseTokens * scale),
    }))
  }, [maxTokens])

  const totalUsed = scaled.reduce((s, sec) => s + sec.tokens, 0)
  const overflow = totalUsed > maxTokens
  const barWidth = 600

  return (
    <div className="p-6 bg-card rounded-xl border border-border max-w-2xl mx-auto">
      <h3 className="text-gray-300 font-semibold text-lg mb-1">Context Window Allocation</h3>
      <p className="text-gray-500 text-sm mb-5">
        Drag the slider to resize the context window. Sections scale proportionally.
      </p>

      <div className="mb-4">
        <label className="text-gray-400 text-sm block mb-1">
          Max Tokens: <span className="text-white font-mono">{maxTokens.toLocaleString()}</span>
        </label>
        <input
          type="range"
          min={2048}
          max={128000}
          step={1024}
          value={maxTokens}
          onChange={e => setMaxTokens(Number(e.target.value))}
          className="w-full accent-[#7F56D9]"
        />
        <div className="flex justify-between text-gray-600 text-xs mt-1">
          <span>2K</span><span>32K</span><span>64K</span><span>128K</span>
        </div>
      </div>

      <div className="relative mb-3">
        <svg width={barWidth} height={48} className="w-full" viewBox={`0 0 ${barWidth} 48`}>
          {(() => {
            let x = 0
            return scaled.map((sec, i) => {
              const w = (sec.tokens / Math.max(totalUsed, maxTokens)) * barWidth
              const rect = (
                <g key={i} onClick={() => setSelectedIdx(selectedIdx === i ? null : i)} className="cursor-pointer">
                  <rect
                    x={x}
                    y={4}
                    width={Math.max(w - 1, 2)}
                    height={40}
                    fill={overflow ? '#EF4444' : sec.color}
                    opacity={selectedIdx === null || selectedIdx === i ? 1 : 0.35}
                    rx={3}
                  />
                  {w > 40 && (
                    <text x={x + w / 2} y={28} textAnchor="middle" fill="white" fontSize={10} fontWeight={500}>
                      {sec.tokens.toLocaleString()}
                    </text>
                  )}
                </g>
              )
              x += w
              return rect
            })
          })()}
          {!overflow && (
            <rect
              x={(totalUsed / Math.max(totalUsed, maxTokens)) * barWidth}
              y={4}
              width={Math.max(barWidth - (totalUsed / maxTokens) * barWidth, 0)}
              height={40}
              fill="#1E293B"
              rx={3}
            />
          )}
        </svg>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        {scaled.map((sec, i) => (
          <button
            key={i}
            onClick={() => setSelectedIdx(selectedIdx === i ? null : i)}
            className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded border transition-colors ${
              selectedIdx === i ? 'border-white/30 bg-white/5' : 'border-transparent'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: sec.color }} />
            <span className="text-gray-400">{sec.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          Used: <span className="text-white font-mono">{totalUsed.toLocaleString()}</span> / {maxTokens.toLocaleString()}
        </span>
        {overflow ? (
          <span className="text-red-400 font-medium">Over budget by {(totalUsed - maxTokens).toLocaleString()} tokens</span>
        ) : (
          <span className="text-green-400/70">{(maxTokens - totalUsed).toLocaleString()} remaining</span>
        )}
      </div>

      {selectedIdx !== null && (
        <div className="mt-4 p-3 rounded-lg bg-white/5 border border-border text-sm">
          <span className="text-gray-300 font-medium">{scaled[selectedIdx].label}</span>
          <span className="text-gray-500 ml-2">
            {scaled[selectedIdx].tokens.toLocaleString()} tokens ({((scaled[selectedIdx].tokens / maxTokens) * 100).toFixed(1)}%)
          </span>
        </div>
      )}
    </div>
  )
}
