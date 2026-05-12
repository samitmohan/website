'use client'

import { useState, useCallback } from 'react'

const QUERIES = [
  {
    query: 'What is 247 * 389?',
    selectedTool: 0,
    reason: 'This is a math computation - calculator is the right tool.',
    call: 'calculator({ expression: "247 * 389" })',
    result: '96083',
    answer: '247 * 389 = 96,083',
  },
  {
    query: 'What happened in tech news today?',
    selectedTool: 1,
    reason: 'User wants current events - needs web search for live data.',
    call: 'web_search({ query: "tech news today", limit: 5 })',
    result: '[{ "title": "OpenAI releases GPT-5...", "url": "..." }, ...]',
    answer: 'Here are today\'s top tech stories: OpenAI released GPT-5...',
  },
  {
    query: 'Summarize the document about quantum computing I uploaded',
    selectedTool: 2,
    reason: 'User references an uploaded document - need file reader to access it.',
    call: 'read_file({ path: "quantum_computing.pdf" })',
    result: '{ "content": "Quantum computing uses qubits...", "pages": 12 }',
    answer: 'The document covers quantum computing fundamentals: qubits, superposition, entanglement...',
  },
]

const TOOLS = [
  { name: 'calculator', icon: 'M', desc: 'Evaluate mathematical expressions', color: 'rgb(251, 146, 60)' },
  { name: 'web_search', icon: 'S', desc: 'Search the web for current information', color: 'rgb(96, 165, 250)' },
  { name: 'read_file', icon: 'F', desc: 'Read content from uploaded files', color: 'rgb(74, 222, 128)' },
  { name: 'code_exec', icon: 'C', desc: 'Execute Python code in a sandbox', color: 'rgb(168, 85, 247)' },
]

type Phase = 'idle' | 'query' | 'select' | 'call' | 'result' | 'answer'

export default function ToolUseViz() {
  const [queryIdx, setQueryIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')

  const q = QUERIES[queryIdx]

  const handleStep = useCallback(() => {
    setPhase((prev) => {
      const order: Phase[] = ['idle', 'query', 'select', 'call', 'result', 'answer']
      const idx = order.indexOf(prev)
      if (idx < order.length - 1) return order[idx + 1]
      return prev
    })
  }, [])

  const handleReset = useCallback(() => {
    setPhase('idle')
  }, [])

  const handleChangeQuery = useCallback((idx: number) => {
    setQueryIdx(idx)
    setPhase('idle')
  }, [])

  const phaseIndex = ['idle', 'query', 'select', 'call', 'result', 'answer'].indexOf(phase)

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-green-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-green-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Tool Selection & Use</h3>
          <p className="text-xs text-muted-foreground">How models pick the right tool for each query</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 space-y-3">
          {/* Query selector */}
          <div className="flex gap-2">
            {QUERIES.map((_, i) => (
              <button
                key={i}
                onClick={() => handleChangeQuery(i)}
                className="text-xs px-2 py-1 rounded border transition-all"
                style={{
                  backgroundColor: queryIdx === i ? 'rgba(74, 222, 128, 0.1)' : 'transparent',
                  borderColor: queryIdx === i ? 'rgba(74, 222, 128, 0.4)' : 'rgba(255,255,255,0.1)',
                  color: queryIdx === i ? 'rgb(74, 222, 128)' : 'inherit',
                }}
              >
                Query {i + 1}
              </button>
            ))}
          </div>

          {/* Query display */}
          <div
            className="rounded-lg p-3 border transition-all duration-300"
            style={{
              opacity: phaseIndex >= 1 ? 1 : 0.3,
              backgroundColor: phaseIndex >= 1 ? 'rgba(255,255,255,0.05)' : 'transparent',
              borderColor: phaseIndex >= 1 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
            }}
          >
            <div className="text-xs uppercase font-bold text-muted-foreground mb-1">Query</div>
            <div className="text-xs font-mono">{q.query}</div>
          </div>

          {/* Tools grid */}
          <div className="grid grid-cols-2 gap-2">
            {TOOLS.map((tool, i) => {
              const isSelected = phaseIndex >= 2 && q.selectedTool === i
              return (
                <div
                  key={tool.name}
                  className="rounded-lg p-2.5 border transition-all duration-300"
                  style={{
                    backgroundColor: isSelected ? `${tool.color.replace('rgb', 'rgba').replace(')', ', 0.1)')}` : 'rgba(30,30,46,0.4)',
                    borderColor: isSelected ? tool.color : 'rgba(255,255,255,0.05)',
                    borderWidth: isSelected ? '2px' : '1px',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: `${tool.color.replace('rgb', 'rgba').replace(')', ', 0.2)')}`, color: tool.color }}
                    >
                      {tool.icon}
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold" style={{ color: isSelected ? tool.color : 'inherit' }}>{tool.name}</div>
                      <div className="text-xs text-muted-foreground">{tool.desc}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="mt-2 text-xs font-mono" style={{ color: tool.color }}>Selected - {q.reason}</div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Call + Result + Answer */}
          {phaseIndex >= 3 && (
            <div className="space-y-2">
              <div className="rounded-lg p-3 border transition-all duration-300" style={{ backgroundColor: 'rgba(251,146,60,0.08)', borderColor: 'rgba(251,146,60,0.25)' }}>
                <div className="text-xs uppercase font-bold text-orange-400 mb-1">Tool Call</div>
                <div className="text-xs font-mono text-orange-300">{q.call}</div>
              </div>

              {phaseIndex >= 4 && (
                <div className="rounded-lg p-3 border transition-all duration-300" style={{ backgroundColor: 'rgba(74,222,128,0.08)', borderColor: 'rgba(74,222,128,0.25)' }}>
                  <div className="text-xs uppercase font-bold text-green-400 mb-1">Result</div>
                  <div className="text-xs font-mono text-green-300">{q.result}</div>
                </div>
              )}

              {phaseIndex >= 5 && (
                <div className="rounded-lg p-3 border transition-all duration-300" style={{ backgroundColor: 'rgba(56,189,248,0.08)', borderColor: 'rgba(56,189,248,0.25)' }}>
                  <div className="text-xs uppercase font-bold text-cyan-400 mb-1">Final Answer</div>
                  <div className="text-xs font-mono text-cyan-300">{q.answer}</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          {/* Controls */}
          <div className="flex items-center gap-2">
            <button onClick={handleStep} disabled={phaseIndex >= 5} className="text-xs px-4 py-1.5 rounded-lg border bg-green-500/20 border-green-500/40 text-green-300 transition hover:bg-green-500/30 disabled:opacity-30">
              Step ({phaseIndex + 1}/6)
            </button>
            <button onClick={handleReset} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground transition hover:text-foreground">
              Reset
            </button>
          </div>

          {/* Phase info */}
          <div className="bg-muted border border-border p-3 rounded-xl space-y-2">
            <div className="text-xs uppercase font-bold text-muted-foreground">Phase</div>
            <div className="text-sm font-mono text-green-400">
              {phase === 'idle' && 'Ready'}
              {phase === 'query' && 'Receive Query'}
              {phase === 'select' && 'Select Tool'}
              {phase === 'call' && 'Execute Tool'}
              {phase === 'result' && 'Process Result'}
              {phase === 'answer' && 'Generate Answer'}
            </div>
            <div className="text-xs text-muted-foreground">
              {phase === 'idle' && 'Press Step to begin the tool use flow'}
              {phase === 'query' && 'LLM receives the user query'}
              {phase === 'select' && 'LLM analyzes the query and picks the best tool'}
              {phase === 'call' && 'LLM constructs a structured call with arguments'}
              {phase === 'result' && 'Tool executes and returns structured data'}
              {phase === 'answer' && 'LLM synthesizes the result into a response'}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-muted border border-border p-3 rounded-xl space-y-1.5">
            <div className="text-xs uppercase font-bold text-muted-foreground">Stats</div>
            <div className="text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available tools</span>
                <span>{TOOLS.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Selected tool</span>
                <span style={{ color: phaseIndex >= 2 ? TOOLS[q.selectedTool].color : 'inherit' }}>
                  {phaseIndex >= 2 ? TOOLS[q.selectedTool].name : '-'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-auto bg-green-500/5 border border-green-500/10 p-3 rounded-lg">
            <p className="text-xs text-green-300 leading-relaxed italic">
              Tool selection requires the LLM to match the user intent against available tool descriptions. The model picks the tool whose capability best fits the query, then formats the call with correct arguments.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
