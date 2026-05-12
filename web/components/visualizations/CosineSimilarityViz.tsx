'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Crosshair } from 'lucide-react'

export default function CosineSimilarityViz() {
  const [vecA, setVecA] = useState({ x: 3, y: 4 })
  const [vecB, setVecB] = useState({ x: 4, y: -1 })
  const [dragging, setDragging] = useState<'a' | 'b' | null>(null)

  const W = 360
  const H = 360
  const cx = W / 2
  const cy = H / 2
  const scale = 30

  const toScreen = (x: number, y: number) => ({ sx: cx + x * scale, sy: cy - y * scale })
  const fromScreen = (sx: number, sy: number) => ({
    x: Math.round(((sx - cx) / scale) * 10) / 10,
    y: Math.round(((cy - sy) / scale) * 10) / 10,
  })

  const { dotProduct, magA, magB, cosine, angleDeg } = useMemo(() => {
    const dot = vecA.x * vecB.x + vecA.y * vecB.y
    const mA = Math.sqrt(vecA.x ** 2 + vecA.y ** 2)
    const mB = Math.sqrt(vecB.x ** 2 + vecB.y ** 2)
    const cos = mA > 0 && mB > 0 ? dot / (mA * mB) : 0
    const angle = Math.acos(Math.max(-1, Math.min(1, cos))) * (180 / Math.PI)
    return { dotProduct: dot, magA: mA, magB: mB, cosine: cos, angleDeg: angle }
  }, [vecA, vecB])

  const similarityColor = cosine > 0.5 ? '#34d399' : cosine > 0 ? '#facc15' : cosine > -0.5 ? '#fb923c' : '#f43f5e'

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging) return
    const svg = e.currentTarget
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const svgPt = pt.matrixTransform(svg.getScreenCTM()?.inverse())
    const vec = fromScreen(svgPt.x, svgPt.y)
    const clamped = { x: Math.max(-5, Math.min(5, vec.x)), y: Math.max(-5, Math.min(5, vec.y)) }
    if (dragging === 'a') setVecA(clamped)
    else setVecB(clamped)
  }

  const aScreen = toScreen(vecA.x, vecA.y)
  const bScreen = toScreen(vecB.x, vecB.y)

  // Arc for angle visualization
  const arcRadius = 40
  const angleA = Math.atan2(vecA.y, vecA.x)
  const angleB = Math.atan2(vecB.y, vecB.x)
  const startAngle = Math.min(angleA, angleB)
  const endAngle = Math.max(angleA, angleB)
  const arcStart = { x: cx + arcRadius * Math.cos(-startAngle), y: cy + arcRadius * Math.sin(-startAngle) }
  const arcEnd = { x: cx + arcRadius * Math.cos(-endAngle), y: cy + arcRadius * Math.sin(-endAngle) }
  const largeArc = (endAngle - startAngle) > Math.PI ? 1 : 0

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-emerald-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-emerald-500/10 p-1.5 rounded-lg">
          <Crosshair className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-base font-bold">Cosine Similarity</h3>
          <p className="text-xs text-muted-foreground">Drag arrow endpoints to explore vector similarity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 flex justify-center">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto max-w-md cursor-crosshair"
            onPointerMove={handlePointerMove}
            onPointerUp={() => setDragging(null)}
            onPointerLeave={() => setDragging(null)}
          >
            {/* Grid */}
            {Array.from({ length: 11 }, (_, i) => i - 5).map((v) => (
              <g key={v}>
                <line x1={toScreen(v, -5).sx} y1={toScreen(v, -5).sy} x2={toScreen(v, 5).sx} y2={toScreen(v, 5).sy} stroke="currentColor" strokeOpacity={v === 0 ? 0.15 : 0.05} />
                <line x1={toScreen(-5, v).sx} y1={toScreen(-5, v).sy} x2={toScreen(5, v).sx} y2={toScreen(5, v).sy} stroke="currentColor" strokeOpacity={v === 0 ? 0.15 : 0.05} />
              </g>
            ))}

            {/* Angle arc */}
            {magA > 0.1 && magB > 0.1 && (
              <path
                d={`M ${arcStart.x} ${arcStart.y} A ${arcRadius} ${arcRadius} 0 ${largeArc} 0 ${arcEnd.x} ${arcEnd.y}`}
                fill="none"
                stroke={similarityColor}
                strokeWidth={1.5}
                strokeOpacity={0.5}
                strokeDasharray="4,3"
              />
            )}

            {/* Vector A */}
            <line x1={cx} y1={cy} x2={aScreen.sx} y2={aScreen.sy} stroke="#6366f1" strokeWidth={2.5} />
            <polygon
              points={`${aScreen.sx},${aScreen.sy - 5} ${aScreen.sx - 4},${aScreen.sy + 3} ${aScreen.sx + 4},${aScreen.sy + 3}`}
              fill="#6366f1"
              transform={`rotate(${-Math.atan2(vecA.y, vecA.x) * 180 / Math.PI + 90}, ${aScreen.sx}, ${aScreen.sy})`}
            />
            <circle
              cx={aScreen.sx}
              cy={aScreen.sy}
              r={8}
              fill="#6366f1"
              fillOpacity={0.3}
              stroke="#6366f1"
              strokeWidth={2}
              className="cursor-grab"
              onPointerDown={(e) => { e.stopPropagation(); setDragging('a') }}
            />
            <text x={aScreen.sx + 10} y={aScreen.sy - 6} fill="#6366f1" fontSize={10} fontWeight="bold">A</text>

            {/* Vector B */}
            <line x1={cx} y1={cy} x2={bScreen.sx} y2={bScreen.sy} stroke="#f43f5e" strokeWidth={2.5} />
            <polygon
              points={`${bScreen.sx},${bScreen.sy - 5} ${bScreen.sx - 4},${bScreen.sy + 3} ${bScreen.sx + 4},${bScreen.sy + 3}`}
              fill="#f43f5e"
              transform={`rotate(${-Math.atan2(vecB.y, vecB.x) * 180 / Math.PI + 90}, ${bScreen.sx}, ${bScreen.sy})`}
            />
            <circle
              cx={bScreen.sx}
              cy={bScreen.sy}
              r={8}
              fill="#f43f5e"
              fillOpacity={0.3}
              stroke="#f43f5e"
              strokeWidth={2}
              className="cursor-grab"
              onPointerDown={(e) => { e.stopPropagation(); setDragging('b') }}
            />
            <text x={bScreen.sx + 10} y={bScreen.sy - 6} fill="#f43f5e" fontSize={10} fontWeight="bold">B</text>

            {/* Origin */}
            <circle cx={cx} cy={cy} r={3} fill="currentColor" fillOpacity={0.4} />

            {/* Angle label */}
            {magA > 0.1 && magB > 0.1 && (
              <text
                x={cx + (arcRadius + 14) * Math.cos(-(startAngle + endAngle) / 2)}
                y={cy + (arcRadius + 14) * Math.sin(-(startAngle + endAngle) / 2)}
                fill={similarityColor}
                fontSize={10}
                fontWeight="bold"
                textAnchor="middle"
              >
                {angleDeg.toFixed(1)}
              </text>
            )}
          </svg>
        </div>

        {/* Dashboard */}
        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div className="bg-muted border border-border p-2.5 rounded-xl flex items-center justify-between">
            <div>
              <h4 className="text-xs uppercase font-bold text-muted-foreground leading-none mb-0.5">Cosine Similarity</h4>
              <p className="text-xs text-muted-foreground">Range: [-1, 1]</p>
            </div>
            <motion.span
              className="text-xl font-mono font-bold px-2"
              style={{ color: similarityColor }}
              animate={{ color: similarityColor }}
            >
              {cosine.toFixed(3)}
            </motion.span>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-2">
            <div className="text-xs uppercase font-bold text-muted-foreground">Formula Breakdown</div>
            <div className="text-xs font-mono space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">A . B</span>
                <span>({vecA.x}*{vecB.x}) + ({vecA.y}*{vecB.y}) = <span className="text-emerald-400">{dotProduct.toFixed(1)}</span></span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">||A||</span>
                <span className="text-indigo-400">{magA.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">||B||</span>
                <span className="text-rose-400">{magB.toFixed(3)}</span>
              </div>
              <div className="border-t border-border pt-1 flex justify-between">
                <span className="text-muted-foreground">cos(theta)</span>
                <span style={{ color: similarityColor }}>{cosine.toFixed(3)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted border border-border p-2 rounded-xl">
              <div className="text-xs uppercase font-bold text-muted-foreground">Angle</div>
              <div className="text-sm font-mono font-bold" style={{ color: similarityColor }}>{angleDeg.toFixed(1)}</div>
            </div>
            <div className="bg-muted border border-border p-2 rounded-xl">
              <div className="text-xs uppercase font-bold text-muted-foreground">Dot Product</div>
              <div className="text-sm font-mono font-bold text-emerald-400">{dotProduct.toFixed(1)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-2 rounded-xl">
              <div className="text-xs font-bold text-indigo-400">A = [{vecA.x}, {vecA.y}]</div>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl">
              <div className="text-xs font-bold text-rose-400">B = [{vecB.x}, {vecB.y}]</div>
            </div>
          </div>

          <div className="mt-auto bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg">
            <p className="text-xs text-emerald-300 leading-relaxed italic">
              {cosine > 0.8
                ? "Vectors point in similar directions. High similarity used in retrieval and recommendation."
                : cosine < -0.5
                  ? "Vectors point in opposite directions. Negative cosine means semantic opposition."
                  : "Cosine similarity measures directional alignment, ignoring magnitude."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
