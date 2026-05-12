import type { Problem } from "@/types/problem";

export const MILESTONE_PROBLEMS: Problem[] = [

  // ========== MILESTONE 3: LoRA Weight Update (Week 5) ==========
  {
    id: "lora-weight-update",
    type: "coding",
    title: "LoRA Weight Update",
    description: `Implement LoRA (Low-Rank Adaptation) - the technique that makes fine-tuning large language models practical.

Build a \`LoRALayer\` class that wraps a frozen pre-trained weight matrix with two small trainable matrices A and B. The effective weight becomes $W + BA$ where B has shape (d_out, r) and A has shape (r, d_in), with $r \\ll \\min(d_{in}, d_{out})$.

Implement these methods:

1. **\`__init__(self, W, rank)\`** - Store the frozen weight matrix W. Initialize A from standard normal scaled by 0.01, initialize B as zeros. Use \`np.random.seed(42)\` before initializing A.

2. **\`forward(self, x)\`** - Compute the output: $x(W + BA)^T$. The input x has shape (batch, d_in).

3. **\`training_step(self, x, target, lr)\`** - Run one gradient descent step that updates ONLY A and B (W stays frozen). Use MSE loss: $\\text{mean}((\\text{output} - \\text{target})^2)$. Return the loss value.

4. **\`param_count(self)\`** - Return a dict with \`"lora"\` (number of parameters in A and B combined) and \`"full"\` (number of parameters in W).

**Example:**
\`\`\`python
>>> W = np.random.randn(8, 4)  # 8 output, 4 input
>>> layer = LoRALayer(W, rank=2)
>>> layer.param_count()
{"lora": 24, "full": 32}   # 2*4 + 2*8 = 24 vs 8*4 = 32
>>> x = np.array([[1.0, 0.0, 0.0, 0.0]])
>>> loss_before = layer.training_step(x, target, lr=0.01)
>>> loss_after = layer.training_step(x, target, lr=0.01)
>>> loss_after < loss_before  # LoRA learns!
True
\`\`\``,
    difficulty: "Hard",
    weekNumber: 5,
    tags: '["lora", "fine-tuning", "parameter-efficient", "low-rank"]',
    theory: `LoRA (Low-Rank Adaptation) solves a practical problem: fine-tuning a 7B parameter model requires storing a separate copy of all 7 billion parameters for each task. LoRA cuts that to a few million.

**The key insight.** Aggarwal et al. (2021) and Hu et al. (2022) observed that weight updates during fine-tuning have low intrinsic dimensionality. When you fine-tune a pre-trained model, the change in weights ($\\Delta W = W_{\\text{finetuned}} - W_{\\text{pretrained}}$) can be well-approximated by a low-rank matrix. If W is $d_{out} \\times d_{in}$, then $\\Delta W$ can be approximated as $BA$ where B is $d_{out} \\times r$ and A is $r \\times d_{in}$, with r typically 4-64.

**The math.** The original layer computes $y = xW^T$. With LoRA: $y = x(W + BA)^T$. During fine-tuning, W is frozen (no gradients). Only A and B receive gradient updates. The number of trainable parameters drops from $d_{in} \\times d_{out}$ to $r \\times (d_{in} + d_{out})$. For a $4096 \\times 4096$ weight matrix with rank 8, that is 65,536 trainable parameters instead of 16,777,216 - a 256x reduction.

**Why low rank works.** Pre-trained models already encode general knowledge in their weights. Fine-tuning for a specific task requires adjusting a relatively small subspace of the weight matrix. The rank r controls how expressive the adaptation can be. Rank 1 can only add a single direction to the weight matrix. Rank 8-64 captures enough variation for most downstream tasks.

**Connection to SVD.** Any matrix can be decomposed via SVD into $U \\Sigma V^T$. The best rank-r approximation keeps only the top r singular values. LoRA does not compute SVD explicitly - it lets gradient descent find the right low-rank update. But the reason low-rank updates work at all is that the SVD of typical fine-tuning deltas has rapidly decaying singular values.

**Initialization matters.** B is initialized to zeros so the initial LoRA output is exactly the pre-trained output ($BA = 0$). A is initialized with small random values. This means training starts from the pre-trained model and gradually adapts.

**Why this matters.** LoRA enabled running fine-tuned LLMs on consumer hardware. Instead of loading separate 14GB model files for each task, you load one base model and swap small LoRA adapters (a few MB each). This is how tools like QLoRA fine-tune 65B models on a single GPU.`,
    hints: '["In __init__, W is frozen forever. Store it, then create A with shape (rank, d_in) and B with shape (d_out, rank). Initialize A = np.random.randn(rank, d_in) * 0.01 and B = np.zeros((d_out, rank)).", "The forward pass computes: $W_{\\\\text{eff}} = W + BA$, then $\\\\text{output} = x \\\\cdot W_{\\\\text{eff}}^T$. Make sure shapes align.", "For the training step, compute MSE loss and backpropagate through $BA$ only. The gradient of loss w.r.t. output is $\\\\frac{2(\\\\text{output} - \\\\text{target})}{N}$. Then chain through the linear layer to get gradients for A and B.", "The gradient chain: $\\\\frac{\\\\partial L}{\\\\partial \\\\text{output}} = \\\\frac{2(\\\\text{output} - \\\\text{target})}{N}$, $\\\\frac{\\\\partial L}{\\\\partial W_{\\\\text{eff}}} = \\\\frac{\\\\partial L}{\\\\partial \\\\text{output}}^T \\\\cdot x$, $\\\\frac{\\\\partial L}{\\\\partial B} = \\\\frac{\\\\partial L}{\\\\partial W_{\\\\text{eff}}} \\\\cdot A^T$, $\\\\frac{\\\\partial L}{\\\\partial A} = B^T \\\\cdot \\\\frac{\\\\partial L}{\\\\partial W_{\\\\text{eff}}}$. Only update A and B."]',
    visualizationComponent: null,
    sortOrder: 10,
    prerequisites: ["lora-implementation"],
    starterCode: `import numpy as np

class LoRALayer:
    """
    Low-Rank Adaptation layer.

    Wraps a frozen weight matrix W (d_out, d_in) with trainable
    low-rank matrices A (rank, d_in) and B (d_out, rank).

    Effective weight: W_eff = W + B @ A
    Output: y = x @ W_eff.T
    """

    def __init__(self, W, rank):
        """
        Args:
            W: numpy array of shape (d_out, d_in), the frozen pre-trained weights
            rank: int, the rank of the LoRA adaptation
        """
        np.random.seed(42)
        # Your implementation here
        pass

    def forward(self, x):
        """
        Compute output with LoRA adaptation.

        Args:
            x: input array of shape (batch_size, d_in)

        Returns:
            numpy array of shape (batch_size, d_out)
        """
        # Your implementation here
        pass

    def training_step(self, x, target, lr):
        """
        One step of gradient descent updating ONLY A and B.
        W must remain frozen.

        Uses MSE loss: L = mean((output - target)^2)

        Args:
            x: input, shape (batch_size, d_in)
            target: target output, shape (batch_size, d_out)
            lr: learning rate

        Returns:
            float - the MSE loss before the update
        """
        # Your implementation here
        pass

    def param_count(self):
        """
        Return parameter counts.

        Returns:
            dict with keys "lora" (params in A + B) and "full" (params in W)
        """
        # Your implementation here
        pass`,
    solution: `\`\`\`python
import numpy as np

class LoRALayer:
    def __init__(self, W, rank):
        np.random.seed(42)
        self.W = np.array(W, dtype=np.float64)  # Frozen
        self.rank = rank
        d_out, d_in = self.W.shape

        # A: (rank, d_in), small random init
        self.A = np.random.randn(rank, d_in) * 0.01
        # B: (d_out, rank), zero init so initial output = pre-trained output
        self.B = np.zeros((d_out, rank))

    def forward(self, x):
        x = np.array(x, dtype=np.float64)
        # W_eff = W + B @ A, shape (d_out, d_in)
        W_eff = self.W + self.B @ self.A
        # output = x @ W_eff.T, shape (batch, d_out)
        return x @ W_eff.T

    def training_step(self, x, target, lr):
        x = np.array(x, dtype=np.float64)
        target = np.array(target, dtype=np.float64)
        N = x.shape[0]

        # Forward pass
        W_eff = self.W + self.B @ self.A
        output = x @ W_eff.T

        # MSE loss
        diff = output - target
        loss = float(np.mean(diff ** 2))

        # Backward pass - gradients w.r.t. output
        d_output = 2.0 * diff / N  # (batch, d_out)

        # Gradient w.r.t. W_eff: d_loss/dW_eff = d_output.T @ x
        dW_eff = d_output.T @ x  # (d_out, d_in)

        # Gradient w.r.t. B: dW_eff @ A.T -> (d_out, rank)
        dB = dW_eff @ self.A.T

        # Gradient w.r.t. A: B.T @ dW_eff -> (rank, d_in)
        dA = self.B.T @ dW_eff

        # Update only A and B (W stays frozen)
        self.A -= lr * dA
        self.B -= lr * dB

        return loss

    def param_count(self):
        lora_params = self.A.size + self.B.size
        full_params = self.W.size
        return {"lora": int(lora_params), "full": int(full_params)}
\`\`\`

**Approach:** Store W as frozen. Initialize B to zeros so the initial effective weight equals W exactly. The forward pass computes $x(W + BA)^T$. The training step uses MSE loss and backpropagates through the matrix product to get gradients for A and B only. The key gradient chain: $\\frac{\\partial L}{\\partial \\text{output}} \\to \\frac{\\partial L}{\\partial W_{\\text{eff}}}$ (via $x$) $\\to \\frac{\\partial L}{\\partial B}$ (via $A^T$) and $\\frac{\\partial L}{\\partial A}$ (via $B^T$).`,
    testCases: [
      {
        id: "t1",
        name: "Parameter count is correct",
        inputs: {
          W: [
            [1.0, 2.0, 3.0, 4.0],
            [5.0, 6.0, 7.0, 8.0],
            [9.0, 10.0, 11.0, 12.0],
            [13.0, 14.0, 15.0, 16.0],
            [17.0, 18.0, 19.0, 20.0],
            [21.0, 22.0, 23.0, 24.0],
          ],
          rank: 2,
        },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Initial forward matches pre-trained output",
        inputs: {
          W: [
            [0.5, -0.3, 0.8],
            [-0.2, 0.7, -0.1],
          ],
          rank: 1,
          x: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0]],
        },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Training step decreases loss",
        inputs: {
          W: [
            [0.1, 0.2, 0.3, 0.4],
            [0.5, 0.6, 0.7, 0.8],
            [0.9, 1.0, 1.1, 1.2],
          ],
          rank: 2,
          x: [
            [1.0, 0.0, 0.0, 0.0],
            [0.0, 1.0, 0.0, 0.0],
          ],
          target: [
            [0.0, 0.0, 1.0],
            [1.0, 0.0, 0.0],
          ],
          lr: 0.1,
          num_steps: 5,
        },
        isPublic: true,
      },
      {
        id: "t4",
        name: "Original weights unchanged after training",
        inputs: {
          W: [
            [1.0, 0.0],
            [0.0, 1.0],
            [0.5, 0.5],
          ],
          rank: 1,
          x: [[1.0, 0.0], [0.0, 1.0], [0.5, 0.5]],
          target: [[0.0, 1.0, 0.0], [1.0, 0.0, 0.0], [0.0, 0.0, 1.0]],
          lr: 0.05,
          num_steps: 10,
        },
        isPublic: false,
      },
      {
        id: "t5",
        name: "Rank constraint maintained",
        inputs: {
          W: [
            [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
            [0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1],
            [0.1, 0.3, 0.5, 0.7, 0.9, 0.2, 0.4, 0.6],
            [0.9, 0.7, 0.5, 0.3, 0.1, 0.8, 0.6, 0.4],
          ],
          rank: 2,
          x: [[1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]],
          target: [[0.0, 0.0, 0.0, 1.0]],
          lr: 0.01,
          num_steps: 3,
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
