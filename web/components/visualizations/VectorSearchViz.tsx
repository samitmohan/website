'use client'

import { useState, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, RotateCcw } from 'lucide-react'

// Seeded random for consistent positions
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRandom(42)
const DOCUMENTS = Array.from({ length: 24 }, (_, i) => ({
  id: `D${i + 1}`,
  x: rng() * 8 - 4,
  y: rng() * 8 - 4,
  label: [
    'transformers', 'attention', 'CNN', 'RNN', 'BERT', 'GPT',
    'embeddings', 'tokenizer', 'loss fn', 'optimizer',
    'dropout', 'batch norm', 'softmax', 'cross-entropy',
    'fine-tune', 'pretrain', 'LoRA', 'RLHF',
    'RAG', 'vector DB', 'chunking', 'reranking',
    'prompt eng', 'few-shot',
  ][i],
}))

const DOC_COLOR = '#6366f1'
const QUERY_COLOR = '#f43f5e'
const HIGHLIGHT_COLOR = '#34d399'

function euclidean(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}

export default function VectorSearchViz() {
  const [query, setQuery] = useState({ x: 1.0, y: 1.5 })
  const [k, setK] = useState(5)
  const [dragging, setDragging] = useState(false)
  const [showRadius, setShowRadius] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)

  const W = 400
  const H = 400
  const pad = 30
  const scale = (W - pad * 2) / 8
  const cx = W / 2
  const cy = H / 2

  const toScreen = (x: number, y: number) => ({
    sx: cx + x * scale,
    sy: cy - y * scale,
  })

  const fromScreen = (sx: number, sy: number) => ({
    x: Math.round(((sx - cx) / scale) * 10) / 10,
    y: Math.round(((cy - sy) / scale) * 10) / 10,
  })

  const ranked = useMemo(() => {
    return DOCUMENTS.map((doc) => ({
      ...doc,
      distance: euclidean(query.x, query.y, doc.x, doc.y),
      similarity: 1 / (1 + euclidean(query.x, query.y, doc.x, doc.y)),
    }))
      .sort((a, b) => a.distance - b.distance)
  }, [query])

  const topK = ranked.slice(0, k)
  const topKIds = new Set(topK.map((d) => d.id))
  const maxDistance = topK.length > 0 ? topK[topK.length - 1].distance : 0

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging || !svgRef.current) return
    const pt = svgRef.current.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const svgPt = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse())
    const vec = fromScreen(svgPt.x, svgPt.y)
    setQuery({ x: Math.max(-4, Math.min(4, vec.x)), y: Math.max(-4, Math.min(4, vec.y)) })
  }

  const qScreen = toScreen(query.x, query.y)

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-rose-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-rose-500/10 p-1.5 rounded-lg">
          <Search className="w-4 h-4 text-rose-400" />
        </div>
        <div>
          <h3 className="text-base font-bold">Vector Search</h3>
          <p className="text-xs text-muted-foreground">Nearest neighbor search in embedding space - drag the query point</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 flex justify-center">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto max-w-md cursor-crosshair"
            onPointerMove={handlePointerMove}
            onPointerUp={() => setDragging(false)}
            onPointerLeave={() => setDragging(false)}
          >
            {/* Grid */}
            {[-4, -2, 0, 2, 4].map((v) => (
              <g key={v}>
                <line
                  x1={toScreen(v, -4).sx} y1={toScreen(v, -4).sy}
                  x2={toScreen(v, 4).sx} y2={toScreen(v, 4).sy}
                  stroke="currentColor" strokeOpacity={v === 0 ? 0.12 : 0.04}
                />
                <line
                  x1={toScreen(-4, v).sx} y1={toScreen(-4, v).sy}
                  x2={toScreen(4, v).sx} y2={toScreen(4, v).sy}
                  stroke="currentColor" strokeOpacity={v === 0 ? 0.12 : 0.04}
                />
              </g>
            ))}

            {/* Radius circle */}
            {showRadius && maxDistance > 0 && (
              <motion.circle
                cx={qScreen.sx}
                cy={qScreen.sy}
                r={maxDistance * scale}
                fill="none"
                stroke={HIGHLIGHT_COLOR}
                strokeWidth={1}
                strokeOpacity={0.3}
                strokeDasharray="6,4"
                animate={{ r: maxDistance * scale }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              />
            )}

            {/* Connection lines to top-k */}
            {topK.map((doc) => {
              const dScreen = toScreen(doc.x, doc.y)
              return (
                <motion.line
                  key={`line-${doc.id}`}
                  x1={qScreen.sx} y1={qScreen.sy}
                  x2={dScreen.sx} y2={dScreen.sy}
                  stroke={HIGHLIGHT_COLOR}
                  strokeWidth={1}
                  strokeOpacity={0.3}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )
            })}

            {/* Document dots */}
            {DOCUMENTS.map((doc) => {
              const s = toScreen(doc.x, doc.y)
              const isTopK = topKIds.has(doc.id)
              return (
                <g key={doc.id}>
                  <motion.circle
                    cx={s.sx}
                    cy={s.sy}
                    r={isTopK ? 7 : 4}
                    fill={isTopK ? HIGHLIGHT_COLOR : DOC_COLOR}
                    fillOpacity={isTopK ? 0.8 : 0.4}
                    stroke={isTopK ? HIGHLIGHT_COLOR : 'none'}
                    strokeWidth={isTopK ? 2 : 0}
                    animate={{
                      r: isTopK ? 7 : 4,
                      fillOpacity: isTopK ? 0.8 : 0.4,
                    }}
                    transition={{ duration: 0.2 }}
                  />
                  {isTopK && (
                    <text
                      x={s.sx}
                      y={s.sy - 10}
                      textAnchor="middle"
                      fill={HIGHLIGHT_COLOR}
                      fontSize={8}
                      fontWeight="bold"
                    >
                      {doc.label}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Query point */}
            <motion.circle
              cx={qScreen.sx}
              cy={qScreen.sy}
              r={9}
              fill={QUERY_COLOR}
              fillOpacity={0.6}
              stroke={QUERY_COLOR}
              strokeWidth={2}
              className="cursor-grab"
              onPointerDown={(e) => { e.stopPropagation(); setDragging(true) }}
              animate={{ cx: qScreen.sx, cy: qScreen.sy }}
            />
            <text
              x={qScreen.sx + 12}
              y={qScreen.sy - 8}
              fill={QUERY_COLOR}
              fontSize={10}
              fontWeight="bold"
            >
              Query
            </text>
          </svg>
        </div>

        {/* Dashboard */}
        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setQuery({ x: 1.0, y: 1.5 })}
              className="flex items-center gap-1.5 text-xs border border-border rounded-lg py-1.5 px-3 hover:bg-accent transition text-muted-foreground"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
            <button
              onClick={() => setShowRadius(!showRadius)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                showRadius ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'border-border text-muted-foreground'
              }`}
            >
              Radius
            </button>
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">
              k = {k} neighbors
            </label>
            <input
              type="range" min={1} max={12} step={1}
              value={k}
              onChange={(e) => setK(parseInt(e.target.value))}
              className="w-full accent-rose-500"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>1</span>
              <span>12</span>
            </div>
          </div>

          <div className="bg-muted border border-border p-2 rounded-xl">
            <div className="text-xs uppercase font-bold text-muted-foreground mb-0.5">Query Position</div>
            <div className="text-xs font-mono text-rose-400">[{query.x.toFixed(1)}, {query.y.toFixed(1)}]</div>
          </div>

          {/* Top-k results */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            <div className="text-xs uppercase font-bold text-muted-foreground">Top-{k} Results</div>
            {topK.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-2 text-xs"
              >
                <span className="w-4 text-right font-mono text-muted-foreground">{i + 1}</span>
                <span className="font-bold" style={{ color: HIGHLIGHT_COLOR }}>{doc.label}</span>
                <span className="flex-1" />
                <span className="font-mono text-muted-foreground">d={doc.distance.toFixed(2)}</span>
                <span className="font-mono text-emerald-400">s={doc.similarity.toFixed(3)}</span>
              </motion.div>
            ))}
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-1">
            <div className="text-xs uppercase font-bold text-muted-foreground">Stats</div>
            <div className="text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total docs</span>
                <span>{DOCUMENTS.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Search radius</span>
                <span className="text-emerald-400">{maxDistance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Best similarity</span>
                <span className="text-emerald-400">{topK[0]?.similarity.toFixed(3) || '-'}</span>
              </div>
            </div>
          </div>

          <div className="mt-auto bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg">
            <p className="text-xs text-rose-300 leading-relaxed italic">
              {k <= 3
                ? "Low k returns precise results but risks missing relevant documents further away."
                : k >= 8
                  ? "High k casts a wider net, trading precision for recall. Reranking can filter the noise."
                  : "Drag the query point to search different regions of the embedding space. The dashed circle shows the search radius."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
