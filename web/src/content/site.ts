import type { Run } from "@/components/TypedBio";
import type { Thing } from "@/components/Vicinity";

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

/**
 * The objects in "Things in my vicinity". Notes paraphrase the "things i like"
 * post. `img` takes a transparent cut-out photo; until then each draws itself.
 */
export const THINGS: Thing[] = [
  { label: "Fantastic Mr. Fox", note: "reading Fantastic Mr. Fox, again", art: "book" },
  { label: "vinyl", note: "vinyl records, and Black Sabbath on them", art: "vinyl" },
  { label: "mechanical pencil", note: "mechanical pencils, the clicky kind", art: "pencil" },
  { label: "ace of spades", note: "performing card tricks", art: "card" },
  { label: "uno", note: "winning at uno", art: "uno" },
  { label: "ps2 controller", note: "a ps2 booting past the loading screen first try", art: "controller" },
  { label: "espresso", note: "davidoff espresso 57 in the morning", art: "coffee" },
  { label: "chuck taylors", note: "converse chuck taylors", art: "sneaker" },
];

/** The live widgets in public/widgets, and the posts they were built for. */
export const LAB = [
  { id: "microgpt-stepper", name: "microGPT stepper", blurb: "Step a tiny GPT one token at a time.", post: "microgpt" },
  { id: "vllm-batching", name: "continuous batching", blurb: "Watch vLLM pack requests into a batch.", post: "inference" },
  { id: "residual-growth", name: "residual growth", blurb: "How the residual stream norm grows with depth.", post: "attention-residuals" },
  { id: "lru-fib", name: "lru_cache vs fib", blurb: "The recursion tree, with and without the cache.", post: "pythontricks" },
];
