'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TextCursorInput } from 'lucide-react'

const STAGES = [
  { label: 'Raw Text', color: '99, 102, 241' },
  { label: 'Pre-tokenization', color: '251, 146, 60' },
  { label: 'BPE Subwords', color: '234, 179, 8' },
  { label: 'Token IDs', color: '52, 211, 153' },
  { label: 'Embeddings', color: '167, 139, 250' },
]

function simulateTokenization(text: string) {
  // Stage 0: raw text
  const raw = text || 'Hello world'

  // Stage 1: pre-tokenization - split on whitespace and punctuation
  const preTokens = raw.match(/[\w]+|[^\s\w]/g) || [raw]

  // Stage 2: BPE subword split simulation
  const subwords: string[] = []
  for (const tok of preTokens) {
    if (tok.length <= 3) {
      subwords.push(tok)
    } else {
      // Simulate subword split: first 3 chars, rest
      const mid = Math.ceil(tok.length * 0.6)
      subwords.push(tok.slice(0, mid))
      subwords.push(tok.slice(mid))
    }
  }

  // Stage 3: token IDs - deterministic hash per subword
  const ids = subwords.map((sw) => {
    let h = 0
    for (let i = 0; i < sw.length; i++) {
      h = ((h << 5) - h + sw.charCodeAt(i)) & 0xffff
    }
    return h % 50000
  })

  // Stage 4: embeddings - pseudo-random 4-dim vectors per ID
  const embeddings = ids.map((id) => {
    const v: number[] = []
    for (let d = 0; d < 4; d++) {
      v.push(Math.round((Math.sin(id * 17.3 + d * 31.7) * 0.5 + 0.5) * 100) / 100)
    }
    return v
  })

  return { raw, preTokens, subwords, ids, embeddings }
}

export default function TokenizationPipelineViz() {
  const [text, setText] = useState('Hello world')
  const [activeStage, setActiveStage] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)

  const data = useMemo(() => simulateTokenization(text), [text])

  const handlePlay = useCallback(() => {
    if (isPlaying) return
    setIsPlaying(true)
    setActiveStage(0)
    let stage = 0
    const interval = setInterval(() => {
      stage++
      if (stage >= STAGES.length) {
        clearInterval(interval)
        setIsPlaying(false)
        setActiveStage(STAGES.length - 1)
        return
      }
      setActiveStage(stage)
    }, 800)
  }, [isPlaying])

  const handleReset = useCallback(() => {
    setActiveStage(-1)
    setIsPlaying(false)
  }, [])

  // SVG layout
  const boxW = 110
  const boxH = 50
  const arrowW = 30
  const padX = 16
  const totalW = padX * 2 + STAGES.length * boxW + (STAGES.length - 1) * arrowW
  const topY = 20
  const contentY = topY + boxH + 24
  const totalH = 260

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-indigo-500/10 p-1.5 rounded-lg">
          <TextCursorInput className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-base font-bold">Tokenization Pipeline</h3>
          <p className="text-xs text-muted-foreground">Raw text to embedding vectors in 5 stages</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 flex flex-col items-center overflow-x-auto">
          <svg viewBox={`0 0 ${totalW} ${totalH}`} className="w-full h-auto max-w-3xl">
            {/* Stage boxes and arrows */}
            {STAGES.map((stage, i) => {
              const x = padX + i * (boxW + arrowW)
              const isActive = i <= activeStage
              const isCurrent = i === activeStage

              return (
                <g key={i}>
                  {/* Arrow before this box (except first) */}
                  {i > 0 && (
                    <motion.g
                      animate={{ opacity: i <= activeStage ? 1 : 0.2 }}
                      transition={{ duration: 0.3 }}
                    >
                      <line
                        x1={x - arrowW + 4}
                        y1={topY + boxH / 2}
                        x2={x - 6}
                        y2={topY + boxH / 2}
                        stroke={`rgba(${stage.color}, ${i <= activeStage ? 0.6 : 0.15})`}
                        strokeWidth={1.5}
                      />
                      <polygon
                        points={`${x - 6},${topY + boxH / 2 - 4} ${x - 6},${topY + boxH / 2 + 4} ${x - 1},${topY + boxH / 2}`}
                        fill={`rgba(${stage.color}, ${i <= activeStage ? 0.6 : 0.15})`}
                      />
                    </motion.g>
                  )}

                  {/* Stage box */}
                  <motion.rect
                    x={x}
                    y={topY}
                    width={boxW}
                    height={boxH}
                    rx={8}
                    animate={{
                      fill: isActive ? `rgba(${stage.color}, 0.15)` : 'rgba(30, 30, 46, 0.4)',
                      stroke: `rgba(${stage.color}, ${isCurrent ? 0.8 : isActive ? 0.4 : 0.1})`,
                    }}
                    strokeWidth={isCurrent ? 2 : 1}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Stage number */}
                  <text
                    x={x + 10}
                    y={topY + 16}
                    fill={`rgba(${stage.color}, ${isActive ? 0.8 : 0.3})`}
                    fontSize={8}
                    fontWeight="bold"
                  >
                    Stage {i}
                  </text>

                  {/* Stage label */}
                  <text
                    x={x + boxW / 2}
                    y={topY + 34}
                    textAnchor="middle"
                    fill="currentColor"
                    fillOpacity={isActive ? 0.9 : 0.3}
                    fontSize={9}
                    fontWeight={isCurrent ? 'bold' : 'normal'}
                  >
                    {stage.label}
                  </text>

                  {/* Pulse indicator for current stage */}
                  {isCurrent && (
                    <motion.circle
                      cx={x + boxW - 10}
                      cy={topY + 10}
                      r={3}
                      fill={`rgba(${stage.color}, 0.8)`}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0.4, 0.8] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </g>
              )
            })}

            {/* Content display below active stage */}
            <AnimatePresence>
              {activeStage >= 0 && (
                <motion.g
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Stage 0: raw text */}
                  {activeStage === 0 && (
                    <text
                      x={totalW / 2}
                      y={contentY + 16}
                      textAnchor="middle"
                      fill="rgba(99, 102, 241, 0.9)"
                      fontSize={12}
                      fontFamily="monospace"
                    >
                      &quot;{data.raw}&quot;
                    </text>
                  )}

                  {/* Stage 1: pre-tokens */}
                  {activeStage === 1 &&
                    data.preTokens.map((tok, i) => (
                      <motion.g
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <rect
                          x={padX + 20 + i * 72}
                          y={contentY}
                          width={64}
                          height={28}
                          rx={5}
                          fill="rgba(251, 146, 60, 0.12)"
                          stroke="rgba(251, 146, 60, 0.3)"
                          strokeWidth={1}
                        />
                        <text
                          x={padX + 20 + i * 72 + 32}
                          y={contentY + 18}
                          textAnchor="middle"
                          fill="rgba(251, 146, 60, 0.9)"
                          fontSize={10}
                          fontFamily="monospace"
                        >
                          {tok}
                        </text>
                      </motion.g>
                    ))}

                  {/* Stage 2: subwords */}
                  {activeStage === 2 &&
                    data.subwords.map((sw, i) => (
                      <motion.g
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                      >
                        <rect
                          x={padX + 10 + i * 58}
                          y={contentY}
                          width={52}
                          height={28}
                          rx={5}
                          fill="rgba(234, 179, 8, 0.12)"
                          stroke="rgba(234, 179, 8, 0.3)"
                          strokeWidth={1}
                        />
                        <text
                          x={padX + 10 + i * 58 + 26}
                          y={contentY + 18}
                          textAnchor="middle"
                          fill="rgba(234, 179, 8, 0.9)"
                          fontSize={10}
                          fontFamily="monospace"
                        >
                          {sw}
                        </text>
                      </motion.g>
                    ))}

                  {/* Stage 3: token IDs */}
                  {activeStage === 3 &&
                    data.ids.map((id, i) => (
                      <motion.g
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                      >
                        <rect
                          x={padX + 10 + i * 58}
                          y={contentY}
                          width={52}
                          height={28}
                          rx={5}
                          fill="rgba(52, 211, 153, 0.12)"
                          stroke="rgba(52, 211, 153, 0.3)"
                          strokeWidth={1}
                        />
                        <text
                          x={padX + 10 + i * 58 + 26}
                          y={contentY + 18}
                          textAnchor="middle"
                          fill="rgba(52, 211, 153, 0.9)"
                          fontSize={10}
                          fontFamily="monospace"
                        >
                          {id}
                        </text>
                      </motion.g>
                    ))}

                  {/* Stage 4: embedding vectors as small bar charts */}
                  {activeStage === 4 &&
                    data.embeddings.map((vec, i) => (
                      <motion.g
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                      >
                        <rect
                          x={padX + 10 + i * 68}
                          y={contentY}
                          width={60}
                          height={40}
                          rx={5}
                          fill="rgba(167, 139, 250, 0.08)"
                          stroke="rgba(167, 139, 250, 0.25)"
                          strokeWidth={1}
                        />
                        {vec.map((v, d) => (
                          <motion.rect
                            key={d}
                            x={padX + 14 + i * 68 + d * 13}
                            y={contentY + 36 - v * 28}
                            width={9}
                            height={v * 28}
                            rx={1.5}
                            initial={{ height: 0, y: contentY + 36 }}
                            animate={{ height: v * 28, y: contentY + 36 - v * 28 }}
                            transition={{ duration: 0.4, delay: i * 0.08 + d * 0.05 }}
                            fill={`rgba(167, 139, 250, ${0.4 + v * 0.5})`}
                          />
                        ))}
                      </motion.g>
                    ))}
                </motion.g>
              )}
            </AnimatePresence>
          </svg>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          {/* Input field */}
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">Input Text</label>
            <input
              type="text"
              value={text}
              onChange={(e) => { setText(e.target.value); setActiveStage(-1) }}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm font-mono"
              placeholder="Type text here..."
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlay}
              disabled={isPlaying}
              className="text-xs px-4 py-1.5 rounded-lg border bg-indigo-500/20 border-indigo-500/40 text-indigo-300 transition hover:bg-indigo-500/30 disabled:opacity-40"
            >
              Play Pipeline
            </button>
            <button
              onClick={handleReset}
              className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground transition hover:text-foreground"
            >
              Reset
            </button>
          </div>

          {/* Stage details */}
          <div className="bg-muted border border-border p-3 rounded-xl space-y-2">
            <div className="text-xs uppercase font-bold text-muted-foreground">Pipeline Stage</div>
            {activeStage >= 0 ? (
              <>
                <div className="text-sm font-mono" style={{ color: `rgba(${STAGES[activeStage].color}, 0.9)` }}>
                  {STAGES[activeStage].label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {activeStage === 0 && `Input string: ${data.raw.length} characters`}
                  {activeStage === 1 && `Split into ${data.preTokens.length} tokens on whitespace/punctuation`}
                  {activeStage === 2 && `BPE produces ${data.subwords.length} subword units`}
                  {activeStage === 3 && `Vocabulary lookup yields ${data.ids.length} integer IDs`}
                  {activeStage === 4 && `Each ID maps to a ${data.embeddings[0]?.length || 4}-dim vector`}
                </div>
              </>
            ) : (
              <div className="text-xs text-muted-foreground">Press Play to step through</div>
            )}
          </div>

          {/* Token count summary */}
          <div className="bg-muted border border-border p-3 rounded-xl space-y-1.5">
            <div className="text-xs uppercase font-bold text-muted-foreground">Token Counts</div>
            <div className="text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Characters</span>
                <span className="text-indigo-400">{data.raw.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pre-tokens</span>
                <span className="text-orange-400">{data.preTokens.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subwords</span>
                <span className="text-yellow-400">{data.subwords.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Token IDs</span>
                <span className="text-emerald-400">{data.ids.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Embed dim</span>
                <span className="text-violet-400">4</span>
              </div>
            </div>
          </div>

          <div className="mt-auto bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-lg">
            <p className="text-xs text-indigo-300 leading-relaxed italic">
              Tokenization converts raw text into numerical vectors the model can process. Pre-tokenization splits on word boundaries, BPE merges frequent character pairs into subwords, vocabulary lookup assigns integer IDs, and the embedding layer maps each ID to a dense vector.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
