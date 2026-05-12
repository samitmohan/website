'use client';
import React, { useState, useEffect } from 'react';

export default function RateLimiterViz() {
  const [rateLimit, setRateLimit] = useState(5);
  const [requests, setRequests] = useState<{ id: number; time: number; status: 'accepted' | 'queued' | 'rejected' }[]>([]);
  const [windowStart, setWindowStart] = useState(0);
  const [nextId, setNextId] = useState(1);

  const windowSize = 10; // 10-second window

  useEffect(() => {
    const interval = setInterval(() => {
      setWindowStart((prev) => prev + 1);
      setRequests((prev) => prev.filter((r) => r.time > windowStart - windowSize));
    }, 1000);
    return () => clearInterval(interval);
  }, [windowStart]);

  const sendRequest = () => {
    const now = windowStart;
    const inWindow = requests.filter((r) => r.time >= now - windowSize && r.status === 'accepted').length;
    let status: 'accepted' | 'queued' | 'rejected';
    if (inWindow < rateLimit) status = 'accepted';
    else if (inWindow < rateLimit + 2) status = 'queued';
    else status = 'rejected';
    setRequests((prev) => [...prev.slice(-30), { id: nextId, time: now, status }]);
    setNextId((p) => p + 1);
  };

  const sendBurst = () => {
    for (let i = 0; i < 8; i++) setTimeout(() => sendRequest(), i * 80);
  };

  const inWindow = requests.filter((r) => r.time >= windowStart - windowSize && r.status === 'accepted').length;
  const fillPct = Math.min((inWindow / rateLimit) * 100, 100);

  const statusColor = (s: string) =>
    s === 'accepted' ? 'bg-emerald-500' : s === 'queued' ? 'bg-yellow-500' : 'bg-red-500';
  const statusText = (s: string) =>
    s === 'accepted' ? 'text-emerald-400' : s === 'queued' ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="p-6 bg-card rounded-xl border border-border max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold text-white mb-1">Sliding Window Rate Limiter</h2>
      <p className="text-gray-400 text-sm mb-4">Tokens per window: {rateLimit} | Window: {windowSize}s</p>

      <div className="mb-4">
        <label className="text-gray-400 text-xs block mb-1">Rate Limit: {rateLimit} req/window</label>
        <input type="range" min={1} max={15} value={rateLimit} onChange={(e) => setRateLimit(+e.target.value)}
          className="w-full accent-[#7F56D9]" />
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={sendRequest}
          className="px-4 py-2 bg-[#7F56D9] hover:bg-[#9E77ED] text-white rounded-lg text-sm transition-colors">
          Send Request
        </button>
        <button onClick={sendBurst}
          className="px-4 py-2 bg-[#7F56D9]/30 hover:bg-[#7F56D9]/50 text-[#9E77ED] border border-[#7F56D9]/50 rounded-lg text-sm transition-colors">
          Send Burst (8)
        </button>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Window Usage</span>
          <span>{inWindow}/{rateLimit}</span>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-300 ${fillPct >= 100 ? 'bg-red-500' : fillPct >= 70 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
            style={{ width: `${fillPct}%` }} />
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-3 min-h-[120px]">
        <div className="text-xs text-gray-500 mb-2">Request Log (recent)</div>
        <div className="flex flex-wrap gap-1.5">
          {requests.slice(-24).map((r) => (
            <div key={r.id} className={`w-8 h-8 rounded flex items-center justify-center text-xs font-mono text-white/90 ${statusColor(r.status)} transition-all`}>
              {r.id}
            </div>
          ))}
          {requests.length === 0 && <span className="text-gray-500 text-xs">No requests yet</span>}
        </div>
      </div>

      <div className="flex gap-4 mt-3 text-xs">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Accepted</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-yellow-500" /> Queued</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-500" /> Rejected</span>
      </div>
    </div>
  );
}
