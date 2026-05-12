'use client'

import { useState } from 'react'

type Stage = 'sft' | 'rm' | 'ppo'

interface StageData {
  title: string
  shortTitle: string
  color: string
  borderColor: string
  bgColor: string
  inputs: string[]
  outputs: string[]
  details: string[]
}

const STAGES: Record<Stage, StageData> = {
  sft: {
    title: 'Supervised Fine-Tuning',
    shortTitle: 'SFT',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/40',
    bgColor: 'bg-blue-500/10',
    inputs: ['Pre-trained LLM', 'Demonstration data (instruction, response)'],
    outputs: ['SFT Model (pi_sft)'],
    details: [
      'Train on high-quality demonstrations',
      'Standard cross-entropy loss on tokens',
      'Produces a model that follows instructions',
      'This model initializes both the RM and PPO policy',
    ],
  },
  rm: {
    title: 'Reward Model Training',
    shortTitle: 'RM',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    bgColor: 'bg-amber-500/10',
    inputs: ['SFT Model (as initialization)', 'Human preference pairs (chosen, rejected)'],
    outputs: ['Reward Model r(x, y)'],
    details: [
      'Initialized from SFT model weights',
      'Replaces final layer with scalar head',
      'Bradley-Terry loss: -log sigma(r_w - r_l)',
      'Learns to predict human preferences',
    ],
  },
  ppo: {
    title: 'PPO (Proximal Policy Optimization)',
    shortTitle: 'PPO',
    color: 'text-green-400',
    borderColor: 'border-green-500/40',
    bgColor: 'bg-green-500/10',
    inputs: ['SFT Model (as reference pi_ref)', 'Reward Model r(x, y)', 'Prompt dataset'],
    outputs: ['Aligned Model (pi_rlhf)'],
    details: [
      'Policy generates responses to prompts',
      'RM scores each response',
      'PPO maximizes: E[r(x, y)] - beta * KL(pi || pi_ref)',
      'KL penalty prevents reward hacking',
    ],
  },
}

const STAGE_ORDER: Stage[] = ['sft', 'rm', 'ppo']

export default function RLHFPipelineViz() {
  const [expandedStage, setExpandedStage] = useState<Stage | null>(null)
  const [showKL, setShowKL] = useState(false)

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-emerald-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-emerald-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold">RLHF Pipeline</h3>
          <p className="text-xs text-muted-foreground">Three stages: SFT -&gt; Reward Model -&gt; PPO alignment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 space-y-4">
          {/* Pipeline visualization */}
          <div className="flex items-start gap-2">
            {STAGE_ORDER.map((stageKey, idx) => {
              const stage = STAGES[stageKey]
              const isExpanded = expandedStage === stageKey
              return (
                <div key={stageKey} className="flex items-start gap-2 flex-1">
                  <button
                    onClick={() => setExpandedStage(isExpanded ? null : stageKey)}
                    className={`flex-1 border rounded-xl p-3 transition-all text-left ${
                      isExpanded
                        ? `${stage.borderColor} ${stage.bgColor} ring-1 ring-current/20`
                        : 'border-border bg-card/50 hover:border-current/30'
                    }`}
                    style={{ color: isExpanded ? undefined : undefined }}
                  >
                    <div className={`text-sm uppercase font-bold ${stage.color} mb-1`}>
                      Stage {idx + 1}
                    </div>
                    <div className="text-xs font-bold mb-2">{stage.shortTitle}</div>

                    {/* Inputs */}
                    <div className="space-y-0.5 mb-2">
                      <div className="text-[8px] uppercase text-muted-foreground">Inputs</div>
                      {stage.inputs.map((inp, i) => (
                        <div key={i} className="text-sm text-muted-foreground flex items-center gap-1">
                          <span className={`w-1 h-1 rounded-full ${stage.bgColor} border ${stage.borderColor}`} />
                          {inp}
                        </div>
                      ))}
                    </div>

                    {/* Outputs */}
                    <div className="space-y-0.5">
                      <div className="text-[8px] uppercase text-muted-foreground">Outputs</div>
                      {stage.outputs.map((out, i) => (
                        <div key={i} className={`text-sm ${stage.color} font-mono flex items-center gap-1`}>
                          <span className={`w-1 h-1 rounded-full`} style={{ backgroundColor: 'currentColor' }} />
                          {out}
                        </div>
                      ))}
                    </div>
                  </button>
                  {idx < 2 && (
                    <svg className="w-4 h-4 text-muted-foreground mt-8 shrink-0" viewBox="0 0 12 12">
                      <path d="M3 2l5 4-5 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  )}
                </div>
              )
            })}
          </div>

          {/* Expanded details */}
          {expandedStage && (
            <div className={`border rounded-xl p-3 ${STAGES[expandedStage].borderColor} ${STAGES[expandedStage].bgColor}`}>
              <div className={`text-xs uppercase font-bold ${STAGES[expandedStage].color} mb-2`}>
                {STAGES[expandedStage].title} - Details
              </div>
              <div className="space-y-1.5">
                {STAGES[expandedStage].details.map((d, i) => (
                  <div key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                    <span className="text-muted-foreground mt-0.5">{i + 1}.</span>
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KL Divergence */}
          {showKL && (
            <div className="border border-emerald-500/30 rounded-xl p-3 bg-emerald-500/5">
              <div className="text-xs uppercase font-bold text-emerald-400 mb-2">KL Divergence Constraint in PPO</div>
              <div className="font-mono text-xs text-foreground/80 space-y-1.5">
                <div>Objective = E[r(x, y)] - beta * KL(pi || pi_ref)</div>
                <div className="text-muted-foreground text-xs">
                  The KL term penalizes the policy for deviating from the reference (SFT) model.
                </div>
                <div className="text-muted-foreground text-xs">
                  Without it, the policy "hacks" the reward model by producing degenerate outputs that score high but are low quality.
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {['beta = 0.01', 'beta = 0.1', 'beta = 1.0'].map((b, i) => (
                    <div key={b} className="border border-emerald-500/20 rounded-lg p-2 text-center">
                      <div className="text-sm font-mono text-emerald-400">{b}</div>
                      <div className="text-[8px] text-muted-foreground mt-0.5">
                        {i === 0 ? 'Weak constraint (may reward-hack)' : i === 1 ? 'Balanced (typical)' : 'Strong constraint (conservative)'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div>
            <div className="text-xs uppercase font-bold text-muted-foreground mb-2">Expand Stage</div>
            <div className="flex flex-col gap-1.5">
              {STAGE_ORDER.map(s => (
                <button
                  key={s}
                  onClick={() => setExpandedStage(expandedStage === s ? null : s)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition text-left ${
                    expandedStage === s
                      ? `${STAGES[s].bgColor} ${STAGES[s].borderColor} ${STAGES[s].color}`
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  {STAGES[s].shortTitle}: {STAGES[s].title}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowKL(!showKL)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition ${
              showKL ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'border-border text-muted-foreground'
            }`}
          >
            {showKL ? 'Hide KL Details' : 'Show KL Divergence'}
          </button>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-2">
            <div className="text-xs uppercase font-bold text-muted-foreground">Data Requirements</div>
            <div className="text-xs font-mono space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">SFT</span><span className="text-blue-400">~10K demos</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">RM</span><span className="text-amber-400">~50K pairs</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">PPO</span><span className="text-green-400">~100K prompts</span></div>
            </div>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-2">
            <div className="text-xs uppercase font-bold text-muted-foreground">Models in PPO</div>
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500/60" />
                <span className="text-muted-foreground">Policy (trainable)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500/60" />
                <span className="text-muted-foreground">Reference (frozen SFT)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500/60" />
                <span className="text-muted-foreground">Reward model (frozen)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500/60" />
                <span className="text-muted-foreground">Value head (trainable)</span>
              </div>
            </div>
          </div>

          <div className="mt-auto bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg">
            <p className="text-xs text-emerald-300 leading-relaxed italic">
              RLHF uses three stages: SFT teaches instruction following, the reward model captures human preferences, and PPO optimizes the policy against the reward while staying close to the SFT model via KL divergence.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}