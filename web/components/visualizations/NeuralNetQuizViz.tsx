'use client'

import { useState, useCallback } from 'react'

const LAYERS = [3, 4, 2], LAYER_LABELS = ['Input', 'Hidden', 'Output']

function generateWeights() {
  return Array.from({ length: LAYERS.length - 1 }, (_, l) =>
    Array.from({ length: LAYERS[l] }, () =>
      Array.from({ length: LAYERS[l + 1] }, () => parseFloat((Math.random() * 2 - 1).toFixed(2)))
    )
  )
}

export default function NeuralNetQuizViz() {
  const [weights] = useState(generateWeights)
  const [activeLayer, setActiveLayer] = useState(-1)
  const [hoveredConnection, setHoveredConnection] = useState<{ layer: number; from: number; to: number } | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [activations, setActivations] = useState<number[][]>([])

  const forwardPass = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true); setActiveLayer(-1); setActivations([])
    const input = Array.from({ length: LAYERS[0] }, () => parseFloat((Math.random()).toFixed(2)))
    const all: number[][] = [input]
    let current = input
    for (let l = 0; l < weights.length; l++) {
      const next = Array.from({ length: LAYERS[l + 1] }, (_, j) => {
        const sum = current.reduce((s, v, i) => s + v * weights[l][i][j], 0)
        return parseFloat((1 / (1 + Math.exp(-sum))).toFixed(3))
      })
      all.push(next); current = next
    }
    all.forEach((acts, li) => {
      setTimeout(() => {
        setActiveLayer(li); setActivations(prev => [...prev, acts])
        if (li === all.length - 1) setTimeout(() => setIsAnimating(false), 500)
      }, li * 700)
    })
  }, [isAnimating, weights])

  // Layout
  const svgW = 500, svgH = 280
  const layerSpacing = svgW / (LAYERS.length + 1)
  const nodeRadius = 18

  const nodePos = (layer: number, node: number): [number, number] => {
    const x = layerSpacing * (layer + 1)
    const totalH = (LAYERS[layer] - 1) * 60
    const y = svgH / 2 - totalH / 2 + node * 60
    return [x, y]
  }

  const nodeColor = (layer: number, node: number): string => {
    if (layer > activeLayer) return 'rgba(255,255,255,0.08)'
    if (activations[layer]) {
      const val = activations[layer][node]
      return `rgba(99, 102, 241, ${0.2 + val * 0.6})`
    }
    return 'rgba(255,255,255,0.08)'
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-indigo-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="6" cy="6" r="3" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="18" r="3" />
            <path d="M9 6h6M9 18h6M6 9v6M18 9v6" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Neural Network Forward Pass</h3>
          <p className="text-xs text-muted-foreground">3-4-2 network with sigmoid activations - watch signal propagate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 flex justify-center">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto max-w-lg">
            {/* Connections */}
            {weights.map((layerW, l) =>
              layerW.map((nodeW, i) =>
                nodeW.map((w, j) => {
                  const [x1, y1] = nodePos(l, i)
                  const [x2, y2] = nodePos(l + 1, j)
                  const isHovered = hoveredConnection?.layer === l && hoveredConnection.from === i && hoveredConnection.to === j
                  const isActive = l < activeLayer
                  return (
                    <g key={`${l}-${i}-${j}`}>
                      <line
                        x1={x1 + nodeRadius} y1={y1} x2={x2 - nodeRadius} y2={y2}
                        stroke={isHovered ? '#818cf8' : isActive ? `rgba(99,102,241,${Math.abs(w) * 0.4 + 0.1})` : 'rgba(255,255,255,0.05)'}
                        strokeWidth={isHovered ? 2.5 : Math.abs(w) * 1.5 + 0.3}
                        onMouseEnter={() => setHoveredConnection({ layer: l, from: i, to: j })}
                        onMouseLeave={() => setHoveredConnection(null)}
                        className="cursor-crosshair"
                        style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }}
                      />
                      {isHovered && (
                        <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 6} textAnchor="middle" fill="#818cf8" fontSize="9" fontFamily="monospace" fontWeight="bold">
                          w={w.toFixed(2)}
                        </text>
                      )}
                    </g>
                  )
                })
              )
            )}

            {/* Nodes */}
            {LAYERS.map((count, l) =>
              Array.from({ length: count }).map((_, n) => {
                const [x, y] = nodePos(l, n)
                const hasActivation = activations[l] !== undefined
                return (
                  <g key={`node-${l}-${n}`}>
                    <circle
                      cx={x} cy={y} r={nodeRadius}
                      fill={nodeColor(l, n)}
                      stroke={l <= activeLayer ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}
                      strokeWidth={l === activeLayer ? 2 : 1}
                      style={{ transition: 'fill 0.4s, stroke 0.4s' }}
                    />
                    {hasActivation && (
                      <text x={x} y={y + 4} textAnchor="middle" fill="currentColor" fillOpacity={0.9} fontSize="9" fontFamily="monospace" fontWeight="bold">
                        {activations[l][n].toFixed(2)}
                      </text>
                    )}
                  </g>
                )
              })
            )}

            {/* Layer labels */}
            {LAYER_LABELS.map((label, i) => {
              const x = layerSpacing * (i + 1)
              return (
                <text key={i} x={x} y={svgH - 8} textAnchor="middle" fill="currentColor" fillOpacity={0.4} fontSize="10">
                  {label}
                </text>
              )
            })}
          </svg>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <button
            onClick={forwardPass}
            disabled={isAnimating}
            className="text-xs px-4 py-2 rounded-lg border bg-indigo-500/20 border-indigo-500/40 text-indigo-300 transition hover:bg-indigo-500/30 disabled:opacity-30"
          >
            {isAnimating ? 'Running...' : 'Forward Pass'}
          </button>

          {activations.length > 0 && (
            <div className="bg-muted border border-border p-3 rounded-xl space-y-2">
              <div className="text-xs uppercase font-bold text-muted-foreground">Activations</div>
              {activations.map((acts, l) => (
                <div key={l} className="text-xs font-mono">
                  <span className="text-indigo-400">{LAYER_LABELS[l]}:</span>{' '}
                  <span className="text-foreground/70">[{acts.map(a => a.toFixed(3)).join(', ')}]</span>
                </div>
              ))}
            </div>
          )}

          {hoveredConnection && (
            <div className="bg-muted border border-border p-3 rounded-xl">
              <div className="text-xs uppercase font-bold text-muted-foreground">Connection</div>
              <div className="text-xs font-mono text-foreground/70">
                {LAYER_LABELS[hoveredConnection.layer]}[{hoveredConnection.from}] → {LAYER_LABELS[hoveredConnection.layer + 1]}[{hoveredConnection.to}]
              </div>
              <div className="text-sm font-mono font-bold text-indigo-400">
                w = {weights[hoveredConnection.layer][hoveredConnection.from][hoveredConnection.to].toFixed(3)}
              </div>
            </div>
          )}

          <div className="mt-auto bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-lg">
            <p className="text-xs text-indigo-300 leading-relaxed italic">
              Each node computes sigmoid(sum of weighted inputs). Hover connections to see weights. Line thickness reflects weight magnitude. Brighter nodes have higher activations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
