'use client'

import { useState } from 'react'

const COLORS = ['#818cf8','#f472b6','#34d399','#fbbf24','#fb923c','#38bdf8','#a78bfa','#f87171','#2dd4bf','#e879f9','#84cc16','#f59e0b']

const charTokenize = (t: string) => t.split('')
const wordTokenize = (t: string) => t.match(/\S+|\s+/g) || []
function bpeTokenize(text: string): string[] {
  const merges = new Set(['th','he','in','er','an','the','ing','tion','ent'])
  const tokens: string[] = []; let i = 0; const lower = text.toLowerCase()
  while (i < text.length) {
    if (text[i] === ' ') { tokens.push(' '); i++; continue }
    let matched = false
    for (let len = 4; len >= 2; len--) {
      if (merges.has(lower.slice(i, i + len))) { tokens.push(text.slice(i, i + len)); i += len; matched = true; break }
    }
    if (!matched) { tokens.push(text[i]); i++ }
  }
  return tokens
}

export default function TokenizationQuizViz() {
  const [text, setText] = useState('The attention mechanism transforms inputs.')

  const charTokens = charTokenize(text)
  const wordTokens = wordTokenize(text)
  const bpeTokens = bpeTokenize(text)

  const methods = [
    { label: 'Character', tokens: charTokens, color: '#818cf8', desc: 'Every character is a token - maximum granularity, huge sequences' },
    { label: 'Word', tokens: wordTokens, color: '#34d399', desc: 'Split on whitespace/punctuation - simple but large vocabulary' },
    { label: 'BPE (approx)', tokens: bpeTokens, color: '#f472b6', desc: 'Subword merges - balances vocabulary size and sequence length' },
  ]

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-sky-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-sky-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h8" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Tokenization Methods</h3>
          <p className="text-xs text-muted-foreground">Compare character, word, and BPE tokenization side by side</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 space-y-4">
          {/* Input */}
          <div>
            <div className="text-sm uppercase font-bold text-muted-foreground mb-1">Input Text</div>
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground focus:border-sky-500 focus:outline-none"
              placeholder="Type something..."
            />
          </div>

          {/* Three columns */}
          <div className="grid grid-cols-3 gap-3">
            {methods.map(method => (
              <div key={method.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: method.color }}>{method.label}</span>
                  <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-muted border border-border" style={{ color: method.color }}>
                    {method.tokens.filter(t => t.trim()).length} tokens
                  </span>
                </div>
                <div className="bg-muted/40 border border-border rounded-lg p-2 min-h-[120px]">
                  <div className="flex flex-wrap gap-0.5">
                    {method.tokens.map((token, i) => {
                      if (token === ' ') {
                        return <span key={i} className="text-xs text-foreground/20 px-0.5">_</span>
                      }
                      return (
                        <span
                          key={i}
                          className="px-1 py-0.5 rounded text-xs font-mono transition-all duration-200"
                          style={{
                            backgroundColor: `${COLORS[i % COLORS.length]}18`,
                            border: `1px solid ${COLORS[i % COLORS.length]}33`,
                            color: COLORS[i % COLORS.length],
                          }}
                        >
                          {token}
                        </span>
                      )
                    })}
                  </div>
                </div>
                <div className="text-[8px] text-muted-foreground">{method.desc}</div>
              </div>
            ))}
          </div>

          {/* Comparison stats */}
          <div className="bg-muted/30 border border-border rounded-lg p-3">
            <div className="text-sm uppercase font-bold text-muted-foreground mb-2">Token Count Comparison</div>
            <div className="space-y-1.5">
              {methods.map(method => {
                const count = method.tokens.filter(t => t.trim()).length
                const maxCount = charTokens.filter(t => t.trim()).length
                return (
                  <div key={method.label} className="flex items-center gap-2">
                    <span className="text-xs w-16 font-mono" style={{ color: method.color }}>{method.label}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(count / Math.max(maxCount, 1)) * 100}%`, backgroundColor: method.color }}
                      />
                    </div>
                    <span className="text-xs font-mono w-6 text-right" style={{ color: method.color }}>{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div className="bg-muted border border-border p-3 rounded-xl space-y-1">
            <div className="text-xs uppercase font-bold text-muted-foreground">Input Length</div>
            <div className="text-lg font-mono font-bold text-sky-400">{text.length} chars</div>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-2">
            <div className="text-xs uppercase font-bold text-muted-foreground">Compression Ratio</div>
            <div className="text-xs font-mono space-y-1">
              {methods.map(m => {
                const count = m.tokens.filter(t => t.trim()).length
                const ratio = count > 0 ? (text.replace(/\s/g, '').length / count).toFixed(1) : '-'
                return (
                  <div key={m.label} className="flex justify-between">
                    <span style={{ color: m.color }}>{m.label}</span>
                    <span className="text-foreground/60">{ratio} chars/token</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs uppercase font-bold text-muted-foreground">Try These</div>
            {['Hello world!', 'unbelievable', 'The attention mechanism transforms inputs.'].map(sample => (
              <button
                key={sample}
                onClick={() => setText(sample)}
                className="w-full text-left text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:bg-accent transition truncate"
              >
                {sample}
              </button>
            ))}
          </div>

          <div className="mt-auto bg-sky-500/5 border border-sky-500/10 p-3 rounded-lg">
            <p className="text-xs text-sky-300 leading-relaxed italic">
              BPE balances vocabulary size with sequence length. GPT-4 uses ~100K BPE tokens. Character tokenization creates huge sequences, while word-level creates huge vocabularies for rare words.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
