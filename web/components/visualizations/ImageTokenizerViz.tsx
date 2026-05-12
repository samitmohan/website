'use client';
import React, { useState } from 'react';

export default function ImageTokenizerViz() {
  const [step, setStep] = useState(0);
  const [showPosEnc, setShowPosEnc] = useState(false);
  const gridSize = 4;
  const patchCount = gridSize * gridSize;
  const steps = ['Image Grid', 'Patch Extraction', 'Add [CLS] Token', 'Position Embeddings', 'Token Sequence'];

  const patchColors = Array.from({ length: patchCount }, (_, i) => {
    const h = (i / patchCount) * 280 + 200;
    return `hsl(${h % 360}, 55%, ${35 + (i % 3) * 8}%)`;
  });

  const posValues = Array.from({ length: patchCount + 1 }, (_, i) =>
    Array.from({ length: 4 }, (_, j) => Math.sin(i / (10000 ** (j / 4))).toFixed(2))
  );

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-200">Image Tokenizer: Patches to Tokens</h3>

      <div className="mb-4 flex gap-1 flex-wrap">
        {steps.map((s, i) => (
          <button key={i} onClick={() => setStep(i)}
            className={`rounded px-2 py-1 text-xs font-medium transition-colors ${step === i ? 'bg-[#7F56D9] text-white' : 'border border-border text-gray-400 hover:text-gray-300'}`}
          >{s}</button>
        ))}
      </div>

      <div className="mb-4 flex items-start gap-6 flex-wrap">
        {/* Image / Patches Grid */}
        <div className="flex flex-col items-center gap-2">
          <div className={`grid gap-0.5 ${step === 0 ? '' : 'gap-1'}`} style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
            {Array.from({ length: patchCount }, (_, i) => (
              <div
                key={i}
                className={`rounded-sm transition-all duration-300 ${step >= 1 ? 'border border-white/20' : ''}`}
                style={{
                  width: step >= 1 ? 36 : 32,
                  height: step >= 1 ? 36 : 32,
                  backgroundColor: patchColors[i],
                  opacity: step >= 2 ? 0.7 : 1,
                  transform: step >= 1 ? `translate(${(i % 2) * 2 - 1}px, ${(Math.floor(i / gridSize) % 2) * 2 - 1}px)` : 'none',
                }}
              >
                {step >= 1 && <span className="flex h-full items-center justify-center text-sm text-white/60">{i + 1}</span>}
              </div>
            ))}
          </div>
          <span className="text-xs text-gray-500">{step === 0 ? 'Input Image' : `${patchCount} Patches`}</span>
        </div>

        {step >= 2 && (
          <div className="flex flex-col items-center gap-2">
            <span className="text-gray-500 text-lg mt-4">&#8594;</span>
          </div>
        )}

        {/* Token sequence */}
        {step >= 2 && (
          <div className="flex flex-col gap-1">
            <div className="flex gap-1 flex-wrap" style={{ maxWidth: 280 }}>
              <div className="flex h-9 w-14 items-center justify-center rounded border-2 border-[#7F56D9] bg-[#7F56D9]/20 text-xs font-bold text-[#9E77ED]">
                [CLS]
              </div>
              {Array.from({ length: patchCount }, (_, i) => (
                <div key={i}
                  className="flex h-9 w-9 items-center justify-center rounded border border-border text-xs text-gray-300"
                  style={{ backgroundColor: step >= 3 ? `${patchColors[i]}88` : patchColors[i] }}
                >
                  {step >= 3 && showPosEnc ? `+${i + 1}` : `P${i + 1}`}
                </div>
              ))}
            </div>
            <span className="text-xs text-gray-500 mt-1">
              {step === 2 && '[CLS] prepended to patch tokens'}
              {step === 3 && 'Position embeddings added'}
              {step === 4 && `Final: ${patchCount + 1} tokens -> Transformer`}
            </span>
          </div>
        )}
      </div>

      {step >= 3 && (
        <div className="mb-3">
          <button onClick={() => setShowPosEnc(!showPosEnc)}
            className={`rounded px-3 py-1 text-xs font-medium ${showPosEnc ? 'bg-[#7F56D9] text-white' : 'border border-border text-gray-400'}`}
          >
            {showPosEnc ? 'Hide' : 'Show'} Position Encoding Values
          </button>
          {showPosEnc && (
            <div className="mt-2 flex gap-1 flex-wrap">
              {posValues.map((v, i) => (
                <div key={i} className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-sm text-gray-500">
                  {i === 0 ? 'CLS' : `P${i}`}: [{v.join(', ')}]
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-gray-500">
        Image ({gridSize * 8}x{gridSize * 8}) divided into {patchCount} patches of {8}x{8} each, producing {patchCount + 1} tokens (with [CLS])
      </div>
    </div>
  );
}
