'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Type } from 'lucide-react'

export default function BPETokenizerViz() {
  const [text, setText] = useState('low low low lowest newer wider')
  const [numMerges, setNumMerges] = useState(3)

  const result = useMemo(() => {
    // Split into words, each word becomes char array
    const words = text.split(/\s+/).filter(Boolean)
    const wordTokens: string[][] = words.map(w => [...w])
    const merges: { pair: [string, string]; merged: string; freq: number }[] = []

    // Deep copy for mutation
    let current = wordTokens.map(w => [...w])

    for (let step = 0; step < numMerges; step++) {
      // Count pairs
      const pairCounts: Record<string, number> = {}
      for (const tokens of current) {
        for (let i = 0; i < tokens.length - 1; i++) {
          const key = `${tokens[i]}|||${tokens[i + 1]}`
          pairCounts[key] = (pairCounts[key] || 0) + 1
        }
      }

      if (Object.keys(pairCounts).length === 0) break

      // Find most frequent
      let bestPair = ''
      let bestCount = 0
      for (const [pair, count] of Object.entries(pairCounts)) {
        if (count > bestCount) {
          bestPair = pair
          bestCount = count
        }
      }

      const [a, b] = bestPair.split('|||')
      const merged = a + b
      merges.push({ pair: [a, b], merged, freq: bestCount })

      // Apply merge
      current = current.map(tokens => {
        const newTokens: string[] = []
        let i = 0
        while (i < tokens.length) {
          if (i < tokens.length - 1 && tokens[i] === a && tokens[i + 1] === b) {
            newTokens.push(merged)
            i += 2
          } else {
            newTokens.push(tokens[i])
            i++
          }
        }
        return newTokens
      })
    }

    return { current, merges, original: wordTokens }
  }, [text, numMerges])

  const tokenColors = [
    'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    'bg-rose-500/20 text-rose-300 border-rose-500/30',
    'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    'bg-purple-500/20 text-purple-300 border-purple-500/30',
  ]

  // Build a vocab of unique tokens for coloring
  const vocab = [...new Set(result.current.flat())]

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-cyan-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-cyan-500/10 p-1.5 rounded-lg">
          <Type className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-base font-bold">BPE Tokenizer</h3>
          <p className="text-xs text-muted-foreground">Byte Pair Encoding merge visualization</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Input */}
        <div>
          <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">Input Text</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm font-mono"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">
            Merges: {numMerges}
          </label>
          <input
            type="range" min={0} max={10} step={1}
            value={numMerges}
            onChange={(e) => setNumMerges(parseInt(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>

        {/* Merge log */}
        {result.merges.length > 0 && (
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-2 block">Merge Rules</label>
            <div className="space-y-1">
              <AnimatePresence>
                {result.merges.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-xs font-mono bg-muted/50 rounded-lg px-3 py-1.5"
                  >
                    <span className="text-muted-foreground">{i + 1}.</span>
                    <span className="text-cyan-400">("{m.pair[0]}", "{m.pair[1]}")</span>
                    <span className="text-muted-foreground">-&gt;</span>
                    <span className="text-emerald-400">"{m.merged}"</span>
                    <span className="text-muted-foreground ml-auto">x{m.freq}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Original tokens */}
        <div>
          <label className="text-xs uppercase font-bold text-muted-foreground mb-2 block">
            Before ({result.original.flat().length} tokens)
          </label>
          <div className="flex flex-wrap gap-1">
            {result.original.map((word, wi) => (
              <div key={wi} className="flex gap-px">
                {word.map((ch, ci) => (
                  <span key={ci} className="text-xs font-mono px-1.5 py-0.5 rounded border bg-muted/50 border-border text-muted-foreground">
                    {ch}
                  </span>
                ))}
                {wi < result.original.length - 1 && <span className="text-muted-foreground mx-1">|</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Result tokens */}
        <div>
          <label className="text-xs uppercase font-bold text-muted-foreground mb-2 block">
            After ({result.current.flat().length} tokens)
          </label>
          <div className="flex flex-wrap gap-1">
            {result.current.map((word, wi) => (
              <div key={wi} className="flex gap-px">
                {word.map((tok, ti) => {
                  const colorIdx = vocab.indexOf(tok) % tokenColors.length
                  return (
                    <motion.span
                      key={ti}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`text-xs font-mono px-1.5 py-0.5 rounded border ${tokenColors[colorIdx]}`}
                    >
                      {tok}
                    </motion.span>
                  )
                })}
                {wi < result.current.length - 1 && <span className="text-muted-foreground mx-1">|</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Vocab */}
        <div className="bg-cyan-500/5 border border-cyan-500/10 p-3 rounded-lg">
          <div className="text-xs text-cyan-300 leading-relaxed">
            <span className="font-bold">Vocabulary size: {vocab.length}</span> - BPE starts with characters and merges frequent pairs into subword tokens. GPT-4 uses ~100K tokens.
          </div>
        </div>
      </div>
    </div>
  )
}
