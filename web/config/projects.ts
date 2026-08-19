/**
 * The projects grid. One place project data lives.
 *
 * `video`/`poster` are optional on purpose: the cards are built to work with
 * nothing but text, and start playing the moment a recording lands in
 * public/assets/projects/. Adding one is two fields here and no component
 * change. Anything under public/assets/ is served immutable (next.config.ts).
 */
export type Project = {
  slug: string;
  name: string;
  stack: string;
  blurb: string;
  repoUrl: string;
  liveUrl?: string;
  /** /assets/projects/<slug>.mp4 */
  video?: string;
  /** /assets/projects/<slug>.jpg - first frame, so the card never flashes empty */
  poster?: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "mathlm",
    name: "mathLM",
    stack: "PyTorch",
    // Deliberately no benchmark number. A 40M model is not judged on absolute
    // GSM8K, and naming a benchmark without a figure reads as hiding one. The
    // honest result is the SFT -> GRPO delta on a held-out split.
    blurb:
      "40M-param GPT trained from scratch on math. Custom BPE, GQA + RoPE + SwiGLU, then SFT and GRPO reasoning RL. The whole pipeline, tokenizer through policy gradient.",
    repoUrl: "https://github.com/samitmohan/mathLM",
  },
  {
    slug: "minitorch",
    name: "minitorch",
    stack: "NumPy · CuPy",
    blurb:
      "PyTorch in ~1500 lines. Reverse-mode autograd, conv2d, optimizers, LR schedulers. 96%+ on MNIST with the CNN, checked against numerical gradients.",
    repoUrl: "https://github.com/samitmohan/minitorch",
  },
  {
    slug: "mini-code",
    name: "mini-code",
    stack: "Python",
    blurb:
      "Built to find out what is actually inside an agent loop. Turns out it is ~350 lines: tool calls, shell exec, streamed command output.",
    repoUrl: "https://github.com/samitmohan/minicode",
  },
  {
    slug: "tennis-analysis",
    name: "tennis-analysis",
    stack: "PyTorch · OpenCV",
    blurb:
      "YOLO + ResNet on match footage. Court keypoint regression, ball detection with interpolation, shot-event detection and speed estimation.",
    repoUrl: "https://github.com/samitmohan/tennis-analysis",
  },
];
