export type CourseStatus = "active" | "coming-soon";
export type LectureStatus = "done" | "in-progress" | "planned";

export interface Lecture {
  id: string;
  title: string;
  status: LectureStatus;
  youtubeUrl?: string;
  notebookPath?: string;
}

export interface CourseModule {
  title: string;
  lectures: Lecture[];
}

export interface Course {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  status: CourseStatus;
  tags: string[];
  modules: CourseModule[];
}

export const courses: Course[] = [
  {
    slug: "ai-engineering",
    title: "AI Engineering End-to-End",
    tagline: "From a single neuron to a deployed LLM system.",
    description:
      "Build every layer of modern AI from scratch. Backprop, transformers, CUDA kernels, fine-tuning, RAG, agents, inference.",
    status: "active",
    tags: ["PyTorch", "CUDA", "Transformers", "LLMs", "FastAPI"],
    modules: [
      {
        title: "Module 0: Prerequisites",
        lectures: [
          {
            id: "l0",
            title: "Python for AI Engineering",
            status: "in-progress",
          },
        ],
      },
      {
        title: "Module 1: Neural Network Foundations",
        lectures: [
          {
            id: "l1",
            title: "Single Neuron, Backprop, Autograd",
            status: "done",
          },
          {
            id: "l2",
            title: "MLPs, XOR, MNIST",
            status: "done",
          },
          {
            id: "l3",
            title: "Training Toolkit - optimisers, loss, regularisation",
            status: "done",
          },
        ],
      },
      {
        title: "Module 2: Language Model Architecture",
        lectures: [
          {
            id: "l4",
            title: "Tokenisation - BPE from scratch, vocab, embeddings",
            status: "planned",
          },
          {
            id: "l5",
            title: "Positional Embeddings - sinusoidal, learned, RoPE, ALiBi",
            status: "planned",
          },
          {
            id: "l6",
            title: "Attention - dot product, multi-head, causal masking",
            status: "planned",
          },
          {
            id: "l7",
            title: "Transformer Architecture - layer norm, residuals, CUDA",
            status: "planned",
          },
          {
            id: "l8",
            title: "Sampling - greedy, top-k, top-p, temperature",
            status: "planned",
          },
        ],
      },
      {
        title: "Module 3: LLM Internals",
        lectures: [
          {
            id: "l9",
            title: "How LLMs Are Trained - pretraining, SFT, RLHF",
            status: "planned",
          },
          {
            id: "l10",
            title: "KV Cache and Flash Attention",
            status: "planned",
          },
          {
            id: "l11",
            title: "Mixture of Experts",
            status: "planned",
          },
          {
            id: "l12",
            title: "Modern Architectures - LLaMA, Mistral, DeepSeek",
            status: "planned",
          },
        ],
      },
      {
        title: "Module 4: Training Pipeline",
        lectures: [
          {
            id: "l13",
            title: "Pretraining",
            status: "planned",
          },
          {
            id: "l14",
            title: "Fine-Tuning with LoRA and QLoRA",
            status: "planned",
          },
          {
            id: "l15",
            title: "Post-Training - SFT, DPO",
            status: "planned",
          },
          {
            id: "l16",
            title: "Reinforcement Learning for LLMs - PPO, GRPO",
            status: "planned",
          },
          {
            id: "l17",
            title: "Building MathLM - a complete RL-trained math model",
            status: "planned",
          },
          {
            id: "l18",
            title: "Scaling Laws - Chinchilla, compute-optimal training",
            status: "planned",
          },
        ],
      },
      {
        title: "Module 5: Production AI Engineering",
        lectures: [
          {
            id: "l19",
            title: "RAG - chunking, hybrid search, reranking, citations",
            status: "planned",
          },
          {
            id: "l20",
            title: "AI Workflows - orchestration, tool calling, state machines",
            status: "planned",
          },
          {
            id: "l21",
            title: "Evaluation and Reliability - RAGAS, LLM-as-judge, A/B testing",
            status: "planned",
          },
        ],
      },
      {
        title: "Module 6: Agents and Agentic AI",
        lectures: [
          {
            id: "l22",
            title: "AI Agents from Scratch - ReAct, tool use, memory",
            status: "planned",
          },
          {
            id: "l23",
            title: "Agent Harnesses - Claude Code, Cursor, Devin architecture",
            status: "planned",
          },
          {
            id: "l24",
            title: "MCP and Tool-Use Patterns",
            status: "planned",
          },
          {
            id: "l25",
            title: "Agentic Coding - self-debugging, test generation, SWE-bench",
            status: "planned",
          },
        ],
      },
      {
        title: "Module 7: Infrastructure and Operations",
        lectures: [
          {
            id: "l26",
            title: "Inference Engineering - vLLM, quantisation, streaming",
            status: "planned",
          },
          {
            id: "l27",
            title: "Deployment and LLMOps - Docker, CI/CD, observability",
            status: "planned",
          },
          {
            id: "l28",
            title: "AI Security - prompt injection, guardrails, PII, sandboxing",
            status: "planned",
          },
        ],
      },
      {
        title: "Module 8: Advanced Topics",
        lectures: [
          {
            id: "l29",
            title: "Multimodal AI - ViT, CLIP, LLaVA, Whisper",
            status: "planned",
          },
        ],
      },
      {
        title: "Module 9: Capstone and Career",
        lectures: [
          {
            id: "l30",
            title: "Build and Ship - end-to-end capstone project",
            status: "planned",
          },
          {
            id: "l31",
            title: "Career - interviews, portfolio, system design",
            status: "planned",
          },
        ],
      },
    ],
  },
  {
    slug: "ml-interviews",
    title: "ML/AI for Interviews",
    tagline: "The technical depth most ML interview prep skips.",
    description:
      "ML system design, paper reading, GenAI design questions, backend for ML, and deployment.",
    status: "coming-soon",
    tags: ["ML System Design", "Paper Reading", "GenAI", "Deployment"],
    modules: [
      {
        title: "ML Fundamentals",
        lectures: [
          { id: "ml1", title: "ML concepts and gotchas", status: "planned" },
          { id: "ml2", title: "Deep learning fundamentals", status: "planned" },
        ],
      },
      {
        title: "System Design for ML",
        lectures: [
          {
            id: "ml3",
            title: "ML system design framework",
            status: "planned",
          },
          {
            id: "ml4",
            title: "GenAI system design",
            status: "planned",
          },
          { id: "ml5", title: "Backend for ML engineers", status: "planned" },
        ],
      },
      {
        title: "Research Literacy",
        lectures: [
          {
            id: "ml6",
            title: "How to read a paper fast",
            status: "planned",
          },
          {
            id: "ml7",
            title: "Key papers every ML engineer should know",
            status: "planned",
          },
        ],
      },
      {
        title: "Deployment and MLOps",
        lectures: [
          {
            id: "ml8",
            title: "Taking a model to production",
            status: "planned",
          },
          {
            id: "ml9",
            title: "Monitoring and reliability",
            status: "planned",
          },
        ],
      },
    ],
  },
  {
    slug: "dsa-system-design",
    title: "DSA and System Design for Interviews",
    tagline: "Crack the coding interview and design round.",
    description:
      "Striver sheet patterns, Elements of Programming Interviews in Python, multithreading, and the full networking stack from TCP to HTTPS.",
    status: "coming-soon",
    tags: ["DSA", "System Design", "Python", "Concurrency", "Networking"],
    modules: [
      {
        title: "Data Structures",
        lectures: [
          { id: "d1", title: "Arrays, strings, hashing", status: "planned" },
          { id: "d2", title: "Linked lists, stacks, queues", status: "planned" },
          { id: "d3", title: "Trees and graphs", status: "planned" },
          { id: "d4", title: "Heaps, tries, intervals", status: "planned" },
        ],
      },
      {
        title: "Algorithm Patterns",
        lectures: [
          { id: "d5", title: "Sliding window, two pointers", status: "planned" },
          { id: "d6", title: "Binary search", status: "planned" },
          { id: "d7", title: "Dynamic programming", status: "planned" },
          { id: "d8", title: "Backtracking, greedy", status: "planned" },
        ],
      },
      {
        title: "Concurrency",
        lectures: [
          {
            id: "d9",
            title: "Multithreading fundamentals",
            status: "planned",
          },
          { id: "d10", title: "Locks, semaphores, patterns", status: "planned" },
        ],
      },
      {
        title: "System Design",
        lectures: [
          { id: "d11", title: "From TCP to HTTPS", status: "planned" },
          {
            id: "d12",
            title: "Distributed systems fundamentals",
            status: "planned",
          },
          { id: "d13", title: "Design classics", status: "planned" },
        ],
      },
    ],
  },
  {
    slug: "computer-vision",
    title: "Computer Vision",
    tagline: "See what the model sees.",
    description:
      "Coming soon. CNNs, object detection, segmentation, vision transformers, and multimodal models - built from scratch.",
    status: "coming-soon",
    tags: ["CNNs", "YOLO", "ViT", "PyTorch"],
    modules: [],
  },
];

export function getCourse(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}
