'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Request {
  id: number;
  seqLen: number;
  progress: number;
  color: string;
}

const COLORS = ['#7F56D9', '#9E77ED', '#6941C6', '#B692F6', '#53389E', '#D6BBFB', '#7F56D9'];

function makeRequest(id: number): Request {
  return { id, seqLen: Math.floor(Math.random() * 5) + 2, progress: 0, color: COLORS[id % COLORS.length] };
}

export default function ContinuousBatchingViz() {
  const [mode, setMode] = useState<'traditional' | 'continuous'>('traditional');
  const [slots, setSlots] = useState<(Request | null)[]>([null, null, null, null]);
  const [queue, setQueue] = useState<Request[]>(() => [makeRequest(1), makeRequest(2), makeRequest(3)]);
  const [nextId, setNextId] = useState(4);
  const [completed, setCompleted] = useState(0);
  const [tick, setTick] = useState(0);

  const reset = useCallback(() => {
    setSlots([null, null, null, null]);
    setQueue([makeRequest(1), makeRequest(2), makeRequest(3)]);
    setNextId(4);
    setCompleted(0);
    setTick(0);
  }, []);

  useEffect(() => {
    reset();
  }, [mode, reset]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
      setSlots(prev => {
        const next = prev.map(s => {
          if (!s) return null;
          const updated = { ...s, progress: s.progress + 1 };
          return updated.progress >= updated.seqLen ? null : updated;
        });
        // count completions
        const done = prev.filter((s, i) => s && next[i] === null).length;
        if (done > 0) setCompleted(c => c + done);

        if (mode === 'continuous') {
          // fill empty slots from queue immediately
          setQueue(q => {
            const remaining = [...q];
            for (let i = 0; i < next.length; i++) {
              if (!next[i] && remaining.length > 0) {
                next[i] = remaining.shift()!;
              }
            }
            return remaining;
          });
        } else {
          // traditional: wait for ALL slots to finish before loading new batch
          const allEmpty = next.every(s => s === null);
          if (allEmpty) {
            setQueue(q => {
              const remaining = [...q];
              for (let i = 0; i < next.length; i++) {
                if (remaining.length > 0) (next as (Request | null)[])[i] = remaining.shift()!;
              }
              return remaining;
            });
          }
        }
        return next;
      });
    }, 600);
    return () => clearInterval(interval);
  }, [mode]);

  const addRequest = () => {
    setQueue(q => [...q, makeRequest(nextId)]);
    setNextId(n => n + 1);
  };

  const activeCount = slots.filter(Boolean).length;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-200">Continuous Batching</h3>
          <p className="text-xs text-gray-400">Compare traditional vs continuous batching strategies</p>
        </div>
        <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
          {(['traditional', 'continuous'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${mode === m ? 'bg-[#7F56D9] text-white' : 'text-gray-400 hover:text-gray-200'}`}>
              {m === 'traditional' ? 'Traditional' : 'Continuous'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Processing slots */}
        <div>
          <div className="text-xs uppercase font-bold text-gray-400 mb-2">GPU Slots (4)</div>
          <div className="grid grid-cols-4 gap-2">
            {slots.map((s, i) => (
              <div key={i} className="bg-white/5 border border-border rounded-lg p-2 h-20 flex flex-col justify-between">
                {s ? (
                  <>
                    <div className="text-sm text-gray-400">Req #{s.id}</div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${(s.progress / s.seqLen) * 100}%`, backgroundColor: s.color }} />
                    </div>
                    <div className="text-sm text-gray-500">{s.progress}/{s.seqLen} tokens</div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-gray-600">
                    {mode === 'traditional' ? 'Waiting...' : 'Empty'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Queue */}
        <div className="flex items-center gap-3">
          <div className="text-xs uppercase font-bold text-gray-400">Queue ({queue.length})</div>
          <div className="flex gap-1 flex-1 overflow-x-auto">
            {queue.map(r => (
              <div key={r.id} className="px-2 py-1 rounded text-sm font-mono border border-border" style={{ backgroundColor: r.color + '20', color: r.color }}>
                #{r.id} ({r.seqLen}t)
              </div>
            ))}
            {queue.length === 0 && <span className="text-xs text-gray-600 italic">Empty</span>}
          </div>
          <button onClick={addRequest} className="text-xs px-2 py-1 bg-[#7F56D9]/20 border border-[#7F56D9]/40 text-[#9E77ED] rounded hover:bg-[#7F56D9]/30 transition">
            + Add
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/5 border border-border p-2 rounded-lg">
            <div className="text-xs text-gray-400">Completed</div>
            <div className="text-sm font-mono font-bold text-[#9E77ED]">{completed}</div>
          </div>
          <div className="bg-white/5 border border-border p-2 rounded-lg">
            <div className="text-xs text-gray-400">Utilization</div>
            <div className="text-sm font-mono font-bold text-[#9E77ED]">{((activeCount / 4) * 100).toFixed(0)}%</div>
          </div>
          <div className="bg-white/5 border border-border p-2 rounded-lg">
            <div className="text-xs text-gray-400">Tick</div>
            <div className="text-sm font-mono font-bold text-gray-300">{tick}</div>
          </div>
        </div>

        <div className="bg-[#7F56D9]/5 border border-[#7F56D9]/10 p-3 rounded-lg">
          <p className="text-xs text-[#B692F6] leading-relaxed">
            {mode === 'traditional'
              ? 'Traditional batching waits for every request in the batch to finish before starting the next batch. Short requests waste GPU cycles while long ones complete.'
              : 'Continuous batching replaces finished requests with new ones immediately. No GPU slot sits idle while the queue has work.'}
          </p>
        </div>
      </div>
    </div>
  );
}
