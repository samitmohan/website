'use client'

import { useState } from 'react'

type GameState = { x: number; y: number; health: number; coins: number }

const ACTIONS = ['Move Right', 'Move Up', 'Collect', 'Rest'] as const

function applyAction(state: GameState, action: string): GameState {
  const s = { ...state }
  if (action === 'Move Right') { s.x += 1; s.health -= 2 }
  if (action === 'Move Up') { s.y += 1; s.health -= 2 }
  if (action === 'Collect') { s.coins += 1; s.health -= 1 }
  if (action === 'Rest') { s.health = Math.min(100, s.health + 10) }
  return s
}

function predictAction(state: GameState, action: string): GameState {
  const s = { ...state }
  // The model has imperfect predictions - adds noise
  const noise = () => Math.random() > 0.6 ? 1 : 0
  if (action === 'Move Right') { s.x += 1; s.health -= 2 + noise() }
  if (action === 'Move Up') { s.y += 1; s.health -= 2 - noise() }
  if (action === 'Collect') { s.coins += 1 + noise(); s.health -= 1 }
  if (action === 'Rest') { s.health = Math.min(100, s.health + 10 - noise() * 3) }
  return s
}

function stateError(a: GameState, b: GameState): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.health - b.health) + Math.abs(a.coins - b.coins)
}

function StateBox({ label, state, color }: { label: string; state: GameState; color: string }) {
  return (
    <div className={`bg-black/30 rounded-lg p-3 border`} style={{ borderColor: color }}>
      <div className="text-xs font-medium mb-2" style={{ color }}>{label}</div>
      <div className="grid grid-cols-2 gap-1 text-sm font-mono">
        <span className="text-gray-500">x:</span><span className="text-gray-200">{state.x}</span>
        <span className="text-gray-500">y:</span><span className="text-gray-200">{state.y}</span>
        <span className="text-gray-500">hp:</span><span className="text-gray-200">{state.health}</span>
        <span className="text-gray-500">coins:</span><span className="text-gray-200">{state.coins}</span>
      </div>
    </div>
  )
}

export default function WorldModelViz() {
  const [actual, setActual] = useState<GameState>({ x: 0, y: 0, health: 100, coins: 0 })
  const [predicted, setPredicted] = useState<GameState | null>(null)
  const [lastAction, setLastAction] = useState<string | null>(null)
  const [errors, setErrors] = useState<number[]>([])
  const [step, setStep] = useState(0)

  const doAction = (action: string) => {
    const pred = predictAction(actual, action)
    const next = applyAction(actual, action)
    const err = stateError(pred, next)
    setPredicted(pred)
    setActual(next)
    setLastAction(action)
    setErrors(prev => [...prev.slice(-11), err])
    setStep(s => s + 1)
  }

  const reset = () => {
    setActual({ x: 0, y: 0, health: 100, coins: 0 })
    setPredicted(null)
    setLastAction(null)
    setErrors([])
    setStep(0)
  }

  const totalError = errors.reduce((a, b) => a + b, 0)
  const maxBar = Math.max(...errors, 1)

  return (
    <div className="p-6 bg-card rounded-xl border border-border">
      <h3 className="text-gray-300 text-lg font-semibold mb-1">World Model: Predict-Act-Compare</h3>
      <p className="text-gray-500 text-sm mb-4">Choose actions. The world model predicts the next state before the action executes.</p>

      <div className="flex gap-3 mb-4 flex-wrap">
        {ACTIONS.map(a => (
          <button key={a} onClick={() => doAction(a)}
            className="px-4 py-2 rounded-lg bg-[#7F56D9]/20 text-[#9E77ED] border border-[#7F56D9]/30 hover:bg-[#7F56D9]/40 text-sm font-medium transition-colors">
            {a}
          </button>
        ))}
        <button onClick={reset}
          className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 border border-border hover:bg-white/10 text-sm transition-colors ml-auto">
          Reset
        </button>
      </div>

      <div className="flex gap-4 mb-4 flex-wrap">
        <StateBox label="Actual State" state={actual} color="#22d3ee" />
        {predicted && <StateBox label="Model Predicted" state={predicted} color="#9E77ED" />}
        {lastAction && (
          <div className="bg-black/30 rounded-lg p-3 border border-border flex flex-col justify-center">
            <div className="text-gray-500 text-xs">Step {step}</div>
            <div className="text-gray-200 font-medium">{lastAction}</div>
            {errors.length > 0 && (
              <div className="text-yellow-400 text-sm mt-1">Error: {errors[errors.length - 1]}</div>
            )}
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div className="bg-black/20 rounded-lg p-3 border border-border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-xs">Prediction Error Over Time</span>
            <span className="text-gray-500 text-xs">Cumulative: {totalError}</span>
          </div>
          <div className="flex items-end gap-1 h-16">
            {errors.map((e, i) => (
              <div key={i} className="flex-1 rounded-t transition-all"
                style={{ height: `${(e / maxBar) * 100}%`, background: e > 1 ? '#f59e0b' : '#7F56D9' }} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
