'use client'

import { useState } from 'react'

interface TestCase {
  id: string
  input: string
  expected: string
  output: string
  bleu: number
  rouge: number
  pass: boolean
}

const TEST_CASES: TestCase[] = [
  { id: 'TC-1', input: 'Translate: The cat sat on the mat', expected: 'Le chat etait assis sur le tapis', output: 'Le chat assis sur le tapis', bleu: 0.72, rouge: 0.85, pass: true },
  { id: 'TC-2', input: 'Summarize: Long article about climate...', expected: 'Climate change impacts global...', output: 'Global warming affects ecosystems...', bleu: 0.41, rouge: 0.58, pass: false },
  { id: 'TC-3', input: 'Q&A: What is photosynthesis?', expected: 'Process where plants convert sunlight...', output: 'Plants convert light energy to chemical energy...', bleu: 0.68, rouge: 0.79, pass: true },
  { id: 'TC-4', input: 'Classify: I love this product!', expected: 'positive', output: 'positive', bleu: 1.0, rouge: 1.0, pass: true },
]

const PASS_THRESHOLD = { bleu: 0.5, rouge: 0.6 }

export default function EvalPipelineViz() {
  const [step, setStep] = useState(0)
  const [selectedCase, setSelectedCase] = useState(0)

  const stages = ['Test Cases', 'Model Inference', 'Compute Metrics', 'Pass/Fail']

  const handleNext = () => setStep(s => Math.min(s + 1, stages.length - 1))
  const handleReset = () => { setStep(0); setSelectedCase(0) }

  const passCount = TEST_CASES.filter(t => t.pass).length
  const passRate = (passCount / TEST_CASES.length * 100).toFixed(0)

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-emerald-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-emerald-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Eval Pipeline</h3>
          <p className="text-xs text-muted-foreground">Test cases through model to scored results with pass/fail</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 space-y-3">
          {/* Pipeline stages */}
          <div className="flex items-center gap-1">
            {stages.map((s, i) => (
              <div key={i} className="flex items-center gap-1">
                <div
                  className="px-2.5 py-1 rounded-lg text-xs font-bold border transition-all duration-300"
                  style={{
                    borderColor: i <= step ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.08)',
                    backgroundColor: i === step ? 'rgba(52,211,153,0.12)' : i < step ? 'rgba(52,211,153,0.05)' : 'transparent',
                    color: i <= step ? '#34d399' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {s}
                </div>
                {i < stages.length - 1 && (
                  <svg className="w-4 h-3" viewBox="0 0 16 12"><path d="M2 6h8m0 0l-3-3m3 3l-3 3" stroke={i < step ? '#34d399' : 'rgba(255,255,255,0.1)'} strokeWidth="1.5" fill="none" /></svg>
                )}
              </div>
            ))}
          </div>

          {/* Test case table */}
          <div className="bg-muted/30 rounded-lg overflow-hidden border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-2 text-muted-foreground font-bold">ID</th>
                  <th className="text-left p-2 text-muted-foreground font-bold">Input</th>
                  {step >= 1 && <th className="text-left p-2 text-muted-foreground font-bold">Output</th>}
                  {step >= 2 && <th className="text-left p-2 text-muted-foreground font-bold">BLEU</th>}
                  {step >= 2 && <th className="text-left p-2 text-muted-foreground font-bold">ROUGE</th>}
                  {step >= 3 && <th className="text-left p-2 text-muted-foreground font-bold">Result</th>}
                </tr>
              </thead>
              <tbody>
                {TEST_CASES.map((tc, i) => (
                  <tr
                    key={tc.id}
                    onClick={() => setSelectedCase(i)}
                    className={`border-b border-border/30 cursor-pointer transition-colors duration-200 ${selectedCase === i ? 'bg-emerald-500/5' : 'hover:bg-muted/20'}`}
                  >
                    <td className="p-2 font-mono text-emerald-400">{tc.id}</td>
                    <td className="p-2 text-foreground/60 max-w-[120px] truncate">{tc.input}</td>
                    {step >= 1 && <td className="p-2 text-foreground/50 max-w-[120px] truncate font-mono">{tc.output}</td>}
                    {step >= 2 && (
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${tc.bleu * 100}%`, backgroundColor: tc.bleu >= PASS_THRESHOLD.bleu ? '#34d399' : '#f87171' }} />
                          </div>
                          <span className="font-mono" style={{ color: tc.bleu >= PASS_THRESHOLD.bleu ? '#34d399' : '#f87171' }}>{tc.bleu.toFixed(2)}</span>
                        </div>
                      </td>
                    )}
                    {step >= 2 && (
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${tc.rouge * 100}%`, backgroundColor: tc.rouge >= PASS_THRESHOLD.rouge ? '#34d399' : '#f87171' }} />
                          </div>
                          <span className="font-mono" style={{ color: tc.rouge >= PASS_THRESHOLD.rouge ? '#34d399' : '#f87171' }}>{tc.rouge.toFixed(2)}</span>
                        </div>
                      </td>
                    )}
                    {step >= 3 && (
                      <td className="p-2">
                        <span className={`px-1.5 py-0.5 rounded text-base font-bold ${tc.pass ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {tc.pass ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Selected case detail */}
          <div className="bg-muted/30 border border-border rounded-lg p-3 space-y-1.5">
            <div className="text-sm uppercase font-bold text-muted-foreground">{TEST_CASES[selectedCase].id} Detail</div>
            <div className="text-xs"><span className="text-muted-foreground">Expected:</span> <span className="text-foreground/70 font-mono">{TEST_CASES[selectedCase].expected}</span></div>
            {step >= 1 && <div className="text-xs"><span className="text-muted-foreground">Got:</span> <span className="text-foreground/70 font-mono">{TEST_CASES[selectedCase].output}</span></div>}
          </div>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div className="flex gap-2">
            <button onClick={handleNext} disabled={step >= stages.length - 1} className="text-xs px-4 py-2 rounded-lg border bg-emerald-500/20 border-emerald-500/40 text-emerald-300 transition hover:bg-emerald-500/30 disabled:opacity-30">
              Next Stage
            </button>
            <button onClick={handleReset} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition">Reset</button>
          </div>

          {step >= 3 && (
            <div className="bg-muted border border-border p-3 rounded-xl space-y-2">
              <div className="text-xs uppercase font-bold text-muted-foreground">Summary</div>
              <div className="text-2xl font-mono font-bold" style={{ color: parseInt(passRate) >= 75 ? '#34d399' : '#fbbf24' }}>
                {passRate}% pass
              </div>
              <div className="text-xs text-muted-foreground">{passCount}/{TEST_CASES.length} test cases passed</div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${passRate}%`, backgroundColor: parseInt(passRate) >= 75 ? '#34d399' : '#fbbf24' }} />
              </div>
            </div>
          )}

          <div className="bg-muted border border-border p-3 rounded-xl space-y-1">
            <div className="text-xs uppercase font-bold text-muted-foreground">Thresholds</div>
            <div className="text-xs font-mono space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">BLEU min</span><span className="text-amber-400">{PASS_THRESHOLD.bleu}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">ROUGE min</span><span className="text-amber-400">{PASS_THRESHOLD.rouge}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Pass rule</span><span className="text-foreground/60">Both above min</span></div>
            </div>
          </div>

          <div className="mt-auto bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg">
            <p className="text-xs text-emerald-300 leading-relaxed italic">
              Eval pipelines automate quality measurement. BLEU measures n-gram precision against references. ROUGE measures recall of reference n-grams. Both must pass thresholds for a test case to succeed.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
