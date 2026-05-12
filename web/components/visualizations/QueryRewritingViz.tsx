'use client'

import { useState } from 'react'

type Strategy = 'decomposition' | 'expansion' | 'hyde' | 'stepback'

const STRATEGIES: { key: Strategy; label: string; description: string; color: string }[] = [
  { key: 'decomposition', label: 'Decomposition', description: 'Break complex queries into simpler sub-queries', color: '#6366f1' },
  { key: 'expansion', label: 'Expansion', description: 'Add synonyms and related terms', color: '#f59e0b' },
  { key: 'hyde', label: 'HyDE', description: 'Generate a hypothetical answer, embed that instead', color: '#ec4899' },
  { key: 'stepback', label: 'Step-Back', description: 'Abstract to a higher-level question first', color: '#34d399' },
]

const EXAMPLES: Record<string, { original: string; steps: string[]; result: string[]; retrievalBoost: string }> = {
  decomposition: {
    original: 'What are the key differences between RAG and fine-tuning for adding domain knowledge?',
    steps: [
      'Identify compound question structure',
      'Split into independent sub-queries',
      'Each sub-query retrieves independently, then merge results',
    ],
    result: [
      'What is RAG for adding domain knowledge?',
      'What is fine-tuning for adding domain knowledge?',
      'RAG vs fine-tuning comparison tradeoffs',
    ],
    retrievalBoost: '3 focused retrievals hit more relevant chunks than 1 broad query',
  },
  expansion: {
    original: 'How does attention work in transformers?',
    steps: [
      'Parse key concepts: "attention", "transformers"',
      'Expand with synonyms and related terms',
      'Combine into enriched query',
    ],
    result: [
      'How does self-attention (scaled dot-product attention, multi-head attention) work in transformer architecture (encoder-decoder, BERT, GPT)?',
    ],
    retrievalBoost: 'Expanded terms match chunks that use different vocabulary for the same concept',
  },
  hyde: {
    original: 'Why do LLMs hallucinate?',
    steps: [
      'Generate a hypothetical answer (no retrieval yet)',
      'Embed the hypothetical answer instead of the question',
      'Hypothetical answer is closer in embedding space to real answers',
    ],
    result: [
      '[Hypothetical] LLMs hallucinate because they are trained to predict plausible next tokens, not to verify factual accuracy. The model learns statistical patterns in training data and generates fluent text that may combine facts incorrectly or fabricate details when the training signal is weak.',
    ],
    retrievalBoost: 'The hypothetical answer shares vocabulary with real documents, improving cosine similarity',
  },
  stepback: {
    original: 'Why did GPT-4 switch from sparse MoE to dense architecture?',
    steps: [
      'Identify overly specific question (may not have direct answer)',
      'Generate a broader "step-back" question',
      'Retrieve for the broad question, then answer the specific one',
    ],
    result: [
      'What are the architectural design decisions and tradeoffs in large language models like GPT-4?',
    ],
    retrievalBoost: 'Broader question retrieves relevant context even when the specific claim lacks documentation',
  },
}

export default function QueryRewritingViz() {
  const [strategy, setStrategy] = useState<Strategy>('decomposition')
  const [step, setStep] = useState(0)

  const data = EXAMPLES[strategy]
  const strat = STRATEGIES.find(s => s.key === strategy)!
  const maxStep = data.steps.length + 1 // steps + final result

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-indigo-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Query Rewriting</h3>
          <p className="text-xs text-muted-foreground">Transform raw queries for better retrieval</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 space-y-4">
          {/* Original query */}
          <div className="space-y-1">
            <div className="text-xs uppercase font-bold text-muted-foreground">Original Query</div>
            <div className="bg-muted/50 border border-border rounded-lg p-3 text-xs font-mono text-foreground/80">
              {data.original}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <svg className="w-6 h-8" viewBox="0 0 24 32" fill="none">
              <path d="M12 2v24m0 0l-6-6m6 6l6-6" stroke={strat.color} strokeWidth="2" strokeOpacity="0.5" />
            </svg>
          </div>

          {/* Rewriting steps */}
          <div className="space-y-2">
            <div className="text-xs uppercase font-bold" style={{ color: strat.color }}>
              {strat.label} Steps
            </div>
            {data.steps.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-2 transition-all duration-300"
                style={{ opacity: step > i ? 1 : 0.25 }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-base font-bold mt-0.5 shrink-0 transition-colors duration-300"
                  style={{
                    backgroundColor: step > i ? `${strat.color}22` : 'transparent',
                    border: `1px solid ${step > i ? strat.color : 'rgba(255,255,255,0.1)'}`,
                    color: step > i ? strat.color : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {i + 1}
                </div>
                <div className="text-sm text-foreground/70">{s}</div>
              </div>
            ))}
          </div>

          {/* Arrow */}
          {step >= maxStep && (
            <div className="flex justify-center">
              <svg className="w-6 h-8" viewBox="0 0 24 32" fill="none">
                <path d="M12 2v24m0 0l-6-6m6 6l6-6" stroke={strat.color} strokeWidth="2" strokeOpacity="0.5" />
              </svg>
            </div>
          )}

          {/* Result */}
          {step >= maxStep && (
            <div className="space-y-2">
              <div className="text-xs uppercase font-bold text-emerald-400">Rewritten Query</div>
              {data.result.map((r, i) => (
                <div
                  key={i}
                  className="border rounded-lg p-3 text-xs font-mono leading-relaxed transition-all duration-300"
                  style={{
                    backgroundColor: `${strat.color}08`,
                    borderColor: `${strat.color}33`,
                    color: `${strat.color}dd`,
                  }}
                >
                  {strategy === 'hyde' ? (
                    <span className="italic">{r}</span>
                  ) : (
                    <span>{r}</span>
                  )}
                </div>
              ))}
              <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-lg p-2 text-xs text-emerald-300/80">
                Retrieval boost: {data.retrievalBoost}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div className="space-y-1.5">
            <div className="text-xs uppercase font-bold text-muted-foreground">Strategy</div>
            {STRATEGIES.map((s) => (
              <button
                key={s.key}
                onClick={() => { setStrategy(s.key); setStep(0) }}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg border transition-all duration-200 ${
                  s.key === strategy
                    ? 'border-opacity-40 bg-opacity-10'
                    : 'border-border text-muted-foreground hover:bg-accent'
                }`}
                style={s.key === strategy ? {
                  backgroundColor: `${s.color}15`,
                  borderColor: `${s.color}44`,
                  color: s.color,
                } : undefined}
              >
                <div className="font-bold">{s.label}</div>
                <div className="text-muted-foreground" style={s.key === strategy ? { color: `${s.color}88` } : undefined}>
                  {s.description}
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step <= 0}
              className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground transition hover:text-foreground disabled:opacity-30"
            >
              Prev
            </button>
            <button
              onClick={() => setStep(Math.min(maxStep, step + 1))}
              disabled={step >= maxStep}
              className="text-xs px-4 py-1.5 rounded-lg border transition hover:opacity-80 disabled:opacity-30"
              style={{
                backgroundColor: `${strat.color}22`,
                borderColor: `${strat.color}44`,
                color: strat.color,
              }}
            >
              Next ({step}/{maxStep})
            </button>
            <button
              onClick={() => setStep(0)}
              className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground transition hover:text-foreground"
            >
              Reset
            </button>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-1.5">
            <div className="text-xs uppercase font-bold text-muted-foreground">Why Rewrite?</div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              User queries are often vague, compound, or use different vocabulary than the indexed documents. Rewriting bridges the gap between how users ask and how knowledge is stored, yielding higher-relevance retrieval results.
            </div>
          </div>

          <div className="mt-auto bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-lg">
            <p className="text-xs text-indigo-300 leading-relaxed italic">
              Perplexity AI rewrites every user query before search. Query rewriting is the highest-leverage improvement for most RAG systems - it costs one extra LLM call but can double retrieval precision.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
