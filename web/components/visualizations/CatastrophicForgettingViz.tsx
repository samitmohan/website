'use client'

import { useState } from 'react'

type Mode = 'before' | 'naive' | 'lora'

const SKILLS = ['Coding', 'Math', 'Language', 'Reasoning', 'Domain']

const PROFILES: Record<Mode, { label: string; color: string; fill: string; values: number[] }> = {
  before: {
    label: 'Before Fine-tuning',
    color: 'rgb(96, 165, 250)',
    fill: 'rgba(96, 165, 250, 0.15)',
    values: [0.75, 0.70, 0.80, 0.72, 0.40],
  },
  naive: {
    label: 'After Naive Fine-tuning',
    color: 'rgb(248, 113, 113)',
    fill: 'rgba(248, 113, 113, 0.15)',
    values: [0.35, 0.30, 0.40, 0.28, 0.90],
  },
  lora: {
    label: 'After LoRA Fine-tuning',
    color: 'rgb(74, 222, 128)',
    fill: 'rgba(74, 222, 128, 0.15)',
    values: [0.72, 0.68, 0.77, 0.70, 0.82],
  },
}

function polarToXY(angle: number, radius: number, cx: number, cy: number): [number, number] {
  const rad = (angle - 90) * (Math.PI / 180)
  return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)]
}

function polygonPoints(values: number[], cx: number, cy: number, maxR: number): string {
  const step = 360 / values.length
  return values
    .map((v, i) => {
      const [x, y] = polarToXY(i * step, v * maxR, cx, cy)
      return `${x},${y}`
    })
    .join(' ')
}

export default function CatastrophicForgettingViz() {
  const [mode, setMode] = useState<Mode>('before')
  const [showOverlay, setShowOverlay] = useState(false)

  const cx = 150
  const cy = 150
  const maxR = 110
  const step = 360 / SKILLS.length
  const profile = PROFILES[mode]

  const modeOrder: Mode[] = ['before', 'naive', 'lora']

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-sky-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-sky-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" /><path d="M12 8v4l3 3" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Catastrophic Forgetting</h3>
          <p className="text-xs text-muted-foreground">Naive fine-tuning destroys general capabilities; LoRA preserves them</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 flex flex-col items-center">
          <svg viewBox="0 0 300 300" className="w-full h-auto max-w-sm">
            {/* Grid rings */}
            {[0.25, 0.5, 0.75, 1.0].map(r => (
              <circle
                key={r}
                cx={cx} cy={cy} r={r * maxR}
                fill="none" stroke="currentColor" strokeOpacity={0.08} strokeWidth={0.5}
              />
            ))}

            {/* Axis lines and labels */}
            {SKILLS.map((skill, i) => {
              const angle = i * step
              const [lx, ly] = polarToXY(angle, maxR + 16, cx, cy)
              const [ex, ey] = polarToXY(angle, maxR, cx, cy)
              return (
                <g key={skill}>
                  <line x1={cx} y1={cy} x2={ex} y2={ey} stroke="currentColor" strokeOpacity={0.1} strokeWidth={0.5} />
                  <text
                    x={lx} y={ly}
                    textAnchor="middle" dominantBaseline="middle"
                    fill="currentColor" fillOpacity={0.6} fontSize={9} fontWeight="bold"
                  >
                    {skill}
                  </text>
                </g>
              )
            })}

            {/* Overlay: show all profiles */}
            {showOverlay && modeOrder.filter(m => m !== mode).map(m => (
              <polygon
                key={m}
                points={polygonPoints(PROFILES[m].values, cx, cy, maxR)}
                fill={PROFILES[m].fill}
                stroke={PROFILES[m].color}
                strokeWidth={1}
                strokeDasharray="4 2"
                opacity={0.5}
              />
            ))}

            {/* Active profile polygon */}
            <polygon
              points={polygonPoints(profile.values, cx, cy, maxR)}
              fill={profile.fill}
              stroke={profile.color}
              strokeWidth={2}
              className="transition-all duration-500"
            />

            {/* Value dots */}
            {profile.values.map((v, i) => {
              const [x, y] = polarToXY(i * step, v * maxR, cx, cy)
              return (
                <circle
                  key={i} cx={x} cy={y} r={3.5}
                  fill={profile.color} stroke="black" strokeWidth={1}
                  className="transition-all duration-500"
                />
              )
            })}

            {/* Value labels */}
            {profile.values.map((v, i) => {
              const [x, y] = polarToXY(i * step, v * maxR + 10, cx, cy)
              return (
                <text
                  key={`val-${i}`}
                  x={x} y={y}
                  textAnchor="middle" dominantBaseline="middle"
                  fill={profile.color} fontSize={8} fontWeight="bold" fontFamily="monospace"
                >
                  {(v * 100).toFixed(0)}%
                </text>
              )
            })}
          </svg>
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div>
            <div className="text-xs uppercase font-bold text-muted-foreground mb-2">Fine-tuning Method</div>
            <div className="flex flex-col gap-1.5">
              {modeOrder.map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`text-xs px-3 py-2 rounded-lg border transition text-left ${
                    mode === m
                      ? `border-current bg-current/10`
                      : 'border-border text-muted-foreground hover:border-current/30'
                  }`}
                  style={{ color: mode === m ? PROFILES[m].color : undefined }}
                >
                  {PROFILES[m].label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition ${
              showOverlay ? 'bg-sky-500/20 border-sky-500/40 text-sky-300' : 'border-border text-muted-foreground'
            }`}
          >
            {showOverlay ? 'Hide Comparison' : 'Overlay All'}
          </button>

          <div className="bg-muted border border-border p-3 rounded-xl space-y-2">
            <div className="text-xs uppercase font-bold text-muted-foreground">Skill Scores</div>
            <div className="space-y-1.5">
              {SKILLS.map((skill, i) => {
                const val = profile.values[i]
                const before = PROFILES.before.values[i]
                const diff = val - before
                return (
                  <div key={skill}>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{skill}</span>
                      <span className="font-mono" style={{ color: profile.color }}>
                        {(val * 100).toFixed(0)}%
                        {mode !== 'before' && (
                          <span className={diff >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {' '}{diff >= 0 ? '+' : ''}{(diff * 100).toFixed(0)}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-accent rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${val * 100}%`, backgroundColor: profile.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-auto bg-sky-500/5 border border-sky-500/10 p-3 rounded-lg">
            <p className="text-xs text-sky-300 leading-relaxed italic">
              {mode === 'before' && 'The base model has balanced capabilities across all skills. Domain knowledge is the weakest area - fine-tuning targets this.'}
              {mode === 'naive' && 'Full fine-tuning boosted Domain Knowledge to 90% but collapsed other skills. Coding dropped from 75% to 35%. The model "forgot" its general abilities.'}
              {mode === 'lora' && 'LoRA fine-tuning improved Domain Knowledge to 82% while preserving other skills within 3% of the original. The frozen base weights retain general knowledge.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}