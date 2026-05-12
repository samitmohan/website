'use client'

import { useState, useMemo } from 'react'

const PROMPT = 'Explain how photosynthesis works.'

const RESPONSES = [
  {
    text: 'Photosynthesis is the process by which green plants convert sunlight, water, and carbon dioxide into glucose and oxygen. It occurs in the chloroplasts, primarily using chlorophyll to capture light energy.',
    baseScore: 4.2,
  },
  {
    text: 'Plants eat sunlight lol. They just like turn it into food or something. Its pretty cool I guess but idk the details tbh.',
    baseScore: 1.1,
  },
]

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

export default function RewardModelViz() {
  const [chosenIdx, setChosenIdx] = useState(0)
  const [showFormula, setShowFormula] = useState(false)

  const rejectedIdx = chosenIdx === 0 ? 1 : 0
  const chosenScore = RESPONSES[chosenIdx].baseScore
  const rejectedScore = RESPONSES[rejectedIdx].baseScore

  const { loss, prob } = useMemo(() => {
    const diff = chosenScore - rejectedScore
    const p = sigmoid(diff)
    const l = -Math.log(p)
    return { loss: Math.round(l * 1000) / 1000, prob: Math.round(p * 1000) / 1000 }
  }, [chosenScore, rejectedScore])

  const maxScore = Math.max(chosenScore, rejectedScore)

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-rose-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-rose-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Reward Model Training</h3>
          <p className="text-xs text-muted-foreground">Bradley-Terry model: maximize P(chosen &gt; rejected)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 space-y-3">
          {/* Prompt */}
          <div className="border border-border rounded-lg p-2 bg-card/50">
            <div className="text-sm uppercase font-bold text-muted-foreground mb-1">Prompt</div>
            <div className="text-xs font-mono">{PROMPT}</div>
          </div>

          {/* Two response boxes */}
          <div className="grid grid-cols-2 gap-3">
            {RESPONSES.map((resp, i) => {
              const isChosen = i === chosenIdx
              return (
                <button
                  key={i}
                  onClick={() => setChosenIdx(i)}
                  className={`text-left border rounded-xl p-3 transition-all ${
                    isChosen
                      ? 'border-green-500/50 bg-green-500/5 ring-1 ring-green-500/20'
                      : 'border-red-500/50 bg-red-500/5 ring-1 ring-red-500/20'
                  }`}
                >
                  <div className={`text-sm uppercase font-bold mb-1.5 ${isChosen ? 'text-green-400' : 'text-red-400'}`}>
                    {isChosen ? 'Chosen' : 'Rejected'} (click to swap)
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{resp.text}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-xs font-mono font-bold ${isChosen ? 'text-green-400' : 'text-red-400'}`}>
                      r = {resp.baseScore.toFixed(1)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Reward bar chart */}
          <div className="border border-border rounded-xl p-3 bg-card/50">
            <div className="text-sm uppercase font-bold text-muted-foreground mb-2">Reward Scores</div>
            <div className="space-y-2">
              {RESPONSES.map((resp, i) => {
                const isChosen = i === chosenIdx
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`text-sm w-14 ${isChosen ? 'text-green-400' : 'text-red-400'}`}>
                      {isChosen ? 'Chosen' : 'Rejected'}
                    </span>
                    <div className="flex-1 h-5 bg-accent rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isChosen ? 'bg-green-500/70' : 'bg-red-500/70'}`}
                        style={{ width: `${(resp.baseScore / (maxScore + 0.5)) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono w-8 text-right">{resp.baseScore.toFixed(1)}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Formula */}
          {showFormula && (
            <div className="border border-rose-500/30 rounded-xl p-3 bg-rose-500/5">
              <div className="text-sm uppercase font-bold text-rose-400 mb-2">Bradley-Terry Model</div>
              <div className="font-mono text-xs text-foreground/80 space-y-1.5">
                <div>P(y_w &gt; y_l) = sigma(r(y_w) - r(y_l))</div>
                <div className="text-muted-foreground">= sigma({chosenScore.toFixed(1)} - {rejectedScore.toFixed(1)})</div>
                <div className="text-muted-foreground">= sigma({(chosenScore - rejectedScore).toFixed(1)}) = <span className="text-rose-400">{prob}</span></div>
                <div className="border-t border-rose-500/20 pt-1.5 mt-1.5">
                  Loss = -log P(y_w &gt; y_l) = <span className="text-rose-400">{loss}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <button
            onClick={() => setShowFormula(!showFormula)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition ${
              showFormula ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'border-border text-muted-foreground'
            }`}
          >
            {showFormula ? 'Hide Formula' : 'Show Bradley-Terry'}
          </button>

          <button
            onClick={() => setChosenIdx(chosenIdx === 0 ? 1 : 0)}
            className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:border-rose-500/30 transition"
          >
            Swap Preference
          </button>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-2">
            <div className="text-xs uppercase font-bold text-muted-foreground">Training Signal</div>
            <div className="text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">r(chosen)</span>
                <span className="text-green-400">{chosenScore.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">r(rejected)</span>
                <span className="text-red-400">{rejectedScore.toFixed(1)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1">
                <span className="text-muted-foreground">P(chosen wins)</span>
                <span className="text-rose-400">{prob}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loss</span>
                <span className="text-rose-400">{loss}</span>
              </div>
            </div>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl">
            <div className="text-xs uppercase font-bold text-muted-foreground mb-1">Loss Indicator</div>
            <div className="w-full h-3 bg-accent rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500/70 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, loss * 40)}%` }}
              />
            </div>
            <div className="flex justify-between text-[8px] text-muted-foreground mt-1">
              <span>Low (correct)</span><span>High (wrong)</span>
            </div>
          </div>

          <div className="mt-auto bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg">
            <p className="text-xs text-rose-300 leading-relaxed italic">
              The reward model learns from human preferences. When you swap the chosen/rejected labels, the loss {chosenIdx === 0 ? 'stays low because the better response is chosen' : 'increases because the worse response is labeled as chosen'}. The model optimizes to assign higher rewards to preferred outputs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}