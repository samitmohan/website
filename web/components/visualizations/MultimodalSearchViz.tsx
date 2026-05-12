'use client';
import React, { useState } from 'react';

const GALLERY = [
  { label: 'Cat on sofa', tags: ['cat', 'animal', 'furniture', 'indoor', 'pet'], color: '#4A2D7A' },
  { label: 'Beach sunset', tags: ['sunset', 'beach', 'ocean', 'sky', 'nature'], color: '#7A4A2D' },
  { label: 'Red sports car', tags: ['car', 'red', 'vehicle', 'speed', 'road'], color: '#7A2D2D' },
  { label: 'Mountain hike', tags: ['mountain', 'trail', 'nature', 'outdoor', 'hike'], color: '#2D5A3A' },
  { label: 'Dog in park', tags: ['dog', 'animal', 'park', 'outdoor', 'pet'], color: '#3A2D5A' },
  { label: 'City skyline', tags: ['city', 'building', 'skyline', 'urban', 'night'], color: '#2D3A5A' },
  { label: 'Pasta dish', tags: ['food', 'pasta', 'plate', 'indoor', 'italian'], color: '#5A4A2D' },
  { label: 'Forest path', tags: ['forest', 'nature', 'tree', 'path', 'outdoor'], color: '#2D4A2D' },
];

function computeSimilarity(query: string, tags: string[]): number {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  let score = 0;
  for (const word of words) {
    for (const tag of tags) {
      if (tag.includes(word) || word.includes(tag)) {
        score += 1;
      } else {
        // partial letter overlap
        const common = [...word].filter(c => tag.includes(c)).length;
        score += common / Math.max(word.length, tag.length) * 0.3;
      }
    }
  }
  return Math.min(score / words.length, 1);
}

export default function MultimodalSearchViz() {
  const [query, setQuery] = useState('a cat sitting indoors');

  const results = GALLERY.map((item, idx) => ({
    ...item,
    idx,
    score: computeSimilarity(query, item.tags),
  }))
    .sort((a, b) => b.score - a.score);

  const maxScore = Math.max(...results.map(r => r.score), 0.01);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-200">Multimodal Search (Text-to-Image Retrieval)</h3>

      <div className="mb-4">
        <label className="mb-1 block text-sm text-gray-400">Text Query</label>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full rounded border border-border bg-white/5 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-[#7F56D9] focus:outline-none"
          placeholder="Type a search query..."
        />
      </div>

      <div className="mb-4 flex items-center gap-2">
        <div className="rounded border border-[#7F56D9]/30 bg-[#7F56D9]/10 px-3 py-1.5 text-xs text-[#9E77ED]">
          Text Encoder: query &#8594; embedding
        </div>
        <span className="text-gray-500 text-sm">&#8594;</span>
        <div className="rounded border border-[#7F56D9]/30 bg-[#7F56D9]/10 px-3 py-1.5 text-xs text-[#9E77ED]">
          Cosine Similarity
        </div>
        <span className="text-gray-500 text-sm">&#8594;</span>
        <div className="rounded border border-[#7F56D9]/30 bg-[#7F56D9]/10 px-3 py-1.5 text-xs text-[#9E77ED]">
          Rank Results
        </div>
      </div>

      <div className="mb-3 text-xs font-medium text-gray-400">Results (ranked by similarity)</div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {results.map((item, rank) => (
          <div key={item.idx}
            className={`rounded-lg border p-3 transition-all ${rank === 0 ? 'border-[#7F56D9] bg-[#7F56D9]/10' : 'border-border bg-white/5'}`}
            style={{ opacity: 0.4 + (item.score / maxScore) * 0.6 }}
          >
            <div className="mb-2 flex h-16 items-center justify-center rounded" style={{ backgroundColor: item.color }}>
              <span className="text-xs text-white/70">{item.label}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">#{rank + 1}</span>
              <span className="font-mono text-xs text-[#9E77ED]">{item.score.toFixed(3)}</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-white/5">
              <div className="h-full rounded-full bg-[#7F56D9]" style={{ width: `${(item.score / maxScore) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2 flex-wrap">
        {['a cat sitting indoors', 'sunset nature', 'red vehicle', 'food plate'].map(q => (
          <button key={q} onClick={() => setQuery(q)}
            className="rounded border border-border px-2 py-1 text-xs text-gray-400 hover:border-[#7F56D9]/40 hover:text-gray-300 transition-colors"
          >
            &quot;{q}&quot;
          </button>
        ))}
      </div>
    </div>
  );
}
