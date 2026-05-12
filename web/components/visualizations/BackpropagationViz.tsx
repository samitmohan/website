'use client'

import { useState, useMemo } from 'react'

function sigmoid(x: number) { return 1 / (1 + Math.exp(-x)) }

export default function BackpropagationViz() {
  const [mode, setMode] = useState<'forward' | 'backward'>('forward')
  const [input, setInput] = useState([0.8, -0.5])

  const network = useMemo(() => {
    // Weights (fixed for demo)
    const w1 = [[0.5, -0.3], [0.8, 0.2], [-0.4, 0.7]]  // 3 hidden from 2 input
    const w2 = [0.6, -0.5, 0.3]  // 1 output from 3 hidden
    const target = 1.0

    // Forward
    const hidden = w1.map(row => sigmoid(row[0] * input[0] + row[1] * input[1]))
    const output = sigmoid(w2[0] * hidden[0] + w2[1] * hidden[1] + w2[2] * hidden[2])
    const loss = 0.5 * (target - output) ** 2

    // Backward
    const dLoss_dOut = -(target - output)
    const dOut_dNet = output * (1 - output)
    const dLoss_dNet = dLoss_dOut * dOut_dNet

    const dHidden = hidden.map((h, i) => {
      const dNet_dH = w2[i]
      const dH_dNetH = h * (1 - h)
      return dLoss_dNet * dNet_dH * dH_dNetH
    })

    const gradOutput = dLoss_dNet
    return { hidden, output, loss, gradOutput, dHidden, target }
  }, [input])

  const layers = [
    { label: 'Input', nodes: input.map((v, i) => ({ val: v, grad: 0, label: `x${i + 1}` })) },
    { label: 'Hidden', nodes: network.hidden.map((v, i) => ({ val: v, grad: network.dHidden[i], label: `h${i + 1}` })) },
    { label: 'Output', nodes: [{ val: network.output, grad: network.gradOutput, label: 'y' }] },
  ]

  const nodePos = (li: number, ni: number, total: number) => {
    const xSpacing = 180
    const x = 80 + li * xSpacing
    const yStart = 100 - (total - 1) * 30
    const y = yStart + ni * 60
    return { x, y }
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-blue-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Backpropagation</h3>
          <p className="text-xs text-muted-foreground">3-layer network. Toggle forward/backward pass.</p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setMode('forward')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${mode === 'forward' ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground'}`}
          >Forward Pass</button>
          <button
            onClick={() => setMode('backward')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${mode === 'backward' ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground'}`}
          >Backward Pass</button>
          <div className="ml-auto text-xs font-mono text-muted-foreground">Loss: {network.loss.toFixed(4)}</div>
        </div>

        <div className="flex gap-3 mb-3">
          {input.map((v, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <label className="text-xs font-bold text-muted-foreground">x{i + 1}</label>
              <input type="range" min="-2" max="2" step="0.1" value={v} onChange={e => { const n = [...input]; n[i] = parseFloat(e.target.value); setInput(n) }} className="flex-1 accent-blue-500" />
              <span className="text-xs font-mono w-8">{v.toFixed(1)}</span>
            </div>
          ))}
        </div>

        <svg viewBox="0 0 520 220" className="w-full bg-muted/30 rounded-xl border border-border/50">
          {/* Edges */}
          {layers.slice(0, -1).map((layer, li) =>
            layer.nodes.map((_, ni) => {
              const from = nodePos(li, ni, layer.nodes.length)
              return layers[li + 1].nodes.map((_, nj) => {
                const to = nodePos(li + 1, nj, layers[li + 1].nodes.length)
                const isForward = mode === 'forward'
                return (
                  <line
                    key={`${li}-${ni}-${nj}`}
                    x1={from.x + 20} y1={from.y}
                    x2={to.x - 20} y2={to.y}
                    stroke={isForward ? '#3b82f6' : '#ef4444'}
                    strokeWidth={1.5}
                    opacity={0.4}
                    strokeDasharray={isForward ? 'none' : '4 3'}
                  />
                )
              })
            })
          )}

          {/* Nodes */}
          {layers.map((layer, li) =>
            layer.nodes.map((node, ni) => {
              const pos = nodePos(li, ni, layer.nodes.length)
              const isForward = mode === 'forward'
              const fillColor = isForward
                ? `rgba(59,130,246,${0.2 + Math.abs(node.val) * 0.5})`
                : `rgba(239,68,68,${0.2 + Math.min(Math.abs(node.grad), 1) * 0.5})`
              const strokeColor = isForward ? '#60a5fa' : '#f87171'
              return (
                <g key={`${li}-${ni}`}>
                  <circle cx={pos.x} cy={pos.y} r={20} fill={fillColor} stroke={strokeColor} strokeWidth={2} />
                  <text x={pos.x} y={pos.y - 5} textAnchor="middle" className="fill-gray-200 text-[8px] font-bold">{node.label}</text>
                  <text x={pos.x} y={pos.y + 8} textAnchor="middle" className={`text-[8px] font-mono font-bold ${isForward ? 'fill-blue-300' : 'fill-red-300'}`}>
                    {isForward ? node.val.toFixed(2) : (li === 0 ? '-' : node.grad.toFixed(3))}
                  </text>
                </g>
              )
            })
          )}

          {/* Layer labels */}
          {layers.map((layer, li) => (
            <text key={li} x={80 + li * 180} y={200} textAnchor="middle" className="fill-muted-foreground text-base font-bold">{layer.label}</text>
          ))}

          {/* Direction arrow */}
          <g>
            <text x={260} y={16} textAnchor="middle" className={`text-xs font-bold ${mode === 'forward' ? 'fill-blue-400' : 'fill-red-400'}`}>
              {mode === 'forward' ? 'Activations flow -->' : '<-- Gradients flow'}
            </text>
          </g>
        </svg>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
            <p className="text-xs font-bold text-blue-400">Forward: activations propagate left to right</p>
            <p className="text-xs text-muted-foreground">Each node applies weights + sigmoid activation</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
            <p className="text-xs font-bold text-red-400">Backward: gradients propagate right to left</p>
            <p className="text-xs text-muted-foreground">Chain rule computes dLoss/d(each parameter)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
