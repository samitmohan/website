'use client'

import { useState, useCallback } from 'react'

const REACT_STEPS = [
  {
    type: 'thought' as const,
    label: 'Thought 1',
    content: 'I need to find the population of France and Germany, then compare them.',
    color: 'rgb(96, 165, 250)',
    bg: 'rgba(96, 165, 250, 0.1)',
    border: 'rgba(96, 165, 250, 0.3)',
  },
  {
    type: 'action' as const,
    label: 'Action 1',
    content: 'search("population of France 2024")',
    color: 'rgb(251, 146, 60)',
    bg: 'rgba(251, 146, 60, 0.1)',
    border: 'rgba(251, 146, 60, 0.3)',
  },
  {
    type: 'observation' as const,
    label: 'Observation 1',
    content: 'France has an estimated population of 68.4 million as of 2024.',
    color: 'rgb(74, 222, 128)',
    bg: 'rgba(74, 222, 128, 0.1)',
    border: 'rgba(74, 222, 128, 0.3)',
  },
  {
    type: 'thought' as const,
    label: 'Thought 2',
    content: 'Got France: 68.4M. Now I need Germany\'s population.',
    color: 'rgb(96, 165, 250)',
    bg: 'rgba(96, 165, 250, 0.1)',
    border: 'rgba(96, 165, 250, 0.3)',
  },
  {
    type: 'action' as const,
    label: 'Action 2',
    content: 'search("population of Germany 2024")',
    color: 'rgb(251, 146, 60)',
    bg: 'rgba(251, 146, 60, 0.1)',
    border: 'rgba(251, 146, 60, 0.3)',
  },
  {
    type: 'observation' as const,
    label: 'Observation 2',
    content: 'Germany has an estimated population of 84.5 million as of 2024.',
    color: 'rgb(74, 222, 128)',
    bg: 'rgba(74, 222, 128, 0.1)',
    border: 'rgba(74, 222, 128, 0.3)',
  },
  {
    type: 'thought' as const,
    label: 'Thought 3',
    content: 'France: 68.4M, Germany: 84.5M. Germany has ~16.1M more people. I can answer now.',
    color: 'rgb(96, 165, 250)',
    bg: 'rgba(96, 165, 250, 0.1)',
    border: 'rgba(96, 165, 250, 0.3)',
  },
  {
    type: 'action' as const,
    label: 'Final Answer',
    content: 'Germany (84.5M) has a larger population than France (68.4M) by about 16.1 million.',
    color: 'rgb(168, 85, 247)',
    bg: 'rgba(168, 85, 247, 0.1)',
    border: 'rgba(168, 85, 247, 0.3)',
  },
]

export default function ReActAgentViz() {
  const [step, setStep] = useState(-1)

  const handleNext = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, REACT_STEPS.length - 1))
  }, [])

  const handlePrev = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, -1))
  }, [])

  const handleReset = useCallback(() => {
    setStep(-1)
  }, [])

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-blue-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold">ReAct Agent Loop</h3>
          <p className="text-xs text-muted-foreground">Thought - Action - Observation - repeat until answer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 space-y-2">
          {/* Query */}
          <div className="bg-muted border border-border rounded-lg p-3">
            <div className="text-xs uppercase font-bold text-muted-foreground mb-1">User Query</div>
            <div className="text-xs font-mono text-foreground">Which country has more people, France or Germany?</div>
          </div>

          {/* ReAct steps */}
          <div className="space-y-2 max-h-[320px] overflow-y-auto">
            {REACT_STEPS.map((s, i) => (
              <div
                key={i}
                className="rounded-lg p-3 border transition-all duration-300"
                style={{
                  opacity: i <= step ? 1 : 0.15,
                  backgroundColor: i <= step ? s.bg : 'transparent',
                  borderColor: i <= step ? s.border : 'rgba(255,255,255,0.05)',
                  transform: i <= step ? 'translateX(0)' : 'translateX(8px)',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs font-bold uppercase px-1.5 py-0.5 rounded"
                    style={{ color: s.color, backgroundColor: s.bg }}
                  >
                    {s.label}
                  </span>
                  {s.type === 'thought' && (
                    <svg className="w-3 h-3" style={{ color: s.color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a8 8 0 0 0-8 8c0 3 1.5 5 3 6.5V20h10v-3.5c1.5-1.5 3-3.5 3-6.5a8 8 0 0 0-8-8z" />
                      <path d="M10 22h4" />
                    </svg>
                  )}
                  {s.type === 'action' && (
                    <svg className="w-3 h-3" style={{ color: s.color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  )}
                  {s.type === 'observation' && (
                    <svg className="w-3 h-3" style={{ color: s.color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    </svg>
                  )}
                </div>
                <div className="text-xs font-mono" style={{ color: i <= step ? s.color : 'inherit' }}>
                  {s.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          {/* Controls */}
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
              disabled={step >= REACT_STEPS.length - 1}
              className="text-xs px-4 py-1.5 rounded-lg border bg-blue-500/20 border-blue-500/40 text-blue-300 transition hover:bg-blue-500/30 disabled:opacity-30"
            >
              Next ({step + 2}/{REACT_STEPS.length})
            </button>
            <button
              onClick={handleReset}
              className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground transition hover:text-foreground"
            >
              Reset
            </button>
          </div>

          {/* Current step info */}
          <div className="bg-muted border border-border p-3 rounded-xl space-y-2">
            <div className="text-xs uppercase font-bold text-muted-foreground">Current Step</div>
            {step >= 0 ? (
              <>
                <div className="text-sm font-mono" style={{ color: REACT_STEPS[step].color }}>
                  {REACT_STEPS[step].label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {REACT_STEPS[step].type === 'thought' && 'LLM reasons about what to do next'}
                  {REACT_STEPS[step].type === 'action' && 'LLM calls a tool or produces final answer'}
                  {REACT_STEPS[step].type === 'observation' && 'Tool returns a result back to the LLM'}
                </div>
              </>
            ) : (
              <div className="text-xs text-muted-foreground">Press Next to step through the ReAct loop</div>
            )}
          </div>

          {/* Loop diagram */}
          <div className="bg-muted border border-border p-3 rounded-xl">
            <div className="text-xs uppercase font-bold text-muted-foreground mb-2">ReAct Loop</div>
            <svg viewBox="0 0 160 80" className="w-full h-auto">
              {/* Thought */}
              <rect x="5" y="5" width="44" height="24" rx="4" fill="rgba(96,165,250,0.15)" stroke="rgba(96,165,250,0.4)" strokeWidth="1" />
              <text x="27" y="20" textAnchor="middle" fill="rgb(96,165,250)" fontSize="7" fontWeight="bold">Thought</text>
              {/* Arrow T->A */}
              <line x1="49" y1="17" x2="57" y2="17" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <polygon points="57,14 57,20 62,17" fill="rgba(255,255,255,0.3)" />
              {/* Action */}
              <rect x="62" y="5" width="40" height="24" rx="4" fill="rgba(251,146,60,0.15)" stroke="rgba(251,146,60,0.4)" strokeWidth="1" />
              <text x="82" y="20" textAnchor="middle" fill="rgb(251,146,60)" fontSize="7" fontWeight="bold">Action</text>
              {/* Arrow A->O */}
              <line x1="102" y1="17" x2="110" y2="17" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <polygon points="110,14 110,20 115,17" fill="rgba(255,255,255,0.3)" />
              {/* Observation */}
              <rect x="115" y="5" width="40" height="24" rx="4" fill="rgba(74,222,128,0.15)" stroke="rgba(74,222,128,0.4)" strokeWidth="1" />
              <text x="135" y="20" textAnchor="middle" fill="rgb(74,222,128)" fontSize="6.5" fontWeight="bold">Observe</text>
              {/* Loop arrow back */}
              <path d="M 135 29 L 135 50 Q 135 58 127 58 L 33 58 Q 25 58 25 50 L 25 29" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="3,2" />
              <polygon points="22,29 28,29 25,24" fill="rgba(255,255,255,0.2)" />
              <text x="80" y="68" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="6">repeat until done</text>
            </svg>
          </div>

          {/* Legend */}
          <div className="bg-muted border border-border p-3 rounded-xl space-y-1">
            <div className="text-xs uppercase font-bold text-muted-foreground">Legend</div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(96,165,250,0.5)' }} />
              <span className="text-muted-foreground">Thought (reasoning)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(251,146,60,0.5)' }} />
              <span className="text-muted-foreground">Action (tool call)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(74,222,128,0.5)' }} />
              <span className="text-muted-foreground">Observation (tool result)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(168,85,247,0.5)' }} />
              <span className="text-muted-foreground">Final answer</span>
            </div>
          </div>

          <div className="mt-auto bg-blue-500/5 border border-blue-500/10 p-3 rounded-lg">
            <p className="text-xs text-blue-300 leading-relaxed italic">
              ReAct interleaves reasoning (Thought) with tool use (Action) and feedback (Observation). The LLM decides when it has enough information to produce a final answer.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
