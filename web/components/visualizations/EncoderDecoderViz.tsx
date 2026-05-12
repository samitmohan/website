'use client'

import { useState } from 'react'

const ENCODER_LAYERS = ['Self-Attention', 'Add & Norm', 'Feed-Forward', 'Add & Norm']
const DECODER_LAYERS = ['Masked Self-Attn', 'Add & Norm', 'Cross-Attention', 'Add & Norm', 'Feed-Forward', 'Add & Norm']
const INPUT_TOKENS = ['Le', 'chat', 'est', 'noir']
const OUTPUT_TOKENS = ['<s>', 'The', 'cat', 'is']

export default function EncoderDecoderViz() {
  const [step, setStep] = useState(0)
  const maxSteps = ENCODER_LAYERS.length + DECODER_LAYERS.length + 2

  const encActive = step >= 1 ? Math.min(step - 1, ENCODER_LAYERS.length - 1) : -1
  const encDone = step > ENCODER_LAYERS.length
  const decStart = ENCODER_LAYERS.length + 1
  const decActive = step >= decStart ? Math.min(step - decStart, DECODER_LAYERS.length - 1) : -1
  const decDone = step >= maxSteps

  const crossAttnActive = decActive === 2

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-amber-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-amber-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="8" height="18" rx="1" /><rect x="14" y="3" width="8" height="18" rx="1" /><path d="M10 9h4M10 15h4" /></svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Encoder-Decoder Architecture</h3>
          <p className="text-xs text-muted-foreground">Step through data flow in a Transformer</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Step control */}
        <div className="flex items-center gap-3">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="px-3 py-1 text-xs font-mono bg-muted border border-border rounded disabled:opacity-30 hover:border-amber-500/40 transition-colors">
            Prev
          </button>
          <div className="flex-1 text-center text-xs text-muted-foreground font-mono">
            Step {step} / {maxSteps}
          </div>
          <button onClick={() => setStep(Math.min(maxSteps, step + 1))} disabled={step === maxSteps} className="px-3 py-1 text-xs font-mono bg-muted border border-border rounded disabled:opacity-30 hover:border-amber-500/40 transition-colors">
            Next
          </button>
          <button onClick={() => setStep(0)} className="px-3 py-1 text-xs font-mono bg-muted border border-border rounded hover:border-amber-500/40 transition-colors">
            Reset
          </button>
        </div>

        {/* Architecture diagram */}
        <svg viewBox="0 0 460 340" className="w-full">
          {/* Input tokens */}
          {INPUT_TOKENS.map((t, i) => (
            <g key={`in-${i}`}>
              <rect x={30 + i * 45} y={300} width={40} height={22} rx={4} className={step >= 1 ? 'fill-blue-500/30 stroke-blue-500/50' : 'fill-muted stroke-border'} strokeWidth="1" />
              <text x={50 + i * 45} y={315} textAnchor="middle" className="fill-blue-200 text-sm font-mono">{t}</text>
            </g>
          ))}
          <text x={100} y={338} textAnchor="middle" className="fill-muted-foreground text-[8px]">Input (French)</text>

          {/* Encoder arrow up */}
          {step >= 1 && <line x1={100} y1={298} x2={100} y2={280} stroke="#60a5fa" strokeWidth="1.5" markerEnd="url(#arrow)" />}

          {/* Encoder stack */}
          <rect x={20} y={80} width={160} height={198} rx={6} className="fill-blue-500/5 stroke-blue-500/20" strokeWidth="1" strokeDasharray="4 2" />
          <text x={100} y={96} textAnchor="middle" className="fill-blue-300 text-base font-bold">ENCODER</text>
          {ENCODER_LAYERS.map((name, i) => {
            const isActive = encActive === i
            const isDone = encActive > i || encDone
            return (
              <g key={`enc-${i}`}>
                <rect x={35} y={105 + i * 40} width={130} height={30} rx={4} className={isActive ? 'fill-blue-500/40 stroke-blue-400' : isDone ? 'fill-blue-500/15 stroke-blue-500/30' : 'fill-muted/50 stroke-border'} strokeWidth={isActive ? 1.5 : 1} />
                <text x={100} y={124 + i * 40} textAnchor="middle" className={`text-sm font-mono ${isActive ? 'fill-blue-200 font-bold' : isDone ? 'fill-blue-300/70' : 'fill-muted-foreground'}`}>{name}</text>
              </g>
            )
          })}

          {/* Output tokens */}
          {OUTPUT_TOKENS.map((t, i) => (
            <g key={`out-${i}`}>
              <rect x={270 + i * 45} y={300} width={40} height={22} rx={4} className={step >= decStart ? 'fill-emerald-500/30 stroke-emerald-500/50' : 'fill-muted stroke-border'} strokeWidth="1" />
              <text x={290 + i * 45} y={315} textAnchor="middle" className="fill-emerald-200 text-sm font-mono">{t}</text>
            </g>
          ))}
          <text x={340} y={338} textAnchor="middle" className="fill-muted-foreground text-[8px]">Output (English)</text>

          {/* Decoder arrow up */}
          {step >= decStart && <line x1={340} y1={298} x2={340} y2={280} stroke="#34d399" strokeWidth="1.5" markerEnd="url(#arrowG)" />}

          {/* Decoder stack */}
          <rect x={260} y={50} width={180} height={228} rx={6} className="fill-emerald-500/5 stroke-emerald-500/20" strokeWidth="1" strokeDasharray="4 2" />
          <text x={350} y={66} textAnchor="middle" className="fill-emerald-300 text-base font-bold">DECODER</text>
          {DECODER_LAYERS.map((name, i) => {
            const isActive = decActive === i
            const isDone = decActive > i || decDone
            const isCross = i === 2
            return (
              <g key={`dec-${i}`}>
                <rect x={275} y={75 + i * 32} width={150} height={24} rx={4} className={isActive ? (isCross ? 'fill-amber-500/40 stroke-amber-400' : 'fill-emerald-500/40 stroke-emerald-400') : isDone ? 'fill-emerald-500/15 stroke-emerald-500/30' : 'fill-muted/50 stroke-border'} strokeWidth={isActive ? 1.5 : 1} />
                <text x={350} y={91 + i * 32} textAnchor="middle" className={`text-[8px] font-mono ${isActive ? (isCross ? 'fill-amber-200' : 'fill-emerald-200') + ' font-bold' : isDone ? 'fill-emerald-300/70' : 'fill-muted-foreground'}`}>{name}</text>
              </g>
            )
          })}

          {/* Cross-attention arrows */}
          {crossAttnActive && (
            <>
              <path d="M165 200 C 210 200 230 145 275 145" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
              <circle cx={275} cy={145} r={3} fill="#f59e0b" />
              <text x={220} y={160} textAnchor="middle" className="fill-amber-300 text-[7px] font-bold">K,V from encoder</text>
            </>
          )}

          {/* Output arrow */}
          {decDone && (
            <>
              <line x1={350} y1={45} x2={350} y2={25} stroke="#34d399" strokeWidth="1.5" markerEnd="url(#arrowG)" />
              <text x={350} y={18} textAnchor="middle" className="fill-emerald-300 text-base font-bold">black</text>
            </>
          )}

          <defs>
            <marker id="arrow" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#60a5fa" /></marker>
            <marker id="arrowG" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#34d399" /></marker>
          </defs>
        </svg>

        {/* Status */}
        <div className={`p-3 rounded-lg border text-xs leading-relaxed ${step === 0 ? 'bg-muted/30 border-border text-muted-foreground' : crossAttnActive ? 'bg-amber-500/5 border-amber-500/10 text-amber-300' : step <= ENCODER_LAYERS.length ? 'bg-blue-500/5 border-blue-500/10 text-blue-300' : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-300'}`}>
          <span className="font-bold">
            {step === 0 && 'Press Next to begin data flow.'}
            {step >= 1 && step <= ENCODER_LAYERS.length && `Encoder: processing ${ENCODER_LAYERS[encActive]}. Each encoder layer refines the input representation.`}
            {step === ENCODER_LAYERS.length + 1 && 'Encoder output complete. Decoder begins with previously generated tokens.'}
            {step > decStart && !decDone && `Decoder: ${DECODER_LAYERS[decActive]}. ${crossAttnActive ? 'Cross-attention reads keys and values from the encoder output.' : ''}`}
            {decDone && 'Forward pass complete. The decoder predicts the next token: "black".'}
          </span>
        </div>
      </div>
    </div>
  )
}
