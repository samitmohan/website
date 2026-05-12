'use client'

import { useState } from 'react'

interface ToolDef {
  name: string
  description: string
  args: Record<string, string>
  result: string
}

interface Request { text: string; toolIdx: number; userArgs: Record<string, string> }

const TOOLS: ToolDef[] = [
  { name: 'web_search', description: 'Search the web for current information', args: { query: 'string', max_results: 'number' }, result: '[ {title, url, snippet}, ... ]' },
  { name: 'read_file', description: 'Read contents of a local file', args: { path: 'string', encoding: 'string' }, result: '"file contents as string"' },
  { name: 'run_sql', description: 'Execute SQL against the database', args: { query: 'string', database: 'string' }, result: '[ {col1: val, col2: val}, ... ]' },
  { name: 'send_email', description: 'Send an email message', args: { to: 'string', subject: 'string', body: 'string' }, result: '{ "status": "sent", "id": "msg_xxx" }' },
]

const REQUESTS: Request[] = [
  { text: 'What is the weather in Tokyo?', toolIdx: 0, userArgs: { query: 'weather Tokyo today', max_results: '3' } },
  { text: 'Show me the contents of config.yaml', toolIdx: 1, userArgs: { path: '/app/config.yaml', encoding: 'utf-8' } },
  { text: 'How many users signed up this week?', toolIdx: 2, userArgs: { query: "SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days'", database: 'analytics' } },
  { text: 'Email the report to the team lead', toolIdx: 3, userArgs: { to: 'lead@company.com', subject: 'Weekly Report', body: 'Attached...' } },
]

const STEPS = ['User Request', 'LLM Reasoning', 'Tool Selection', 'Execution', 'Response']

export default function MCPToolViz() {
  const [selectedReq, setSelectedReq] = useState(0)
  const [activeStep, setActiveStep] = useState(0)

  const req = REQUESTS[selectedReq]
  const tool = TOOLS[req.toolIdx]

  return (
    <div className="p-6 bg-card rounded-xl border border-border max-w-2xl mx-auto">
      <h3 className="text-gray-300 font-semibold text-lg mb-1">MCP Tool-Calling Flow</h3>
      <p className="text-gray-500 text-sm mb-4">Select a request, then step through the tool-calling pipeline.</p>

      <div className="grid grid-cols-2 gap-2 mb-5">
        {REQUESTS.map((r, i) => (
          <button
            key={i}
            onClick={() => { setSelectedReq(i); setActiveStep(0) }}
            className={`text-left text-sm px-3 py-2 rounded-lg border transition-colors ${
              selectedReq === i ? 'border-[#7F56D9] bg-[#7F56D9]/10 text-white' : 'border-border text-gray-400 hover:bg-white/5'
            }`}
          >
            {r.text}
          </button>
        ))}
      </div>

      {/* Pipeline steps */}
      <div className="flex items-center gap-1 mb-5">
        {STEPS.map((step, i) => (
          <div key={i} className="flex items-center gap-1">
            <button
              onClick={() => setActiveStep(i)}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                activeStep >= i ? 'bg-[#7F56D9] text-white' : 'bg-white/5 text-gray-500'
              }`}
            >
              {step}
            </button>
            {i < STEPS.length - 1 && <span className="text-gray-600 text-xs">-&gt;</span>}
          </div>
        ))}
      </div>

      {/* Step detail */}
      <div className="rounded-lg border border-border bg-white/[0.02] p-4 text-sm min-h-[120px]">
        {activeStep === 0 && (
          <div><span className="text-gray-500">User says:</span><p className="text-gray-200 mt-1">&quot;{req.text}&quot;</p></div>
        )}
        {activeStep === 1 && (
          <div>
            <span className="text-gray-500">LLM analyzes intent and matches against {TOOLS.length} available tools:</span>
            <div className="mt-2 space-y-1">
              {TOOLS.map((t, i) => (
                <div key={i} className={`px-2 py-1 rounded text-xs ${i === req.toolIdx ? 'bg-[#7F56D9]/20 text-[#B692F6] border border-[#7F56D9]/30' : 'text-gray-500'}`}>
                  {t.name} - {t.description} {i === req.toolIdx && <span className="ml-1 text-green-400">MATCH</span>}
                </div>
              ))}
            </div>
          </div>
        )}
        {activeStep === 2 && (
          <div>
            <span className="text-gray-500">Tool selected: <span className="text-[#9E77ED] font-mono">{tool.name}</span></span>
            <div className="mt-2 font-mono text-xs bg-black/30 rounded p-2 text-gray-300">
              <div className="text-gray-500">{'// JSON Schema'}</div>
              <div>{'{'}</div>
              {Object.entries(tool.args).map(([k, v]) => (
                <div key={k} className="ml-3">&quot;{k}&quot;: <span className="text-[#B692F6]">&quot;{v}&quot;</span>,</div>
              ))}
              <div>{'}'}</div>
            </div>
          </div>
        )}
        {activeStep === 3 && (
          <div>
            <span className="text-gray-500">Executing <span className="text-[#9E77ED] font-mono">{tool.name}</span> with args:</span>
            <div className="mt-2 font-mono text-xs bg-black/30 rounded p-2 text-gray-300">
              {Object.entries(req.userArgs).map(([k, v]) => (
                <div key={k}>&quot;{k}&quot;: <span className="text-green-400">&quot;{v}&quot;</span></div>
              ))}
            </div>
          </div>
        )}
        {activeStep === 4 && (
          <div>
            <span className="text-gray-500">Tool returned:</span>
            <div className="mt-2 font-mono text-xs bg-black/30 rounded p-2 text-green-400">{tool.result}</div>
            <p className="text-gray-400 mt-2 text-xs">LLM synthesizes tool output into a natural language response for the user.</p>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-3">
        <button onClick={() => setActiveStep(Math.max(0, activeStep - 1))} disabled={activeStep === 0} className="text-xs text-gray-500 hover:text-gray-300 disabled:opacity-30">
          Back
        </button>
        <button onClick={() => setActiveStep(Math.min(STEPS.length - 1, activeStep + 1))} disabled={activeStep === STEPS.length - 1} className="text-xs text-[#9E77ED] hover:text-white disabled:opacity-30">
          Next Step
        </button>
      </div>
    </div>
  )
}
