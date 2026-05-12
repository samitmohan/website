'use client'

import { useState } from 'react'

const TOKENS = [
  { id: 'CT-1', uuid: 'a3f7b2c1-9e4d-4a1b-8c6f-2d5e7a9b0c3d', location: 'Paragraph 2, line 3', leaked: true },
  { id: 'CT-2', uuid: 'e8d4f6a2-3b7c-4e9f-a5d1-6c8b0e2f4a7d', location: 'Section header', leaked: false },
  { id: 'CT-3', uuid: 'b1c9e5f3-7a2d-4b8e-9f6c-3d0a4e7b1c5f', location: 'Footer metadata', leaked: true },
  { id: 'CT-4', uuid: 'f4a8d2e6-1b5c-4d9f-a3e7-8c6b0f2d4a1e', location: 'Hidden field', leaked: false },
  { id: 'CT-5', uuid: '9e3c7a1f-5d2b-4f8e-b6a4-0c9d2e5f3b7a', location: 'Watermark layer', leaked: true },
]

const DOC_LINES = [
  { text: 'Our quarterly revenue grew 12% year-over-year, driven by', hasToken: false, tokenIdx: -1 },
  { text: 'strong enterprise adoption. The new API platform launched', hasToken: false, tokenIdx: -1 },
  { text: 'in Q2 with [CT-1: a3f7b2c1-9e4d-...] positive reception.', hasToken: true, tokenIdx: 0 },
  { text: 'Customer retention rates remain above 95% across all tiers.', hasToken: false, tokenIdx: -1 },
  { text: 'Internal projections [CT-3: b1c9e5f3-7a2d-...] suggest', hasToken: true, tokenIdx: 2 },
  { text: 'continued growth. R&D investment increased to 28% of revenue.', hasToken: false, tokenIdx: -1 },
]

export default function CanaryTokenViz() {
  const [revealed, setRevealed] = useState(false)
  const [selectedToken, setSelectedToken] = useState<number | null>(null)

  const leakedCount = TOKENS.filter(t => t.leaked).length

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-orange-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-orange-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Canary Token Detection</h3>
          <p className="text-xs text-muted-foreground">Unique UUID markers embedded in documents to detect data leakage</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 space-y-3">
          <div className="text-xs uppercase font-bold text-muted-foreground">Source Document (with embedded canary tokens)</div>
          <div className="bg-muted/40 border border-border rounded-lg p-3 font-mono text-sm leading-relaxed space-y-1">
            {DOC_LINES.map((line, i) => (
              <div key={i} className={line.hasToken ? 'transition-colors duration-300' : ''}>
                {line.hasToken ? (
                  <span>
                    {line.text.split(/(\[CT-\d+:.*?\])/).map((part, j) =>
                      part.match(/\[CT-\d+:/) ? (
                        <span
                          key={j}
                          className="px-1 py-0.5 rounded cursor-pointer transition-all duration-300"
                          style={{
                            backgroundColor: revealed
                              ? TOKENS[line.tokenIdx].leaked ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'
                              : 'rgba(251,146,60,0.15)',
                            border: `1px solid ${revealed
                              ? TOKENS[line.tokenIdx].leaked ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)'
                              : 'rgba(251,146,60,0.3)'}`,
                            color: revealed
                              ? TOKENS[line.tokenIdx].leaked ? '#fca5a5' : '#86efac'
                              : '#fdba74',
                          }}
                          onClick={() => setSelectedToken(line.tokenIdx)}
                        >
                          {part}
                        </span>
                      ) : (
                        <span key={j} className="text-foreground/70">{part}</span>
                      )
                    )}
                  </span>
                ) : (
                  <span className="text-foreground/70">{line.text}</span>
                )}
              </div>
            ))}
          </div>

          {/* Token registry */}
          <div className="text-xs uppercase font-bold text-muted-foreground mt-3">Token Registry</div>
          <div className="space-y-1.5">
            {TOKENS.map((token, i) => (
              <div
                key={token.id}
                onClick={() => setSelectedToken(i)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all duration-300"
                style={{
                  borderColor: selectedToken === i ? 'rgba(251,146,60,0.4)' : 'rgba(255,255,255,0.06)',
                  backgroundColor: selectedToken === i ? 'rgba(251,146,60,0.05)' : 'transparent',
                }}
              >
                <span className="text-xs font-mono font-bold text-orange-400 w-10">{token.id}</span>
                <span className="text-sm font-mono text-foreground/50 flex-1 truncate">{token.uuid}</span>
                <span className="text-[8px] text-muted-foreground w-24">{token.location}</span>
                <div
                  className="w-2 h-2 rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: revealed
                      ? token.leaked ? '#ef4444' : '#22c55e'
                      : 'rgba(255,255,255,0.15)',
                  }}
                />
                <span
                  className="text-base font-bold w-16 text-right transition-colors duration-500"
                  style={{
                    color: revealed
                      ? token.leaked ? '#fca5a5' : '#86efac'
                      : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {revealed ? (token.leaked ? 'LEAKED' : 'SAFE') : '-----'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <button
            onClick={() => setRevealed(!revealed)}
            className={`text-xs px-4 py-2 rounded-lg border transition-all duration-300 ${
              revealed
                ? 'bg-red-500/20 border-red-500/40 text-red-300'
                : 'bg-orange-500/20 border-orange-500/40 text-orange-300 hover:bg-orange-500/30'
            }`}
          >
            {revealed ? 'Hide Leak Status' : 'Reveal Leak Detection'}
          </button>

          {revealed && (
            <div className="bg-muted border border-border p-3 rounded-xl space-y-2 transition-all duration-300">
              <div className="text-xs uppercase font-bold text-muted-foreground">Detection Summary</div>
              <div className="text-2xl font-mono font-bold text-red-400">{leakedCount}/{TOKENS.length}</div>
              <div className="text-xs text-red-300/70">tokens found in model output</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div
                  className="h-2 rounded-full transition-all duration-700 bg-red-500/60"
                  style={{ width: `${(leakedCount / TOKENS.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {selectedToken !== null && (
            <div className="bg-muted border border-border p-3 rounded-xl space-y-1">
              <div className="text-xs uppercase font-bold text-muted-foreground">Token Detail</div>
              <div className="text-xs font-mono text-orange-400">{TOKENS[selectedToken].id}</div>
              <div className="text-sm font-mono text-foreground/50 break-all">{TOKENS[selectedToken].uuid}</div>
              <div className="text-xs text-muted-foreground">Location: {TOKENS[selectedToken].location}</div>
            </div>
          )}

          <div className="mt-auto bg-orange-500/5 border border-orange-500/10 p-3 rounded-lg">
            <p className="text-xs text-orange-300 leading-relaxed italic">
              Canary tokens act as invisible tripwires. Each document copy gets unique UUIDs. When a model outputs one of these tokens, you trace the leak back to the specific document copy and recipient.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
