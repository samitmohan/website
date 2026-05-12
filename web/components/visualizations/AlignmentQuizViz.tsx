'use client'

import { useState } from 'react'

type Method = 'sft' | 'rlhf' | 'dpo' | 'orpo' | 'kto'
type Rating = 'good' | 'moderate' | 'hard'

interface MethodData {
  name: string
  fullName: string
  data: Rating
  compute: Rating
  stability: Rating
  quality: Rating
  description: string
}

const METHODS: Record<Method, MethodData> = {
  sft: {
    name: 'SFT',
    fullName: 'Supervised Fine-Tuning',
    data: 'moderate',
    compute: 'good',
    stability: 'good',
    quality: 'moderate',
    description: 'Train on demonstration data with standard cross-entropy loss. The simplest alignment method - just show the model good examples. Limited by the quality of demonstrations and cannot learn relative preferences between responses.',
  },
  rlhf: {
    name: 'RLHF',
    fullName: 'RL from Human Feedback',
    data: 'hard',
    compute: 'hard',
    stability: 'hard',
    quality: 'good',
    description: 'Three-stage pipeline: SFT, reward model training, then PPO optimization. Produces the highest quality alignment but requires training 4 models simultaneously during PPO (policy, reference, reward, value). Complex infrastructure and many hyperparameters to tune.',
  },
  dpo: {
    name: 'DPO',
    fullName: 'Direct Preference Optimization',
    data: 'moderate',
    compute: 'moderate',
    stability: 'good',
    quality: 'good',
    description: 'Skips the reward model entirely by reparameterizing the RLHF objective into a supervised loss on preference pairs. Same objective as RLHF but only needs the policy and reference model. Much simpler to implement - just a modified cross-entropy loss.',
  },
  orpo: {
    name: 'ORPO',
    fullName: 'Odds Ratio Preference Optimization',
    data: 'moderate',
    compute: 'good',
    stability: 'good',
    quality: 'moderate',
    description: 'Combines SFT and preference alignment into a single training stage. Uses an odds ratio-based penalty that does not require a reference model. Reduces compute by eliminating the separate SFT step, though quality may trail DPO/RLHF on harder tasks.',
  },
  kto: {
    name: 'KTO',
    fullName: 'Kahneman-Tversky Optimization',
    data: 'good',
    compute: 'moderate',
    stability: 'moderate',
    quality: 'moderate',
    description: 'Works with binary feedback (thumbs up/down) instead of pairwise preferences. Based on prospect theory - humans weigh losses more than gains. Great when you have lots of binary signals but not paired comparisons. Data collection is much cheaper.',
  },
}

const METHOD_ORDER: Method[] = ['sft', 'rlhf', 'dpo', 'orpo', 'kto']
const COLUMNS = ['Data Needed', 'Compute', 'Stability', 'Quality']

const RATING_COLORS: Record<Rating, { bg: string; text: string; label: string }> = {
  good: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Easy' },
  moderate: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Medium' },
  hard: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Hard' },
}

const QUALITY_LABELS: Record<Rating, string> = {
  good: 'High',
  moderate: 'Medium',
  hard: 'Low',
}

export default function AlignmentQuizViz() {
  const [selected, setSelected] = useState<Method | null>(null)

  function getRating(method: MethodData, col: string): Rating {
    switch (col) {
      case 'Data Needed': return method.data
      case 'Compute': return method.compute
      case 'Stability': return method.stability
      case 'Quality': return method.quality
      default: return 'moderate'
    }
  }

  function getCellLabel(rating: Rating, col: string): string {
    if (col === 'Quality') return QUALITY_LABELS[rating]
    return RATING_COLORS[rating].label
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-cyan-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-cyan-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Alignment Methods Comparison</h3>
          <p className="text-xs text-muted-foreground">Click a method to see details and tradeoffs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 overflow-x-auto">
          {/* Comparison table */}
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left p-2 text-sm uppercase text-muted-foreground font-bold">Method</th>
                {COLUMNS.map(col => (
                  <th key={col} className="text-center p-2 text-sm uppercase text-muted-foreground font-bold">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METHOD_ORDER.map(key => {
                const method = METHODS[key]
                const isSelected = selected === key
                return (
                  <tr
                    key={key}
                    onClick={() => setSelected(isSelected ? null : key)}
                    className={`cursor-pointer transition-all border-l-2 ${
                      isSelected
                        ? 'border-l-cyan-400 bg-cyan-500/5'
                        : 'border-l-transparent hover:bg-muted/30'
                    }`}
                  >
                    <td className="p-2">
                      <div className={`font-bold ${isSelected ? 'text-cyan-400' : ''}`}>{method.name}</div>
                      <div className="text-sm text-muted-foreground">{method.fullName}</div>
                    </td>
                    {COLUMNS.map(col => {
                      const rating = getRating(method, col)
                      const colors = RATING_COLORS[rating]
                      const label = getCellLabel(rating, col)
                      return (
                        <td key={col} className="p-2 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-mono ${colors.bg} ${colors.text}`}>
                            {label}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Selected method description */}
          {selected && (
            <div className="mt-4 border border-cyan-500/30 rounded-xl p-3 bg-cyan-500/5">
              <div className="text-xs uppercase font-bold text-cyan-400 mb-1">
                {METHODS[selected].fullName} ({METHODS[selected].name})
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {METHODS[selected].description}
              </p>
            </div>
          )}

          {/* Legend */}
          <div className="mt-3 flex items-center gap-4">
            <span className="text-sm text-muted-foreground uppercase font-bold">Legend:</span>
            {(['good', 'moderate', 'hard'] as Rating[]).map(r => (
              <div key={r} className="flex items-center gap-1">
                <span className={`w-2.5 h-2.5 rounded-sm ${RATING_COLORS[r].bg} border ${r === 'good' ? 'border-green-500/40' : r === 'moderate' ? 'border-amber-500/40' : 'border-red-500/40'}`} />
                <span className={`text-sm ${RATING_COLORS[r].text}`}>{RATING_COLORS[r].label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div>
            <div className="text-xs uppercase font-bold text-muted-foreground mb-2">Quick Select</div>
            <div className="flex flex-col gap-1.5">
              {METHOD_ORDER.map(m => (
                <button
                  key={m}
                  onClick={() => setSelected(selected === m ? null : m)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition text-left ${
                    selected === m
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                      : 'border-border text-muted-foreground hover:border-cyan-500/30'
                  }`}
                >
                  {METHODS[m].name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-2">
            <div className="text-xs uppercase font-bold text-muted-foreground">Key Tradeoffs</div>
            <div className="text-xs space-y-1.5">
              <div className="flex items-start gap-1.5">
                <span className="text-cyan-400 mt-0.5">-</span>
                <span className="text-muted-foreground">RLHF gives the best quality but needs 4 models running during PPO</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-cyan-400 mt-0.5">-</span>
                <span className="text-muted-foreground">DPO matches RLHF quality with much less infrastructure</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-cyan-400 mt-0.5">-</span>
                <span className="text-muted-foreground">KTO only needs binary labels, making data collection cheap</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-cyan-400 mt-0.5">-</span>
                <span className="text-muted-foreground">ORPO combines SFT + alignment into one step</span>
              </div>
            </div>
          </div>

          <div className="mt-auto bg-cyan-500/5 border border-cyan-500/10 p-3 rounded-lg">
            <p className="text-xs text-cyan-300 leading-relaxed italic">
              {selected
                ? `${METHODS[selected].name}: ${METHODS[selected].data === 'good' ? 'Low' : METHODS[selected].data === 'moderate' ? 'Medium' : 'High'} data cost, ${METHODS[selected].compute === 'good' ? 'low' : METHODS[selected].compute === 'moderate' ? 'medium' : 'high'} compute. ${METHODS[selected].quality === 'good' ? 'High' : 'Medium'} output quality.`
                : 'Click a method in the table to see a detailed description of how it works and what tradeoffs it makes.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}