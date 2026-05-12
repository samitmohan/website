'use client'

import { useState } from 'react'

const stages = [
  { id: 'ingest', label: 'Ingestion', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    config: 'Sources: PDF, DOCX, HTML\nBatch size: 50\nMax file size: 25MB',
    output: '142 documents ingested\n3 failures (corrupt PDF)' },
  { id: 'parse', label: 'Parsing', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    config: 'Parser: Unstructured\nOCR: Tesseract fallback\nLanguage: en',
    output: '139 parsed successfully\nAvg tokens: 4,200/doc' },
  { id: 'chunk', label: 'Chunking', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16',
    config: 'Strategy: recursive\nChunk size: 512 tokens\nOverlap: 64 tokens',
    output: '2,847 chunks created\nAvg chunk: 480 tokens' },
  { id: 'classify', label: 'Classification', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z',
    config: 'Model: distilbert-classifier\nCategories: 8\nThreshold: 0.7',
    output: 'Technical: 45%, Legal: 22%\nFinance: 18%, Other: 15%' },
  { id: 'extract', label: 'Extraction', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    config: 'Fields: entities, dates, amounts\nModel: GPT-4 structured output\nSchema: v2.1',
    output: '8,432 entities extracted\n1,204 dates, 892 amounts' },
  { id: 'output', label: 'Output', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
    config: 'Format: JSON + embeddings\nVector DB: Pinecone\nIndex: prod-docs-v3',
    output: '2,847 vectors upserted\nLatency: 1.2s avg' },
]

export default function DocumentPipelineViz() {
  const [selected, setSelected] = useState<string | null>(null)
  const [processing, setProcessing] = useState<Set<string>>(new Set())

  const toggleProcessing = (id: string) => {
    setProcessing((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const active = stages.find((s) => s.id === selected)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-1 text-sm font-semibold text-gray-200">Document Processing Pipeline</h3>
      <p className="mb-4 text-xs text-gray-500">Click any stage to inspect its configuration and output.</p>

      <div className="flex items-center gap-1 overflow-x-auto pb-3">
        {stages.map((stage, i) => (
          <div key={stage.id} className="flex items-center">
            <button
              onClick={() => setSelected(selected === stage.id ? null : stage.id)}
              className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-2.5 transition ${
                selected === stage.id
                  ? 'border-[#7F56D9] bg-[#7F56D9]/10 text-[#9E77ED]'
                  : 'border-border text-gray-400 hover:border-white/20 hover:text-gray-300'
              }`}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={stage.icon} />
              </svg>
              <span className="text-xs font-medium whitespace-nowrap">{stage.label}</span>
              <span
                onClick={(e) => { e.stopPropagation(); toggleProcessing(stage.id) }}
                className={`h-1.5 w-1.5 rounded-full ${
                  processing.has(stage.id) ? 'bg-yellow-400 animate-pulse' : 'bg-emerald-400'
                }`}
              />
            </button>
            {i < stages.length - 1 && (
              <svg width="20" height="12" className="mx-0.5 shrink-0 text-gray-600">
                <path d="M2 6 L16 6 M13 3 L16 6 L13 9" stroke="currentColor" fill="none" strokeWidth="1.5" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {active && (
        <div className="mt-2 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-white/5 p-3">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#9E77ED]">Config</span>
            <pre className="whitespace-pre-wrap text-xs text-gray-400">{active.config}</pre>
          </div>
          <div className="rounded-lg border border-border bg-white/5 p-3">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#9E77ED]">Output</span>
            <pre className="whitespace-pre-wrap text-xs text-gray-400">{active.output}</pre>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Ready</span>
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-yellow-400" /> Processing</span>
        <span className="ml-auto font-mono text-gray-600">Click status dot to toggle</span>
      </div>
    </div>
  )
}
