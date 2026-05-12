'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';

const katexStyles = `
  .katex-display {
    background-color: var(--secondary);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    padding: 1.25rem 1.5rem;
    margin: 1.25rem 0;
    line-height: 2.5;
    overflow-x: auto;
  }
  .katex-display .newline {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .katex { color: var(--foreground); }
  .katex .katex-mathml { display: none; }
`;

function extractText(node: any): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node?.props?.children) return extractText(node.props.children);
  return '';
}

function CopyableCodeBlock({ children, ...props }: any) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    const text = extractText(children);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [children]);

  return (
    <div className="relative group my-4">
      <pre className="bg-zinc-900 p-4 rounded-lg overflow-x-auto text-[12px] leading-relaxed" {...props}>
        {children}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded bg-zinc-700/80 hover:bg-zinc-600 text-zinc-400 hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Copy code"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

const MarkdownRenderer = ({ content }: { content: string }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm, remarkMath]}
    rehypePlugins={[rehypeKatex, rehypeRaw]}
    components={{
      h1: ({ ...props }) => (
        <h1 className="text-xl font-bold mt-6 mb-3 text-foreground" {...props} />
      ),
      h2: ({ ...props }) => (
        <h2 className="text-lg font-semibold mt-6 mb-2 text-foreground" {...props} />
      ),
      h3: ({ ...props }) => (
        <h3 className="text-base font-semibold mt-5 mb-2 text-foreground" {...props} />
      ),
      h4: ({ ...props }) => (
        <h4 className="text-sm font-semibold mt-4 mb-1.5 text-foreground" {...props} />
      ),
      ol: ({ ...props }) => (
        <ol className="list-decimal list-outside space-y-2 text-muted-foreground ml-6 my-3" {...props} />
      ),
      ul: ({ ...props }) => (
        <ul className="list-disc list-outside space-y-2 text-muted-foreground ml-6 my-3" {...props} />
      ),
      li: ({ ...props }) => (
        <li className="leading-relaxed text-[13px] text-muted-foreground pl-1" {...props} />
      ),
      p: ({ ...props }) => (
        <p className="text-muted-foreground leading-7 text-[13px] mb-3" {...props} />
      ),
      div: ({ children, style, ...props }: any) => {
        const hasKatexClass = props.className?.includes('math');
        if (hasKatexClass) {
          return (
            <div className="bg-secondary border border-border rounded-lg p-6 text-center my-5 overflow-x-auto">
              {children}
            </div>
          );
        }
        return (
          <div className="my-3" style={style} {...props}>
            {children}
          </div>
        );
      },
      code: ({ className, children, ...props }: any) => {
        const hasNewlines = typeof children === 'string' && children.includes('\n');
        const inline = !className && !hasNewlines;
        return inline ? (
          <code className="bg-secondary border border-border px-1.5 py-0.5 rounded text-[12px] text-foreground/90 font-mono" {...props}>
            {children}
          </code>
        ) : (
          <code className={`bg-zinc-900 px-3 py-2 rounded block overflow-x-auto text-[12px] text-zinc-200 font-mono ${className || ''}`} {...props}>
            {children}
          </code>
        );
      },
      pre: CopyableCodeBlock,
      blockquote: ({ ...props }) => (
        <blockquote className="border-l-3 border-primary/50 pl-4 italic text-muted-foreground my-4" {...props} />
      ),
      table: ({ ...props }) => (
        <div className="overflow-x-auto my-4">
          <table className="border-collapse w-full text-[13px]" {...props} />
        </div>
      ),
      thead: ({ ...props }) => (
        <thead className="bg-secondary" {...props} />
      ),
      th: ({ ...props }) => (
        <th className="border border-border px-3 py-2 text-left font-semibold text-foreground text-[12px]" {...props} />
      ),
      td: ({ ...props }) => (
        <td className="border border-border px-3 py-2 text-muted-foreground" {...props} />
      ),
      tr: ({ ...props }) => (
        <tr className="even:bg-muted/50" {...props} />
      ),
      strong: ({ ...props }) => (
        <strong className="font-bold text-foreground" {...props} />
      ),
      em: ({ ...props }) => (
        <em className="italic text-muted-foreground" {...props} />
      ),
      a: ({ ...props }) => (
        <a className="text-blue-400 hover:underline" {...props} />
      ),
      hr: () => (
        <hr className="my-6 border-border" />
      ),
      img: ({ ...props }: any) => (
        <img className="max-w-[500px] h-auto mx-auto my-5 rounded" {...props} />
      ),
    }}
  >
    {content}
  </ReactMarkdown>
);

interface ProblemPreviewProps {
  content: string | Record<string, any>;
}

export default function ProblemPreview({ content }: ProblemPreviewProps) {
  let raw: string;
  if (typeof content === 'string') {
    raw = content;
  } else if (content && typeof content === 'object') {
    const parts: string[] = [];
    if (content.input) parts.push(`**Input:**\n${content.input}`);
    if (content.output) parts.push(`**Output:**\n${content.output}`);
    if (content.explanation) parts.push(`**Explanation:**\n${content.explanation}`);
    raw = parts.length > 0 ? parts.join('\n\n') : JSON.stringify(content, null, 2);
  } else {
    raw = String(content ?? '');
  }

  const cleanContent = raw
    .replace(/<span[^>]*style="[^"]*"[^>]*>/g, '')
    .replace(/<\/span>/g, '');

  return (
    <>
      <style>{katexStyles}</style>
      <div className="prose dark:prose-invert max-w-none">
        <MarkdownRenderer content={cleanContent} />
      </div>
    </>
  );
}
