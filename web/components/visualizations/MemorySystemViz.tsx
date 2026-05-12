'use client'

import { useState } from 'react'

interface Message { role: string; text: string; id: number }
interface Fact { key: string; value: string; id: number }

const SEED_MESSAGES: { role: string; text: string; fact: { key: string; value: string } }[] = [
  { role: 'user', text: 'My name is Alex and I work at OpenAI.', fact: { key: 'name', value: 'Alex' } },
  { role: 'assistant', text: 'Nice to meet you, Alex!', fact: { key: 'employer', value: 'OpenAI' } },
  { role: 'user', text: 'I prefer Python over JavaScript.', fact: { key: 'language_pref', value: 'Python > JavaScript' } },
  { role: 'user', text: 'I live in San Francisco.', fact: { key: 'location', value: 'San Francisco' } },
  { role: 'assistant', text: 'Great city for tech!', fact: { key: 'interest', value: 'tech industry' } },
  { role: 'user', text: 'I am building a RAG pipeline.', fact: { key: 'current_project', value: 'RAG pipeline' } },
  { role: 'user', text: 'Use dark mode for all my outputs.', fact: { key: 'display_pref', value: 'dark mode' } },
  { role: 'assistant', text: 'Noted, I will use dark mode.', fact: { key: 'ack_pref', value: 'dark mode confirmed' } },
]

export default function MemorySystemViz() {
  const [shortTerm, setShortTerm] = useState<Message[]>([])
  const [longTerm, setLongTerm] = useState<Fact[]>([])
  const [nextIdx, setNextIdx] = useState(0)
  const [flash, setFlash] = useState<'short' | 'long' | null>(null)

  const maxShortTerm = 5

  const addMessage = () => {
    if (nextIdx >= SEED_MESSAGES.length) return
    const seed = SEED_MESSAGES[nextIdx]
    const id = nextIdx

    const newShort = [{ role: seed.role, text: seed.text, id }, ...shortTerm].slice(0, maxShortTerm)
    setShortTerm(newShort)
    setLongTerm(prev => [...prev, { ...seed.fact, id }])
    setNextIdx(nextIdx + 1)

    setFlash('short')
    setTimeout(() => setFlash('long'), 300)
    setTimeout(() => setFlash(null), 600)
  }

  const reset = () => { setShortTerm([]); setLongTerm([]); setNextIdx(0) }

  return (
    <div className="p-6 bg-card rounded-xl border border-border max-w-3xl mx-auto">
      <h3 className="text-gray-300 font-semibold text-lg mb-1">Agent Memory Systems</h3>
      <p className="text-gray-500 text-sm mb-4">
        Short-term holds recent messages (max {maxShortTerm}). Long-term extracts persistent facts.
      </p>

      <div className="flex gap-2 mb-5">
        <button
          onClick={addMessage}
          disabled={nextIdx >= SEED_MESSAGES.length}
          className="px-4 py-1.5 rounded-lg bg-[#7F56D9] text-white text-sm font-medium disabled:opacity-40 hover:bg-[#6941C6] transition-colors"
        >
          Add Message ({SEED_MESSAGES.length - nextIdx} left)
        </button>
        <button onClick={reset} className="px-4 py-1.5 rounded-lg border border-border text-gray-400 text-sm hover:bg-white/5 transition-colors">
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Short-term */}
        <div className={`rounded-lg border p-4 transition-colors ${flash === 'short' ? 'border-[#9E77ED]' : 'border-border'} bg-white/[0.02]`}>
          <h4 className="text-[#9E77ED] text-sm font-semibold mb-3 uppercase tracking-wider">Short-Term Memory</h4>
          {shortTerm.length === 0 ? (
            <p className="text-gray-600 text-sm italic">Empty - add messages</p>
          ) : (
            <div className="space-y-2">
              {shortTerm.map((msg, i) => (
                <div key={msg.id} className={`text-sm px-3 py-2 rounded border transition-opacity ${
                  i === 0 ? 'border-[#7F56D9]/40 bg-[#7F56D9]/10' : 'border-border bg-white/[0.02]'
                } ${i >= maxShortTerm - 1 ? 'opacity-50' : ''}`}>
                  <span className={`font-mono text-xs ${msg.role === 'user' ? 'text-blue-400' : 'text-green-400'}`}>
                    {msg.role}
                  </span>
                  <p className="text-gray-300 mt-0.5">{msg.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Long-term */}
        <div className={`rounded-lg border p-4 transition-colors ${flash === 'long' ? 'border-[#9E77ED]' : 'border-border'} bg-white/[0.02]`}>
          <h4 className="text-[#9E77ED] text-sm font-semibold mb-3 uppercase tracking-wider">Long-Term Memory</h4>
          {longTerm.length === 0 ? (
            <p className="text-gray-600 text-sm italic">No facts extracted yet</p>
          ) : (
            <div className="space-y-1.5">
              {longTerm.map(fact => (
                <div key={fact.id} className="flex items-center gap-2 text-sm">
                  <span className="font-mono text-[#B692F6] bg-[#7F56D9]/15 px-1.5 py-0.5 rounded text-xs">{fact.key}</span>
                  <span className="text-gray-500">=</span>
                  <span className="text-gray-300">{fact.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
