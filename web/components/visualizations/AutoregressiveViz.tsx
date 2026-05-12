'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Play, RotateCcw } from 'lucide-react'

const VOCAB = ['the', 'cat', 'sat', 'on', 'mat', 'dog', 'ran', 'big']
const VOCAB_COLORS = ['#6366f1', '#f43f5e', '#f59e0b', '#34d399', '#fb923c', '#ec4899', '#8b5cf6', '#38bdf8']

// Pre-scripted logits for each generation step (before temperature)
const STEP_LOGITS: number[][] = [
  [2.5, 0.8, 0.3, 0.1, 0.1, 0.5, 0.2, 0.3],  // -> "the"
  [0.2, 2.8, 0.4, 0.1, 0.1, 1.2, 0.3, 0.6],  // -> "cat"
  [0.1, 0.3, 2.6, 0.5, 0.2, 0.1, 0.8, 0.1],  // -> "sat"
  [0.3, 0.1, 0.2, 2.9, 0.4, 0.1, 0.1, 0.1],  // -> "on"
  [0.4, 0.1, 0.1, 0.2, 2.4, 0.1, 0.1, 0.1],  // -> "mat" (but temp can change it)
  [0.2, 0.3, 0.1, 0.1, 0.1, 0.8, 0.4, 2.1],  // -> "big"
]

function softmax(logits: number[], temperature: number): number[] {
  const scaled = logits.map(l => l / Math.max(temperature, 0.01))
  const max = Math.max(...scaled)
  const exps = scaled.map(v => Math.exp(v - max))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map(e => e / sum)
}

function sampleFromProbs(probs: number[]): number {
  const r = Math.random()
  let cumulative = 0
  for (let i = 0; i < probs.length; i++) {
    cumulative += probs[i]
    if (r < cumulative) return i
  }
  return probs.length - 1
}

export default function AutoregressiveViz() {
  const [temperature, setTemperature] = useState(1.0)
  const [sequence, setSequence] = useState<number[]>([])
  const [step, setStep] = useState(0)

  const currentLogits = step < STEP_LOGITS.length ? STEP_LOGITS[step] : STEP_LOGITS[STEP_LOGITS.length - 1]
  const currentProbs = useMemo(() => softmax(currentLogits, temperature), [currentLogits, temperature])

  const maxProb = Math.max(...currentProbs)

  const handleGenerate = useCallback(() => {
    if (step >= STEP_LOGITS.length) return
    const probs = softmax(STEP_LOGITS[step], temperature)
    const sampled = sampleFromProbs(probs)
    setSequence(prev => [...prev, sampled])
    setStep(prev => prev + 1)
  }, [step, temperature])

  const handleReset = () => {
    setSequence([])
    setStep(0)
  }

  const barMaxH = 120

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-sky-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-sky-500/10 p-1.5 rounded-lg">
          <MessageSquare className="w-4 h-4 text-sky-400" />
        </div>
        <div>
          <h3 className="text-base font-bold">Autoregressive Generation</h3>
          <p className="text-xs text-muted-foreground">Token-by-token sampling from predicted probability distributions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 flex flex-col gap-4">
          {/* Generated sequence */}
          <div>
            <h4 className="text-xs uppercase font-bold text-muted-foreground mb-2">Generated Sequence</h4>
            <div className="flex items-center gap-1.5 flex-wrap min-h-[36px] bg-muted/50 border border-border rounded-xl p-3">
              <AnimatePresence>
                {sequence.map((tokenIdx, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.8, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="px-2 py-1 rounded-lg text-xs font-mono font-bold border"
                    style={{
                      backgroundColor: `${VOCAB_COLORS[tokenIdx]}15`,
                      borderColor: `${VOCAB_COLORS[tokenIdx]}40`,
                      color: VOCAB_COLORS[tokenIdx],
                    }}
                  >
                    {VOCAB[tokenIdx]}
                  </motion.span>
                ))}
              </AnimatePresence>
              {sequence.length === 0 && (
                <span className="text-xs text-muted-foreground italic">Press Generate to start...</span>
              )}
              {step < STEP_LOGITS.length && (
                <motion.span
                  className="w-2 h-5 bg-sky-400 rounded-sm"
                  animate={{ opacity: [1, 0.3] }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
                />
              )}
            </div>
          </div>

          {/* Probability bar chart */}
          <div>
            <h4 className="text-xs uppercase font-bold text-muted-foreground mb-2">
              Next Token Probabilities {step < STEP_LOGITS.length ? `(Step ${step + 1})` : '(Done)'}
            </h4>
            <div className="flex items-end gap-2 justify-center">
              {VOCAB.map((token, i) => {
                const prob = currentProbs[i]
                const barH = (prob / maxProb) * barMaxH
                const isMax = prob === maxProb
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="text-sm font-mono text-muted-foreground">{(prob * 100).toFixed(1)}%</span>
                    <motion.div
                      className="w-8 rounded-t-md"
                      style={{ backgroundColor: VOCAB_COLORS[i] }}
                      initial={false}
                      animate={{
                        height: Math.max(barH, 2),
                        opacity: isMax ? 0.9 : 0.4,
                      }}
                      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    />
                    <span className="text-sm font-mono" style={{ color: VOCAB_COLORS[i] }}>{token}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Dashboard */}
        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={step >= STEP_LOGITS.length}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-sky-500/20 border border-sky-500/40 text-sky-300 rounded-lg py-2 hover:bg-sky-500/30 transition disabled:opacity-30"
            >
              <Play className="w-3 h-3" /> Generate
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs border border-border rounded-lg py-2 px-3 hover:bg-accent transition text-muted-foreground"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">
              Temperature: {temperature.toFixed(2)}
            </label>
            <input
              type="range" min={0.1} max={3.0} step={0.05}
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-sky-500"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Sharp (0.1)</span>
              <span>Random (3.0)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted border border-border p-2 rounded-xl">
              <div className="text-xs uppercase font-bold text-muted-foreground">Step</div>
              <div className="text-sm font-mono font-bold text-sky-400">{step}/{STEP_LOGITS.length}</div>
            </div>
            <div className="bg-muted border border-border p-2 rounded-xl">
              <div className="text-xs uppercase font-bold text-muted-foreground">Tokens</div>
              <div className="text-sm font-mono font-bold">{sequence.length}</div>
            </div>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-1">
            <div className="text-xs uppercase font-bold text-muted-foreground">Top Prediction</div>
            {step < STEP_LOGITS.length ? (
              <>
                <div className="text-sm font-mono font-bold" style={{ color: VOCAB_COLORS[currentProbs.indexOf(maxProb)] }}>
                  "{VOCAB[currentProbs.indexOf(maxProb)]}"
                </div>
                <div className="text-xs text-muted-foreground">
                  {(maxProb * 100).toFixed(1)}% probability
                </div>
              </>
            ) : (
              <div className="text-xs text-muted-foreground">Generation complete</div>
            )}
          </div>

          <div className="mt-auto bg-sky-500/5 border border-sky-500/10 p-3 rounded-lg">
            <p className="text-xs text-sky-300 leading-relaxed italic">
              {temperature < 0.5
                ? "Low temperature concentrates probability on the top token. Output becomes deterministic."
                : temperature > 2.0
                  ? "High temperature flattens the distribution. Sampling becomes random - expect surprising tokens."
                  : "Each step samples one token from the distribution, then feeds it back as context for the next prediction."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
