'use client'

import { useState } from 'react'

const SENTENCE = ['the', 'king', 'sat', 'on', 'the', 'golden', 'throne', 'with', 'the', 'queen']

const EMBEDDINGS: Record<string, [number, number]> = {
  king: [0.7, 0.8], queen: [0.75, 0.72], throne: [0.65, 0.6],
  golden: [0.5, 0.55], sat: [0.2, 0.3], on: [0.1, 0.15],
  the: [0.05, 0.1], with: [0.12, 0.22],
  prince: [0.72, 0.68], princess: [0.76, 0.65],
  castle: [0.6, 0.5], crown: [0.62, 0.58],
  man: [0.55, 0.75], woman: [0.58, 0.7],
}

const NEIGHBORS: Record<string, string[]> = {
  king: ['queen', 'prince', 'throne', 'crown'],
  queen: ['king', 'princess', 'throne', 'crown'],
  throne: ['king', 'queen', 'castle', 'golden'],
  golden: ['crown', 'throne', 'castle'],
  sat: ['on', 'with'],
  on: ['sat', 'with', 'the'],
  the: ['on', 'with'],
  with: ['on', 'sat', 'the'],
}

export default function Word2VecViz() {
  const [centerIdx, setCenterIdx] = useState(1)
  const [windowSize, setWindowSize] = useState(2)
  const [selectedWord, setSelectedWord] = useState<string | null>(null)

  const contextStart = Math.max(0, centerIdx - windowSize)
  const contextEnd = Math.min(SENTENCE.length - 1, centerIdx + windowSize)

  const scaleX = (v: number) => 40 + v * 280
  const scaleY = (v: number) => 20 + (1 - v) * 160

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-blue-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v12M6 12h12" /></svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Word2Vec Skip-gram</h3>
          <p className="text-xs text-muted-foreground">Center word predicts context words</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Controls */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">Center Word Position: {centerIdx}</label>
            <input type="range" min={0} max={SENTENCE.length - 1} value={centerIdx} onChange={e => setCenterIdx(+e.target.value)} className="w-full accent-blue-500" />
          </div>
          <div className="flex-1">
            <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">Window Size: {windowSize}</label>
            <input type="range" min={1} max={4} value={windowSize} onChange={e => setWindowSize(+e.target.value)} className="w-full accent-blue-500" />
          </div>
        </div>

        {/* Sentence with context window */}
        <div>
          <label className="text-xs uppercase font-bold text-muted-foreground mb-2 block">Sentence</label>
          <div className="flex flex-wrap gap-1">
            {SENTENCE.map((word, i) => {
              const isCenter = i === centerIdx
              const isContext = !isCenter && i >= contextStart && i <= contextEnd
              return (
                <span key={i} className={`text-sm font-mono px-2 py-1 rounded border cursor-pointer transition-all ${isCenter ? 'bg-blue-500/30 text-blue-200 border-blue-500/50 ring-2 ring-blue-400/30' : isContext ? 'bg-emerald-500/25 text-emerald-200 border-emerald-500/40' : 'bg-muted/50 border-border text-muted-foreground'}`} onClick={() => setCenterIdx(i)}>
                  {word}
                </span>
              )
            })}
          </div>
        </div>

        {/* Arrows from center to context */}
        <svg viewBox="0 0 400 50" className="w-full h-12">
          {SENTENCE.map((_, i) => {
            if (i === centerIdx || i < contextStart || i > contextEnd) return null
            const cx = (centerIdx / (SENTENCE.length - 1)) * 360 + 20
            const tx = (i / (SENTENCE.length - 1)) * 360 + 20
            return (
              <g key={i}>
                <line x1={cx} y1={20} x2={tx} y2={40} stroke="#34d399" strokeWidth="1.5" strokeDasharray="4 2" />
                <circle cx={tx} cy={40} r="3" fill="#34d399" />
              </g>
            )
          })}
          <circle cx={(centerIdx / (SENTENCE.length - 1)) * 360 + 20} cy={20} r="4" fill="#60a5fa" />
          <text x={(centerIdx / (SENTENCE.length - 1)) * 360 + 20} y={14} textAnchor="middle" className="fill-blue-300 text-[8px]">center</text>
        </svg>

        {/* 2D Embedding Space */}
        <div>
          <label className="text-xs uppercase font-bold text-muted-foreground mb-2 block">2D Embedding Space (click a word)</label>
          <svg viewBox="0 0 360 200" className="w-full bg-muted/30 rounded-lg border border-border">
            {/* Grid */}
            {[0.25, 0.5, 0.75].map(v => (
              <g key={v}>
                <line x1={scaleX(v)} y1={20} x2={scaleX(v)} y2={180} stroke="currentColor" className="text-border" strokeWidth="0.5" />
                <line x1={40} y1={scaleY(v)} x2={320} y2={scaleY(v)} stroke="currentColor" className="text-border" strokeWidth="0.5" />
              </g>
            ))}
            {Object.entries(EMBEDDINGS).map(([word, [x, y]]) => {
              const isNeighbor = selectedWord && NEIGHBORS[selectedWord]?.includes(word)
              const isSelected = word === selectedWord
              return (
                <g key={word} onClick={() => setSelectedWord(word === selectedWord ? null : word)} className="cursor-pointer">
                  {isSelected && selectedWord && NEIGHBORS[selectedWord]?.map(n => {
                    const ne = EMBEDDINGS[n]
                    if (!ne) return null
                    return <line key={n} x1={scaleX(x)} y1={scaleY(y)} x2={scaleX(ne[0])} y2={scaleY(ne[1])} stroke="#60a5fa" strokeWidth="1" strokeDasharray="3 2" opacity={0.5} />
                  })}
                  <circle cx={scaleX(x)} cy={scaleY(y)} r={isSelected ? 7 : isNeighbor ? 6 : 4} fill={isSelected ? '#3b82f6' : isNeighbor ? '#34d399' : '#6b7280'} opacity={selectedWord && !isSelected && !isNeighbor ? 0.3 : 1} />
                  <text x={scaleX(x)} y={scaleY(y) - 10} textAnchor="middle" className={`text-[7px] ${isSelected ? 'fill-blue-300' : isNeighbor ? 'fill-emerald-300' : 'fill-muted-foreground'}`} opacity={selectedWord && !isSelected && !isNeighbor ? 0.3 : 1}>
                    {word}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {selectedWord && NEIGHBORS[selectedWord] && (
          <div className="bg-blue-500/5 border border-blue-500/10 p-3 rounded-lg">
            <div className="text-xs text-blue-300 leading-relaxed">
              <span className="font-bold">Nearest neighbors of "{selectedWord}":</span>{' '}
              {NEIGHBORS[selectedWord].join(', ')}
            </div>
          </div>
        )}

        <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg">
          <div className="text-xs text-emerald-300 leading-relaxed">
            <span className="font-bold">Skip-gram objective:</span> The center word (blue) learns to predict context words (green) within the window. Words appearing in similar contexts cluster together in embedding space.
          </div>
        </div>
      </div>
    </div>
  )
}
