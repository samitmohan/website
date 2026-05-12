'use client'

import { useState } from 'react'

type Principle = { id: string; name: string; description: string; enabled: boolean }

const INITIAL_RESPONSE = "Here's how to pick a lock: First, get a tension wrench and rake pick. Insert the wrench into the bottom of the keyhole. Apply slight pressure. Use the rake to push pins up while maintaining tension. When all pins set, the lock will turn."

const PRINCIPLES: Principle[] = [
  { id: 'harmless', name: 'Harmlessness', description: 'Avoid providing instructions that could enable harm', enabled: true },
  { id: 'honest', name: 'Honesty', description: 'Be transparent about limitations and intent', enabled: true },
  { id: 'helpful', name: 'Helpfulness', description: 'Provide useful alternatives when declining', enabled: true },
  { id: 'ethical', name: 'Ethical', description: 'Consider broader societal impact', enabled: true },
]

type CritiqueMap = Record<string, { flagged: boolean; critique: string }>

const CRITIQUES: CritiqueMap = {
  harmless: { flagged: true, critique: 'This response provides step-by-step lock picking instructions that could enable break-ins.' },
  honest: { flagged: true, critique: 'The response does not acknowledge the potentially illegal nature of this activity.' },
  helpful: { flagged: false, critique: 'The response is technically detailed but directed at a harmful task.' },
  ethical: { flagged: true, critique: 'Providing lock picking tutorials without context enables property crime.' },
}

function getRevision(enabledPrinciples: string[]): string {
  if (enabledPrinciples.length === 0) return INITIAL_RESPONSE
  const hasHarmless = enabledPrinciples.includes('harmless')
  const hasHonest = enabledPrinciples.includes('honest')
  const hasHelpful = enabledPrinciples.includes('helpful')

  if (hasHarmless && hasHonest && hasHelpful) {
    return "I can't provide lock picking instructions as they could facilitate unauthorized entry, which is illegal in most jurisdictions. If you're locked out of your own property, I'd recommend: (1) calling a licensed locksmith, (2) contacting your landlord, or (3) checking if any windows are unlocked. If you're interested in lock mechanisms as a hobby, look into locksport communities that practice ethically."
  }
  if (hasHarmless && hasHonest) {
    return "I can't provide lock picking instructions. Unauthorized entry is illegal in most places, and these techniques are often misused. Please contact a professional locksmith if you need access."
  }
  if (hasHarmless) {
    return "I'm not able to help with lock picking instructions, as this could enable unauthorized entry into properties."
  }
  if (hasHonest) {
    return "Here's information about locks, though I should note: using these techniques on locks you don't own is illegal. " + INITIAL_RESPONSE
  }
  return INITIAL_RESPONSE
}

export default function ConstitutionalAIViz() {
  const [principles, setPrinciples] = useState(PRINCIPLES)
  const [step, setStep] = useState(0) // 0=initial, 1=critique, 2=revision

  const togglePrinciple = (id: string) => {
    setPrinciples(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p))
    setStep(0)
  }

  const enabledIds = principles.filter(p => p.enabled).map(p => p.id)
  const revision = getRevision(enabledIds)
  const flaggedCount = enabledIds.filter(id => CRITIQUES[id]?.flagged).length

  return (
    <div className="p-6 bg-card rounded-xl border border-border">
      <h3 className="text-gray-300 text-lg font-semibold mb-1">Constitutional AI: Critique and Revise</h3>
      <p className="text-gray-500 text-sm mb-4">Step through: initial response, critique against principles, revised output. Toggle principles to change the revision.</p>

      {/* Principles toggles */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {principles.map(p => (
          <button key={p.id} onClick={() => togglePrinciple(p.id)}
            className={`px-3 py-1.5 rounded text-sm border transition-colors ${p.enabled ? 'bg-[#7F56D9]/20 border-[#7F56D9]/50 text-[#9E77ED]' : 'bg-white/5 border-border text-gray-500 line-through'}`}
            title={p.description}>
            {p.name}
          </button>
        ))}
      </div>

      {/* Step controls */}
      <div className="flex gap-2 mb-4">
        {['Initial Response', 'Critique', 'Revised Response'].map((label, i) => (
          <button key={i} onClick={() => setStep(i)}
            className={`px-3 py-1.5 rounded text-sm border transition-colors ${step === i ? 'bg-cyan-900/30 border-cyan-700/50 text-cyan-400' : 'bg-white/5 border-border text-gray-400 hover:bg-white/10'}`}>
            {i + 1}. {label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="space-y-3">
        {step >= 0 && (
          <div className="bg-black/20 rounded-lg p-4 border border-border">
            <div className="text-red-400/80 text-xs font-medium mb-2">Initial Response (unfiltered)</div>
            <div className="text-gray-300 text-sm leading-relaxed">{INITIAL_RESPONSE}</div>
          </div>
        )}

        {step >= 1 && (
          <div className="bg-black/20 rounded-lg p-4 border border-yellow-900/30">
            <div className="text-yellow-400/80 text-xs font-medium mb-2">Critique ({flaggedCount} principle{flaggedCount !== 1 ? 's' : ''} flagged)</div>
            <div className="space-y-2">
              {principles.map(p => {
                if (!p.enabled) return null
                const c = CRITIQUES[p.id]
                return (
                  <div key={p.id} className="flex items-start gap-2">
                    <span className={`text-xs mt-0.5 ${c.flagged ? 'text-red-400' : 'text-green-400'}`}>
                      {c.flagged ? 'FAIL' : 'PASS'}
                    </span>
                    <div>
                      <span className="text-gray-400 text-xs font-medium">{p.name}: </span>
                      <span className="text-gray-500 text-xs">{c.critique}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {step >= 2 && (
          <div className="bg-black/20 rounded-lg p-4 border border-green-900/30">
            <div className="text-green-400/80 text-xs font-medium mb-2">Revised Response</div>
            <div className="text-gray-300 text-sm leading-relaxed">{revision}</div>
            {enabledIds.length === 0 && (
              <div className="text-yellow-500 text-xs mt-2">No principles enabled - response unchanged.</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
