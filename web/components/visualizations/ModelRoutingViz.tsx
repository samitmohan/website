'use client';

import React, { useState } from 'react';

interface Query {
  text: string;
  complexity: 'simple' | 'medium' | 'complex';
}

const SAMPLE_QUERIES: Query[] = [
  { text: 'What is 2 + 2?', complexity: 'simple' },
  { text: 'Summarize this paragraph about climate change', complexity: 'medium' },
  { text: 'Write a recursive parser for nested JSON with error recovery', complexity: 'complex' },
  { text: 'Translate "hello" to French', complexity: 'simple' },
  { text: 'Compare pros and cons of microservices vs monolith', complexity: 'medium' },
  { text: 'Design a distributed consensus algorithm for Byzantine fault tolerance', complexity: 'complex' },
  { text: 'What year did WW2 end?', complexity: 'simple' },
  { text: 'Explain how backpropagation works step by step', complexity: 'medium' },
];

const TIERS = {
  simple: { label: 'Small (8B)', color: '#34d399', cost: 0.01, icon: 'S' },
  medium: { label: 'Medium (70B)', color: '#facc15', cost: 0.10, icon: 'M' },
  complex: { label: 'Large (405B)', color: '#f43f5e', cost: 1.00, icon: 'L' },
};

export default function ModelRoutingViz() {
  const [routed, setRouted] = useState<Query[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showClassification, setShowClassification] = useState<string | null>(null);

  const classify = () => {
    if (currentIdx >= SAMPLE_QUERIES.length) return;
    const query = SAMPLE_QUERIES[currentIdx];
    setShowClassification(query.complexity);
    setTimeout(() => {
      setRouted(prev => [...prev, query]);
      setShowClassification(null);
      setCurrentIdx(i => i + 1);
    }, 800);
  };

  const resetAll = () => {
    setRouted([]);
    setCurrentIdx(0);
    setShowClassification(null);
  };

  const routedByTier = {
    simple: routed.filter(r => r.complexity === 'simple'),
    medium: routed.filter(r => r.complexity === 'medium'),
    complex: routed.filter(r => r.complexity === 'complex'),
  };

  const totalCostWithRouting = routed.reduce((sum, r) => sum + TIERS[r.complexity].cost, 0);
  const totalCostNoRouting = routed.length * TIERS.complex.cost;
  const savings = totalCostNoRouting > 0 ? ((1 - totalCostWithRouting / totalCostNoRouting) * 100) : 0;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-border">
        <h3 className="text-base font-bold text-gray-200">Model Routing</h3>
        <p className="text-xs text-gray-400">Route queries to appropriately-sized models by complexity</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Current query */}
        <div className="bg-white/5 border border-border rounded-lg p-3">
          <div className="text-xs uppercase font-bold text-gray-400 mb-1">Incoming Query ({currentIdx + 1}/{SAMPLE_QUERIES.length})</div>
          {currentIdx < SAMPLE_QUERIES.length ? (
            <div className="text-xs text-gray-200 font-mono">"{SAMPLE_QUERIES[currentIdx].text}"</div>
          ) : (
            <div className="text-xs text-gray-500 italic">All queries processed</div>
          )}
          {showClassification && (
            <div className="mt-2 text-xs font-bold" style={{ color: TIERS[showClassification as keyof typeof TIERS].color }}>
              Classified: {showClassification.toUpperCase()} -&gt; {TIERS[showClassification as keyof typeof TIERS].label}
            </div>
          )}
        </div>

        {/* Model tiers */}
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(TIERS) as [keyof typeof TIERS, typeof TIERS[keyof typeof TIERS]][]).map(([key, tier]) => (
            <div key={key} className="bg-white/5 border border-border rounded-lg p-2">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-base font-bold" style={{ backgroundColor: tier.color + '20', color: tier.color }}>
                  {tier.icon}
                </div>
                <div className="text-xs font-bold" style={{ color: tier.color }}>{tier.label}</div>
              </div>
              <div className="text-sm text-gray-500 mb-1">${tier.cost.toFixed(2)}/query</div>
              <div className="space-y-0.5">
                {routedByTier[key].map((q, i) => (
                  <div key={i} className="text-[8px] text-gray-400 truncate bg-white/5 rounded px-1 py-0.5">
                    {q.text}
                  </div>
                ))}
                {routedByTier[key].length === 0 && <div className="text-[8px] text-gray-600 italic">No queries yet</div>}
              </div>
              <div className="mt-1 text-xs font-mono" style={{ color: tier.color }}>
                {routedByTier[key].length} routed
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button onClick={classify} disabled={currentIdx >= SAMPLE_QUERIES.length || showClassification !== null}
            className="flex-1 text-xs px-3 py-1.5 bg-[#7F56D9]/20 border border-[#7F56D9]/40 text-[#9E77ED] rounded-lg hover:bg-[#7F56D9]/30 transition disabled:opacity-30">
            Classify & Route
          </button>
          <button onClick={resetAll} className="text-xs px-3 py-1.5 border border-border text-gray-400 rounded-lg hover:bg-white/5 transition">
            Reset
          </button>
        </div>

        {/* Cost comparison */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/5 border border-border p-2 rounded-lg">
            <div className="text-xs text-gray-400">With Routing</div>
            <div className="text-sm font-mono font-bold text-[#9E77ED]">${totalCostWithRouting.toFixed(2)}</div>
          </div>
          <div className="bg-white/5 border border-border p-2 rounded-lg">
            <div className="text-xs text-gray-400">All Large</div>
            <div className="text-sm font-mono font-bold text-gray-300">${totalCostNoRouting.toFixed(2)}</div>
          </div>
          <div className="bg-white/5 border border-border p-2 rounded-lg">
            <div className="text-xs text-gray-400">Savings</div>
            <div className="text-sm font-mono font-bold text-emerald-400">{savings.toFixed(0)}%</div>
          </div>
        </div>

        <div className="bg-[#7F56D9]/5 border border-[#7F56D9]/10 p-3 rounded-lg">
          <p className="text-xs text-[#B692F6] leading-relaxed">
            A classifier examines each query and routes it to the smallest model that can handle it. Simple factual lookups go to the 8B model at 1/100th the cost of the 405B.
          </p>
        </div>
      </div>
    </div>
  );
}
