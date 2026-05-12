'use client'

import { useState, useEffect } from 'react'

interface Agent {
  id: string
  label: string
  role: string
  color: string
  cx: number
  cy: number
}

interface Message { from: number; to: number; text: string }

const AGENTS: Agent[] = [
  { id: 'coord', label: 'Coordinator', role: 'Receives user tasks, decomposes them, delegates to specialists, and merges their outputs.', color: '#7F56D9', cx: 200, cy: 60 },
  { id: 'research', label: 'Researcher', role: 'Searches documents and the web for relevant information. Returns structured findings.', color: '#9E77ED', cx: 60, cy: 220 },
  { id: 'coder', label: 'Coder', role: 'Writes, debugs, and reviews code. Takes specifications and returns implementations.', color: '#B692F6', cx: 200, cy: 300 },
  { id: 'critic', label: 'Critic', role: 'Reviews outputs from other agents for correctness, clarity, and completeness. Flags issues.', color: '#D6BBFB', cx: 340, cy: 220 },
]

const COORD_MESSAGES: Message[] = [
  { from: 0, to: 1, text: 'Find docs on vector DBs' },
  { from: 1, to: 0, text: 'Here are 3 relevant papers' },
  { from: 0, to: 2, text: 'Implement embedding pipeline' },
  { from: 2, to: 0, text: 'Pipeline code ready' },
  { from: 0, to: 3, text: 'Review the pipeline code' },
  { from: 3, to: 0, text: 'Found 2 issues to fix' },
]

const PEER_MESSAGES: Message[] = [
  { from: 1, to: 2, text: 'API schema for embeddings' },
  { from: 2, to: 3, text: 'Review my implementation' },
  { from: 3, to: 1, text: 'Need more context on API' },
  { from: 1, to: 3, text: 'Sending updated docs' },
  { from: 3, to: 2, text: 'Approved with minor fixes' },
  { from: 2, to: 1, text: 'Integrated, all tests pass' },
]

export default function MultiAgentViz() {
  const [mode, setMode] = useState<'coordinator' | 'peer'>('coordinator')
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null)
  const [msgIdx, setMsgIdx] = useState(0)
  const [animating, setAnimating] = useState(false)

  const messages = mode === 'coordinator' ? COORD_MESSAGES : PEER_MESSAGES

  useEffect(() => { setMsgIdx(0); setSelectedAgent(null) }, [mode])

  const step = () => {
    if (msgIdx >= messages.length) return
    setAnimating(true)
    setTimeout(() => setAnimating(false), 400)
    setMsgIdx(msgIdx + 1)
  }

  const reset = () => { setMsgIdx(0); setAnimating(false) }

  const R = 22
  const svgW = 400
  const svgH = 360

  return (
    <div className="p-6 bg-card rounded-xl border border-border max-w-2xl mx-auto">
      <h3 className="text-gray-300 font-semibold text-lg mb-1">Multi-Agent Communication</h3>
      <p className="text-gray-500 text-sm mb-4">Compare coordinator (hub-and-spoke) vs peer-to-peer message patterns.</p>

      <div className="flex gap-2 mb-4">
        {(['coordinator', 'peer'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors capitalize ${
              mode === m ? 'border-[#7F56D9] bg-[#7F56D9]/15 text-white' : 'border-border text-gray-500 hover:bg-white/5'
            }`}>{m === 'peer' ? 'Peer-to-Peer' : 'Coordinator'}</button>
        ))}
      </div>

      <div className="flex gap-4 items-start">
        <svg width={svgW} height={svgH} className="flex-shrink-0">
          {/* Draw message arrows for completed messages */}
          {messages.slice(0, msgIdx).map((msg, i) => {
            const from = AGENTS[msg.from]
            const to = AGENTS[msg.to]
            const isLatest = i === msgIdx - 1
            return (
              <line key={i} x1={from.cx} y1={from.cy} x2={to.cx} y2={to.cy}
                stroke={isLatest && animating ? '#D6BBFB' : '#7F56D9'}
                strokeWidth={isLatest && animating ? 2.5 : 1}
                strokeOpacity={isLatest ? 0.9 : 0.25}
                strokeDasharray={isLatest ? 'none' : '4 4'}
              />
            )
          })}

          {/* Agent nodes */}
          {AGENTS.map((agent, i) => (
            <g key={agent.id} onClick={() => setSelectedAgent(selectedAgent === i ? null : i)} className="cursor-pointer">
              <circle cx={agent.cx} cy={agent.cy} r={R}
                fill={selectedAgent === i ? agent.color : '#1E293B'}
                stroke={agent.color} strokeWidth={2} />
              <text x={agent.cx} y={agent.cy + 4} textAnchor="middle" fontSize={10}
                fill={selectedAgent === i ? 'white' : agent.color} fontWeight={600}>
                {agent.label.slice(0, 3)}
              </text>
              <text x={agent.cx} y={agent.cy + R + 16} textAnchor="middle" fontSize={11} fill="#9CA3AF">
                {agent.label}
              </text>
            </g>
          ))}
        </svg>

        <div className="flex-1 min-w-0">
          {selectedAgent !== null && (
            <div className="mb-3 p-3 rounded-lg bg-white/5 border border-border">
              <span className="text-sm font-medium" style={{ color: AGENTS[selectedAgent].color }}>{AGENTS[selectedAgent].label}</span>
              <p className="text-gray-400 text-xs mt-1">{AGENTS[selectedAgent].role}</p>
            </div>
          )}

          <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
            {messages.slice(0, msgIdx).map((msg, i) => (
              <div key={i} className="text-xs px-2 py-1.5 rounded bg-white/[0.03] border border-border">
                <span style={{ color: AGENTS[msg.from].color }}>{AGENTS[msg.from].label}</span>
                <span className="text-gray-600 mx-1">-&gt;</span>
                <span style={{ color: AGENTS[msg.to].color }}>{AGENTS[msg.to].label}</span>
                <p className="text-gray-400 mt-0.5">{msg.text}</p>
              </div>
            ))}
            {msgIdx === 0 && <p className="text-gray-600 text-xs italic">Click &quot;Next Message&quot; to start</p>}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={step} disabled={msgIdx >= messages.length}
          className="px-4 py-1.5 rounded-lg bg-[#7F56D9] text-white text-sm font-medium disabled:opacity-40 hover:bg-[#6941C6] transition-colors">
          Next Message ({messages.length - msgIdx} left)
        </button>
        <button onClick={reset} className="px-3 py-1.5 rounded-lg border border-border text-gray-400 text-sm hover:bg-white/5 transition-colors">
          Reset
        </button>
      </div>
    </div>
  )
}
