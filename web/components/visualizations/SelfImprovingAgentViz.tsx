'use client'

import { useState } from 'react'

const phases = ['Observe', 'Plan', 'Act', 'Evaluate', 'Improve'] as const
type Phase = typeof phases[number]

const phaseDetails: Record<Phase, string> = {
  Observe: 'Agent reads task description, retrieves context from memory, scans available tools.',
  Plan: 'Generates a step-by-step plan. Compares against past failures to avoid repeated mistakes.',
  Act: 'Executes plan steps. Uses tools, writes code, calls APIs. Streams intermediate results.',
  Evaluate: 'Checks output against success criteria. Scores quality. Identifies failure modes.',
  Improve: 'Updates prompt strategy, adjusts tool selection, adds self-critique notes to memory.',
}

const strategies = [
  { id: 'prompt', label: 'Prompt Refinement', desc: 'Adjusts system prompt based on error patterns' },
  { id: 'tools', label: 'Tool Selection', desc: 'Switches tools when current ones underperform' },
  { id: 'critique', label: 'Self-Critique', desc: 'Generates critique before final answer' },
]

export default function SelfImprovingAgentViz() {
  const [cycle, setCycle] = useState(0)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [activeStrategies, setActiveStrategies] = useState<Set<string>>(new Set(['prompt']))
  const [memory, setMemory] = useState<string[]>([])

  const maxCycles = 8
  const phase = phases[phaseIdx]
  const baseScore = 35
  const strategyBonus = activeStrategies.size * 5
  const performance = Math.min(98, baseScore + cycle * (7 + strategyBonus / 3))

  const stepForward = () => {
    if (phaseIdx < phases.length - 1) {
      setPhaseIdx(phaseIdx + 1)
    } else {
      if (cycle < maxCycles) {
        const note = `Cycle ${cycle + 1}: score ${performance}% - ${
          performance < 60 ? 'needs better planning' : performance < 80 ? 'tool selection helped' : 'strong execution'
        }`
        setMemory((prev) => [note, ...prev].slice(0, 5))
        setCycle(cycle + 1)
        setPhaseIdx(0)
      }
    }
  }

  const reset = () => {
    setCycle(0)
    setPhaseIdx(0)
    setMemory([])
  }

  const toggleStrategy = (id: string) => {
    setActiveStrategies((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-200">Self-Improving Agent</h3>
          <p className="text-xs text-gray-500">Step through the agent loop. Enable strategies to boost learning.</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-[#9E77ED]">{performance}%</div>
          <div className="text-xs text-gray-500">Cycle {cycle + 1}</div>
        </div>
      </div>

      {/* Agent loop */}
      <div className="mb-4 flex items-center gap-1">
        {phases.map((p, i) => (
          <div key={p} className="flex items-center">
            <div className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${
              i === phaseIdx
                ? 'border-[#7F56D9] bg-[#7F56D9]/15 text-[#9E77ED]'
                : i < phaseIdx
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-border text-gray-500'
            }`}>
              {p}
            </div>
            {i < phases.length - 1 && (
              <svg width="14" height="10" className="mx-0.5 text-gray-600">
                <path d="M2 5 L10 5 M8 2.5 L10 5 L8 7.5" stroke="currentColor" fill="none" strokeWidth="1" />
              </svg>
            )}
          </div>
        ))}
      </div>

      <div className="mb-3 rounded-lg border border-border bg-white/5 px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#9E77ED]">{phase}</span>
        <p className="mt-0.5 text-xs text-gray-400">{phaseDetails[phase]}</p>
      </div>

      {/* Performance bar */}
      <div className="mb-3">
        <div className="mb-1 flex justify-between text-xs text-gray-500">
          <span>Performance</span>
          <span>{performance}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-[#7F56D9] to-[#9E77ED] transition-all duration-500" style={{ width: `${performance}%` }} />
        </div>
      </div>

      {/* Strategies */}
      <div className="mb-3 flex gap-2">
        {strategies.map((s) => (
          <button key={s.id} onClick={() => toggleStrategy(s.id)}
            className={`flex-1 rounded-md border px-2 py-1.5 text-left transition ${
              activeStrategies.has(s.id)
                ? 'border-[#7F56D9]/40 bg-[#7F56D9]/10'
                : 'border-border hover:border-white/20'
            }`}>
            <div className={`text-xs font-medium ${activeStrategies.has(s.id) ? 'text-[#9E77ED]' : 'text-gray-500'}`}>{s.label}</div>
            <div className="text-sm text-gray-600">{s.desc}</div>
          </button>
        ))}
      </div>

      {/* Memory */}
      {memory.length > 0 && (
        <div className="mb-3 rounded-lg border border-border bg-white/[0.03] px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Agent Memory</span>
          {memory.map((m, i) => (
            <div key={i} className="mt-0.5 text-xs text-gray-500 font-mono">{m}</div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        <button onClick={stepForward}
          className="flex-1 rounded-md bg-[#7F56D9] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#7F56D9]/80">
          {phaseIdx < phases.length - 1 ? 'Next Phase' : cycle < maxCycles ? 'Complete Cycle' : 'Done'}
        </button>
        <button onClick={reset}
          className="rounded-md border border-border px-3 py-1.5 text-xs text-gray-500 hover:text-gray-300">
          Reset
        </button>
      </div>
    </div>
  )
}
