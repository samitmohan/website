'use client'

import { useState, useMemo } from 'react'

const SOURCE_TEXT = `Artificial intelligence has transformed how we process information. Machine learning models learn patterns from data without explicit programming. Deep learning, a subset of ML, uses neural networks with many layers. These networks excel at tasks like image recognition and natural language processing. Transformers revolutionized NLP by introducing self-attention mechanisms. Models like GPT and BERT process text by attending to all positions simultaneously. This parallel processing makes transformers faster to train than recurrent networks. Retrieval-augmented generation combines search with language models for grounded answers.`

const SENTENCES = [
  'Artificial intelligence has transformed how we process information.',
  'Machine learning models learn patterns from data without explicit programming.',
  'Deep learning, a subset of ML, uses neural networks with many layers.',
  'These networks excel at tasks like image recognition and natural language processing.',
  'Transformers revolutionized NLP by introducing self-attention mechanisms.',
  'Models like GPT and BERT process text by attending to all positions simultaneously.',
  'This parallel processing makes transformers faster to train than recurrent networks.',
  'Retrieval-augmented generation combines search with language models for grounded answers.',
]

const CHUNK_COLORS = ['#6366f1', '#f43f5e', '#f59e0b', '#34d399', '#ec4899', '#8b5cf6', '#38bdf8', '#fb923c']

type ChunkMode = 'fixed' | 'sentence' | 'recursive'

export default function ChunkingViz() {
  const [mode, setMode] = useState<ChunkMode>('fixed')
  const [chunkSize, setChunkSize] = useState(120)
  const [overlap, setOverlap] = useState(20)

  const chunks = useMemo(() => {
    if (mode === 'fixed') {
      const result: { text: string; start: number; end: number }[] = []
      let pos = 0
      while (pos < SOURCE_TEXT.length) {
        const end = Math.min(pos + chunkSize, SOURCE_TEXT.length)
        result.push({ text: SOURCE_TEXT.slice(pos, end), start: pos, end })
        pos = end - overlap
        if (pos >= SOURCE_TEXT.length) break
      }
      return result
    }

    if (mode === 'sentence') {
      let pos = 0
      return SENTENCES.map((sentence) => {
        const start = SOURCE_TEXT.indexOf(sentence, pos)
        const end = start + sentence.length
        pos = end
        return { text: sentence, start, end }
      })
    }

    // recursive
    const mid = 4
    const group1 = SENTENCES.slice(0, mid)
    const group2 = SENTENCES.slice(mid)
    const result: { text: string; start: number; end: number; group: number }[] = []
    let pos = 0
    group1.forEach((s) => {
      const start = SOURCE_TEXT.indexOf(s, pos)
      result.push({ text: s, start, end: start + s.length, group: 0 })
      pos = start + s.length
    })
    group2.forEach((s) => {
      const start = SOURCE_TEXT.indexOf(s, pos)
      result.push({ text: s, start, end: start + s.length, group: 1 })
      pos = start + s.length
    })
    return result
  }, [mode, chunkSize, overlap])

  const charColors = useMemo(() => {
    const colors: (string | null)[] = new Array(SOURCE_TEXT.length).fill(null)
    const overlapZones: boolean[] = new Array(SOURCE_TEXT.length).fill(false)

    if (mode === 'fixed') {
      let pos = 0
      let ci = 0
      while (pos < SOURCE_TEXT.length) {
        const end = Math.min(pos + chunkSize, SOURCE_TEXT.length)
        for (let i = pos; i < end; i++) {
          if (colors[i] !== null) overlapZones[i] = true
          colors[i] = CHUNK_COLORS[ci % CHUNK_COLORS.length]
        }
        ci++
        pos = end - overlap
        if (pos >= SOURCE_TEXT.length) break
      }
    } else {
      chunks.forEach((chunk, ci) => {
        for (let i = chunk.start; i < chunk.end; i++) {
          colors[i] = CHUNK_COLORS[ci % CHUNK_COLORS.length]
        }
      })
    }

    return { colors, overlapZones }
  }, [mode, chunks, chunkSize, overlap])

  const modes: { key: ChunkMode; label: string; desc: string }[] = [
    { key: 'fixed', label: 'Fixed-Size', desc: 'Split at character boundaries with configurable overlap' },
    { key: 'sentence', label: 'Sentence', desc: 'Split on sentence boundaries, preserving semantic completeness' },
    { key: 'recursive', label: 'Recursive', desc: 'Divide on paragraphs first, then split further if needed' },
  ]

  const avgChunkSize = chunks.length > 0 ? Math.round(chunks.reduce((s, c) => s + c.text.trim().length, 0) / chunks.length) : 0

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-3 border-b border-border/50 bg-muted/30 flex items-center gap-3">
        <div className="bg-pink-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-7 7m7-7l-7-7" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Document Chunking Strategies</h3>
          <p className="text-xs text-muted-foreground">How text gets split for embedding and retrieval</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 border-r border-border/50 p-4 flex flex-col gap-4">
          <div>
            <h4 className="text-xs uppercase font-bold text-muted-foreground mb-2">Chunked Document</h4>
            <div className="bg-muted/50 border border-border rounded-lg p-4 leading-relaxed font-mono text-xs">
              {SOURCE_TEXT.split('').map((char, i) => {
                const color = charColors.colors[i]
                const isOverlap = charColors.overlapZones[i]
                return (
                  <span
                    key={i}
                    style={{
                      backgroundColor: color ? `${color}${isOverlap ? '40' : '18'}` : 'transparent',
                      color: color || undefined,
                      borderBottom: isOverlap ? `2px solid ${color}88` : 'none',
                    }}
                  >
                    {char}
                  </span>
                )
              })}
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase font-bold text-muted-foreground mb-2">
              {chunks.length} Chunks Generated
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {chunks.map((chunk, i) => (
                <div
                  key={`${mode}-${i}`}
                  className="flex items-start gap-2 text-xs"
                >
                  <span
                    className="shrink-0 w-5 h-5 rounded flex items-center justify-center font-mono font-bold text-sm"
                    style={{ backgroundColor: `${CHUNK_COLORS[i % CHUNK_COLORS.length]}22`, color: CHUNK_COLORS[i % CHUNK_COLORS.length] }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground leading-relaxed line-clamp-2">
                    {chunk.text.trim().slice(0, 80)}{chunk.text.length > 80 ? '...' : ''}
                  </span>
                  <span className="shrink-0 text-sm font-mono text-muted-foreground/50">
                    {chunk.text.trim().length}ch
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 flex flex-col gap-4">
          <div className="space-y-2">
            <div className="text-xs uppercase font-bold text-muted-foreground">Strategy</div>
            <div className="flex flex-col gap-1.5">
              {modes.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition text-left ${
                    mode === m.key
                      ? 'bg-pink-500/20 border-pink-500/40 text-pink-300'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {mode === 'fixed' && (
            <>
              <div>
                <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">
                  Chunk Size: {chunkSize} chars
                </label>
                <input
                  type="range" min={60} max={250} step={10}
                  value={chunkSize}
                  onChange={(e) => setChunkSize(parseInt(e.target.value))}
                  className="w-full accent-pink-500"
                />
              </div>
              <div>
                <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">
                  Overlap: {overlap} chars
                </label>
                <input
                  type="range" min={0} max={60} step={5}
                  value={overlap}
                  onChange={(e) => setOverlap(parseInt(e.target.value))}
                  className="w-full accent-pink-500"
                />
              </div>
            </>
          )}

          <div className="bg-muted border border-border p-3 rounded-lg space-y-1.5">
            <div className="text-xs uppercase font-bold text-muted-foreground">Stats</div>
            <div className="text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total chars</span>
                <span>{SOURCE_TEXT.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chunks</span>
                <span className="text-pink-400">{chunks.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg size</span>
                <span>{avgChunkSize} chars</span>
              </div>
              {mode === 'fixed' && overlap > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Overlap</span>
                  <span className="text-amber-400">{overlap} chars each</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto bg-pink-500/5 border border-pink-500/10 p-3 rounded-lg">
            <p className="text-xs text-pink-300/80 leading-relaxed">
              {modes.find(m => m.key === mode)?.desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
