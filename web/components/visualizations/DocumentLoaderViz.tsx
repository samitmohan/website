'use client'

import { useState } from 'react'

type Stage = 'source' | 'parser' | 'chunker' | 'embedder' | 'store'
type ChunkSize = 'small' | 'medium' | 'large'

interface PipelineStage {
  key: Stage
  label: string
  icon: string
  color: string
  detail: string[]
}

const STAGES: PipelineStage[] = [
  {
    key: 'source',
    label: 'Raw Document',
    icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z',
    color: '#f43f5e',
    detail: [
      'Input formats: PDF, HTML, Markdown, DOCX, CSV',
      'Each format needs a specialized parser',
      'Raw bytes -> structured text extraction',
    ],
  },
  {
    key: 'parser',
    label: 'Parser',
    icon: 'M4 6h16M4 12h16M4 18h7',
    color: '#f59e0b',
    detail: [
      'Extracts clean text from raw format',
      'Strips HTML tags, parses PDF layout',
      'Preserves section structure when possible',
      'Extracts metadata: title, author, date, source URL',
    ],
  },
  {
    key: 'chunker',
    label: 'Chunker',
    icon: 'M9 4h6v6H9zM9 14h6v6H9zM3 9h6v6H3z',
    color: '#34d399',
    detail: [
      'Splits text into retrieval-sized pieces',
      'Strategies: fixed-size, sentence-based, recursive',
      'Overlap between chunks preserves context at boundaries',
      'Chunk size is the most impactful hyperparameter',
    ],
  },
  {
    key: 'embedder',
    label: 'Embedder',
    icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    color: '#6366f1',
    detail: [
      'Converts each chunk to a dense vector (768-1536 dims)',
      'Models: all-MiniLM, BGE, E5, OpenAI ada-002',
      'Batch processing for efficiency',
      'Same model must embed queries at search time',
    ],
  },
  {
    key: 'store',
    label: 'Vector Store',
    icon: 'M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z',
    color: '#8b5cf6',
    detail: [
      'Stores vectors with associated metadata',
      'Indexes for approximate nearest neighbor search',
      'Options: Pinecone, Weaviate, Chroma, pgvector',
      'Metadata enables filtered search (by date, source, etc)',
    ],
  },
]

const CHUNK_EXAMPLES: Record<ChunkSize, { chunks: string[]; note: string }> = {
  small: {
    chunks: [
      'Dropout randomly sets neuron',
      'outputs to zero during training.',
      'This prevents co-adaptation',
      'of features. The dropout rate',
      'is typically set to 0.5 for',
      'hidden layers. At inference,',
      'all neurons are active but',
      'outputs are scaled by (1-p).',
    ],
    note: 'Too small (50 tokens): each chunk lacks context. "This prevents co-adaptation" - co-adaptation of what? The retriever cannot tell.',
  },
  medium: {
    chunks: [
      'Dropout randomly sets neuron outputs to zero during training. This prevents co-adaptation of features, forcing each neuron to learn useful representations independently.',
      'The dropout rate is typically set to 0.5 for hidden layers and 0.2 for input layers. At inference, all neurons are active but outputs are scaled by (1-p) to match expected values.',
    ],
    note: 'Good size (200 tokens): each chunk is self-contained with enough context for the retriever to match relevant queries.',
  },
  large: {
    chunks: [
      'Dropout randomly sets neuron outputs to zero during training. This prevents co-adaptation of features, forcing each neuron to learn useful representations independently. The dropout rate is typically set to 0.5 for hidden layers and 0.2 for input layers. At inference, all neurons are active but outputs are scaled by (1-p) to match expected values.',
    ],
    note: 'Too large (500+ tokens): the chunk covers multiple topics. A query about "dropout rate" also retrieves text about inference scaling, diluting relevance.',
  },
}

const METADATA_FIELDS = [
  { key: 'title', value: 'Dropout: A Simple Way to Prevent Overfitting' },
  { key: 'source', value: 'arxiv.org/abs/1207.0580' },
  { key: 'date', value: '2014-01-10' },
  { key: 'section', value: 'Section 3: Model Description' },
  { key: 'chunk_id', value: '3_002' },
  { key: 'token_count', value: '187' },
]

export default function DocumentLoaderViz() {
  const [activeStage, setActiveStage] = useState<Stage>('source')
  const [chunkSize, setChunkSize] = useState<ChunkSize>('medium')
  const [showMetadata, setShowMetadata] = useState(false)

  const chunkData = CHUNK_EXAMPLES[chunkSize]

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-emerald-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-emerald-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Document Loading Pipeline</h3>
          <p className="text-xs text-muted-foreground">From raw document to searchable vector store</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Pipeline visualization */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {STAGES.map((stage, i) => (
            <div key={stage.key} className="flex items-center">
              <button
                onClick={() => setActiveStage(stage.key)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all min-w-[80px] ${
                  activeStage === stage.key
                    ? 'border-opacity-50 bg-opacity-10 scale-105'
                    : 'border-border hover:bg-accent opacity-60'
                }`}
                style={activeStage === stage.key ? {
                  borderColor: stage.color + '80',
                  backgroundColor: stage.color + '15',
                } : {}}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={activeStage === stage.key ? stage.color : 'currentColor'} strokeWidth="1.5">
                  <path d={stage.icon} />
                </svg>
                <span className="text-base font-bold" style={activeStage === stage.key ? { color: stage.color } : {}}>{stage.label}</span>
              </button>
              {i < STAGES.length - 1 && (
                <svg className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Stage details */}
        <div className="bg-muted/30 border border-border rounded-xl p-3">
          <div className="text-xs uppercase font-bold mb-2" style={{ color: STAGES.find((s) => s.key === activeStage)?.color }}>
            {STAGES.find((s) => s.key === activeStage)?.label} Details
          </div>
          <ul className="space-y-1">
            {STAGES.find((s) => s.key === activeStage)?.detail.map((d, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-muted-foreground/50 mt-0.5">-</span>
                {d}
              </li>
            ))}
          </ul>
        </div>

        {/* Chunk size comparison */}
        {activeStage === 'chunker' && (
          <div className="space-y-2">
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as ChunkSize[]).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setChunkSize(sz)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex-1 ${
                    chunkSize === sz
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                      : 'border-border text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {sz === 'small' ? '50 tokens' : sz === 'medium' ? '200 tokens' : '500+ tokens'}
                </button>
              ))}
            </div>
            <div className="bg-muted/20 border border-border rounded-xl p-3 space-y-1">
              {chunkData.chunks.map((chunk, i) => (
                <div key={i} className="text-xs font-mono bg-muted/40 px-2 py-1 rounded border border-border/50">
                  <span className="text-emerald-400/50 mr-1">[{i}]</span> {chunk}
                </div>
              ))}
            </div>
            <p className={`text-xs leading-relaxed px-1 ${
              chunkSize === 'medium' ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {chunkData.note}
            </p>
          </div>
        )}

        {/* Metadata panel */}
        <button
          onClick={() => setShowMetadata(!showMetadata)}
          className="text-xs text-purple-400 hover:text-purple-300 transition flex items-center gap-1"
        >
          <svg className={`w-3 h-3 transition-transform ${showMetadata ? 'rotate-90' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          {showMetadata ? 'Hide' : 'Show'} metadata example
        </button>

        {showMetadata && (
          <div className="bg-muted/20 border border-purple-500/20 rounded-xl p-3">
            <div className="text-xs uppercase font-bold text-purple-400 mb-2">Stored Metadata per Chunk</div>
            <div className="space-y-1">
              {METADATA_FIELDS.map((f) => (
                <div key={f.key} className="flex text-xs font-mono">
                  <span className="text-purple-400 w-20">{f.key}:</span>
                  <span className="text-muted-foreground">{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg">
          <p className="text-xs text-emerald-300 leading-relaxed">
            {activeStage === 'source' && 'The pipeline starts with raw documents in various formats. Each format parser handles the specific encoding and layout rules.'}
            {activeStage === 'parser' && 'Parsing extracts clean text and metadata. Good metadata extraction enables filtered retrieval - search only papers from 2024, or only a specific section.'}
            {activeStage === 'chunker' && 'Chunk size controls the precision-context tradeoff. 200-500 tokens with 10-20% overlap works well for most use cases.'}
            {activeStage === 'embedder' && 'The embedding model must match at index and query time. Switching models requires re-embedding the entire corpus.'}
            {activeStage === 'store' && 'Vector stores combine ANN indexes (HNSW, IVF) with metadata storage. The index trades exact recall for 100x speed.'}
          </p>
        </div>
      </div>
    </div>
  )
}
