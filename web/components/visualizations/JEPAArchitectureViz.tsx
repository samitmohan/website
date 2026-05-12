'use client'

import { useState } from 'react'

type Component = 'context' | 'target' | 'predictor' | null

const descriptions: Record<string, { title: string; detail: string }> = {
  context: {
    title: 'Context Encoder',
    detail: 'Processes visible (unmasked) patches of the input. Trained with gradient descent. Generates representations that the predictor uses to infer missing regions.',
  },
  target: {
    title: 'Target Encoder',
    detail: 'Processes the full input including masked patches. Updated via exponential moving average (EMA) of context encoder weights. Stop-gradient prevents collapse.',
  },
  predictor: {
    title: 'Predictor',
    detail: 'Takes context encoder output + positional mask tokens. Predicts target representations in latent space (not pixel space). This is the key JEPA insight.',
  },
}

export default function JEPAArchitectureViz() {
  const [hovered, setHovered] = useState<Component>(null)
  const [showEMA, setShowEMA] = useState(false)
  const [showGradFlow, setShowGradFlow] = useState(false)

  const boxClass = (id: Component) =>
    `cursor-pointer rounded-lg border px-4 py-3 transition-all ${
      hovered === id
        ? 'border-[#7F56D9] bg-[#7F56D9]/15 shadow-lg shadow-purple-500/10'
        : 'border-border bg-white/5 hover:border-white/20'
    }`

  const active = hovered ? descriptions[hovered] : null

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-1 text-sm font-semibold text-gray-200">JEPA Architecture</h3>
      <p className="mb-4 text-xs text-gray-500">Hover over components to inspect. Toggle overlays for gradient and EMA flows.</p>

      <div className="relative mb-4">
        <svg viewBox="0 0 400 220" className="w-full" style={{ maxHeight: 220 }}>
          {/* Input */}
          <rect x="10" y="90" width="60" height="40" rx="6" fill="#1E2433" stroke="rgba(255,255,255,0.1)" />
          <text x="40" y="114" fill="#9CA3AF" fontSize="9" textAnchor="middle">Input x</text>

          {/* Context Encoder */}
          <rect x="100" y="20" width="100" height="50" rx="8"
            fill={hovered === 'context' ? 'rgba(127,86,217,0.15)' : '#1E2433'}
            stroke={hovered === 'context' ? '#7F56D9' : 'rgba(255,255,255,0.1)'} strokeWidth="1.5"
            onMouseEnter={() => setHovered('context')} onMouseLeave={() => setHovered(null)} className="cursor-pointer" />
          <text x="150" y="42" fill="#D1D5DB" fontSize="9" textAnchor="middle" pointerEvents="none">Context Encoder</text>
          <text x="150" y="55" fill="#6B7280" fontSize="7" textAnchor="middle" pointerEvents="none">visible patches</text>

          {/* Target Encoder */}
          <rect x="100" y="150" width="100" height="50" rx="8"
            fill={hovered === 'target' ? 'rgba(127,86,217,0.15)' : '#1E2433'}
            stroke={hovered === 'target' ? '#7F56D9' : 'rgba(255,255,255,0.1)'} strokeWidth="1.5"
            onMouseEnter={() => setHovered('target')} onMouseLeave={() => setHovered(null)} className="cursor-pointer" />
          <text x="150" y="172" fill="#D1D5DB" fontSize="9" textAnchor="middle" pointerEvents="none">Target Encoder</text>
          <text x="150" y="185" fill="#6B7280" fontSize="7" textAnchor="middle" pointerEvents="none">full input (EMA)</text>

          {/* Stop gradient marker */}
          <rect x="130" y="136" width="40" height="14" rx="3" fill="#EF4444" opacity="0.2" />
          <text x="150" y="146" fill="#EF4444" fontSize="7" textAnchor="middle">sg</text>

          {/* Predictor */}
          <rect x="240" y="60" width="90" height="50" rx="8"
            fill={hovered === 'predictor' ? 'rgba(127,86,217,0.15)' : '#1E2433'}
            stroke={hovered === 'predictor' ? '#7F56D9' : 'rgba(255,255,255,0.1)'} strokeWidth="1.5"
            onMouseEnter={() => setHovered('predictor')} onMouseLeave={() => setHovered(null)} className="cursor-pointer" />
          <text x="285" y="82" fill="#D1D5DB" fontSize="9" textAnchor="middle" pointerEvents="none">Predictor</text>
          <text x="285" y="95" fill="#6B7280" fontSize="7" textAnchor="middle" pointerEvents="none">latent prediction</text>

          {/* Loss */}
          <rect x="340" y="130" width="50" height="30" rx="6" fill="#1E2433" stroke="rgba(255,255,255,0.1)" />
          <text x="365" y="149" fill="#F59E0B" fontSize="9" textAnchor="middle">Loss</text>

          {/* Arrows: input -> context */}
          <line x1="70" y1="100" x2="100" y2="50" stroke="#4B5563" strokeWidth="1" markerEnd="url(#arrowGray)" />
          {/* input -> target */}
          <line x1="70" y1="115" x2="100" y2="170" stroke="#4B5563" strokeWidth="1" markerEnd="url(#arrowGray)" />
          {/* context -> predictor */}
          <line x1="200" y1="45" x2="240" y2="75" stroke="#9E77ED" strokeWidth="1.5" markerEnd="url(#arrowPurple)" />
          {/* predictor -> loss */}
          <line x1="330" y1="95" x2="355" y2="130" stroke="#9E77ED" strokeWidth="1.5" markerEnd="url(#arrowPurple)" />
          {/* target -> loss */}
          <line x1="200" y1="175" x2="340" y2="150" stroke="#4B5563" strokeWidth="1" strokeDasharray="4 2" markerEnd="url(#arrowGray)" />

          {/* EMA arrow */}
          {showEMA && (
            <g>
              <path d="M 150 70 C 60 110 60 110 150 150" fill="none" stroke="#22C55E" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrowGreen)" />
              <text x="55" y="114" fill="#22C55E" fontSize="7">EMA</text>
            </g>
          )}

          {/* Gradient flow */}
          {showGradFlow && (
            <g>
              <line x1="340" y1="138" x2="310" y2="110" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 2" />
              <line x1="260" y1="60" x2="180" y2="45" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 2" />
              <text x="220" y="40" fill="#F59E0B" fontSize="6">grad flow</text>
            </g>
          )}

          <defs>
            <marker id="arrowGray" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 Z" fill="#4B5563" />
            </marker>
            <marker id="arrowPurple" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 Z" fill="#9E77ED" />
            </marker>
            <marker id="arrowGreen" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 Z" fill="#22C55E" />
            </marker>
          </defs>
        </svg>
      </div>

      <div className="mb-3 flex gap-2">
        <button onClick={() => setShowEMA(!showEMA)}
          className={`rounded px-3 py-1 text-xs font-medium transition ${showEMA ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'border border-border text-gray-500 hover:text-gray-300'}`}>
          EMA Update
        </button>
        <button onClick={() => setShowGradFlow(!showGradFlow)}
          className={`rounded px-3 py-1 text-xs font-medium transition ${showGradFlow ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'border border-border text-gray-500 hover:text-gray-300'}`}>
          Gradient Flow
        </button>
      </div>

      {active ? (
        <div className="rounded-lg border border-border bg-white/5 px-3 py-2">
          <span className="text-xs font-semibold text-[#9E77ED]">{active.title}</span>
          <p className="mt-1 text-xs text-gray-400">{active.detail}</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-white/5 px-3 py-2 text-xs text-gray-500">
          Hover a component to see details. JEPA predicts in representation space, not pixel space.
        </div>
      )}
    </div>
  )
}
