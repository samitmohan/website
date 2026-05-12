'use client'

import { useState } from 'react'

const NUM_LAYERS = 12

function computeGradients(withResidual: boolean): number[] {
  const grads: number[] = []
  let grad = 1.0
  for (let i = 0; i < NUM_LAYERS; i++) {
    if (withResidual) {
      // Residual: gradient = 1 + f'(x), stays healthy
      const layerGrad = 0.7 + Math.random() * 0.3
      grad = grad * (1 + layerGrad * 0.1)
    } else {
      // No residual: gradient shrinks (vanishing gradient)
      const decay = 0.55 + (i * 0.02)
      grad = grad * decay
    }
    grads.push(grad)
  }
  return grads
}

// Deterministic version for display
const GRADS_WITH = [1.07, 1.14, 1.18, 1.22, 1.25, 1.27, 1.29, 1.30, 1.31, 1.32, 1.32, 1.33]
const GRADS_WITHOUT = [0.55, 0.31, 0.18, 0.11, 0.07, 0.04, 0.03, 0.02, 0.012, 0.008, 0.005, 0.003]

export default function ResidualConnectionViz() {
  const [showResidual, setShowResidual] = useState(true)
  const [activeLayer, setActiveLayer] = useState(5)

  const grads = showResidual ? GRADS_WITH : GRADS_WITHOUT
  const maxGrad = Math.max(...GRADS_WITH)

  const signalInput = [0.8, -0.3, 0.5, -0.7]
  const learnedDelta = [0.1, 0.2, -0.15, 0.05]
  const signalOutput = showResidual
    ? signalInput.map((v, i) => Math.round((v + learnedDelta[i]) * 100) / 100)
    : learnedDelta.map(v => Math.round(v * 100) / 100)

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-teal-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-teal-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16M12 4v16" /><path d="M7 7l10 10" /></svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Residual (Skip) Connections</h3>
          <p className="text-xs text-muted-foreground">Identity shortcut keeps gradients flowing</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Toggle */}
        <div className="flex gap-2">
          <button onClick={() => setShowResidual(true)} className={`px-4 py-1.5 text-xs font-mono rounded border transition-all ${showResidual ? 'bg-teal-500/30 border-teal-500/50 text-teal-200' : 'bg-muted border-border text-muted-foreground hover:border-teal-500/30'}`}>
            With Residual
          </button>
          <button onClick={() => setShowResidual(false)} className={`px-4 py-1.5 text-xs font-mono rounded border transition-all ${!showResidual ? 'bg-red-500/30 border-red-500/50 text-red-200' : 'bg-muted border-border text-muted-foreground hover:border-red-500/30'}`}>
            Without Residual
          </button>
        </div>

        {/* Block diagram */}
        <svg viewBox="0 0 400 140" className="w-full">
          {/* Input */}
          <rect x={10} y={50} width={50} height={30} rx={4} className="fill-blue-500/25 stroke-blue-500/40" strokeWidth="1" />
          <text x={35} y={69} textAnchor="middle" className="fill-blue-200 text-[8px] font-bold">x (input)</text>

          {/* Arrow to block */}
          <line x1={60} y1={65} x2={100} y2={65} stroke="#6b7280" strokeWidth="1.5" />

          {/* Transformer block */}
          <rect x={100} y={40} width={120} height={50} rx={6} className="fill-amber-500/15 stroke-amber-500/30" strokeWidth="1" />
          <text x={160} y={60} textAnchor="middle" className="fill-amber-300 text-[8px] font-bold">Attention / FFN</text>
          <text x={160} y={75} textAnchor="middle" className="fill-amber-200/60 text-[7px] font-mono">F(x)</text>

          {/* Residual path (skip connection) */}
          {showResidual && (
            <>
              <path d="M 60 65 L 60 20 L 280 20 L 280 55" fill="none" stroke="#2dd4bf" strokeWidth="2" strokeDasharray="6 3" />
              <circle cx={280} cy={55} r={3} fill="#2dd4bf" />
              <text x={170} y={14} textAnchor="middle" className="fill-teal-300 text-[8px] font-bold">Identity path (skip)</text>
            </>
          )}

          {/* Arrow from block */}
          <line x1={220} y1={65} x2={260} y2={65} stroke="#6b7280" strokeWidth="1.5" />

          {/* Add node */}
          {showResidual ? (
            <>
              <circle cx={280} cy={65} r={14} className="fill-teal-500/20 stroke-teal-500/50" strokeWidth="1.5" />
              <text x={280} y={69} textAnchor="middle" className="fill-teal-200 text-xs font-bold">+</text>
            </>
          ) : (
            <line x1={260} y1={65} x2={300} y2={65} stroke="#6b7280" strokeWidth="1.5" />
          )}

          {/* Output */}
          <line x1={showResidual ? 294 : 300} y1={65} x2={330} y2={65} stroke="#6b7280" strokeWidth="1.5" />
          <rect x={330} y={50} width={60} height={30} rx={4} className="fill-emerald-500/25 stroke-emerald-500/40" strokeWidth="1" />
          <text x={360} y={63} textAnchor="middle" className="fill-emerald-200 text-[7px] font-bold">{showResidual ? 'x + F(x)' : 'F(x)'}</text>
          <text x={360} y={75} textAnchor="middle" className="fill-emerald-200/60 text-[7px]">output</text>

          {/* Label for learned path */}
          <text x={160} y={105} textAnchor="middle" className="fill-amber-300/60 text-[7px]">Learned path (through block)</text>
        </svg>

        {/* Signal values */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="text-sm uppercase font-bold text-blue-300 mb-1">Input x</div>
            <div className="flex gap-1">
              {signalInput.map((v, i) => (
                <div key={i} className={`flex-1 text-center py-1 rounded text-sm font-mono ${v > 0 ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'}`}>{v}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm uppercase font-bold text-amber-300 mb-1">F(x) (learned)</div>
            <div className="flex gap-1">
              {learnedDelta.map((v, i) => (
                <div key={i} className={`flex-1 text-center py-1 rounded text-sm font-mono ${v > 0 ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'}`}>{v}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm uppercase font-bold text-emerald-300 mb-1">{showResidual ? 'x + F(x)' : 'F(x) only'}</div>
            <div className="flex gap-1">
              {signalOutput.map((v, i) => (
                <div key={i} className={`flex-1 text-center py-1 rounded text-sm font-mono font-bold ${v > 0 ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'}`}>{v}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Gradient magnitude chart */}
        <div>
          <label className="text-xs uppercase font-bold text-muted-foreground mb-2 block">
            Gradient Magnitude Through {NUM_LAYERS} Layers
          </label>
          <svg viewBox={`0 0 ${NUM_LAYERS * 34 + 40} 120`} className="w-full">
            {/* Y axis line */}
            <line x1={30} y1={10} x2={30} y2={100} className="stroke-border" strokeWidth="0.5" />
            <line x1={30} y1={100} x2={NUM_LAYERS * 34 + 35} y2={100} className="stroke-border" strokeWidth="0.5" />
            <text x={4} y={15} className="fill-muted-foreground text-[6px]">1.4</text>
            <text x={4} y={55} className="fill-muted-foreground text-[6px]">0.7</text>
            <text x={4} y={100} className="fill-muted-foreground text-[6px]">0.0</text>

            {grads.map((g, i) => {
              const barH = (g / 1.4) * 85
              const x = 35 + i * 34
              const isActive = i === activeLayer
              return (
                <g key={i} onClick={() => setActiveLayer(i)} className="cursor-pointer">
                  <rect x={x} y={100 - barH} width={26} height={barH} rx={2} fill={showResidual ? '#2dd4bf' : '#ef4444'} opacity={isActive ? 0.8 : 0.4} />
                  <text x={x + 13} y={112} textAnchor="middle" className="fill-muted-foreground text-[6px]">L{i + 1}</text>
                  {isActive && (
                    <text x={x + 13} y={95 - barH} textAnchor="middle" className={`text-[7px] font-bold ${showResidual ? 'fill-teal-300' : 'fill-red-300'}`}>
                      {g.toFixed(3)}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        <div className={`p-3 rounded-lg border text-xs leading-relaxed ${showResidual ? 'bg-teal-500/5 border-teal-500/10 text-teal-300' : 'bg-red-500/5 border-red-500/10 text-red-300'}`}>
          <span className="font-bold">
            {showResidual
              ? 'With residual connections, the gradient at layer 1 stays at ~' + GRADS_WITH[0].toFixed(2) + '. The identity path guarantees a gradient of at least 1.0 flows back, preventing vanishing gradients.'
              : 'Without residual connections, the gradient at layer 12 drops to ' + GRADS_WITHOUT[11] + '. Each layer multiplies gradients by a factor < 1, causing exponential decay - the vanishing gradient problem.'}
          </span>
        </div>
      </div>
    </div>
  )
}
