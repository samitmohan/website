/**
 * The projects board. One place project data lives.
 *
 * Write-ups are in Samit's voice and come from each repo's README and code.
 * Every entry in `numbers` must be traceable to the repo (README, results
 * file, or a count of the code); never estimate one.
 */
export type Project = {
  slug: string;
  name: string;
  stack: string;
  blurb: string;
  repoUrl: string;
  liveUrl?: string;
  /** A hand-authored animated SVG in public/projects/, named without the
   *  directory or the extension. Cards without one show the name set large. */
  figure?: `projects/${string}`;
  /** Post slugs pinned next to the project on /projects, joined by a thread. */
  posts?: string[];
  /** The write-up shown when the card opens: what it is, then how it works. */
  what: string;
  how: string;
  /** Measured results and sizes, each one from the repo. */
  numbers?: string[];
};

export const PROJECTS: Project[] = [
  {
    slug: "mathlm",
    name: "mathLM",
    stack: "PyTorch",
    blurb: "A small GPT trained on maths from scratch, tokenizer through reasoning RL.",
    repoUrl: "https://github.com/samitmohan/mathLM",
    figure: "projects/mathlm",
    posts: ["microgpt", "scalinglaws"],
    what: "A small GPT I trained from scratch on maths, every stage from the tokenizer to RL. I started from Karpathy's nanoGPT and wanted to go further into the modern decoder-only stack.",
    how: "I trained my own BPE tokenizer on maths text, so symbols like ∇ and x^2 become single tokens. The model has grouped-query attention, RoPE with QK-norm, SwiGLU and an optional top-2 mixture of experts. It pretrains on OpenWebMath, then SFT with the loss masked to answers, then GRPO with a plain right-or-wrong reward: no critic, no reward model.",
    numbers: [
      "40.4M parameters: 8 layers, 512 dim, 8 query heads, 4 KV heads",
      "32k-token BPE vocabulary, 512-token context",
      "100,000 steps at about 524k tokens per step",
    ],
  },
  {
    slug: "minitorch",
    name: "minitorch",
    stack: "NumPy · CuPy",
    blurb: "Reverse-mode autograd in a few hundred lines of NumPy, written to understand backward.",
    repoUrl: "https://github.com/samitmohan/minitorch",
    liveUrl: "https://samitmohan.github.io/minitorch/",
    figure: "projects/minitorch",
    posts: ["minitorch", "torch"],
    what: "PyTorch, rebuilt from scratch in NumPy, to learn how autograd and neural networks actually work.",
    how: "Every op records its inputs and a small backward function. Calling .backward() sorts the graph and walks it in reverse. Layers, convolutions, Adam and SGD, and a GPT-style transformer all sit on that one engine, and every op is checked against finite differences.",
    numbers: [
      "About 1,200 lines of NumPy; the autograd engine is about 410",
      "MNIST MLP, 8 epochs: 94.1% test accuracy",
      "MNIST CNN, 3 epochs: 95.8% test accuracy",
      "Character-level GPT, 107k parameters: loss 5.24 to 0.28 in 2,000 iterations",
    ],
  },
  {
    slug: "mini-code",
    name: "mini-code",
    stack: "Python",
    blurb: "A coding agent in ~350 lines, to find out what is inside the loop.",
    repoUrl: "https://github.com/samitmohan/minicode",
    figure: "projects/minicode",
    posts: ["claude", "mcp"],
    what: "My own Claude Code-style terminal agent, in a single Python file.",
    how: "It calls the model, runs whatever tools it asks for, and repeats until the model stops. There are six tools: read, write, edit, glob, grep and bash. The three that change things ask before running, unless you pass --yolo. It talks to OpenRouter or the Anthropic API directly.",
    numbers: ["6 tools", "346 lines, standard library only"],
  },
  {
    slug: "yolov1",
    name: "YOLOv1",
    stack: "PyTorch",
    blurb: "The original YOLO paper, implemented and trained on Pascal VOC.",
    repoUrl: "https://github.com/samitmohan/YOLOv1",
    figure: "projects/yolov1",
    posts: ["yolo"],
    what: "YOLOv1 from the paper, built from scratch and trained on Pascal VOC.",
    how: "A ResNet34 backbone feeds a convolutional head that predicts a 7x7 grid, two boxes per cell, across 20 classes. The loss follows section 2.2 of the paper term by term. Inference runs per-class non-max suppression, and evaluation computes VOC-style mAP.",
    numbers: ["7x7 grid, 2 boxes per cell, 20 classes", "448x448 input, 135 epochs at batch 64"],
  },
  {
    slug: "tennis-analysis",
    name: "tennis-analysis",
    stack: "PyTorch · OpenCV",
    blurb: "Tracking players, the ball and court keypoints through match footage.",
    repoUrl: "https://github.com/samitmohan/tennis-analysis",
    figure: "projects/tennis-analysis",
    posts: ["yolo"],
    what: "A computer-vision pipeline that follows the players and the ball through tennis footage, then works out shot speeds, rallies and heatmaps.",
    how: "YOLOv8 finds the players, and a YOLO model I fine-tuned finds the ball, with interpolation filling the frames it misses. A ResNet50 predicts the court's keypoints from the first frame, which lets me map everything onto a bird's-eye mini court. Shot speed comes from distance on that mini court between hits.",
    numbers: ["14 court keypoints", "Ball detector fine-tuned on 578 images", "36 tests"],
  },
  {
    slug: "rag-for-blogs",
    name: "rag-for-blogs",
    stack: "FAISS · FastAPI",
    blurb: "Ask questions about my blog and get answers with citations.",
    repoUrl: "https://github.com/samitmohan/rag-for-blogs",
    liveUrl: "https://samitmohan.github.io/ask",
    figure: "projects/rag-for-blogs",
    posts: ["rag"],
    what: "A retrieval engine over my own posts, built to learn RAG by doing it.",
    how: "Posts are chunked without ever splitting a code block, embedded with SentenceTransformers and indexed in FAISS. The public version only retrieves, on a CPU. Locally, the retrieved chunks go to Qwen 2.5 7B through Ollama, which answers with citations.",
  },
];
