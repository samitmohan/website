export interface WeekMeta {
  weekNumber: number;
  title: string;
  description: string;
  topics: string[];
  project?: string;
  cohortUrl?: string;
  supplementary?: boolean;
}

export const SYLLABUS: WeekMeta[] = [
  {
    weekNumber: 0,
    title: "Math Foundations",
    description: "All the math you need for LLMs",
    topics: ["Probability", "Linear Algebra", "Calculus", "Loss Functions", "Activation Functions"],
    cohortUrl: "https://samitmohan.github.io#week-0",
  },
  {
    weekNumber: 1,
    title: "Neural Networks & Backpropagation",
    description: "Overview of LLMs, neural networks, FFN, learning rate, optimization, normalization",
    topics: ["Neural Networks", "FFN", "Learning Rate", "Optimization", "Normalization"],
    project: "MNIST using backpropagation from scratch",
    cohortUrl: "https://samitmohan.github.io#week-1",
  },
  {
    weekNumber: 2,
    title: "Tokenization & Embeddings",
    description: "How words get converted into numbers and vectors",
    topics: ["Tokenization", "Word Embeddings", "Positional Encodings", "Encoder-Decoder Intro"],
    project: "Byte Pair Encoding from scratch",
    cohortUrl: "https://samitmohan.github.io#week-2",
  },
  {
    weekNumber: 3,
    title: "Attention & Transformers",
    description: "Attention in detail and the transformer architecture",
    topics: ["Self-Attention", "Multi-Head Attention", "Transformer Architecture", "Q/K/V"],
    cohortUrl: "https://samitmohan.github.io#week-3",
  },
  {
    weekNumber: 4,
    title: "Building GPT",
    description: "Masked attention, autoregressive generation",
    topics: ["Masked Attention", "Autoregressive Models", "Causal Language Modeling"],
    project: "Code GPT from scratch",
    cohortUrl: "https://samitmohan.github.io#week-4",
  },
  {
    weekNumber: 5,
    title: "Fine-Tuning & RLHF",
    description: "Parameter-efficient fine-tuning, alignment, and preference optimization",
    topics: ["LoRA", "QLoRA", "SFT", "RLHF", "DPO", "Catastrophic Forgetting"],
    project: "Fine-tune a model with LoRA on custom data",
    cohortUrl: "https://samitmohan.github.io#week-5",
  },
  {
    weekNumber: 6,
    title: "RAG & Retrieval",
    description: "Building retrieval-augmented generation systems from scratch",
    topics: ["Chunking Strategies", "Vector Search", "Embeddings", "Reranking", "Hybrid Search"],
    project: "Build a RAG pipeline end-to-end",
    cohortUrl: "https://samitmohan.github.io#week-6",
  },
  {
    weekNumber: 7,
    title: "RAG Internals & Safety",
    description: "Query rewriting, prompt injection defense, guardrails for production",
    topics: ["Query Rewriting", "Prompt Injection", "Guardrails", "Canary Tokens", "HyDE"],
    cohortUrl: "https://samitmohan.github.io#week-7",
  },
  {
    weekNumber: 8,
    title: "Advanced RAG & Evaluation",
    description: "Corrective RAG, self-RAG, LLM-as-judge, building eval pipelines",
    topics: ["Corrective RAG", "Self RAG", "LLM-as-Judge", "RAGAS", "Eval Pipelines"],
    project: "Build a RAG system with self-correction",
    cohortUrl: "https://samitmohan.github.io#week-8",
  },
  {
    weekNumber: 9,
    title: "AI Agents",
    description: "What makes an agent, ReAct, tool calling, orchestrators",
    topics: ["ReAct Pattern", "Tool Calling", "Function Calling", "Orchestrators", "CrewAI"],
    project: "Building a single agent system with tools",
    cohortUrl: "https://samitmohan.github.io#week-9",
  },
  {
    weekNumber: 10,
    title: "Context Engineering & MCP",
    description: "Memory systems, MCP, multi-agents",
    topics: ["Context Engineering", "Memory Systems", "MCP", "Multi-Agents"],
    project: "Coding MCP with memory",
    cohortUrl: "https://samitmohan.github.io#week-10",
  },
  {
    weekNumber: 11,
    title: "Evals & Reliability",
    description: "Understanding evals, avoiding hallucinations, LLM as judge",
    topics: ["Evals", "Hallucination Avoidance", "LLM as Judge", "AI Tradeoffs"],
    project: "Build your own LLM Judge",
    cohortUrl: "https://samitmohan.github.io#week-11",
  },
  {
    weekNumber: 12,
    title: "Reasoning & LLMOps",
    description: "Thinking models, Chain of Thought, serving infrastructure",
    topics: ["Chain of Thought", "Reasoning Models", "vLLM", "Speculative Decoding", "Model Serving"],
    cohortUrl: "https://samitmohan.github.io#week-12",
  },
  {
    weekNumber: 13,
    title: "Multimodal AI",
    description: "Vision Transformers, CLIP, diffusion models, multimodal embeddings",
    topics: ["Vision Transformers", "CLIP", "Diffusion Models", "Auto-encoders", "Multimodal Embeddings"],
    cohortUrl: "https://samitmohan.github.io#week-13",
  },
  {
    weekNumber: 14,
    title: "Capstone Project",
    description: "Production-grade AI systems design for software engineers",
    topics: ["Production ML Systems", "Scalable Inference", "CI/CD for ML", "Monitoring & Observability", "Cost Optimization"],
    project: "Design and architect a production AI application end-to-end",
    cohortUrl: "https://samitmohan.github.io#week-14",
  },
  {
    weekNumber: 15,
    title: "Future of AI",
    description: "Claude, JEPA, and the future of deep learning",
    topics: ["AI Tools", "JEPA", "Future Directions"],
    cohortUrl: "https://samitmohan.github.io#week-15",
  },
];

export const UNLOCK_THRESHOLD = 0.7; // 70% completion to unlock next week
