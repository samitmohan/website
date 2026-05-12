'use client';

import React, { useState } from 'react';

interface TreeNode {
  token: string;
  children: TreeNode[];
  hits: number;
}

function insertIntoTree(root: TreeNode, tokens: string[]): { node: TreeNode; cacheHitDepth: number } {
  let current = root;
  let cacheHitDepth = 0;
  for (const token of tokens) {
    const existing = current.children.find(c => c.token === token);
    if (existing) {
      existing.hits += 1;
      current = existing;
      cacheHitDepth += 1;
    } else {
      const newNode: TreeNode = { token, children: [], hits: 0 };
      current.children.push(newNode);
      current = newNode;
    }
  }
  return { node: root, cacheHitDepth };
}

const PRESET_PROMPTS = [
  'You are a helpful assistant. Summarize this:',
  'You are a helpful assistant. Translate this:',
  'You are a helpful assistant. Explain this:',
  'You are a code reviewer. Check for bugs:',
  'You are a code reviewer. Suggest improvements:',
  'You are a math tutor. Solve step by step:',
];

function tokenize(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

export default function PrefixCacheViz() {
  const [root, setRoot] = useState<TreeNode>({ token: '<root>', children: [], hits: 0 });
  const [history, setHistory] = useState<{ prompt: string; hitDepth: number; totalLen: number }[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [lastHit, setLastHit] = useState<{ depth: number; total: number } | null>(null);

  const addPrompt = (text: string) => {
    const tokens = tokenize(text);
    if (tokens.length === 0) return;
    setRoot(prev => {
      const cloned = JSON.parse(JSON.stringify(prev)) as TreeNode;
      const { cacheHitDepth } = insertIntoTree(cloned, tokens);
      setLastHit({ depth: cacheHitDepth, total: tokens.length });
      setHistory(h => [...h, { prompt: text, hitDepth: cacheHitDepth, totalLen: tokens.length }]);
      return cloned;
    });
  };

  const totalRequests = history.length;
  const totalHitTokens = history.reduce((s, h) => s + h.hitDepth, 0);
  const totalTokens = history.reduce((s, h) => s + h.totalLen, 0);
  const hitRate = totalTokens > 0 ? ((totalHitTokens / totalTokens) * 100) : 0;

  const renderTree = (node: TreeNode, depth: number): React.ReactNode => {
    if (node.token === '<root>') {
      return (
        <div className="space-y-1">
          {node.children.map((child, i) => (
            <div key={i}>{renderTree(child, 0)}</div>
          ))}
          {node.children.length === 0 && <div className="text-xs text-gray-600 italic">Tree empty - add requests</div>}
        </div>
      );
    }
    return (
      <div className="ml-3 border-l border-border pl-2">
        <div className="flex items-center gap-1">
          <span className={`text-xs font-mono px-1 rounded ${node.hits > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-400'}`}>
            {node.token}
          </span>
          {node.hits > 0 && <span className="text-[8px] text-emerald-500">{node.hits}x cached</span>}
        </div>
        {node.children.map((child, i) => (
          <div key={i}>{renderTree(child, depth + 1)}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-border">
        <h3 className="text-base font-bold text-gray-200">Prefix Cache (KV Cache Sharing)</h3>
        <p className="text-xs text-gray-400">Shared prompt prefixes reuse cached KV computations</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Preset prompts */}
        <div>
          <div className="text-xs uppercase font-bold text-gray-400 mb-1.5">Sample Requests</div>
          <div className="flex flex-wrap gap-1">
            {PRESET_PROMPTS.map((p, i) => (
              <button key={i} onClick={() => addPrompt(p)}
                className="text-sm px-2 py-1 bg-white/5 border border-border text-gray-300 rounded hover:bg-[#7F56D9]/20 hover:border-[#7F56D9]/40 transition truncate max-w-[200px]">
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Custom input */}
        <div className="flex gap-1.5">
          <input value={customPrompt} onChange={e => setCustomPrompt(e.target.value)}
            placeholder="Type a custom prompt..."
            className="flex-1 bg-white/5 border border-border rounded-lg px-2 py-1 text-xs text-gray-300 placeholder:text-gray-600 outline-none focus:border-[#7F56D9]/40" />
          <button onClick={() => { addPrompt(customPrompt); setCustomPrompt(''); }}
            className="text-xs px-2 py-1 bg-[#7F56D9]/20 border border-[#7F56D9]/40 text-[#9E77ED] rounded-lg hover:bg-[#7F56D9]/30 transition">
            Add
          </button>
        </div>

        {/* Last hit indicator */}
        {lastHit && (
          <div className="bg-white/5 border border-border rounded-lg p-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">Last request: {lastHit.depth}/{lastHit.total} tokens cached</span>
            <div className="w-24 bg-white/10 rounded-full h-2">
              <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${(lastHit.depth / lastHit.total) * 100}%` }} />
            </div>
          </div>
        )}

        {/* Prefix tree */}
        <div className="bg-white/5 border border-border rounded-lg p-3 max-h-40 overflow-y-auto">
          <div className="text-xs uppercase font-bold text-gray-400 mb-1">Prefix Tree</div>
          {renderTree(root, 0)}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/5 border border-border p-2 rounded-lg">
            <div className="text-xs text-gray-400">Requests</div>
            <div className="text-sm font-mono font-bold text-[#9E77ED]">{totalRequests}</div>
          </div>
          <div className="bg-white/5 border border-border p-2 rounded-lg">
            <div className="text-xs text-gray-400">Cache Hit Rate</div>
            <div className="text-sm font-mono font-bold text-emerald-400">{hitRate.toFixed(1)}%</div>
          </div>
          <div className="bg-white/5 border border-border p-2 rounded-lg">
            <div className="text-xs text-gray-400">Tokens Saved</div>
            <div className="text-sm font-mono font-bold text-emerald-400">{totalHitTokens}</div>
          </div>
        </div>

        <div className="bg-[#7F56D9]/5 border border-[#7F56D9]/10 p-3 rounded-lg">
          <p className="text-xs text-[#B692F6] leading-relaxed">
            Requests sharing a system prompt prefix reuse KV cache entries from earlier requests. The prefix tree stores these shared prefixes - green nodes had their KV values served from cache instead of recomputed.
          </p>
        </div>
      </div>
    </div>
  );
}
