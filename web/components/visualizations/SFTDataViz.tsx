'use client'

import { useState } from 'react'

type Template = 'alpaca' | 'chatml' | 'llama2' | 'mistral'

const EXAMPLE = {
  instruction: 'Explain what a neural network is in simple terms.',
  input: '',
  output: 'A neural network is a computer system inspired by the human brain. It consists of layers of connected nodes that process information, learn patterns from data, and make predictions.',
}

const TEMPLATES: Record<Template, { name: string; wrap: (inst: string, out: string) => string }> = {
  alpaca: {
    name: 'Alpaca',
    wrap: (inst, out) =>
      `### Instruction:\n${inst}\n\n### Response:\n${out}`,
  },
  chatml: {
    name: 'ChatML',
    wrap: (inst, out) =>
      `<|im_start|>system\nYou are a helpful assistant.<|im_end|>\n<|im_start|>user\n${inst}<|im_end|>\n<|im_start|>assistant\n${out}<|im_end|>`,
  },
  llama2: {
    name: 'Llama 2',
    wrap: (inst, out) =>
      `<s>[INST] <<SYS>>\nYou are a helpful assistant.\n<</SYS>>\n\n${inst} [/INST] ${out} </s>`,
  },
  mistral: {
    name: 'Mistral',
    wrap: (inst, out) =>
      `<s>[INST] ${inst} [/INST]${out}</s>`,
  },
}

function tokenize(text: string): string[] {
  // Simplified BPE-like tokenization
  const tokens: string[] = []
  const words = text.split(/(\s+|[<>|/\[\]{}#:.\n])/)
  for (const w of words) {
    if (!w) continue
    if (w.length <= 4) { tokens.push(w) }
    else {
      for (let i = 0; i < w.length; i += 3) {
        tokens.push(w.slice(i, i + 3))
      }
    }
  }
  return tokens.filter(t => t.length > 0)
}

const STAGE_COLORS = [
  'border-blue-500/40 bg-blue-500/10',
  'border-green-500/40 bg-green-500/10',
  'border-amber-500/40 bg-amber-500/10',
  'border-purple-500/40 bg-purple-500/10',
]

export default function SFTDataViz() {
  const [template, setTemplate] = useState<Template>('alpaca')
  const [activeStage, setActiveStage] = useState(0)

  const formatted = TEMPLATES[template].wrap(EXAMPLE.instruction, EXAMPLE.output)
  const tokens = tokenize(formatted)

  const stages = [
    {
      title: 'Raw Text',
      label: 'Source data',
      content: 'A neural network is a computer system inspired by the human brain...',
    },
    {
      title: 'Alpaca Format',
      label: 'Structured fields',
      content: JSON.stringify(EXAMPLE, null, 2),
    },
    {
      title: 'Chat Template',
      label: `${TEMPLATES[template].name} format`,
      content: formatted,
    },
    {
      title: 'Tokenized',
      label: `${tokens.length} tokens`,
      content: null,
    },
  ]

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-green-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-green-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <path d="M14 2v6h6" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold">SFT Data Pipeline</h3>
          <p className="text-xs text-muted-foreground">Raw text -&gt; Instruction format -&gt; Chat template -&gt; Tokens</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 space-y-3">
          {/* Pipeline stages */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {stages.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveStage(i)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                    activeStage === i ? STAGE_COLORS[i] + ' font-bold' : 'border-border text-muted-foreground'
                  }`}
                >
                  {s.title}
                </button>
                {i < stages.length - 1 && (
                  <svg className="w-3 h-3 text-muted-foreground" viewBox="0 0 12 12">
                    <path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                )}
              </div>
            ))}
          </div>

          {/* Stage content */}
          <div className="border border-border rounded-xl p-3 bg-card/50 min-h-[160px]">
            <div className="text-sm uppercase font-bold text-muted-foreground mb-2">
              Stage {activeStage + 1}: {stages[activeStage].label}
            </div>
            {activeStage < 3 ? (
              <pre className="text-sm font-mono text-foreground/80 whitespace-pre-wrap leading-relaxed">
                {stages[activeStage].content}
              </pre>
            ) : (
              <div className="flex flex-wrap gap-1">
                {tokens.map((tok, i) => (
                  <span
                    key={i}
                    className="text-sm font-mono px-1.5 py-0.5 rounded border border-purple-500/30 bg-purple-500/10 text-purple-300"
                  >
                    {tok.replace(/\n/g, '\\n')}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Alpaca format highlight */}
          {activeStage === 1 && (
            <div className="grid grid-cols-3 gap-2">
              {(['instruction', 'input', 'output'] as const).map(field => (
                <div key={field} className="border border-border rounded-lg p-2 bg-card/50">
                  <div className="text-sm uppercase font-bold text-green-400 mb-1">{field}</div>
                  <div className="text-xs font-mono text-muted-foreground">
                    {EXAMPLE[field] || '(empty)'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div>
            <div className="text-xs uppercase font-bold text-muted-foreground mb-2">Chat Template</div>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(TEMPLATES) as Template[]).map(t => (
                <button
                  key={t}
                  onClick={() => { setTemplate(t); setActiveStage(2) }}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                    template === t
                      ? 'bg-green-500/20 border-green-500/40 text-green-300'
                      : 'border-border text-muted-foreground hover:border-green-500/30'
                  }`}
                >
                  {TEMPLATES[t].name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-2">
            <div className="text-xs uppercase font-bold text-muted-foreground">Token Stats</div>
            <div className="text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total tokens</span>
                <span className="text-green-400">{tokens.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Template</span>
                <span className="text-green-400">{TEMPLATES[template].name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Padding needed</span>
                <span className="text-green-400">{Math.max(0, 128 - tokens.length)} tokens</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sequence length</span>
                <span className="text-green-400">{Math.max(128, tokens.length)}</span>
              </div>
            </div>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl">
            <div className="text-xs uppercase font-bold text-muted-foreground mb-1">Padding</div>
            <div className="w-full h-4 bg-accent rounded-full overflow-hidden flex">
              <div
                className="h-full bg-green-500/60 transition-all duration-300"
                style={{ width: `${Math.min(100, (tokens.length / 128) * 100)}%` }}
              />
              <div className="h-full bg-muted-foreground/10 flex-1" />
            </div>
            <div className="flex justify-between text-[8px] text-muted-foreground mt-1">
              <span>Content ({tokens.length})</span>
              <span>Pad ({Math.max(0, 128 - tokens.length)})</span>
            </div>
          </div>

          <div className="mt-auto bg-green-500/5 border border-green-500/10 p-3 rounded-lg">
            <p className="text-xs text-green-300 leading-relaxed italic">
              SFT data preparation converts raw text into structured instruction-response pairs, wraps them in a chat template ({TEMPLATES[template].name}), and tokenizes the result. Different models expect different templates - using the wrong one degrades performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}