'use client'

import { useState } from 'react'

interface TreeNode {
  id: string
  label: string
  type: 'decision' | 'action' | 'output'
  color: string
  children?: { label: string; nodeId: string }[]
  description: string
}

const NODES: Record<string, TreeNode> = {
  start: { id: 'start', label: 'Need Retrieval?', type: 'decision', color: '#a78bfa', children: [
    { label: 'Yes', nodeId: 'retrieve' }, { label: 'No', nodeId: 'direct' },
  ], description: 'Model decides if external knowledge is needed for this query' },
  retrieve: { id: 'retrieve', label: 'Retrieve Docs', type: 'action', color: '#38bdf8', children: [
    { label: 'done', nodeId: 'grade' },
  ], description: 'Fetch top-K documents from vector store using query embedding' },
  grade: { id: 'grade', label: 'Relevant?', type: 'decision', color: '#fbbf24', children: [
    { label: 'Yes', nodeId: 'generate' }, { label: 'Partial', nodeId: 'generate_partial' },
  ], description: 'Grade each retrieved document for relevance to the query' },
  generate: { id: 'generate', label: 'Generate + Cite', type: 'action', color: '#34d399', children: [
    { label: 'done', nodeId: 'assess' },
  ], description: 'Generate answer grounded in retrieved documents with inline citations' },
  generate_partial: { id: 'generate_partial', label: 'Generate (partial)', type: 'action', color: '#fb923c', children: [
    { label: 'done', nodeId: 'assess' },
  ], description: 'Generate with available context, flag low-confidence sections' },
  assess: { id: 'assess', label: 'Self-Assess', type: 'decision', color: '#ec4899', children: [
    { label: 'Supported', nodeId: 'output_good' }, { label: 'Unsupported', nodeId: 'output_warn' },
  ], description: 'Check if generated claims are supported by retrieved evidence' },
  direct: { id: 'direct', label: 'Generate Direct', type: 'action', color: '#6366f1', children: [
    { label: 'done', nodeId: 'output_direct' },
  ], description: 'Answer from parametric knowledge - no retrieval needed' },
  output_good: { id: 'output_good', label: 'Output (verified)', type: 'output', color: '#34d399', children: [], description: 'All claims supported by evidence - high confidence answer' },
  output_warn: { id: 'output_warn', label: 'Output (flagged)', type: 'output', color: '#f87171', children: [], description: 'Some claims lack evidence support - needs human review' },
  output_direct: { id: 'output_direct', label: 'Output (no RAG)', type: 'output', color: '#818cf8', children: [], description: 'Answered from model knowledge without retrieval' },
}

export default function SelfRAGViz() {
  const [path, setPath] = useState<string[]>(['start'])
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  const currentId = path[path.length - 1]
  const currentNode = NODES[currentId]

  const handleChoice = (nodeId: string) => {
    setPath(prev => [...prev, nodeId])
  }

  const handleReset = () => setPath(['start'])

  const nodeShape = (node: TreeNode, isActive: boolean, isCurrent: boolean) => {
    const baseStyle = {
      borderColor: isActive ? `${node.color}66` : 'rgba(255,255,255,0.08)',
      backgroundColor: isCurrent ? `${node.color}15` : isActive ? `${node.color}08` : 'transparent',
      color: isActive ? node.color : 'rgba(255,255,255,0.3)',
    }
    if (node.type === 'decision') return { ...baseStyle, borderRadius: '0.75rem', borderWidth: '2px', borderStyle: 'solid' as const }
    if (node.type === 'output') return { ...baseStyle, borderRadius: '1rem', borderWidth: '2px', borderStyle: 'dashed' as const }
    return { ...baseStyle, borderRadius: '0.5rem', borderWidth: '1.5px', borderStyle: 'solid' as const }
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-violet-900/10">
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted to-card flex items-center gap-3">
        <div className="bg-violet-500/10 p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold">Self-RAG Decision Tree</h3>
          <p className="text-xs text-muted-foreground">Model self-reflects at each step: retrieve, grade, generate, assess</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-muted/20 border-r border-border/50 p-4 space-y-3">
          {/* Path visualization */}
          <div className="flex flex-wrap items-center gap-2">
            {path.map((nodeId, i) => {
              const node = NODES[nodeId]
              const isLast = i === path.length - 1
              return (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="px-3 py-1.5 text-xs font-bold transition-all duration-300 cursor-default"
                    style={nodeShape(node, true, isLast)}
                    onMouseEnter={() => setHoveredNode(nodeId)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {node.type === 'decision' && '? '}{node.label}
                  </div>
                  {!isLast && (
                    <svg className="w-5 h-3 shrink-0" viewBox="0 0 20 12">
                      <path d="M2 6h12m0 0l-3-3m3 3l-3 3" stroke={node.color} strokeWidth="1.5" fill="none" strokeOpacity="0.5" />
                    </svg>
                  )}
                </div>
              )
            })}
          </div>

          {/* All nodes overview */}
          <div className="text-sm uppercase font-bold text-muted-foreground mt-2">All Nodes</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {Object.values(NODES).map(node => {
              const isInPath = path.includes(node.id)
              return (
                <div
                  key={node.id}
                  className="px-2 py-1.5 text-sm font-mono transition-all duration-300"
                  style={nodeShape(node, isInPath, node.id === currentId)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <span className="opacity-50 mr-1">{node.type === 'decision' ? '?' : node.type === 'output' ? '*' : '>'}</span>
                  {node.label}
                </div>
              )
            })}
          </div>

          {/* Description */}
          {hoveredNode && (
            <div className="bg-muted/40 border border-border rounded-lg p-2 text-xs text-foreground/60 transition-all duration-200">
              <span className="font-bold" style={{ color: NODES[hoveredNode].color }}>{NODES[hoveredNode].label}:</span>{' '}
              {NODES[hoveredNode].description}
            </div>
          )}
        </div>

        <div className="bg-card/50 p-4 flex flex-col gap-4">
          <div className="bg-muted border border-border p-3 rounded-xl space-y-2">
            <div className="text-xs uppercase font-bold text-muted-foreground">Current Node</div>
            <div className="text-sm font-mono" style={{ color: currentNode.color }}>{currentNode.label}</div>
            <div className="text-xs text-muted-foreground">{currentNode.description}</div>
          </div>

          {/* Choice buttons */}
          {currentNode.children && currentNode.children.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs uppercase font-bold text-muted-foreground">Choose Path</div>
              {currentNode.children.map(child => (
                <button
                  key={child.nodeId}
                  onClick={() => handleChoice(child.nodeId)}
                  className="w-full text-left text-sm px-3 py-2 rounded-lg border transition-all duration-200 hover:bg-accent"
                  style={{ borderColor: `${NODES[child.nodeId].color}33`, color: NODES[child.nodeId].color }}
                >
                  {child.label} → {NODES[child.nodeId].label}
                </button>
              ))}
            </div>
          )}

          <button onClick={handleReset} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition">
            Reset Tree
          </button>

          <div className="mt-auto bg-violet-500/5 border border-violet-500/10 p-3 rounded-lg">
            <p className="text-xs text-violet-300 leading-relaxed italic">
              Self-RAG adds reflection tokens at each step. The model decides when to retrieve, grades relevance, and self-assesses whether its output is supported by evidence.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
