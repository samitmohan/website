'use client';
import React, { useState } from 'react';

const templates = [
  { name: 'Summarize', template: 'Summarize the following {{document_type}} in {{language}}:\n\n{{content}}', vars: { document_type: 'article', language: 'English', content: '' } },
  { name: 'Extract', template: 'Extract all {{entity_type}} from:\n\n{{text}}\n\nFormat: {{format}}', vars: { entity_type: 'emails', text: '', format: 'JSON' } },
  { name: 'Translate', template: 'Translate from {{source_lang}} to {{target_lang}}:\n\n{{input_text}}', vars: { source_lang: 'English', target_lang: '', input_text: '' } },
];

export default function PromptTemplateViz() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [varValues, setVarValues] = useState<Record<string, Record<string, string>>>(() => {
    const init: Record<string, Record<string, string>> = {};
    templates.forEach((t, i) => {
      const copy: Record<string, string> = {};
      for (const [k, v] of Object.entries(t.vars)) copy[k] = v;
      init[String(i)] = copy;
    });
    return init;
  });

  const tpl = templates[activeIdx];
  const vars = varValues[String(activeIdx)] || tpl.vars;
  const varNames = Object.keys(tpl.vars);

  const rendered = tpl.template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || '');
  const missingVars = varNames.filter((k) => !vars[k]?.trim());

  const highlightTemplate = (text: string) => {
    const parts = text.split(/(\{\{\w+\}\})/g);
    return parts.map((part, i) => {
      const match = part.match(/^\{\{(\w+)\}\}$/);
      if (match) {
        const filled = vars[match[1]]?.trim();
        return (
          <span key={i} className={`px-1 rounded font-mono ${filled ? 'bg-[#7F56D9]/30 text-[#9E77ED]' : 'bg-red-500/20 text-red-400'}`}>
            {part}
          </span>
        );
      }
      return <span key={i} className="text-gray-300">{part}</span>;
    });
  };

  return (
    <div className="p-6 bg-card rounded-xl border border-border max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold text-white mb-1">Prompt Template Engine</h2>
      <p className="text-gray-400 text-sm mb-4">Fill variables to render prompts. Missing values flagged in red.</p>

      <div className="flex gap-2 mb-4">
        {templates.map((t, i) => (
          <button key={i} onClick={() => setActiveIdx(i)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${i === activeIdx ? 'bg-[#7F56D9] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {t.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-500 mb-2">Template</div>
          <div className="bg-white/5 rounded-lg p-3 text-sm whitespace-pre-wrap min-h-[100px] font-mono leading-relaxed">
            {highlightTemplate(tpl.template)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-2">Variables</div>
          <div className="space-y-2">
            {varNames.map((key) => (
              <div key={key}>
                <label className="text-xs text-gray-400 block mb-0.5">
                  {key} {!vars[key]?.trim() && <span className="text-red-400 ml-1">* required</span>}
                </label>
                <input type="text" value={vars[key] || ''}
                  onChange={(e) => setVarValues((prev) => ({ ...prev, [String(activeIdx)]: { ...prev[String(activeIdx)], [key]: e.target.value } }))}
                  className="w-full bg-white/5 border border-border rounded px-2 py-1.5 text-sm text-gray-200 focus:border-[#7F56D9] focus:outline-none" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {missingVars.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-3 text-xs text-red-400">
          Missing: {missingVars.map((v) => `{{${v}}}`).join(', ')}
        </div>
      )}

      <div>
        <div className="text-xs text-gray-500 mb-2">Rendered Output</div>
        <div className="bg-white/5 rounded-lg p-3 text-sm text-gray-200 whitespace-pre-wrap min-h-[80px] font-mono border border-border">
          {rendered || <span className="text-gray-500 italic">Fill all variables to see rendered prompt</span>}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
        <span className="w-2.5 h-2.5 rounded bg-[#7F56D9]/30 border border-[#7F56D9]/50" /> Filled
        <span className="w-2.5 h-2.5 rounded bg-red-500/20 border border-red-500/40 ml-2" /> Missing
      </div>
    </div>
  );
}
