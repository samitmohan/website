'use client'

import { useState } from 'react'

interface Stage {
  id: string
  label: string
  icon: string
  color: string
  description: string
  detail: string
}

const STAGES: Stage[] = [
  { id: 'doc', label: 'Documents', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: '#818cf8', description: 'Raw source documents', detail: 'PDFs, web pages, databases, APIs - any text source. Documents can be structured or unstructured.' },
  { id: 'chunk', label: 'Chunk', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', color: '#a78bfa', description: 'Split into smaller pieces', detail: 'Fixed-size chunks (512 tokens), sentence splitting, or recursive character splitting. Overlap prevents context loss at boundaries.' },
  { id: 'embed', label: 'Embed', icon: 'M7 12l3-3 3 3 4-4', color: '#f472b6', description: 'Convert to vector representations', detail: 'Embedding model (e.g., text-embedding-3-small) maps each chunk to a dense vector. Semantically similar text maps to nearby points.' },
  { id: 'store', label: 'Vector DB', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4', color: '#fbbf24', description: 'Index in vector database', detail: 'Pinecone, Weaviate, Chroma, pgvector - stores vectors with metadata for fast approximate nearest neighbor (ANN) search.' },
  { id: 'query', label: 'Query', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', color: '#38bdf8', description: 'User question arrives', detail: 'User query is embedded using the same model. The query vector represents the information need in the same space as document chunks.' },
  { id: 'retrieve', label: 'Retrieve', icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z', color: '#34d399', description: 'Find top-K similar chunks', detail: 'Cosine similarity or dot product between query vector and stored vectors. Return top-K (usually 3-10) most relevant chunks.' },
  { id: 'augment', label: 'Augment Prompt', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', color: '#fb923c', description: 'Combine context with query', detail: '"Answer based on the following context: [chunk1] [chunk2] [chunk3]. Question: {user query}". System prompt controls behavior.' },
  { id: 'generate', label: 'Generate', icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: '#ec4899', description: 'LLM produces grounded answer', detail: 'LLM generates answer conditioned on retrieved context. Grounding reduces hallucination since the model can cite specific passages.' },
]

export default function RAGConceptsViz() {
  const [step, setStep] = useState(0)

  const handleNext = () => setStep(s => Math.min(s + 1, STAGES.length - 1))
  const handlePrev = () => setStep(s => Math.max(s - 1, 0))
  const handleReset = () => setStep(0)

  const current = STAGES[step]

  // Split into indexing (0-3) and querying (4-7) phases
  const isIndexPhase = step <= 3
  const phaseLabel = isIndexPhase ? 'Indexing Phase (offline)' : 'Query Phase (runtime)'

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-rose-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-rose-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold">RAG Pipeline Concepts</h3>
          <p className="text-xs text-muted-foreground">From raw documents to grounded generation - step through each stage</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 space-y-4">
          {/* Phase label */}
          <div className="flex items-center gap-2">
            <div
              className="text-sm font-mono px-2 py-0.5 rounded border transition-all duration-300"
              style={{
                borderColor: isIndexPhase ? 'rgba(129,140,248,0.3)' : 'rgba(56,189,248,0.3)',
                color: isIndexPhase ? '#818cf8' : '#38bdf8',
                backgroundColor: isIndexPhase ? 'rgba(129,140,248,0.08)' : 'rgba(56,189,248,0.08)',
              }}
            >
              {phaseLabel}
            </div>
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">{step + 1}/{STAGES.length}</span>
          </div>

          {/* Stage pipeline */}
          <div className="flex items-center gap-1 flex-wrap">
            {STAGES.map((stage, i) => (
              <div key={stage.id} className="flex items-center gap-1">
                <div
                  onClick={() => setStep(i)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border cursor-pointer transition-all duration-300"
                  style={{
                    borderColor: i <= step ? `${stage.color}44` : 'rgba(255,255,255,0.06)',
                    backgroundColor: i === step ? `${stage.color}12` : 'transparent',
                    opacity: i <= step ? 1 : 0.4,
                  }}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke={i <= step ? stage.color : 'rgba(255,255,255,0.3)'} strokeWidth="2">
                    <path d={stage.icon} />
                  </svg>
                  <span className="text-base font-bold" style={{ color: i <= step ? stage.color : 'rgba(255,255,255,0.3)' }}>
                    {stage.label}
                  </span>
                </div>
                {i < STAGES.length - 1 && (
                  <svg className="w-3 h-3 shrink-0" viewBox="0 0 12 12"><path d="M3 6h6m0 0l-2-2m2 2l-2 2" stroke={i < step ? stage.color : 'rgba(255,255,255,0.1)'} strokeWidth="1.5" fill="none" /></svg>
                )}
              </div>
            ))}
          </div>

          {/* Current stage detail */}
          <div
            className="border rounded-lg p-4 transition-all duration-300"
            style={{ borderColor: `${current.color}33`, backgroundColor: `${current.color}06` }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${current.color}15` }}>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={current.color} strokeWidth="2">
                  <path d={current.icon} />
                </svg>
              </div>
              <div>
                <div className="text-base font-bold" style={{ color: current.color }}>{current.label}</div>
                <div className="text-xs text-foreground/60">{current.description}</div>
              </div>
            </div>
            <div className="text-sm text-foreground/70 leading-relaxed bg-muted/30 rounded-lg p-3 border border-border">
              {current.detail}
            </div>
          </div>

          {/* Data flow visualization */}
          <div className="bg-muted/30 border border-border rounded-lg p-3">
            <div className="text-sm uppercase font-bold text-muted-foreground mb-2">Data at This Stage</div>
            <div className="text-xs font-mono text-foreground/60">
              {step === 0 && '"The transformer architecture was introduced in 2017 by Vaswani et al. in the paper Attention Is All You Need..."'}
              {step === 1 && '["The transformer architecture was introduced in 2017...", "Attention Is All You Need proposed the self-attention...", "Multi-head attention allows the model to..."]'}
              {step === 2 && '[[0.023, -0.156, 0.891, ...768d], [0.142, -0.067, 0.445, ...768d], ...]'}
              {step === 3 && '{index: "docs", vectors: 3, metric: "cosine", dims: 768}'}
              {step === 4 && 'query: "How does self-attention work?" -> [0.089, -0.234, 0.567, ...768d]'}
              {step === 5 && 'top_3: [{chunk: "Attention Is All You Need...", score: 0.92}, {chunk: "Multi-head attention...", score: 0.87}, ...]'}
              {step === 6 && '"Context: [chunk1][chunk2][chunk3]\\nQuestion: How does self-attention work?\\nAnswer based on the context above."'}
              {step === 7 && '"Self-attention computes weighted sums of value vectors using query-key similarity scores [1][2]."'}
            </div>
          </div>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div className="flex gap-2">
            <button onClick={handlePrev} disabled={step === 0} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition disabled:opacity-30">Prev</button>
            <button onClick={handleNext} disabled={step >= STAGES.length - 1} className="text-xs px-4 py-2 rounded-lg border bg-rose-500/20 border-rose-500/40 text-rose-300 transition hover:bg-rose-500/30 disabled:opacity-30">
              Next
            </button>
            <button onClick={handleReset} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition">Reset</button>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-1">
            <div className="text-xs uppercase font-bold text-muted-foreground">Current Stage</div>
            <div className="text-sm font-mono" style={{ color: current.color }}>{current.label}</div>
            <div className="text-xs text-muted-foreground">{current.description}</div>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-1">
            <div className="text-xs uppercase font-bold text-muted-foreground">Key Numbers</div>
            <div className="text-xs font-mono space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Chunk size</span><span>512 tokens</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Overlap</span><span>50 tokens</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Embed dim</span><span>768</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Top-K</span><span>3</span></div>
            </div>
          </div>

          <div className="mt-auto bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg">
            <p className="text-xs text-rose-300 leading-relaxed italic">
              RAG separates knowledge storage (vector DB) from reasoning (LLM). This lets you update knowledge without retraining, cite sources, and control what the model can access.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
