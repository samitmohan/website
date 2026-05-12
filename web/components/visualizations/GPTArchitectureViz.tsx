'use client'

import { useState } from 'react'

interface Block {
  id: string
  label: string
  color: string
  isRepeated?: boolean
  description: string
  details: string
}

const BLOCKS: Block[] = [
  { id: 'input', label: 'Input Tokens', color: '#818cf8', description: 'Raw text converted to integer token IDs via tokenizer vocabulary', details: 'Vocabulary size ~50K-100K. Each token maps to a unique integer. Special tokens: [BOS], [EOS], [PAD].' },
  { id: 'tok_embed', label: 'Token Embedding', color: '#a78bfa', description: 'Token IDs mapped to dense vectors via learned embedding matrix', details: 'Shape: [vocab_size x d_model]. Each token gets a d_model-dimensional vector (768, 1024, etc). Learned during training.' },
  { id: 'pos_enc', label: 'Positional Encoding', color: '#c084fc', description: 'Position information added to embeddings since attention has no inherent order', details: 'GPT uses learned positional embeddings (not sinusoidal). Shape: [max_seq_len x d_model]. Added element-wise to token embeddings.' },
  { id: 'mask_attn', label: 'Masked Self-Attention', color: '#f472b6', isRepeated: true, description: 'Each token attends to all previous tokens (causal mask prevents seeing future)', details: 'Q, K, V projections from input. Attention = softmax(QK^T/sqrt(d_k)) * V. Causal mask sets future positions to -inf before softmax.' },
  { id: 'add_norm1', label: 'Add & LayerNorm', color: '#fb923c', isRepeated: true, description: 'Residual connection + layer normalization for training stability', details: 'output = LayerNorm(x + Attention(x)). Residual connections prevent vanishing gradients. LayerNorm normalizes across the feature dimension.' },
  { id: 'ffn', label: 'Feed-Forward Network', color: '#fbbf24', isRepeated: true, description: 'Two linear layers with GELU activation - processes each position independently', details: 'FFN(x) = GELU(xW1 + b1)W2 + b2. Inner dimension = 4 * d_model. This is where the model stores factual knowledge.' },
  { id: 'add_norm2', label: 'Add & LayerNorm', color: '#fb923c', isRepeated: true, description: 'Second residual connection + normalization after FFN', details: 'output = LayerNorm(x + FFN(x)). Same structure as first Add&Norm. Together they form one transformer block.' },
  { id: 'linear', label: 'Linear Projection', color: '#34d399', description: 'Project final hidden state to vocabulary-sized logits', details: 'Shape: [d_model x vocab_size]. Often weight-tied with token embedding matrix. Output: raw scores for each vocabulary token.' },
  { id: 'softmax', label: 'Softmax', color: '#2dd4bf', description: 'Convert logits to probability distribution over vocabulary', details: 'P(token_i) = exp(logit_i) / sum(exp(logits)). Temperature controls sharpness. Top-p/top-k sampling applied here.' },
]

export default function GPTArchitectureViz() {
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null)

  const repeatedStart = BLOCKS.findIndex(b => b.isRepeated)
  const repeatedEnd = BLOCKS.filter(b => b.isRepeated).length + repeatedStart

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-green-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-green-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold">GPT Architecture</h3>
          <p className="text-xs text-muted-foreground">Decoder-only transformer stack - click any block to expand</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 space-y-1.5">
          {/* Vertical block stack */}
          {BLOCKS.map((block, i) => {
            const isExpanded = expandedBlock === block.id
            const isInRepeated = block.isRepeated

            return (
              <div key={block.id}>
                {/* N x bracket start */}
                {i === repeatedStart && (
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-sm font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      N x Transformer Block
                    </div>
                    <div className="flex-1 h-px bg-amber-500/20" />
                  </div>
                )}

                <div
                  onClick={() => setExpandedBlock(isExpanded ? null : block.id)}
                  className="cursor-pointer transition-all duration-300 rounded-lg border overflow-hidden"
                  style={{
                    borderColor: isExpanded ? `${block.color}55` : 'rgba(255,255,255,0.06)',
                    backgroundColor: isExpanded ? `${block.color}0a` : 'transparent',
                    marginLeft: isInRepeated ? '16px' : '0',
                    borderLeft: isInRepeated ? `3px solid ${block.color}33` : undefined,
                  }}
                >
                  <div className="flex items-center gap-3 px-3 py-2">
                    {/* Color dot */}
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: block.color }} />
                    {/* Label */}
                    <span className="text-base font-bold flex-1" style={{ color: block.color }}>{block.label}</span>
                    {/* Arrow */}
                    <svg className="w-3 h-3 shrink-0 transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }} viewBox="0 0 12 12" fill="none" stroke={block.color} strokeWidth="2">
                      <path d="M2 4l4 4 4-4" />
                    </svg>
                  </div>

                  {/* Description always visible */}
                  <div className="px-3 pb-2 text-xs text-foreground/50">{block.description}</div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="px-3 pb-3 transition-all duration-300">
                      <div className="bg-muted/50 border border-border rounded-lg p-2.5 text-xs text-foreground/70 leading-relaxed">
                        {block.details}
                      </div>
                    </div>
                  )}
                </div>

                {/* Arrow between blocks */}
                {i < BLOCKS.length - 1 && (
                  <div className="flex justify-center py-0.5" style={{ marginLeft: isInRepeated && BLOCKS[i + 1]?.isRepeated ? '16px' : '0' }}>
                    <svg className="w-3 h-4" viewBox="0 0 12 16"><path d="M6 2v10m0 0l-3-3m3 3l3-3" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" /></svg>
                  </div>
                )}

                {/* N x bracket end */}
                {i === repeatedEnd - 1 && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-px bg-amber-500/20" />
                    <div className="text-sm font-mono text-amber-400/60">
                      repeated N times (12, 24, 96...)
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div className="bg-muted border border-border p-3 rounded-xl space-y-2">
            <div className="text-xs uppercase font-bold text-muted-foreground">Model Sizes</div>
            <div className="text-xs font-mono space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">GPT-2</span><span>12 layers, 117M</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">GPT-3</span><span>96 layers, 175B</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">LLaMA-2 7B</span><span>32 layers, 7B</span></div>
            </div>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-1">
            <div className="text-xs uppercase font-bold text-muted-foreground">Legend</div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-violet-400/50" />
              <span className="text-muted-foreground">Embedding layers</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-pink-400/50" />
              <span className="text-muted-foreground">Attention + FFN (repeated N times)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-emerald-400/50" />
              <span className="text-muted-foreground">Output projection</span>
            </div>
          </div>

          <div className="mt-auto bg-green-500/5 border border-green-500/10 p-3 rounded-lg">
            <p className="text-xs text-green-300 leading-relaxed italic">
              GPT is a decoder-only transformer: no encoder, no cross-attention. The causal mask is the key difference from BERT. Each layer refines token representations through attention and feed-forward processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
