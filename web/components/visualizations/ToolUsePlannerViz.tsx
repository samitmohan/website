'use client'

import { useState } from 'react'

type Tool = { id: string; name: string; deps: string[]; result: string; duration: number }
type Status = 'pending' | 'running' | 'done'

const TOOLS: Tool[] = [
  { id: 'search', name: 'Web Search', deps: [], result: 'Found 3 relevant articles', duration: 1200 },
  { id: 'fetch', name: 'Fetch Page', deps: ['search'], result: 'Extracted 2400 words', duration: 800 },
  { id: 'db', name: 'DB Lookup', deps: [], result: 'User preferences loaded', duration: 600 },
  { id: 'summarize', name: 'Summarize', deps: ['fetch'], result: 'Summary: 150 words', duration: 1500 },
  { id: 'format', name: 'Format Output', deps: ['summarize', 'db'], result: 'Personalized report ready', duration: 400 },
]

const NODE_W = 130
const NODE_H = 44
const positions: Record<string, { x: number; y: number }> = {
  search: { x: 40, y: 20 },
  db: { x: 40, y: 100 },
  fetch: { x: 220, y: 20 },
  summarize: { x: 400, y: 20 },
  format: { x: 400, y: 100 },
}

function statusColor(s: Status): string {
  if (s === 'done') return '#7F56D9'
  if (s === 'running') return '#f59e0b'
  return '#333'
}

export default function ToolUsePlannerViz() {
  const [statuses, setStatuses] = useState<Record<string, Status>>(
    Object.fromEntries(TOOLS.map(t => [t.id, 'pending' as Status]))
  )
  const [results, setResults] = useState<Record<string, string>>({})
  const [executing, setExecuting] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)

  const executionOrder: string[][] = [['search', 'db'], ['fetch'], ['summarize'], ['format']]

  const executeStep = (step: number) => {
    if (step >= executionOrder.length) {
      setExecuting(false)
      return
    }
    setCurrentStep(step)
    const batch = executionOrder[step]

    setStatuses(prev => {
      const next = { ...prev }
      batch.forEach(id => { next[id] = 'running' })
      return next
    })

    setTimeout(() => {
      setStatuses(prev => {
        const next = { ...prev }
        batch.forEach(id => { next[id] = 'done' })
        return next
      })
      setResults(prev => {
        const next = { ...prev }
        batch.forEach(id => {
          const tool = TOOLS.find(t => t.id === id)!
          next[id] = tool.result
        })
        return next
      })
      executeStep(step + 1)
    }, 1000)
  }

  const start = () => {
    setStatuses(Object.fromEntries(TOOLS.map(t => [t.id, 'pending' as Status])))
    setResults({})
    setExecuting(true)
    setCurrentStep(-1)
    setTimeout(() => executeStep(0), 300)
  }

  const allDone = Object.values(statuses).every(s => s === 'done')

  return (
    <div className="p-6 bg-card rounded-xl border border-border">
      <h3 className="text-gray-300 text-lg font-semibold mb-1">Tool Use Planner</h3>
      <p className="text-gray-500 text-sm mb-3">Task: "Search the web, summarize findings, personalize for user." Parallel where possible.</p>

      <div className="flex items-center gap-3 mb-4">
        <button onClick={start} disabled={executing}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${executing ? 'bg-white/5 border-border text-gray-500 cursor-not-allowed' : 'bg-[#7F56D9]/20 border-[#7F56D9]/30 text-[#9E77ED] hover:bg-[#7F56D9]/40'}`}>
          {allDone ? 'Run Again' : executing ? 'Executing...' : 'Execute Plan'}
        </button>
        {currentStep >= 0 && (
          <span className="text-gray-400 text-sm">
            Step {currentStep + 1}/{executionOrder.length}
            {executionOrder[currentStep] && ` - ${executionOrder[currentStep].length > 1 ? 'parallel' : 'sequential'}`}
          </span>
        )}
      </div>

      <svg width={570} height={170} className="mb-4">
        {/* Dependency edges */}
        {TOOLS.map(tool =>
          tool.deps.map(dep => {
            const from = positions[dep]
            const to = positions[tool.id]
            return (
              <line key={`${dep}-${tool.id}`}
                x1={from.x + NODE_W} y1={from.y + NODE_H / 2}
                x2={to.x} y2={to.y + NODE_H / 2}
                stroke={statuses[dep] === 'done' ? '#7F56D9' : '#333'}
                strokeWidth={2} strokeDasharray={statuses[dep] === 'done' ? 'none' : '4,4'}
                markerEnd="url(#toolArrow)" />
            )
          })
        )}
        <defs>
          <marker id="toolArrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#7F56D9" />
          </marker>
        </defs>
        {/* Nodes */}
        {TOOLS.map(tool => {
          const pos = positions[tool.id]
          const s = statuses[tool.id]
          return (
            <g key={tool.id}>
              <rect x={pos.x} y={pos.y} width={NODE_W} height={NODE_H} rx={8}
                fill={s === 'running' ? '#3b2a0a' : s === 'done' ? '#1a1235' : '#111'}
                stroke={statusColor(s)} strokeWidth={2} />
              <text x={pos.x + NODE_W / 2} y={pos.y + NODE_H / 2 + 1}
                fill={s === 'pending' ? '#666' : '#e5e5e5'}
                fontSize={12} textAnchor="middle" dominantBaseline="middle" fontFamily="monospace">
                {tool.name}
              </text>
            </g>
          )
        })}
      </svg>

      {Object.keys(results).length > 0 && (
        <div className="space-y-1">
          {TOOLS.filter(t => results[t.id]).map(t => (
            <div key={t.id} className="flex items-center gap-2 text-sm">
              <span className="text-[#9E77ED] font-mono w-28">{t.name}</span>
              <span className="text-gray-500">-</span>
              <span className="text-gray-300">{results[t.id]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
