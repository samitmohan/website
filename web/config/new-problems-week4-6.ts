import type { Problem } from "@/types/problem";

export const NEW_PROBLEMS_4_6: Problem[] = [
  // ========== WEEK 4: GPT & Autoregressive Models ==========
  {
    id: "temperature-sampling",
    type: "coding",
    title: "Temperature and Top-k/Top-p Sampling",
    description: `Implement three decoding strategies for autoregressive language models.

Given a logits array (raw model outputs before softmax), implement:
1. **Temperature scaling:** Divide logits by temperature T before softmax. T>1 flattens the distribution (more random), T<1 sharpens it (more deterministic).
2. **Top-k filtering:** Zero out all logits except the k highest, then sample from the remaining.
3. **Top-p (nucleus) sampling:** Sort tokens by probability descending. Keep the smallest set whose cumulative probability >= p. Zero out the rest, then sample.

Each function returns the index of the sampled token.

**Example:**
\`\`\`python
>>> logits = [2.0, 1.0, 0.5, 0.1, -1.0]
>>> temperature_sample(logits, temperature=0.5)
0  # very likely index 0 since low temp sharpens

>>> top_k_sample(logits, k=2)
# returns 0 or 1 (only top-2 logits kept)

>>> top_p_sample(logits, p=0.9)
# returns 0, 1, or 2 (smallest set with cumprob >= 0.9)
\`\`\``,
    difficulty: "Medium",
    weekNumber: 4,
    tags: '["sampling", "decoding", "temperature", "top-k", "top-p", "gpt"]',
    theory: `Temperature, top-k, and top-p control the randomness of autoregressive text generation.

**Temperature:** Divides logits by T before softmax. T=1 is unchanged. T->0 approaches argmax (greedy). T->inf approaches uniform. The softmax with temperature is: \`p_i = exp(z_i/T) / sum(exp(z_j/T))\`.

**Top-k:** After computing probabilities, keep only the k tokens with highest probability. Renormalize over those k tokens, then sample. Prevents sampling from the long tail of unlikely tokens.

**Top-p (nucleus):** Sort tokens by probability descending. Find the smallest set where cumulative probability >= p. Sample from that set. Adapts the number of candidates dynamically: for peaked distributions, fewer tokens are kept; for flat distributions, more are kept.

In practice, these are often combined: apply temperature first, then top-p or top-k filtering.`,
    hints: '["For temperature: divide logits by T, then apply softmax, then sample using np.random.choice with the probabilities", "For top-k: use np.argsort or np.argpartition to find the top k indices, mask everything else to -inf before softmax", "For top-p: sort probabilities descending, compute cumsum, find the cutoff index where cumsum >= p, mask the rest"]',
    visualizationComponent: "TemperatureSamplingViz",
    sortOrder: 1,
    starterCode: `import numpy as np

def temperature_sample(logits, temperature=1.0):
    """
    Apply temperature scaling to logits and sample a token index.

    Args:
        logits: list or array of raw logits (length V)
        temperature: float > 0, controls randomness

    Returns:
        int - sampled token index
    """
    pass

def top_k_sample(logits, k=10):
    """
    Apply top-k filtering and sample a token index.

    Args:
        logits: list or array of raw logits (length V)
        k: int, number of top tokens to keep

    Returns:
        int - sampled token index
    """
    pass

def top_p_sample(logits, p=0.9):
    """
    Apply top-p (nucleus) filtering and sample a token index.

    Args:
        logits: list or array of raw logits (length V)
        p: float in (0, 1], cumulative probability threshold

    Returns:
        int - sampled token index
    """
    pass`,
    solution: `\`\`\`python
import numpy as np

def softmax(logits):
    logits = np.array(logits, dtype=np.float64)
    shifted = logits - np.max(logits)  # numerical stability
    exp_vals = np.exp(shifted)
    return exp_vals / np.sum(exp_vals)

def temperature_sample(logits, temperature=1.0):
    logits = np.array(logits, dtype=np.float64)
    scaled = logits / temperature
    probs = softmax(scaled)
    return int(np.random.choice(len(probs), p=probs))

def top_k_sample(logits, k=10):
    logits = np.array(logits, dtype=np.float64)
    # Find the k-th largest value as threshold
    top_k_indices = np.argsort(logits)[-k:]
    filtered = np.full_like(logits, -np.inf)
    filtered[top_k_indices] = logits[top_k_indices]
    probs = softmax(filtered)
    return int(np.random.choice(len(probs), p=probs))

def top_p_sample(logits, p=0.9):
    logits = np.array(logits, dtype=np.float64)
    probs = softmax(logits)
    # Sort descending
    sorted_indices = np.argsort(probs)[::-1]
    sorted_probs = probs[sorted_indices]
    cumulative = np.cumsum(sorted_probs)
    # Find cutoff: smallest set with cumprob >= p
    cutoff_idx = np.searchsorted(cumulative, p)
    # Keep tokens up to and including the cutoff
    keep_indices = sorted_indices[:cutoff_idx + 1]
    filtered = np.zeros_like(probs)
    filtered[keep_indices] = probs[keep_indices]
    # Renormalize
    filtered = filtered / np.sum(filtered)
    return int(np.random.choice(len(filtered), p=filtered))
\`\`\`

**Approach:** Each function manipulates the logit/probability distribution to control randomness, then samples from the modified distribution. Temperature scales before softmax. Top-k and top-p filter after softmax, then renormalize.`,
    testCases: [
      {
        id: "t1",
        name: "Temperature=0.01 gives argmax",
        inputs: { logits: [2.0, 1.0, 0.5, 0.1, -1.0], temperature: 0.01 },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Top-k=1 gives argmax",
        inputs: { logits: [2.0, 1.0, 0.5, 0.1, -1.0], k: 1 },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Top-p=0.01 gives argmax",
        inputs: { logits: [2.0, 1.0, 0.5, 0.1, -1.0], p: 0.01 },
        isPublic: false,
      },
      {
        id: "t4",
        name: "Top-k returns valid index",
        inputs: { logits: [0.1, 0.2, 5.0, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9], k: 3 },
        isPublic: false,
      },
      {
        id: "t5",
        name: "Temperature=1.0 preserves distribution",
        inputs: { logits: [1.0, 1.0, 1.0], temperature: 1.0 },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "beam-search",
    type: "coding",
    title: "Beam Search Decoding",
    description: `Implement beam search decoding for autoregressive sequence generation.

Given a scoring function that returns log-probabilities for next tokens and a vocabulary size, generate the best sequence using beam search.

Your implementation should:
1. Maintain \`beam_width\` hypotheses (partial sequences with cumulative log-probability scores).
2. At each step, expand every beam with all possible next tokens.
3. Keep only the top \`beam_width\` beams by cumulative log-probability.
4. Stop when all beams produce the EOS token or max_length is reached.
5. Return the highest-scoring complete sequence.

**Example:**
\`\`\`python
>>> def score_fn(sequence):
...     # Returns log-probs for next tokens [0, 1, 2] where 2=EOS
...     return [-0.5, -1.0, -2.0]
>>> beam_search(score_fn, vocab_size=3, beam_width=2, max_length=5, eos_token=2)
[0, 0, 0, 0, 2]  # greedily picks token 0 each step
\`\`\``,
    difficulty: "Hard",
    weekNumber: 4,
    tags: '["beam-search", "decoding", "sequence-generation", "gpt"]',
    theory: `Greedy decoding picks the single best token at each step. This is locally optimal but can miss globally better sequences.

Beam search maintains k hypotheses (beams) in parallel. At each time step, it expands each beam with all V possible next tokens, creating k*V candidates. It then keeps only the top k by cumulative log-probability.

**Log-probabilities** are used instead of raw probabilities to avoid numerical underflow and convert multiplication into addition: \`log P(seq) = sum(log P(token_i | prefix_i))\`.

**Length normalization** divides the score by sequence length to avoid bias toward shorter sequences. Without it, shorter sequences almost always win because adding log-probs (negative numbers) always decreases the score.

Beam search with beam_width=1 is greedy decoding. Larger beams explore more but cost O(k*V) per step.`,
    hints: '["Use a list of (sequence, score) tuples as your beam. Initialize with a single empty sequence and score 0.0", "At each step, generate all possible extensions: for each beam, get next-token log-probs and create new candidates", "Sort all candidates by score and keep only the top beam_width", "Track completed sequences separately. A beam is complete when it generates the EOS token"]',
    visualizationComponent: "BeamSearchViz",
    sortOrder: 2,
    starterCode: `import numpy as np

def beam_search(score_fn, vocab_size, beam_width=3, max_length=20, eos_token=0):
    """
    Perform beam search decoding.

    Args:
        score_fn: callable that takes a list of token ids (current sequence)
                  and returns a list of log-probabilities for each next token
                  (length = vocab_size)
        vocab_size: int, number of tokens in vocabulary
        beam_width: int, number of beams to maintain
        max_length: int, maximum sequence length
        eos_token: int, end-of-sequence token id

    Returns:
        list[int] - the best decoded sequence (including EOS if found)
    """
    pass`,
    solution: `\`\`\`python
import numpy as np

def beam_search(score_fn, vocab_size, beam_width=3, max_length=20, eos_token=0):
    # Each beam is (sequence, cumulative_log_prob)
    beams = [([], 0.0)]
    completed = []

    for step in range(max_length):
        candidates = []
        for seq, score in beams:
            # If this beam already ended, keep it as-is
            if len(seq) > 0 and seq[-1] == eos_token:
                completed.append((seq, score))
                continue

            # Get log-probs for all next tokens
            log_probs = score_fn(seq)

            for token_id in range(vocab_size):
                new_seq = seq + [token_id]
                new_score = score + log_probs[token_id]
                candidates.append((new_seq, new_score))

        if not candidates:
            break

        # Sort by score (descending) and keep top beam_width
        candidates.sort(key=lambda x: x[1], reverse=True)
        beams = candidates[:beam_width]

        # Check if all beams are completed
        all_done = all(seq[-1] == eos_token for seq, _ in beams)
        if all_done:
            completed.extend(beams)
            break

    # If no completed sequences, use best beam
    if not completed:
        completed = beams

    # Return highest-scoring sequence
    completed.sort(key=lambda x: x[1], reverse=True)
    return completed[0][0]
\`\`\`

**Approach:** Maintain a list of (sequence, score) tuples. At each step, expand every active beam with all vocabulary tokens, accumulating log-probabilities. Keep only the top-k candidates. Track completed beams (those that generated EOS) separately. Return the highest-scoring completed sequence.`,
    testCases: [
      {
        id: "t1",
        name: "Greedy score_fn returns deterministic sequence",
        inputs: { vocab_size: 3, beam_width: 2, max_length: 4, eos_token: 2 },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Beam width 1 equals greedy",
        inputs: { vocab_size: 3, beam_width: 1, max_length: 5, eos_token: 2 },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Beam search finds non-greedy optimum",
        inputs: { vocab_size: 4, beam_width: 3, max_length: 3, eos_token: 3 },
        isPublic: false,
      },
      {
        id: "t4",
        name: "Max length terminates search",
        inputs: { vocab_size: 2, beam_width: 2, max_length: 3, eos_token: 99 },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "perplexity-computation",
    type: "coding",
    title: "Language Model Perplexity",
    description: `Compute the perplexity of a language model given a sequence of token probabilities.

Perplexity measures how "surprised" a model is by a text. Lower perplexity = better model.

**Formula:** \`PPL = exp( -(1/N) * sum(log(p_i)) )\` where \`p_i\` is the model's predicted probability for the i-th token.

Handle edge cases:
- Zero probabilities: clamp to a small epsilon (1e-10)
- Empty sequences: return infinity
- Single token: apply the formula with N=1

**Example:**
\`\`\`python
>>> compute_perplexity([0.5, 0.5, 0.5])
2.0  # uniform binary distribution -> PPL = 2

>>> compute_perplexity([1.0, 1.0, 1.0])
1.0  # perfect predictions -> PPL = 1

>>> compute_perplexity([0.1, 0.1, 0.1])
10.0  # low confidence -> high perplexity
\`\`\``,
    difficulty: "Medium",
    weekNumber: 4,
    tags: '["perplexity", "evaluation", "language-model", "gpt"]',
    theory: `Perplexity is the standard intrinsic evaluation metric for language models. It measures the model's average "surprise" per token.

**Formula:** \`PPL = exp(H)\` where \`H = -(1/N) * sum(log(p_i))\` is the cross-entropy. Each \`p_i\` is the probability the model assigned to the actual next token.

**Intuition:** A model with PPL=10 is "as confused as if it were choosing uniformly among 10 options at each step." PPL=1 means the model predicts every token with 100% confidence.

**Benchmarks:** GPT-2 achieved ~35 PPL on WikiText-103. GPT-3 got ~20. State-of-the-art models get <10 on common benchmarks. PPL is useful for comparing models on the same dataset but does not directly measure generation quality.

**Numerical stability:** Always use log-space computation. Clamp zero probabilities to epsilon to avoid log(0) = -inf.`,
    hints: '["Use np.log on the probabilities, then compute the mean of the negative log-probs, then exponentiate", "Clamp probabilities with np.maximum(probs, 1e-10) before taking log to handle zeros", "Remember: PPL = exp(cross_entropy) where cross_entropy = -(1/N) * sum(log(p_i))"]',
    visualizationComponent: "PerplexityViz",
    sortOrder: 3,
    starterCode: `import numpy as np

def compute_perplexity(token_probs):
    """
    Compute perplexity from a list of token probabilities.

    Args:
        token_probs: list of floats, each in [0, 1], representing
                     the model's predicted probability for each token
                     in the sequence.

    Returns:
        float - the perplexity value
    """
    pass`,
    solution: `\`\`\`python
import numpy as np

def compute_perplexity(token_probs):
    if len(token_probs) == 0:
        return float('inf')

    probs = np.array(token_probs, dtype=np.float64)
    # Clamp to avoid log(0)
    probs = np.maximum(probs, 1e-10)

    N = len(probs)
    log_probs = np.log(probs)
    cross_entropy = -np.sum(log_probs) / N
    perplexity = np.exp(cross_entropy)

    return float(perplexity)
\`\`\`

**Approach:** Convert probabilities to log-space (with epsilon clamping), compute the average negative log-likelihood (cross-entropy), then exponentiate. This is numerically stable because we work in log-space throughout. The formula \`exp(-mean(log(p)))\` is equivalent to the geometric mean of \`1/p_i\`, which captures the model's average uncertainty.`,
    testCases: [
      {
        id: "t1",
        name: "Uniform binary probs -> PPL=2",
        inputs: { token_probs: [0.5, 0.5, 0.5] },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Perfect predictions -> PPL=1",
        inputs: { token_probs: [1.0, 1.0, 1.0] },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Low confidence -> high PPL",
        inputs: { token_probs: [0.1, 0.1, 0.1] },
        isPublic: false,
      },
      {
        id: "t4",
        name: "Empty sequence -> infinity",
        inputs: { token_probs: [] },
        isPublic: false,
      },
      {
        id: "t5",
        name: "Mixed probabilities",
        inputs: { token_probs: [0.9, 0.3, 0.7, 0.5] },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "decoding-strategies-quiz",
    type: "quiz",
    title: "Decoding & Generation Strategies",
    description:
      "Test your understanding of greedy decoding, beam search, temperature scaling, top-k, top-p sampling, and repetition penalties in autoregressive language models.",
    difficulty: "Medium",
    weekNumber: 4,
    tags: '["decoding", "sampling", "beam-search", "temperature", "quiz"]',
    theory: `Autoregressive models generate text one token at a time, choosing from a probability distribution at each step. The decoding strategy determines how that choice is made.

**Greedy:** Always pick the highest-probability token. Fast but often repetitive and misses globally better sequences.

**Beam search:** Maintain k hypotheses in parallel. Better than greedy for tasks with a single "correct" output (translation, summarization). Can still be repetitive.

**Temperature:** Scales logits before softmax. T<1 sharpens the distribution (more confident picks). T>1 flattens it (more creative/random). T=0 is equivalent to greedy.

**Top-k:** Only sample from the k most likely tokens. Prevents rare garbage tokens. Downside: fixed k doesn't adapt to the shape of the distribution.

**Top-p (nucleus):** Sample from the smallest set of tokens whose cumulative probability exceeds p. Adapts naturally: peaked distributions use fewer tokens, flat distributions use more.

**Repetition penalty:** Divides the logits of previously generated tokens by a factor > 1, making them less likely to appear again. Helps prevent degenerate loops.`,
    hints: "[]",
    visualizationComponent: "DecodingStrategiesViz",
    sortOrder: 4,
    starterCode: null,
    testCases: null,
    questions: [
      {
        id: "q1",
        questionNumber: 1,
        questionText: "What is the main advantage of beam search over greedy decoding?",
        options: {
          a: "Beam search is faster because it processes fewer tokens",
          b: "Beam search explores multiple hypotheses and can find globally better sequences",
          c: "Beam search always produces more creative and diverse text",
          d: "Beam search uses less memory than greedy decoding",
        },
        correctAnswer: "b",
        explanation:
          "Beam search maintains k hypotheses simultaneously, exploring different paths through the search space. While greedy decoding commits to the single best token at each step (locally optimal), beam search can discover sequences where a locally suboptimal token leads to a better overall sequence.",
      },
      {
        id: "q2",
        questionNumber: 2,
        questionText: "What happens when you set temperature T=0.1 during sampling?",
        options: {
          a: "The output becomes more random and creative",
          b: "The distribution flattens, giving all tokens roughly equal probability",
          c: "The distribution becomes very peaked, almost always selecting the top token",
          d: "The model stops generating after a few tokens",
        },
        correctAnswer: "c",
        explanation:
          "Low temperature (T<1) sharpens the probability distribution by amplifying the differences between logits. At T=0.1, the highest-logit token dominates with near-100% probability. In the limit T->0, this becomes greedy decoding (argmax).",
      },
      {
        id: "q3",
        questionNumber: 3,
        questionText: "Why is top-p (nucleus) sampling generally preferred over top-k?",
        options: {
          a: "Top-p is faster to compute because it avoids sorting",
          b: "Top-p adapts the number of candidate tokens based on how peaked or flat the distribution is",
          c: "Top-p always produces higher quality text than top-k",
          d: "Top-p uses less memory because it keeps fewer tokens",
        },
        correctAnswer: "b",
        explanation:
          "Top-p dynamically adjusts the candidate set size. When the model is confident (peaked distribution), only a few tokens cross the cumulative threshold - keeping outputs focused. When the model is uncertain (flat distribution), more tokens are included - allowing diversity. Top-k uses a fixed number regardless of distribution shape, which can be too restrictive or too loose.",
      },
      {
        id: "q4",
        questionNumber: 4,
        questionText: "A repetition penalty modifies generation by:",
        options: {
          a: "Removing all previously generated tokens from the vocabulary permanently",
          b: "Dividing the logits of previously seen tokens by a factor > 1, reducing their probability",
          c: "Adding random noise to all logits to increase diversity",
          d: "Shortening the context window to forget earlier tokens",
        },
        correctAnswer: "b",
        explanation:
          "Repetition penalty divides the logits of tokens that already appear in the generated sequence by a penalty factor (typically 1.1-1.3). This makes them less likely but not impossible to generate again. This prevents the common failure mode of autoregressive models getting stuck in degenerate loops.",
      },
      {
        id: "q5",
        questionNumber: 5,
        questionText: "For a factual Q&A system, which decoding configuration would you use?",
        options: {
          a: "Temperature=1.5 with top-p=0.95 for maximum creativity",
          b: "Low temperature (0.1-0.3) or beam search for deterministic, accurate answers",
          c: "Top-k=1000 to explore as many options as possible",
          d: "Random sampling without any filtering for natural-sounding responses",
        },
        correctAnswer: "b",
        explanation:
          "Factual Q&A needs deterministic, accurate outputs. Low temperature sharpens the distribution toward the most likely (hopefully correct) answer. Beam search explores multiple hypotheses to find the globally best sequence. Creative tasks benefit from higher temperature and broader sampling; factual tasks need precision.",
      },
    ],
    solution: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },

  // ========== WEEK 5: Fine-Tuning & RLHF ==========
  {
    id: "qlora-quantization",
    type: "coding",
    title: "4-bit Quantization for QLoRA",
    description: `Implement absmax quantization to compress float32 weights into 4-bit integers, then dequantize back and measure the error.

**4-bit absmax quantization:**
1. Compute the scale factor: \`scale = max(|W|)\`
2. Quantize: \`W_q = round(W / scale * 7)\` (maps to integers in [-7, 7], using 4-bit signed range)
3. Clamp to [-8, 7] (4-bit signed integer range)

**Dequantization:** \`W_approx = W_q * scale / 7\`

Implement three functions:
- \`quantize_absmax(weights)\` - returns (quantized_weights, scale)
- \`dequantize(quantized_weights, scale)\` - returns approximate float weights
- \`quantization_error(original, dequantized)\` - returns mean absolute error

**Example:**
\`\`\`python
>>> W = np.array([1.0, -0.5, 0.3, -0.8, 0.0])
>>> W_q, scale = quantize_absmax(W)
>>> W_q
array([ 7, -4,  2, -6,  0])
>>> W_approx = dequantize(W_q, scale)
>>> quantization_error(W, W_approx)
0.028...  # small reconstruction error
\`\`\``,
    difficulty: "Hard",
    weekNumber: 5,
    tags: '["quantization", "qlora", "compression", "fine-tuning"]',
    theory: `Quantization reduces model size by representing weights with fewer bits. A float32 weight uses 32 bits; 4-bit quantization compresses this 8x.

**Absmax quantization:** Scale weights so the largest absolute value maps to the maximum integer value. For 4-bit signed integers, the range is [-8, 7]. We use [-7, 7] symmetrically for simplicity: \`scale = max(|W|)\`, \`q = round(W / scale * 7)\`.

**QLoRA insight:** Quantize the frozen base model to 4-bit, then train small LoRA adapters in float16. This lets you fine-tune a 65B model on a single 48GB GPU. The 4-bit weights are never updated during training - only the LoRA adapters are.

**Block-wise quantization:** In practice, quantization is done per block (e.g., 64 weights share one scale factor). This reduces error because each block's scale matches its local range. NF4 (NormalFloat4) uses a non-uniform quantization grid optimized for normally distributed weights.`,
    hints: '["scale = np.max(np.abs(weights)). Handle the case where scale is 0 to avoid division by zero", "Quantize: np.round(weights / scale * 7).astype(np.int8) then np.clip to [-8, 7]", "Dequantize: quantized.astype(np.float64) * scale / 7", "Error: np.mean(np.abs(original - dequantized))"]',
    visualizationComponent: "QuantizationViz",
    sortOrder: 5,
    starterCode: `import numpy as np

def quantize_absmax(weights):
    """
    Quantize float32 weights to 4-bit integers using absmax scaling.

    Args:
        weights: numpy array of float32 weights

    Returns:
        tuple of (quantized_weights as int8 array, scale as float)
    """
    pass

def dequantize(quantized_weights, scale):
    """
    Dequantize 4-bit integers back to approximate float values.

    Args:
        quantized_weights: int8 numpy array
        scale: float scale factor from quantization

    Returns:
        numpy array of approximate float weights
    """
    pass

def quantization_error(original, dequantized):
    """
    Compute the mean absolute error between original and dequantized weights.

    Args:
        original: numpy array of original float weights
        dequantized: numpy array of dequantized weights

    Returns:
        float - mean absolute error
    """
    pass`,
    solution: `\`\`\`python
import numpy as np

def quantize_absmax(weights):
    weights = np.array(weights, dtype=np.float64)
    scale = np.max(np.abs(weights))
    if scale == 0:
        return np.zeros_like(weights, dtype=np.int8), 0.0
    # Map to [-7, 7] range and round to integers
    quantized = np.round(weights / scale * 7.0)
    # Clamp to 4-bit signed range [-8, 7]
    quantized = np.clip(quantized, -8, 7).astype(np.int8)
    return quantized, float(scale)

def dequantize(quantized_weights, scale):
    return quantized_weights.astype(np.float64) * scale / 7.0

def quantization_error(original, dequantized):
    original = np.array(original, dtype=np.float64)
    dequantized = np.array(dequantized, dtype=np.float64)
    return float(np.mean(np.abs(original - dequantized)))
\`\`\`

**Approach:** Absmax maps the largest absolute weight to 7 (or -7). Every other weight is scaled proportionally and rounded to the nearest integer. Dequantization reverses the scaling. The error comes from rounding: each weight can be off by at most \`scale / 14\` (half a quantization step). For normally distributed weights, the average error is much smaller.`,
    testCases: [
      {
        id: "t1",
        name: "Simple quantize and dequantize",
        inputs: { weights: [1.0, -0.5, 0.3, -0.8, 0.0] },
        isPublic: true,
      },
      {
        id: "t2",
        name: "All zeros",
        inputs: { weights: [0.0, 0.0, 0.0] },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Large range weights",
        inputs: { weights: [10.0, -10.0, 5.0, -5.0, 0.1] },
        isPublic: false,
      },
      {
        id: "t4",
        name: "Small weights near zero",
        inputs: { weights: [0.001, -0.002, 0.003, -0.001] },
        isPublic: false,
      },
      {
        id: "t5",
        name: "Single weight",
        inputs: { weights: [3.14] },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "sft-data-preparation",
    type: "coding",
    title: "SFT Training Data Formatting",
    description: `Convert instruction/input/output triplets into chat-formatted training data with proper template markers.

Implement a function that takes a list of conversation examples and formats them using a chat template with special tokens.

Each example is a dict with:
- \`system\` (optional): system prompt
- \`conversations\`: list of \`{"role": "user"|"assistant", "content": "..."}\`

Output each example as a single formatted string using these markers:
\`<|system|>\\n{system_prompt}<|end|>\\n<|user|>\\n{user_msg}<|end|>\\n<|assistant|>\\n{assistant_msg}<|end|>\`

Also implement a function to validate the formatted data (check for missing roles, empty content, proper alternation).

**Example:**
\`\`\`python
>>> example = {
...     "system": "You are a helpful assistant.",
...     "conversations": [
...         {"role": "user", "content": "What is 2+2?"},
...         {"role": "assistant", "content": "4"}
...     ]
... }
>>> format_chat(example)
'<|system|>\\nYou are a helpful assistant.<|end|>\\n<|user|>\\nWhat is 2+2?<|end|>\\n<|assistant|>\\n4<|end|>'
\`\`\``,
    difficulty: "Easy",
    weekNumber: 5,
    tags: '["sft", "data-preparation", "chat-template", "fine-tuning"]',
    theory: `Supervised fine-tuning (SFT) teaches a base model to follow instructions by training on (instruction, response) pairs formatted with special tokens.

**Chat templates** wrap messages in role markers so the model learns the turn-taking structure. Different models use different templates (ChatML, Llama, Alpaca). The template must be identical during training and inference.

**Data quality matters more than quantity.** Research shows that 1,000 high-quality instruction pairs can outperform 50,000 noisy ones (the LIMA paper). Each example should have a clear instruction, correct response, and consistent formatting.

**Multi-turn conversations** require proper alternation: user, assistant, user, assistant. The model learns to predict only the assistant turns; user turns and system prompts are part of the context but not the training target.`,
    hints: '["Build the output string by iterating through the conversations list and wrapping each message in its role markers", "Handle the optional system prompt first - only include the <|system|> block if system is provided", "For validation: check that roles alternate user/assistant and that the first role is user"]',
    visualizationComponent: "SFTDataViz",
    sortOrder: 6,
    starterCode: `def format_chat(example):
    """
    Format a conversation example into a chat template string.

    Args:
        example: dict with optional 'system' key and 'conversations' list
                 conversations: [{"role": "user"|"assistant", "content": str}, ...]

    Returns:
        str - formatted chat string with special tokens
    """
    pass

def validate_chat(example):
    """
    Validate a conversation example for correctness.

    Checks:
    - conversations list is non-empty
    - roles alternate between user and assistant
    - first message is from user
    - no empty content strings

    Args:
        example: dict with 'conversations' list

    Returns:
        tuple of (is_valid: bool, errors: list[str])
    """
    pass`,
    solution: `\`\`\`python
def format_chat(example):
    parts = []

    # Optional system prompt
    if "system" in example and example["system"]:
        parts.append(f"<|system|>\\n{example['system']}<|end|>")

    # Conversation turns
    for msg in example["conversations"]:
        role = msg["role"]
        content = msg["content"]
        parts.append(f"<|{role}|>\\n{content}<|end|>")

    return "\\n".join(parts)

def validate_chat(example):
    errors = []
    convos = example.get("conversations", [])

    if not convos:
        return False, ["conversations list is empty"]

    # First message must be from user
    if convos[0]["role"] != "user":
        errors.append("first message must be from user")

    # Check alternation and content
    expected_role = "user"
    for i, msg in enumerate(convos):
        if not msg.get("content", "").strip():
            errors.append(f"message {i} has empty content")
        if msg["role"] != expected_role:
            errors.append(f"message {i}: expected role '{expected_role}', got '{msg['role']}'")
        expected_role = "assistant" if expected_role == "user" else "user"

    is_valid = len(errors) == 0
    return is_valid, errors
\`\`\`

**Approach:** Build the formatted string by iterating through the conversation and wrapping each message in \`<|role|>\\ncontent<|end|>\` markers. The validator checks structural invariants: non-empty conversations, user-first ordering, strict role alternation, and no empty messages.`,
    testCases: [
      {
        id: "t1",
        name: "Basic user-assistant pair with system",
        inputs: {
          example: {
            system: "You are a helpful assistant.",
            conversations: [
              { role: "user", content: "Hi" },
              { role: "assistant", content: "Hello!" },
            ],
          },
        },
        isPublic: true,
      },
      {
        id: "t2",
        name: "No system prompt",
        inputs: {
          example: {
            conversations: [
              { role: "user", content: "What is AI?" },
              { role: "assistant", content: "Artificial intelligence." },
            ],
          },
        },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Multi-turn conversation",
        inputs: {
          example: {
            system: "Be concise.",
            conversations: [
              { role: "user", content: "Count to 3" },
              { role: "assistant", content: "1, 2, 3" },
              { role: "user", content: "Now backwards" },
              { role: "assistant", content: "3, 2, 1" },
            ],
          },
        },
        isPublic: false,
      },
      {
        id: "t4",
        name: "Validation catches wrong first role",
        inputs: {
          example: {
            conversations: [
              { role: "assistant", content: "I start first" },
              { role: "user", content: "That is wrong" },
            ],
          },
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
    id: "ppo-reward-model",
    type: "coding",
    title: "Reward Model for RLHF",
    description: `Implement a feature-based reward scoring function for RLHF.

Given a prompt and a response, compute a reward score based on multiple features:
1. **Length appropriateness:** Penalize too-short (<20 chars) and too-long (>500 chars) responses
2. **Keyword relevance:** Fraction of prompt keywords (words > 3 chars) found in the response
3. **Format compliance:** Bonus for using proper structure (sentences ending with periods, paragraphs)
4. **Helpfulness proxy:** Penalty for refusal phrases ("I cannot", "I'm sorry, but")

Then implement Bradley-Terry preference probability: given rewards for a chosen and rejected response, compute \`P(chosen > rejected) = sigmoid(r_chosen - r_rejected)\`.

**Example:**
\`\`\`python
>>> score = compute_reward("Explain gradient descent", "Gradient descent is an optimization algorithm that iteratively adjusts parameters by moving in the direction of steepest decrease of the loss function.")
>>> score
0.72  # good length, relevant, well-formatted

>>> preference_prob(0.8, 0.3)
0.622  # sigmoid(0.5)
\`\`\``,
    difficulty: "Medium",
    weekNumber: 5,
    tags: '["rlhf", "reward-model", "ppo", "alignment"]',
    theory: `The reward model is the core component of RLHF. It learns to score responses according to human preferences.

**Training data:** Humans see a prompt and two responses, then pick which is better. This creates preference pairs: (prompt, chosen_response, rejected_response).

**Bradley-Terry model:** The probability that response A is preferred over B is modeled as: \`P(A > B) = sigmoid(r(A) - r(B))\` where r() is the reward model's scalar score. Training maximizes the log-likelihood of the observed preferences.

**Reward features in practice:** Real reward models use a transformer that encodes (prompt, response) and outputs a scalar. Our simplified version uses hand-crafted features to build intuition for what "good" means: relevance, format, appropriate length, helpfulness.

**Reward hacking:** The policy can learn to exploit the reward model by generating adversarial outputs that score high but are actually bad. The KL penalty in PPO constrains the policy to stay close to the SFT model, limiting exploitation.`,
    hints: '["Break the reward into additive components: length_score + relevance_score + format_score + helpfulness_score", "For keyword relevance: extract words > 3 chars from prompt, count how many appear in response.lower()", "For Bradley-Terry: sigmoid(x) = 1 / (1 + exp(-x)), applied to the reward difference"]',
    visualizationComponent: "RewardModelViz",
    sortOrder: 7,
    starterCode: `import numpy as np

def compute_reward(prompt, response):
    """
    Compute a reward score for a (prompt, response) pair.

    Features:
    - Length appropriateness (0 to 0.3): penalize < 20 or > 500 chars
    - Keyword relevance (0 to 0.3): fraction of prompt keywords in response
    - Format compliance (0 to 0.2): proper sentences, punctuation
    - Helpfulness (0 to 0.2): penalty for refusal phrases

    Args:
        prompt: str
        response: str

    Returns:
        float - reward score roughly in [0, 1]
    """
    pass

def preference_prob(reward_chosen, reward_rejected):
    """
    Compute Bradley-Terry preference probability.

    P(chosen > rejected) = sigmoid(reward_chosen - reward_rejected)

    Args:
        reward_chosen: float, reward for the preferred response
        reward_rejected: float, reward for the rejected response

    Returns:
        float - probability in (0, 1)
    """
    pass`,
    solution: `\`\`\`python
import numpy as np

def compute_reward(prompt, response):
    # 1. Length appropriateness (0 to 0.3)
    resp_len = len(response)
    if resp_len < 20:
        length_score = 0.05
    elif resp_len > 500:
        length_score = 0.1
    elif 50 <= resp_len <= 300:
        length_score = 0.3  # sweet spot
    else:
        length_score = 0.2

    # 2. Keyword relevance (0 to 0.3)
    prompt_words = set(w.lower() for w in prompt.split() if len(w) > 3)
    if prompt_words:
        response_lower = response.lower()
        matches = sum(1 for w in prompt_words if w in response_lower)
        relevance_score = 0.3 * (matches / len(prompt_words))
    else:
        relevance_score = 0.15  # neutral if no keywords

    # 3. Format compliance (0 to 0.2)
    format_score = 0.0
    sentences = response.split(".")
    # Has proper sentence endings
    if response.strip().endswith(".") or response.strip().endswith("!") or response.strip().endswith("?"):
        format_score += 0.1
    # Has multiple sentences (indicates structured answer)
    if len([s for s in sentences if s.strip()]) >= 2:
        format_score += 0.05
    # Starts with capital letter
    if response and response[0].isupper():
        format_score += 0.05

    # 4. Helpfulness (0 to 0.2) - penalize refusals
    helpfulness_score = 0.2
    refusal_phrases = ["i cannot", "i'm sorry, but", "i am sorry", "i'm unable", "as an ai"]
    response_lower = response.lower()
    for phrase in refusal_phrases:
        if phrase in response_lower:
            helpfulness_score = 0.0
            break

    return length_score + relevance_score + format_score + helpfulness_score

def preference_prob(reward_chosen, reward_rejected):
    diff = reward_chosen - reward_rejected
    return 1.0 / (1.0 + np.exp(-diff))
\`\`\`

**Approach:** The reward function sums four sub-scores: length appropriateness (penalizing extreme lengths), keyword relevance (how many prompt keywords appear in the response), format compliance (proper punctuation and structure), and helpfulness (penalizing refusal patterns). The Bradley-Terry probability is a simple sigmoid of the reward difference.`,
    testCases: [
      {
        id: "t1",
        name: "Good response scores high",
        inputs: {
          prompt: "Explain gradient descent",
          response:
            "Gradient descent is an optimization algorithm that iteratively adjusts parameters by moving in the direction of steepest decrease of the loss function. It computes the gradient of the loss and updates weights proportionally.",
        },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Refusal scores low",
        inputs: {
          prompt: "Explain gradient descent",
          response: "I'm sorry, but I cannot help with that.",
        },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Preference prob with equal rewards",
        inputs: { reward_chosen: 0.5, reward_rejected: 0.5 },
        isPublic: false,
      },
      {
        id: "t4",
        name: "Preference prob with large difference",
        inputs: { reward_chosen: 1.0, reward_rejected: 0.0 },
        isPublic: false,
      },
      {
        id: "t5",
        name: "Very short response penalized",
        inputs: { prompt: "What is ML?", response: "Stuff." },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "catastrophic-forgetting",
    type: "coding",
    title: "Catastrophic Forgetting and EWC",
    description: `Demonstrate catastrophic forgetting and implement Elastic Weight Consolidation (EWC) to mitigate it.

Implement:
1. **train_on_task:** A simple gradient descent step that updates weights to minimize MSE loss for a given dataset.
2. **compute_fisher_information:** Estimate Fisher information (importance of each weight for a task) as the squared gradient averaged over the dataset.
3. **train_with_ewc:** Train on a new task with an EWC penalty that prevents important weights from changing.

The EWC loss: \`L_total = L_new_task + (lambda/2) * sum(F_i * (theta_i - theta_star_i)^2)\`
where \`F_i\` is Fisher information, \`theta_star\` is the optimal weights for the old task.

**Example:**
\`\`\`python
>>> W = np.array([1.0, 2.0, 3.0])
>>> # Train on task A, compute Fisher, then train on task B with EWC
>>> W_a = train_on_task(W, X_a, y_a, lr=0.01, steps=100)
>>> fisher = compute_fisher_information(W_a, X_a, y_a)
>>> W_b = train_with_ewc(W_a, X_b, y_b, fisher, W_a, ewc_lambda=1.0, lr=0.01, steps=100)
\`\`\``,
    difficulty: "Medium",
    weekNumber: 5,
    tags: '["catastrophic-forgetting", "ewc", "continual-learning", "fine-tuning"]',
    theory: `When a neural network learns task B after task A, it overwrites the weights that encoded task A. This is catastrophic forgetting.

**Elastic Weight Consolidation (EWC)** prevents this by adding a penalty for changing weights that were important for task A. "Importance" is measured by the Fisher information matrix - the expected squared gradient.

**EWC loss:** \`L = L_B + (lambda/2) * sum(F_i * (theta_i - theta_A_i)^2)\`

Weights with high Fisher information (large gradient variance on task A) are "elastic" - they resist being changed. Weights with low Fisher information can freely adapt to task B.

**Intuition:** EWC finds a point in weight space that works for both tasks by staying close to the task-A solution along dimensions that matter for task A, while moving freely in dimensions that don't.

Lambda controls the tradeoff: too high and the model cannot learn task B; too low and it forgets task A.`,
    hints: '["For train_on_task: compute gradient of MSE loss = X.T @ (X @ W - y) / N, then update W -= lr * grad", "Fisher information: for each data point, compute the gradient of the loss, square it element-wise, then average across all data points", "EWC gradient adds lambda * F * (W - W_star) to the task B gradient", "Use a simple linear model: predictions = X @ W, loss = mean((predictions - y)^2)"]',
    visualizationComponent: "CatastrophicForgettingViz",
    sortOrder: 8,
    starterCode: `import numpy as np

def train_on_task(W, X, y, lr=0.01, steps=100):
    """
    Train weights W on a linear regression task using gradient descent.

    Model: predictions = X @ W
    Loss: MSE = mean((predictions - y)^2)

    Args:
        W: numpy array of shape (D,), initial weights
        X: numpy array of shape (N, D), input features
        y: numpy array of shape (N,), targets
        lr: float, learning rate
        steps: int, number of gradient descent steps

    Returns:
        numpy array of shape (D,) - updated weights
    """
    pass

def compute_fisher_information(W, X, y):
    """
    Estimate diagonal Fisher information for each weight.

    For each data point, compute the gradient of the loss w.r.t. W,
    square it element-wise, then average across all data points.

    Args:
        W: numpy array of shape (D,)
        X: numpy array of shape (N, D)
        y: numpy array of shape (N,)

    Returns:
        numpy array of shape (D,) - Fisher information per weight
    """
    pass

def train_with_ewc(W, X, y, fisher, W_star, ewc_lambda=1.0, lr=0.01, steps=100):
    """
    Train on a new task with EWC regularization.

    L_total = L_task + (ewc_lambda/2) * sum(fisher_i * (W_i - W_star_i)^2)

    Args:
        W: numpy array of shape (D,), initial weights (copy of W_star)
        X: numpy array of shape (N, D), new task inputs
        y: numpy array of shape (N,), new task targets
        fisher: numpy array of shape (D,), Fisher information from old task
        W_star: numpy array of shape (D,), optimal weights for old task
        ewc_lambda: float, EWC penalty strength
        lr: float, learning rate
        steps: int, number of gradient descent steps

    Returns:
        numpy array of shape (D,) - updated weights
    """
    pass`,
    solution: `\`\`\`python
import numpy as np

def train_on_task(W, X, y, lr=0.01, steps=100):
    W = W.copy().astype(np.float64)
    X = np.array(X, dtype=np.float64)
    y = np.array(y, dtype=np.float64)
    N = X.shape[0]

    for _ in range(steps):
        predictions = X @ W
        error = predictions - y
        # Gradient of MSE: (2/N) * X.T @ error
        grad = (2.0 / N) * (X.T @ error)
        W -= lr * grad

    return W

def compute_fisher_information(W, X, y):
    W = np.array(W, dtype=np.float64)
    X = np.array(X, dtype=np.float64)
    y = np.array(y, dtype=np.float64)
    N = X.shape[0]

    fisher = np.zeros_like(W)
    for i in range(N):
        pred = X[i] @ W
        error = pred - y[i]
        # Gradient for single data point: 2 * error * X[i]
        grad_i = 2.0 * error * X[i]
        fisher += grad_i ** 2

    fisher /= N
    return fisher

def train_with_ewc(W, X, y, fisher, W_star, ewc_lambda=1.0, lr=0.01, steps=100):
    W = W.copy().astype(np.float64)
    X = np.array(X, dtype=np.float64)
    y = np.array(y, dtype=np.float64)
    fisher = np.array(fisher, dtype=np.float64)
    W_star = np.array(W_star, dtype=np.float64)
    N = X.shape[0]

    for _ in range(steps):
        predictions = X @ W
        error = predictions - y
        # Task gradient
        task_grad = (2.0 / N) * (X.T @ error)
        # EWC penalty gradient: lambda * F * (W - W_star)
        ewc_grad = ewc_lambda * fisher * (W - W_star)
        # Total gradient
        W -= lr * (task_grad + ewc_grad)

    return W
\`\`\`

**Approach:** Standard gradient descent for the task loss, plus the EWC penalty gradient. The Fisher information is estimated as the mean of squared per-sample gradients. Weights with high Fisher values resist change because the EWC gradient pushes them back toward W_star proportionally to their importance.`,
    testCases: [
      {
        id: "t1",
        name: "Train reduces MSE loss",
        inputs: {
          W: [0.0, 0.0],
          X: [
            [1.0, 0.0],
            [0.0, 1.0],
            [1.0, 1.0],
          ],
          y: [1.0, 2.0, 3.0],
          lr: 0.1,
          steps: 200,
        },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Fisher is non-negative",
        inputs: {
          W: [1.0, 2.0],
          X: [
            [1.0, 0.5],
            [0.3, 1.0],
          ],
          y: [1.5, 2.3],
        },
        isPublic: true,
      },
      {
        id: "t3",
        name: "EWC preserves old task weights",
        inputs: {
          W: [1.0, 2.0],
          X_new: [
            [1.0, 0.0],
            [0.0, 1.0],
          ],
          y_new: [5.0, 5.0],
          ewc_lambda: 100.0,
          lr: 0.01,
          steps: 50,
        },
        isPublic: false,
      },
      {
        id: "t4",
        name: "Zero lambda = no EWC effect",
        inputs: {
          W: [1.0, 2.0],
          X_new: [
            [1.0, 0.0],
            [0.0, 1.0],
          ],
          y_new: [5.0, 5.0],
          ewc_lambda: 0.0,
          lr: 0.01,
          steps: 100,
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
    id: "rlhf-pipeline-design",
    type: "system_design",
    title: "Design an RLHF Training Pipeline",
    description:
      "Design a complete RLHF training pipeline including supervised fine-tuning, reward model training, PPO optimization, and safety constraints.",
    difficulty: "Hard",
    weekNumber: 5,
    tags: '["rlhf", "system-design", "alignment", "ppo"]',
    theory: `RLHF (Reinforcement Learning from Human Feedback) aligns language models to human preferences through three stages: SFT, reward modeling, and PPO.

**Stage 1 - SFT:** Fine-tune a base model on high-quality instruction-response pairs. This gives the model a strong starting point before RL optimization.

**Stage 2 - Reward Model:** Train a separate model on human preference data (chosen vs rejected responses). It learns to output a scalar reward that correlates with human judgment.

**Stage 3 - PPO:** The SFT model generates responses, the reward model scores them, and PPO updates the policy to maximize reward. A KL penalty prevents the policy from diverging too far from the SFT model (which would cause reward hacking).

**KL penalty:** \`L = -reward + beta * KL(policy || SFT_model)\`. Without this, the policy finds adversarial inputs that exploit reward model weaknesses.`,
    hints: '["Address all three stages: SFT, reward model training, and PPO optimization", "Discuss how to prevent reward hacking with KL divergence constraints", "Consider safety: how do you ensure the model does not generate harmful content during RL exploration?"]',
    visualizationComponent: "RLHFPipelineViz",
    sortOrder: 9,
    starterCode: null,
    testCases: null,
    questions: null,
    designPrompt: `Design an RLHF training pipeline for aligning a 7B parameter language model. Your design should cover:

1. **SFT Stage:** What data do you use? How much? How do you ensure quality? What hyperparameters matter?
2. **Reward Model:** Architecture choices (same size as policy? smaller?). Training data format. How many preference comparisons do you need? How do you handle annotator disagreement?
3. **PPO Optimization:** The RL loop - generation, scoring, policy update. Batch sizes, learning rates, number of PPO epochs per batch. How do you handle the value function?
4. **KL Penalty:** How do you set beta? What happens if it is too high or too low? Adaptive KL targeting?
5. **Safety Constraints:** How do you prevent the model from generating harmful content during RL exploration? Red-teaming, constitutional AI, reward model robustness.
6. **Infrastructure:** How many GPUs? How do you distribute the SFT model, reward model, and value model across GPUs? Latency considerations for the RL loop.
7. **Evaluation:** How do you measure alignment quality? Human eval, automated benchmarks, safety testing.`,
    sampleAnswer: `## Architecture Overview

**Three-stage pipeline:** SFT -> Reward Model -> PPO, each with its own data requirements and training dynamics.

### Stage 1: Supervised Fine-Tuning
- **Data:** 50K-100K high-quality instruction-response pairs, manually curated
- **Quality control:** Each example reviewed by 2+ annotators, filtered for accuracy and helpfulness
- **Training:** 2-3 epochs, cosine learning rate schedule, lr=2e-5, batch size 128
- **Result:** A model that can follow instructions but may not align with nuanced preferences

### Stage 2: Reward Model
- **Architecture:** Same transformer as policy model but with a scalar output head. Can be smaller (3B for a 7B policy) to reduce cost
- **Data:** 100K+ preference pairs (prompt, chosen_response, rejected_response)
- **Annotator disagreement:** Use majority voting (3+ annotators per pair). Discard examples with no clear consensus
- **Training:** Bradley-Terry loss, 1 epoch (overtraining causes overfitting to annotation artifacts)
- **Validation:** Hold out 10% of preferences, check accuracy > 70%

### Stage 3: PPO Optimization
- **RL Loop:** Generate batch of responses (128-512 prompts) -> score with reward model -> compute advantages -> PPO update
- **KL Penalty:** Start with beta=0.02, use adaptive targeting: if KL exceeds target (6.0 nats), increase beta; if below, decrease
- **PPO hyperparameters:** 4 PPO epochs per batch, clip ratio 0.2, lr=1e-6 (10x lower than SFT)
- **Value function:** Separate value head on the policy model, trained to predict cumulative reward
- **Iterations:** 500-1000 PPO steps total

### Safety Constraints
- **Rule-based filtering:** Block generations containing known harmful patterns before reward scoring
- **Constitutional AI:** Add a "harmlessness" component to the reward: train a separate safety classifier, add its score to the reward with high weight
- **Red-teaming:** Continuously generate adversarial prompts to test for jailbreaks during training
- **Reward model robustness:** Ensemble 2-3 reward models; use minimum score to prevent exploitation of any single model's weaknesses

### Infrastructure
- **GPU allocation:** 4x A100 for policy model, 2x A100 for reward model, 2x A100 for reference (SFT) model
- **Bottleneck:** Generation is the slowest step; use vLLM or TGI for fast batched inference
- **Total training time:** ~1 week for the full pipeline on 8 A100s

### Evaluation
- **Automated:** MT-Bench, AlpacaEval 2.0 for instruction following; TruthfulQA for honesty
- **Human eval:** 500 prompts rated by 3 annotators on helpfulness, harmlessness, honesty
- **Safety:** Run the BBQ bias benchmark and standard red-team prompt suites`,
    rubric: [
      {
        criterion: "Training Pipeline Architecture",
        weight: 0.3,
        description:
          "Clear three-stage pipeline with data requirements, hyperparameters, and training procedures for each stage",
        keyPoints: [
          "SFT data quality and quantity",
          "Reward model architecture and training",
          "PPO loop with proper hyperparameters",
          "Clear data flow between stages",
        ],
      },
      {
        criterion: "Reward Model Design",
        weight: 0.25,
        description: "Thoughtful reward model architecture, training, and robustness considerations",
        keyPoints: [
          "Architecture choices with reasoning",
          "Preference data collection and quality",
          "Handling annotator disagreement",
          "Preventing reward model overfitting",
        ],
      },
      {
        criterion: "Safety Constraints",
        weight: 0.25,
        description: "Concrete safety mechanisms during training and deployment",
        keyPoints: [
          "KL penalty to prevent reward hacking",
          "Safety classifier or constitutional AI",
          "Red-teaming strategy",
          "Reward model robustness",
        ],
      },
      {
        criterion: "Scalability & Infrastructure",
        weight: 0.2,
        description: "Practical considerations for running the pipeline at scale",
        keyPoints: [
          "GPU allocation and distribution",
          "Generation bottleneck and optimization",
          "Evaluation methodology",
          "Total compute budget",
        ],
      },
    ],
  },

  // ========== WEEK 6: RAG & Retrieval ==========
  {
    id: "embedding-generation",
    type: "coding",
    title: "Text Embedding with Mean Pooling",
    description: `Implement mean pooling over token embeddings to produce sentence embeddings.

Given:
- \`token_embeddings\`: a 2D array of shape (N, D) where N is the number of tokens and D is the embedding dimension
- \`attention_mask\`: a 1D array of shape (N,) with 1 for real tokens and 0 for padding tokens

Compute the sentence embedding as the weighted average of token embeddings, using the attention mask to ignore padding.

Also implement cosine similarity between two embeddings.

**Example:**
\`\`\`python
>>> embeddings = np.array([[1.0, 0.0], [0.0, 1.0], [0.0, 0.0]])  # 3 tokens, dim=2
>>> mask = np.array([1, 1, 0])  # third token is padding
>>> mean_pool(embeddings, mask)
array([0.5, 0.5])  # average of first two only

>>> cosine_similarity(np.array([1, 0]), np.array([0, 1]))
0.0
\`\`\``,
    difficulty: "Easy",
    weekNumber: 6,
    tags: '["embeddings", "pooling", "similarity", "rag"]',
    theory: `Sentence embeddings compress variable-length text into a fixed-size vector. The two main pooling strategies from transformer outputs are CLS pooling and mean pooling.

**CLS pooling** uses only the [CLS] token's representation. This works well for BERT-like models trained with [CLS] as a sentence-level representation, but the [CLS] vector can be a bottleneck.

**Mean pooling** averages all token embeddings, weighted by the attention mask. This uses information from every token and generally produces better sentence-level embeddings for similarity tasks. Models like Sentence-BERT use mean pooling.

**Attention mask** matters because batched inputs are padded to equal length. Padding tokens have meaningless embeddings that would corrupt the average if included.

**Cosine similarity** measures the angle between two vectors: \`cos(a, b) = (a . b) / (||a|| * ||b||)\`. Range: [-1, 1]. It ignores magnitude, focusing on direction.`,
    hints: '["Expand the attention mask to match embedding dimensions: mask.reshape(-1, 1) so it broadcasts correctly", "Multiply embeddings by the expanded mask, sum along the token axis, divide by the sum of the mask", "For cosine similarity: dot product divided by the product of L2 norms. Handle the zero-norm edge case"]',
    visualizationComponent: "EmbeddingPoolingViz",
    sortOrder: 11,
    starterCode: `import numpy as np

def mean_pool(token_embeddings, attention_mask):
    """
    Compute sentence embedding via mean pooling with attention mask.

    Args:
        token_embeddings: numpy array of shape (N, D)
        attention_mask: numpy array of shape (N,) with 1s and 0s

    Returns:
        numpy array of shape (D,) - the sentence embedding
    """
    pass

def cosine_similarity(embedding_a, embedding_b):
    """
    Compute cosine similarity between two embeddings.

    Args:
        embedding_a: numpy array of shape (D,)
        embedding_b: numpy array of shape (D,)

    Returns:
        float - cosine similarity in [-1, 1]
    """
    pass`,
    solution: `\`\`\`python
import numpy as np

def mean_pool(token_embeddings, attention_mask):
    token_embeddings = np.array(token_embeddings, dtype=np.float64)
    attention_mask = np.array(attention_mask, dtype=np.float64)

    # Expand mask to (N, 1) for broadcasting
    mask_expanded = attention_mask.reshape(-1, 1)

    # Zero out padding embeddings and sum
    masked_embeddings = token_embeddings * mask_expanded
    summed = np.sum(masked_embeddings, axis=0)

    # Divide by number of real tokens (avoid division by zero)
    token_count = np.sum(attention_mask)
    if token_count == 0:
        return np.zeros(token_embeddings.shape[1])

    return summed / token_count

def cosine_similarity(embedding_a, embedding_b):
    a = np.array(embedding_a, dtype=np.float64)
    b = np.array(embedding_b, dtype=np.float64)

    dot_product = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return float(dot_product / (norm_a * norm_b))
\`\`\`

**Approach:** Mean pooling multiplies each token embedding by its mask value (1 or 0), sums across tokens, and divides by the count of real tokens. This excludes padding from the average. Cosine similarity normalizes both vectors to unit length before computing the dot product.`,
    testCases: [
      {
        id: "t1",
        name: "Mean pool with padding",
        inputs: {
          token_embeddings: [
            [1.0, 0.0],
            [0.0, 1.0],
            [0.0, 0.0],
          ],
          attention_mask: [1, 1, 0],
        },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Cosine similarity orthogonal vectors",
        inputs: {
          embedding_a: [1, 0],
          embedding_b: [0, 1],
        },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Mean pool no padding",
        inputs: {
          token_embeddings: [
            [1.0, 2.0],
            [3.0, 4.0],
          ],
          attention_mask: [1, 1],
        },
        isPublic: false,
      },
      {
        id: "t4",
        name: "Cosine similarity identical vectors",
        inputs: {
          embedding_a: [1, 2, 3],
          embedding_b: [1, 2, 3],
        },
        isPublic: false,
      },
      {
        id: "t5",
        name: "All padding tokens",
        inputs: {
          token_embeddings: [
            [1.0, 2.0],
            [3.0, 4.0],
          ],
          attention_mask: [0, 0],
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
    id: "hybrid-search",
    type: "coding",
    title: "Hybrid BM25 + Vector Search",
    description: `Implement a hybrid search system combining BM25 (keyword matching) with vector similarity search, fused using Reciprocal Rank Fusion.

Implement three functions:
1. **bm25_score(query, document, corpus_stats):** Compute the BM25 score for a single query-document pair. Formula: \`sum over query terms of: IDF(t) * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * dl/avgdl))\` where \`IDF(t) = log((N - df + 0.5) / (df + 0.5) + 1)\`.

2. **vector_search(query_embedding, doc_embeddings, top_k):** Return indices of top-k documents by cosine similarity.

3. **reciprocal_rank_fusion(rankings_list, k=60):** Combine multiple ranked lists. For each document: \`RRF_score = sum(1 / (k + rank_i))\` across all ranking systems.

**Example:**
\`\`\`python
>>> corpus = ["the cat sat on the mat", "the dog ran in the park", "cats and dogs are pets"]
>>> bm25_scores = [bm25_score("cat", doc, stats) for doc in corpus]
>>> # doc 0 and 2 score highest (contain "cat"/"cats")

>>> rrf = reciprocal_rank_fusion([[0, 2, 1], [2, 0, 1]], k=60)
>>> # doc indices ranked by combined score
\`\`\``,
    difficulty: "Hard",
    weekNumber: 6,
    tags: '["bm25", "vector-search", "hybrid-search", "rrf", "rag"]',
    theory: `Keyword search and semantic search have complementary strengths. Hybrid search combines both.

**BM25** scores documents by term frequency and inverse document frequency. It excels at exact keyword matching but misses synonyms and paraphrases. The formula accounts for term frequency saturation (diminishing returns of repeated terms) and document length normalization.

**Vector search** embeds queries and documents into a shared vector space, then ranks by cosine similarity. It captures semantic meaning ("car" matches "automobile") but can miss exact terms and struggles with rare proper nouns.

**Reciprocal Rank Fusion (RRF)** combines rankings without needing normalized scores. For each document, sum \`1/(k+rank)\` across all systems. The constant k (typically 60) controls how much weight goes to top positions. RRF is robust and parameter-free compared to score-based fusion.

In practice, hybrid search with RRF outperforms either method alone on most retrieval benchmarks.`,
    hints: '["For BM25: tokenize by splitting on whitespace and lowercasing. Compute IDF from corpus_stats (N docs, doc frequency per term)", "For vector_search: compute cosine similarity between query and all docs, argsort descending, return top-k indices", "For RRF: create a score dict mapping doc_id to cumulative 1/(k+rank). Sort by score descending"]',
    visualizationComponent: "HybridSearchViz",
    sortOrder: 12,
    starterCode: `import numpy as np
from collections import Counter

def bm25_score(query, document, corpus_stats, k1=1.5, b=0.75):
    """
    Compute BM25 score for a query-document pair.

    Args:
        query: str, the search query
        document: str, a single document
        corpus_stats: dict with keys:
            - 'N': int, total number of documents in corpus
            - 'avgdl': float, average document length (in tokens)
            - 'df': dict mapping term -> number of documents containing it
        k1: float, term frequency saturation parameter
        b: float, length normalization parameter

    Returns:
        float - BM25 score
    """
    pass

def vector_search(query_embedding, doc_embeddings, top_k=5):
    """
    Find top-k most similar documents by cosine similarity.

    Args:
        query_embedding: numpy array of shape (D,)
        doc_embeddings: numpy array of shape (num_docs, D)
        top_k: int, number of results to return

    Returns:
        list of int - indices of top-k documents, sorted by similarity descending
    """
    pass

def reciprocal_rank_fusion(rankings_list, k=60):
    """
    Combine multiple ranked lists using Reciprocal Rank Fusion.

    Args:
        rankings_list: list of lists, each inner list contains document
                       indices ordered by rank (best first)
        k: int, RRF constant (default 60)

    Returns:
        list of int - document indices sorted by fused score descending
    """
    pass`,
    solution: `\`\`\`python
import numpy as np
from collections import Counter

def bm25_score(query, document, corpus_stats, k1=1.5, b=0.75):
    query_terms = query.lower().split()
    doc_terms = document.lower().split()
    doc_len = len(doc_terms)
    tf_doc = Counter(doc_terms)

    N = corpus_stats['N']
    avgdl = corpus_stats['avgdl']
    df = corpus_stats['df']

    score = 0.0
    for term in query_terms:
        # Term frequency in this document
        tf = tf_doc.get(term, 0)
        if tf == 0:
            continue
        # Inverse document frequency
        doc_freq = df.get(term, 0)
        idf = np.log((N - doc_freq + 0.5) / (doc_freq + 0.5) + 1.0)
        # BM25 term score
        numerator = tf * (k1 + 1)
        denominator = tf + k1 * (1 - b + b * doc_len / avgdl)
        score += idf * numerator / denominator

    return float(score)

def vector_search(query_embedding, doc_embeddings, top_k=5):
    query = np.array(query_embedding, dtype=np.float64)
    docs = np.array(doc_embeddings, dtype=np.float64)

    # Compute cosine similarities
    query_norm = np.linalg.norm(query)
    if query_norm == 0:
        return list(range(min(top_k, len(docs))))

    doc_norms = np.linalg.norm(docs, axis=1)
    # Avoid division by zero
    doc_norms = np.maximum(doc_norms, 1e-10)

    similarities = docs @ query / (doc_norms * query_norm)

    # Get top-k indices sorted by similarity descending
    top_indices = np.argsort(similarities)[::-1][:top_k]
    return top_indices.tolist()

def reciprocal_rank_fusion(rankings_list, k=60):
    scores = {}
    for ranking in rankings_list:
        for rank, doc_id in enumerate(ranking):
            if doc_id not in scores:
                scores[doc_id] = 0.0
            scores[doc_id] += 1.0 / (k + rank + 1)  # rank is 0-indexed, so +1

    # Sort by fused score descending
    sorted_docs = sorted(scores.keys(), key=lambda d: scores[d], reverse=True)
    return sorted_docs
\`\`\`

**Approach:** BM25 tokenizes query and document, computes IDF for each query term, applies the BM25 formula with length normalization. Vector search computes cosine similarities via normalized dot products and returns top-k. RRF assigns each document a score of \`1/(k+rank)\` from each ranking system and sorts by the sum.`,
    testCases: [
      {
        id: "t1",
        name: "BM25 scores matching document higher",
        inputs: {
          query: "cat",
          documents: ["the cat sat on the mat", "the dog ran fast"],
          corpus_stats: {
            N: 2,
            avgdl: 5.5,
            df: { cat: 1, dog: 1, the: 2, sat: 1, on: 1, mat: 1, ran: 1, fast: 1 },
          },
        },
        isPublic: true,
      },
      {
        id: "t2",
        name: "RRF combines two rankings",
        inputs: {
          rankings_list: [
            [0, 1, 2],
            [2, 0, 1],
          ],
          k: 60,
        },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Vector search returns correct top-k",
        inputs: {
          query_embedding: [1.0, 0.0],
          doc_embeddings: [
            [1.0, 0.0],
            [0.0, 1.0],
            [0.7, 0.7],
          ],
          top_k: 2,
        },
        isPublic: false,
      },
      {
        id: "t4",
        name: "BM25 zero score for no match",
        inputs: {
          query: "python",
          document: "the cat sat on the mat",
          corpus_stats: { N: 5, avgdl: 6.0, df: { python: 2 } },
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
    id: "reranking",
    type: "coding",
    title: "Cross-Encoder Reranking",
    description: `Implement a feature-based reranking pipeline that rescores retrieved passages for a given query.

Given a query and N candidate passages, compute a relevance score for each (query, passage) pair using these features:
1. **Keyword overlap:** Fraction of query words (lowercased, > 2 chars) found in the passage
2. **Exact phrase match:** Bonus if the full query appears as a substring in the passage
3. **Position score:** Higher score if query terms appear early in the passage
4. **Length penalty:** Slight penalty for very short (<20 chars) or very long (>1000 chars) passages

Return the passages sorted by score (highest first).

**Example:**
\`\`\`python
>>> query = "gradient descent optimization"
>>> passages = [
...     "Gradient descent is an optimization algorithm.",
...     "The weather is nice today.",
...     "Optimization methods include gradient descent and Adam."
... ]
>>> rerank(query, passages)
[0, 2, 1]  # indices sorted by relevance
\`\`\``,
    difficulty: "Medium",
    weekNumber: 6,
    tags: '["reranking", "cross-encoder", "retrieval", "rag"]',
    theory: `Two-stage retrieval is the standard RAG pattern: a fast first stage retrieves candidates, a slower second stage reranks them for precision.

**Bi-encoder (first stage):** Encode query and documents independently into embeddings. Compare with cosine similarity. Fast because document embeddings are precomputed, but the query and document never "see" each other during encoding.

**Cross-encoder (second stage):** Feed (query, document) together into a model that jointly attends to both. Much more accurate because it models token-level interactions between query and document, but O(N) forward passes for N candidates.

**Feature-based reranking** (what we implement here) uses hand-crafted features as a simpler proxy for cross-encoder scoring. Real cross-encoders use transformer models fine-tuned on relevance labels.

The two-stage pattern lets you get the best of both: bi-encoder speed for initial retrieval (search millions of docs in ms) followed by cross-encoder accuracy on the top 20-50 candidates.`,
    hints: '["Compute each feature independently, then combine as a weighted sum for the final score", "For keyword overlap: set(query.lower().split()) intersected with set(passage.lower().split())", "For position score: find the average position of query term first occurrences, normalize by passage length", "Return indices sorted by score descending"]',
    visualizationComponent: "RerankingViz",
    sortOrder: 13,
    starterCode: `def rerank(query, passages):
    """
    Rerank passages by relevance to query using feature-based scoring.

    Args:
        query: str, the search query
        passages: list of str, candidate passages

    Returns:
        list of int - passage indices sorted by relevance (highest first)
    """
    pass

def compute_passage_score(query, passage):
    """
    Compute a relevance score for a (query, passage) pair.

    Features (weights):
    - Keyword overlap (0.4): fraction of query words in passage
    - Exact phrase match (0.2): 1.0 if query is substring of passage, else 0.0
    - Position score (0.2): how early query terms appear in passage
    - Length appropriateness (0.2): penalize too short or too long

    Args:
        query: str
        passage: str

    Returns:
        float - relevance score in [0, 1]
    """
    pass`,
    solution: `\`\`\`python
def compute_passage_score(query, passage):
    query_lower = query.lower()
    passage_lower = passage.lower()

    # 1. Keyword overlap (weight 0.4)
    query_words = [w for w in query_lower.split() if len(w) > 2]
    if query_words:
        passage_words_set = set(passage_lower.split())
        matches = sum(1 for w in query_words if w in passage_words_set)
        keyword_score = matches / len(query_words)
    else:
        keyword_score = 0.0

    # 2. Exact phrase match (weight 0.2)
    phrase_score = 1.0 if query_lower in passage_lower else 0.0

    # 3. Position score (weight 0.2)
    # Average normalized position of first occurrence of each query term
    positions = []
    for w in query_words:
        idx = passage_lower.find(w)
        if idx >= 0:
            # Normalize: 1.0 for position 0, decreasing toward 0
            positions.append(1.0 - idx / max(len(passage_lower), 1))
    position_score = sum(positions) / len(query_words) if query_words else 0.0

    # 4. Length appropriateness (weight 0.2)
    plen = len(passage)
    if plen < 20:
        length_score = 0.3
    elif plen > 1000:
        length_score = 0.5
    elif 50 <= plen <= 500:
        length_score = 1.0
    else:
        length_score = 0.7

    # Weighted combination
    score = (0.4 * keyword_score +
             0.2 * phrase_score +
             0.2 * position_score +
             0.2 * length_score)
    return score

def rerank(query, passages):
    scores = [(i, compute_passage_score(query, p)) for i, p in enumerate(passages)]
    scores.sort(key=lambda x: x[1], reverse=True)
    return [i for i, _ in scores]
\`\`\`

**Approach:** Score each passage by computing four features: keyword overlap measures term-level relevance, exact phrase match catches direct hits, position score rewards early mentions, and length appropriateness penalizes degenerate passages. The weighted sum produces a single relevance score. Real cross-encoders replace these features with a neural network but follow the same rerank-then-sort pattern.`,
    testCases: [
      {
        id: "t1",
        name: "Relevant passage ranked first",
        inputs: {
          query: "gradient descent optimization",
          passages: [
            "Gradient descent is an optimization algorithm.",
            "The weather is nice today.",
            "Optimization methods include gradient descent and Adam.",
          ],
        },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Exact phrase match boosted",
        inputs: {
          query: "machine learning",
          passages: [
            "Deep learning is a subset of AI.",
            "Machine learning transforms industries.",
            "Learning machines are interesting.",
          ],
        },
        isPublic: true,
      },
      {
        id: "t3",
        name: "No matching terms ranked last",
        inputs: {
          query: "neural network architecture",
          passages: [
            "The cat sat on the mat.",
            "Neural network architecture design patterns.",
            "Cooking recipes for beginners.",
          ],
        },
        isPublic: false,
      },
      {
        id: "t4",
        name: "Single passage returns it",
        inputs: {
          query: "test",
          passages: ["This is a test passage."],
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
    id: "document-loader",
    type: "coding",
    title: "Document Processing for RAG",
    description: `Parse markdown documents into structured sections for a RAG pipeline.

Implement a function that takes a markdown string and returns a list of sections, each with:
- \`content\`: the text content of the section
- \`metadata\`: dict with \`heading\`, \`level\` (heading depth), and \`parent_heading\`

Split on headings (lines starting with #). Preserve the heading hierarchy: an H2 section's parent is the most recent H1, an H3's parent is the most recent H2, etc.

Also implement a function to split long sections into chunks with overlap.

**Example:**
\`\`\`python
>>> md = """# Introduction
... This is the intro.
... ## Background
... Some background info.
... ## Methods
... The methods used.
... ### Subsection
... Details here."""
>>> sections = parse_markdown(md)
>>> sections[0]
{'content': 'This is the intro.', 'metadata': {'heading': 'Introduction', 'level': 1, 'parent_heading': None}}
>>> sections[1]
{'content': 'Some background info.', 'metadata': {'heading': 'Background', 'level': 2, 'parent_heading': 'Introduction'}}
\`\`\``,
    difficulty: "Easy",
    weekNumber: 6,
    tags: '["document-processing", "markdown", "chunking", "rag"]',
    theory: `RAG quality depends on document processing. Garbage in, garbage out.

**Heading hierarchy** provides structural context. A section titled "Results" under "Experiment 1" means something different from "Results" under "Experiment 2". Preserving parent headings in metadata lets you filter and contextualize chunks during retrieval.

**Chunking** splits long sections into pieces that fit model context windows. Overlap between chunks (typically 10-20%) prevents information loss at boundaries. Too-small chunks lose context; too-large chunks dilute relevance.

**Metadata enrichment** adds source, section path, page number, and other attributes to each chunk. During retrieval, metadata enables filtering (e.g., "only search the Methods section") and provides context for the LLM (e.g., "this chunk is from page 5 of the API docs").`,
    hints: '["Iterate line by line. When you hit a heading (starts with #), save the previous section and start a new one", "Track parent headings with a stack or dict mapping level -> most recent heading at that level", "For chunking: split content into words, group into chunks of max_size words, with overlap_size words repeated between consecutive chunks"]',
    visualizationComponent: "DocumentLoaderViz",
    sortOrder: 14,
    starterCode: `def parse_markdown(markdown_text):
    """
    Parse markdown into sections with heading hierarchy metadata.

    Args:
        markdown_text: str, the full markdown document

    Returns:
        list of dicts, each with:
            - 'content': str, the section text (without the heading line)
            - 'metadata': dict with 'heading' (str), 'level' (int), 'parent_heading' (str or None)
    """
    pass

def chunk_sections(sections, max_chunk_size=200, overlap=50):
    """
    Split sections into smaller chunks with overlap.

    Args:
        sections: list of dicts from parse_markdown
        max_chunk_size: int, max number of characters per chunk
        overlap: int, number of characters to overlap between chunks

    Returns:
        list of dicts, each with 'content' and 'metadata'
        (metadata inherited from the parent section)
    """
    pass`,
    solution: `\`\`\`python
def parse_markdown(markdown_text):
    lines = markdown_text.split("\\n")
    sections = []
    current_heading = None
    current_level = 0
    current_content_lines = []
    # Track most recent heading at each level for parent resolution
    heading_stack = {}

    def save_section():
        if current_heading is not None:
            content = "\\n".join(current_content_lines).strip()
            # Find parent: the most recent heading at level - 1
            parent = heading_stack.get(current_level - 1) if current_level > 1 else None
            sections.append({
                "content": content,
                "metadata": {
                    "heading": current_heading,
                    "level": current_level,
                    "parent_heading": parent,
                },
            })

    for line in lines:
        stripped = line.strip()
        if stripped.startswith("#"):
            # Save previous section
            save_section()
            # Parse heading level and text
            level = 0
            for ch in stripped:
                if ch == "#":
                    level += 1
                else:
                    break
            heading_text = stripped[level:].strip()
            current_heading = heading_text
            current_level = level
            current_content_lines = []
            # Update heading stack
            heading_stack[level] = heading_text
            # Clear deeper levels (they are no longer current parents)
            for lvl in list(heading_stack.keys()):
                if lvl > level:
                    del heading_stack[lvl]
        else:
            current_content_lines.append(line)

    # Save last section
    save_section()

    return sections

def chunk_sections(sections, max_chunk_size=200, overlap=50):
    chunks = []
    for section in sections:
        content = section["content"]
        metadata = section["metadata"]

        if len(content) <= max_chunk_size:
            chunks.append({"content": content, "metadata": metadata})
        else:
            start = 0
            while start < len(content):
                end = start + max_chunk_size
                chunk_text = content[start:end]
                chunks.append({"content": chunk_text.strip(), "metadata": metadata})
                start = end - overlap
                if start + overlap >= len(content):
                    break

    return chunks
\`\`\`

**Approach:** Parse line by line, detecting headings by the "#" prefix. Track the most recent heading at each level in a dict to resolve parent headings. Each section accumulates content lines until the next heading. Chunking slides a window of max_chunk_size characters with overlap to prevent information loss at boundaries.`,
    testCases: [
      {
        id: "t1",
        name: "Parse simple two-level markdown",
        inputs: {
          markdown_text: "# Title\nIntro text.\n## Section A\nContent A.\n## Section B\nContent B.",
        },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Parent heading resolution",
        inputs: {
          markdown_text: "# Main\nText.\n## Sub\nMore text.\n### SubSub\nDeep text.",
        },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Chunking long section",
        inputs: {
          sections: [
            {
              content:
                "This is a very long section that needs to be split into smaller chunks for the RAG pipeline to process correctly. It contains multiple sentences and goes well beyond the maximum chunk size limit that was configured.",
              metadata: { heading: "Test", level: 1, parent_heading: null },
            },
          ],
          max_chunk_size: 50,
          overlap: 10,
        },
        isPublic: false,
      },
      {
        id: "t4",
        name: "Empty content sections",
        inputs: {
          markdown_text: "# Empty\n\n## Also Empty\n\n## Has Content\nSome text here.",
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
    id: "retrieval-metrics",
    type: "coding",
    title: "Retrieval Quality Metrics",
    description: `Compute standard information retrieval metrics to evaluate a search system.

Implement four metrics:
1. **Precision@k:** Fraction of the top-k results that are relevant. \`P@k = |relevant in top-k| / k\`
2. **Recall@k:** Fraction of all relevant documents found in top-k. \`R@k = |relevant in top-k| / |all relevant|\`
3. **MRR (Mean Reciprocal Rank):** \`1 / rank_of_first_relevant_result\`. If no relevant result, MRR = 0.
4. **NDCG@k:** Normalized Discounted Cumulative Gain. Accounts for position: top results matter more.
   - \`DCG@k = sum(rel_i / log2(i + 1))\` for i = 1..k (1-indexed)
   - \`IDCG@k = DCG of the ideal ranking\` (all relevant docs at the top)
   - \`NDCG@k = DCG@k / IDCG@k\`

**Example:**
\`\`\`python
>>> retrieved = [1, 0, 1, 0, 1]  # 1 = relevant, 0 = not
>>> precision_at_k(retrieved, k=3)
0.667  # 2 relevant in top 3

>>> recall_at_k(retrieved, k=3, total_relevant=3)
0.667  # 2 of 3 relevant found

>>> mrr(retrieved)
1.0  # first result is relevant

>>> ndcg_at_k(retrieved, k=5)
0.876  # good but not perfect ranking
\`\`\``,
    difficulty: "Medium",
    weekNumber: 6,
    tags: '["retrieval-metrics", "precision", "recall", "ndcg", "mrr", "rag"]',
    theory: `Retrieval metrics measure search quality from different angles.

**Precision@k** answers: "Of the k results I showed the user, how many were relevant?" High precision means few false positives in the top results. Important when users look at only a few results.

**Recall@k** answers: "Of all relevant documents, how many did I find in k results?" High recall means few false negatives. Important when missing a relevant document is costly (e.g., legal search).

**MRR** answers: "How quickly did I find the first relevant result?" MRR=1 means the first result was relevant. Useful for navigational queries where the user wants one specific answer.

**NDCG** answers: "How good is the ranking order?" It gives more credit for relevant results at the top. The logarithmic discount reflects the fact that users pay less attention to lower-ranked results.

For RAG, Recall@k matters most because the LLM needs all relevant context to generate a good answer. Precision@k matters for efficiency since each retrieved chunk uses context window space.`,
    hints: '["Precision@k: sum the first k elements of the relevance list and divide by k", "Recall@k: sum the first k elements and divide by total_relevant. Handle total_relevant=0 edge case", "MRR: iterate through the list, return 1/(index+1) for the first relevant result", "NDCG: compute DCG with the actual ranking, compute IDCG by sorting relevances descending, divide DCG/IDCG"]',
    visualizationComponent: "RetrievalMetricsViz",
    sortOrder: 15,
    starterCode: `import numpy as np

def precision_at_k(relevances, k):
    """
    Compute precision at k.

    Args:
        relevances: list of 0/1 values (1 = relevant) in retrieval order
        k: int, cutoff position

    Returns:
        float - precision value in [0, 1]
    """
    pass

def recall_at_k(relevances, k, total_relevant):
    """
    Compute recall at k.

    Args:
        relevances: list of 0/1 values in retrieval order
        k: int, cutoff position
        total_relevant: int, total number of relevant docs in corpus

    Returns:
        float - recall value in [0, 1]
    """
    pass

def mrr(relevances):
    """
    Compute Mean Reciprocal Rank.

    Args:
        relevances: list of 0/1 values in retrieval order

    Returns:
        float - MRR value in [0, 1]
    """
    pass

def ndcg_at_k(relevances, k):
    """
    Compute Normalized Discounted Cumulative Gain at k.

    Args:
        relevances: list of 0/1 values in retrieval order
        k: int, cutoff position

    Returns:
        float - NDCG value in [0, 1]
    """
    pass`,
    solution: `\`\`\`python
import numpy as np

def precision_at_k(relevances, k):
    if k == 0:
        return 0.0
    top_k = relevances[:k]
    return sum(top_k) / k

def recall_at_k(relevances, k, total_relevant):
    if total_relevant == 0:
        return 0.0
    top_k = relevances[:k]
    return sum(top_k) / total_relevant

def mrr(relevances):
    for i, rel in enumerate(relevances):
        if rel == 1:
            return 1.0 / (i + 1)
    return 0.0

def ndcg_at_k(relevances, k):
    if k == 0:
        return 0.0

    top_k = relevances[:k]

    # DCG: sum of rel_i / log2(i + 1) for 1-indexed positions
    dcg = 0.0
    for i, rel in enumerate(top_k):
        dcg += rel / np.log2(i + 2)  # i+2 because i is 0-indexed, formula uses 1-indexed

    # IDCG: ideal ranking (all 1s first)
    ideal = sorted(top_k, reverse=True)
    idcg = 0.0
    for i, rel in enumerate(ideal):
        idcg += rel / np.log2(i + 2)

    if idcg == 0:
        return 0.0

    return dcg / idcg
\`\`\`

**Approach:** Each metric slices the ranked list at position k and computes a different quality measure. Precision counts hits in the top-k. Recall divides by total relevant. MRR finds the first hit. NDCG computes a position-weighted sum (DCG) and normalizes by the ideal ordering (IDCG). The log2 discount in NDCG ensures that relevant results at the top contribute more than those buried at the bottom.`,
    testCases: [
      {
        id: "t1",
        name: "Perfect precision@3",
        inputs: { relevances: [1, 1, 1, 0, 0], k: 3 },
        isPublic: true,
      },
      {
        id: "t2",
        name: "MRR with first relevant at position 3",
        inputs: { relevances: [0, 0, 1, 1, 0] },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Recall@5 with total_relevant=4",
        inputs: { relevances: [1, 0, 1, 0, 1], k: 5, total_relevant: 4 },
        isPublic: false,
      },
      {
        id: "t4",
        name: "NDCG perfect ranking equals 1.0",
        inputs: { relevances: [1, 1, 1, 0, 0], k: 5 },
        isPublic: false,
      },
      {
        id: "t5",
        name: "All irrelevant returns 0",
        inputs: { relevances: [0, 0, 0, 0], k: 4, total_relevant: 2 },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "rag-architecture-quiz",
    type: "quiz",
    title: "RAG Architecture & Design",
    description:
      "Test your understanding of RAG system design including vector databases, embedding models, chunking strategies, retrieval-generation tradeoffs, and when to use RAG vs fine-tuning.",
    difficulty: "Medium",
    weekNumber: 6,
    tags: '["rag", "vector-db", "embeddings", "architecture", "quiz"]',
    theory: `Retrieval-Augmented Generation (RAG) grounds LLM responses in external knowledge by retrieving relevant documents and including them in the prompt.

**Vector databases** (Pinecone, Weaviate, Chroma, FAISS) store document embeddings and support fast approximate nearest neighbor search. FAISS uses index structures (IVF, HNSW) for sub-linear search time. Traditional databases use inverted indices for keyword search.

**Embedding model selection** matters: larger models (e.g., 1024-dim) capture more nuance but cost more. Domain-specific models outperform general ones on specialized corpora. The embedding model should match between indexing and query time.

**Chunk overlap** prevents information loss at chunk boundaries. If a relevant sentence spans two chunks, overlap ensures at least one chunk contains the full sentence. Typical overlap: 10-20% of chunk size.

**RAG vs fine-tuning:** RAG grounds responses in retrieved facts (good for knowledge-intensive tasks, easy to update). Fine-tuning bakes knowledge into weights (good for style/behavior changes, no retrieval latency). RAG is preferred when the knowledge base changes frequently.`,
    hints: "[]",
    visualizationComponent: "RAGConceptsViz",
    sortOrder: 16,
    starterCode: null,
    testCases: null,
    questions: [
      {
        id: "q1",
        questionNumber: 1,
        questionText:
          "What is the main advantage of a vector database over a traditional relational database for RAG?",
        options: {
          a: "Vector databases are always faster for all query types",
          b: "Vector databases support semantic similarity search via approximate nearest neighbor lookup on embeddings",
          c: "Vector databases are cheaper to operate and require less storage",
          d: "Vector databases guarantee ACID transactions which are needed for RAG",
        },
        correctAnswer: "b",
        explanation:
          "Vector databases are optimized for storing high-dimensional embeddings and performing fast approximate nearest neighbor (ANN) search. This enables semantic similarity matching: finding documents with similar meaning even if they share no keywords. Traditional databases excel at exact matching and structured queries but cannot do semantic search natively.",
      },
      {
        id: "q2",
        questionNumber: 2,
        questionText: "Why do RAG systems use chunk overlap when splitting documents?",
        options: {
          a: "To increase the total number of chunks for better coverage statistics",
          b: "To reduce the storage requirements of the vector database",
          c: "To prevent losing information at chunk boundaries where relevant content might span two chunks",
          d: "To make the embedding model produce more accurate vectors",
        },
        correctAnswer: "c",
        explanation:
          "When a relevant sentence or concept spans the boundary between two chunks, without overlap that information could be split across chunks and partially lost in both. Overlap (typically 10-20% of chunk size) ensures that boundary content appears in full in at least one chunk, preserving retrieval quality.",
      },
      {
        id: "q3",
        questionNumber: 3,
        questionText: "When should you choose RAG over fine-tuning for adding knowledge to an LLM?",
        options: {
          a: "When you want to change the model's writing style or personality",
          b: "When the knowledge base is static and never changes",
          c: "When the knowledge base changes frequently and you need grounded, verifiable responses",
          d: "When you have unlimited compute budget for training",
        },
        correctAnswer: "c",
        explanation:
          "RAG retrieves fresh knowledge at query time, so updating the knowledge base requires only re-indexing documents, not retraining the model. Fine-tuning bakes knowledge into weights, making updates expensive. RAG also provides citations (you can show which documents were retrieved), enabling users to verify answers.",
      },
      {
        id: "q4",
        questionNumber: 4,
        questionText:
          "What is the tradeoff between retrieval quality and generation quality in RAG?",
        options: {
          a: "Better retrieval always leads to better generation with no downsides",
          b: "Retrieving more documents improves recall but can dilute context and confuse the generator with irrelevant passages",
          c: "Generation quality is independent of retrieval quality",
          d: "You should always retrieve the maximum number of documents possible",
        },
        correctAnswer: "b",
        explanation:
          "Retrieving more documents increases the chance of finding relevant information (higher recall), but also introduces noise. The LLM's context window has limited capacity, and irrelevant passages can distract the generator or push out important context. The optimal number of retrieved documents balances recall against precision and context window utilization.",
      },
      {
        id: "q5",
        questionNumber: 5,
        questionText:
          "Which factor is most important when selecting an embedding model for a RAG system?",
        options: {
          a: "The embedding model should have the largest possible dimensionality for best results",
          b: "The embedding model should match the domain of your documents and produce embeddings in a shared semantic space for queries and documents",
          c: "The embedding model should be the newest model available regardless of domain",
          d: "The embedding model's training data size is the only factor that matters",
        },
        correctAnswer: "b",
        explanation:
          "The embedding model must map both queries and documents into a shared semantic space where similar content has similar vectors. A model trained on your domain (medical, legal, code) outperforms a general-purpose one. The query and document embedding models must match (same model or compatible training) for cosine similarity to be meaningful.",
      },
    ],
    solution: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  // ========== WEEK 5 ADDITIONS: Pretraining Fundamentals ==========
  {
    id: "cosine-lr-schedule",
    type: "coding",
    title: "Cosine Learning Rate Schedule with Warmup",
    description: `Implement a cosine learning rate schedule with linear warmup.

LLM pretraining uses a two-phase schedule: a short linear warmup followed by cosine decay. Implement the function that computes the learning rate at step \`t\`.

**Phases:**
1. **Warmup** (\`t < warmup_steps\`): linear ramp from 0 to \`max_lr\`
2. **Cosine decay** (\`warmup_steps <= t <= total_steps\`): cosine from \`max_lr\` down to \`min_lr\`
3. **After training** (\`t > total_steps\`): clamp to \`min_lr\`

**Example:**
\`\`\`python
>>> get_lr(step=0, max_lr=1e-3, min_lr=1e-4, warmup_steps=100, total_steps=1000)
0.0
>>> get_lr(step=50, max_lr=1e-3, min_lr=1e-4, warmup_steps=100, total_steps=1000)
0.0005
>>> get_lr(step=100, max_lr=1e-3, min_lr=1e-4, warmup_steps=100, total_steps=1000)
0.001
>>> get_lr(step=550, max_lr=1e-3, min_lr=1e-4, warmup_steps=100, total_steps=1000)
0.00055  # approximately
\`\`\``,
    difficulty: "Medium",
    weekNumber: 5,
    tags: '["training", "learning-rate", "scheduler", "pretraining"]',
    theory: `Cosine annealing with warmup is the standard LR schedule for LLM pretraining (GPT-3, LLaMA, Chinchilla all use it).

**Why warmup?** At the start of training, parameters are random and gradients are noisy. A large LR would cause destructive updates. Warmup lets the model reach a stable region before applying the full learning rate.

**Why cosine?** The cosine curve provides smooth decay that keeps the LR relatively high early (making progress fast) then drops it near the end (fine-tuning the solution). Compared to step decay, cosine avoids sudden jumps that can destabilize training.

**Cosine formula:** For the decay phase, the fraction of progress is \`p = (t - warmup) / (total - warmup)\`. The LR is \`min_lr + 0.5 * (max_lr - min_lr) * (1 + cos(pi * p))\`. At p=0, LR = max_lr. At p=1, LR = min_lr.

**min_lr** is typically 10x smaller than max_lr (e.g., max=6e-4, min=6e-5 for GPT-3).`,
    hints: '["Warmup: lr = max_lr * (step / warmup_steps)", "Decay phase: compute progress p = (step - warmup_steps) / (total_steps - warmup_steps)", "Cosine: lr = min_lr + 0.5 * (max_lr - min_lr) * (1 + math.cos(math.pi * p))", "After total_steps: return min_lr"]',
    visualizationComponent: null,
    sortOrder: 10,
    starterCode: `import math

def get_lr(step, max_lr, min_lr, warmup_steps, total_steps):
    """
    Compute learning rate at the given step using cosine schedule with linear warmup.

    Args:
        step: current training step (int, 0-indexed)
        max_lr: peak learning rate (float)
        min_lr: minimum learning rate (float)
        warmup_steps: number of linear warmup steps (int)
        total_steps: total number of training steps (int)

    Returns:
        float: learning rate at this step
    """
    pass`,
    solution: `\`\`\`python
import math

def get_lr(step, max_lr, min_lr, warmup_steps, total_steps):
    # Linear warmup
    if step < warmup_steps:
        return max_lr * step / warmup_steps
    # After training: clamp to min_lr
    if step > total_steps:
        return min_lr
    # Cosine decay
    progress = (step - warmup_steps) / (total_steps - warmup_steps)
    return min_lr + 0.5 * (max_lr - min_lr) * (1 + math.cos(math.pi * progress))
\`\`\`

**Approach:** Three cases by step position. Warmup is a linear interpolation from 0 to max_lr. The cosine phase maps progress in [0,1] to cosine in [max_lr, min_lr]. The formula uses the identity cos(0)=1 (start high) and cos(pi)=-1 (end low).`,
    testCases: [
      {
        id: "t1",
        name: "Step 0 returns 0",
        inputs: { step: 0, max_lr: 1e-3, min_lr: 1e-4, warmup_steps: 100, total_steps: 1000 },
        isPublic: true,
      },
      {
        id: "t2",
        name: "End of warmup returns max_lr",
        inputs: { step: 100, max_lr: 1e-3, min_lr: 1e-4, warmup_steps: 100, total_steps: 1000 },
        isPublic: true,
      },
      {
        id: "t3",
        name: "End of training returns min_lr",
        inputs: { step: 1000, max_lr: 1e-3, min_lr: 1e-4, warmup_steps: 100, total_steps: 1000 },
        isPublic: false,
      },
      {
        id: "t4",
        name: "Midpoint of cosine is between min and max",
        inputs: { step: 550, max_lr: 1e-3, min_lr: 1e-4, warmup_steps: 100, total_steps: 1000 },
        isPublic: false,
      },
      {
        id: "t5",
        name: "Beyond total steps clamps to min_lr",
        inputs: { step: 2000, max_lr: 1e-3, min_lr: 1e-4, warmup_steps: 100, total_steps: 1000 },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "gradient-clipping",
    type: "coding",
    title: "Gradient Norm Clipping",
    description: `Implement gradient clipping by global norm.

Before each optimizer step, large gradient norms destabilize training. The standard fix: compute the global norm across all parameters, and if it exceeds a threshold, scale all gradients down proportionally.

**Global norm:** \`||g|| = sqrt(sum(||g_i||^2))\` across all parameter tensors.

**Clip rule:** If \`||g|| > max_norm\`, multiply every gradient by \`max_norm / ||g||\`. Otherwise, leave gradients unchanged.

**Example:**
\`\`\`python
>>> grads = [np.array([3.0, 4.0]), np.array([0.0])]
>>> clip_gradients(grads, max_norm=1.0)
[array([0.6, 0.8]), array([0.0])]  # global norm was 5.0, scaled by 1/5
\`\`\``,
    difficulty: "Easy",
    weekNumber: 5,
    tags: '["training", "gradient-clipping", "optimization", "pretraining"]',
    theory: `Gradient clipping prevents exploding gradients during training, a critical issue in deep networks and recurrent models.

**Why gradients explode:** In deep networks, gradients multiply through many layers. If the product of Jacobians exceeds 1, gradients grow exponentially with depth. Transformers with many layers are particularly susceptible during early training.

**Global vs per-parameter:** Global norm clipping scales all gradients by the same factor, preserving their relative directions. Per-parameter clipping changes gradient directions and is rarely used.

**Typical threshold:** max_norm=1.0 is standard for LLM pretraining (used in GPT-2, GPT-3, LLaMA). Values much larger than 1.0 provide little protection; values much smaller than 1.0 slow learning.

**When to clip:** Before each optimizer step, after loss.backward(). In PyTorch: \`torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)\`.`,
    hints: '["Compute global norm: sqrt(sum(np.sum(g**2) for g in grads))", "Only scale if global_norm > max_norm", "Scale factor: max_norm / global_norm", "Return new list with each gradient multiplied by the scale factor"]',
    visualizationComponent: null,
    sortOrder: 11,
    starterCode: `import numpy as np

def clip_gradients(grads, max_norm):
    """
    Clip gradients by global norm in-place, returning the clipped list.

    Args:
        grads: list of numpy arrays (gradient tensors)
        max_norm: maximum allowed global gradient norm (float)

    Returns:
        list of numpy arrays: clipped gradients (same shapes as input)
        float: global norm before clipping
    """
    pass`,
    solution: `\`\`\`python
import numpy as np

def clip_gradients(grads, max_norm):
    global_norm = np.sqrt(sum(np.sum(g ** 2) for g in grads))
    if global_norm > max_norm:
        scale = max_norm / global_norm
        grads = [g * scale for g in grads]
    return grads, float(global_norm)
\`\`\`

**Approach:** Sum the squared L2 norms of each gradient tensor, take the square root to get the global norm. If it exceeds max_norm, scale every tensor by \`max_norm / global_norm\`. This preserves gradient direction while bounding the step size.`,
    testCases: [
      {
        id: "t1",
        name: "Clip gradient with global norm 5 to max_norm 1",
        inputs: { grads: [[3.0, 4.0], [0.0]], max_norm: 1.0 },
        isPublic: true,
      },
      {
        id: "t2",
        name: "No clip when norm is below threshold",
        inputs: { grads: [[0.3, 0.4]], max_norm: 1.0 },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Multiple tensors, norm exactly equals max_norm",
        inputs: { grads: [[0.6, 0.8]], max_norm: 1.0 },
        isPublic: false,
      },
      {
        id: "t4",
        name: "All-zero gradients",
        inputs: { grads: [[0.0, 0.0], [0.0]], max_norm: 1.0 },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "chinchilla-calculator",
    type: "coding",
    title: "Chinchilla Compute-Optimal Scaling",
    description: `Implement the Chinchilla compute-optimal allocation formulas.

The Chinchilla paper (Hoffmann et al. 2022) showed that most LLMs were undertrained: given a fixed compute budget, you should train a smaller model on more tokens than previously thought.

**Key formula:** For a compute budget C (in FLOPs), the optimal parameter count N and dataset size D satisfy:

\`\`\`
C ≈ 6 * N * D    (FLOPs for a forward+backward pass)
N_opt ≈ sqrt(C / 6) * (a/b)^0.5
D_opt = C / (6 * N_opt)
\`\`\`

Where a=406.4 and b=410.7 are empirical constants from the Chinchilla paper. For practical purposes, **N_opt ≈ sqrt(C / 12)** and **D_opt ≈ N_opt * 20** tokens.

Implement three functions:
1. \`compute_budget(N, D)\` - FLOPs for training N params on D tokens
2. \`optimal_model_size(C)\` - optimal N given compute budget C
3. \`optimal_dataset_size(N)\` - optimal D given model size N

**Example:**
\`\`\`python
>>> C = compute_budget(N=7e9, D=1e12)  # 7B model, 1T tokens
>>> C
4.2e22
>>> optimal_model_size(C=1e23)
# ~2.9B params for 1e23 FLOPs budget
\`\`\``,
    difficulty: "Medium",
    weekNumber: 5,
    tags: '["scaling-laws", "chinchilla", "pretraining", "compute"]',
    theory: `Before Chinchilla (2022), the prevailing rule was "bigger is better" - LLaMA's predecessors (Gopher 280B, GPT-3 175B) used far more compute on parameters than on data.

**Chinchilla insight:** For a fixed FLOP budget, training a model with half the parameters for twice as long achieves better performance. Chinchilla (70B, 1.4T tokens) outperformed Gopher (280B, 300B tokens) at 4x fewer FLOPs.

**The 20-tokens rule:** Optimal D ≈ 20 × N. So a 7B parameter model should train on ~140B tokens. LLaMA-2 7B used 2T tokens - 5x the Chinchilla optimal, deliberately "overtrained" for better inference efficiency.

**Why 6N per token?** Each forward pass does ~2N FLOPs (one multiply-add per parameter). Backprop costs ~2x forward. So total is ~6N FLOPs per token. This is an approximation; attention layers add more, but it's correct to order of magnitude.

**Scaling law:** Loss ∝ N^(-0.34) * D^(-0.28). More parameters and more data both help, but with diminishing returns (exponents < 1).`,
    hints: '["compute_budget: return 6 * N * D", "optimal_model_size: use math.sqrt(C / 6) as approximation, or the exact formula sqrt((a/b) * C / 6)", "optimal_dataset_size: return 20 * N (Chinchilla ratio) or C / (6 * N)"]',
    visualizationComponent: null,
    sortOrder: 12,
    starterCode: `import math

def compute_budget(N, D):
    """
    Estimate total FLOPs for training.

    Args:
        N: number of model parameters (float)
        D: number of training tokens (float)

    Returns:
        float: approximate total FLOPs
    """
    pass

def optimal_model_size(C):
    """
    Compute Chinchilla-optimal parameter count for a given compute budget.

    Args:
        C: total compute budget in FLOPs (float)

    Returns:
        float: optimal number of parameters N
    """
    pass

def optimal_dataset_size(N):
    """
    Compute Chinchilla-optimal training tokens for a given model size.

    Args:
        N: number of model parameters (float)

    Returns:
        float: optimal number of training tokens D
    """
    pass`,
    solution: `\`\`\`python
import math

# Chinchilla empirical constants
A = 406.4
B = 410.7

def compute_budget(N, D):
    return 6 * N * D

def optimal_model_size(C):
    # From Chinchilla: N_opt = sqrt((A/B) * C/6)
    return math.sqrt((A / B) * C / 6)

def optimal_dataset_size(N):
    # D_opt ≈ 20 * N from Chinchilla ratio
    return 20 * N
\`\`\`

**Approach:** \`compute_budget\` applies the 6N*D rule. \`optimal_model_size\` uses the Chinchilla formula: at the optimum, marginal improvement from adding a parameter equals marginal improvement from adding a token, which gives N_opt ∝ sqrt(C). \`optimal_dataset_size\` uses the empirical 20:1 token-to-parameter ratio.`,
    testCases: [
      {
        id: "t1",
        name: "compute_budget for 7B params, 1T tokens",
        inputs: { N: 7e9, D: 1e12 },
        isPublic: true,
      },
      {
        id: "t2",
        name: "optimal_model_size for 1e23 FLOPs",
        inputs: { C: 1e23 },
        isPublic: true,
      },
      {
        id: "t3",
        name: "optimal_dataset_size for 7B model",
        inputs: { N: 7e9 },
        isPublic: false,
      },
      {
        id: "t4",
        name: "Chinchilla itself: 70B * 1.4T tokens",
        inputs: { N: 70e9, D: 1.4e12 },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
];
