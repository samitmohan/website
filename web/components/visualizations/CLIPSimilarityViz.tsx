'use client';

import React, { useState } from 'react';

interface Pair {
  image: string;
  text: string;
}

const PAIRS: Pair[] = [
  { image: 'Cat sitting on sofa', text: 'A cat resting on furniture' },
  { image: 'Dog playing in park', text: 'A dog running outside' },
  { image: 'Mountain landscape', text: 'Snow-capped peaks at sunset' },
  { image: 'City skyline at night', text: 'Urban buildings with lights' },
];

// Pre-computed mock similarity matrix (cosine similarities)
const SIM_MATRIX = [
  [0.92, 0.31, 0.12, 0.18],
  [0.28, 0.89, 0.15, 0.21],
  [0.10, 0.14, 0.95, 0.35],
  [0.19, 0.22, 0.30, 0.91],
];

function simColor(v: number): string {
  if (v > 0.8) return '#34d399';
  if (v > 0.5) return '#facc15';
  if (v > 0.3) return '#fb923c';
  return '#6b7280';
}

export default function CLIPSimilarityViz() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [selectedText, setSelectedText] = useState<number | null>(null);
  const [showMatrix, setShowMatrix] = useState(false);

  const currentSim = selectedImage !== null && selectedText !== null
    ? SIM_MATRIX[selectedImage][selectedText] : null;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-200">CLIP Similarity</h3>
          <p className="text-xs text-gray-400">Dual encoder: image and text embeddings compared via cosine similarity</p>
        </div>
        <button onClick={() => setShowMatrix(m => !m)}
          className={`text-xs px-2 py-1 rounded-md font-medium transition ${showMatrix ? 'bg-[#7F56D9] text-white' : 'bg-white/5 text-gray-400 hover:text-gray-200'}`}>
          {showMatrix ? 'Towers' : 'Matrix'}
        </button>
      </div>

      <div className="p-4 space-y-4">
        {!showMatrix ? (
          /* Two-tower view */
          <div className="flex gap-6 justify-center">
            {/* Image tower */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs uppercase font-bold text-gray-400">Image Encoder</div>
              <div className="bg-white/5 border border-border rounded-lg p-2 w-36">
                <div className="text-[8px] text-gray-500 text-center mb-1">ViT-L/14</div>
                <div className="space-y-1">
                  {PAIRS.map((p, i) => (
                    <button key={i} onClick={() => setSelectedImage(i)}
                      className={`w-full text-left text-sm px-2 py-1.5 rounded transition ${selectedImage === i ? 'bg-[#7F56D9]/30 border border-[#7F56D9]/40 text-[#9E77ED]' : 'bg-white/5 border border-border text-gray-400 hover:bg-white/10'}`}>
                      {p.image}
                    </button>
                  ))}
                </div>
              </div>
              <svg width="16" height="24" className="text-gray-600"><path d="M8 0 L8 18 M4 14 L8 18 L12 14" stroke="currentColor" fill="none" strokeWidth="1.5" /></svg>
              <div className="bg-[#7F56D9]/10 border border-[#7F56D9]/30 rounded px-3 py-1.5">
                <span className="text-sm text-[#9E77ED] font-mono">img_emb [512d]</span>
              </div>
            </div>

            {/* Similarity bridge */}
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="text-xs text-gray-400">cosine sim</div>
              {currentSim !== null ? (
                <>
                  <div className="w-20 h-20 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: simColor(currentSim), backgroundColor: simColor(currentSim) + '15' }}>
                    <span className="text-lg font-mono font-bold" style={{ color: simColor(currentSim) }}>
                      {currentSim.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm" style={{ color: simColor(currentSim) }}>
                    {currentSim > 0.8 ? 'Strong match' : currentSim > 0.5 ? 'Partial match' : 'Weak match'}
                  </div>
                </>
              ) : (
                <div className="w-20 h-20 rounded-full border border-border flex items-center justify-center">
                  <span className="text-sm text-gray-500">Select both</span>
                </div>
              )}
            </div>

            {/* Text tower */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs uppercase font-bold text-gray-400">Text Encoder</div>
              <div className="bg-white/5 border border-border rounded-lg p-2 w-36">
                <div className="text-[8px] text-gray-500 text-center mb-1">Transformer</div>
                <div className="space-y-1">
                  {PAIRS.map((p, i) => (
                    <button key={i} onClick={() => setSelectedText(i)}
                      className={`w-full text-left text-sm px-2 py-1.5 rounded transition ${selectedText === i ? 'bg-[#7F56D9]/30 border border-[#7F56D9]/40 text-[#9E77ED]' : 'bg-white/5 border border-border text-gray-400 hover:bg-white/10'}`}>
                      {p.text}
                    </button>
                  ))}
                </div>
              </div>
              <svg width="16" height="24" className="text-gray-600"><path d="M8 0 L8 18 M4 14 L8 18 L12 14" stroke="currentColor" fill="none" strokeWidth="1.5" /></svg>
              <div className="bg-[#7F56D9]/10 border border-[#7F56D9]/30 rounded px-3 py-1.5">
                <span className="text-sm text-[#9E77ED] font-mono">txt_emb [512d]</span>
              </div>
            </div>
          </div>
        ) : (
          /* Similarity matrix heatmap */
          <div>
            <div className="text-xs uppercase font-bold text-gray-400 mb-2 text-center">Similarity Matrix (Image x Text)</div>
            <div className="flex justify-center">
              <div>
                {/* Header row */}
                <div className="flex">
                  <div className="w-28" />
                  {PAIRS.map((p, i) => (
                    <div key={i} className="w-16 text-[7px] text-gray-500 text-center px-0.5 truncate">{p.text}</div>
                  ))}
                </div>
                {/* Matrix rows */}
                {PAIRS.map((imgP, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-28 text-[8px] text-gray-400 truncate pr-1">{imgP.image}</div>
                    {PAIRS.map((_, j) => {
                      const sim = SIM_MATRIX[i][j];
                      return (
                        <div key={j}
                          className="w-16 h-10 flex items-center justify-center border border-border cursor-pointer transition hover:border-white/20"
                          style={{ backgroundColor: simColor(sim) + (i === j ? '40' : '18') }}
                          onClick={() => { setSelectedImage(i); setSelectedText(j); setShowMatrix(false); }}>
                          <span className="text-xs font-mono font-bold" style={{ color: simColor(sim) }}>{sim.toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/5 border border-border p-2 rounded-lg">
            <div className="text-xs text-gray-400">Pairs</div>
            <div className="text-sm font-mono font-bold text-[#9E77ED]">{PAIRS.length}</div>
          </div>
          <div className="bg-white/5 border border-border p-2 rounded-lg">
            <div className="text-xs text-gray-400">Embed Dim</div>
            <div className="text-sm font-mono font-bold text-gray-300">512</div>
          </div>
          <div className="bg-white/5 border border-border p-2 rounded-lg">
            <div className="text-xs text-gray-400">Selected Sim</div>
            <div className="text-sm font-mono font-bold" style={{ color: currentSim !== null ? simColor(currentSim) : '#6b7280' }}>
              {currentSim !== null ? currentSim.toFixed(2) : '--'}
            </div>
          </div>
        </div>

        <div className="bg-[#7F56D9]/5 border border-[#7F56D9]/10 p-3 rounded-lg">
          <p className="text-xs text-[#B692F6] leading-relaxed">
            CLIP trains two encoders jointly: images and text map into the same embedding space. Matching pairs get high cosine similarity (diagonal), while mismatched pairs score low. This enables zero-shot classification by comparing an image embedding against text descriptions.
          </p>
        </div>
      </div>
    </div>
  );
}
