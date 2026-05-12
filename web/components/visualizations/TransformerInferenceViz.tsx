'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu } from 'lucide-react'

const MODEL_LAYERS = [
  { label: 'Embedding', color: '99, 102, 241', h: 28 },
  { label: 'Attention', color: '234, 179, 8', h: 32 },
  { label: 'FFN', color: '251, 146, 60', h: 28 },
  { label: 'Attention', color: '234, 179, 8', h: 32 },
  { label: 'FFN', color: '251, 146, 60', h: 28 },
  { label: 'LM Head', color: '167, 139, 250', h: 28 },
  { label: 'Softmax', color: '52, 211, 153', h: 24 },
]

const PROMPT_TOKENS = ['The', 'cat', 'sat', 'on']
const GENERATED_TOKENS = ['the', 'mat', '.', '<end>']

export default function TransformerInferenceViz() {
  const [phase, setPhase] = useState<'prefill' | 'decode'>('prefill')
  const [animStep, setAnimStep] = useState(-1)
  const [decodeIdx, setDecodeIdx] = useState(0)
  const [kvCacheSize, setKvCacheSize] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const handlePlay = useCallback(() => {
    if (isPlaying) return
    setIsPlaying(true)

    if (phase === 'prefill') {
      // Animate token flowing through layers
      setAnimStep(0)
      let step = 0
      intervalRef.current = setInterval(() => {
        step++
        if (step >= MODEL_LAYERS.length) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          setKvCacheSize(PROMPT_TOKENS.length)
          setIsPlaying(false)
          setAnimStep(MODEL_LAYERS.length - 1)
          return
        }
        setAnimStep(step)
      }, 500)
    } else {
      // Decode phase: generate tokens one at a time
      setDecodeIdx(0)
      setAnimStep(0)
      setKvCacheSize(PROMPT_TOKENS.length)
      let tokIdx = 0
      let layerStep = 0
      intervalRef.current = setInterval(() => {
        layerStep++
        if (layerStep >= MODEL_LAYERS.length) {
          // Token generated
          tokIdx++
          setKvCacheSize(PROMPT_TOKENS.length + tokIdx)
          if (tokIdx >= GENERATED_TOKENS.length) {
            if (intervalRef.current) clearInterval(intervalRef.current)
            setIsPlaying(false)
            setDecodeIdx(GENERATED_TOKENS.length - 1)
            setAnimStep(MODEL_LAYERS.length - 1)
            return
          }
          layerStep = 0
          setDecodeIdx(tokIdx)
        }
        setAnimStep(layerStep)
      }, 350)
    }
  }, [isPlaying, phase])

  const handleReset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setAnimStep(-1)
    setDecodeIdx(0)
    setKvCacheSize(phase === 'decode' ? PROMPT_TOKENS.length : 0)
    setIsPlaying(false)
  }, [phase])

  const handlePhaseToggle = useCallback((p: 'prefill' | 'decode') => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setPhase(p)
    setAnimStep(-1)
    setDecodeIdx(0)
    setIsPlaying(false)
    setKvCacheSize(p === 'decode' ? PROMPT_TOKENS.length : 0)
  }, [])

  // SVG layout
  const layerW = 140
  const padX = 20
  const padY = 20
  const layerGap = 6
  const kvCacheX = padX + layerW + 30
  const kvCacheW = 80
  const totalLayerH = MODEL_LAYERS.reduce((s, l) => s + l.h + layerGap, 0)
  const totalW = kvCacheX + kvCacheW + padX
  const totalH = padY * 2 + totalLayerH + 40

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-cyan-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-cyan-500/10 p-1.5 rounded-lg">
          <Cpu className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-base font-bold">Transformer Inference</h3>
          <p className="text-xs text-muted-foreground">Prefill (parallel) vs Decode (autoregressive) phases</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 flex flex-col items-center overflow-x-auto">
          <svg viewBox={`0 0 ${totalW} ${totalH}`} className="w-full h-auto max-w-lg">
            {/* Input tokens display */}
            <text
              x={padX + layerW / 2}
              y={padY - 4}
              textAnchor="middle"
              fill="currentColor"
              fillOpacity={0.5}
              fontSize={8}
            >
              {phase === 'prefill' ? 'All tokens in parallel' : `Token: "${GENERATED_TOKENS[decodeIdx] || '...'}" (step ${decodeIdx + 1})`}
            </text>

            {/* Model layers */}
            {MODEL_LAYERS.map((layer, i) => {
              let y = padY + 8
              for (let j = 0; j < i; j++) y += MODEL_LAYERS[j].h + layerGap
              const isActive = i <= animStep

              return (
                <g key={i}>
                  <motion.rect
                    x={padX}
                    y={y}
                    width={layerW}
                    height={layer.h}
                    rx={6}
                    animate={{
                      fill: isActive ? `rgba(${layer.color}, 0.2)` : 'rgba(30, 30, 46, 0.4)',
                      stroke: `rgba(${layer.color}, ${i === animStep ? 0.8 : isActive ? 0.3 : 0.08})`,
                    }}
                    strokeWidth={i === animStep ? 2 : 0.8}
                    transition={{ duration: 0.25 }}
                  />
                  <text
                    x={padX + layerW / 2}
                    y={y + layer.h / 2 + 3}
                    textAnchor="middle"
                    fill="currentColor"
                    fillOpacity={isActive ? 0.9 : 0.3}
                    fontSize={9}
                    fontWeight={i === animStep ? 'bold' : 'normal'}
                  >
                    {layer.label}
                  </text>

                  {/* Token flow indicator */}
                  {i === animStep && (
                    <motion.rect
                      x={padX + 4}
                      y={y + 3}
                      width={phase === 'prefill' ? layerW - 8 : 30}
                      height={layer.h - 6}
                      rx={4}
                      fill={`rgba(${layer.color}, 0.3)`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                    />
                  )}

                  {/* Arrow to next layer */}
                  {i < MODEL_LAYERS.length - 1 && (
                    <line
                      x1={padX + layerW / 2}
                      y1={y + layer.h}
                      x2={padX + layerW / 2}
                      y2={y + layer.h + layerGap}
                      stroke="currentColor"
                      strokeOpacity={0.1}
                      strokeWidth={1}
                    />
                  )}

                  {/* KV Cache connection for attention layers */}
                  {(layer.label === 'Attention') && (
                    <motion.line
                      x1={padX + layerW}
                      y1={y + layer.h / 2}
                      x2={kvCacheX}
                      y2={y + layer.h / 2}
                      stroke="rgba(234, 179, 8, 0.3)"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      animate={{ opacity: kvCacheSize > 0 ? 0.6 : 0.1 }}
                    />
                  )}
                </g>
              )
            })}

            {/* KV Cache panel */}
            <rect
              x={kvCacheX}
              y={padY + 8}
              width={kvCacheW}
              height={totalLayerH - 8}
              rx={8}
              fill="rgba(234, 179, 8, 0.04)"
              stroke="rgba(234, 179, 8, 0.15)"
              strokeWidth={1}
            />
            <text
              x={kvCacheX + kvCacheW / 2}
              y={padY + 22}
              textAnchor="middle"
              fill="rgba(234, 179, 8, 0.7)"
              fontSize={8}
              fontWeight="bold"
            >
              KV Cache
            </text>

            {/* KV Cache slots */}
            {Array.from({ length: PROMPT_TOKENS.length + GENERATED_TOKENS.length }).map((_, i) => {
              const slotY = padY + 32 + i * 20
              const isFilled = i < kvCacheSize
              const isPrompt = i < PROMPT_TOKENS.length
              const label = isPrompt
                ? PROMPT_TOKENS[i]
                : GENERATED_TOKENS[i - PROMPT_TOKENS.length] || '...'

              return (
                <g key={i}>
                  <motion.rect
                    x={kvCacheX + 6}
                    y={slotY}
                    width={kvCacheW - 12}
                    height={16}
                    rx={3}
                    animate={{
                      fill: isFilled
                        ? isPrompt
                          ? 'rgba(99, 102, 241, 0.2)'
                          : 'rgba(52, 211, 153, 0.2)'
                        : 'rgba(30, 30, 46, 0.3)',
                      stroke: isFilled
                        ? isPrompt
                          ? 'rgba(99, 102, 241, 0.3)'
                          : 'rgba(52, 211, 153, 0.3)'
                        : 'rgba(255,255,255,0.03)',
                    }}
                    strokeWidth={0.5}
                    transition={{ duration: 0.3 }}
                  />
                  <text
                    x={kvCacheX + kvCacheW / 2}
                    y={slotY + 11}
                    textAnchor="middle"
                    fill="currentColor"
                    fillOpacity={isFilled ? 0.7 : 0.15}
                    fontSize={7}
                    fontFamily="monospace"
                  >
                    {isFilled ? label : '---'}
                  </text>
                </g>
              )
            })}

            {/* Output token */}
            <AnimatePresence>
              {animStep === MODEL_LAYERS.length - 1 && (
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {(() => {
                    let outputY = padY + 8
                    for (const l of MODEL_LAYERS) outputY += l.h + layerGap
                    return (
                      <>
                        <rect
                          x={padX + 30}
                          y={outputY + 4}
                          width={80}
                          height={22}
                          rx={5}
                          fill="rgba(52, 211, 153, 0.15)"
                          stroke="rgba(52, 211, 153, 0.4)"
                          strokeWidth={1}
                        />
                        <text
                          x={padX + 70}
                          y={outputY + 18}
                          textAnchor="middle"
                          fill="rgba(52, 211, 153, 0.9)"
                          fontSize={9}
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {phase === 'prefill'
                            ? GENERATED_TOKENS[0]
                            : GENERATED_TOKENS[decodeIdx] || '...'}
                        </text>
                      </>
                    )
                  })()}
                </motion.g>
              )}
            </AnimatePresence>
          </svg>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          {/* Phase toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => handlePhaseToggle('prefill')}
              className={`flex-1 text-xs px-3 py-1.5 transition ${
                phase === 'prefill'
                  ? 'bg-indigo-500/20 text-indigo-300'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Prefill
            </button>
            <button
              onClick={() => handlePhaseToggle('decode')}
              className={`flex-1 text-xs px-3 py-1.5 transition border-l border-border ${
                phase === 'decode'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Decode
            </button>
          </div>

          {/* Play controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlay}
              disabled={isPlaying}
              className="text-xs px-4 py-1.5 rounded-lg border bg-cyan-500/20 border-cyan-500/40 text-cyan-300 transition hover:bg-cyan-500/30 disabled:opacity-40"
            >
              Animate
            </button>
            <button
              onClick={handleReset}
              className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground transition hover:text-foreground"
            >
              Reset
            </button>
          </div>

          {/* Phase info */}
          <div className="bg-muted border border-border p-3 rounded-xl space-y-2">
            <div className="text-xs uppercase font-bold text-muted-foreground">
              {phase === 'prefill' ? 'Prefill Phase' : 'Decode Phase'}
            </div>
            {phase === 'prefill' ? (
              <>
                <div className="text-xs text-muted-foreground">
                  All {PROMPT_TOKENS.length} prompt tokens processed in parallel through every layer. KV cache fills with all positions at once.
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {PROMPT_TOKENS.map((t, i) => (
                    <span key={i} className="text-xs font-mono px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                      {t}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="text-xs text-muted-foreground">
                  One token at a time. Each step reads cached K,V from all previous positions, computes new K,V for the current position, and appends to the cache.
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {GENERATED_TOKENS.slice(0, decodeIdx + 1).map((t, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-xs font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                    >
                      {t}
                    </motion.span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* KV Cache stats */}
          <div className="bg-muted border border-border p-3 rounded-xl space-y-2">
            <div className="text-xs uppercase font-bold text-muted-foreground">KV Cache</div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Cached positions</span>
                <span className="font-mono text-amber-400">{kvCacheSize} / {PROMPT_TOKENS.length + GENERATED_TOKENS.length}</span>
              </div>
              <div className="w-full h-1.5 bg-accent rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-amber-500/60 rounded-full"
                  animate={{ width: `${(kvCacheSize / (PROMPT_TOKENS.length + GENERATED_TOKENS.length)) * 100}%` }}
                />
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Memory: {kvCacheSize} x 2 x d_model per layer
            </div>
          </div>

          {/* Legend */}
          <div className="bg-muted border border-border p-3 rounded-xl space-y-1">
            <div className="text-xs uppercase font-bold text-muted-foreground">Legend</div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-indigo-400/50" />
              <span className="text-muted-foreground">Prompt tokens (prefill)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-emerald-400/50" />
              <span className="text-muted-foreground">Generated tokens (decode)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-amber-400/50" />
              <span className="text-muted-foreground">KV cache entries</span>
            </div>
          </div>

          <div className="mt-auto bg-cyan-500/5 border border-cyan-500/10 p-3 rounded-lg">
            <p className="text-xs text-cyan-300 leading-relaxed italic">
              Prefill processes the entire prompt in one forward pass (compute-bound). Decode generates one token per pass, reading from the KV cache (memory-bound). This two-phase split explains why long prompts have high latency but short time-to-first-token.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
