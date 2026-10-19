import type { Run } from "@/components/TypedBio";

export const BIO: Run[] = [{ text: "I rebuild models from scratch, and run inference at scale on 300 cameras 24/7." }];

/** The posts the home page leads with, in this order. */
export const FEATURED = ["math", "paper", "microgpt", "attention-residuals"];

export const HANDLE = "samitmohan";
export const EMAIL = "samitmohan@gmail.com";

/**
 * Cut-out photos for "Things I like", keyed by the exact bullet text from the
 * things-i-like post. A photo replaces the drawing or paper scrap for that line.
 */
export const THING_PHOTOS: Record<string, string> = {};

/** The live widgets in public/widgets, and the posts they were built for. */
export const LAB = [
  { id: "microgpt-stepper", name: "microGPT stepper", blurb: "Step a tiny GPT one token at a time.", post: "microgpt" },
  { id: "vllm-batching", name: "continuous batching", blurb: "Watch vLLM pack requests into a batch.", post: "inference" },
  { id: "residual-growth", name: "residual growth", blurb: "How the residual stream norm grows with depth.", post: "attention-residuals" },
  { id: "lru-fib", name: "lru_cache vs fib", blurb: "The recursion tree, with and without the cache.", post: "pythontricks" },
];
