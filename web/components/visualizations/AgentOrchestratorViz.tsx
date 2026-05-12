'use client'

import { useState, useCallback } from 'react'

const AGENTS = [
  { id: 'orchestrator', label: 'Orchestrator', color: 'rgb(168, 85, 247)', x: 180, y: 30 },
  { id: 'researcher', label: 'Researcher', color: 'rgb(96, 165, 250)', x: 60, y: 140 },
  { id: 'coder', label: 'Coder', color: 'rgb(74, 222, 128)', x: 180, y: 140 },
  { id: 'reviewer', label: 'Reviewer', color: 'rgb(251, 146, 60)', x: 300, y: 140 },
]

const MESSAGES = [
  { from: 'user', to: 'orchestrator', label: 'Build a REST API for a todo app', color: 'rgb(255,255,255)' },
  { from: 'orchestrator', to: 'researcher', label: 'Research best practices for REST API design', color: 'rgb(96, 165, 250)' },
  { from: 'researcher', to: 'orchestrator', label: 'Use RESTful routes, status codes, validation', color: 'rgb(96, 165, 250)' },
  { from: 'orchestrator', to: 'coder', label: 'Implement todo API with CRUD endpoints', color: 'rgb(74, 222, 128)' },
  { from: 'coder', to: 'orchestrator', label: 'Code ready: routes, models, controllers', color: 'rgb(74, 222, 128)' },
  { from: 'orchestrator', to: 'reviewer', label: 'Review the todo API implementation', color: 'rgb(251, 146, 60)' },
  { from: 'reviewer', to: 'orchestrator', label: 'Add input validation, fix error handling', color: 'rgb(251, 146, 60)' },
  { from: 'orchestrator', to: 'coder', label: 'Apply review feedback: validation + error handling', color: 'rgb(74, 222, 128)' },
  { from: 'coder', to: 'orchestrator', label: 'Updated code with fixes applied', color: 'rgb(74, 222, 128)' },
  { from: 'orchestrator', to: 'user', label: 'Final: Todo REST API with validation and error handling', color: 'rgb(168, 85, 247)' },
]

export default function AgentOrchestratorViz() {
  const [step, setStep] = useState(-1)

  const handleNext = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, MESSAGES.length - 1))
  }, [])

  const handlePrev = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, -1))
  }, [])

  const handleReset = useCallback(() => {
    setStep(-1)
  }, [])

  const getAgentPos = (id: string) => {
    if (id === 'user') return { x: 180, y: -20 }
    return AGENTS.find((a) => a.id === id) || { x: 0, y: 0 }
  }

  const currentMessage = step >= 0 ? MESSAGES[step] : null

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-purple-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Multi-Agent Orchestration</h3>
          <p className="text-xs text-muted-foreground">Orchestrator routes tasks to specialized agents</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4">
          <svg viewBox="0 0 360 200" className="w-full h-auto">
            {/* User node */}
            <rect x="155" y="0" width="50" height="20" rx="4" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
            <text x="180" y="13" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="7" fontWeight="bold">User</text>

            {/* Connection lines (static) */}
            <line x1="180" y1="20" x2="180" y2="45" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" strokeDasharray="3,2" />
            <line x1="180" y1="75" x2="80" y2="130" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" strokeDasharray="3,2" />
            <line x1="180" y1="75" x2="180" y2="130" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" strokeDasharray="3,2" />
            <line x1="180" y1="75" x2="280" y2="130" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" strokeDasharray="3,2" />

            {/* Agent nodes */}
            {AGENTS.map((agent) => {
              const isActive = currentMessage && (currentMessage.from === agent.id || currentMessage.to === agent.id)
              return (
                <g key={agent.id}>
                  <rect
                    x={agent.x - 35}
                    y={agent.y}
                    width="70"
                    height="30"
                    rx="6"
                    fill={isActive ? `${agent.color.replace('rgb', 'rgba').replace(')', ', 0.15)')}` : 'rgba(30, 30, 46, 0.6)'}
                    stroke={isActive ? agent.color : 'rgba(255,255,255,0.1)'}
                    strokeWidth={isActive ? 1.5 : 0.8}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                  <text
                    x={agent.x}
                    y={agent.y + 18}
                    textAnchor="middle"
                    fill={isActive ? agent.color : 'rgba(255,255,255,0.5)'}
                    fontSize="8"
                    fontWeight="bold"
                    style={{ transition: 'fill 0.3s ease' }}
                  >
                    {agent.label}
                  </text>
                  {/* Role icon */}
                  {agent.id === 'orchestrator' && (
                    <circle cx={agent.x + 28} cy={agent.y + 8} r="4" fill="rgba(168,85,247,0.3)" stroke="rgba(168,85,247,0.5)" strokeWidth="0.5" />
                  )}
                </g>
              )
            })}

            {/* Active message arrow */}
            {currentMessage && (
              <g style={{ transition: 'opacity 0.3s ease' }}>
                {(() => {
                  const from = getAgentPos(currentMessage.from)
                  const to = getAgentPos(currentMessage.to)
                  const fromY = currentMessage.from === 'user' ? 20 : from.y + 30
                  const toY = currentMessage.to === 'user' ? 20 : to.y
                  return (
                    <>
                      <line
                        x1={from.x}
                        y1={fromY}
                        x2={to.x}
                        y2={toY}
                        stroke={currentMessage.color}
                        strokeWidth="1.5"
                        strokeOpacity="0.6"
                      />
                      <circle cx={to.x} cy={toY} r="3" fill={currentMessage.color} fillOpacity="0.8">
                        <animate attributeName="r" values="2;4;2" dur="1s" repeatCount="indefinite" />
                      </circle>
                    </>
                  )
                })()}
              </g>
            )}

            {/* Message label */}
            {currentMessage && (
              <text x="180" y="190" textAnchor="middle" fill={currentMessage.color} fontSize="7" fontFamily="monospace">
                {currentMessage.label}
              </text>
            )}
          </svg>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          {/* Controls */}
          <div className="flex items-center gap-2">
            <button onClick={handlePrev} disabled={step <= -1} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground transition hover:text-foreground disabled:opacity-30">
              Prev
            </button>
            <button onClick={handleNext} disabled={step >= MESSAGES.length - 1} className="text-xs px-4 py-1.5 rounded-lg border bg-purple-500/20 border-purple-500/40 text-purple-300 transition hover:bg-purple-500/30 disabled:opacity-30">
              Next ({step + 2}/{MESSAGES.length})
            </button>
            <button onClick={handleReset} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground transition hover:text-foreground">
              Reset
            </button>
          </div>

          {/* Message log */}
          <div className="bg-muted border border-border p-3 rounded-xl space-y-2 max-h-[200px] overflow-y-auto">
            <div className="text-xs uppercase font-bold text-muted-foreground">Message Log</div>
            {step >= 0 ? (
              MESSAGES.slice(0, step + 1).map((msg, i) => (
                <div key={i} className="text-xs font-mono flex items-start gap-1.5">
                  <span style={{ color: msg.color }} className="font-bold flex-shrink-0">{msg.from}</span>
                  <span className="text-muted-foreground">-&gt;</span>
                  <span className="text-muted-foreground flex-shrink-0">{msg.to}:</span>
                  <span className="text-foreground/70 truncate">{msg.label}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground">Press Next to see messages flow between agents</div>
            )}
          </div>

          {/* Agent roles */}
          <div className="bg-muted border border-border p-3 rounded-xl space-y-1.5">
            <div className="text-xs uppercase font-bold text-muted-foreground">Agent Roles</div>
            <div className="text-xs space-y-1">
              <div><span className="text-purple-400 font-bold">Orchestrator:</span> <span className="text-muted-foreground">Plans, delegates, aggregates results</span></div>
              <div><span className="text-blue-400 font-bold">Researcher:</span> <span className="text-muted-foreground">Gathers information and best practices</span></div>
              <div><span className="text-green-400 font-bold">Coder:</span> <span className="text-muted-foreground">Writes and updates code</span></div>
              <div><span className="text-orange-400 font-bold">Reviewer:</span> <span className="text-muted-foreground">Reviews code, suggests improvements</span></div>
            </div>
          </div>

          <div className="mt-auto bg-purple-500/5 border border-purple-500/10 p-3 rounded-lg">
            <p className="text-xs text-purple-300 leading-relaxed italic">
              Multi-agent systems decompose complex tasks across specialized agents. The orchestrator manages the workflow, routing subtasks and aggregating results from each agent.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
