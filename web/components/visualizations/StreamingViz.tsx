'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

const SAMPLE_TEXT = "The transformer architecture processes input sequences through self-attention mechanisms, enabling parallel computation across all positions. Each layer refines the representation by attending to relevant context, producing increasingly abstract features that capture long-range dependencies in the data.";

type BufferMode = 'character' | 'word' | 'sentence';

export default function StreamingViz() {
  const [mode, setMode] = useState<BufferMode>('word');
  const [displayed, setDisplayed] = useState('');
  const [buffer, setBuffer] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [tokensPerSec, setTokensPerSec] = useState(0);
  const outputRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    setDisplayed('');
    setBuffer('');
    setCharIndex(0);
    setIsStreaming(false);
    setTokensPerSec(0);
  }, []);

  const shouldFlush = useCallback((buf: string, m: BufferMode): boolean => {
    if (m === 'character') return buf.length >= 1;
    if (m === 'word') return buf.includes(' ') || buf.includes('\n');
    if (m === 'sentence') return buf.includes('.') || buf.includes('!') || buf.includes('?');
    return false;
  }, []);

  useEffect(() => {
    if (!isStreaming || charIndex >= SAMPLE_TEXT.length) {
      if (charIndex >= SAMPLE_TEXT.length && buffer.length > 0) {
        setDisplayed(d => d + buffer);
        setBuffer('');
        setIsStreaming(false);
      }
      return;
    }

    const speed = mode === 'character' ? 30 : mode === 'word' ? 20 : 15;
    const interval = setInterval(() => {
      setCharIndex(prev => {
        const next = prev + 1;
        if (next > SAMPLE_TEXT.length) {
          setIsStreaming(false);
          return prev;
        }
        const newChar = SAMPLE_TEXT[prev];
        setBuffer(b => {
          const newBuf = b + newChar;
          if (shouldFlush(newBuf, mode)) {
            setDisplayed(d => d + newBuf);
            setTokensPerSec(Math.floor(Math.random() * 20) + 30);
            return '';
          }
          return newBuf;
        });
        return next;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [isStreaming, charIndex, mode, buffer, shouldFlush]);

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [displayed]);

  const progress = SAMPLE_TEXT.length > 0 ? (charIndex / SAMPLE_TEXT.length) * 100 : 0;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-200">Token Streaming</h3>
          <p className="text-xs text-gray-400">Buffer modes control when tokens flush to the client</p>
        </div>
        <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
          {(['character', 'word', 'sentence'] as const).map(m => (
            <button key={m} onClick={() => { reset(); setMode(m); }}
              className={`text-xs px-2 py-1 rounded-md font-medium transition ${mode === m ? 'bg-[#7F56D9] text-white' : 'text-gray-400 hover:text-gray-200'}`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Output area */}
        <div ref={outputRef} className="bg-white/5 border border-border rounded-lg p-3 h-32 overflow-y-auto font-mono text-xs text-gray-300 leading-relaxed">
          {displayed}
          {buffer && <span className="text-[#9E77ED] bg-[#7F56D9]/20 px-0.5 rounded">{buffer}</span>}
          {isStreaming && <span className="inline-block w-1.5 h-3.5 bg-[#9E77ED] ml-0.5 animate-pulse" />}
          {!isStreaming && charIndex === 0 && <span className="text-gray-600 italic">Press Start to begin streaming...</span>}
        </div>

        {/* Buffer indicator */}
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-400 w-14">Buffer:</div>
          <div className="flex-1 bg-white/5 border border-border rounded h-6 px-2 flex items-center">
            <span className="text-xs font-mono text-[#9E77ED]">{buffer || '(empty)'}</span>
          </div>
          <div className="text-sm text-gray-500">{buffer.length} chars</div>
        </div>

        {/* Progress */}
        <div className="w-full bg-white/10 rounded-full h-1.5">
          <div className="h-1.5 rounded-full bg-[#7F56D9] transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => { reset(); setIsStreaming(true); }}
            className="text-xs px-3 py-1.5 bg-[#7F56D9]/20 border border-[#7F56D9]/40 text-[#9E77ED] rounded-lg hover:bg-[#7F56D9]/30 transition">
            {charIndex > 0 ? 'Restart' : 'Start'}
          </button>
          <button onClick={reset}
            className="text-xs px-3 py-1.5 border border-border text-gray-400 rounded-lg hover:bg-white/5 transition">
            Reset
          </button>
          <div className="ml-auto text-xs text-gray-500">{charIndex}/{SAMPLE_TEXT.length} chars</div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/5 border border-border p-2 rounded-lg">
            <div className="text-xs text-gray-400">Mode</div>
            <div className="text-xs font-mono font-bold text-[#9E77ED]">{mode}</div>
          </div>
          <div className="bg-white/5 border border-border p-2 rounded-lg">
            <div className="text-xs text-gray-400">Tokens/sec</div>
            <div className="text-xs font-mono font-bold text-gray-300">{isStreaming ? tokensPerSec : '--'}</div>
          </div>
          <div className="bg-white/5 border border-border p-2 rounded-lg">
            <div className="text-xs text-gray-400">Latency Feel</div>
            <div className="text-xs font-mono font-bold text-gray-300">{mode === 'character' ? 'Instant' : mode === 'word' ? 'Smooth' : 'Chunky'}</div>
          </div>
        </div>

        <div className="bg-[#7F56D9]/5 border border-[#7F56D9]/10 p-3 rounded-lg">
          <p className="text-xs text-[#B692F6] leading-relaxed">
            {mode === 'character' ? 'Character-level streaming sends each character as generated. Lowest perceived latency, highest network overhead.'
              : mode === 'word' ? 'Word-level buffering accumulates characters until a word boundary (space), then flushes. Good balance of responsiveness and efficiency.'
              : 'Sentence-level buffering waits for sentence-ending punctuation before flushing. Higher latency but fewer network calls.'}
          </p>
        </div>
      </div>
    </div>
  );
}
