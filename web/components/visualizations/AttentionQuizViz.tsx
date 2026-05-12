'use client'

import { useState } from 'react'

const SENTENCE = ['The', 'cat', 'sat', 'on', 'it', 'because']

// Attention weights: each row is what that token attends to
// Designed to show "it" (index 4) attending to "cat" (index 1)
const ATTENTION: number[][] = [
  [0.45, 0.10, 0.10, 0.10, 0.15, 0.10], // The
  [0.08, 0.50, 0.15, 0.07, 0.10, 0.10], // cat
  [0.05, 0.30, 0.40, 0.10, 0.05, 0.10], // sat
  [0.05, 0.08, 0.25, 0.35, 0.12, 0.15], // on
  [0.05, 0.55, 0.10, 0.05, 0.15, 0.10], // it -> cat (coreference)
  [0.03, 0.15, 0.20, 0.07, 0.25, 0.30], // because
]

export default function AttentionQuizViz() {
  const [selectedWord, setSelectedWord] = useState(4) // default to "it"
  const [showHint, setShowHint] = useState(false)

  const maxWeight = Math.max(...ATTENTION[selectedWord])
  const cellSize = 48

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-teal-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-teal-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Attention Weights Explorer</h3>
          <p className="text-xs text-muted-foreground">Click a word to see what it attends to - notice how "it" resolves to "cat"</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 space-y-4">
          {/* Sentence with clickable words */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-sm uppercase font-bold text-muted-foreground mr-2">Sentence:</span>
            {SENTENCE.map((word, i) => {
              const isSelected = i === selectedWord
              const attendedWeight = ATTENTION[selectedWord][i]
              return (
                <button
                  key={i}
                  onClick={() => setSelectedWord(i)}
                  className="px-2.5 py-1.5 rounded-lg text-sm font-mono transition-all duration-300 border"
                  style={{
                    borderColor: isSelected ? '#2dd4bf88' : `rgba(45,212,191,${attendedWeight * 0.6})`,
                    backgroundColor: isSelected ? 'rgba(45,212,191,0.15)' : `rgba(45,212,191,${attendedWeight * 0.12})`,
                    color: isSelected ? '#2dd4bf' : attendedWeight > 0.3 ? '#5eead4' : 'rgba(255,255,255,0.5)',
                    fontWeight: isSelected ? 'bold' : attendedWeight === maxWeight ? '600' : 'normal',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  {word}
                </button>
              )
            })}
          </div>

          {/* Attention heatmap grid */}
          <div className="overflow-x-auto">
            <div className="text-sm uppercase font-bold text-muted-foreground mb-2">Full Attention Matrix</div>
            <svg viewBox={`0 0 ${36 + SENTENCE.length * cellSize} ${36 + SENTENCE.length * cellSize}`} className="w-full h-auto max-w-sm">
              {/* Column labels */}
              {SENTENCE.map((word, i) => (
                <text key={`col-${i}`} x={36 + i * cellSize + cellSize / 2} y={28} textAnchor="middle" fill="currentColor" fillOpacity={selectedWord === i ? 1 : 0.4} fontSize="10" fontWeight={selectedWord === i ? 'bold' : 'normal'}>
                  {word}
                </text>
              ))}
              {/* Row labels */}
              {SENTENCE.map((word, i) => (
                <text key={`row-${i}`} x={32} y={36 + i * cellSize + cellSize / 2 + 4} textAnchor="end" fill="currentColor" fillOpacity={selectedWord === i ? 1 : 0.4} fontSize="10" fontWeight={selectedWord === i ? 'bold' : 'normal'}>
                  {word}
                </text>
              ))}
              {/* Cells */}
              {ATTENTION.map((row, qi) =>
                row.map((w, ki) => {
                  const isSelectedRow = qi === selectedWord
                  return (
                    <g key={`${qi}-${ki}`}>
                      <rect
                        x={36 + ki * cellSize} y={36 + qi * cellSize}
                        width={cellSize} height={cellSize}
                        fill={`rgba(45, 212, 191, ${w * (isSelectedRow ? 1 : 0.5)})`}
                        stroke={isSelectedRow && w === maxWeight ? '#2dd4bf' : 'rgba(255,255,255,0.05)'}
                        strokeWidth={isSelectedRow && w === maxWeight ? 2 : 0.5}
                        onClick={() => setSelectedWord(qi)}
                        className="cursor-pointer"
                        style={{ transition: 'fill 0.3s' }}
                      />
                      <text
                        x={36 + ki * cellSize + cellSize / 2}
                        y={36 + qi * cellSize + cellSize / 2 + 4}
                        textAnchor="middle" fill="currentColor"
                        fillOpacity={w > 0.2 ? 0.9 : 0.3}
                        fontSize="9" fontFamily="monospace"
                        pointerEvents="none"
                      >
                        {w.toFixed(2)}
                      </text>
                    </g>
                  )
                })
              )}
            </svg>
          </div>

          {/* Attention distribution for selected word */}
          <div className="space-y-1.5">
            <div className="text-sm uppercase font-bold text-muted-foreground">
              "{SENTENCE[selectedWord]}" attends to:
            </div>
            {SENTENCE.map((word, i) => {
              const w = ATTENTION[selectedWord][i]
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-mono w-16" style={{ color: w === maxWeight ? '#2dd4bf' : 'rgba(255,255,255,0.5)' }}>{word}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${w * 100}%`, backgroundColor: `rgba(45,212,191,${0.3 + w * 0.7})` }} />
                  </div>
                  <span className="text-xs font-mono w-8 text-right" style={{ color: w === maxWeight ? '#2dd4bf' : 'rgba(255,255,255,0.4)' }}>{w.toFixed(2)}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <button
            onClick={() => setShowHint(!showHint)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition ${showHint ? 'bg-teal-500/20 border-teal-500/40 text-teal-300' : 'border-border text-muted-foreground hover:text-foreground'}`}
          >
            {showHint ? 'Hide Insight' : 'Show Insight'}
          </button>

          {showHint && (
            <div className="bg-teal-500/5 border border-teal-500/20 rounded-lg p-3 transition-all duration-300">
              <div className="text-xs text-teal-300 leading-relaxed">
                <span className="font-bold">Coreference resolution:</span> "it" (position 4) attends most to "cat" (position 1) with weight 0.55.
                The model learned that "it" refers to "cat" through attention patterns, without explicit coreference training.
              </div>
            </div>
          )}

          <div className="bg-muted border border-border p-3 rounded-xl space-y-1">
            <div className="text-xs uppercase font-bold text-muted-foreground">Selected</div>
            <div className="text-lg font-mono font-bold text-teal-400">"{SENTENCE[selectedWord]}"</div>
            <div className="text-xs text-muted-foreground">Position {selectedWord}</div>
            <div className="text-xs text-muted-foreground">
              Max attention: "{SENTENCE[ATTENTION[selectedWord].indexOf(maxWeight)]}" ({maxWeight.toFixed(2)})
            </div>
          </div>

          <div className="mt-auto bg-teal-500/5 border border-teal-500/10 p-3 rounded-lg">
            <p className="text-xs text-teal-300 leading-relaxed italic">
              Attention weights show how much each token considers other tokens when computing its representation. Rows sum to 1 (softmax). Brighter cells indicate stronger attention.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
