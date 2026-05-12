'use client'

import { useState, useMemo } from 'react'

export default function GradientComputationViz() {
  const [x, setX] = useState(2.0)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const graph = useMemo(() => {
    const a = x
    const b = a * a          // f(x) = x^2
    const c = b - 4          // g = f(x) - 4
    const loss = c * c        // loss = g^2

    // Backward pass (chain rule)
    const dLoss_dLoss = 1
    const dLoss_dc = 2 * c * dLoss_dLoss
    const dLoss_db = 1 * dLoss_dc
    const dLoss_da = 2 * a * dLoss_db

    return {
      nodes: [
        { id: 'x', label: 'x', value: a, grad: dLoss_da, x: 60, y: 100 },
        { id: 'f', label: 'x^2', value: b, grad: dLoss_db, x: 220, y: 100 },
        { id: 'g', label: 'g - 4', value: c, grad: dLoss_dc, x: 380, y: 100 },
        { id: 'loss', label: 'loss = g^2', value: loss, grad: dLoss_dLoss, x: 540, y: 100 },
      ],
      edges: [
        { from: 'x', to: 'f', rule: 'd(x^2)/dx = 2x', val: 2 * a },
        { from: 'f', to: 'g', rule: 'd(b-4)/db = 1', val: 1 },
        { from: 'g', to: 'loss', rule: 'd(c^2)/dc = 2c', val: 2 * c },
      ],
    }
  }, [x])

  const sel = graph.nodes.find(n => n.id === selectedNode)

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-emerald-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Gradient Computation Graph</h3>
          <p className="text-xs text-muted-foreground">Click nodes to see partial derivatives. Slide x to update values.</p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <label className="text-xs font-bold text-muted-foreground">x =</label>
          <input type="range" min="-3" max="3" step="0.1" value={x} onChange={e => setX(parseFloat(e.target.value))} className="flex-1 accent-emerald-500" />
          <span className="text-sm font-mono font-bold w-12 text-right">{x.toFixed(1)}</span>
        </div>

        <svg viewBox="0 0 620 200" className="w-full bg-muted/30 rounded-xl border border-border/50">
          {graph.edges.map((e, i) => {
            const from = graph.nodes.find(n => n.id === e.from)!
            const to = graph.nodes.find(n => n.id === e.to)!
            return (
              <g key={i}>
                <line x1={from.x + 40} y1={from.y} x2={to.x - 40} y2={to.y} stroke="#6366f1" strokeWidth={2} markerEnd="url(#arrow)" />
                <text x={(from.x + to.x) / 2} y={from.y - 30} textAnchor="middle" className="fill-blue-400 text-sm font-mono">{e.rule}</text>
                <text x={(from.x + to.x) / 2} y={from.y - 18} textAnchor="middle" className="fill-blue-300 text-sm font-mono font-bold">= {e.val.toFixed(2)}</text>
                {/* backward arrow */}
                <line x1={to.x - 40} y1={from.y + 20} x2={from.x + 40} y2={to.y + 20} stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="4 2" markerEnd="url(#arrowRed)" />
              </g>
            )
          })}
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" /></marker>
            <marker id="arrowRed" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" /></marker>
          </defs>
          {graph.nodes.map(n => {
            const isSel = selectedNode === n.id
            return (
              <g key={n.id} onClick={() => setSelectedNode(isSel ? null : n.id)} className="cursor-pointer">
                <rect x={n.x - 38} y={n.y - 28} width={76} height={56} rx={10} fill={isSel ? '#6366f1' : '#1e1b4b'} stroke={isSel ? '#818cf8' : '#4338ca'} strokeWidth={2} />
                <text x={n.x} y={n.y - 8} textAnchor="middle" className="fill-gray-300 text-base font-bold">{n.label}</text>
                <text x={n.x} y={n.y + 6} textAnchor="middle" className="fill-blue-300 text-xs font-mono font-bold">{n.value.toFixed(2)}</text>
                <text x={n.x} y={n.y + 20} textAnchor="middle" className="fill-red-400 text-sm font-mono">grad: {n.grad.toFixed(2)}</text>
              </g>
            )
          })}
        </svg>

        {sel && (
          <div className="mt-3 bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg">
            <p className="text-xs text-indigo-300">
              <span className="font-bold">{sel.label}</span> : forward value = <span className="font-mono">{sel.value.toFixed(4)}</span>, dLoss/d({sel.label}) = <span className="font-mono text-red-400">{sel.grad.toFixed(4)}</span>
            </p>
          </div>
        )}

        <div className="mt-3 flex gap-2">
          <div className="flex-1 bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
            <p className="text-xs font-bold text-blue-400 mb-1">Forward (blue)</p>
            <p className="text-xs text-muted-foreground">{"x -> x^2 -> (x^2 - 4) -> (x^2 - 4)^2"}</p>
          </div>
          <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
            <p className="text-xs font-bold text-red-400 mb-1">Backward (red dashed)</p>
            <p className="text-xs text-muted-foreground">Gradients flow backward via chain rule</p>
          </div>
        </div>
      </div>
    </div>
  )
}
