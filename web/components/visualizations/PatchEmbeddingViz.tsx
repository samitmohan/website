'use client';

import React, { useState } from 'react';

const IMG_SIZE = 160;
const PATCH_COUNTS = [2, 4, 8] as const;
type PatchCount = typeof PATCH_COUNTS[number];

const PATCH_COLORS = [
  '#7F56D9', '#9E77ED', '#B692F6', '#D6BBFB',
  '#6941C6', '#53389E', '#7F56D9', '#9E77ED',
  '#B692F6', '#D6BBFB', '#6941C6', '#53389E',
  '#7F56D9', '#9E77ED', '#B692F6', '#D6BBFB',
  '#6941C6', '#53389E', '#7F56D9', '#9E77ED',
  '#B692F6', '#D6BBFB', '#6941C6', '#53389E',
  '#7F56D9', '#9E77ED', '#B692F6', '#D6BBFB',
  '#6941C6', '#53389E', '#7F56D9', '#9E77ED',
  '#B692F6', '#D6BBFB', '#6941C6', '#53389E',
  '#7F56D9', '#9E77ED', '#B692F6', '#D6BBFB',
  '#6941C6', '#53389E', '#7F56D9', '#9E77ED',
  '#B692F6', '#D6BBFB', '#6941C6', '#53389E',
  '#7F56D9', '#9E77ED', '#B692F6', '#D6BBFB',
  '#6941C6', '#53389E', '#7F56D9', '#9E77ED',
  '#B692F6', '#D6BBFB', '#6941C6', '#53389E',
  '#7F56D9', '#9E77ED', '#B692F6', '#D6BBFB',
];

export default function PatchEmbeddingViz() {
  const [patchCount, setPatchCount] = useState<PatchCount>(4);
  const [hoveredPatch, setHoveredPatch] = useState<number | null>(null);
  const [stage, setStage] = useState<'image' | 'patches' | 'flatten' | 'embed' | 'position' | 'output'>('image');

  const patchSize = IMG_SIZE / patchCount;
  const totalPatches = patchCount * patchCount;
  const embDim = 64;
  const flatDim = Math.round((patchSize * patchSize * 3));

  const stages = ['image', 'patches', 'flatten', 'embed', 'position', 'output'] as const;
  const stageIdx = stages.indexOf(stage);

  const nextStage = () => {
    const idx = stages.indexOf(stage);
    if (idx < stages.length - 1) setStage(stages[idx + 1]);
  };
  const prevStage = () => {
    const idx = stages.indexOf(stage);
    if (idx > 0) setStage(stages[idx - 1]);
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-200">Patch Embedding (ViT)</h3>
          <p className="text-xs text-gray-400">Image to patch sequence for vision transformers</p>
        </div>
        <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
          {PATCH_COUNTS.map(p => (
            <button key={p} onClick={() => { setPatchCount(p); setStage('image'); setHoveredPatch(null); }}
              className={`text-xs px-2 py-1 rounded-md font-medium transition ${patchCount === p ? 'bg-[#7F56D9] text-white' : 'text-gray-400 hover:text-gray-200'}`}>
              {p}x{p}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stage indicator */}
        <div className="flex items-center gap-1">
          {stages.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`text-[8px] px-1.5 py-0.5 rounded font-medium transition cursor-pointer ${i <= stageIdx ? 'bg-[#7F56D9]/30 text-[#9E77ED]' : 'bg-white/5 text-gray-500'}`}
                onClick={() => setStage(s)}>
                {s}
              </div>
              {i < stages.length - 1 && <span className="text-gray-600 text-[8px]">-&gt;</span>}
            </React.Fragment>
          ))}
        </div>

        {/* Main visualization */}
        <div className="flex items-center gap-4 justify-center min-h-[180px]">
          {(stage === 'image' || stage === 'patches') && (
            <div className="relative" style={{ width: IMG_SIZE, height: IMG_SIZE }}>
              {/* Fake image - gradient background */}
              <div className="absolute inset-0 rounded-lg overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a365d, #2d3748, #553c9a, #2d3748)' }} />
              {/* Patch grid overlay */}
              {stage === 'patches' && Array.from({ length: totalPatches }, (_, i) => {
                const row = Math.floor(i / patchCount);
                const col = i % patchCount;
                return (
                  <div key={i}
                    className="absolute border transition-all cursor-pointer"
                    style={{
                      left: col * patchSize, top: row * patchSize,
                      width: patchSize, height: patchSize,
                      borderColor: hoveredPatch === i ? '#9E77ED' : 'rgba(255,255,255,0.3)',
                      backgroundColor: hoveredPatch === i ? 'rgba(127,86,217,0.3)' : 'transparent',
                    }}
                    onMouseEnter={() => setHoveredPatch(i)}
                    onMouseLeave={() => setHoveredPatch(null)}>
                    <span className="text-[7px] text-white/60 absolute top-0.5 left-0.5">{i}</span>
                  </div>
                );
              })}
            </div>
          )}

          {stage === 'flatten' && (
            <div className="flex gap-1 flex-wrap max-w-[300px]">
              {Array.from({ length: Math.min(totalPatches, 16) }, (_, i) => (
                <div key={i} className="flex items-center gap-0.5">
                  <div className="w-3 h-8 rounded-sm" style={{ backgroundColor: PATCH_COLORS[i % PATCH_COLORS.length] + '60' }} />
                  <span className="text-[7px] text-gray-500">[{flatDim}]</span>
                </div>
              ))}
            </div>
          )}

          {stage === 'embed' && (
            <div className="flex flex-col items-center gap-1">
              <div className="text-sm text-gray-400 mb-1">Linear Projection: {flatDim} -&gt; {embDim}</div>
              <div className="flex gap-0.5">
                {Array.from({ length: Math.min(totalPatches, 16) }, (_, i) => (
                  <div key={i} className="w-2 h-12 rounded-sm" style={{ backgroundColor: PATCH_COLORS[i % PATCH_COLORS.length] + '80' }} />
                ))}
              </div>
              <div className="text-[8px] text-gray-500">{totalPatches} x {embDim}d embeddings</div>
            </div>
          )}

          {stage === 'position' && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: Math.min(totalPatches, 16) }, (_, i) => (
                  <div key={i} className="flex flex-col gap-0.5 items-center">
                    <div className="w-2 h-6 rounded-sm" style={{ backgroundColor: PATCH_COLORS[i % PATCH_COLORS.length] + '80' }} />
                    <span className="text-[6px] text-[#9E77ED]">+</span>
                    <div className="w-2 h-6 rounded-sm bg-[#7F56D9]/40" />
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-400">patch embeddings + position encodings</div>
            </div>
          )}

          {stage === 'output' && (
            <div className="flex flex-col items-center gap-2">
              <div className="bg-white/5 border border-[#7F56D9]/40 rounded-lg px-4 py-3 text-center">
                <div className="text-xs text-[#9E77ED] font-bold mb-1">Transformer Input</div>
                <div className="text-sm text-gray-400">Sequence of {totalPatches} tokens, each {embDim}d</div>
                <div className="flex gap-0.5 mt-2 justify-center">
                  {Array.from({ length: Math.min(totalPatches, 16) }, (_, i) => (
                    <div key={i} className="w-2.5 h-10 rounded-sm" style={{ backgroundColor: PATCH_COLORS[i % PATCH_COLORS.length] }} />
                  ))}
                </div>
              </div>
              <svg width="20" height="20" className="text-gray-500"><path d="M10 0 L10 15 M5 10 L10 15 L15 10" stroke="currentColor" fill="none" strokeWidth="1.5" /></svg>
              <div className="text-sm text-gray-400 bg-white/5 border border-border rounded px-2 py-1">Self-Attention Layers</div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <button onClick={prevStage} disabled={stageIdx === 0}
            className="text-xs px-3 py-1 border border-border text-gray-400 rounded-lg hover:bg-white/5 transition disabled:opacity-30">
            Prev
          </button>
          <span className="text-xs text-gray-500">{stageIdx + 1}/{stages.length}</span>
          <button onClick={nextStage} disabled={stageIdx === stages.length - 1}
            className="text-xs px-3 py-1 bg-[#7F56D9]/20 border border-[#7F56D9]/40 text-[#9E77ED] rounded-lg hover:bg-[#7F56D9]/30 transition disabled:opacity-30">
            Next
          </button>
        </div>

        {/* Info */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/5 border border-border p-2 rounded-lg">
            <div className="text-xs text-gray-400">Patches</div>
            <div className="text-sm font-mono font-bold text-[#9E77ED]">{totalPatches}</div>
          </div>
          <div className="bg-white/5 border border-border p-2 rounded-lg">
            <div className="text-xs text-gray-400">Patch Dim</div>
            <div className="text-sm font-mono font-bold text-gray-300">{flatDim}</div>
          </div>
          <div className="bg-white/5 border border-border p-2 rounded-lg">
            <div className="text-xs text-gray-400">Embed Dim</div>
            <div className="text-sm font-mono font-bold text-gray-300">{embDim}</div>
          </div>
        </div>

        <div className="bg-[#7F56D9]/5 border border-[#7F56D9]/10 p-3 rounded-lg">
          <p className="text-xs text-[#B692F6] leading-relaxed">
            {stage === 'image' ? 'The input image starts as a 2D pixel grid with 3 color channels (RGB).'
              : stage === 'patches' ? `The image splits into a ${patchCount}x${patchCount} grid of non-overlapping patches. Each patch becomes one token.`
              : stage === 'flatten' ? `Each patch flattens from a ${Math.round(patchSize)}x${Math.round(patchSize)}x3 volume into a ${flatDim}-dimensional vector.`
              : stage === 'embed' ? `A learned linear projection maps each ${flatDim}d flat patch into a ${embDim}d embedding vector.`
              : stage === 'position' ? 'Learned position encodings add spatial information so the transformer knows each patch\'s location in the original image.'
              : `The final sequence of ${totalPatches} embedded patches feeds into standard transformer self-attention layers, processed the same as text tokens.`}
          </p>
        </div>
      </div>
    </div>
  );
}
