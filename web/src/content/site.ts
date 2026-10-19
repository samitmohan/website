import type { Run } from "@/components/TypedBio";
import type { Thing } from "@/components/ThingsILike";

export const BIO: Run[] = [
  { text: "I " },
  { text: "use", struck: true },
  { text: " " },
  { text: "fine-tune", struck: true },
  { text: " build models from scratch, then make them fast enough to run on " },
  { text: "60k cameras", em: true },
  { text: " at the edge." },
];

export const HANDLE = "samitmohan";
export const EMAIL = "samitmohan@gmail.com";

/** From the "things i like" post. Glyphs are plain characters, not emoji. */
export const THINGS: Thing[] = [
  { label: "Fantastic Mr. Fox", kind: "book", glyph: "¶" },
  { label: "Black Sabbath", kind: "music", glyph: "♪" },
  { label: "vinyl records", kind: "music", glyph: "◉" },
  { label: "card tricks", kind: "hobby", glyph: "♠" },
  { label: "mechanical pencils", kind: "object", glyph: "✎" },
  { label: "Cubbon Park walks", kind: "place", glyph: "✶" },
  { label: "Hendrix", kind: "music", glyph: "♫" },
  { label: "a PS2 booting first try", kind: "games", glyph: "▶" },
  { label: "maa's mutton biryani", kind: "food", glyph: "◐" },
  { label: "Chuck Taylors", kind: "object", glyph: "△" },
  { label: "whiteboards", kind: "object", glyph: "□" },
  { label: "Davidoff Espresso 57", kind: "morning", glyph: "●" },
];

/** The live widgets in public/widgets, and the posts they were built for. */
export const LAB = [
  { id: "microgpt-stepper", name: "microGPT stepper", blurb: "Step a tiny GPT one token at a time.", post: "microgpt" },
  { id: "vllm-batching", name: "continuous batching", blurb: "Watch vLLM pack requests into a batch.", post: "inference" },
  { id: "residual-growth", name: "residual growth", blurb: "How the residual stream norm grows with depth.", post: "attention-residuals" },
  { id: "lru-fib", name: "lru_cache vs fib", blurb: "The recursion tree, with and without the cache.", post: "pythontricks" },
];
