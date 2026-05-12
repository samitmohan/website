'use client'

import { useState, useMemo } from 'react'

export default function LinearAlgebraViz() {
  const [matrix, setMatrix] = useState([[1, 0.5], [0, 1]])

  const updateCell = (r: number, c: number, val: string) => {
    const num = parseFloat(val)
    if (isNaN(num)) return
    const m = matrix.map(row => [...row])
    m[r][c] = num
    setMatrix(m)
  }

  const transform = (x: number, y: number): [number, number] => {
    return [matrix[0][0] * x + matrix[0][1] * y, matrix[1][0] * x + matrix[1][1] * y]
  }

  const eigens = useMemo(() => {
    const [[a, b], [c, d]] = matrix
    const trace = a + d, det = a * d - b * c, disc = trace * trace - 4 * det
    if (disc < 0) return []
    const sq = Math.sqrt(disc)
    return [(trace + sq) / 2, (trace - sq) / 2].map(l => {
      let vx = Math.abs(b) > 1e-10 ? b : Math.abs(c) > 1e-10 ? l - d : 1
      let vy = Math.abs(b) > 1e-10 ? l - a : Math.abs(c) > 1e-10 ? c : 0
      const mag = Math.sqrt(vx * vx + vy * vy)
      if (mag > 1e-10) { vx /= mag; vy /= mag }
      return { value: l, vector: [vx, vy] as [number, number] }
    })
  }, [matrix])

  // Unit square corners
  const unitSquare: [number, number][] = [[0, 0], [1, 0], [1, 1], [0, 1]]
  const transformed = unitSquare.map(([x, y]) => transform(x, y))

  // SVG coordinate system: center at (200, 200), scale 60px per unit
  const cx = 200, cy = 200, scale = 60
  const toSVG = (x: number, y: number): [number, number] => [cx + x * scale, cy - y * scale]

  const gridLines: { x1: number; y1: number; x2: number; y2: number }[] = []
  for (let i = -3; i <= 3; i++) {
    const [x1, y1] = toSVG(-3, i)
    const [x2, y2] = toSVG(3, i)
    gridLines.push({ x1, y1, x2, y2 })
    const [x3, y3] = toSVG(i, -3)
    const [x4, y4] = toSVG(i, 3)
    gridLines.push({ x1: x3, y1: y3, x2: x4, y2: y4 })
  }

  const presets = [
    { label: 'Identity', m: [[1, 0], [0, 1]] },
    { label: 'Shear', m: [[1, 0.5], [0, 1]] },
    { label: 'Rotate 45', m: [[0.707, -0.707], [0.707, 0.707]] },
    { label: 'Scale 2x', m: [[2, 0], [0, 2]] },
    { label: 'Reflect Y', m: [[-1, 0], [0, 1]] },
  ]

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-purple-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16v16H4z" /><path d="M4 12h16M12 4v16" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Linear Transformation</h3>
          <p className="text-xs text-muted-foreground">2x2 matrix applied to unit square - watch how space deforms</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 flex justify-center">
          <svg viewBox="0 0 400 400" className="w-full h-auto max-w-md">
            {/* Grid */}
            {gridLines.map((l, i) => (
              <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
            ))}
            {/* Axes */}
            <line x1={cx} y1={20} x2={cx} y2={380} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <line x1={20} y1={cy} x2={380} y2={cy} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

            {/* Original unit square */}
            <polygon
              points={unitSquare.map(([x, y]) => toSVG(x, y).join(',')).join(' ')}
              fill="rgba(129,140,248,0.1)" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="4,3"
            />

            {/* Transformed shape */}
            <polygon
              points={transformed.map(([x, y]) => toSVG(x, y).join(',')).join(' ')}
              fill="rgba(236,72,153,0.12)" stroke="#ec4899" strokeWidth="2"
              style={{ transition: 'all 0.4s ease' }}
            />

            {/* Transformed corners */}
            {transformed.map(([x, y], i) => {
              const [sx, sy] = toSVG(x, y)
              return <circle key={i} cx={sx} cy={sy} r="4" fill="#ec4899" style={{ transition: 'all 0.4s ease' }} />
            })}

            {/* Eigenvectors */}
            {eigens.map((eig, i) => {
              const [vx, vy] = eig.vector
              const len = Math.min(Math.abs(eig.value) * 1.5, 3)
              const [x1, y1] = toSVG(0, 0)
              const [x2, y2] = toSVG(vx * len, vy * len)
              return (
                <g key={i} style={{ transition: 'all 0.4s ease' }}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={i === 0 ? '#fbbf24' : '#34d399'} strokeWidth="2" />
                  <circle cx={x2} cy={y2} r="3" fill={i === 0 ? '#fbbf24' : '#34d399'} />
                  <text x={x2 + 8} y={y2 - 4} fill={i === 0 ? '#fbbf24' : '#34d399'} fontSize="10" fontFamily="monospace">
                    l={eig.value.toFixed(2)}
                  </text>
                </g>
              )
            })}

            {/* Labels */}
            <text x={cx + 5} y={30} fill="rgba(255,255,255,0.3)" fontSize="10">y</text>
            <text x={370} y={cy - 5} fill="rgba(255,255,255,0.3)" fontSize="10">x</text>
          </svg>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          {/* Matrix input */}
          <div>
            <div className="text-xs uppercase font-bold text-muted-foreground mb-2">Transformation Matrix</div>
            <div className="grid grid-cols-2 gap-1.5">
              {matrix.map((row, r) => row.map((val, c) => (
                <input
                  key={`${r}-${c}`}
                  type="number"
                  step="0.1"
                  value={val}
                  onChange={e => updateCell(r, c, e.target.value)}
                  className="bg-muted border border-border rounded-lg px-2 py-1.5 text-sm font-mono text-center text-foreground focus:border-purple-500 focus:outline-none w-full"
                />
              )))}
            </div>
          </div>

          {/* Presets */}
          <div className="space-y-1">
            <div className="text-xs uppercase font-bold text-muted-foreground">Presets</div>
            <div className="flex flex-wrap gap-1">
              {presets.map(p => (
                <button
                  key={p.label}
                  onClick={() => setMatrix(p.m)}
                  className="text-sm px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Eigenvector info */}
          <div className="bg-muted border border-border p-3 rounded-xl space-y-1">
            <div className="text-xs uppercase font-bold text-muted-foreground">Eigenvalues</div>
            {eigens.length > 0 ? eigens.map((eig, i) => (
              <div key={i} className="text-xs font-mono">
                <span style={{ color: i === 0 ? '#fbbf24' : '#34d399' }}>l{i + 1}={eig.value.toFixed(3)}</span>
                <span className="text-muted-foreground ml-2">v=[{eig.vector[0].toFixed(2)}, {eig.vector[1].toFixed(2)}]</span>
              </div>
            )) : <div className="text-xs text-muted-foreground">Complex eigenvalues (rotation)</div>}
            <div className="text-xs font-mono text-muted-foreground mt-1">
              det = {(matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]).toFixed(3)}
            </div>
          </div>

          <div className="mt-auto bg-purple-500/5 border border-purple-500/10 p-3 rounded-lg">
            <p className="text-xs text-purple-300 leading-relaxed italic">
              Dashed blue = original unit square. Pink = transformed shape. Colored arrows = eigenvectors (directions unchanged by the transform, only scaled by eigenvalue).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
