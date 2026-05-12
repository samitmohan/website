import type { Problem } from "@/types/problem";

export const DEBUG_PROBLEMS: Problem[] = [
  // ========== WEEK 15: replaces ai-tools-trends-quiz ==========
  {
    id: "debug-scaling-laws",
    type: "coding",
    title: "Debug: Broken Scaling Law Calculator",
    description: `You have inherited a scaling law calculator that predicts compute-optimal training configurations using the Chinchilla scaling laws. Given a compute budget (in FLOPs), the calculator should return the optimal model size (parameters) and dataset size (tokens).

The implementation has a bug that causes incorrect predictions. The computed data sizes are way off from what the Chinchilla paper prescribes.

**Your task:** Find and fix the bug so the calculator produces correct compute-optimal allocations.

\`\`\`python
>>> budget = 1e21  # 10^21 FLOPs
>>> params, tokens = compute_optimal_config(budget)
>>> # Should follow Chinchilla: tokens ~ 20 * params
\`\`\`

Run the tests to verify your fix.`,
    difficulty: "Medium",
    weekNumber: 15,
    tags: '["scaling-laws", "chinchilla", "compute-optimal", "debugging"]',
    theory: `Scaling laws describe how language model performance improves as you increase compute, data, and parameters. Two landmark papers shaped this understanding:

**Kaplan et al. (2020)** found power-law relationships between loss and each scaling factor. They concluded that model size matters more than data size, leading to the "train big models on modest data" era (GPT-3 used 300B tokens for 175B params).

**Hoffmann et al. (2022) - Chinchilla** overturned this. They showed that compute-optimal training requires scaling data and parameters equally. The key relationship: for a compute budget $C$, the optimal number of tokens $D$ scales as $D \\sim C^{0.34}$ after accounting for model size. In practice, this means roughly 20 tokens per parameter.

The power law exponents are critical. Using the wrong exponent means you either overtrain a small model (wasting compute on diminishing returns) or undertrain a large model (the model could learn more with more data). Chinchilla itself was 70B params trained on 1.4T tokens - smaller than the 280B Gopher but trained on $4\\times$ more data, and it outperformed Gopher on most benchmarks.

Getting these exponents right has direct budget implications. A $10\\times$ training run on cloud GPUs can cost millions of dollars. A wrong exponent in your planning calculator could mean recommending a configuration that wastes half your compute.`,
    hints: '["Check the exponent used in the power law for data scaling - what does the Chinchilla paper specify?", "The Chinchilla optimal data scaling exponent is approximately 0.34, not 0.5", "Compare the ratio of tokens-to-parameters: Chinchilla prescribes roughly 20 tokens per parameter", "Try computing with a known budget and verify against published Chinchilla numbers"]',
    visualizationComponent: null,
    sortOrder: 5,
    starterCode: `import math

def compute_optimal_config(compute_budget_flops):
    """
    Given a compute budget in FLOPs, return the compute-optimal
    model size (parameters) and dataset size (tokens) following
    Chinchilla scaling laws.

    The Chinchilla relationship:
      C ~ 6 * N * D  (compute ~ 6 * params * tokens)
      N_opt ~ A * C^a  (optimal params scale with compute)
      D_opt ~ B * C^b  (optimal tokens scale with compute)

    Where a + b ~ 1 (compute splits between params and data).

    Returns:
        (optimal_params, optimal_tokens): tuple of floats
    """
    # Chinchilla scaling coefficients (from the paper)
    A = 0.0061  # params coefficient
    a = 0.46    # params exponent: N_opt ~ A * C^a

    B = 0.2155  # data coefficient
    # BUG: wrong exponent - using 0.5 instead of the correct 0.34
    b = 0.50    # data exponent: D_opt ~ B * C^b

    optimal_params = A * (compute_budget_flops ** a)
    optimal_tokens = B * (compute_budget_flops ** b)

    return (optimal_params, optimal_tokens)


def tokens_per_param_ratio(compute_budget_flops):
    """
    Return the ratio of optimal tokens to optimal parameters.
    For Chinchilla-optimal training, this should be roughly 20.
    """
    params, tokens = compute_optimal_config(compute_budget_flops)
    return tokens / params


def estimated_loss(params, tokens):
    """
    Estimate the cross-entropy loss for a model with the given
    params and tokens, using the Chinchilla parametric loss model:

    L(N, D) = E + A/N^alpha + B/D^beta

    where E is the irreducible loss.
    """
    E = 1.69       # irreducible entropy of natural language
    A_loss = 406.4
    alpha = 0.34
    B_loss = 410.7
    beta = 0.28

    loss = E + A_loss / (params ** alpha) + B_loss / (tokens ** beta)
    return loss`,
    solution: `\`\`\`python
import math

def compute_optimal_config(compute_budget_flops):
    """
    Given a compute budget in FLOPs, return the compute-optimal
    model size (parameters) and dataset size (tokens) following
    Chinchilla scaling laws.
    """
    A = 0.0061
    a = 0.46

    B = 0.2155
    # Bug fix: exponent was 0.50, should be 0.34
    # The Chinchilla paper shows data scales as C^0.34,
    # not C^0.5. Using 0.5 dramatically overestimates
    # the optimal dataset size for large compute budgets.
    b = 0.34

    optimal_params = A * (compute_budget_flops ** a)
    optimal_tokens = B * (compute_budget_flops ** b)

    return (optimal_params, optimal_tokens)


def tokens_per_param_ratio(compute_budget_flops):
    params, tokens = compute_optimal_config(compute_budget_flops)
    return tokens / params


def estimated_loss(params, tokens):
    E = 1.69
    A_loss = 406.4
    alpha = 0.34
    B_loss = 410.7
    beta = 0.28

    loss = E + A_loss / (params ** alpha) + B_loss / (tokens ** beta)
    return loss
\`\`\`

**Bug 1:** The data scaling exponent \`b\` was set to 0.50 instead of the correct 0.34 from the Chinchilla paper. Since $a + b$ should approximate the compute exponent split (with $a \\approx 0.46$ and $b \\approx 0.34$ summing to $\\approx 0.80$, reflecting the sub-linear scaling of both with total compute), using 0.50 for $b$ causes the calculator to massively overestimate the number of training tokens needed. At a budget of $10^{21}$ FLOPs, this error inflates the token count by orders of magnitude and breaks the ~20:1 tokens-to-params ratio that Chinchilla prescribes.`,
    testCases: [
      {
        id: "t1",
        name: "Tokens-per-param ratio near 20 at 1e21 FLOPs",
        inputs: { compute_budget: 1e21, check: "ratio", expected_range: [10, 30] },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Tokens-per-param ratio near 20 at 1e23 FLOPs",
        inputs: { compute_budget: 1e23, check: "ratio", expected_range: [10, 30] },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Optimal params at 1e21 FLOPs in reasonable range",
        inputs: { compute_budget: 1e21, check: "params", expected_range: [1e9, 1e10] },
        isPublic: true,
      },
      {
        id: "t4",
        name: "Data exponent b should be less than params exponent a",
        inputs: { check: "exponent_relation" },
        isPublic: false,
      },
      {
        id: "t5",
        name: "Scaling ratio stays stable across compute budgets",
        inputs: {
          budgets: [1e19, 1e21, 1e23],
          check: "ratio_stability",
          max_deviation: 3.0,
        },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },

  // ========== WEEK 14: replaces best-practices-patterns-quiz ==========
  {
    id: "debug-rag-pipeline",
    type: "coding",
    title: "Debug: Broken RAG Pipeline",
    description: `You have a Retrieval-Augmented Generation (RAG) pipeline that retrieves relevant context chunks and formats a prompt for an LLM. The pipeline has three bugs causing it to produce bad results in production:

1. Retrieval scores are inconsistent across queries
2. Duplicate chunks appear in the context
3. The formatted prompt puts context in the wrong position

**Your task:** Find and fix all three bugs. The tests will only pass when all bugs are resolved.

\`\`\`python
>>> chunks = ["Machine learning uses data...", "Neural nets are...", ...]
>>> embeddings = embed(chunks)
>>> results = retrieve_and_format("What is ML?", chunks, embeddings, top_k=3)
>>> print(results["formatted_prompt"])
\`\`\``,
    difficulty: "Medium",
    weekNumber: 14,
    tags: '["rag", "retrieval", "embeddings", "cosine-similarity", "debugging"]',
    theory: `RAG pipelines combine retrieval and generation to ground LLM outputs in source documents. The pipeline has three stages: embed, retrieve, format. Each stage has common failure modes that degrade answer quality.

**Embedding normalization:** Cosine similarity requires unit-length vectors. If embeddings are not L2-normalized, the dot product conflates magnitude with direction. Two vectors pointing in similar directions but with different magnitudes will get a lower score than they should. Most embedding models return normalized vectors, but when you roll your own or use raw transformer outputs, you must normalize explicitly.

**Deduplication:** In chunked document stores, the same passage can appear in multiple overlapping windows or across document versions. Without deduplication, the same context appears multiple times in the prompt, wasting tokens and biasing the model toward that content. Production systems deduplicate by content hash or by filtering chunks with cosine similarity above a threshold (e.g., > 0.95).

**Context positioning:** LLMs attend to context differently based on position. Research ("Lost in the Middle", Liu et al. 2023) shows models use information at the beginning and end of context more than the middle. Placing retrieved context before the question lets the model ground its answer in the evidence. Placing it after the question means the model has already started forming an answer before seeing the evidence - leading to hallucination.

These three bugs represent the most common RAG failures in production. Each one is subtle enough to pass a quick manual test but causes measurable quality degradation at scale.`,
    hints: '["Check how cosine similarity is computed - are the vectors normalized before the dot product?", "Look at whether retrieved chunks are deduplicated before being included in context", "Check the order of context and question in the formatted prompt - which should come first?", "Cosine similarity: $\\\\cos(a, b) = \\\\frac{a \\\\cdot b}{\\\\|a\\\\| \\\\|b\\\\|}$, or equivalently $\\\\text{dot}(\\\\text{normalize}(a), \\\\text{normalize}(b))$"]',
    visualizationComponent: null,
    sortOrder: 5,
    starterCode: `import numpy as np

def cosine_similarity(query_embedding, doc_embeddings):
    """
    Compute cosine similarity between a query vector and a matrix of document vectors.

    Args:
        query_embedding: np.array of shape (embed_dim,)
        doc_embeddings: np.array of shape (num_docs, embed_dim)

    Returns:
        np.array of shape (num_docs,) with similarity scores in [-1, 1]
    """
    # BUG 1: dot product without normalization - not true cosine similarity
    scores = doc_embeddings @ query_embedding
    return scores


def retrieve_top_k(query_embedding, chunks, chunk_embeddings, top_k=5):
    """
    Retrieve top-k most relevant chunks for a query.

    Args:
        query_embedding: np.array of shape (embed_dim,)
        chunks: list of strings
        chunk_embeddings: np.array of shape (num_chunks, embed_dim)
        top_k: number of chunks to retrieve

    Returns:
        list of (chunk_text, score) tuples, sorted by relevance
    """
    scores = cosine_similarity(query_embedding, chunk_embeddings)
    top_indices = np.argsort(scores)[-top_k:][::-1]

    results = []
    for idx in top_indices:
        results.append((chunks[idx], float(scores[idx])))

    # BUG 2: no deduplication - duplicate chunks pass through
    return results


def format_rag_prompt(question, retrieved_chunks):
    """
    Format the RAG prompt with retrieved context and the user question.

    Args:
        question: str, the user's question
        retrieved_chunks: list of (chunk_text, score) tuples

    Returns:
        str: formatted prompt ready for LLM
    """
    context = "\\n\\n".join([chunk for chunk, score in retrieved_chunks])

    # BUG 3: question before context - model starts answering before seeing evidence
    prompt = f\"\"\"Answer the following question based on the provided context.

Question: {question}

Context:
{context}

Answer:\"\"\"

    return prompt


def retrieve_and_format(question, chunks, chunk_embeddings, query_embedding, top_k=5):
    """
    Full RAG pipeline: retrieve relevant chunks and format prompt.

    Args:
        question: str
        chunks: list of strings
        chunk_embeddings: np.array of shape (num_chunks, embed_dim)
        query_embedding: np.array of shape (embed_dim,)
        top_k: int

    Returns:
        dict with 'retrieved_chunks' and 'formatted_prompt'
    """
    retrieved = retrieve_top_k(query_embedding, chunks, chunk_embeddings, top_k)
    prompt = format_rag_prompt(question, retrieved)

    return {
        "retrieved_chunks": retrieved,
        "formatted_prompt": prompt,
    }`,
    solution: `\`\`\`python
import numpy as np

def cosine_similarity(query_embedding, doc_embeddings):
    # Bug 1 fix: normalize both query and doc embeddings before dot product
    query_norm = query_embedding / np.linalg.norm(query_embedding)
    doc_norms = doc_embeddings / np.linalg.norm(doc_embeddings, axis=1, keepdims=True)
    scores = doc_norms @ query_norm
    return scores


def retrieve_top_k(query_embedding, chunks, chunk_embeddings, top_k=5):
    scores = cosine_similarity(query_embedding, chunk_embeddings)
    top_indices = np.argsort(scores)[-top_k:][::-1]

    results = []
    seen_chunks = set()
    for idx in top_indices:
        chunk_text = chunks[idx]
        # Bug 2 fix: deduplicate by content
        if chunk_text in seen_chunks:
            continue
        seen_chunks.add(chunk_text)
        results.append((chunk_text, float(scores[idx])))

    return results


def format_rag_prompt(question, retrieved_chunks):
    context = "\\n\\n".join([chunk for chunk, score in retrieved_chunks])

    # Bug 3 fix: context before question so model sees evidence first
    prompt = f\"\"\"Answer the following question based on the provided context.

Context:
{context}

Question: {question}

Answer:\"\"\"

    return prompt


def retrieve_and_format(question, chunks, chunk_embeddings, query_embedding, top_k=5):
    retrieved = retrieve_top_k(query_embedding, chunks, chunk_embeddings, top_k)
    prompt = format_rag_prompt(question, retrieved)

    return {
        "retrieved_chunks": retrieved,
        "formatted_prompt": prompt,
    }
\`\`\`

**Bug 1: No embedding normalization.** The \`cosine_similarity\` function computed a raw dot product instead of true cosine similarity. Without dividing by vector norms, embedding magnitude corrupts the ranking - a long but irrelevant vector can outscore a short but relevant one.

**Bug 2: No deduplication.** When the chunk store contains duplicate passages (common with overlapping sliding windows), the same chunk appears multiple times in retrieved results. This wastes context tokens and biases the LLM.

**Bug 3: Wrong context position.** The prompt placed the question before the context. LLMs process text sequentially; placing context after the question means the model begins formulating an answer before seeing evidence, increasing hallucination.`,
    testCases: [
      {
        id: "t1",
        name: "Cosine similarity scores are in [-1, 1]",
        inputs: {
          query: [3.0, 0.0, 4.0],
          docs: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [3.0, 0.0, 4.0]],
          check: "score_range",
        },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Identical vectors have cosine similarity of 1.0",
        inputs: {
          query: [1.0, 2.0, 3.0],
          docs: [[1.0, 2.0, 3.0]],
          check: "identical_score",
          expected: 1.0,
        },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Duplicate chunks are removed from results",
        inputs: {
          chunks: ["chunk A", "chunk B", "chunk A", "chunk C"],
          check: "no_duplicates",
        },
        isPublic: true,
      },
      {
        id: "t4",
        name: "Context appears before question in formatted prompt",
        inputs: {
          check: "context_before_question",
        },
        isPublic: true,
      },
      {
        id: "t5",
        name: "Ranking is correct with unnormalized embeddings",
        inputs: {
          query: [1.0, 0.0],
          docs: [[100.0, 99.0], [1.0, 0.01]],
          check: "ranking",
          expected_first: 1,
        },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },

  // ========== WEEK 10: replaces mcp-multi-agent-quiz ==========
  {
    id: "debug-tool-calling",
    type: "coding",
    title: "Debug: Broken Tool Calling Agent",
    description: `You have a ReAct-style tool-calling agent that processes user queries by calling tools (functions) in a loop. The agent should:

1. Decide which tool to call based on the current conversation
2. Execute the tool and append the result to the conversation history
3. Stop when the LLM response contains "FINAL ANSWER:" or max iterations are reached

The agent has three bugs that cause it to fail on multi-step tasks. Sometimes it loops forever, sometimes it loses context, and sometimes it stops one step too early.

**Your task:** Find and fix all three bugs so the agent handles multi-step tool calls correctly.

\`\`\`python
>>> tools = {"search": search_fn, "calculate": calc_fn}
>>> result = run_agent("What is 2+2?", tools, max_iterations=5)
>>> print(result["final_answer"])
\`\`\``,
    difficulty: "Medium",
    weekNumber: 10,
    tags: '["agents", "tool-calling", "react", "conversation-history", "debugging"]',
    theory: `Tool-calling agents follow the ReAct (Reasoning + Acting) pattern: think about what to do, call a tool, observe the result, repeat. Three components are critical to get right:

**Conversation history management.** The agent must append tool results to the conversation so subsequent LLM calls can reference previous observations. Without this, the agent has no memory of what it already discovered. This is the most common agent bug in production - the LLM keeps calling the same tool because it never sees the previous result.

**Stop condition.** The agent must detect when the LLM has produced a final answer versus a tool call. Using exact string match (==) instead of substring check (in) is fragile - the LLM might output "FINAL ANSWER: 42" and an exact match against "FINAL ANSWER" fails because of the suffix. Robust agents check for the stop token as a prefix or substring.

**Iteration bounds.** Off-by-one errors in the iteration loop can cause the agent to stop one step before it should, or run one step too many. A common pattern: using \`range(max_iterations - 1)\` instead of \`range(max_iterations)\`, or checking the iteration count before the final action instead of after. In production, running one step too few means the agent gives a partial answer; one step too many wastes tokens and latency.

These three bugs interact. A missing history entry means the agent never reaches its stop condition, which means it hits the iteration limit. If the iteration limit is also off by one, the agent silently returns an incomplete result.`,
    hints: '["Trace through a 2-step task manually: does the agent see the result of its first tool call when making the second?", "Check the stop condition: if the LLM outputs \\"FINAL ANSWER: 42\\", does the check pass?", "Count the iterations carefully: with max_iterations=5, does the agent get exactly 5 chances to act?", "Look at what gets appended to messages after a tool call"]',
    visualizationComponent: null,
    sortOrder: 5,
    starterCode: `def simulate_llm_response(messages, tools):
    """
    Simulates LLM deciding next action based on conversation history.
    In production, this would call an actual LLM API.

    Returns a dict with either:
      - {"type": "tool_call", "tool": "name", "args": {...}}
      - {"type": "text", "content": "FINAL ANSWER: ..."}
    """
    # This is a mock - in real code, this calls the LLM
    # The mock examines messages to determine the next action
    pass


def execute_tool(tool_name, args, available_tools):
    """
    Execute a tool and return its result as a string.
    """
    if tool_name not in available_tools:
        return f"Error: Unknown tool '{tool_name}'"
    tool_fn = available_tools[tool_name]
    result = tool_fn(**args)
    return str(result)


def run_agent(user_query, available_tools, llm_fn, max_iterations=10):
    """
    Run a ReAct-style agent loop.

    Args:
        user_query: str, the user's question
        available_tools: dict mapping tool names to callables
        llm_fn: function(messages, tools) -> response dict
        max_iterations: max number of agent steps

    Returns:
        dict with 'final_answer', 'steps', and 'messages'
    """
    messages = [
        {"role": "system", "content": "You are a helpful assistant with access to tools."},
        {"role": "user", "content": user_query},
    ]

    steps = []

    # BUG 3: off-by-one - range(max_iterations - 1) gives one fewer iteration
    for i in range(max_iterations - 1):
        response = llm_fn(messages, available_tools)

        if response["type"] == "text":
            content = response["content"]
            # BUG 2: exact match fails when content is "FINAL ANSWER: 42"
            if content == "FINAL ANSWER":
                return {
                    "final_answer": content.split("FINAL ANSWER:")[-1].strip(),
                    "steps": steps,
                    "messages": messages,
                }
            messages.append({"role": "assistant", "content": content})

        elif response["type"] == "tool_call":
            tool_name = response["tool"]
            tool_args = response.get("args", {})

            steps.append({"tool": tool_name, "args": tool_args, "iteration": i})

            result = execute_tool(tool_name, tool_args, available_tools)

            # BUG 1: tool result not appended to messages - agent loses context
            messages.append({"role": "assistant", "content": f"Calling tool: {tool_name}"})
            # Missing: messages.append({"role": "tool", "content": result})

    return {
        "final_answer": None,
        "steps": steps,
        "messages": messages,
        "error": "Max iterations reached without final answer",
    }`,
    solution: `\`\`\`python
def simulate_llm_response(messages, tools):
    pass


def execute_tool(tool_name, args, available_tools):
    if tool_name not in available_tools:
        return f"Error: Unknown tool '{tool_name}'"
    tool_fn = available_tools[tool_name]
    result = tool_fn(**args)
    return str(result)


def run_agent(user_query, available_tools, llm_fn, max_iterations=10):
    messages = [
        {"role": "system", "content": "You are a helpful assistant with access to tools."},
        {"role": "user", "content": user_query},
    ]

    steps = []

    # Bug 3 fix: use range(max_iterations) for correct count
    for i in range(max_iterations):
        response = llm_fn(messages, available_tools)

        if response["type"] == "text":
            content = response["content"]
            # Bug 2 fix: use "in" instead of "==" to handle "FINAL ANSWER: ..."
            if "FINAL ANSWER:" in content:
                return {
                    "final_answer": content.split("FINAL ANSWER:")[-1].strip(),
                    "steps": steps,
                    "messages": messages,
                }
            messages.append({"role": "assistant", "content": content})

        elif response["type"] == "tool_call":
            tool_name = response["tool"]
            tool_args = response.get("args", {})

            steps.append({"tool": tool_name, "args": tool_args, "iteration": i})

            result = execute_tool(tool_name, tool_args, available_tools)

            messages.append({"role": "assistant", "content": f"Calling tool: {tool_name}"})
            # Bug 1 fix: append tool result to messages so agent sees it
            messages.append({"role": "tool", "content": result})

    return {
        "final_answer": None,
        "steps": steps,
        "messages": messages,
        "error": "Max iterations reached without final answer",
    }
\`\`\`

**Bug 1: Tool output not appended to conversation history.** The agent logged that it called a tool but never added the tool's result to \`messages\`. On the next LLM call, the model had no record of what the tool returned, so it would repeat the same call or hallucinate a result.

**Bug 2: Exact match on stop condition.** The code checked \`content == "FINAL ANSWER"\` which only matches the exact string. The LLM outputs something like \`"FINAL ANSWER: 42"\`, which fails the equality check. Changing to \`"FINAL ANSWER:" in content\` handles the actual output format.

**Bug 3: Off-by-one in iteration loop.** \`range(max_iterations - 1)\` with \`max_iterations=10\` gives indices 0-8 (9 iterations instead of 10). The agent gets one fewer chance to complete the task. For multi-step tasks operating near the iteration limit, this causes premature termination.`,
    testCases: [
      {
        id: "t1",
        name: "Single-step tool call produces final answer",
        inputs: {
          query: "What is 2+2?",
          max_iterations: 5,
          mock_sequence: [
            { type: "tool_call", tool: "calculate", args: { expr: "2+2" } },
            { type: "text", content: "FINAL ANSWER: 4" },
          ],
          expected_answer: "4",
        },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Multi-step task: tool results visible in conversation history",
        inputs: {
          query: "Search then calculate",
          max_iterations: 5,
          mock_sequence: [
            { type: "tool_call", tool: "search", args: { q: "data" } },
            { type: "tool_call", tool: "calculate", args: { expr: "10+5" } },
            { type: "text", content: "FINAL ANSWER: 15" },
          ],
          check: "tool_results_in_messages",
        },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Agent uses all max_iterations when needed",
        inputs: {
          query: "complex task",
          max_iterations: 3,
          mock_sequence: [
            { type: "tool_call", tool: "search", args: { q: "a" } },
            { type: "tool_call", tool: "search", args: { q: "b" } },
            { type: "tool_call", tool: "search", args: { q: "c" } },
          ],
          check: "uses_all_iterations",
          expected_steps: 3,
        },
        isPublic: true,
      },
      {
        id: "t4",
        name: "Stop condition handles FINAL ANSWER with content after colon",
        inputs: {
          query: "simple question",
          max_iterations: 5,
          mock_sequence: [
            { type: "text", content: "FINAL ANSWER: The result is 42." },
          ],
          expected_answer: "The result is 42.",
        },
        isPublic: false,
      },
      {
        id: "t5",
        name: "Tool result messages have role 'tool'",
        inputs: {
          query: "use a tool",
          max_iterations: 5,
          mock_sequence: [
            { type: "tool_call", tool: "search", args: { q: "test" } },
            { type: "text", content: "FINAL ANSWER: done" },
          ],
          check: "tool_role_in_messages",
        },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },

  // ========== WEEK 13: replaces diffusion-autoencoders-quiz ==========
  {
    id: "debug-diffusion-sampler",
    type: "coding",
    title: "Debug: Broken Diffusion Sampler",
    description: `You have a DDPM (Denoising Diffusion Probabilistic Model) reverse process sampler for 1D data. The sampler should start from pure noise and iteratively denoise it to produce samples from the learned distribution.

The implementation has three bugs that cause generated samples to be noisy garbage instead of clean data.

**Your task:** Find and fix all three bugs. The tests use a simple synthetic denoiser and verify the denoising trajectory produces clean outputs.

\`\`\`python
>>> import numpy as np
>>> T = 100  # diffusion timesteps
>>> schedule = make_noise_schedule(T, schedule_type="cosine")
>>> samples = ddpm_sample(denoise_fn, schedule, shape=(64,), T=T)
\`\`\``,
    difficulty: "Hard",
    weekNumber: 13,
    tags: '["diffusion", "ddpm", "denoising", "noise-schedule", "sampling", "debugging"]',
    theory: `DDPM (Ho et al., 2020) learns to reverse a gradual noising process. The forward process adds Gaussian noise over T timesteps, and the reverse process learns to denoise step by step.

**Noise schedule:** The schedule defines how much noise is added at each timestep via $\\beta_t$ values. The cumulative product $\\bar{\\alpha}_t = \\prod_{i=1}^{t}(1 - \\beta_i)$ determines the noise level at step $t$. Two common schedules:

- Linear: $\\beta_t$ increases linearly from $\\beta_{\\text{start}}$ to $\\beta_{\\text{end}}$. Simple but wastes steps at high noise levels.
- Cosine (Nichol & Dhariwal, 2021): $\\bar{\\alpha}_t$ follows a cosine curve, providing more uniform noise levels across steps. Cosine schedules produce better samples because they allocate more denoising steps to the critical mid-noise range.

**Reverse process:** At each step $t$, the model predicts the noise and the sampler computes:

$$x_{t-1} = \\frac{1}{\\sqrt{\\alpha_t}} \\left( x_t - \\frac{\\beta_t}{\\sqrt{1 - \\bar{\\alpha}_t}} \\cdot \\epsilon_\\theta \\right) + \\sigma_t z$$

where $z \\sim \\mathcal{N}(0, I)$ is fresh noise. Two critical details:

1. The variance term $\\sigma_t = \\sqrt{\\beta_t}$, and this sqrt is essential - without it, variance is too high, overwhelming the signal.
2. At $t=0$ (the final step), no noise should be added. The sample should be clean. Adding noise at $t=0$ corrupts the final output.

**Why bugs here are catastrophic:** Diffusion samplers chain $T$ steps of small corrections. An error at any step propagates and amplifies through subsequent steps. A wrong noise schedule means the denoiser receives inputs at noise levels it was never trained for. A missing sqrt in variance doubles the noise power. Noise at $t=0$ adds corruption to the final output.`,
    hints: '["Check the noise schedule function: what curve should $\\\\bar{\\\\alpha}_t$ follow? Linear or cosine?", "Look at the variance term in the reverse step: $\\\\sigma_t = \\\\sqrt{\\\\beta_t}$, not $\\\\beta_t$", "Should the sampler add noise at the very last step ($t=0$)? What should the output look like?", "Compare the forward process noise levels with what the reverse process expects"]',
    visualizationComponent: null,
    sortOrder: 5,
    starterCode: `import numpy as np

def make_noise_schedule(T, schedule_type="cosine"):
    """
    Create the noise schedule for DDPM.

    Args:
        T: int, number of diffusion timesteps
        schedule_type: "linear" or "cosine"

    Returns:
        dict with keys: betas, alphas, alpha_bars
        Each is np.array of shape (T,)
    """
    if schedule_type == "cosine":
        # BUG 1: Using linear schedule instead of cosine
        # Cosine schedule: alpha_bar_t = cos^2((t/T + s) / (1+s) * pi/2)
        betas = np.linspace(0.0001, 0.02, T)  # This is the linear schedule!
    elif schedule_type == "linear":
        betas = np.linspace(0.0001, 0.02, T)
    else:
        raise ValueError(f"Unknown schedule type: {schedule_type}")

    alphas = 1.0 - betas
    alpha_bars = np.cumprod(alphas)

    return {
        "betas": betas,
        "alphas": alphas,
        "alpha_bars": alpha_bars,
    }


def ddpm_reverse_step(x_t, t, predicted_noise, schedule):
    """
    Perform one reverse diffusion step: x_t -> x_{t-1}

    Args:
        x_t: np.array, current noisy sample
        t: int, current timestep (T-1 down to 0)
        predicted_noise: np.array, model's noise prediction
        schedule: dict from make_noise_schedule

    Returns:
        x_{t-1}: np.array, slightly denoised sample
    """
    beta_t = schedule["betas"][t]
    alpha_t = schedule["alphas"][t]
    alpha_bar_t = schedule["alpha_bars"][t]

    # Compute mean of p(x_{t-1} | x_t)
    coeff = beta_t / np.sqrt(1.0 - alpha_bar_t)
    mean = (1.0 / np.sqrt(alpha_t)) * (x_t - coeff * predicted_noise)

    # BUG 2: variance should be sqrt(beta_t), not beta_t
    sigma_t = beta_t  # Missing sqrt!

    # BUG 3: adding noise at t=0 corrupts the final clean sample
    noise = np.random.randn(*x_t.shape)
    x_prev = mean + sigma_t * noise

    return x_prev


def ddpm_sample(denoise_fn, schedule, shape, T, seed=42):
    """
    Generate samples using DDPM reverse process.

    Args:
        denoise_fn: callable(x_t, t) -> predicted_noise
        schedule: dict from make_noise_schedule
        shape: tuple, shape of samples to generate
        T: int, number of timesteps
        seed: int, random seed

    Returns:
        np.array of generated samples
    """
    rng = np.random.RandomState(seed)
    x = rng.randn(*shape)  # Start from pure noise

    for t in reversed(range(T)):
        predicted_noise = denoise_fn(x, t)
        x = ddpm_reverse_step(x, t, predicted_noise, schedule)

    return x`,
    solution: `\`\`\`python
import numpy as np

def make_noise_schedule(T, schedule_type="cosine"):
    if schedule_type == "cosine":
        # Bug 1 fix: implement actual cosine schedule
        s = 0.008  # small offset to prevent beta_t = 0
        steps = np.arange(T + 1)
        f = np.cos(((steps / T) + s) / (1 + s) * np.pi / 2) ** 2
        alpha_bars = f / f[0]
        # Derive betas from alpha_bars
        betas = 1 - (alpha_bars[1:] / alpha_bars[:-1])
        betas = np.clip(betas, 0.0001, 0.999)
        alpha_bars = alpha_bars[1:]  # remove the extra initial entry
    elif schedule_type == "linear":
        betas = np.linspace(0.0001, 0.02, T)
    else:
        raise ValueError(f"Unknown schedule type: {schedule_type}")

    alphas = 1.0 - betas
    if schedule_type != "cosine":
        alpha_bars = np.cumprod(alphas)

    return {
        "betas": betas,
        "alphas": alphas,
        "alpha_bars": alpha_bars,
    }


def ddpm_reverse_step(x_t, t, predicted_noise, schedule):
    beta_t = schedule["betas"][t]
    alpha_t = schedule["alphas"][t]
    alpha_bar_t = schedule["alpha_bars"][t]

    coeff = beta_t / np.sqrt(1.0 - alpha_bar_t)
    mean = (1.0 / np.sqrt(alpha_t)) * (x_t - coeff * predicted_noise)

    # Bug 2 fix: sigma_t = sqrt(beta_t), not beta_t
    sigma_t = np.sqrt(beta_t)

    # Bug 3 fix: no noise at t=0 (final step should be clean)
    if t == 0:
        return mean

    noise = np.random.randn(*x_t.shape)
    x_prev = mean + sigma_t * noise

    return x_prev


def ddpm_sample(denoise_fn, schedule, shape, T, seed=42):
    rng = np.random.RandomState(seed)
    x = rng.randn(*shape)

    for t in reversed(range(T)):
        predicted_noise = denoise_fn(x, t)
        x = ddpm_reverse_step(x, t, predicted_noise, schedule)

    return x
\`\`\`

**Bug 1: Linear schedule used instead of cosine.** The "cosine" branch was identical to the "linear" branch. The cosine schedule (Nichol & Dhariwal, 2021) sets $\\bar{\\alpha}_t = \\cos^2\\!\\left(\\frac{t/T + s}{1 + s} \\cdot \\frac{\\pi}{2}\\right)$, which distributes noise levels more uniformly across timesteps. The linear schedule wastes steps at high noise levels where the denoiser has little information to work with.

**Bug 2: Missing sqrt on variance.** The variance term should be $\\sigma_t = \\sqrt{\\beta_t}$, not $\\beta_t$. Since $\\beta_t < 1$, $\\sqrt{\\beta_t} > \\beta_t$, but the relationship between variance ($\\sigma^2$) and standard deviation ($\\sigma$) matters: using $\\beta_t$ directly as $\\sigma$ means the actual variance is $\\beta_t^2$, which is too small for large $\\beta$ and wrong for the DDPM derivation.

**Bug 3: Noise added at $t=0$.** The final reverse step ($t=0$) should produce a clean sample. Adding Gaussian noise at this step corrupts the output. The reverse process derivation specifies that $x_0$ is deterministic given $x_1$ - the stochastic noise term only applies for $t > 0$.`,
    testCases: [
      {
        id: "t1",
        name: "Cosine schedule produces different betas than linear",
        inputs: {
          T: 100,
          check: "cosine_differs_from_linear",
        },
        isPublic: true,
      },
      {
        id: "t2",
        name: "No noise added at final timestep (t=0)",
        inputs: {
          T: 10,
          check: "clean_final_step",
        },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Variance uses sqrt(beta), not beta",
        inputs: {
          t: 50,
          beta: 0.04,
          check: "variance_sqrt",
          expected_sigma: 0.2,
        },
        isPublic: true,
      },
      {
        id: "t4",
        name: "Cosine alpha_bar starts near 1 and ends near 0",
        inputs: {
          T: 1000,
          check: "alpha_bar_range",
        },
        isPublic: false,
      },
      {
        id: "t5",
        name: "Full sampling with identity denoiser recovers clean signal",
        inputs: {
          T: 50,
          shape: [100],
          check: "denoising_trajectory",
        },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
];
