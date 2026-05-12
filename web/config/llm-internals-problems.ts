import type { Problem } from "@/types/problem";

export const LLM_INTERNALS_PROBLEMS: Problem[] = [
  // ========== WEEK 16: LLM Internals ==========
  {
    id: "rms-norm",
    type: "coding",
    title: "RMSNorm Implementation",
    description: `Implement Root Mean Square Layer Normalization (RMSNorm).

RMSNorm simplifies LayerNorm by removing the mean subtraction step. It normalizes by the root mean square of the input, then applies a learnable scale.

**Formula:**

$$\\text{RMSNorm}(x) = \\frac{x}{\\text{RMS}(x) + \\epsilon} \\cdot \\gamma$$

where $\\text{RMS}(x) = \\sqrt{\\frac{1}{n}\\sum x_i^2}$ and $\\gamma$ is a learnable weight vector.

**Example:**
\`\`\`python
>>> rms_norm([1.0, 2.0, 3.0, 4.0], [1.0, 1.0, 1.0, 1.0])
[0.3651, 0.7303, 1.0954, 1.4606]
\`\`\``,
    difficulty: "Easy",
    weekNumber: 16,
    tags: '["normalization", "rms-norm", "llama", "architecture"]',
    theory: `RMSNorm (Zhang & Sennrich 2019) is used in LLaMA, Mistral, Qwen, and most modern LLMs in place of LayerNorm.

**Why drop the mean subtraction?** LayerNorm computes: normalize by (x - mean) / std, then scale and shift. RMSNorm drops the mean subtraction and the shift parameter, arguing that re-centering is unnecessary and re-scaling is what matters. This makes it ~10% faster with no quality loss.

**Pre-norm vs post-norm:** Modern transformers place RMSNorm BEFORE attention and FFN (pre-norm), not after (post-norm as in the original transformer). Pre-norm trains more stably because gradients flow through the residual path without passing through a normalization layer.

**Implementation note:** The weight (gamma) is initialized to 1.0 and learned during training. There is no bias term.`,
    hints: '["Compute the mean of the squared values, not the mean of the values themselves", "Take the square root, add eps for stability", "Divide x by RMS, then multiply element-wise by weight"]',
    visualizationComponent: null,
    sortOrder: 1,
    starterCode: `import numpy as np

def rms_norm(x, weight, eps=1e-5):
    """
    Apply Root Mean Square Layer Normalization.

    Args:
        x: list or array of shape (d_model,)
        weight: list or array of shape (d_model,) - learnable scale (gamma)
        eps: float, added to RMS for numerical stability

    Returns:
        list of floats, normalized and scaled output
    """
    pass`,
    solution: `\`\`\`python
import numpy as np

def rms_norm(x, weight, eps=1e-5):
    x = np.array(x, dtype=np.float64)
    weight = np.array(weight, dtype=np.float64)
    rms = np.sqrt(np.mean(x ** 2) + eps)
    return (x / rms * weight).tolist()
\`\`\``,
    testCases: [
      { id: "t1", name: "Unit weights", inputs: { x: [1.0, 2.0, 3.0, 4.0], weight: [1.0, 1.0, 1.0, 1.0] }, isPublic: true },
      { id: "t2", name: "Scaled weights", inputs: { x: [1.0, -1.0, 1.0, -1.0], weight: [2.0, 2.0, 2.0, 2.0] }, isPublic: true },
      { id: "t3", name: "Near-zero input (stability)", inputs: { x: [1e-7, 1e-7, 1e-7, 1e-7], weight: [1.0, 1.0, 1.0, 1.0] }, isPublic: false },
      { id: "t4", name: "Asymmetric weights", inputs: { x: [2.0, 4.0, 6.0, 8.0], weight: [0.5, 1.0, 1.5, 2.0] }, isPublic: false },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "swiglu-ffn",
    type: "coding",
    title: "SwiGLU Feed-Forward Block",
    description: `Implement the SwiGLU feed-forward block used in LLaMA and most modern LLMs.

SwiGLU replaces the standard FFN (two linear layers with ReLU) with a gated variant using three weight matrices and the SiLU activation.

**Standard FFN:**
$$\\text{FFN}(x) = \\text{ReLU}(xW_1)W_2$$

**SwiGLU FFN:**
$$\\text{SwiGLU}(x) = (\\text{SiLU}(xW_1) \\odot xW_3)W_2$$

where $\\text{SiLU}(x) = x \\cdot \\sigma(x)$ (also called Swish) and $\\odot$ is element-wise multiplication.

**Example:**
\`\`\`python
# x: (d_model,), W1/W3: (d_model, d_ff), W2: (d_ff, d_model)
>>> swiglu_ffn(x, W1, W3, W2)  # returns (d_model,) array
\`\`\``,
    difficulty: "Medium",
    weekNumber: 16,
    tags: '["ffn", "swiglu", "silu", "activation", "llama", "architecture"]',
    theory: `SwiGLU (Shazeer 2020) is used in LLaMA, PaLM, Mistral, and most post-2022 LLMs.

**Why three weight matrices?** The gate (W1) and value (W3) project the input to the same intermediate dimension. SiLU(xW1) acts as a data-dependent gate - values close to 0 get filtered out, values far from 0 are amplified. Multiplying element-wise by xW3 selects which features to pass through. This gating mechanism gives the model more representational power than a simple activation function.

**SiLU vs ReLU:** ReLU is not differentiable at 0 and kills negative activations entirely. SiLU is smooth everywhere and allows small negative values to flow through, which improves gradient flow.

**Parameter count:** SwiGLU uses 3/2 the FFN width of a standard FFN to match the parameter count, since it has 3 matrices instead of 2. LLaMA-7B uses d_ff = 11008 (2.68x d_model of 4096) with SwiGLU rather than 4x.`,
    hints: '["Implement SiLU first: silu(x) = x * sigmoid(x) = x / (1 + exp(-x))", "Compute gate = silu(x @ W1) and value = x @ W3 separately", "Return (gate * value) @ W2"]',
    visualizationComponent: null,
    sortOrder: 2,
    starterCode: `import numpy as np

def silu(x):
    """SiLU activation: x * sigmoid(x)"""
    pass

def swiglu_ffn(x, W1, W3, W2):
    """
    SwiGLU feed-forward block.

    Args:
        x: array of shape (d_model,)
        W1: array of shape (d_model, d_ff) - gate projection weight
        W3: array of shape (d_model, d_ff) - value projection weight
        W2: array of shape (d_ff, d_model) - output projection weight

    Returns:
        array of shape (d_model,)
    """
    pass`,
    solution: `\`\`\`python
import numpy as np

def silu(x):
    return x / (1 + np.exp(-x))

def swiglu_ffn(x, W1, W3, W2):
    x = np.array(x, dtype=np.float64)
    gate = silu(x @ W1)
    value = x @ W3
    return (gate * value) @ W2
\`\`\``,
    testCases: [
      {
        id: "t1",
        name: "SiLU at key points",
        inputs: { fn: "silu", x: [0.0, 1.0, -1.0, 2.0] },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Small FFN block (d_model=2, d_ff=4)",
        inputs: {
          fn: "swiglu_ffn",
          x: [1.0, 0.5],
          W1: [[0.1, 0.2, 0.3, 0.4], [0.5, 0.6, 0.7, 0.8]],
          W3: [[0.2, 0.1, 0.4, 0.3], [0.6, 0.5, 0.8, 0.7]],
          W2: [[0.1, 0.2], [0.3, 0.4], [0.5, 0.6], [0.7, 0.8]],
        },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Zero input",
        inputs: {
          fn: "swiglu_ffn",
          x: [0.0, 0.0],
          W1: [[1.0, 1.0], [1.0, 1.0]],
          W3: [[1.0, 1.0], [1.0, 1.0]],
          W2: [[1.0, 1.0], [1.0, 1.0]],
        },
        isPublic: false,
      },
      {
        id: "t4",
        name: "Identity-like weights",
        inputs: {
          fn: "swiglu_ffn",
          x: [1.0, 2.0, 3.0],
          W1: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]],
          W3: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]],
          W2: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]],
        },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "grouped-query-attention",
    type: "coding",
    title: "Grouped Query Attention (GQA)",
    description: `Implement Grouped Query Attention, the key efficiency innovation in LLaMA 2/3, Mistral, and Gemma.

In standard Multi-Head Attention (MHA), every query head has its own key and value heads. In GQA, multiple query heads share a single key/value head, reducing KV cache memory.

**Standard MHA:** n_heads Q heads, n_heads K heads, n_heads V heads.
**GQA:** n_heads Q heads, n_kv_heads K heads, n_kv_heads V heads, where n_kv_heads divides n_heads.

Each group of (n_heads // n_kv_heads) query heads shares one K head and one V head.

**Implementation:** Expand K and V by repeating each KV head to match n_heads, then compute standard attention.

\`\`\`python
# n_heads=4, n_kv_heads=2: heads 0,1 share KV head 0; heads 2,3 share KV head 1
\`\`\``,
    difficulty: "Medium",
    weekNumber: 16,
    tags: '["gqa", "attention", "kv-cache", "llama", "efficiency"]',
    theory: `GQA (Ainslie et al. 2023) was introduced in the context of LLaMA 2 70B and is now standard.

**KV cache impact:** In autoregressive generation, the KV cache stores K and V for all previous tokens. For a model with H heads, head dimension d_k, and sequence length L, the KV cache per layer is 2 * H * d_k * L * 2 bytes (FP16). GQA with n_kv_heads = H/4 reduces this 4x.

**Quality vs efficiency:** Multi-Query Attention (MQA, n_kv_heads=1) is the extreme case - one KV head for all queries. It's fast but noticeably degrades quality. GQA is the Pareto-optimal point: 4-8 KV heads typically match MHA quality while giving 4-8x KV cache savings.

**LLaMA 2 70B:** 64 query heads, 8 KV heads. Groups of 8 query heads share 1 KV head. KV cache is 8x smaller than MHA.

**Training:** GQA models can be initialized from MHA checkpoints by mean-pooling the KV heads in each group - this is how LLaMA was converted from MHA to GQA during development.`,
    hints: '["Use np.repeat to expand K and V from (n_kv_heads, seq_len, head_dim) to (n_heads, seq_len, head_dim)", "groups = n_heads // n_kv_heads, then np.repeat(..., repeats=groups, axis=0)", "Apply softmax row-wise over the last axis of the scores matrix"]',
    visualizationComponent: null,
    sortOrder: 3,
    starterCode: `import numpy as np

def softmax(x, axis=-1):
    x = x - np.max(x, axis=axis, keepdims=True)
    e = np.exp(x)
    return e / e.sum(axis=axis, keepdims=True)

def grouped_query_attention(Q, K, V, n_kv_heads):
    """
    Grouped Query Attention.

    Args:
        Q: array of shape (n_heads, seq_len, head_dim)
        K: array of shape (n_kv_heads, seq_len, head_dim)
        V: array of shape (n_kv_heads, seq_len, head_dim)
        n_kv_heads: int, number of KV heads

    Returns:
        array of shape (n_heads, seq_len, head_dim)

    Constraint: n_heads % n_kv_heads == 0
    """
    pass`,
    solution: `\`\`\`python
import numpy as np

def softmax(x, axis=-1):
    x = x - np.max(x, axis=axis, keepdims=True)
    e = np.exp(x)
    return e / e.sum(axis=axis, keepdims=True)

def grouped_query_attention(Q, K, V, n_kv_heads):
    n_heads = Q.shape[0]
    head_dim = Q.shape[-1]
    groups = n_heads // n_kv_heads

    # Expand K and V: each KV head repeated 'groups' times
    K_exp = np.repeat(K, groups, axis=0)  # (n_heads, seq_len, head_dim)
    V_exp = np.repeat(V, groups, axis=0)

    # Scaled dot-product attention per head
    scale = np.sqrt(head_dim)
    # Q: (n_heads, seq_len, head_dim), K_exp.T: (n_heads, head_dim, seq_len)
    scores = Q @ K_exp.transpose(0, 2, 1) / scale  # (n_heads, seq_len, seq_len)
    weights = softmax(scores, axis=-1)
    return weights @ V_exp  # (n_heads, seq_len, head_dim)
\`\`\``,
    testCases: [
      {
        id: "t1",
        name: "GQA 4 heads, 2 KV heads, seq=3",
        inputs: {
          Q: [[[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]], [[0.5, 0.5], [1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]], [[0.5, 0.5], [1.0, 0.0], [0.0, 1.0]]],
          K: [[[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]], [[0.5, 0.5], [1.0, 0.0], [0.0, 1.0]]],
          V: [[[1.0, 0.0], [0.0, 1.0], [0.5, 0.5]], [[0.0, 1.0], [1.0, 0.0], [0.5, 0.5]]],
          n_kv_heads: 2,
        },
        isPublic: true,
      },
      {
        id: "t2",
        name: "MQA (n_kv_heads=1)",
        inputs: {
          Q: [[[1.0, 0.0], [0.0, 1.0]], [[0.5, 0.5], [1.0, 0.0]]],
          K: [[[1.0, 0.0], [0.0, 1.0]]],
          V: [[[1.0, 2.0], [3.0, 4.0]]],
          n_kv_heads: 1,
        },
        isPublic: true,
      },
      {
        id: "t3",
        name: "MHA (n_kv_heads == n_heads)",
        inputs: {
          Q: [[[1.0, 0.0], [0.0, 1.0]], [[0.5, 0.5], [1.0, 0.0]]],
          K: [[[1.0, 0.0], [0.0, 1.0]], [[0.5, 0.5], [1.0, 0.0]]],
          V: [[[1.0, 2.0], [3.0, 4.0]], [[0.0, 1.0], [2.0, 3.0]]],
          n_kv_heads: 2,
        },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "moe-load-balancing",
    type: "coding",
    title: "MoE Router with Load Balancing",
    description: `Implement a Mixture of Experts router with top-k routing and the auxiliary load balancing loss.

The router maps each token to its top-k experts. Without regularization, all tokens route to the same expert (collapse). The load balancing loss penalizes uneven expert usage.

**Router forward pass:**
1. Compute routing logits: \`logits = x @ W_gate\`  (shape: batch × num_experts)
2. Apply softmax to get routing probabilities
3. Select top-k experts per token
4. Renormalize the selected weights to sum to 1

**Load balancing loss (Switch Transformer):**
$$L_{\\text{aux}} = \\text{num\\_experts} \\cdot \\sum_{i=1}^{E} f_i \\cdot p_i$$

where $f_i$ is the fraction of tokens routed to expert $i$, and $p_i$ is the mean routing probability for expert $i$.

\`\`\`python
>>> indices, weights, loss = moe_router(x, W_gate, top_k=2)
# indices: (batch, top_k) int array - which experts
# weights: (batch, top_k) float array - normalized weights
# loss: float - load balancing loss
\`\`\``,
    difficulty: "Hard",
    weekNumber: 16,
    tags: '["moe", "routing", "load-balancing", "mixtral", "deepseek"]',
    theory: `Mixture of Experts (MoE) routes each token to a subset of "expert" FFN layers, enabling models with far more parameters than active compute.

**Why routing collapses:** The router is trained to maximize performance, so it quickly learns which experts are best. Without regularization, all tokens route to the same expert, starving others. The auxiliary loss counteracts this by penalizing high-usage experts.

**Switch Transformer loss:** The loss is $E \\cdot \\sum f_i \\cdot p_i$ where the product $f_i \\cdot p_i$ captures the correlation between actual routing (hard, non-differentiable $f_i$) and routing probability (soft, differentiable $p_i$). Minimizing this encourages the soft probabilities to spread evenly. The $E$ multiplier normalizes for different expert counts.

**Capacity factor:** Each expert processes at most $C = \\text{capacity\\_factor} \\times \\text{batch\\_size} / E$ tokens. Overflow tokens are dropped or routed to a shared expert. This is the tradeoff between efficiency and dropped tokens.

**Mixtral 8x7B:** 8 experts, top-2 routing. 7B active params per token, 46.7B total. Matches GPT-3.5 at ~6x less compute.`,
    hints: '["Apply softmax over axis=1 (across experts) to get routing probabilities", "Use np.argsort(probs, axis=1)[:, -top_k:] to get top-k indices per token", "For load balancing: f = assignment_matrix.mean(axis=0), p = probs.mean(axis=0), loss = num_experts * np.dot(f, p)"]',
    visualizationComponent: null,
    sortOrder: 4,
    starterCode: `import numpy as np

def softmax(x, axis=-1):
    x = x - np.max(x, axis=axis, keepdims=True)
    e = np.exp(x)
    return e / e.sum(axis=axis, keepdims=True)

def moe_router(x, W_gate, top_k):
    """
    MoE top-k router with load balancing loss.

    Args:
        x: array of shape (batch, d_model)
        W_gate: array of shape (d_model, num_experts)
        top_k: int, number of experts per token

    Returns:
        routing_indices: (batch, top_k) int array - expert indices
        routing_weights: (batch, top_k) float array - renormalized weights
        load_balance_loss: float - auxiliary load balancing loss
    """
    pass`,
    solution: `\`\`\`python
import numpy as np

def softmax(x, axis=-1):
    x = x - np.max(x, axis=axis, keepdims=True)
    e = np.exp(x)
    return e / e.sum(axis=axis, keepdims=True)

def moe_router(x, W_gate, top_k):
    x = np.array(x, dtype=np.float64)
    W_gate = np.array(W_gate, dtype=np.float64)
    batch, d_model = x.shape
    num_experts = W_gate.shape[1]

    logits = x @ W_gate  # (batch, num_experts)
    probs = softmax(logits, axis=1)  # (batch, num_experts)

    # Top-k expert indices per token
    indices = np.argsort(probs, axis=1)[:, -top_k:]  # (batch, top_k)

    # Selected weights, renormalized
    selected = np.take_along_axis(probs, indices, axis=1)  # (batch, top_k)
    weights = selected / selected.sum(axis=1, keepdims=True)

    # Load balancing loss
    # f_i: fraction of tokens assigned to expert i
    assignment = np.zeros((batch, num_experts))
    np.put_along_axis(assignment, indices, 1.0, axis=1)
    f = assignment.mean(axis=0)  # (num_experts,)
    p = probs.mean(axis=0)        # (num_experts,)
    load_balance_loss = float(num_experts * np.dot(f, p))

    return indices.tolist(), weights.tolist(), load_balance_loss
\`\`\``,
    testCases: [
      {
        id: "t1",
        name: "Uniform routing (balanced)",
        inputs: {
          x: [[1.0, 0.0], [0.0, 1.0], [1.0, 1.0], [0.5, 0.5]],
          W_gate: [[1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0]],
          top_k: 2,
        },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Collapsed routing (high loss expected)",
        inputs: {
          x: [[1.0, 0.0], [1.0, 0.0], [1.0, 0.0]],
          W_gate: [[10.0, 0.0, 0.0], [0.0, 0.0, 0.0]],
          top_k: 1,
        },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Top-1 routing",
        inputs: {
          x: [[1.0, 2.0, 3.0], [3.0, 2.0, 1.0]],
          W_gate: [[1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0], [0.0, 0.0, 1.0, 0.0]],
          top_k: 1,
        },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "modern-llm-architectures-quiz",
    type: "quiz",
    title: "Modern LLM Architectures",
    description:
      "Test your understanding of the architectural choices in modern LLMs: RMSNorm, SwiGLU, GQA, sliding window attention, and MLA.",
    difficulty: "Medium",
    weekNumber: 16,
    tags: '["architecture", "rms-norm", "swiglu", "gqa", "mla", "llama", "deepseek", "quiz"]',
    theory: `Modern LLMs (LLaMA, Mistral, Qwen, DeepSeek) share a set of architectural improvements over the original transformer:

**Normalization:** RMSNorm replaces LayerNorm. Applied before attention and FFN (pre-norm), not after.

**FFN:** SwiGLU replaces the standard ReLU FFN. Uses three weight matrices with the formula: SwiGLU(x) = SiLU(xW1) ⊙ (xW3) then projected by W2.

**Attention:** GQA reduces the number of KV heads while keeping full query heads, directly shrinking the KV cache. Multi-head Latent Attention (MLA, DeepSeek-V2) goes further by compressing the KV cache through learned low-rank projections.

**Positional encoding:** RoPE (Rotary Position Embeddings) is now standard. It encodes relative positions by rotating query and key vectors, which extrapolates well to longer sequences.

**Sliding window (Mistral):** Tokens attend only to a local window of past tokens, giving O(n) KV cache instead of O(n^2). Combined with a few global attention layers for long-range dependencies.`,
    hints: "[]",
    visualizationComponent: null,
    sortOrder: 5,
    starterCode: null,
    testCases: null,
    questions: [
      {
        id: "llm-int-q1",
        questionNumber: 1,
        questionText: "Why does RMSNorm omit the mean subtraction step present in LayerNorm?",
        options: {
          a: "Mean subtraction causes gradient explosion in deep networks",
          b: "Re-centering (mean subtraction) is empirically unnecessary for stable training, and removing it gives a ~10% speed improvement with no quality loss",
          c: "Mean subtraction requires computing a softmax, which is expensive",
          d: "LayerNorm's mean subtraction breaks the residual connection",
        },
        correctAnswer: "b",
        explanation:
          "RMSNorm (Zhang & Sennrich 2019) ablated the components of LayerNorm and found that re-centering (mean subtraction) contributes almost nothing to training stability, while re-scaling (dividing by RMS) is what matters. Removing it simplifies computation - no mean calculation, no shift parameter - for a ~10% faster normalization op with equivalent results.",
      },
      {
        id: "llm-int-q2",
        questionNumber: 2,
        questionText: "In SwiGLU, why are there THREE weight matrices (W1, W2, W3) instead of the standard two?",
        options: {
          a: "W1 and W3 project to different spaces to catch bugs during training",
          b: "The gating mechanism requires a separate gate projection (W1) and value projection (W3) that are multiplied element-wise before the output projection (W2)",
          c: "SwiGLU expands the FFN to 3 layers instead of 2 for greater depth",
          d: "W3 is a residual connection weight added after the FFN block",
        },
        correctAnswer: "b",
        explanation:
          "SwiGLU implements a gated linear unit: gate = SiLU(x @ W1) and value = x @ W3 are computed independently from the same input. The gate is a data-dependent filter - SiLU values near 0 suppress the value path. The element-wise product gate ⊙ value selects which features to amplify, then W2 projects back to d_model. This gating mechanism gives more expressive power than a simple activation function.",
      },
      {
        id: "llm-int-q3",
        questionNumber: 3,
        questionText: "LLaMA 2 70B uses 64 query heads and 8 KV heads with GQA. How much smaller is the KV cache compared to standard MHA?",
        options: {
          a: "2x smaller",
          b: "4x smaller",
          c: "8x smaller",
          d: "64x smaller",
        },
        correctAnswer: "c",
        explanation:
          "With 64 query heads and 8 KV heads, the ratio is 64/8 = 8. Standard MHA stores K and V for all 64 heads; GQA only stores K and V for 8 heads. The KV cache is therefore 8x smaller. This is critical for long-context inference: a 70B model at 32k context would require 64 * 128 * 32000 * 2 * 2 bytes ≈ 52GB just for KV cache with MHA. GQA brings this to ~6.5GB.",
      },
      {
        id: "llm-int-q4",
        questionNumber: 4,
        questionText: "Mistral uses sliding window attention (SWA) with window size W. What does a token at position i attend to?",
        options: {
          a: "All tokens from 0 to i (causal attention)",
          b: "Only token i itself",
          c: "Tokens in the range [max(0, i-W), i]",
          d: "W randomly selected tokens from the past",
        },
        correctAnswer: "c",
        explanation:
          "Sliding window attention restricts each token to attend only to the W most recent tokens. Token i attends to positions max(0, i-W) through i. This gives O(W) KV cache per layer regardless of total sequence length, vs O(L) for standard attention. For multi-layer models, information can still propagate from far away through multiple layers - each layer can see W tokens back, so a k-layer model effectively covers k*W tokens of context.",
      },
      {
        id: "llm-int-q5",
        questionNumber: 5,
        questionText: "DeepSeek-V2 uses Multi-head Latent Attention (MLA) instead of GQA. What is MLA's key advantage?",
        options: {
          a: "MLA uses more query heads for better attention quality",
          b: "MLA compresses the KV cache through learned low-rank projections, storing a small latent vector per token instead of full K and V tensors",
          c: "MLA eliminates the need for positional encodings entirely",
          d: "MLA applies attention in a higher-dimensional space for better expressivity",
        },
        correctAnswer: "b",
        explanation:
          "MLA (Multi-head Latent Attention) caches a compressed latent vector c per token instead of full K and V tensors. At inference time, K and V are decompressed from c via learned up-projection matrices. The latent dimension is much smaller than n_kv_heads * head_dim, giving even greater KV cache savings than GQA. DeepSeek-V2 achieves ~93% KV cache reduction vs MHA while maintaining quality competitive with MHA.",
      },
    ],
    solution: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "design-modern-llm",
    type: "system_design",
    title: "Design a Modern 7B LLM Architecture",
    description:
      "You are building a 7B parameter autoregressive language model from scratch. Design every architectural decision and justify each choice against the alternatives.",
    difficulty: "Hard",
    weekNumber: 16,
    tags: '["system-design", "architecture", "llm", "transformer", "llama"]',
    theory: `Modern LLMs converge on a similar architecture: pre-norm transformer decoder with RMSNorm, SwiGLU FFN, GQA, RoPE, and causal attention. Understanding WHY these choices were made requires comparing against the alternatives they replaced.

The key insight is that each component change was empirically motivated: RMSNorm over LayerNorm for speed, SwiGLU over GELU for quality per parameter, GQA over MQA for quality with KV cache savings, RoPE over learned embeddings for extrapolation.`,
    hints: "[]",
    visualizationComponent: null,
    sortOrder: 6,
    starterCode: null,
    testCases: null,
    questions: null,
    designPrompt: `Design a 7B parameter transformer language model from scratch, matching the architecture of models like LLaMA 3 8B or Mistral 7B.

**Scale constraints:**
- ~7 billion parameters
- Context window: 8,192 tokens (minimum)
- Target hardware: 1-2x A100 80GB GPUs for inference

**Address each of the following decisions:**

1. **Depth vs width:** How many layers? What d_model? What d_ff? Show the parameter count math. Where do the 7B parameters live?

2. **Normalization:** Which normalization to use (LayerNorm, RMSNorm)? Pre-norm or post-norm? Where does it go relative to attention and FFN?

3. **Attention:** How many query heads? How many KV heads (MHA, GQA, or MQA)? What head dimension? Justify the KV head choice given KV cache constraints.

4. **FFN:** Standard ReLU FFN or SwiGLU? What intermediate dimension? Why?

5. **Positional encoding:** Sinusoidal, learned, RoPE, or ALiBi? Which RoPE base frequency? How do you extend context beyond training length?

6. **Vocabulary:** How large? What tokenizer? What's the tradeoff?

7. **KV cache estimate:** For a batch of 16 requests at 8k context in FP16, how much GPU memory does the KV cache require with your design?`,
    sampleAnswer: `## Architecture Specification

### Depth and Width

| Hyperparameter | Value | Reason |
|---|---|---|
| n_layers | 32 | Standard for 7B scale |
| d_model | 4096 | ~4k hidden dim |
| d_ff | 14336 | 3.5x d_model for SwiGLU |
| n_heads | 32 | head_dim = 128 |
| n_kv_heads | 8 | GQA, 4x KV savings |

**Parameter count:**
- Embeddings: 32000 × 4096 = 131M
- Per layer:
  - Attention (Q+K+V+O): 4096×4096×4 = 67M (with GQA: Q=4096×4096, K/V=4096×1024×2, O=4096×4096 ≈ 50M)
  - SwiGLU FFN: 3 × 4096 × 14336 = 176M
  - RMSNorm ×2: negligible
  - Per layer ≈ 226M
- 32 layers × 226M = 7.2B ✓

### Normalization: RMSNorm, Pre-norm

Pre-norm: place RMSNorm before attention and FFN, not after. Trains more stably because gradients flow directly through residual connections without hitting a normalization layer. Post-norm requires careful initialization and lower learning rates.

RMSNorm over LayerNorm: 10% faster, no measurable quality difference. Remove mean subtraction and shift parameter.

### Attention: GQA with 32Q / 8KV heads

32 query heads, 8 KV heads. Groups of 4 query heads share one KV head. Head dimension = 4096/32 = 128.

MHA (32 KV heads) wastes KV cache memory. MQA (1 KV head) is 3-4% quality degradation on benchmarks. GQA hits the Pareto-optimal point.

RoPE with base=500000 (LLaMA 3 value) for good extrapolation. Use YaRN or rope_scaling for extending beyond 8k at inference time.

### FFN: SwiGLU with d_ff=14336

SwiGLU(x) = SiLU(xW1) ⊙ (xW3) then W2. Three matrices instead of two, so use 14336 (≈3.5×) instead of the standard 4× to match parameter count.

SwiGLU consistently outperforms ReLU and GELU at the same parameter budget. The gating mechanism allows the model to suppress irrelevant features dynamically.

### Vocabulary: 128k tokens, tiktoken-style BPE

Larger vocab = better tokenization of non-English text and code. LLaMA 3 uses 128k tokens. The embedding matrix is 128k × 4096 = 524M params - worth it for 30%+ token efficiency on code.

### KV Cache Estimate

Per layer, per token, FP16:
- K: n_kv_heads × head_dim × 2 bytes = 8 × 128 × 2 = 2048 bytes
- V: same = 2048 bytes
- Total per token per layer: 4096 bytes = 4KB

Batch of 16, 8k context, 32 layers:
- 4KB × 16 requests × 8192 tokens × 32 layers = 16.8 GB

This fits on 2× A100 80GB with room for model weights (~14GB in FP16). With 32 KV heads (MHA), this would be 67GB - would require 4× A100s.`,
    rubric: [
      {
        criterion: "Parameter budget justification",
        weight: 20,
        description: "Shows the math: how d_model, n_layers, d_ff combine to hit ~7B parameters",
        keyPoints: ["Layer count × per-layer params", "Identifies where most params live (FFN)", "Accounts for embedding table"],
      },
      {
        criterion: "Normalization choice",
        weight: 15,
        description: "Chooses pre-norm RMSNorm with correct reasoning",
        keyPoints: ["Pre-norm vs post-norm stability argument", "RMSNorm speed advantage", "No shift parameter"],
      },
      {
        criterion: "Attention design",
        weight: 25,
        description: "Selects GQA with quantitative reasoning about KV cache impact",
        keyPoints: ["GQA vs MHA vs MQA tradeoff", "KV heads justified numerically", "RoPE with reasonable base frequency"],
      },
      {
        criterion: "FFN design",
        weight: 15,
        description: "SwiGLU with correct intermediate dimension adjustment",
        keyPoints: ["3 weight matrices for SwiGLU", "d_ff adjustment for parameter parity", "Gating mechanism explanation"],
      },
      {
        criterion: "KV cache calculation",
        weight: 25,
        description: "Correct numerical estimate for given batch/context/precision",
        keyPoints: ["n_kv_heads × head_dim × 2 per token per layer", "Correct FP16 byte count", "Total within hardware constraints"],
      },
    ],
  },
];
