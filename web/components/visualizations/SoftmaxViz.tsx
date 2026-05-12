'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, ArrowRight, Equal } from 'lucide-react'

export default function SoftmaxViz() {
  const [logits, setLogits] = useState([2.0, 1.0, 0.1])

  const classes = [
    { id: 0, label: 'Class A', color: '#6366f1' },
    { id: 1, label: 'Class B', color: '#f43f5e' },
    { id: 2, label: 'Class C', color: '#f59e0b' },
  ]

  const softmax = useMemo(() => {
    const max = Math.max(...logits)
    const exps = logits.map(z => Math.exp(z - max))
    const sum = exps.reduce((a, b) => a + b, 0)
    return exps.map(e => e / sum)
  }, [logits])

  const handleLogitChange = (index: number, val: number) => {
    const next = [...logits]
    next[index] = val
    setLogits(next)
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-violet-500/10 p-1.5 rounded-lg">
          <BarChart3 className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <h3 className="text-base font-bold">Softmax Function</h3>
          <p className="text-xs text-muted-foreground">Normalizing logits into probabilities</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 relative bg-muted/20 border-r border-border/50 p-6 flex flex-col justify-center">
          <div className="flex items-center justify-between gap-6 w-full">
            {/* Inputs */}
            <div className="flex-1 space-y-4">
              <h4 className="text-xs uppercase font-bold text-muted-foreground text-center mb-4">Raw Logits</h4>
              {logits.map((val, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-16 text-right">
                    <span className="text-xs font-bold text-muted-foreground block">{classes[i].label}</span>
                    <span className="text-xs font-mono font-bold" style={{ color: classes[i].color }}>{val.toFixed(1)}</span>
                  </div>
                  <div className="flex-1 h-8 bg-accent/30 rounded-lg relative flex items-center px-2">
                    <div className="absolute left-1/2 top-0 h-full w-px bg-accent/50 border-r border-dashed border-border" />
                    <motion.div
                      className="absolute h-1.5 rounded-full"
                      style={{ backgroundColor: classes[i].color }}
                      animate={{
                        left: val >= 0 ? '50%' : `${50 + (val / 5) * 50}%`,
                        width: `${(Math.abs(val) / 5) * 50}%`
                      }}
                    />
                    <motion.div
                      className="absolute w-3 h-3 bg-gray-200 rounded-full border-2 border-gray-300 shadow-sm z-10"
                      animate={{ left: `${50 + (val / 5) * 50}%` }}
                      style={{ marginLeft: '-6px' }}
                    />
                    <input
                      type="range"
                      min="-5" max="5" step="0.1"
                      value={val}
                      onChange={(e) => handleLogitChange(i, parseFloat(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-muted-foreground">
              <ArrowRight className="w-5 h-5" />
            </div>

            {/* Outputs */}
            <div className="flex-1 space-y-4">
              <h4 className="text-xs uppercase font-bold text-muted-foreground text-center mb-4">Probabilities (Sum=1)</h4>
              {softmax.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1 h-8 bg-muted/50 border border-border rounded-lg relative overflow-hidden flex items-center">
                    <motion.div
                      className="h-full opacity-90"
                      initial={false}
                      animate={{ width: `${p * 100}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 20 }}
                      style={{
                        background: `linear-gradient(90deg, ${classes[i].color}cc, ${classes[i].color})`
                      }}
                    />
                  </div>
                  <div className="w-12">
                    <span className="text-xs font-mono font-bold text-muted-foreground">{(p * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dashboard */}
        <div className="bg-card/50 p-4 border-l border-border/50 flex flex-col gap-4">
          <div className="bg-muted border border-border p-2.5 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-accent p-1.5 rounded-lg">
                <Equal className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div>
                <h4 className="text-xs uppercase font-bold text-muted-foreground leading-none mb-0.5">Total Probability</h4>
                <p className="text-xs text-muted-foreground font-medium">Always sums to 1</p>
              </div>
            </div>
            <span className="text-lg font-mono font-bold px-2">1.00</span>
          </div>

          <div className="space-y-3">
            <label className="text-xs uppercase font-bold text-muted-foreground mb-2 block">Distribution</label>
            {softmax.map((p, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{classes[i].label}</span>
                  <span className="font-mono text-muted-foreground">{p.toFixed(3)}</span>
                </div>
                <div className="w-full h-1.5 bg-accent rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: classes[i].color }}
                    animate={{ width: `${p * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto bg-violet-500/5 border border-violet-500/10 p-3 rounded-lg">
            <p className="text-xs text-violet-300 leading-relaxed italic">
              Increasing one logit forces others to shrink. Softmax creates competition between classes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
