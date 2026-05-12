'use client';
import React, { useState } from 'react';

export default function DenoisingStepViz() {
  const [currentStep, setCurrentStep] = useState(3);
  const totalSteps = 6;

  const noiseAt = (t: number) => Math.max(0, 1 - t / totalSteps);
  const signalAt = (t: number) => t / totalSteps;

  const NoisyBlock = ({ t, label, highlight }: { t: number; label: string; highlight?: boolean }) => {
    const noise = noiseAt(t);
    const hue = 260 + signalAt(t) * 30;
    return (
      <div className={`flex flex-col items-center gap-1 ${highlight ? 'scale-110' : ''} transition-transform`}>
        <div
          className={`h-14 w-14 rounded-lg border ${highlight ? 'border-[#7F56D9] ring-2 ring-[#7F56D9]/30' : 'border-border'}`}
          style={{
            background: `linear-gradient(135deg, hsl(${hue}, 50%, ${25 + signalAt(t) * 30}%), hsl(${hue + 20}, 40%, ${20 + signalAt(t) * 20}%))`,
            filter: `blur(${noise * 2.5}px)`,
          }}
        />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-200">Denoising Steps</h3>

      {/* Full chain */}
      <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-2">
        {Array.from({ length: totalSteps + 1 }, (_, i) => (
          <React.Fragment key={i}>
            <NoisyBlock t={i} label={`t=${totalSteps - i}`} highlight={i === totalSteps - currentStep} />
            {i < totalSteps && <span className="text-gray-600 text-sm">&#8594;</span>}
          </React.Fragment>
        ))}
      </div>

      {/* Detailed step view */}
      <div className="mb-4 rounded-lg border border-border bg-white/5 p-4">
        <div className="mb-2 text-sm font-medium text-gray-300">
          Step {currentStep} Detail: t={currentStep} &#8594; t={currentStep - 1}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 rounded-lg border border-border"
              style={{
                background: `linear-gradient(135deg, #5B3D99, #3B1D6E)`,
                filter: `blur(${noiseAt(totalSteps - currentStep) * 2.5}px)`,
              }}
            />
            <span className="mt-1 text-xs text-gray-500">x_t (noisy)</span>
          </div>

          <span className="text-gray-500">&#8594;</span>

          <div className="flex flex-col items-center rounded border border-[#7F56D9]/30 bg-[#7F56D9]/10 px-3 py-2">
            <span className="text-xs font-semibold text-[#9E77ED]">Model</span>
            <span className="text-xs text-gray-400">predicts eps_theta</span>
          </div>

          <span className="text-gray-500">&#8594;</span>

          <div className="flex flex-col items-center">
            <div className="h-16 w-16 rounded-lg border border-red-500/30"
              style={{
                background: 'repeating-linear-gradient(45deg, rgba(239,68,68,0.15), rgba(239,68,68,0.15) 3px, transparent 3px, transparent 6px)',
              }}
            />
            <span className="mt-1 text-xs text-gray-500">predicted noise</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-gray-500">-</span>
          </div>

          <span className="text-gray-500">&#8594;</span>

          <div className="flex flex-col items-center">
            <div className="h-16 w-16 rounded-lg border border-green-500/30"
              style={{
                background: `linear-gradient(135deg, #5B3D99, #3B1D6E)`,
                filter: `blur(${noiseAt(totalSteps - currentStep + 1) * 2.5}px)`,
              }}
            />
            <span className="mt-1 text-xs text-gray-500">x_(t-1) (cleaner)</span>
          </div>
        </div>

        <div className="mt-3 rounded bg-black/30 px-3 py-1.5 font-mono text-xs text-gray-400">
          x_(t-1) = (1/sqrt(alpha_t)) * (x_t - (beta_t / sqrt(1 - alpha_bar_t)) * eps_theta) + sigma_t * z
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-400">
          Examine step: <span className="font-mono text-[#9E77ED]">{currentStep}</span> of {totalSteps}
        </label>
        <input
          type="range" min={1} max={totalSteps} value={currentStep}
          onChange={e => setCurrentStep(+e.target.value)}
          className="w-full accent-[#7F56D9]"
        />
      </div>
    </div>
  );
}
