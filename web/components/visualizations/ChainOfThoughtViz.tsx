'use client'

import { useState } from 'react'

type Step = { text: string; status: 'valid' | 'weak' | 'gap' }

const initialSteps: Step[] = [
  { text: 'User asks: "Is 17 prime?"', status: 'valid' },
  { text: 'Check if 17 is divisible by 2: 17/2 = 8.5, not divisible', status: 'valid' },
  { text: 'Check if 17 is divisible by 3: 17/3 = 5.67, not divisible', status: 'valid' },
  { text: 'We only need to check up to sqrt(17) which is about 4.1', status: 'valid' },
  { text: 'Check 4: 17/4 = 4.25, not divisible', status: 'weak' },
  { text: 'Therefore 17 is prime', status: 'valid' },
]

const statusConfig = {
  valid: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', label: 'Valid', arrow: '#10b981' },
  weak: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', label: 'Weak', arrow: '#eab308' },
  gap: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', label: 'Gap', arrow: '#ef4444' },
}

export default function ChainOfThoughtViz() {
  const [steps, setSteps] = useState<Step[]>(initialSteps)
  const [newStep, setNewStep] = useState('')

  const cycleStatus = (i: number) => {
    const order: Step['status'][] = ['valid', 'weak', 'gap']
    setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: order[(order.indexOf(s.status) + 1) % 3] } : s))
  }

  const addStep = () => {
    if (!newStep.trim()) return
    setSteps(prev => [...prev, { text: newStep.trim(), status: 'valid' }])
    setNewStep('')
  }

  const removeStep = (i: number) => {
    setSteps(prev => prev.filter((_, idx) => idx !== i))
  }

  const valid = steps.filter(s => s.status === 'valid').length
  const weak = steps.filter(s => s.status === 'weak').length
  const gaps = steps.filter(s => s.status === 'gap').length

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-200">Chain of Thought Reasoning</h3>
          <p className="text-xs text-gray-500">Click status badges to cycle: valid / weak / gap. Add or remove steps.</p>
        </div>
        <div className="flex gap-2">
          {[
            { label: 'Valid', count: valid, color: 'text-emerald-400 bg-emerald-500/10' },
            { label: 'Weak', count: weak, color: 'text-yellow-400 bg-yellow-500/10' },
            { label: 'Gaps', count: gaps, color: 'text-red-400 bg-red-500/10' },
          ].map(s => (
            <span key={s.label} className={`text-xs font-mono px-2 py-0.5 rounded-full ${s.color}`}>{s.count} {s.label}</span>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-0">
        {steps.map((step, i) => {
          const cfg = statusConfig[step.status]
          return (
            <div key={i}>
              <div className={`flex items-start gap-2 p-2.5 rounded-lg border ${cfg.bg} ${cfg.border} transition-colors`}>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <span className="text-xs font-mono text-gray-500 w-5 text-center">{i + 1}</span>
                  <button onClick={() => cycleStatus(i)}
                    className={`text-base font-bold px-1.5 py-0.5 rounded ${cfg.text} ${cfg.bg} border ${cfg.border} hover:opacity-80`}>
                    {cfg.label}
                  </button>
                </div>
                <p className="text-xs text-gray-300 flex-1 pt-0.5">{step.text}</p>
                <button onClick={() => removeStep(i)} className="text-gray-600 hover:text-red-400 text-xs flex-shrink-0 px-1">x</button>
              </div>
              {i < steps.length - 1 && (
                <div className="flex justify-center py-1">
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    <line x1="10" y1="0" x2="10" y2="14" stroke={statusConfig[steps[i + 1].status].arrow} strokeWidth="2" />
                    <polygon points="6,12 10,18 14,12" fill={statusConfig[steps[i + 1].status].arrow} />
                  </svg>
                </div>
              )}
            </div>
          )
        })}

        <div className="flex gap-2 mt-3 pt-3 border-t border-border">
          <input value={newStep} onChange={e => setNewStep(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addStep()}
            placeholder="Add a reasoning step..."
            className="flex-1 bg-white/5 border border-border rounded-lg px-3 py-1.5 text-xs text-gray-300 placeholder-gray-600 outline-none focus:border-[#7F56D9]/50" />
          <button onClick={addStep}
            className="px-3 py-1.5 bg-[#7F56D9] text-white text-xs rounded-lg hover:bg-[#7F56D9]/80 transition-colors">
            Add
          </button>
        </div>

        <div className="bg-[#7F56D9]/5 border border-[#7F56D9]/10 p-2 rounded-lg mt-3">
          <p className="text-xs text-gray-400 leading-relaxed">
            Chain-of-thought prompting breaks reasoning into explicit steps. Each step should follow from the previous one. Weak inferences and logical gaps reduce the reliability of the final conclusion.
          </p>
        </div>
      </div>
    </div>
  )
}
