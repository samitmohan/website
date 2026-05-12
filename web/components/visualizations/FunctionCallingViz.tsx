'use client'

import { useState, useCallback } from 'react'

const TOOLS = [
  { name: 'get_weather', description: 'Get current weather for a location', params: '{ "location": "string", "units": "celsius|fahrenheit" }' },
  { name: 'search_web', description: 'Search the web for information', params: '{ "query": "string", "num_results": "number" }' },
  { name: 'calculate', description: 'Evaluate a math expression', params: '{ "expression": "string" }' },
]

const STEPS = [
  {
    label: 'User Message',
    detail: '"What\'s the weather like in Tokyo right now?"',
    color: 'rgb(96, 165, 250)',
    bg: 'rgba(96, 165, 250, 0.1)',
    border: 'rgba(96, 165, 250, 0.3)',
  },
  {
    label: 'LLM Reasoning',
    detail: 'The user wants weather data. I should call get_weather with location="Tokyo".',
    color: 'rgb(168, 85, 247)',
    bg: 'rgba(168, 85, 247, 0.1)',
    border: 'rgba(168, 85, 247, 0.3)',
  },
  {
    label: 'Function Call',
    detail: 'get_weather({ "location": "Tokyo, Japan", "units": "celsius" })',
    color: 'rgb(251, 146, 60)',
    bg: 'rgba(251, 146, 60, 0.1)',
    border: 'rgba(251, 146, 60, 0.3)',
  },
  {
    label: 'Function Result',
    detail: '{ "temp": 22, "condition": "Partly Cloudy", "humidity": 65 }',
    color: 'rgb(74, 222, 128)',
    bg: 'rgba(74, 222, 128, 0.1)',
    border: 'rgba(74, 222, 128, 0.3)',
  },
  {
    label: 'LLM Response',
    detail: 'It\'s currently 22C and partly cloudy in Tokyo, with 65% humidity.',
    color: 'rgb(56, 189, 248)',
    bg: 'rgba(56, 189, 248, 0.1)',
    border: 'rgba(56, 189, 248, 0.3)',
  },
]

export default function FunctionCallingViz() {
  const [step, setStep] = useState(-1)
  const [selectedTool, setSelectedTool] = useState<number | null>(null)

  const handleNext = useCallback(() => {
    setStep((prev) => {
      const next = Math.min(prev + 1, STEPS.length - 1)
      if (next === 2) setSelectedTool(0) // highlight get_weather when function call step
      return next
    })
  }, [])

  const handlePrev = useCallback(() => {
    setStep((prev) => {
      const next = Math.max(prev - 1, -1)
      if (next < 2) setSelectedTool(null)
      return next
    })
  }, [])

  const handleReset = useCallback(() => {
    setStep(-1)
    setSelectedTool(null)
  }, [])

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-orange-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-orange-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Function Calling</h3>
          <p className="text-xs text-muted-foreground">LLM selects and invokes tools via structured JSON</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 space-y-3">
          {/* Tool Schema */}
          <div className="bg-muted border border-border rounded-lg p-3">
            <div className="text-xs uppercase font-bold text-muted-foreground mb-2">Available Tools (JSON Schema)</div>
            <div className="space-y-2">
              {TOOLS.map((tool, i) => (
                <div
                  key={tool.name}
                  className="flex items-start gap-2 p-2 rounded-md border transition-all duration-300 cursor-pointer"
                  style={{
                    backgroundColor: selectedTool === i ? 'rgba(251, 146, 60, 0.1)' : 'transparent',
                    borderColor: selectedTool === i ? 'rgba(251, 146, 60, 0.4)' : 'rgba(255,255,255,0.05)',
                  }}
                  onClick={() => setSelectedTool(i)}
                >
                  <svg className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: selectedTool === i ? 'rgb(251,146,60)' : 'rgba(255,255,255,0.3)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono font-bold" style={{ color: selectedTool === i ? 'rgb(251,146,60)' : 'inherit' }}>
                      {tool.name}
                    </div>
                    <div className="text-xs text-muted-foreground">{tool.description}</div>
                    <div className="text-xs font-mono text-muted-foreground/60 mt-0.5">{tool.params}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flow steps */}
          <div className="space-y-2">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className="rounded-lg p-3 border transition-all duration-300 flex items-start gap-3"
                style={{
                  opacity: i <= step ? 1 : 0.15,
                  backgroundColor: i <= step ? s.bg : 'transparent',
                  borderColor: i <= step ? s.border : 'rgba(255,255,255,0.05)',
                }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                >
                  {i + 1}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase" style={{ color: s.color }}>{s.label}</div>
                  <div className="text-xs font-mono mt-0.5" style={{ color: i <= step ? s.color : 'inherit', opacity: i <= step ? 0.8 : 0.4 }}>
                    {s.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          {/* Controls */}
          <div className="flex items-center gap-2">
            <button onClick={handlePrev} disabled={step <= -1} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground transition hover:text-foreground disabled:opacity-30">
              Prev
            </button>
            <button onClick={handleNext} disabled={step >= STEPS.length - 1} className="text-xs px-4 py-1.5 rounded-lg border bg-orange-500/20 border-orange-500/40 text-orange-300 transition hover:bg-orange-500/30 disabled:opacity-30">
              Next ({step + 2}/{STEPS.length})
            </button>
            <button onClick={handleReset} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground transition hover:text-foreground">
              Reset
            </button>
          </div>

          {/* Current step info */}
          <div className="bg-muted border border-border p-3 rounded-xl space-y-2">
            <div className="text-xs uppercase font-bold text-muted-foreground">Current Step</div>
            {step >= 0 ? (
              <>
                <div className="text-sm font-mono" style={{ color: STEPS[step].color }}>{STEPS[step].label}</div>
                <div className="text-xs text-muted-foreground">
                  {step === 0 && 'User sends a natural language message to the LLM'}
                  {step === 1 && 'LLM analyzes the query and decides which tool to use'}
                  {step === 2 && 'LLM emits a structured function call with JSON arguments'}
                  {step === 3 && 'Runtime executes the function, returns JSON result'}
                  {step === 4 && 'LLM incorporates the result into a natural language response'}
                </div>
              </>
            ) : (
              <div className="text-xs text-muted-foreground">Press Next to step through the function calling flow</div>
            )}
          </div>

          {/* Flow diagram */}
          <div className="bg-muted border border-border p-3 rounded-xl">
            <div className="text-xs uppercase font-bold text-muted-foreground mb-2">Flow</div>
            <div className="flex flex-col items-center gap-1 text-xs">
              <div className="px-2 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">User Message</div>
              <div className="text-muted-foreground">|</div>
              <div className="px-2 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">LLM Reasoning</div>
              <div className="text-muted-foreground">|</div>
              <div className="px-2 py-1 rounded bg-orange-500/10 text-orange-300 border border-orange-500/20">Function Call</div>
              <div className="text-muted-foreground">|</div>
              <div className="px-2 py-1 rounded bg-green-500/10 text-green-300 border border-green-500/20">Function Result</div>
              <div className="text-muted-foreground">|</div>
              <div className="px-2 py-1 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">Final Response</div>
            </div>
          </div>

          <div className="mt-auto bg-orange-500/5 border border-orange-500/10 p-3 rounded-lg">
            <p className="text-xs text-orange-300 leading-relaxed italic">
              Function calling lets LLMs interact with external systems by emitting structured tool calls. The model never executes code itself - the runtime handles execution and feeds results back.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
