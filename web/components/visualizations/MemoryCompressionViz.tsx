'use client'

import { useState } from 'react'

interface Msg { role: string; text: string; tokens: number }

const SEED: Msg[] = [
  { role: 'user', text: 'Can you explain how transformers work?', tokens: 8 },
  { role: 'assistant', text: 'Transformers use self-attention to process all tokens in parallel, computing weighted relationships between every pair of positions.', tokens: 22 },
  { role: 'user', text: 'What about positional encoding?', tokens: 6 },
  { role: 'assistant', text: 'Since attention has no inherent notion of order, positional encodings (sinusoidal or learned) are added to input embeddings so the model knows where each token sits.', tokens: 30 },
  { role: 'user', text: 'How does multi-head attention help?', tokens: 7 },
  { role: 'assistant', text: 'Multiple heads let the model attend to different representation subspaces simultaneously - one head might capture syntax while another captures semantics.', tokens: 26 },
  { role: 'user', text: 'What is the feed-forward layer for?', tokens: 8 },
  { role: 'assistant', text: 'The FFN applies two linear transforms with a non-linearity, acting as a per-position memory that stores learned patterns from training data.', tokens: 28 },
  { role: 'user', text: 'How do decoder-only models differ?', tokens: 7 },
  { role: 'assistant', text: 'Decoder-only models use causal masking so each token can only attend to earlier positions, enabling autoregressive generation one token at a time.', tokens: 26 },
]

const THRESHOLD = 6

function compress(msgs: Msg[]): { text: string; tokens: number } {
  const origTokens = msgs.reduce((s, m) => s + m.tokens, 0)
  return {
    text: `[Summary of ${msgs.length} messages]: Discussion covered transformer architecture - self-attention, positional encoding, multi-head attention, feed-forward layers, and causal masking in decoder-only models.`,
    tokens: Math.round(origTokens * 0.3),
  }
}

export default function MemoryCompressionViz() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [summary, setSummary] = useState<{ text: string; tokens: number } | null>(null)
  const [nextIdx, setNextIdx] = useState(0)
  const [compressed, setCompressed] = useState(false)

  const totalTokens = messages.reduce((s, m) => s + m.tokens, 0) + (summary?.tokens ?? 0)
  const origTokens = messages.reduce((s, m) => s + m.tokens, 0) + (summary ? messages.length * 15 : 0) // approximate original

  const addMessage = () => {
    if (nextIdx >= SEED.length) return
    const newMsgs = [...messages, SEED[nextIdx]]
    setMessages(newMsgs)
    setNextIdx(nextIdx + 1)

    // Auto-compress when exceeding threshold
    if (newMsgs.length > THRESHOLD && !compressed) {
      const toCompress = newMsgs.slice(0, newMsgs.length - 3)
      const kept = newMsgs.slice(newMsgs.length - 3)
      setSummary(compress(toCompress))
      setMessages(kept)
      setCompressed(true)
    }
  }

  const reset = () => { setMessages([]); setSummary(null); setNextIdx(0); setCompressed(false) }

  return (
    <div className="p-6 bg-card rounded-xl border border-border max-w-3xl mx-auto">
      <h3 className="text-gray-300 font-semibold text-lg mb-1">Memory Compression</h3>
      <p className="text-gray-500 text-sm mb-4">
        Add messages until the threshold ({THRESHOLD}). Older messages get compressed into a summary to save tokens.
      </p>

      <div className="flex gap-2 mb-5">
        <button onClick={addMessage} disabled={nextIdx >= SEED.length}
          className="px-4 py-1.5 rounded-lg bg-[#7F56D9] text-white text-sm font-medium disabled:opacity-40 hover:bg-[#6941C6] transition-colors">
          Add Message ({SEED.length - nextIdx} left)
        </button>
        <button onClick={reset} className="px-3 py-1.5 rounded-lg border border-border text-gray-400 text-sm hover:bg-white/5 transition-colors">
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left: raw messages or compressed view */}
        <div className="rounded-lg border border-border bg-white/[0.02] p-4">
          <h4 className="text-[#9E77ED] text-sm font-semibold mb-3 uppercase tracking-wider">
            {compressed ? 'Compressed Context' : 'Full Messages'}
          </h4>
          {summary && (
            <div className="mb-3 p-2.5 rounded-lg border border-[#7F56D9]/30 bg-[#7F56D9]/10 text-xs">
              <span className="text-[#B692F6] font-mono text-xs">SUMMARY ({summary.tokens} tok)</span>
              <p className="text-gray-300 mt-1">{summary.text}</p>
            </div>
          )}
          <div className="space-y-1.5">
            {messages.map((msg, i) => (
              <div key={i} className="text-sm px-2.5 py-2 rounded border border-border bg-white/[0.02]">
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-xs ${msg.role === 'user' ? 'text-blue-400' : 'text-green-400'}`}>{msg.role}</span>
                  <span className="text-gray-600 text-xs">{msg.tokens} tok</span>
                </div>
                <p className="text-gray-300 text-xs mt-0.5">{msg.text}</p>
              </div>
            ))}
            {messages.length === 0 && !summary && <p className="text-gray-600 text-sm italic">No messages yet</p>}
          </div>
        </div>

        {/* Right: token stats */}
        <div className="rounded-lg border border-border bg-white/[0.02] p-4">
          <h4 className="text-[#9E77ED] text-sm font-semibold mb-3 uppercase tracking-wider">Token Stats</h4>
          <div className="space-y-3">
            <div>
              <span className="text-gray-500 text-xs">Messages in context</span>
              <p className="text-white font-mono text-lg">{messages.length}{summary ? ' + summary' : ''}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Current token usage</span>
              <p className="text-white font-mono text-lg">{totalTokens}</p>
            </div>
            {compressed && (
              <>
                <div className="border-t border-border pt-3">
                  <span className="text-gray-500 text-xs">Tokens saved by compression</span>
                  <p className="text-green-400 font-mono text-lg">{Math.max(origTokens - totalTokens, 0)}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Compression ratio</span>
                  <p className="text-[#B692F6] font-mono text-lg">
                    {origTokens > 0 ? ((1 - totalTokens / origTokens) * 100).toFixed(0) : 0}% smaller
                  </p>
                </div>
              </>
            )}
            {!compressed && messages.length > 0 && (
              <div className="mt-2 p-2 rounded bg-white/5 text-xs text-gray-500">
                Compression triggers at {THRESHOLD + 1} messages. {THRESHOLD + 1 - messages.length} more to go.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
