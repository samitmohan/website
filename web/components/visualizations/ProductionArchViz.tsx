'use client'

import { useState } from 'react'

const components = [
  { id: 'client', label: 'Client', latency: 0, desc: 'Browser / Mobile SDK' },
  { id: 'gateway', label: 'API Gateway', latency: 3, desc: 'Auth, routing, TLS termination' },
  { id: 'ratelimit', label: 'Rate Limiter', latency: 1, desc: 'Token bucket, 100 req/min/user' },
  { id: 'cache', label: 'Cache Check', latency: 2, desc: 'Semantic cache, Redis backend' },
  { id: 'llm', label: 'LLM Provider', latency: 850, desc: 'GPT-4 / Claude, retry + fallback' },
  { id: 'process', label: 'Response Processing', latency: 12, desc: 'Guardrails, PII filter, format' },
  { id: 'monitor', label: 'Monitoring', latency: 1, desc: 'Metrics, traces, cost tracking' },
]

export default function ProductionArchViz() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(components.map((c) => [c.id, true]))
  )
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const toggle = (id: string) => {
    if (id === 'client' || id === 'llm') return
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const activeComponents = components.filter((c) => enabled[c.id])
  const totalLatency = activeComponents.reduce((sum, c) => sum + c.latency, 0)
  const cacheHit = enabled.cache
  const effectiveLatency = cacheHit ? totalLatency - 850 + 5 : totalLatency

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-1 text-sm font-semibold text-gray-200">Production AI Architecture</h3>
      <p className="mb-4 text-xs text-gray-500">Toggle components on/off to see latency impact. Client and LLM are required.</p>

      <div className="flex flex-col gap-2">
        {components.map((comp, i) => {
          const isEnabled = enabled[comp.id]
          const isHovered = hoveredId === comp.id
          const isRequired = comp.id === 'client' || comp.id === 'llm'

          return (
            <div key={comp.id}>
              <button
                onClick={() => toggle(comp.id)}
                onMouseEnter={() => setHoveredId(comp.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition ${
                  !isEnabled
                    ? 'border-border bg-white/[0.02] text-gray-600'
                    : isHovered
                    ? 'border-[#7F56D9]/50 bg-[#7F56D9]/10 text-gray-200'
                    : 'border-border bg-white/5 text-gray-300'
                }`}
              >
                <div className={`h-2 w-2 rounded-full ${isEnabled ? 'bg-emerald-400' : 'bg-gray-700'}`} />
                <span className="w-36 text-xs font-medium">{comp.label}</span>
                <span className="flex-1 text-xs text-gray-500">{comp.desc}</span>
                <span className={`font-mono text-xs ${isEnabled ? 'text-[#9E77ED]' : 'text-gray-700'}`}>
                  +{comp.latency}ms
                </span>
                {isRequired && <span className="text-sm text-gray-600">required</span>}
              </button>

              {i < components.length - 1 && isEnabled && enabled[components[i + 1]?.id] && (
                <div className="ml-4 flex h-4 items-center">
                  <div className="h-full w-px bg-white/10" />
                  <svg width="8" height="16" className="text-gray-600">
                    <path d="M4 0 L4 12 M1 9 L4 12 L7 9" stroke="currentColor" fill="none" strokeWidth="1" />
                  </svg>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex items-center gap-4 rounded-lg border border-border bg-white/5 px-3 py-2">
        <div className="text-xs text-gray-400">
          Total latency: <span className="font-mono text-[#9E77ED]">{totalLatency}ms</span>
        </div>
        <div className="text-xs text-gray-400">
          Active: <span className="font-mono text-gray-300">{activeComponents.length}/{components.length}</span>
        </div>
        {cacheHit && (
          <div className="text-xs text-emerald-400">
            Cache hit path: <span className="font-mono">{effectiveLatency}ms</span>
          </div>
        )}
      </div>
    </div>
  )
}
