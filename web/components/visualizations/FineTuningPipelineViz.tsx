'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Wrench } from 'lucide-react'

const STAGES = [
  { key: 'base', label: 'Base Model', color: '99, 102, 241', description: 'Pre-trained on web-scale data' },
  { key: 'sft', label: 'SFT', color: '234, 179, 8', description: 'Supervised Fine-Tuning on instruction pairs' },
  { key: 'rlhf', label: 'RLHF / DPO', color: '236, 72, 153', description: 'Preference alignment via human feedback' },
  { key: 'deploy', label: 'Deployed Model', color: '52, 211, 153', description: 'Production-ready aligned model' },
]

const SFT_EXAMPLES = [
  { input: 'Summarize this article about ML', output: 'The article discusses how machine learning models...' },
  { input: 'Write a haiku about rain', output: 'Gentle drops descend / Puddles form on quiet streets / Nature drinks its fill' },
]

const PREFERENCE_PAIRS = [
  {
    prompt: 'Explain quantum computing',
    chosen: 'Quantum computers use qubits that exist in superposition...',
    rejected: 'Quantum computing is cool and does stuff with atoms maybe...',
  },
  {
    prompt: 'Is pineapple pizza good?',
    chosen: 'Food preferences are subjective. Some enjoy the sweet-savory contrast...',
    rejected: 'Yes! Pineapple pizza is the best pizza ever invented!!!',
  },
]

export default function FineTuningPipelineViz() {
  const [activeStage, setActiveStage] = useState(0)
  const [method, setMethod] = useState<'full' | 'lora'>('full')

  const handleStageClick = useCallback((idx: number) => {
    setActiveStage(idx)
  }, [])

  // Parameter counts
  const totalParams = 7_000_000_000 // 7B
  const loraParams = 18_000_000 // ~18M for typical LoRA
  const activeParams = method === 'full' ? totalParams : loraParams
  const ratio = activeParams / totalParams

  // SVG layout for vertical flow
  const padX = 30
  const padY = 20
  const blockW = 160
  const blockH = 46
  const blockGap = 20
  const arrowH = 14
  const totalW = 340
  const totalH = padY * 2 + STAGES.length * (blockH + arrowH + blockGap) - blockGap

  // LoRA adapter positions (flanking the weight blocks in SFT/RLHF stages)
  const adapterW = 20
  const adapterH = blockH - 10

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-emerald-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-emerald-500/10 p-1.5 rounded-lg">
          <Wrench className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-base font-bold">Fine-Tuning Pipeline</h3>
          <p className="text-xs text-muted-foreground">Base model to deployed alignment: SFT, RLHF/DPO, with Full vs LoRA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 flex flex-col items-center overflow-x-auto">
          <svg viewBox={`0 0 ${totalW} ${totalH}`} className="w-full h-auto max-w-md">
            {STAGES.map((stage, i) => {
              const x = totalW / 2 - blockW / 2
              const y = padY + i * (blockH + arrowH + blockGap)
              const isActive = i === activeStage
              const isTraining = i === 1 || i === 2 // SFT or RLHF

              return (
                <g key={i} onClick={() => handleStageClick(i)} style={{ cursor: 'pointer' }}>
                  {/* Arrow from previous stage */}
                  {i > 0 && (
                    <g>
                      <line
                        x1={totalW / 2}
                        y1={y - blockGap - arrowH + 2}
                        x2={totalW / 2}
                        y2={y - 4}
                        stroke={`rgba(${stage.color}, 0.3)`}
                        strokeWidth={1.5}
                      />
                      <polygon
                        points={`${totalW / 2 - 4},${y - 6} ${totalW / 2 + 4},${y - 6} ${totalW / 2},${y - 1}`}
                        fill={`rgba(${stage.color}, 0.4)`}
                      />
                    </g>
                  )}

                  {/* Main block */}
                  <motion.rect
                    x={x}
                    y={y}
                    width={blockW}
                    height={blockH}
                    rx={8}
                    animate={{
                      fill: isActive ? `rgba(${stage.color}, 0.18)` : `rgba(${stage.color}, 0.06)`,
                      stroke: `rgba(${stage.color}, ${isActive ? 0.7 : 0.2})`,
                    }}
                    strokeWidth={isActive ? 2 : 1}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Block label */}
                  <text
                    x={totalW / 2}
                    y={y + blockH / 2 - 4}
                    textAnchor="middle"
                    fill={`rgba(${stage.color}, ${isActive ? 1 : 0.6})`}
                    fontSize={10}
                    fontWeight="bold"
                  >
                    {stage.label}
                  </text>
                  <text
                    x={totalW / 2}
                    y={y + blockH / 2 + 10}
                    textAnchor="middle"
                    fill="currentColor"
                    fillOpacity={isActive ? 0.6 : 0.3}
                    fontSize={7}
                  >
                    {stage.description}
                  </text>

                  {/* Full fine-tune highlight: entire block glows */}
                  {isTraining && method === 'full' && (
                    <motion.rect
                      x={x + 3}
                      y={y + 3}
                      width={blockW - 6}
                      height={blockH - 6}
                      rx={6}
                      fill="none"
                      stroke={`rgba(${stage.color}, 0.5)`}
                      strokeWidth={1.5}
                      strokeDasharray="4 2"
                      animate={{ opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}

                  {/* LoRA adapters: small blocks flanking the main block */}
                  {isTraining && method === 'lora' && (
                    <>
                      {/* Left adapter A */}
                      <motion.rect
                        x={x - adapterW - 8}
                        y={y + (blockH - adapterH) / 2}
                        width={adapterW}
                        height={adapterH}
                        rx={4}
                        fill={`rgba(${stage.color}, 0.3)`}
                        stroke={`rgba(${stage.color}, 0.6)`}
                        strokeWidth={1}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <text
                        x={x - adapterW / 2 - 8}
                        y={y + blockH / 2 + 3}
                        textAnchor="middle"
                        fill={`rgba(${stage.color}, 0.8)`}
                        fontSize={7}
                        fontWeight="bold"
                      >
                        A
                      </text>

                      {/* Right adapter B */}
                      <motion.rect
                        x={x + blockW + 8}
                        y={y + (blockH - adapterH) / 2}
                        width={adapterW}
                        height={adapterH}
                        rx={4}
                        fill={`rgba(${stage.color}, 0.3)`}
                        stroke={`rgba(${stage.color}, 0.6)`}
                        strokeWidth={1}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                      />
                      <text
                        x={x + blockW + adapterW / 2 + 8}
                        y={y + blockH / 2 + 3}
                        textAnchor="middle"
                        fill={`rgba(${stage.color}, 0.8)`}
                        fontSize={7}
                        fontWeight="bold"
                      >
                        B
                      </text>

                      {/* Connection lines */}
                      <line
                        x1={x - 8}
                        y1={y + blockH / 2}
                        x2={x}
                        y2={y + blockH / 2}
                        stroke={`rgba(${stage.color}, 0.3)`}
                        strokeWidth={0.8}
                        strokeDasharray="2 2"
                      />
                      <line
                        x1={x + blockW}
                        y1={y + blockH / 2}
                        x2={x + blockW + 8}
                        y2={y + blockH / 2}
                        stroke={`rgba(${stage.color}, 0.3)`}
                        strokeWidth={0.8}
                        strokeDasharray="2 2"
                      />

                      {/* "Frozen" label on main block */}
                      <text
                        x={totalW / 2}
                        y={y - 4}
                        textAnchor="middle"
                        fill="currentColor"
                        fillOpacity={0.3}
                        fontSize={6}
                      >
                        frozen weights
                      </text>
                    </>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          {/* Method toggle */}
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-1.5 block">Training Method</label>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setMethod('full')}
                className={`flex-1 text-xs px-3 py-1.5 transition ${
                  method === 'full'
                    ? 'bg-red-500/20 text-red-300'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Full Fine-Tune
              </button>
              <button
                onClick={() => setMethod('lora')}
                className={`flex-1 text-xs px-3 py-1.5 transition border-l border-border ${
                  method === 'lora'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                LoRA
              </button>
            </div>
          </div>

          {/* Parameter comparison bar */}
          <div className="bg-muted border border-border p-3 rounded-xl space-y-2">
            <div className="text-xs uppercase font-bold text-muted-foreground">Trainable Parameters</div>
            <div className="space-y-1.5">
              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total model params</span>
                  <span className="font-mono text-indigo-400">7.0B</span>
                </div>
                <div className="w-full h-1.5 bg-accent rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500/40 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Trained ({method})</span>
                  <span className={`font-mono ${method === 'full' ? 'text-red-400' : 'text-amber-400'}`}>
                    {method === 'full' ? '7.0B' : '18M'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-accent rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${method === 'full' ? 'bg-red-500/60' : 'bg-amber-500/60'}`}
                    animate={{ width: `${Math.max(ratio * 100, 1)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              <div className="text-xs font-mono text-center" style={{ color: method === 'full' ? 'rgba(248, 113, 113, 0.8)' : 'rgba(251, 191, 36, 0.8)' }}>
                {method === 'full' ? '100% of weights updated' : `${((loraParams / totalParams) * 100).toFixed(2)}% of weights updated`}
              </div>
            </div>
          </div>

          {/* Stage detail panel */}
          <div className="bg-muted border border-border p-3 rounded-xl space-y-2">
            <div className="text-xs uppercase font-bold text-muted-foreground">
              {STAGES[activeStage].label} Detail
            </div>

            {activeStage === 0 && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Large language model pre-trained on trillions of tokens. Good at next-token prediction, not at following instructions.</p>
                <div className="font-mono text-indigo-400 mt-2">7B parameters, 32 layers</div>
              </div>
            )}

            {activeStage === 1 && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Instruction-response pairs:</div>
                {SFT_EXAMPLES.map((ex, i) => (
                  <div key={i} className="bg-card/50 rounded-lg p-2 space-y-1 border border-border/50">
                    <div className="text-sm font-mono">
                      <span className="text-amber-400">IN:</span>{' '}
                      <span className="text-muted-foreground">{ex.input}</span>
                    </div>
                    <div className="text-sm font-mono">
                      <span className="text-emerald-400">OUT:</span>{' '}
                      <span className="text-muted-foreground">{ex.output}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeStage === 2 && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Preference pairs (chosen vs rejected):</div>
                {PREFERENCE_PAIRS.map((pair, i) => (
                  <div key={i} className="bg-card/50 rounded-lg p-2 space-y-1 border border-border/50">
                    <div className="text-sm font-mono text-muted-foreground">{pair.prompt}</div>
                    <div className="text-sm font-mono">
                      <span className="text-emerald-400">+</span>{' '}
                      <span className="text-emerald-300/70">{pair.chosen.slice(0, 50)}...</span>
                    </div>
                    <div className="text-sm font-mono">
                      <span className="text-red-400">-</span>{' '}
                      <span className="text-red-300/70">{pair.rejected.slice(0, 50)}...</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeStage === 3 && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Model aligned with human preferences, ready for production. Follows instructions, avoids harmful outputs, produces well-formatted responses.</p>
                <div className="font-mono text-emerald-400 mt-2">Eval: MMLU +2.3%, MT-Bench 8.4/10</div>
              </div>
            )}
          </div>

          {/* Stage selector */}
          <div className="flex flex-wrap gap-1">
            {STAGES.map((stage, i) => (
              <button
                key={i}
                onClick={() => handleStageClick(i)}
                className={`text-xs px-2 py-1 rounded-md border transition ${
                  i === activeStage
                    ? `border-opacity-40 text-opacity-90`
                    : 'border-border text-muted-foreground'
                }`}
                style={
                  i === activeStage
                    ? { borderColor: `rgba(${stage.color}, 0.4)`, color: `rgba(${stage.color}, 0.9)`, background: `rgba(${stage.color}, 0.1)` }
                    : undefined
                }
              >
                {stage.label}
              </button>
            ))}
          </div>

          <div className="mt-auto bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg">
            <p className="text-xs text-emerald-300 leading-relaxed italic">
              Fine-tuning adapts a pre-trained model to specific tasks. SFT teaches instruction following, RLHF/DPO aligns outputs with human preferences. LoRA reduces training cost by only updating low-rank adapter matrices attached to frozen weights.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
