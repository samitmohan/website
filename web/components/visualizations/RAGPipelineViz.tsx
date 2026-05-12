'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'

const PIPELINE_STAGES = [
  { key: 'query', label: 'User Query', color: '99, 102, 241' },
  { key: 'embed', label: 'Embedding', color: '167, 139, 250' },
  { key: 'search', label: 'Vector Search', color: '234, 179, 8' },
  { key: 'topk', label: 'Top-K Selection', color: '251, 146, 60' },
  { key: 'rerank', label: 'Reranking', color: '236, 72, 153' },
  { key: 'assembly', label: 'Context Assembly', color: '52, 211, 153' },
  { key: 'llm', label: 'LLM + Context', color: '56, 189, 248' },
  { key: 'answer', label: 'Answer', color: '52, 211, 153' },
]

const DOC_CHUNKS = [
  { id: 'D1', text: 'Transformers use self-attention mechanisms...', score: 0.92 },
  { id: 'D2', text: 'CNNs are used for image classification...', score: 0.34 },
  { id: 'D3', text: 'Attention computes weighted sums of values...', score: 0.87 },
  { id: 'D4', text: 'RNNs process sequences step by step...', score: 0.41 },
  { id: 'D5', text: 'Multi-head attention projects Q, K, V...', score: 0.79 },
]

const RERANKED = [
  { id: 'D1', text: 'Transformers use self-attention mechanisms...', score: 0.95 },
  { id: 'D3', text: 'Attention computes weighted sums of values...', score: 0.91 },
  { id: 'D5', text: 'Multi-head attention projects Q, K, V...', score: 0.84 },
]

export default function RAGPipelineViz() {
  const [step, setStep] = useState(-1)
  const [query] = useState('How does attention work in transformers?')

  const handleNext = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, PIPELINE_STAGES.length - 1))
  }, [])

  const handlePrev = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, -1))
  }, [])

  const handleReset = useCallback(() => {
    setStep(-1)
  }, [])

  // SVG layout for the horizontal pipeline flow
  const stageW = 70
  const stageH = 36
  const arrowW = 16
  const padX = 8
  const padY = 14
  const flowY = padY
  const totalW = padX * 2 + PIPELINE_STAGES.length * stageW + (PIPELINE_STAGES.length - 1) * arrowW
  const detailY = flowY + stageH + 20
  const totalH = 280

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-pink-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-pink-500/10 p-1.5 rounded-lg">
          <Search className="w-4 h-4 text-pink-400" />
        </div>
        <div>
          <h3 className="text-base font-bold">RAG Pipeline</h3>
          <p className="text-xs text-muted-foreground">Retrieval-Augmented Generation: query to cited answer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 flex flex-col items-center overflow-x-auto">
          <svg viewBox={`0 0 ${totalW} ${totalH}`} className="w-full h-auto max-w-3xl">
            {/* Pipeline stage boxes */}
            {PIPELINE_STAGES.map((stage, i) => {
              const x = padX + i * (stageW + arrowW)
              const isActive = i <= step
              const isCurrent = i === step

              return (
                <g key={i}>
                  {/* Arrow */}
                  {i > 0 && (
                    <motion.g animate={{ opacity: i <= step ? 0.7 : 0.15 }}>
                      <line
                        x1={x - arrowW + 2}
                        y1={flowY + stageH / 2}
                        x2={x - 3}
                        y2={flowY + stageH / 2}
                        stroke={`rgba(${stage.color}, ${i <= step ? 0.5 : 0.1})`}
                        strokeWidth={1}
                      />
                      <polygon
                        points={`${x - 3},${flowY + stageH / 2 - 3} ${x - 3},${flowY + stageH / 2 + 3} ${x},${flowY + stageH / 2}`}
                        fill={`rgba(${stage.color}, ${i <= step ? 0.5 : 0.1})`}
                      />
                    </motion.g>
                  )}

                  {/* Stage box */}
                  <motion.rect
                    x={x}
                    y={flowY}
                    width={stageW}
                    height={stageH}
                    rx={6}
                    animate={{
                      fill: isActive ? `rgba(${stage.color}, 0.15)` : 'rgba(30, 30, 46, 0.4)',
                      stroke: `rgba(${stage.color}, ${isCurrent ? 0.8 : isActive ? 0.3 : 0.08})`,
                    }}
                    strokeWidth={isCurrent ? 1.5 : 0.6}
                    transition={{ duration: 0.3 }}
                  />
                  <text
                    x={x + stageW / 2}
                    y={flowY + stageH / 2 + 3}
                    textAnchor="middle"
                    fill="currentColor"
                    fillOpacity={isActive ? 0.9 : 0.25}
                    fontSize={7}
                    fontWeight={isCurrent ? 'bold' : 'normal'}
                  >
                    {stage.label}
                  </text>

                  {isCurrent && (
                    <motion.rect
                      x={x + 2}
                      y={flowY + stageH - 4}
                      width={stageW - 4}
                      height={2}
                      rx={1}
                      fill={`rgba(${stage.color}, 0.6)`}
                      layoutId="stageIndicator"
                    />
                  )}
                </g>
              )
            })}

            {/* Detail panel below */}
            <AnimatePresence mode="wait">
              {/* Query */}
              {step === 0 && (
                <motion.g
                  key="query"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <rect
                    x={padX + 20}
                    y={detailY}
                    width={totalW - padX * 2 - 40}
                    height={30}
                    rx={6}
                    fill="rgba(99, 102, 241, 0.1)"
                    stroke="rgba(99, 102, 241, 0.25)"
                    strokeWidth={0.8}
                  />
                  <text
                    x={totalW / 2}
                    y={detailY + 18}
                    textAnchor="middle"
                    fill="rgba(99, 102, 241, 0.9)"
                    fontSize={8}
                    fontFamily="monospace"
                  >
                    {query}
                  </text>
                </motion.g>
              )}

              {/* Embedding */}
              {step === 1 && (
                <motion.g
                  key="embed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <text
                    x={totalW / 2}
                    y={detailY + 10}
                    textAnchor="middle"
                    fill="currentColor"
                    fillOpacity={0.5}
                    fontSize={7}
                  >
                    Query embedding vector (768-dim)
                  </text>
                  {Array.from({ length: 20 }).map((_, i) => {
                    const v = Math.sin(i * 2.7) * 0.5 + 0.5
                    return (
                      <motion.rect
                        key={i}
                        x={padX + 60 + i * 24}
                        y={detailY + 46 - v * 28}
                        width={18}
                        height={v * 28}
                        rx={2}
                        fill={`rgba(167, 139, 250, ${0.3 + v * 0.5})`}
                        initial={{ height: 0, y: detailY + 46 }}
                        animate={{ height: v * 28, y: detailY + 46 - v * 28 }}
                        transition={{ duration: 0.3, delay: i * 0.03 }}
                      />
                    )
                  })}
                </motion.g>
              )}

              {/* Vector Search - similarity scores */}
              {step === 2 && (
                <motion.g
                  key="search"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <text
                    x={padX + 20}
                    y={detailY + 10}
                    fill="currentColor"
                    fillOpacity={0.5}
                    fontSize={7}
                  >
                    Cosine similarity against document chunks:
                  </text>
                  {DOC_CHUNKS.map((doc, i) => {
                    const barMaxW = totalW - padX * 2 - 140
                    const yOff = detailY + 20 + i * 28
                    return (
                      <motion.g
                        key={doc.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <text
                          x={padX + 20}
                          y={yOff + 12}
                          fill="currentColor"
                          fillOpacity={0.6}
                          fontSize={7}
                          fontFamily="monospace"
                        >
                          {doc.id}
                        </text>
                        <rect
                          x={padX + 46}
                          y={yOff + 2}
                          width={barMaxW}
                          height={16}
                          rx={3}
                          fill="rgba(30, 30, 46, 0.4)"
                          stroke="rgba(255,255,255,0.03)"
                          strokeWidth={0.5}
                        />
                        <motion.rect
                          x={padX + 46}
                          y={yOff + 2}
                          width={0}
                          height={16}
                          rx={3}
                          animate={{ width: doc.score * barMaxW }}
                          transition={{ duration: 0.5, delay: i * 0.1 }}
                          fill={doc.score > 0.7 ? 'rgba(234, 179, 8, 0.4)' : 'rgba(234, 179, 8, 0.15)'}
                        />
                        <text
                          x={padX + 52 + doc.score * barMaxW}
                          y={yOff + 13}
                          fill={doc.score > 0.7 ? 'rgba(234, 179, 8, 0.9)' : 'currentColor'}
                          fillOpacity={doc.score > 0.7 ? 1 : 0.4}
                          fontSize={7}
                          fontFamily="monospace"
                          fontWeight={doc.score > 0.7 ? 'bold' : 'normal'}
                        >
                          {doc.score.toFixed(2)}
                        </text>
                      </motion.g>
                    )
                  })}
                </motion.g>
              )}

              {/* Top-K Selection */}
              {step === 3 && (
                <motion.g
                  key="topk"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <text
                    x={padX + 20}
                    y={detailY + 10}
                    fill="currentColor"
                    fillOpacity={0.5}
                    fontSize={7}
                  >
                    Top-3 chunks selected (threshold: 0.7):
                  </text>
                  {DOC_CHUNKS.filter((d) => d.score > 0.7).map((doc, i) => (
                    <motion.g
                      key={doc.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15 }}
                    >
                      <rect
                        x={padX + 20}
                        y={detailY + 20 + i * 36}
                        width={totalW - padX * 2 - 40}
                        height={28}
                        rx={5}
                        fill="rgba(251, 146, 60, 0.1)"
                        stroke="rgba(251, 146, 60, 0.25)"
                        strokeWidth={0.8}
                      />
                      <text
                        x={padX + 30}
                        y={detailY + 38 + i * 36}
                        fill="rgba(251, 146, 60, 0.9)"
                        fontSize={7}
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        [{doc.id}] {doc.score.toFixed(2)}
                      </text>
                      <text
                        x={padX + 110}
                        y={detailY + 38 + i * 36}
                        fill="currentColor"
                        fillOpacity={0.6}
                        fontSize={7}
                      >
                        {doc.text}
                      </text>
                    </motion.g>
                  ))}
                </motion.g>
              )}

              {/* Reranking */}
              {step === 4 && (
                <motion.g
                  key="rerank"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <text
                    x={padX + 20}
                    y={detailY + 10}
                    fill="currentColor"
                    fillOpacity={0.5}
                    fontSize={7}
                  >
                    Cross-encoder reranking (scores updated):
                  </text>
                  {RERANKED.map((doc, i) => (
                    <motion.g
                      key={doc.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                    >
                      <rect
                        x={padX + 20}
                        y={detailY + 20 + i * 36}
                        width={totalW - padX * 2 - 40}
                        height={28}
                        rx={5}
                        fill="rgba(236, 72, 153, 0.1)"
                        stroke="rgba(236, 72, 153, 0.25)"
                        strokeWidth={0.8}
                      />
                      <text
                        x={padX + 30}
                        y={detailY + 38 + i * 36}
                        fill="rgba(236, 72, 153, 0.9)"
                        fontSize={7}
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        #{i + 1} [{doc.id}] {doc.score.toFixed(2)}
                      </text>
                      <text
                        x={padX + 140}
                        y={detailY + 38 + i * 36}
                        fill="currentColor"
                        fillOpacity={0.6}
                        fontSize={7}
                      >
                        {doc.text}
                      </text>
                    </motion.g>
                  ))}
                </motion.g>
              )}

              {/* Context Assembly */}
              {step === 5 && (
                <motion.g
                  key="assembly"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <rect
                    x={padX + 20}
                    y={detailY}
                    width={totalW - padX * 2 - 40}
                    height={140}
                    rx={6}
                    fill="rgba(52, 211, 153, 0.06)"
                    stroke="rgba(52, 211, 153, 0.2)"
                    strokeWidth={0.8}
                  />
                  <text x={padX + 30} y={detailY + 14} fill="rgba(52, 211, 153, 0.7)" fontSize={7} fontWeight="bold">
                    Assembled Prompt:
                  </text>
                  <text x={padX + 30} y={detailY + 30} fill="currentColor" fillOpacity={0.5} fontSize={7} fontFamily="monospace">
                    [System] Answer using the provided context.
                  </text>
                  <text x={padX + 30} y={detailY + 46} fill="currentColor" fillOpacity={0.5} fontSize={7} fontFamily="monospace">
                    [Context]
                  </text>
                  {RERANKED.map((doc, i) => (
                    <text
                      key={doc.id}
                      x={padX + 40}
                      y={detailY + 60 + i * 14}
                      fill="rgba(52, 211, 153, 0.7)"
                      fontSize={6.5}
                      fontFamily="monospace"
                    >
                      [{doc.id}]: {doc.text}
                    </text>
                  ))}
                  <text x={padX + 30} y={detailY + 106} fill="currentColor" fillOpacity={0.5} fontSize={7} fontFamily="monospace">
                    [Query] {query}
                  </text>
                </motion.g>
              )}

              {/* LLM Processing */}
              {step === 6 && (
                <motion.g
                  key="llm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <rect
                    x={totalW / 2 - 80}
                    y={detailY + 10}
                    width={160}
                    height={50}
                    rx={8}
                    fill="rgba(56, 189, 248, 0.1)"
                    stroke="rgba(56, 189, 248, 0.3)"
                    strokeWidth={1}
                  />
                  <text x={totalW / 2} y={detailY + 32} textAnchor="middle" fill="rgba(56, 189, 248, 0.8)" fontSize={9} fontWeight="bold">
                    LLM Processing
                  </text>
                  <text x={totalW / 2} y={detailY + 46} textAnchor="middle" fill="currentColor" fillOpacity={0.4} fontSize={7}>
                    Context + Query -&gt; Generation
                  </text>
                  {/* Loading dots */}
                  {[0, 1, 2].map((d) => (
                    <motion.circle
                      key={d}
                      cx={totalW / 2 - 12 + d * 12}
                      cy={detailY + 78}
                      r={3}
                      fill="rgba(56, 189, 248, 0.5)"
                      animate={{ opacity: [0.2, 0.8, 0.2] }}
                      transition={{ duration: 1, delay: d * 0.3, repeat: Infinity }}
                    />
                  ))}
                </motion.g>
              )}

              {/* Answer with citations */}
              {step === 7 && (
                <motion.g
                  key="answer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <rect
                    x={padX + 20}
                    y={detailY}
                    width={totalW - padX * 2 - 40}
                    height={90}
                    rx={6}
                    fill="rgba(52, 211, 153, 0.08)"
                    stroke="rgba(52, 211, 153, 0.25)"
                    strokeWidth={0.8}
                  />
                  <text x={padX + 30} y={detailY + 16} fill="rgba(52, 211, 153, 0.8)" fontSize={8} fontWeight="bold">
                    Answer:
                  </text>
                  <text x={padX + 30} y={detailY + 34} fill="currentColor" fillOpacity={0.8} fontSize={7}>
                    Attention in transformers computes weighted sums of value vectors,
                  </text>
                  <text x={padX + 30} y={detailY + 48} fill="currentColor" fillOpacity={0.8} fontSize={7}>
                    using dot-product similarity between query and key vectors [D1][D3].
                  </text>
                  <text x={padX + 30} y={detailY + 62} fill="currentColor" fillOpacity={0.8} fontSize={7}>
                    Multi-head attention projects into multiple subspaces [D5].
                  </text>
                  <text x={padX + 30} y={detailY + 80} fill="rgba(52, 211, 153, 0.6)" fontSize={6.5}>
                    Citations: [D1] [D3] [D5]
                  </text>
                </motion.g>
              )}
            </AnimatePresence>
          </svg>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          {/* Step controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={step <= -1}
              className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground transition hover:text-foreground disabled:opacity-30"
            >
              Prev
            </button>
            <button
              onClick={handleNext}
              disabled={step >= PIPELINE_STAGES.length - 1}
              className="text-xs px-4 py-1.5 rounded-lg border bg-pink-500/20 border-pink-500/40 text-pink-300 transition hover:bg-pink-500/30 disabled:opacity-30"
            >
              Next ({step + 1}/{PIPELINE_STAGES.length})
            </button>
            <button
              onClick={handleReset}
              className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground transition hover:text-foreground"
            >
              Reset
            </button>
          </div>

          {/* Current stage info */}
          <div className="bg-muted border border-border p-3 rounded-xl space-y-2">
            <div className="text-xs uppercase font-bold text-muted-foreground">Current Stage</div>
            {step >= 0 ? (
              <>
                <div className="text-sm font-mono" style={{ color: `rgba(${PIPELINE_STAGES[step].color}, 0.9)` }}>
                  {PIPELINE_STAGES[step].label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {step === 0 && 'User submits a natural language question'}
                  {step === 1 && 'Query encoded into a dense vector using an embedding model'}
                  {step === 2 && 'Vector DB computes cosine similarity against all stored chunks'}
                  {step === 3 && 'Select top-K chunks above the similarity threshold'}
                  {step === 4 && 'Cross-encoder reranks candidates for higher relevance precision'}
                  {step === 5 && 'Combine retrieved chunks into a structured prompt with the query'}
                  {step === 6 && 'LLM generates an answer conditioned on the assembled context'}
                  {step === 7 && 'Final answer includes inline citations to source chunks'}
                </div>
              </>
            ) : (
              <div className="text-xs text-muted-foreground">Press Next to step through the pipeline</div>
            )}
          </div>

          {/* Pipeline stats */}
          <div className="bg-muted border border-border p-3 rounded-xl space-y-1.5">
            <div className="text-xs uppercase font-bold text-muted-foreground">Pipeline Stats</div>
            <div className="text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Doc chunks indexed</span>
                <span>{DOC_CHUNKS.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Top-K selected</span>
                <span className="text-orange-400">{DOC_CHUNKS.filter((d) => d.score > 0.7).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">After reranking</span>
                <span className="text-pink-400">{RERANKED.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Similarity threshold</span>
                <span className="text-amber-400">0.70</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-muted border border-border p-3 rounded-xl space-y-1">
            <div className="text-xs uppercase font-bold text-muted-foreground">Legend</div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-amber-400/50" />
              <span className="text-muted-foreground">Similarity score bar</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-pink-400/50" />
              <span className="text-muted-foreground">Reranked result</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-emerald-400/50" />
              <span className="text-muted-foreground">Final context / answer</span>
            </div>
          </div>

          <div className="mt-auto bg-pink-500/5 border border-pink-500/10 p-3 rounded-lg">
            <p className="text-xs text-pink-300 leading-relaxed italic">
              RAG grounds LLM outputs in retrieved evidence, reducing hallucination. The two-stage retrieval (vector search + cross-encoder reranking) balances speed with precision. Citations let users verify the answer against source documents.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
