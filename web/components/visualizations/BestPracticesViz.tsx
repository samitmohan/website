'use client'

import { useState } from 'react'

type Practice = { id: string; label: string; weight: number }
type Category = { name: string; color: string; practices: Practice[] }

const categories: Category[] = [
  { name: 'Prompt Engineering', color: '#7F56D9', practices: [
    { id: 'pe1', label: 'Use structured output formats', weight: 8 },
    { id: 'pe2', label: 'Version control prompts', weight: 7 },
    { id: 'pe3', label: 'Include few-shot examples', weight: 6 },
    { id: 'pe4', label: 'Define system personas', weight: 5 },
  ]},
  { name: 'Testing', color: '#22C55E', practices: [
    { id: 'te1', label: 'Automated eval suites', weight: 9 },
    { id: 'te2', label: 'Regression test on prompts', weight: 8 },
    { id: 'te3', label: 'A/B test model changes', weight: 7 },
    { id: 'te4', label: 'Red team adversarial inputs', weight: 6 },
  ]},
  { name: 'Monitoring', color: '#F59E0B', practices: [
    { id: 'mo1', label: 'Track cost per request', weight: 8 },
    { id: 'mo2', label: 'Log all LLM I/O', weight: 7 },
    { id: 'mo3', label: 'Alert on latency spikes', weight: 6 },
    { id: 'mo4', label: 'Drift detection on outputs', weight: 5 },
  ]},
  { name: 'Security', color: '#EF4444', practices: [
    { id: 'se1', label: 'Input sanitization layer', weight: 9 },
    { id: 'se2', label: 'PII detection and masking', weight: 8 },
    { id: 'se3', label: 'Rate limiting per user', weight: 7 },
    { id: 'se4', label: 'Prompt injection guardrails', weight: 9 },
  ]},
]

export default function BestPracticesViz() {
  const [enabled, setEnabled] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setEnabled((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const allPractices = categories.flatMap((c) => c.practices)
  const totalWeight = allPractices.reduce((s, p) => s + p.weight, 0)
  const earnedWeight = allPractices.filter((p) => enabled.has(p.id)).reduce((s, p) => s + p.weight, 0)
  const score = Math.round((earnedWeight / totalWeight) * 100)

  const missing = allPractices
    .filter((p) => !enabled.has(p.id))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)

  const maturity = score >= 80 ? 'Advanced' : score >= 50 ? 'Intermediate' : score >= 25 ? 'Basic' : 'Starting'
  const maturityColor = score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-yellow-400' : score >= 25 ? 'text-orange-400' : 'text-red-400'

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-200">AI Engineering Best Practices</h3>
          <p className="text-xs text-gray-500">Toggle practices to calculate your maturity score.</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-[#9E77ED]">{score}%</div>
          <div className={`text-xs font-medium ${maturityColor}`}>{maturity}</div>
        </div>
      </div>

      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-[#7F56D9] to-[#9E77ED] transition-all duration-300" style={{ width: `${score}%` }} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => (
          <div key={cat.name} className="rounded-lg border border-border bg-white/[0.03] p-2.5">
            <div className="mb-2 flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="text-sm font-semibold text-gray-300">{cat.name}</span>
            </div>
            {cat.practices.map((p) => (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                className={`mb-1 flex w-full items-center gap-2 rounded px-2 py-1 text-left transition ${
                  enabled.has(p.id) ? 'bg-white/5 text-gray-300' : 'text-gray-500 hover:text-gray-400'
                }`}
              >
                <div className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border text-[8px] ${
                  enabled.has(p.id) ? 'border-[#7F56D9] bg-[#7F56D9] text-white' : 'border-white/20'
                }`}>
                  {enabled.has(p.id) && '\u2713'}
                </div>
                <span className="text-xs">{p.label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {missing.length > 0 && (
        <div className="mt-3 rounded-lg border border-border bg-white/5 px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9E77ED]">Top Recommendations</span>
          {missing.map((p) => (
            <div key={p.id} className="mt-1 flex items-center gap-2 text-xs text-gray-400">
              <span className="text-yellow-500">!</span> {p.label}
              <span className="ml-auto font-mono text-gray-600">+{p.weight}pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
