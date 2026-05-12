'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Scale, ThumbsUp, ThumbsDown } from 'lucide-react'

const PREFERRED_TEXT = 'The capital of France is Paris, located along the Seine river.'
const REJECTED_TEXT = 'France capital is maybe Paris I think, or could be Lyon not sure.'

export default function DPOPreferenceViz() {
  const [beta, setBeta] = useState(0.1)

  // Simulated log probabilities
  const policyLogProbPreferred = -1.2
  const policyLogProbRejected = -2.8
  const refLogProbPreferred = -1.8
  const refLogProbRejected = -2.5

  const { logRatioPreferred, logRatioRejected, logRatioDiff, loss, rewardPreferred, rewardRejected } = useMemo(() => {
    const lrP = policyLogProbPreferred - refLogProbPreferred
    const lrR = policyLogProbRejected - refLogProbRejected
    const diff = lrP - lrR
    const sigmoid = 1 / (1 + Math.exp(beta * diff))
    const dpoLoss = -Math.log(1 - sigmoid + 1e-10)
    const rP = beta * (policyLogProbPreferred - refLogProbPreferred)
    const rR = beta * (policyLogProbRejected - refLogProbRejected)
    return { logRatioPreferred: lrP, logRatioRejected: lrR, logRatioDiff: diff, loss: dpoLoss, rewardPreferred: rP, rewardRejected: rR }
  }, [beta])

  // Loss curve data across beta values
  const lossCurve = useMemo(() => {
    const points: { b: number; l: number }[] = []
    for (let b = 0.01; b <= 0.5; b += 0.01) {
      const diff = (policyLogProbPreferred - refLogProbPreferred) - (policyLogProbRejected - refLogProbRejected)
      const sigmoid = 1 / (1 + Math.exp(b * diff))
      points.push({ b, l: -Math.log(1 - sigmoid + 1e-10) })
    }
    return points
  }, [])

  const curveW = 280
  const curveH = 120
  const padL = 36
  const padB = 20
  const padT = 10
  const padR = 10
  const chartW = curveW - padL - padR
  const chartH = curveH - padT - padB
  const maxLoss = Math.max(...lossCurve.map(p => p.l), 0.5)

  const xScale = (b: number) => padL + ((b - 0.01) / 0.49) * chartW
  const yScale = (l: number) => padT + chartH - (l / maxLoss) * chartH

  const curvePath = lossCurve.map((p, i) => `${i === 0 ? 'M' : 'L'}${xScale(p.b).toFixed(1)},${yScale(p.l).toFixed(1)}`).join(' ')

  const barMaxW = 180

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-orange-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-orange-500/10 p-1.5 rounded-lg">
          <Scale className="w-4 h-4 text-orange-400" />
        </div>
        <div>
          <h3 className="text-base font-bold">DPO Preference Optimization</h3>
          <p className="text-xs text-muted-foreground">Direct Preference Optimization: learning from preferred vs rejected responses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 flex flex-col gap-4">
          {/* Response comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <ThumbsUp className="w-3 h-3 text-emerald-400" />
                <span className="text-xs uppercase font-bold text-emerald-400">Preferred</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{PREFERRED_TEXT}</p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-14">Policy:</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-500/60 rounded-full"
                      animate={{ width: `${Math.exp(policyLogProbPreferred) * barMaxW}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono text-emerald-400">{policyLogProbPreferred.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-14">Ref:</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-zinc-500/60 rounded-full"
                      animate={{ width: `${Math.exp(refLogProbPreferred) * barMaxW}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono text-zinc-400">{refLogProbPreferred.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <ThumbsDown className="w-3 h-3 text-rose-400" />
                <span className="text-xs uppercase font-bold text-rose-400">Rejected</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{REJECTED_TEXT}</p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-14">Policy:</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-rose-500/60 rounded-full"
                      animate={{ width: `${Math.exp(policyLogProbRejected) * barMaxW}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono text-rose-400">{policyLogProbRejected.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-14">Ref:</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-zinc-500/60 rounded-full"
                      animate={{ width: `${Math.exp(refLogProbRejected) * barMaxW}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono text-zinc-400">{refLogProbRejected.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Loss curve */}
          <div className="bg-muted/50 border border-border rounded-xl p-3">
            <div className="text-xs uppercase font-bold text-muted-foreground mb-2">DPO Loss vs Beta</div>
            <svg viewBox={`0 0 ${curveW} ${curveH}`} className="w-full h-auto max-w-sm">
              {/* Grid */}
              {[0, 0.1, 0.2, 0.3, 0.4].map(v => (
                <g key={v}>
                  <line x1={padL} y1={yScale(v)} x2={curveW - padR} y2={yScale(v)} stroke="currentColor" strokeOpacity={0.06} />
                  <text x={padL - 4} y={yScale(v) + 3} textAnchor="end" fill="currentColor" fillOpacity={0.3} fontSize={7}>{v.toFixed(1)}</text>
                </g>
              ))}
              <path d={curvePath} fill="none" stroke="#fb923c" strokeWidth={2} />
              {/* Current beta marker */}
              <motion.circle
                cx={xScale(beta)}
                cy={yScale(loss)}
                r={5}
                fill="#fb923c"
                stroke="#0f172a"
                strokeWidth={2}
                animate={{ cx: xScale(beta), cy: yScale(loss) }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              />
              <text x={curveW / 2} y={curveH - 2} textAnchor="middle" fill="currentColor" fillOpacity={0.4} fontSize={8}>beta</text>
            </svg>
          </div>
        </div>

        {/* Dashboard */}
        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">
              Beta (KL penalty): {beta.toFixed(2)}
            </label>
            <input
              type="range" min={0.01} max={0.5} step={0.01}
              value={beta}
              onChange={(e) => setBeta(parseFloat(e.target.value))}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Weak (0.01)</span>
              <span>Strong (0.5)</span>
            </div>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-1.5">
            <div className="text-xs uppercase font-bold text-muted-foreground">Log-Ratio Computation</div>
            <div className="text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">lr(preferred)</span>
                <span className="text-emerald-400">{logRatioPreferred.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">lr(rejected)</span>
                <span className="text-rose-400">{logRatioRejected.toFixed(3)}</span>
              </div>
              <div className="border-t border-border pt-1 flex justify-between">
                <span className="text-muted-foreground">lr_diff</span>
                <span className="text-orange-400">{logRatioDiff.toFixed(3)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted border border-border p-2 rounded-xl">
              <div className="text-xs uppercase font-bold text-muted-foreground">DPO Loss</div>
              <div className="text-sm font-mono font-bold text-orange-400">{loss.toFixed(4)}</div>
            </div>
            <div className="bg-muted border border-border p-2 rounded-xl">
              <div className="text-xs uppercase font-bold text-muted-foreground">Reward Gap</div>
              <div className="text-sm font-mono font-bold text-emerald-400">{(rewardPreferred - rewardRejected).toFixed(3)}</div>
            </div>
          </div>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-1">
            <div className="text-xs uppercase font-bold text-muted-foreground">Implicit Rewards</div>
            <div className="text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-emerald-400">r(preferred)</span>
                <span>{rewardPreferred.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-rose-400">r(rejected)</span>
                <span>{rewardRejected.toFixed(3)}</span>
              </div>
            </div>
          </div>

          <div className="mt-auto bg-orange-500/5 border border-orange-500/10 p-3 rounded-lg">
            <p className="text-xs text-orange-300 leading-relaxed italic">
              {beta < 0.1
                ? "Low beta: weak KL constraint. The policy diverges freely from the reference model."
                : beta > 0.3
                  ? "High beta: strong KL penalty. The policy stays close to the reference, limiting alignment gains."
                  : "DPO skips reward modeling. It directly optimizes the policy using preference pairs and a KL-constrained objective."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
