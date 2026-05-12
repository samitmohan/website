'use client';
import React, { useState } from 'react';

const sampleQueries = [
  'What is machine learning?',
  'Explain ML to me',
  'How does gradient descent work?',
  'What are neural networks?',
  'Tell me about deep learning',
  'Explain backpropagation',
  'What is ML?',
  'How do neural nets work?',
];

const similarityMap: Record<string, [string, number]> = {
  'Explain ML to me': ['What is machine learning?', 0.94],
  'What is ML?': ['What is machine learning?', 0.97],
  'How do neural nets work?': ['What are neural networks?', 0.91],
  'Tell me about deep learning': ['What are neural networks?', 0.82],
};

export default function SemanticCacheViz() {
  const [threshold, setThreshold] = useState(0.85);
  const [cache, setCache] = useState<string[]>([]);
  const [history, setHistory] = useState<{ query: string; hit: boolean; similarity: number; matched?: string; latency: number }[]>([]);
  const [queryIdx, setQueryIdx] = useState(0);

  const processQuery = () => {
    const query = sampleQueries[queryIdx % sampleQueries.length];
    setQueryIdx((p) => p + 1);

    const match = similarityMap[query];
    const inCache = match && cache.includes(match[0]);
    const similarity = inCache ? match[1] : match ? match[1] : 0;
    const isHit = inCache && similarity >= threshold;

    if (!isHit && !cache.includes(query)) {
      setCache((prev) => [...prev.slice(-5), query]);
    }

    setHistory((prev) => [...prev.slice(-9), {
      query, hit: isHit, similarity: isHit ? similarity : 0,
      matched: isHit ? match![0] : undefined,
      latency: isHit ? 12 + Math.random() * 20 : 200 + Math.random() * 300,
    }]);
  };

  const hits = history.filter((h) => h.hit).length;
  const hitRate = history.length ? ((hits / history.length) * 100).toFixed(0) : '0';

  return (
    <div className="p-6 bg-card rounded-xl border border-border max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold text-white mb-1">Semantic Cache</h2>
      <p className="text-gray-400 text-sm mb-4">Embedding similarity determines cache hits. Threshold controls match sensitivity.</p>

      <div className="mb-4">
        <label className="text-gray-400 text-xs block mb-1">Similarity Threshold: {threshold.toFixed(2)}</label>
        <input type="range" min={50} max={99} value={threshold * 100} onChange={(e) => setThreshold(+e.target.value / 100)}
          className="w-full accent-[#7F56D9]" />
      </div>

      <div className="flex gap-3 mb-4">
        <button onClick={processQuery}
          className="px-4 py-2 bg-[#7F56D9] hover:bg-[#9E77ED] text-white rounded-lg text-sm transition-colors">
          Send Query: &quot;{sampleQueries[queryIdx % sampleQueries.length]}&quot;
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-2xl font-bold text-[#9E77ED]">{hitRate}%</div>
          <div className="text-xs text-gray-500">Hit Rate</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-2xl font-bold text-emerald-400">{hits}</div>
          <div className="text-xs text-gray-500">Cache Hits</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-300">{cache.length}</div>
          <div className="text-xs text-gray-500">Cached Items</div>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-3 min-h-[140px]">
        <div className="text-xs text-gray-500 mb-2">Query Log</div>
        <div className="space-y-1.5">
          {history.slice(-6).map((h, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className={`px-1.5 py-0.5 rounded font-mono ${h.hit ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                {h.hit ? 'HIT' : 'MISS'}
              </span>
              <span className="text-gray-300 truncate flex-1">{h.query}</span>
              {h.hit && <span className="text-gray-500">sim:{h.similarity.toFixed(2)}</span>}
              <span className="text-gray-500 tabular-nums">{h.latency.toFixed(0)}ms</span>
            </div>
          ))}
          {history.length === 0 && <span className="text-gray-500 text-xs">Send queries to see cache behavior</span>}
        </div>
      </div>
    </div>
  );
}
