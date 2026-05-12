'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'

export default function NeuralNetworkViz() {
  const [inputValues, setInputValues] = useState([0.5, -0.3])
  const [showActivations, setShowActivations] = useState(true)

  const layers = [2, 4, 3, 1] // network architecture

  // Simple forward pass with random weights (deterministic seed)
  const activations = useMemo(() => {
    const acts: number[][] = [inputValues]
    // Use fixed "weights" for visual consistency
    const weights = [
      [[0.5, 0.3, -0.4, 0.2], [-0.1, 0.6, 0.3, -0.5]],
      [[0.4, -0.2, 0.3], [0.1, 0.5, -0.3], [-0.4, 0.2, 0.6], [0.3, -0.1, 0.4]],
      [[0.6], [-0.3], [0.4]],
    ]

    for (let l = 0; l < weights.length; l++) {
      const prev = acts[l]
      const next: number[] = []
      for (let j = 0; j < weights[l][0].length; j++) {
        let sum = 0
        for (let i = 0; i < prev.length; i++) {
          sum += prev[i] * (weights[l][i]?.[j] ?? 0)
        }
        // ReLU
        next.push(Math.max(0, sum))
      }
      acts.push(next)
    }
    return acts
  }, [inputValues])

  const W = 420
  const H = 220
  const layerSpacing = W / (layers.length + 1)

  const nodePositions = layers.map((size, layerIdx) => {
    const x = layerSpacing * (layerIdx + 1)
    return Array.from({ length: size }, (_, nodeIdx) => {
      const totalHeight = (size - 1) * 40
      const y = H / 2 - totalHeight / 2 + nodeIdx * 40
      return { x, y }
    })
  })

  const maxAct = Math.max(...activations.flat().map(Math.abs), 0.01)

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-blue-500/10 p-1.5 rounded-lg">
          <Brain className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <h3 className="text-base font-bold">Feed-Forward Neural Network</h3>
          <p className="text-xs text-muted-foreground">2-layer FFN with ReLU activations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            {/* Connections */}
            {nodePositions.map((layer, li) =>
              li < nodePositions.length - 1 &&
              layer.map((from, fi) =>
                nodePositions[li + 1].map((to, ti) => {
                  const strength = activations[li]?.[fi] ?? 0
                  const opacity = Math.min(0.8, Math.abs(strength) / maxAct * 0.6 + 0.1)
                  return (
                    <motion.line
                      key={`${li}-${fi}-${ti}`}
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke={strength >= 0 ? '#6366f1' : '#f43f5e'}
                      strokeWidth={1}
                      strokeOpacity={opacity}
                      animate={{ strokeOpacity: opacity }}
                    />
                  )
                })
              )
            )}

            {/* Nodes */}
            {nodePositions.map((layer, li) =>
              layer.map((pos, ni) => {
                const act = activations[li]?.[ni] ?? 0
                const intensity = Math.abs(act) / maxAct
                const color = act >= 0 ? `rgba(99, 102, 241, ${0.3 + intensity * 0.7})` : `rgba(244, 63, 94, ${0.3 + intensity * 0.7})`
                return (
                  <g key={`node-${li}-${ni}`}>
                    <motion.circle
                      cx={pos.x}
                      cy={pos.y}
                      r={14}
                      fill={showActivations ? color : 'rgba(99, 102, 241, 0.2)'}
                      stroke="#6366f1"
                      strokeWidth={1.5}
                      strokeOpacity={0.5}
                      animate={{ fill: showActivations ? color : 'rgba(99, 102, 241, 0.2)' }}
                    />
                    {showActivations && (
                      <text
                        x={pos.x}
                        y={pos.y + 3}
                        textAnchor="middle"
                        fill="white"
                        fontSize={8}
                        fontFamily="monospace"
                      >
                        {act.toFixed(1)}
                      </text>
                    )}
                  </g>
                )
              })
            )}

            {/* Layer labels */}
            {['Input', 'Hidden 1', 'Hidden 2', 'Output'].map((label, i) => (
              <text
                key={label}
                x={layerSpacing * (i + 1)}
                y={H - 8}
                textAnchor="middle"
                fill="currentColor"
                fillOpacity={0.4}
                fontSize={9}
              >
                {label}
              </text>
            ))}
          </svg>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-2 block">Input 1</label>
            <input
              type="range" min={-2} max={2} step={0.1}
              value={inputValues[0]}
              onChange={(e) => setInputValues([parseFloat(e.target.value), inputValues[1]])}
              className="w-full accent-indigo-500"
            />
            <div className="text-center text-xs font-mono text-indigo-400">{inputValues[0].toFixed(1)}</div>
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-2 block">Input 2</label>
            <input
              type="range" min={-2} max={2} step={0.1}
              value={inputValues[1]}
              onChange={(e) => setInputValues([inputValues[0], parseFloat(e.target.value)])}
              className="w-full accent-indigo-500"
            />
            <div className="text-center text-xs font-mono text-indigo-400">{inputValues[1].toFixed(1)}</div>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl">
            <div className="text-xs uppercase font-bold text-muted-foreground mb-1">Output</div>
            <div className="text-2xl font-mono font-bold text-indigo-400">
              {(activations[activations.length - 1]?.[0] ?? 0).toFixed(3)}
            </div>
          </div>

          <button
            onClick={() => setShowActivations(!showActivations)}
            className="text-xs text-primary hover:underline text-left"
          >
            {showActivations ? 'Hide' : 'Show'} activation values
          </button>

          <div className="mt-auto bg-blue-500/5 border border-blue-500/10 p-3 rounded-lg">
            <p className="text-xs text-blue-300 leading-relaxed italic">
              Negative values get killed by ReLU (set to 0). This is the "dying ReLU" problem.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
