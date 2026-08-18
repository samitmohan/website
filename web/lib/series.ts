/**
 * The from-scratch ladder, in dependency order. Each rung assumes the last.
 *
 * Lives here rather than inline in app/page.tsx because the order is editorial
 * and worth keeping in one place: /blog is a flat reverse-chronological list, so
 * this array is the only thing that records the intended reading path.
 */
export const SERIES_TITLE = "From Scratch";

export const SERIES: { slug: string; gloss: string }[] = [
  { slug: "math", gloss: "gradients and the chain rule, from scratch" },
  { slug: "nn", gloss: "a digit classifier in pure NumPy" },
  { slug: "torch", gloss: "tensors and autograd, then the same net in PyTorch" },
  { slug: "minitorch", gloss: "a working framework in ~1500 lines" },
  { slug: "attention-residuals", gloss: "why attention and residual streams work" },
  { slug: "microgpt", gloss: "a GPT built and trained end to end" },
  { slug: "how-chatgpt-works", gloss: "the full pipeline: data, alignment, inference" },
  { slug: "inference", gloss: "the KV cache, batching, what makes tokens fast" },
];
