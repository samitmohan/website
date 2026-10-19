"use client";

import { useMemo, useState } from "react";

/*
 * Small live ML toys, each sized to sit in the middle of a lab card.
 * Every one is self-contained: no data files, no network, no canvas libs.
 */

const btn = "rounded-full bg-paper px-2.5 py-1 font-mono text-[11px] text-ink shadow-[0_1px_2px_rgba(0,0,0,.12)] transition-colors hover:text-accent";

/* ------------------------------------------------------------ softmax */

const LOGITS = [2.1, 1.3, 0.4, -0.2, -1.1];
const WORDS = ["cat", "dog", "fox", "owl", "eel"];

/** Softmax over five logits; the slider is the temperature. */
export function SoftmaxToy() {
  const [t, setT] = useState(1);
  const probs = useMemo(() => {
    const e = LOGITS.map((l) => Math.exp(l / t));
    const z = e.reduce((a, b) => a + b, 0);
    return e.map((x) => x / z);
  }, [t]);
  return (
    <div className="w-[220px]">
      <div className="flex h-28 items-end gap-2">
        {probs.map((p, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <span className="font-mono text-[9px] text-muted">{(p * 100).toFixed(0)}%</span>
            <div className="w-full rounded-t-md bg-ink transition-[height] duration-200" style={{ height: `${Math.max(2, p * 96)}px`, opacity: 0.35 + p * 0.65 }} />
            <span className="font-mono text-[10px] text-ink">{WORDS[i]}</span>
          </div>
        ))}
      </div>
      <label className="mt-4 flex items-center gap-2 font-mono text-[10px] text-muted">
        T
        <input type="range" min={0.1} max={4} step={0.05} value={t} onChange={(e) => setT(+e.target.value)} className="flex-1 accent-[var(--accent)]" />
        <span className="w-8 text-right text-ink">{t.toFixed(2)}</span>
      </label>
    </div>
  );
}

/* ------------------------------------------------------------ attention */

const SENT = ["the", "fox", "jumped", "over", "the", "lazy", "dog"];
// A hand-set attention pattern: each row sums to 1 over the tokens it can see (causal).
const ATTN = SENT.map((_, q) => {
  const raw = SENT.map((_, k) => (k > q ? 0 : 1 + (k === q ? 1.5 : 0) + ((q * 7 + k * 3) % 5) / 2 + (SENT[k] === "fox" && q > 1 ? 2.5 : 0)));
  const z = raw.reduce((a, b) => a + b, 0);
  return raw.map((r) => r / z);
});

/** Hover a token to see what it attends to; causal, so only to the left. */
export function AttentionToy() {
  const [q, setQ] = useState(SENT.length - 1);
  return (
    <div className="w-[240px]">
      <svg viewBox="0 0 240 70" className="w-full overflow-visible">
        {ATTN[q].map((w, k) => {
          if (w === 0) return null;
          const x1 = 17 + q * 34, x2 = 17 + k * 34, h = 10 + Math.abs(x1 - x2) * 0.45;
          return (
            <path
              key={k}
              d={k === q ? `M${x1 - 6} 66 C ${x1 - 10} 40, ${x1 + 10} 40, ${x1 + 6} 66` : `M${x1} 66 C ${x1} ${66 - h}, ${x2} ${66 - h}, ${x2} 66`}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={0.6 + w * 7}
              strokeLinecap="round"
              opacity={0.25 + w * 1.2}
            />
          );
        })}
      </svg>
      <div className="flex justify-between">
        {SENT.map((w, i) => (
          <button
            key={i}
            type="button"
            onPointerEnter={() => setQ(i)}
            onFocus={() => setQ(i)}
            className={`w-[34px] rounded py-1 text-center font-mono text-[10px] transition-colors ${i === q ? "bg-ink text-bg" : "text-ink hover:bg-surface-2"}`}
          >
            {w}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center font-mono text-[10px] text-muted">
        &ldquo;{SENT[q]}&rdquo; looks most at &ldquo;{SENT[ATTN[q].indexOf(Math.max(...ATTN[q]))]}&rdquo;
      </p>
    </div>
  );
}

/* ------------------------------------------------------------ convolution */

// A 10x10 drawing of a little house, 1 = ink.
const IMG = [
  "0000110000",
  "0001111000",
  "0011111100",
  "0111111110",
  "1111111111",
  "0110000110",
  "0110110110",
  "0110110110",
  "0110110110",
  "0111111110",
].map((r) => [...r].map(Number));

const KERNELS: Record<string, number[][]> = {
  identity: [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
  edges: [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]],
  blur: [[1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9]],
  sobel: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]],
};

/** A 3x3 kernel slid over a 10x10 image, zero padded. */
export function ConvToy() {
  const [k, setK] = useState("edges");
  const out = useMemo(() => {
    const K = KERNELS[k];
    return IMG.map((row, y) =>
      row.map((_, x) => {
        let s = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += (IMG[y + dy]?.[x + dx] ?? 0) * K[dy + 1][dx + 1];
        return s;
      }),
    );
  }, [k]);
  const max = Math.max(1, ...out.flat().map(Math.abs));
  const grid = (m: number[][], signed: boolean) => (
    <div className="grid grid-cols-10 gap-px">
      {m.flat().map((v, i) => (
        <span
          key={i}
          className="size-2.5 rounded-[1px]"
          style={{ background: signed && v < 0 ? "var(--accent)" : "var(--ink)", opacity: signed ? Math.abs(v) / max : v ? 1 : 0.08 }}
        />
      ))}
    </div>
  );
  return (
    <div className="flex w-[250px] flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        {grid(IMG, false)}
        <span className="font-mono text-[11px] text-muted">*</span>
        <div className="grid grid-cols-3 gap-px font-mono text-[8px] text-ink">
          {KERNELS[k].flat().map((v, i) => (
            <span key={i} className="grid size-4 place-items-center rounded-[2px] bg-paper">
              {Number.isInteger(v) ? v : "⅑"}
            </span>
          ))}
        </div>
        <span className="font-mono text-[11px] text-muted">=</span>
        {grid(out, true)}
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {Object.keys(KERNELS).map((name) => (
          <button key={name} type="button" className={`${btn} ${name === k ? "!bg-ink !text-bg" : ""}`} onClick={() => setK(name)}>
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ dropout */

/** A 3-layer MLP; each press resamples the mask at rate p, and kept units are scaled by 1/(1-p). */
export function DropoutToy() {
  const [p, setP] = useState(0.4);
  const [seed, setSeed] = useState(1);
  const layers = [4, 6, 6, 2];
  const alive = useMemo(() => {
    let s = seed * 2654435761;
    const rnd = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
    return layers.map((n, li) => Array.from({ length: n }, () => li === 0 || li === layers.length - 1 || rnd() >= p));
  }, [p, seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const X = (li: number) => 20 + li * 66;
  const Y = (n: number, i: number) => 60 + (i - (n - 1) / 2) * 20;
  return (
    <div className="flex w-[240px] flex-col items-center gap-2">
      <svg viewBox="0 0 240 125" className="w-full">
        {layers.slice(1).map((n, li) =>
          Array.from({ length: n }, (_, j) =>
            Array.from({ length: layers[li] }, (_, i) =>
              alive[li][i] && alive[li + 1][j] ? (
                <line key={`${li}-${i}-${j}`} x1={X(li)} y1={Y(layers[li], i)} x2={X(li + 1)} y2={Y(n, j)} stroke="var(--ink)" strokeWidth="0.6" opacity="0.35" />
              ) : null,
            ),
          ),
        )}
        {layers.map((n, li) =>
          Array.from({ length: n }, (_, i) => (
            <circle
              key={`${li}-${i}`}
              cx={X(li)}
              cy={Y(n, i)}
              r={alive[li][i] ? 5.5 : 4}
              fill={alive[li][i] ? "var(--ink)" : "none"}
              stroke={alive[li][i] ? "none" : "var(--accent)"}
              strokeDasharray={alive[li][i] ? undefined : "2 2"}
              style={{ transition: "r .2s" }}
            />
          )),
        )}
      </svg>
      <div className="flex w-full items-center gap-2 font-mono text-[10px] text-muted">
        p
        <input type="range" min={0} max={0.9} step={0.05} value={p} onChange={(e) => setP(+e.target.value)} className="flex-1 accent-[var(--accent)]" />
        <span className="w-8 text-ink">{p.toFixed(2)}</span>
        <button type="button" className={btn} onClick={() => setSeed((s) => s + 1)}>
          resample
        </button>
      </div>
      <p className="font-mono text-[10px] text-muted">kept units scale by ×{(1 / (1 - p)).toFixed(2)}</p>
    </div>
  );
}

/* ------------------------------------------------------------ tokenizer */

// A tiny vocabulary of merges, longest match first, roughly how BPE output looks on English.
const VOCAB = ["ing", "tion", "the", "er", "ed", "an", "in", "on", "re", "at", "es", "en", "ly", "un", "able", "token", "model", "learn", "ize", "s"];
const COLORS = ["#f5c6c0", "#c9dcf2", "#d4ecc9", "#f2e2b8", "#e2d0f0", "#c8ece6"];

function tokenize(text: string): string[] {
  const out: string[] = [];
  for (const word of text.match(/\s?[A-Za-z]+|\s?\d+|\s?[^\sA-Za-z\d]+|\s+/g) ?? []) {
    const lead = word.startsWith(" ") ? " " : "";
    let rest = word.slice(lead.length).toLowerCase();
    const pieces: string[] = [];
    while (rest) {
      const hit = VOCAB.filter((v) => rest.startsWith(v)).sort((a, b) => b.length - a.length)[0];
      const take = hit ?? rest.slice(0, Math.min(rest.length, 3));
      pieces.push(take);
      rest = rest.slice(take.length);
    }
    pieces[0] = lead + pieces[0];
    out.push(...pieces);
  }
  return out;
}

/** Type anything; it splits into subword pieces the way a BPE tokenizer roughly would. */
export function TokenizerToy() {
  const [text, setText] = useState("unlearnable tokenization");
  const toks = tokenize(text);
  return (
    <div className="w-[250px]">
      <input
        value={text}
        maxLength={60}
        onChange={(e) => setText(e.target.value)}
        className="w-full rounded-lg bg-paper px-3 py-2 font-mono text-[12px] text-ink shadow-[0_1px_2px_rgba(0,0,0,.12)] outline-none focus:ring-1 focus:ring-[var(--accent)]"
        aria-label="Text to tokenize"
      />
      <div className="mt-3 flex min-h-12 flex-wrap gap-y-1 font-mono text-[12px] leading-5">
        {toks.map((t, i) => (
          <span key={i} className="rounded-[3px] px-[1px] whitespace-pre text-[#1b1b1b]" style={{ background: COLORS[i % COLORS.length] }}>
            {t}
          </span>
        ))}
      </div>
      <p className="mt-2 font-mono text-[10px] text-muted">
        {toks.length} tokens · {text.length} chars
      </p>
    </div>
  );
}
