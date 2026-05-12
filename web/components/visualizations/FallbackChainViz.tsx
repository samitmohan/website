'use client';
import React, { useState } from 'react';

interface Provider {
  name: string; latency: number; failed: boolean; retries: number;
}

export default function FallbackChainViz() {
  const [providers, setProviders] = useState<Provider[]>([
    { name: 'GPT-4', latency: 320, failed: false, retries: 0 },
    { name: 'Claude', latency: 280, failed: false, retries: 0 },
    { name: 'Llama-70B', latency: 150, failed: false, retries: 0 },
  ]);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [result, setResult] = useState<{ provider: string; totalLatency: number; retries: number } | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const toggleFailure = (idx: number) => {
    setProviders((prev) => prev.map((p, i) => i === idx ? { ...p, failed: !p.failed } : p));
  };

  const sendRequest = async () => {
    setResult(null);
    setActiveStep(null);
    const newLog: string[] = [];
    let totalLatency = 0;
    let totalRetries = 0;

    for (let i = 0; i < providers.length; i++) {
      setActiveStep(i);
      const p = providers[i];
      const jitter = Math.round(p.latency * (0.8 + Math.random() * 0.4));
      totalLatency += jitter;

      if (p.failed) {
        const retries = 1 + Math.floor(Math.random() * 2);
        totalRetries += retries;
        totalLatency += retries * jitter * 0.5;
        newLog.push(`${p.name}: FAILED (${retries} retries, +${Math.round(retries * jitter * 0.5)}ms)`);
        setProviders((prev) => prev.map((pr, j) => j === i ? { ...pr, retries } : pr));
        setLog([...newLog]);
        await new Promise((r) => setTimeout(r, 400));
        continue;
      }

      newLog.push(`${p.name}: OK (${jitter}ms)`);
      setLog([...newLog]);
      setProviders((prev) => prev.map((pr, j) => j === i ? { ...pr, retries: 0 } : pr));
      await new Promise((r) => setTimeout(r, 300));
      setResult({ provider: p.name, totalLatency: Math.round(totalLatency), retries: totalRetries });
      setActiveStep(null);
      return;
    }

    newLog.push('All providers failed!');
    setLog([...newLog]);
    setActiveStep(null);
  };

  return (
    <div className="p-6 bg-card rounded-xl border border-border max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold text-white mb-1">Fallback Chain</h2>
      <p className="text-gray-400 text-sm mb-4">Toggle failures to see request routing through the provider chain.</p>

      <div className="flex items-center gap-2 mb-5">
        {providers.map((p, i) => (
          <React.Fragment key={i}>
            <div className={`flex-1 rounded-lg p-3 border transition-all ${activeStep === i ? 'border-[#7F56D9] bg-[#7F56D9]/10' : 'border-border bg-white/5'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-white">{p.name}</span>
                <span className="text-xs text-gray-500">~{p.latency}ms</span>
              </div>
              <button onClick={() => toggleFailure(i)}
                className={`w-full py-1 rounded text-xs font-medium transition-colors ${p.failed ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                {p.failed ? 'FAILING' : 'HEALTHY'}
              </button>
              {p.retries > 0 && <div className="text-xs text-yellow-400 mt-1 text-center">{p.retries} retries</div>}
            </div>
            {i < providers.length - 1 && (
              <svg width="24" height="24" className="shrink-0 text-gray-600">
                <path d="M4 12h16M14 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </React.Fragment>
        ))}
      </div>

      <button onClick={sendRequest}
        className="w-full py-2 bg-[#7F56D9] hover:bg-[#9E77ED] text-white rounded-lg text-sm transition-colors mb-4">
        Send Request
      </button>

      {result && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 mb-3 text-sm text-emerald-400">
          Resolved by <span className="font-semibold">{result.provider}</span> in {result.totalLatency}ms ({result.retries} retries total)
        </div>
      )}

      <div className="bg-white/5 rounded-lg p-3 min-h-[80px]">
        <div className="text-xs text-gray-500 mb-2">Request Log</div>
        {log.map((l, i) => (
          <div key={i} className={`text-xs font-mono ${l.includes('FAILED') ? 'text-red-400' : l.includes('OK') ? 'text-emerald-400' : 'text-yellow-400'}`}>
            {l}
          </div>
        ))}
        {log.length === 0 && <span className="text-gray-500 text-xs">Click Send Request to trace the chain</span>}
      </div>
    </div>
  );
}
