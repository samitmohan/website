'use client';
import React, { useState } from 'react';

export default function VisionTransformerViz() {
  const [expandedBlock, setExpandedBlock] = useState<number | null>(null);
  const numBlocks = 4;
  const numPatches = 9;
  const numHeads = 3;

  const Stage = ({ title, children, accent }: { title: string; children: React.ReactNode; accent?: boolean }) => (
    <div className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-2 ${accent ? 'border-[#7F56D9]/40 bg-[#7F56D9]/10' : 'border-border bg-white/5'}`}>
      <span className={`text-xs font-semibold ${accent ? 'text-[#9E77ED]' : 'text-gray-400'}`}>{title}</span>
      {children}
    </div>
  );

  const Arrow = () => <span className="text-gray-600 text-sm">&#8594;</span>;

  const attnWeights = (head: number) =>
    Array.from({ length: numPatches + 1 }, () =>
      Array.from({ length: numPatches + 1 }, () => +(Math.random() * 0.3 + (head === 0 ? 0.1 : 0)).toFixed(2))
    );

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-200">Vision Transformer (ViT) Pipeline</h3>

      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2 flex-wrap">
        <Stage title="Input Image">
          <div className="grid grid-cols-3 gap-0.5">
            {Array.from({ length: numPatches }, (_, i) => (
              <div key={i} className="h-5 w-5 rounded-sm" style={{ backgroundColor: `hsl(${260 + i * 10}, 50%, ${30 + i * 3}%)` }} />
            ))}
          </div>
        </Stage>

        <Arrow />

        <Stage title="Patch + Linear Proj">
          <div className="flex gap-0.5">
            {Array.from({ length: numPatches }, (_, i) => (
              <div key={i} className="h-8 w-2.5 rounded-sm bg-[#7F56D9]" style={{ opacity: 0.3 + (i / numPatches) * 0.7 }} />
            ))}
          </div>
        </Stage>

        <Arrow />

        <Stage title="[CLS] + Pos Emb" accent>
          <div className="flex gap-0.5 items-end">
            <div className="h-8 w-3 rounded-sm bg-[#9E77ED] border border-[#9E77ED]" />
            {Array.from({ length: numPatches }, (_, i) => (
              <div key={i} className="h-8 w-2.5 rounded-sm" style={{ backgroundColor: `hsl(${270 + i * 8}, 55%, 45%)` }} />
            ))}
          </div>
          <span className="text-sm text-gray-500">{numPatches + 1} tokens</span>
        </Stage>

        <Arrow />

        <div className="flex flex-col gap-1">
          {Array.from({ length: numBlocks }, (_, b) => (
            <button key={b}
              onClick={() => setExpandedBlock(expandedBlock === b ? null : b)}
              className={`rounded border px-3 py-1.5 text-xs font-medium transition-colors ${expandedBlock === b ? 'border-[#7F56D9] bg-[#7F56D9]/20 text-[#9E77ED]' : 'border-border bg-white/5 text-gray-400 hover:text-gray-300'}`}
            >
              Block {b + 1} {expandedBlock === b ? '[-]' : '[+]'}
            </button>
          ))}
        </div>

        <Arrow />

        <Stage title="Classification Head" accent>
          <div className="flex flex-col items-center gap-1">
            <div className="text-xs text-gray-400">[CLS] &#8594; MLP</div>
            <div className="flex gap-1">
              {['cat', 'dog', 'car'].map((c, i) => (
                <span key={i} className={`rounded px-1.5 py-0.5 text-sm ${i === 0 ? 'bg-[#7F56D9]/30 text-[#9E77ED]' : 'bg-white/5 text-gray-500'}`}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        </Stage>
      </div>

      {expandedBlock !== null && (
        <div className="rounded-lg border border-[#7F56D9]/30 bg-[#7F56D9]/5 p-4">
          <div className="mb-2 text-sm font-medium text-gray-300">Block {expandedBlock + 1}: Multi-Head Self-Attention</div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {Array.from({ length: numHeads }, (_, h) => {
              const weights = attnWeights(h);
              return (
                <div key={h} className="flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500">Head {h + 1}</span>
                  <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${numPatches + 1}, 1fr)` }}>
                    {weights.map((row, ri) =>
                      row.map((w, ci) => (
                        <div key={`${ri}-${ci}`}
                          className="h-3 w-3 rounded-[1px]"
                          style={{ backgroundColor: `rgba(127, 86, 217, ${w * 2.5})` }}
                          title={`q=${ri} k=${ci} w=${w}`}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            LayerNorm &#8594; MHSA &#8594; Residual &#8594; LayerNorm &#8594; FFN &#8594; Residual
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        {numPatches} patches + 1 [CLS] token, {numBlocks} transformer blocks, {numHeads} attention heads per block
      </div>
    </div>
  );
}
