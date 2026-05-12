'use client'

import { useState } from 'react'

const BASE_THETA = 10000

function getRotationAngle(position: number, dimPair: number, numDims: number) {
  const theta = 1 / Math.pow(BASE_THETA, (2 * dimPair) / numDims)
  return position * theta
}

export default function RotaryEmbeddingViz() {
  const [position, setPosition] = useState(3)
  const [comparePos, setComparePos] = useState(7)
  const [selectedPair, setSelectedPair] = useState(0)

  const numDimPairs = 4
  const cx = 120
  const cy = 120
  const radius = 80

  const angle = getRotationAngle(position, selectedPair, numDimPairs * 2)
  const angleCmp = getRotationAngle(comparePos, selectedPair, numDimPairs * 2)
  const relAngle = getRotationAngle(comparePos - position, selectedPair, numDimPairs * 2)

  const toX = (a: number, r: number) => cx + Math.cos(a) * r
  const toY = (a: number, r: number) => cy - Math.sin(a) * r

  // Original vector before rotation (unit vector at angle 0)
  const origX = 0.7
  const origY = 0.5

  // After rotation
  const rotX = (pos: number) => {
    const a = getRotationAngle(pos, selectedPair, numDimPairs * 2)
    return origX * Math.cos(a) - origY * Math.sin(a)
  }
  const rotY = (pos: number) => {
    const a = getRotationAngle(pos, selectedPair, numDimPairs * 2)
    return origX * Math.sin(a) + origY * Math.cos(a)
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-rose-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-rose-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 3v9l6 3" /></svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Rotary Position Embeddings (RoPE)</h3>
          <p className="text-xs text-muted-foreground">Position-dependent rotation of embedding dimension pairs</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Controls */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">Position: {position}</label>
            <input type="range" min={0} max={15} value={position} onChange={e => setPosition(+e.target.value)} className="w-full accent-rose-500" />
          </div>
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">Compare Position: {comparePos}</label>
            <input type="range" min={0} max={15} value={comparePos} onChange={e => setComparePos(+e.target.value)} className="w-full accent-cyan-500" />
          </div>
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">Dimension Pair</label>
            <div className="flex gap-1">
              {Array.from({ length: numDimPairs }, (_, i) => (
                <button key={i} onClick={() => setSelectedPair(i)} className={`flex-1 px-1 py-1 text-sm font-mono rounded border transition-all ${selectedPair === i ? 'bg-rose-500/30 border-rose-500/50 text-rose-200' : 'bg-muted border-border text-muted-foreground hover:border-rose-500/30'}`}>
                  d{i * 2},{i * 2 + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Rotation circle */}
          <div className="flex-1">
            <div className="text-sm uppercase font-bold text-muted-foreground mb-1">Rotation for dim pair ({selectedPair * 2}, {selectedPair * 2 + 1})</div>
            <svg viewBox="0 0 240 240" className="w-full">
              {/* Circle */}
              <circle cx={cx} cy={cy} r={radius} fill="none" className="stroke-border" strokeWidth="1" />
              <line x1={cx - radius - 10} y1={cy} x2={cx + radius + 10} y2={cy} className="stroke-border" strokeWidth="0.5" />
              <line x1={cx} y1={cy - radius - 10} x2={cx} y2={cy + radius + 10} className="stroke-border" strokeWidth="0.5" />

              {/* Original vector (gray, dashed) */}
              <line x1={cx} y1={cy} x2={cx + origX * 60} y2={cy - origY * 60} stroke="#6b7280" strokeWidth="1" strokeDasharray="3 2" />
              <circle cx={cx + origX * 60} cy={cy - origY * 60} r={3} fill="#6b7280" />
              <text x={cx + origX * 60 + 8} y={cy - origY * 60 - 5} className="fill-gray-400 text-[7px]">original</text>

              {/* Position A rotation */}
              <line x1={cx} y1={cy} x2={cx + rotX(position) * 60} y2={cy - rotY(position) * 60} stroke="#f43f5e" strokeWidth="2" />
              <circle cx={cx + rotX(position) * 60} cy={cy - rotY(position) * 60} r={4} fill="#f43f5e" />
              <text x={cx + rotX(position) * 60 + 8} y={cy - rotY(position) * 60} className="fill-rose-300 text-[7px] font-bold">pos {position}</text>

              {/* Position B rotation */}
              <line x1={cx} y1={cy} x2={cx + rotX(comparePos) * 60} y2={cy - rotY(comparePos) * 60} stroke="#06b6d4" strokeWidth="2" />
              <circle cx={cx + rotX(comparePos) * 60} cy={cy - rotY(comparePos) * 60} r={4} fill="#06b6d4" />
              <text x={cx + rotX(comparePos) * 60 + 8} y={cy - rotY(comparePos) * 60} className="fill-cyan-300 text-[7px] font-bold">pos {comparePos}</text>

              {/* Arc showing rotation angle for pos A */}
              <path d={`M ${cx + 30} ${cy} A 30 30 0 ${angle > Math.PI ? 1 : 0} 0 ${cx + Math.cos(angle) * 30} ${cy - Math.sin(angle) * 30}`} fill="none" stroke="#f43f5e" strokeWidth="1" strokeDasharray="2 1" />

              {/* Angle labels */}
              <text x={cx} y={cy + radius + 20} textAnchor="middle" className="fill-muted-foreground text-[7px] font-mono">
                theta = {(angle * 180 / Math.PI).toFixed(1)} deg (pos {position})
              </text>
            </svg>
          </div>

          {/* All dimension pairs table */}
          <div className="flex-1">
            <div className="text-sm uppercase font-bold text-muted-foreground mb-1">Rotation angles per dimension pair</div>
            <div className="space-y-1">
              <div className="flex gap-1 text-[8px] font-mono text-muted-foreground">
                <div className="w-16">Pair</div>
                <div className="flex-1 text-center">Pos {position}</div>
                <div className="flex-1 text-center">Pos {comparePos}</div>
                <div className="flex-1 text-center">Relative</div>
              </div>
              {Array.from({ length: numDimPairs }, (_, pair) => {
                const a1 = getRotationAngle(position, pair, numDimPairs * 2)
                const a2 = getRotationAngle(comparePos, pair, numDimPairs * 2)
                const rel = getRotationAngle(comparePos - position, pair, numDimPairs * 2)
                const isSelected = pair === selectedPair
                return (
                  <button key={pair} onClick={() => setSelectedPair(pair)} className={`flex gap-1 w-full text-sm font-mono px-2 py-1.5 rounded border transition-all ${isSelected ? 'bg-rose-500/20 border-rose-500/40 text-rose-200' : 'bg-muted/30 border-border text-muted-foreground hover:border-rose-500/30'}`}>
                    <div className="w-16 text-left">d{pair * 2},{pair * 2 + 1}</div>
                    <div className="flex-1 text-center text-rose-300">{(a1 * 180 / Math.PI).toFixed(1)} deg</div>
                    <div className="flex-1 text-center text-cyan-300">{(a2 * 180 / Math.PI).toFixed(1)} deg</div>
                    <div className="flex-1 text-center text-amber-300">{(rel * 180 / Math.PI).toFixed(1)} deg</div>
                  </button>
                )
              })}
            </div>

            <div className="mt-3 p-2 bg-amber-500/5 border border-amber-500/10 rounded">
              <div className="text-sm text-amber-300 font-mono">
                Relative angle (pos {comparePos} - pos {position} = {comparePos - position}):
                <br />
                {(relAngle * 180 / Math.PI).toFixed(1)} deg for pair ({selectedPair * 2}, {selectedPair * 2 + 1})
              </div>
            </div>
          </div>
        </div>

        {/* Rotation matrix */}
        <div>
          <div className="text-sm uppercase font-bold text-muted-foreground mb-1">Rotation Matrix (pair {selectedPair})</div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-muted-foreground">[</span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-center">
              <span className="text-rose-300">cos({(angle * 180 / Math.PI).toFixed(0)} deg) = {Math.cos(angle).toFixed(3)}</span>
              <span className="text-cyan-300">-sin({(angle * 180 / Math.PI).toFixed(0)} deg) = {(-Math.sin(angle)).toFixed(3)}</span>
              <span className="text-cyan-300">sin({(angle * 180 / Math.PI).toFixed(0)} deg) = {Math.sin(angle).toFixed(3)}</span>
              <span className="text-rose-300">cos({(angle * 180 / Math.PI).toFixed(0)} deg) = {Math.cos(angle).toFixed(3)}</span>
            </div>
            <span className="text-muted-foreground">]</span>
          </div>
        </div>

        <div className="bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg">
          <div className="text-xs text-rose-300 leading-relaxed">
            <span className="font-bold">Key property:</span> The dot product between two rotated vectors depends only on the <span className="text-amber-300 font-bold">relative position</span> (difference), not absolute positions. Lower dimension pairs rotate faster (higher frequency), higher pairs rotate slower. This gives the model both fine and coarse position signals.
          </div>
        </div>
      </div>
    </div>
  )
}
