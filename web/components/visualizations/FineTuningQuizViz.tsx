'use client'

import { useState } from 'react'

const PROMPT = 'Classify the sentiment: "This product exceeded my expectations!"'

const COMPARISONS = [
  {
    label: 'Sentiment Analysis',
    prompt: 'Classify the sentiment: "This product exceeded my expectations!"',
    base: 'The product exceeded expectations. This means the user was happy with the product. Expectations can be defined as...',
    finetuned: 'positive',
    baseLabel: 'Verbose, off-task',
    ftLabel: 'Precise, formatted',
  },
  {
    label: 'Code Generation',
    prompt: 'Write a Python function to reverse a string.',
    base: 'To reverse a string in Python, you can use slicing. Here is an example: the string "hello" reversed would be "olleh". You could also use a loop...',
    finetuned: 'def reverse_string(s: str) -> str:\n    return s[::-1]',
    baseLabel: 'Explains but no code',
    ftLabel: 'Clean, executable code',
  },
  {
    label: 'Medical QA',
    prompt: 'What are common symptoms of type 2 diabetes?',
    base: 'Diabetes is a disease. There are different types. Type 2 is the most common. People should see a doctor for medical advice.',
    finetuned: 'Common symptoms: increased thirst (polydipsia), frequent urination (polyuria), unexplained weight loss, fatigue, blurred vision, slow wound healing.',
    baseLabel: 'Generic, unhelpful',
    ftLabel: 'Domain-specific, structured',
  },
]

const METHODS = [
  { label: 'Full Fine-Tuning', params: 100, trainable: 100, color: '#818cf8' },
  { label: 'LoRA (r=16)', params: 100, trainable: 0.3, color: '#34d399' },
  { label: 'QLoRA', params: 100, trainable: 0.1, color: '#fbbf24' },
  { label: 'Prefix Tuning', params: 100, trainable: 0.5, color: '#f472b6' },
]

export default function FineTuningQuizViz() {
  const [exampleIdx, setExampleIdx] = useState(0)
  const example = COMPARISONS[exampleIdx]

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-amber-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-amber-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Fine-Tuning Comparison</h3>
          <p className="text-xs text-muted-foreground">Base vs fine-tuned model outputs and parameter efficiency methods</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 space-y-3">
          {/* Prompt */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-2">
            <div className="text-sm uppercase font-bold text-amber-400">Prompt</div>
            <div className="text-sm text-foreground/80 font-mono mt-1">{example.prompt}</div>
          </div>

          {/* Side by side outputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-red-500/15 bg-red-500/3 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-red-400">Base Model</span>
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">{example.baseLabel}</span>
              </div>
              <div className="text-xs text-foreground/60 font-mono leading-relaxed whitespace-pre-wrap">{example.base}</div>
            </div>
            <div className="border border-emerald-500/15 bg-emerald-500/3 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-400">Fine-Tuned</span>
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">{example.ftLabel}</span>
              </div>
              <div className="text-xs text-foreground/60 font-mono leading-relaxed whitespace-pre-wrap">{example.finetuned}</div>
            </div>
          </div>

          {/* Parameter efficiency chart */}
          <div className="text-sm uppercase font-bold text-muted-foreground mt-2">Parameter Efficiency</div>
          <div className="space-y-2">
            {METHODS.map(method => (
              <div key={method.label} className="flex items-center gap-2">
                <span className="text-xs w-28 font-mono" style={{ color: method.color }}>{method.label}</span>
                <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${method.trainable}%`, backgroundColor: `${method.color}55` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono text-foreground/60">
                    {method.trainable}% trainable
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Cost comparison */}
          <div className="bg-muted/30 border border-border rounded-lg p-3">
            <div className="text-sm uppercase font-bold text-muted-foreground mb-2">Practical Comparison (7B model)</div>
            <div className="grid grid-cols-3 gap-2 text-sm font-mono">
              <div className="text-muted-foreground">Method</div><div className="text-muted-foreground">GPU RAM</div><div className="text-muted-foreground">Time (1K steps)</div>
              <div className="text-indigo-400">Full FT</div><div>~60 GB</div><div>~4 hours</div>
              <div className="text-emerald-400">LoRA</div><div>~16 GB</div><div>~1.5 hours</div>
              <div className="text-amber-400">QLoRA</div><div>~10 GB</div><div>~2 hours</div>
            </div>
          </div>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div className="space-y-1.5">
            <div className="text-xs uppercase font-bold text-muted-foreground">Examples</div>
            {COMPARISONS.map((comp, i) => (
              <button
                key={i}
                onClick={() => setExampleIdx(i)}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg border transition ${i === exampleIdx ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'border-border text-muted-foreground hover:bg-accent'}`}
              >
                {comp.label}
              </button>
            ))}
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-1">
            <div className="text-xs uppercase font-bold text-muted-foreground">Key Insight</div>
            <div className="text-xs text-foreground/70 leading-relaxed">
              LoRA trains only 0.1-0.3% of parameters by adding low-rank matrices to attention weights. Performance matches full fine-tuning on most tasks.
            </div>
          </div>

          <div className="mt-auto bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg">
            <p className="text-xs text-amber-300 leading-relaxed italic">
              Fine-tuning adapts a pre-trained model to specific tasks or domains. Parameter-efficient methods like LoRA make this feasible on consumer GPUs by training fewer than 1% of weights.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
