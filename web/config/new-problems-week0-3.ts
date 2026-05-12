import type { Problem } from "@/types/problem";

export const NEW_PROBLEMS_0_3: Problem[] = [
  // ========== WEEK 0: Math Foundations (new problems) ==========
  {
    id: "gradient-computation",
    type: "coding",
    title: "Gradient Computation",
    description: `Compute partial derivatives of common ML functions by hand (in code).

Given a function name and an input value, return the gradient (derivative) at that point.

You must handle three functions:
- **MSE loss** with respect to prediction: \`L = (y_pred - y_true)^2\`, so \`dL/dy_pred = 2*(y_pred - y_true)\`
- **Sigmoid**: \`sigma(x) = 1/(1+exp(-x))\`, so \`sigma'(x) = sigma(x)*(1 - sigma(x))\`
- **ReLU**: \`relu(x) = max(0, x)\`, so \`relu'(x) = 1 if x > 0 else 0\`

**Example:**
\`\`\`python
>>> compute_gradient("sigmoid", {"x": 0.0})
0.25

>>> compute_gradient("mse", {"y_pred": 3.0, "y_true": 1.0})
4.0

>>> compute_gradient("relu", {"x": -2.0})
0.0
\`\`\``,
    difficulty: "Easy",
    weekNumber: 0,
    tags: '["calculus", "gradients", "math"]',
    theory: `Gradients tell you how much a function's output changes when you nudge each input. In ML, gradients of the loss function with respect to parameters drive all learning.

**MSE gradient:** For \`L = (y_pred - y_true)^2\`, the derivative w.r.t. \`y_pred\` is \`2*(y_pred - y_true)\`. Positive gradient means "reduce y_pred", negative means "increase it".

**Sigmoid gradient:** \`sigma'(x) = sigma(x) * (1 - sigma(x))\`. This peaks at x=0 (value = 0.25) and vanishes for large |x|. This vanishing gradient is why deep networks with sigmoid activations train poorly.

**ReLU gradient:** 1 for positive inputs, 0 for negative. Simple and avoids the vanishing gradient problem for positive inputs, but "dead neurons" can occur when inputs are always negative.`,
    hints: '["For MSE, just apply the power rule: d/dx (x-c)^2 = 2(x-c)", "For sigmoid, compute sigma(x) first, then multiply sigma(x)*(1-sigma(x))", "For ReLU, the derivative is a step function: 1 if x > 0, else 0"]',
    visualizationComponent: "GradientComputationViz",
    sortOrder: 6,
    starterCode: `import numpy as np

def compute_gradient(func_name, inputs):
    """
    Compute the gradient of a function at given inputs.

    Args:
        func_name: one of "mse", "sigmoid", "relu"
        inputs: dict of input values
            - "mse": {"y_pred": float, "y_true": float}
            - "sigmoid": {"x": float}
            - "relu": {"x": float}

    Returns:
        float - the gradient value
    """
    # Your implementation here
    pass`,
    solution: `\`\`\`python
import numpy as np

def compute_gradient(func_name, inputs):
    if func_name == "mse":
        y_pred = inputs["y_pred"]
        y_true = inputs["y_true"]
        return 2.0 * (y_pred - y_true)
    elif func_name == "sigmoid":
        x = inputs["x"]
        s = 1.0 / (1.0 + np.exp(-x))
        return s * (1.0 - s)
    elif func_name == "relu":
        x = inputs["x"]
        return 1.0 if x > 0 else 0.0
    else:
        raise ValueError(f"Unknown function: {func_name}")
\`\`\`

**Approach:** Apply the analytical derivative formula for each function. No numerical differentiation needed - these are closed-form expressions.`,
    testCases: [
      { id: "t1", name: "Sigmoid at x=0", inputs: { func_name: "sigmoid", inputs: { x: 0.0 } }, isPublic: true },
      { id: "t2", name: "MSE gradient", inputs: { func_name: "mse", inputs: { y_pred: 3.0, y_true: 1.0 } }, isPublic: true },
      { id: "t3", name: "ReLU negative", inputs: { func_name: "relu", inputs: { x: -2.0 } }, isPublic: false },
      { id: "t4", name: "Sigmoid large positive", inputs: { func_name: "sigmoid", inputs: { x: 5.0 } }, isPublic: false },
      { id: "t5", name: "ReLU positive", inputs: { func_name: "relu", inputs: { x: 3.5 } }, isPublic: false },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "chain-rule",
    type: "coding",
    title: "Chain Rule Implementation",
    description: `Implement the chain rule for a simple computational graph.

Given a composition of functions, compute the derivative of the entire chain at a given input by propagating derivatives backwards.

You will implement \`chain_rule_forward\` and \`chain_rule_backward\`:
- **Forward pass:** Compute the output of composing functions left to right: \`f3(f2(f1(x)))\`
- **Backward pass:** Compute \`df/dx\` using the chain rule: \`df/dx = f1'(x) * f2'(f1(x)) * f3'(f2(f1(x)))\`

Each function in the chain is one of: \`"square"\` (x^2), \`"double"\` (2x), \`"sigmoid"\` (1/(1+exp(-x))), \`"negate"\` (-x).

**Example:**
\`\`\`python
>>> chain = ["double", "square"]  # f(x) = (2x)^2
>>> chain_rule_forward(chain, 3.0)
36.0   # (2*3)^2 = 36

>>> chain_rule_backward(chain, 3.0)
24.0   # d/dx (2x)^2 = 2 * 2*(2x) = 2 * 12 = 24
\`\`\``,
    difficulty: "Medium",
    weekNumber: 0,
    tags: '["calculus", "chain-rule", "backpropagation", "math"]',
    theory: `The chain rule is the mathematical backbone of backpropagation. For composed functions \`f(g(h(x)))\`, the derivative is:

\`df/dx = h'(x) * g'(h(x)) * f'(g(h(x)))\`

Each factor is the local derivative of one function, evaluated at its input during the forward pass. This is why neural networks store intermediate activations: you need them to compute local gradients during the backward pass.

**Local derivatives you need:**
- \`square(x) = x^2\` -> derivative = \`2x\`
- \`double(x) = 2x\` -> derivative = \`2\`
- \`sigmoid(x)\` -> derivative = \`sigmoid(x) * (1 - sigmoid(x))\`
- \`negate(x) = -x\` -> derivative = \`-1\`

**Algorithm:** Run forward, saving each intermediate value. Then multiply all local derivatives together (each evaluated at its saved input).`,
    hints: '["Store all intermediate values during the forward pass - you need them for the backward pass", "The backward pass multiplies local derivatives: start with 1.0 and multiply each local gradient", "Each local derivative is evaluated at the INPUT to that function, not the output"]',
    visualizationComponent: "ChainRuleViz",
    sortOrder: 7,
    starterCode: `import numpy as np

def chain_rule_forward(chain, x):
    """
    Compute the output of composing functions in chain left to right.

    Args:
        chain: list of function names, e.g. ["double", "square"]
        x: float input

    Returns:
        float - output of the composed function
    """
    # Your implementation here
    pass

def chain_rule_backward(chain, x):
    """
    Compute df/dx using the chain rule for the composed function.

    Args:
        chain: list of function names
        x: float input

    Returns:
        float - the derivative df/dx at x
    """
    # Your implementation here
    pass`,
    solution: `\`\`\`python
import numpy as np

def _apply(name, x):
    if name == "square":
        return x * x
    elif name == "double":
        return 2.0 * x
    elif name == "sigmoid":
        return 1.0 / (1.0 + np.exp(-x))
    elif name == "negate":
        return -x

def _derivative(name, x):
    if name == "square":
        return 2.0 * x
    elif name == "double":
        return 2.0
    elif name == "sigmoid":
        s = 1.0 / (1.0 + np.exp(-x))
        return s * (1.0 - s)
    elif name == "negate":
        return -1.0

def chain_rule_forward(chain, x):
    val = x
    for func in chain:
        val = _apply(func, val)
    return val

def chain_rule_backward(chain, x):
    # Forward pass: save intermediate inputs
    inputs = []
    val = x
    for func in chain:
        inputs.append(val)
        val = _apply(func, val)

    # Backward pass: multiply local derivatives
    grad = 1.0
    for func, inp in zip(chain, inputs):
        grad *= _derivative(func, inp)
    return grad
\`\`\`

**Approach:** Forward pass stores each intermediate input. Backward pass multiplies local derivatives (each evaluated at its stored input). This mirrors how autograd systems like PyTorch work.`,
    testCases: [
      { id: "t1", name: "double then square", inputs: { chain: ["double", "square"], x: 3.0 }, isPublic: true },
      { id: "t2", name: "single sigmoid", inputs: { chain: ["sigmoid"], x: 0.0 }, isPublic: true },
      { id: "t3", name: "negate then square", inputs: { chain: ["negate", "square"], x: 2.0 }, isPublic: false },
      { id: "t4", name: "three functions", inputs: { chain: ["double", "sigmoid", "square"], x: 1.0 }, isPublic: false },
      { id: "t5", name: "identity chain", inputs: { chain: ["double", "negate", "double", "negate"], x: 5.0 }, isPublic: false },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "eigenvalue-decomposition",
    type: "coding",
    title: "Eigenvalue Decomposition (2x2)",
    description: `Compute eigenvalues and eigenvectors of a 2x2 matrix analytically.

Given a 2x2 matrix \`[[a, b], [c, d]]\`, compute its eigenvalues using the quadratic formula and find the corresponding eigenvectors. Do NOT use numpy.linalg.eig or any eigenvalue library functions.

**Formula for eigenvalues of a 2x2 matrix:**
The characteristic equation is \`lambda^2 - (a+d)*lambda + (a*d - b*c) = 0\`.

Use the quadratic formula: \`lambda = ((a+d) +/- sqrt((a+d)^2 - 4*(a*d - b*c))) / 2\`

For each eigenvalue \`lambda\`, the eigenvector \`v\` satisfies \`(A - lambda*I)*v = 0\`.

**Example:**
\`\`\`python
>>> eigenvalues, eigenvectors = eigen_decompose([[2, 1], [1, 2]])
>>> eigenvalues
[3.0, 1.0]
>>> eigenvectors  # each column is a unit eigenvector
[[0.7071, 0.7071], [-0.7071, 0.7071]]
\`\`\``,
    difficulty: "Medium",
    weekNumber: 0,
    tags: '["linear-algebra", "eigenvalues", "math"]',
    theory: `Eigenvalues and eigenvectors decompose a matrix into its fundamental "actions". A matrix \`A\` applied to its eigenvector \`v\` just scales it: \`Av = lambda * v\`.

**In ML, eigendecomposition matters for:**
- **PCA:** The principal components are eigenvectors of the covariance matrix. Eigenvalues tell you how much variance each component captures.
- **Understanding optimization:** The eigenvalues of the Hessian matrix determine how the loss landscape curves in different directions. Large eigenvalue ratios cause slow convergence (ill-conditioning).

**The 2x2 analytic solution:**
1. Trace = a + d (sum of eigenvalues)
2. Determinant = ad - bc (product of eigenvalues)
3. Discriminant = trace^2 - 4*det
4. Eigenvalues = (trace +/- sqrt(discriminant)) / 2
5. For each eigenvalue, solve (A - lambda*I)v = 0 to get the eigenvector

Return eigenvectors as unit vectors (normalized to length 1).`,
    hints: '["Compute trace = a+d and determinant = a*d - b*c first", "Use the quadratic formula on lambda^2 - trace*lambda + det = 0", "For eigenvectors: if b != 0, the eigenvector for eigenvalue lambda is [b, lambda - a] (then normalize)", "Handle the case where b=0 and c=0 (diagonal matrix) separately"]',
    visualizationComponent: "LinearAlgebraViz",
    sortOrder: 8,
    starterCode: `import numpy as np

def eigen_decompose(matrix):
    """
    Compute eigenvalues and eigenvectors of a 2x2 matrix analytically.
    Do NOT use numpy.linalg.eig.

    Args:
        matrix: list of lists, 2x2 matrix [[a, b], [c, d]]

    Returns:
        tuple of (eigenvalues, eigenvectors)
        - eigenvalues: list of 2 floats (larger first)
        - eigenvectors: list of 2 lists, each a unit eigenvector
    """
    # Your implementation here
    pass`,
    solution: `\`\`\`python
import numpy as np

def eigen_decompose(matrix):
    a, b = matrix[0][0], matrix[0][1]
    c, d = matrix[1][0], matrix[1][1]

    trace = a + d
    det = a * d - b * c
    discriminant = trace * trace - 4 * det

    if discriminant < 0:
        raise ValueError("Complex eigenvalues not supported")

    sqrt_disc = np.sqrt(discriminant)
    lambda1 = (trace + sqrt_disc) / 2.0
    lambda2 = (trace - sqrt_disc) / 2.0

    def eigenvector(lam):
        # Solve (A - lam*I)v = 0
        # Row 1: (a - lam)*v1 + b*v2 = 0
        # Row 2: c*v1 + (d - lam)*v2 = 0
        if abs(b) > 1e-10:
            v = np.array([b, lam - a], dtype=np.float64)
        elif abs(c) > 1e-10:
            v = np.array([lam - d, c], dtype=np.float64)
        else:
            # Diagonal matrix
            if abs(a - lam) < 1e-10:
                v = np.array([1.0, 0.0])
            else:
                v = np.array([0.0, 1.0])
        return v / np.linalg.norm(v)

    v1 = eigenvector(lambda1)
    v2 = eigenvector(lambda2)

    return [float(lambda1), float(lambda2)], [v1.tolist(), v2.tolist()]
\`\`\`

**Approach:** Use the characteristic equation to get eigenvalues via the quadratic formula. For each eigenvalue, solve the homogeneous system to find the eigenvector, then normalize to unit length.`,
    testCases: [
      { id: "t1", name: "Symmetric matrix", inputs: { matrix: [[2, 1], [1, 2]] }, isPublic: true },
      { id: "t2", name: "Diagonal matrix", inputs: { matrix: [[3, 0], [0, 1]] }, isPublic: true },
      { id: "t3", name: "Identity matrix", inputs: { matrix: [[1, 0], [0, 1]] }, isPublic: false },
      { id: "t4", name: "Non-symmetric", inputs: { matrix: [[4, 2], [1, 3]] }, isPublic: false },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "calculus-for-ml-quiz",
    type: "quiz",
    title: "Calculus for ML",
    description: "Test your understanding of derivatives, gradients, chain rule, and optimization concepts used in machine learning.",
    difficulty: "Easy",
    weekNumber: 0,
    tags: '["calculus", "gradients", "optimization", "quiz"]',
    theory: `Calculus powers the optimization that makes ML work. The core idea: compute how the loss changes with respect to each parameter (the gradient), then adjust parameters to reduce the loss.

**Partial derivatives:** When a function has multiple inputs, the partial derivative with respect to one input measures the rate of change while holding all other inputs fixed. For \`f(x, y) = x^2 + xy\`, the partial derivative with respect to x is \`2x + y\`.

**The gradient** is the vector of all partial derivatives: \`grad f = [df/dx, df/dy, ...]\`. It points in the direction of steepest increase. Gradient descent moves in the opposite direction.

**Chain rule** lets you differentiate composed functions: \`d/dx f(g(x)) = f'(g(x)) * g'(x)\`. Backpropagation is the chain rule applied systematically through a computational graph.

**Gradient descent** update rule: \`theta_new = theta_old - lr * gradient\`. The learning rate controls step size. Too large = divergence, too small = slow convergence.`,
    hints: "[]",
    visualizationComponent: "ProbabilityBasicsViz",
    sortOrder: 9,
    starterCode: null,
    testCases: null,
    questions: [
      {
        id: "q1",
        questionNumber: 1,
        questionText: "What is the partial derivative of f(x, y) = x^2*y + 3y with respect to x?",
        options: {
          a: "2x + 3",
          b: "2xy",
          c: "x^2 + 3",
          d: "2xy + 3",
        },
        correctAnswer: "b",
        explanation: "When taking the partial derivative with respect to x, treat y as a constant. d/dx(x^2*y) = 2xy and d/dx(3y) = 0. So the answer is 2xy.",
      },
      {
        id: "q2",
        questionNumber: 2,
        questionText: "In gradient descent, what happens if the learning rate is too large?",
        options: {
          a: "Training converges faster to the global minimum",
          b: "The loss oscillates or diverges instead of converging",
          c: "The model underfits the data",
          d: "The gradients vanish to zero",
        },
        correctAnswer: "b",
        explanation: "A learning rate that is too large causes the parameter updates to overshoot the minimum. The loss bounces back and forth across the minimum or spirals outward (diverges).",
      },
      {
        id: "q3",
        questionNumber: 3,
        questionText: "If f(x) = sigmoid(x) = 1/(1+e^(-x)), what is f'(0)?",
        options: {
          a: "0.0",
          b: "0.5",
          c: "0.25",
          d: "1.0",
        },
        correctAnswer: "c",
        explanation: "The sigmoid derivative is sigmoid(x)*(1-sigmoid(x)). At x=0, sigmoid(0) = 0.5, so f'(0) = 0.5 * (1 - 0.5) = 0.25.",
      },
      {
        id: "q4",
        questionNumber: 4,
        questionText: "Using the chain rule, what is d/dx of (3x + 1)^2?",
        options: {
          a: "2(3x + 1)",
          b: "6(3x + 1)",
          c: "9x^2",
          d: "6x + 2",
        },
        correctAnswer: "b",
        explanation: "Let u = 3x + 1. Then d/dx(u^2) = 2u * du/dx = 2(3x + 1) * 3 = 6(3x + 1). The chain rule multiplies the outer derivative by the inner derivative.",
      },
      {
        id: "q5",
        questionNumber: 5,
        questionText: "The gradient of a loss function at a point tells you:",
        options: {
          a: "The value of the loss at that point",
          b: "The direction of steepest increase of the loss",
          c: "The global minimum of the loss",
          d: "How many epochs are needed to converge",
        },
        correctAnswer: "b",
        explanation: "The gradient is a vector pointing in the direction of steepest increase. Gradient descent moves in the OPPOSITE direction (steepest decrease) to minimize the loss. The gradient says nothing about where the global minimum is - only the local slope.",
      },
    ],
    solution: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },

  // ========== WEEK 1: Neural Networks (new problems) ==========
  {
    id: "backpropagation-single-layer",
    type: "coding",
    title: "Backpropagation: Single Layer",
    description: `Implement backpropagation for a single linear layer with sigmoid activation.

Given inputs \`X\`, weights \`W\`, bias \`b\`, and upstream gradient \`dout\`, compute the gradients \`dW\` and \`db\`.

The forward pass is: \`Z = X @ W + b\`, then \`A = sigmoid(Z)\`.

The backward pass must compute:
- \`dZ = dout * sigmoid'(Z) = dout * A * (1 - A)\`
- \`dW = X.T @ dZ\`
- \`db = sum(dZ, axis=0)\`
- \`dX = dZ @ W.T\` (gradient flowing to previous layer)

**Example:**
\`\`\`python
>>> X = np.array([[1.0, 2.0]])   # shape (1, 2)
>>> W = np.array([[0.5], [0.3]]) # shape (2, 1)
>>> b = np.array([0.1])          # shape (1,)
>>> dout = np.array([[1.0]])     # upstream gradient
>>> grads = backprop_single_layer(X, W, b, dout)
>>> grads["dW"].shape
(2, 1)
\`\`\``,
    difficulty: "Medium",
    weekNumber: 1,
    tags: '["backpropagation", "neural-networks", "gradients"]',
    theory: `Backpropagation computes gradients by applying the chain rule backwards through the computational graph. For a single layer with sigmoid:

**Forward:** \`Z = XW + b\`, \`A = sigmoid(Z)\`

**Backward (working from output to input):**
1. You receive \`dout = dL/dA\` from the next layer
2. \`dZ = dout * dA/dZ = dout * A*(1-A)\` (sigmoid local gradient)
3. \`dW = dZ/dW = X^T @ dZ\` (each weight's gradient depends on its input)
4. \`db = sum(dZ, axis=0)\` (bias gradient sums over the batch)
5. \`dX = dZ @ W^T\` (pass gradient to previous layer)

The shapes must match: if X is (batch, in_features) and W is (in_features, out_features), then dW has the same shape as W.`,
    hints: '["Compute the forward pass first to get Z and A - you need A for the sigmoid derivative", "The sigmoid derivative is A*(1-A) where A is the sigmoid output", "Matrix dimensions: dW must match W shape, so dW = X.T @ dZ", "db sums over the batch dimension (axis=0)"]',
    visualizationComponent: "BackpropagationViz",
    sortOrder: 3,
    starterCode: `import numpy as np

def backprop_single_layer(X, W, b, dout):
    """
    Forward and backward pass for a single linear+sigmoid layer.

    Args:
        X: input, shape (batch_size, in_features)
        W: weights, shape (in_features, out_features)
        b: bias, shape (out_features,)
        dout: upstream gradient dL/dA, shape (batch_size, out_features)

    Returns:
        dict with keys: "A" (forward output), "dW", "db", "dX"
    """
    # Your implementation here
    pass`,
    solution: `\`\`\`python
import numpy as np

def backprop_single_layer(X, W, b, dout):
    # Forward pass
    Z = X @ W + b
    A = 1.0 / (1.0 + np.exp(-Z))  # sigmoid

    # Backward pass
    dZ = dout * A * (1.0 - A)  # sigmoid derivative
    dW = X.T @ dZ
    db = np.sum(dZ, axis=0)
    dX = dZ @ W.T

    return {"A": A, "dW": dW, "db": db, "dX": dX}
\`\`\`

**Approach:** Run the forward pass to get A (needed for sigmoid derivative). Then chain the gradients backwards: dout -> dZ (multiply by sigmoid derivative) -> dW, db, dX (linear layer gradients).`,
    testCases: [
      {
        id: "t1",
        name: "Single sample",
        inputs: {
          X: [[1.0, 2.0]],
          W: [[0.5], [0.3]],
          b: [0.1],
          dout: [[1.0]],
        },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Batch of 2",
        inputs: {
          X: [[1.0, 0.0], [0.0, 1.0]],
          W: [[0.4, 0.2], [0.1, 0.5]],
          b: [0.0, 0.0],
          dout: [[1.0, 1.0], [1.0, 1.0]],
        },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Zero input",
        inputs: {
          X: [[0.0, 0.0]],
          W: [[0.5], [0.3]],
          b: [0.0],
          dout: [[1.0]],
        },
        isPublic: false,
      },
      {
        id: "t4",
        name: "Large values",
        inputs: {
          X: [[10.0, -10.0]],
          W: [[1.0], [-1.0]],
          b: [0.0],
          dout: [[1.0]],
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
    id: "learning-rate-scheduler",
    type: "coding",
    title: "Learning Rate Schedulers",
    description: `Implement three common learning rate schedulers used in neural network training.

Given an initial learning rate and the current epoch/step, compute the adjusted learning rate.

1. **Step Decay:** Multiply LR by \`gamma\` every \`step_size\` epochs.
   \`lr = initial_lr * gamma^(epoch // step_size)\`

2. **Exponential Decay:** Decay by \`gamma\` each epoch.
   \`lr = initial_lr * gamma^epoch\`

3. **Cosine Annealing:** Smoothly decrease LR following a cosine curve from \`initial_lr\` to \`min_lr\`.
   \`lr = min_lr + 0.5 * (initial_lr - min_lr) * (1 + cos(pi * epoch / T_max))\`

**Example:**
\`\`\`python
>>> step_decay(0.1, epoch=10, step_size=5, gamma=0.5)
0.025   # 0.1 * 0.5^2

>>> cosine_annealing(0.1, epoch=50, T_max=100, min_lr=0.001)
0.0505  # halfway through, LR is roughly halved
\`\`\``,
    difficulty: "Medium",
    weekNumber: 1,
    tags: '["optimization", "learning-rate", "training"]',
    theory: `A fixed learning rate is rarely optimal. Training benefits from starting with a larger LR (explore broadly) and reducing it later (fine-tune near the minimum).

**Step decay** is the simplest: drop the LR by a factor every N epochs. Used in classic ResNet training (drop by 10x at epochs 30, 60, 90).

**Exponential decay** provides smooth reduction but can decay too aggressively. Common in older frameworks.

**Cosine annealing** (Loshchilov & Hutter, 2017) follows a half-cosine from initial_lr to min_lr. It decays slowly at first, fast in the middle, and slowly again near the end. This is the most popular scheduler in modern training - used by GPT, LLaMA, and most vision transformers.

**Why cosine works well:** The slow start lets the model settle into a good basin. The fast middle phase does most of the LR reduction. The slow end allows fine-grained optimization near the minimum.`,
    hints: '["Step decay uses integer division (epoch // step_size) as the exponent", "For exponential decay, gamma should be slightly less than 1 (e.g., 0.95)", "Cosine annealing uses np.cos(np.pi * epoch / T_max) - make sure to import numpy"]',
    visualizationComponent: "LearningRateViz",
    sortOrder: 4,
    starterCode: `import numpy as np

def step_decay(initial_lr, epoch, step_size=10, gamma=0.5):
    """
    Step decay learning rate scheduler.

    Args:
        initial_lr: starting learning rate
        epoch: current epoch number (0-indexed)
        step_size: drop LR every step_size epochs
        gamma: multiplicative factor

    Returns:
        float - adjusted learning rate
    """
    # Your implementation here
    pass

def exponential_decay(initial_lr, epoch, gamma=0.95):
    """
    Exponential decay learning rate scheduler.

    Args:
        initial_lr: starting learning rate
        epoch: current epoch number (0-indexed)
        gamma: decay factor per epoch

    Returns:
        float - adjusted learning rate
    """
    # Your implementation here
    pass

def cosine_annealing(initial_lr, epoch, T_max=100, min_lr=0.0):
    """
    Cosine annealing learning rate scheduler.

    Args:
        initial_lr: starting learning rate
        epoch: current epoch number (0-indexed)
        T_max: maximum number of epochs
        min_lr: minimum learning rate

    Returns:
        float - adjusted learning rate
    """
    # Your implementation here
    pass`,
    solution: `\`\`\`python
import numpy as np

def step_decay(initial_lr, epoch, step_size=10, gamma=0.5):
    return initial_lr * (gamma ** (epoch // step_size))

def exponential_decay(initial_lr, epoch, gamma=0.95):
    return initial_lr * (gamma ** epoch)

def cosine_annealing(initial_lr, epoch, T_max=100, min_lr=0.0):
    return min_lr + 0.5 * (initial_lr - min_lr) * (1 + np.cos(np.pi * epoch / T_max))
\`\`\`

**Approach:** Each scheduler is a direct formula application. Step decay uses integer division for staircase behavior, exponential decay uses continuous exponentiation, and cosine annealing maps the epoch to a cosine curve between initial_lr and min_lr.`,
    testCases: [
      { id: "t1", name: "Step decay basic", inputs: { func: "step_decay", initial_lr: 0.1, epoch: 10, step_size: 5, gamma: 0.5 }, isPublic: true },
      { id: "t2", name: "Cosine at halfway", inputs: { func: "cosine_annealing", initial_lr: 0.1, epoch: 50, T_max: 100, min_lr: 0.0 }, isPublic: true },
      { id: "t3", name: "Exponential decay", inputs: { func: "exponential_decay", initial_lr: 0.1, epoch: 10, gamma: 0.95 }, isPublic: false },
      { id: "t4", name: "Cosine at start", inputs: { func: "cosine_annealing", initial_lr: 0.1, epoch: 0, T_max: 100, min_lr: 0.001 }, isPublic: false },
      { id: "t5", name: "Cosine at end", inputs: { func: "cosine_annealing", initial_lr: 0.1, epoch: 100, T_max: 100, min_lr: 0.001 }, isPublic: false },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "batch-normalization",
    type: "coding",
    title: "Batch Normalization",
    description: `Implement the batch normalization forward pass from scratch.

Batch normalization normalizes each feature across the batch to have zero mean and unit variance, then applies a learnable scale (\`gamma\`) and shift (\`beta\`).

**Steps:**
1. Compute batch mean: \`mu = mean(X, axis=0)\`
2. Compute batch variance: \`var = mean((X - mu)^2, axis=0)\`
3. Normalize: \`X_norm = (X - mu) / sqrt(var + epsilon)\`
4. Scale and shift: \`out = gamma * X_norm + beta\`

**Example:**
\`\`\`python
>>> X = np.array([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]])
>>> gamma = np.array([1.0, 1.0])
>>> beta = np.array([0.0, 0.0])
>>> out, cache = batch_norm_forward(X, gamma, beta)
>>> out  # each column has mean~0, std~1
[[-1.2247, -1.2247],
 [ 0.0,     0.0   ],
 [ 1.2247,  1.2247]]
\`\`\``,
    difficulty: "Medium",
    weekNumber: 1,
    tags: '["normalization", "neural-networks", "training"]',
    theory: `Batch normalization (Ioffe & Szegedy, 2015) solves the "internal covariate shift" problem: as parameters update, each layer's input distribution changes, making training unstable.

**What it does:** For each feature dimension, compute the mean and variance across the batch, normalize to zero mean / unit variance, then apply learnable parameters gamma (scale) and beta (shift).

**Why gamma and beta?** Without them, every layer's output would be forced to zero mean and unit variance, which limits the network's expressiveness. Gamma and beta let the network learn to undo the normalization if that's optimal.

**Epsilon** (typically 1e-5) prevents division by zero when variance is very small.

**At inference time:** You can't compute batch statistics from a single sample. Instead, use running averages of mean and variance accumulated during training.

**Impact:** Batch norm allows higher learning rates, reduces sensitivity to initialization, and acts as a mild regularizer (noise from batch statistics).`,
    hints: '["Compute mean and variance along axis=0 (across the batch dimension)", "Add epsilon INSIDE the sqrt, not outside: np.sqrt(var + eps)", "Return a cache tuple with (X_norm, mu, var, gamma, eps) for the backward pass", "gamma and beta are per-feature: shape (num_features,)"]',
    visualizationComponent: "BatchNormViz",
    sortOrder: 5,
    starterCode: `import numpy as np

def batch_norm_forward(X, gamma, beta, epsilon=1e-5):
    """
    Batch normalization forward pass.

    Args:
        X: input, shape (batch_size, num_features)
        gamma: scale parameter, shape (num_features,)
        beta: shift parameter, shape (num_features,)
        epsilon: small constant for numerical stability

    Returns:
        tuple of (out, cache)
        - out: normalized and scaled output, shape (batch_size, num_features)
        - cache: tuple of intermediate values for backward pass
    """
    # Your implementation here
    pass`,
    solution: `\`\`\`python
import numpy as np

def batch_norm_forward(X, gamma, beta, epsilon=1e-5):
    mu = np.mean(X, axis=0)
    var = np.mean((X - mu) ** 2, axis=0)
    X_norm = (X - mu) / np.sqrt(var + epsilon)
    out = gamma * X_norm + beta
    cache = (X_norm, mu, var, gamma, epsilon)
    return out, cache
\`\`\`

**Approach:** Four steps in sequence: compute batch mean, compute batch variance, normalize, then scale+shift. Store intermediate values in a cache for the backward pass.`,
    testCases: [
      {
        id: "t1",
        name: "Basic 3x2",
        inputs: {
          X: [[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]],
          gamma: [1.0, 1.0],
          beta: [0.0, 0.0],
        },
        isPublic: true,
      },
      {
        id: "t2",
        name: "With scale and shift",
        inputs: {
          X: [[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]],
          gamma: [2.0, 0.5],
          beta: [1.0, -1.0],
        },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Constant column",
        inputs: {
          X: [[3.0, 1.0], [3.0, 2.0], [3.0, 3.0]],
          gamma: [1.0, 1.0],
          beta: [0.0, 0.0],
        },
        isPublic: false,
      },
      {
        id: "t4",
        name: "Single sample",
        inputs: {
          X: [[5.0, 10.0]],
          gamma: [1.0, 1.0],
          beta: [0.0, 0.0],
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
    id: "relu-variants",
    type: "coding",
    title: "ReLU Variants",
    description: `Implement three activation functions: ReLU, Leaky ReLU, and GELU.

Each function takes a numpy array and returns an array of the same shape.

**Formulas:**
- **ReLU:** \`f(x) = max(0, x)\`
- **Leaky ReLU:** \`f(x) = x if x > 0, else alpha * x\` (default alpha=0.01)
- **GELU:** \`f(x) = 0.5 * x * (1 + tanh(sqrt(2/pi) * (x + 0.044715 * x^3)))\`

**Example:**
\`\`\`python
>>> relu(np.array([-1.0, 0.0, 1.0]))
[0.0, 0.0, 1.0]

>>> leaky_relu(np.array([-1.0, 0.0, 1.0]), alpha=0.1)
[-0.1, 0.0, 1.0]

>>> gelu(np.array([0.0]))
[0.0]
\`\`\``,
    difficulty: "Easy",
    weekNumber: 1,
    tags: '["activation-functions", "neural-networks"]',
    theory: `Activation functions introduce nonlinearity. Without them, stacking linear layers collapses to a single linear transformation.

**ReLU** (Rectified Linear Unit): The default choice. Simple, fast, and avoids vanishing gradients for positive inputs. Downside: "dead neurons" - if a neuron's input is always negative, its gradient is always zero and it never updates.

**Leaky ReLU:** Fixes the dead neuron problem by allowing a small gradient (alpha, typically 0.01) for negative inputs. The neuron can still learn even when its input is negative.

**GELU** (Gaussian Error Linear Unit): Used in GPT, BERT, and most modern transformers. Unlike ReLU's hard cutoff at 0, GELU smoothly transitions: slightly negative inputs get a small negative output. The approximation formula uses tanh for efficiency.

**Why GELU for transformers?** The smooth curve means gradients change gradually, which helps optimization in deep networks. The slight negative outputs for slightly negative inputs preserve more information than ReLU's hard zero.`,
    hints: '["ReLU is just np.maximum(0, x)", "For Leaky ReLU, use np.where(x > 0, x, alpha * x)", "GELU uses the tanh approximation - compute the inner term carefully"]',
    visualizationComponent: "ReLUViz",
    sortOrder: 6,
    starterCode: `import numpy as np

def relu(x):
    """
    Rectified Linear Unit activation.

    Args:
        x: numpy array of any shape

    Returns:
        numpy array of same shape
    """
    # Your implementation here
    pass

def leaky_relu(x, alpha=0.01):
    """
    Leaky ReLU activation.

    Args:
        x: numpy array of any shape
        alpha: slope for negative inputs

    Returns:
        numpy array of same shape
    """
    # Your implementation here
    pass

def gelu(x):
    """
    Gaussian Error Linear Unit activation (tanh approximation).

    Args:
        x: numpy array of any shape

    Returns:
        numpy array of same shape
    """
    # Your implementation here
    pass`,
    solution: `\`\`\`python
import numpy as np

def relu(x):
    return np.maximum(0, x)

def leaky_relu(x, alpha=0.01):
    return np.where(x > 0, x, alpha * x)

def gelu(x):
    return 0.5 * x * (1 + np.tanh(np.sqrt(2.0 / np.pi) * (x + 0.044715 * x ** 3)))
\`\`\`

**Approach:** ReLU and Leaky ReLU are straightforward element-wise operations. GELU uses the tanh approximation from the original paper (Hendrycks & Gimpel, 2016), which avoids computing the error function directly.`,
    testCases: [
      { id: "t1", name: "ReLU basic", inputs: { func: "relu", x: [-1.0, 0.0, 1.0, 2.0] }, isPublic: true },
      { id: "t2", name: "Leaky ReLU", inputs: { func: "leaky_relu", x: [-1.0, 0.0, 1.0], alpha: 0.1 }, isPublic: true },
      { id: "t3", name: "GELU at zero", inputs: { func: "gelu", x: [0.0] }, isPublic: false },
      { id: "t4", name: "GELU negative", inputs: { func: "gelu", x: [-1.0, -0.5, 0.5, 1.0] }, isPublic: false },
      { id: "t5", name: "ReLU all negative", inputs: { func: "relu", x: [-3.0, -2.0, -1.0] }, isPublic: false },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "weight-initialization",
    type: "coding",
    title: "Weight Initialization",
    description: `Implement Xavier (Glorot) and He initialization for neural network weight matrices.

Both methods set the variance of initial weights based on the layer dimensions to prevent vanishing/exploding activations.

1. **Xavier (Glorot) Uniform:** Sample from \`Uniform(-limit, limit)\` where \`limit = sqrt(6 / (fan_in + fan_out))\`
2. **Xavier (Glorot) Normal:** Sample from \`Normal(0, std)\` where \`std = sqrt(2 / (fan_in + fan_out))\`
3. **He Normal:** Sample from \`Normal(0, std)\` where \`std = sqrt(2 / fan_in)\`

Where \`fan_in\` = number of input units, \`fan_out\` = number of output units.

**Example:**
\`\`\`python
>>> W = xavier_uniform(fan_in=784, fan_out=256)
>>> W.shape
(784, 256)
>>> np.abs(W).max() < np.sqrt(6 / (784 + 256))
True
\`\`\``,
    difficulty: "Easy",
    weekNumber: 1,
    tags: '["initialization", "neural-networks", "training"]',
    theory: `Weight initialization determines whether a network can train at all. Bad initialization causes activations to either explode (grow exponentially with depth) or vanish (shrink to zero).

**Xavier initialization** (Glorot & Bengio, 2010): Designed for sigmoid/tanh activations. Sets variance to \`2/(fan_in + fan_out)\`, balancing the variance of activations across layers.

**He initialization** (He et al., 2015): Designed for ReLU activations. Uses \`2/fan_in\` because ReLU zeros out half the values, so you need 2x the variance to compensate.

**Rule of thumb:**
- Sigmoid/Tanh -> Xavier
- ReLU/GELU -> He

**Why this matters for transformers:** Modern transformers use careful initialization scaling. GPT-2 scales residual layer weights by \`1/sqrt(n_layers)\` to prevent the residual stream's variance from growing with depth.`,
    hints: '["fan_in is the first dimension (rows), fan_out is the second (columns)", "Use np.random.uniform for Xavier uniform and np.random.randn for normal variants", "He initialization only uses fan_in, not fan_out"]',
    visualizationComponent: "WeightInitViz",
    sortOrder: 7,
    starterCode: `import numpy as np

def xavier_uniform(fan_in, fan_out):
    """
    Xavier/Glorot uniform initialization.

    Args:
        fan_in: number of input units
        fan_out: number of output units

    Returns:
        numpy array of shape (fan_in, fan_out)
    """
    # Your implementation here
    pass

def xavier_normal(fan_in, fan_out):
    """
    Xavier/Glorot normal initialization.

    Args:
        fan_in: number of input units
        fan_out: number of output units

    Returns:
        numpy array of shape (fan_in, fan_out)
    """
    # Your implementation here
    pass

def he_normal(fan_in, fan_out):
    """
    He (Kaiming) normal initialization.

    Args:
        fan_in: number of input units
        fan_out: number of output units

    Returns:
        numpy array of shape (fan_in, fan_out)
    """
    # Your implementation here
    pass`,
    solution: `\`\`\`python
import numpy as np

def xavier_uniform(fan_in, fan_out):
    limit = np.sqrt(6.0 / (fan_in + fan_out))
    return np.random.uniform(-limit, limit, size=(fan_in, fan_out))

def xavier_normal(fan_in, fan_out):
    std = np.sqrt(2.0 / (fan_in + fan_out))
    return np.random.randn(fan_in, fan_out) * std

def he_normal(fan_in, fan_out):
    std = np.sqrt(2.0 / fan_in)
    return np.random.randn(fan_in, fan_out) * std
\`\`\`

**Approach:** Each method computes the appropriate scale factor from the layer dimensions, then samples from the corresponding distribution. The key difference: Xavier accounts for both fan_in and fan_out, while He only uses fan_in (since it's designed for ReLU which breaks the symmetry assumption).`,
    testCases: [
      { id: "t1", name: "Xavier uniform shape", inputs: { func: "xavier_uniform", fan_in: 784, fan_out: 256 }, isPublic: true },
      { id: "t2", name: "He normal shape", inputs: { func: "he_normal", fan_in: 256, fan_out: 128 }, isPublic: true },
      { id: "t3", name: "Xavier normal variance", inputs: { func: "xavier_normal", fan_in: 1000, fan_out: 500 }, isPublic: false },
      { id: "t4", name: "He normal variance", inputs: { func: "he_normal", fan_in: 1000, fan_out: 500 }, isPublic: false },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "mnist-from-scratch",
    type: "coding",
    title: "MNIST from Scratch",
    description: `Build a 2-layer neural network to classify MNIST digits using only numpy.

Implement a complete training pipeline:
1. **Forward pass:** Input (784) -> Linear+ReLU (128) -> Linear+Softmax (10)
2. **Loss:** Cross-entropy
3. **Backward pass:** Compute gradients for all parameters
4. **Training loop:** SGD updates for a given number of steps

Your network should be able to reach >85% accuracy on the test set after training.

**Example:**
\`\`\`python
>>> model = MNISTNet(input_size=784, hidden_size=128, num_classes=10)
>>> model.forward(X_batch)  # shape (batch_size, 10) - probabilities
>>> model.train_step(X_batch, y_batch, lr=0.01)  # returns loss
\`\`\``,
    difficulty: "Hard",
    weekNumber: 1,
    tags: '["neural-networks", "backpropagation", "classification"]',
    theory: `This problem ties together everything from Week 1: forward pass, activation functions, loss computation, backpropagation, and parameter updates.

**Architecture:** 784 -> 128 (ReLU) -> 10 (Softmax)
- Layer 1: W1 (784x128), b1 (128,) followed by ReLU
- Layer 2: W2 (128x10), b2 (10,) followed by Softmax
- Total parameters: ~101K

**Forward pass:**
\`Z1 = X @ W1 + b1\`, \`A1 = ReLU(Z1)\`
\`Z2 = A1 @ W2 + b2\`, \`A2 = softmax(Z2)\`

**Cross-entropy loss:** \`L = -mean(sum(Y_one_hot * log(A2)))\`

**Backward pass (derivation):**
\`dZ2 = A2 - Y_one_hot\` (softmax + cross-entropy gradient simplifies)
\`dW2 = A1.T @ dZ2 / batch_size\`
\`db2 = mean(dZ2, axis=0)\`
\`dA1 = dZ2 @ W2.T\`
\`dZ1 = dA1 * (Z1 > 0)\` (ReLU gradient)
\`dW1 = X.T @ dZ1 / batch_size\`
\`db1 = mean(dZ1, axis=0)\`

**Key insight:** The gradient of softmax + cross-entropy simplifies to \`A2 - Y_one_hot\`. This is one of the cleanest gradient formulas in deep learning.`,
    hints: '["Use He initialization for weights (ReLU activation)", "The softmax + cross-entropy gradient simplifies to (predictions - one_hot_labels) / batch_size", "Remember to divide gradients by batch_size for proper averaging", "Subtract max from logits before softmax for numerical stability", "Start with a small learning rate like 0.01"]',
    visualizationComponent: "NeuralNetworkViz",
    sortOrder: 8,
    starterCode: `import numpy as np

class MNISTNet:
    def __init__(self, input_size=784, hidden_size=128, num_classes=10):
        """
        Initialize a 2-layer neural network.

        Architecture: input -> Linear+ReLU -> Linear+Softmax -> output
        Use He initialization for weights, zeros for biases.
        """
        # Your initialization here
        pass

    def forward(self, X):
        """
        Forward pass.

        Args:
            X: input batch, shape (batch_size, 784)

        Returns:
            probabilities, shape (batch_size, 10)
        """
        # Your implementation here
        pass

    def compute_loss(self, probs, y):
        """
        Compute cross-entropy loss.

        Args:
            probs: predicted probabilities, shape (batch_size, 10)
            y: true labels, shape (batch_size,) - integer labels 0-9

        Returns:
            float - average cross-entropy loss
        """
        # Your implementation here
        pass

    def train_step(self, X, y, lr=0.01):
        """
        One training step: forward, loss, backward, update.

        Args:
            X: input batch, shape (batch_size, 784)
            y: labels, shape (batch_size,) - integers 0-9
            lr: learning rate

        Returns:
            float - loss for this step
        """
        # Your implementation here
        pass`,
    solution: `\`\`\`python
import numpy as np

class MNISTNet:
    def __init__(self, input_size=784, hidden_size=128, num_classes=10):
        scale1 = np.sqrt(2.0 / input_size)
        scale2 = np.sqrt(2.0 / hidden_size)
        self.W1 = np.random.randn(input_size, hidden_size) * scale1
        self.b1 = np.zeros(hidden_size)
        self.W2 = np.random.randn(hidden_size, num_classes) * scale2
        self.b2 = np.zeros(num_classes)

    def forward(self, X):
        self.X = X
        self.Z1 = X @ self.W1 + self.b1
        self.A1 = np.maximum(0, self.Z1)  # ReLU
        self.Z2 = self.A1 @ self.W2 + self.b2
        # Stable softmax
        shifted = self.Z2 - np.max(self.Z2, axis=1, keepdims=True)
        exp_scores = np.exp(shifted)
        self.A2 = exp_scores / np.sum(exp_scores, axis=1, keepdims=True)
        return self.A2

    def compute_loss(self, probs, y):
        batch_size = y.shape[0]
        log_probs = -np.log(probs[np.arange(batch_size), y] + 1e-15)
        return np.mean(log_probs)

    def train_step(self, X, y, lr=0.01):
        batch_size = X.shape[0]
        probs = self.forward(X)
        loss = self.compute_loss(probs, y)

        # Backward pass
        dZ2 = probs.copy()
        dZ2[np.arange(batch_size), y] -= 1
        dZ2 /= batch_size

        dW2 = self.A1.T @ dZ2
        db2 = np.sum(dZ2, axis=0)

        dA1 = dZ2 @ self.W2.T
        dZ1 = dA1 * (self.Z1 > 0)  # ReLU gradient

        dW1 = self.X.T @ dZ1
        db1 = np.sum(dZ1, axis=0)

        # SGD update
        self.W2 -= lr * dW2
        self.b2 -= lr * db2
        self.W1 -= lr * dW1
        self.b1 -= lr * db1

        return loss
\`\`\`

**Approach:** Standard 2-layer MLP with He initialization. The forward pass chains linear layers with ReLU and softmax. The backward pass exploits the clean softmax+CE gradient. SGD updates all four parameter tensors.`,
    testCases: [
      {
        id: "t1",
        name: "Forward shape",
        inputs: { X: "random_784_5", y: [0, 1, 2, 3, 4] },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Probabilities sum to 1",
        inputs: { X: "random_784_3", check: "prob_sum" },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Loss decreases",
        inputs: { X: "random_784_10", y: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], steps: 10 },
        isPublic: false,
      },
      {
        id: "t4",
        name: "Gradient shapes",
        inputs: { check: "gradient_shapes" },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "optimization-concepts-quiz",
    type: "quiz",
    title: "Optimization Concepts",
    description: "Test your understanding of SGD, momentum, Adam, learning rate schedules, and convergence.",
    difficulty: "Medium",
    weekNumber: 1,
    tags: '["optimization", "sgd", "adam", "quiz"]',
    theory: `Optimizers determine how gradient information translates into parameter updates. The evolution from SGD to Adam addresses specific training challenges.

**SGD:** \`theta -= lr * gradient\`. Simple but slow on loss surfaces with different curvatures in different directions (ill-conditioned Hessian). The gradient bounces across narrow valleys.

**SGD + Momentum:** \`v = beta*v + gradient; theta -= lr*v\`. The velocity \`v\` accumulates past gradients. Momentum smooths out oscillations and accelerates through flat regions. Default beta=0.9 means the update is ~90% inertia, 10% current gradient.

**Adam** (Adaptive Moment Estimation): Maintains per-parameter learning rates. Tracks both the first moment (mean, like momentum) and second moment (variance) of gradients. Parameters with large historical gradients get smaller effective learning rates. Includes bias correction for the initial steps.

**Learning rate warmup:** Start with a tiny LR and linearly increase to the target LR over the first few hundred steps. This prevents large, noisy gradients in early training from destabilizing the model before the optimizer's moment estimates have warmed up.`,
    hints: "[]",
    visualizationComponent: "NeuralNetQuizViz",
    sortOrder: 9,
    starterCode: null,
    testCases: null,
    questions: [
      {
        id: "q1",
        questionNumber: 1,
        questionText: "What problem does momentum solve in SGD?",
        options: {
          a: "It prevents overfitting by adding regularization",
          b: "It reduces oscillations in directions of high curvature and accelerates in consistent gradient directions",
          c: "It automatically adjusts the learning rate per parameter",
          d: "It eliminates the need for a learning rate entirely",
        },
        correctAnswer: "b",
        explanation: "Momentum accumulates a velocity vector from past gradients. In directions where gradients keep pointing the same way, velocity builds up (acceleration). In directions where gradients oscillate, the velocity averages out (dampening). This speeds up training through flat regions and stabilizes it in curved ones.",
      },
      {
        id: "q2",
        questionNumber: 2,
        questionText: "In Adam optimizer, what does the second moment estimate (v_t) track?",
        options: {
          a: "The running mean of gradients",
          b: "The running mean of squared gradients (gradient variance)",
          c: "The learning rate schedule",
          d: "The weight decay coefficient",
        },
        correctAnswer: "b",
        explanation: "Adam tracks two moments: m_t (first moment = running mean of gradients, like momentum) and v_t (second moment = running mean of squared gradients). v_t estimates the variance of gradients for each parameter. Parameters with high-variance gradients get smaller effective learning rates: lr * m_t / sqrt(v_t).",
      },
      {
        id: "q3",
        questionNumber: 3,
        questionText: "Why do modern LLM training recipes use learning rate warmup?",
        options: {
          a: "To save compute in the early epochs",
          b: "To prevent the model from memorizing the training data",
          c: "To let the optimizer's moment estimates stabilize before taking large steps",
          d: "To increase the effective batch size gradually",
        },
        correctAnswer: "c",
        explanation: "At the start of training, Adam's moment estimates (m_t and v_t) are initialized to zero. Before they accumulate enough history, the effective updates can be erratic. Warmup starts with a small LR, letting the moment estimates converge before ramping up to the full learning rate.",
      },
      {
        id: "q4",
        questionNumber: 4,
        questionText: "What is the primary advantage of Adam over plain SGD with momentum?",
        options: {
          a: "Adam always converges to a better minimum",
          b: "Adam uses less memory than SGD",
          c: "Adam adapts the learning rate per-parameter based on gradient history",
          d: "Adam does not require any hyperparameter tuning",
        },
        correctAnswer: "c",
        explanation: "Adam divides the update by sqrt(v_t), the running RMS of gradients. Parameters that receive large gradients get smaller effective learning rates, and vice versa. This per-parameter adaptation is especially helpful for sparse features (embeddings) and parameters with very different gradient scales.",
      },
      {
        id: "q5",
        questionNumber: 5,
        questionText: "In a training loss curve, you see the loss plateau for many epochs then suddenly drop. What is the most likely explanation?",
        options: {
          a: "The model ran out of memory and restarted",
          b: "The learning rate was too high throughout training",
          c: "The optimizer escaped a saddle point - a flat region where gradients are near zero in most directions",
          d: "The training data was shuffled at that epoch",
        },
        correctAnswer: "c",
        explanation: "Saddle points are common in high-dimensional loss landscapes. At a saddle point, the gradient is near zero in most directions, causing updates to be tiny. Momentum and noise from mini-batches eventually push the parameters off the saddle point, causing a sudden drop in loss. This is more common than getting stuck in local minima.",
      },
    ],
    solution: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },

  // ========== WEEK 2: Tokenization (new problems) ==========
  {
    id: "word2vec-skipgram",
    type: "coding",
    title: "Word2Vec Skip-gram",
    description: `Implement the Skip-gram model from Word2Vec.

Given a center word, predict context words using a simple 2-layer network (embedding -> projection -> softmax). Implement the forward pass and the loss computation.

Your model has:
- An embedding matrix \`W_embed\` of shape (vocab_size, embed_dim)
- A projection matrix \`W_proj\` of shape (embed_dim, vocab_size)

**Forward pass:** Look up center word embedding, multiply by projection matrix, apply softmax to get probability over vocabulary.

**Loss:** Negative log probability of the actual context word.

**Example:**
\`\`\`python
>>> model = SkipGram(vocab_size=100, embed_dim=10)
>>> loss = model.forward(center_idx=5, context_idx=12)
>>> loss  # -log(prob of word 12 given word 5)
4.605
\`\`\``,
    difficulty: "Medium",
    weekNumber: 2,
    tags: '["word2vec", "embeddings", "nlp"]',
    theory: `Word2Vec (Mikolov et al., 2013) learns word embeddings by predicting context from a center word (Skip-gram) or center from context (CBOW).

**Skip-gram intuition:** Words that appear in similar contexts should have similar embeddings. By training a network to predict "cat" from "the __ sat", the embeddings for "cat" and "dog" end up close together because they share similar contexts.

**Architecture:**
1. Look up center word in embedding matrix -> vector of size embed_dim
2. Multiply by projection matrix -> logits of size vocab_size
3. Apply softmax -> probability distribution over vocabulary
4. Loss = -log(probability of actual context word)

**In practice:** Full softmax over the vocabulary is expensive. Real implementations use negative sampling (randomly sample a few "wrong" words instead of normalizing over the entire vocab) or hierarchical softmax. For this problem, we use full softmax for clarity.

**The embedding matrix IS the useful output.** After training, throw away the projection matrix. The embedding matrix rows are the word vectors used for downstream tasks.`,
    hints: '["The forward pass is: embed = W_embed[center_idx], logits = embed @ W_proj, probs = softmax(logits)", "Use numerically stable softmax: subtract max before exp", "Loss is simply -log(probs[context_idx])", "W_embed and W_proj should be initialized with small random values"]',
    visualizationComponent: "Word2VecViz",
    sortOrder: 5,
    starterCode: `import numpy as np

class SkipGram:
    def __init__(self, vocab_size, embed_dim):
        """
        Initialize Skip-gram model.

        Args:
            vocab_size: size of vocabulary
            embed_dim: dimension of embeddings
        """
        # Your initialization here
        pass

    def forward(self, center_idx, context_idx):
        """
        Forward pass: compute loss for a (center, context) pair.

        Args:
            center_idx: int - index of center word
            context_idx: int - index of context word

        Returns:
            float - negative log probability loss
        """
        # Your implementation here
        pass

    def get_embedding(self, word_idx):
        """
        Get the embedding vector for a word.

        Args:
            word_idx: int - word index

        Returns:
            numpy array of shape (embed_dim,)
        """
        # Your implementation here
        pass`,
    solution: `\`\`\`python
import numpy as np

class SkipGram:
    def __init__(self, vocab_size, embed_dim):
        self.vocab_size = vocab_size
        self.embed_dim = embed_dim
        scale = 0.01
        self.W_embed = np.random.randn(vocab_size, embed_dim) * scale
        self.W_proj = np.random.randn(embed_dim, vocab_size) * scale

    def forward(self, center_idx, context_idx):
        # Look up center word embedding
        embed = self.W_embed[center_idx]  # shape (embed_dim,)

        # Compute logits
        logits = embed @ self.W_proj  # shape (vocab_size,)

        # Stable softmax
        logits -= np.max(logits)
        exp_logits = np.exp(logits)
        probs = exp_logits / np.sum(exp_logits)

        # Negative log likelihood
        loss = -np.log(probs[context_idx] + 1e-15)
        return float(loss)

    def get_embedding(self, word_idx):
        return self.W_embed[word_idx].copy()
\`\`\`

**Approach:** The forward pass is a single matrix multiply (embedding lookup + projection) followed by softmax. The loss is the negative log probability of the correct context word. This simple architecture produces embeddings that capture semantic relationships.`,
    testCases: [
      { id: "t1", name: "Forward returns scalar", inputs: { vocab_size: 50, embed_dim: 10, center_idx: 5, context_idx: 12 }, isPublic: true },
      { id: "t2", name: "Embedding shape", inputs: { vocab_size: 100, embed_dim: 20, word_idx: 0 }, isPublic: true },
      { id: "t3", name: "Loss is positive", inputs: { vocab_size: 50, embed_dim: 10, center_idx: 0, context_idx: 1 }, isPublic: false },
      { id: "t4", name: "Different pairs give different losses", inputs: { vocab_size: 50, embed_dim: 10, pairs: [[0, 1], [0, 2]] }, isPublic: false },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "embedding-lookup",
    type: "coding",
    title: "Embedding Table",
    description: `Implement an embedding table: a learnable lookup table that maps integer indices to dense vectors.

Your \`EmbeddingTable\` class should:
1. Initialize random embeddings of a given dimension for each index in the vocabulary
2. Look up embeddings by index (single or batch)
3. Handle a special padding index that always returns a zero vector
4. Support updating embeddings via simple gradient step

**Example:**
\`\`\`python
>>> emb = EmbeddingTable(vocab_size=100, embed_dim=8, padding_idx=0)
>>> emb.lookup(5)           # shape (8,)
>>> emb.lookup([1, 2, 0])   # shape (3, 8), row 2 is zeros (padding)
>>> emb.lookup([0, 0])      # shape (2, 8), all zeros
\`\`\``,
    difficulty: "Easy",
    weekNumber: 2,
    tags: '["embeddings", "nlp", "lookup-table"]',
    theory: `An embedding table is the simplest neural network layer: a matrix where row \`i\` is the learned vector for token \`i\`. Looking up an embedding is just indexing into this matrix - no matrix multiplication needed.

**Why not one-hot vectors?** A one-hot vector for vocabulary size 50,000 would be 50,000-dimensional and sparse. An embedding compresses this to a dense vector (typically 256-1024 dimensions) that captures semantic meaning.

**Padding index:** Sequences in a batch have different lengths. Short sequences are padded with a special token (usually index 0). The padding embedding is fixed at zero so it doesn't contribute to computations like attention scores.

**The embedding IS the first layer of every language model.** In GPT-2, it maps 50,257 tokens to 768-dimensional vectors. In GPT-4, the embedding dimension is larger (rumored ~12,000+).

**Training:** Embedding gradients are sparse - only the rows corresponding to tokens in the current batch get updated. This is why specialized sparse optimizers exist.`,
    hints: '["Initialize with np.random.randn scaled by a small factor (e.g., 0.01)", "For batch lookup, use numpy fancy indexing: self.weight[indices]", "After any operation, zero out the padding row: self.weight[padding_idx] = 0", "Handle both single int and list inputs"]',
    visualizationComponent: "EmbeddingLookupViz",
    sortOrder: 6,
    starterCode: `import numpy as np

class EmbeddingTable:
    def __init__(self, vocab_size, embed_dim, padding_idx=None):
        """
        Initialize embedding table.

        Args:
            vocab_size: number of embeddings
            embed_dim: dimension of each embedding
            padding_idx: if set, this index always returns zeros
        """
        # Your initialization here
        pass

    def lookup(self, indices):
        """
        Look up embeddings for given indices.

        Args:
            indices: int or list of ints

        Returns:
            numpy array - shape (embed_dim,) for single, (len, embed_dim) for batch
        """
        # Your implementation here
        pass

    def update(self, indices, gradients, lr=0.01):
        """
        Update embeddings at given indices using gradients.

        Args:
            indices: list of ints - which embeddings to update
            gradients: numpy array of shape (len(indices), embed_dim)
            lr: learning rate
        """
        # Your implementation here
        pass`,
    solution: `\`\`\`python
import numpy as np

class EmbeddingTable:
    def __init__(self, vocab_size, embed_dim, padding_idx=None):
        self.vocab_size = vocab_size
        self.embed_dim = embed_dim
        self.padding_idx = padding_idx
        self.weight = np.random.randn(vocab_size, embed_dim) * 0.01
        if padding_idx is not None:
            self.weight[padding_idx] = 0.0

    def lookup(self, indices):
        single = isinstance(indices, (int, np.integer))
        indices = np.array(indices) if not single else np.array([indices])
        result = self.weight[indices].copy()
        if self.padding_idx is not None:
            mask = indices == self.padding_idx
            result[mask] = 0.0
        return result[0] if single else result

    def update(self, indices, gradients, lr=0.01):
        indices = np.array(indices)
        self.weight[indices] -= lr * gradients
        if self.padding_idx is not None:
            self.weight[self.padding_idx] = 0.0
\`\`\`

**Approach:** The embedding table is a numpy matrix. Lookup uses fancy indexing. The padding index row is forced to zero after initialization and after every update.`,
    testCases: [
      { id: "t1", name: "Single lookup shape", inputs: { vocab_size: 50, embed_dim: 8, idx: 5 }, isPublic: true },
      { id: "t2", name: "Batch with padding", inputs: { vocab_size: 50, embed_dim: 8, padding_idx: 0, indices: [1, 2, 0] }, isPublic: true },
      { id: "t3", name: "Padding is zero", inputs: { vocab_size: 50, embed_dim: 8, padding_idx: 0, indices: [0, 0] }, isPublic: false },
      { id: "t4", name: "Update changes embedding", inputs: { vocab_size: 10, embed_dim: 4, idx: 3 }, isPublic: false },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "subword-tokenizer",
    type: "coding",
    title: "WordPiece Tokenizer",
    description: `Implement a WordPiece tokenizer from scratch using greedy longest-match-first.

WordPiece tokenization splits words into subword units from a given vocabulary. The algorithm:
1. For each word, try to match the longest prefix in the vocabulary
2. If a match is found, consume it and continue with the remainder (prefixed with "##")
3. If no match is found for any prefix, output "[UNK]"

**Example:**
\`\`\`python
>>> vocab = {"un", "##break", "##able", "##ing", "the", "##s", "play", "##ed"}
>>> tokenize("unbreakable", vocab)
["un", "##break", "##able"]

>>> tokenize("playing", vocab)
["play", "##ing"]

>>> tokenize("xyz", vocab)
["[UNK]"]
\`\`\`

Also implement \`tokenize_sentence\` that splits on whitespace first, then tokenizes each word.`,
    difficulty: "Hard",
    weekNumber: 2,
    tags: '["tokenization", "wordpiece", "nlp"]',
    theory: `WordPiece (Schuster & Nakajima, 2012) was popularized by BERT. It breaks words into subword units, balancing vocabulary size with coverage.

**Why subwords?** Whole-word tokenization fails on rare/new words ("unfathomable" -> [UNK]). Character-level tokenization makes sequences too long. Subwords hit the sweet spot: common words stay whole ("the"), rare words decompose into known parts ("un" + "##fathom" + "##able").

**The "##" prefix** indicates a continuation token - it's part of the same word as the previous token. This lets the model distinguish "play" (standalone word) from "##play" (suffix of "display").

**Greedy longest-match:** For each position in the word, find the longest substring that exists in the vocabulary. This is a greedy algorithm - it doesn't guarantee the globally optimal segmentation, but it's fast and works well in practice.

**Building the vocabulary** (not in this problem): WordPiece builds its vocab by starting with characters and iteratively merging pairs that maximize the likelihood of the training data. This is similar to BPE but uses a likelihood criterion instead of frequency.`,
    hints: '["Start with the full remaining string and try shorter prefixes until one matches", "The first subword uses the raw string; subsequent subwords need the ## prefix", "If a word cannot be tokenized at all (first character not in vocab), return [UNK]", "Use a set for the vocabulary for O(1) lookups"]',
    visualizationComponent: "BPETokenizerViz",
    sortOrder: 7,
    starterCode: `def tokenize_word(word, vocab):
    """
    Tokenize a single word using WordPiece (greedy longest-match-first).

    Args:
        word: string - the word to tokenize
        vocab: set of strings - the vocabulary (includes ## prefixed subwords)

    Returns:
        list of strings - subword tokens, or ["[UNK]"] if untokenizable
    """
    # Your implementation here
    pass

def tokenize_sentence(sentence, vocab):
    """
    Tokenize a sentence: split on whitespace, then WordPiece each word.

    Args:
        sentence: string
        vocab: set of strings

    Returns:
        list of strings - all subword tokens
    """
    # Your implementation here
    pass`,
    solution: `\`\`\`python
def tokenize_word(word, vocab):
    tokens = []
    start = 0
    while start < len(word):
        end = len(word)
        found = False
        while start < end:
            substr = word[start:end]
            if start > 0:
                substr = "##" + substr
            if substr in vocab:
                tokens.append(substr)
                start = end
                found = True
                break
            end -= 1
        if not found:
            return ["[UNK]"]
    return tokens

def tokenize_sentence(sentence, vocab):
    tokens = []
    for word in sentence.strip().split():
        tokens.extend(tokenize_word(word, vocab))
    return tokens
\`\`\`

**Approach:** For each position in the word, try the longest possible substring first. If it exists in the vocabulary, consume it and move forward. If no substring from the current position matches (even a single character), the word is untokenizable - return [UNK]. Subwords after the first get the "##" prefix.`,
    testCases: [
      {
        id: "t1",
        name: "Basic decomposition",
        inputs: {
          word: "unbreakable",
          vocab: ["un", "##break", "##able", "##ing", "the", "##s", "play", "##ed"],
        },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Single vocab word",
        inputs: {
          word: "the",
          vocab: ["the", "##s", "un", "##able"],
        },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Unknown word",
        inputs: {
          word: "xyz",
          vocab: ["the", "un", "##able"],
        },
        isPublic: false,
      },
      {
        id: "t4",
        name: "Sentence tokenization",
        inputs: {
          sentence: "the play",
          vocab: ["the", "play", "##ing", "##ed"],
        },
        isPublic: false,
      },
      {
        id: "t5",
        name: "Greedy longest match",
        inputs: {
          word: "playing",
          vocab: ["p", "pl", "play", "##i", "##in", "##ing", "##g"],
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
    id: "embedding-dimensions-quiz",
    type: "quiz",
    title: "Embedding Dimensions & Spaces",
    description: "Test your understanding of embedding spaces, dimensions, similarity measures, and word analogy operations.",
    difficulty: "Medium",
    weekNumber: 2,
    tags: '["embeddings", "similarity", "nlp", "quiz"]',
    theory: `Embeddings map discrete tokens into continuous vector spaces where geometric relationships encode semantic meaning.

**Dimensionality:** Embedding dimension is a key hyperparameter. Too small = can't capture enough distinctions. Too large = overfitting and wasted compute. Common sizes: Word2Vec uses 300, BERT uses 768, GPT-3 uses 12288.

**Cosine similarity** measures the angle between two vectors: \`cos(a, b) = (a . b) / (|a| * |b|)\`. Values range from -1 (opposite) to 1 (identical direction). Preferred over Euclidean distance for text because it's invariant to vector magnitude.

**Word analogies** work via vector arithmetic: "king - man + woman = queen". This works because the embedding space encodes "gender" as a consistent direction. \`vec(king) - vec(man)\` isolates the "royalty" component, and adding \`vec(woman)\` moves to the female version.

**The Johnson-Lindenstrauss lemma** explains why embeddings work: high-dimensional data can be projected to much lower dimensions while approximately preserving pairwise distances. This is why 768 dimensions can capture relationships among 50,000+ tokens.`,
    hints: "[]",
    visualizationComponent: "TokenizationQuizViz",
    sortOrder: 8,
    starterCode: null,
    testCases: null,
    questions: [
      {
        id: "q1",
        questionNumber: 1,
        questionText: "Why is cosine similarity preferred over Euclidean distance for comparing word embeddings?",
        options: {
          a: "Cosine similarity is faster to compute",
          b: "Cosine similarity is invariant to vector magnitude, measuring only the angle (direction)",
          c: "Euclidean distance cannot handle negative values",
          d: "Cosine similarity always returns values between 0 and 1",
        },
        correctAnswer: "b",
        explanation: "Two words can have similar meaning but different embedding magnitudes (due to word frequency effects in training). Cosine similarity compares only directions, not magnitudes, making it a better measure of semantic similarity. Note: cosine similarity ranges from -1 to 1, not 0 to 1.",
      },
      {
        id: "q2",
        questionNumber: 2,
        questionText: "In the word analogy 'king - man + woman = queen', what does the vector (king - man) represent?",
        options: {
          a: "The word 'royalty'",
          b: "The concept of gender",
          c: "The direction in embedding space that captures royalty independent of gender",
          d: "A random direction in the embedding space",
        },
        correctAnswer: "c",
        explanation: "Subtracting 'man' from 'king' removes the male/common-person component, leaving the direction associated with royalty. Adding 'woman' then moves to the intersection of royalty and female, which lands near 'queen'. This works because the embedding space encodes semantic relationships as consistent geometric directions.",
      },
      {
        id: "q3",
        questionNumber: 3,
        questionText: "GPT-2 Small uses 768-dimensional embeddings for a vocabulary of ~50,000 tokens. What would happen if you reduced the embedding dimension to 32?",
        options: {
          a: "The model would train faster with no quality loss",
          b: "The model would lose the ability to distinguish between semantically different tokens",
          c: "The model would use less memory but generate identical outputs",
          d: "The tokenizer would need to be retrained",
        },
        correctAnswer: "b",
        explanation: "32 dimensions cannot create enough distinct directions to represent 50,000 tokens with their full semantic relationships. Many tokens would end up with similar embeddings despite having different meanings. The model would lose fine-grained distinctions (e.g., synonyms vs. antonyms).",
      },
      {
        id: "q4",
        questionNumber: 4,
        questionText: "What is the key difference between a static embedding (Word2Vec) and a contextual embedding (BERT)?",
        options: {
          a: "Word2Vec uses larger dimensions than BERT",
          b: "BERT embeddings change based on the surrounding context; Word2Vec assigns a fixed vector per word",
          c: "Word2Vec captures syntax; BERT captures only semantics",
          d: "BERT can only handle English text",
        },
        correctAnswer: "b",
        explanation: "In Word2Vec, 'bank' has the same vector regardless of context (riverbank vs. financial bank). In BERT, 'bank' gets a different vector depending on surrounding words. This is because BERT processes the full sequence through attention layers, while Word2Vec only uses a fixed lookup table.",
      },
      {
        id: "q5",
        questionNumber: 5,
        questionText: "When training embeddings, what does it mean for two word vectors to be 'close' in the embedding space?",
        options: {
          a: "The words have the same number of characters",
          b: "The words appear in similar contexts in the training data",
          c: "The words have the same part of speech",
          d: "The words were added to the vocabulary at the same time",
        },
        correctAnswer: "b",
        explanation: "The distributional hypothesis (Firth, 1957): 'a word is characterized by the company it keeps'. Word2Vec and similar models push embeddings closer when words co-occur in similar contexts. 'dog' and 'cat' end up close because they both appear near words like 'pet', 'fur', 'feed', etc.",
      },
    ],
    solution: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "encoder-decoder-intro",
    type: "coding",
    title: "Encoder-Decoder Bottleneck",
    description: `Implement a simple encoder-decoder that compresses a sequence into a fixed-size vector and reconstructs it.

**Encoder:** Takes a sequence of vectors and produces a single fixed-size "context" vector by averaging all positions (mean pooling).

**Decoder:** Takes the context vector and produces a reconstructed sequence by passing the context through a linear layer for each position.

This demonstrates the **information bottleneck**: compressing a variable-length sequence into a fixed-size vector loses information, especially for long sequences.

**Example:**
\`\`\`python
>>> enc_dec = EncoderDecoder(input_dim=8, hidden_dim=4, max_len=5)
>>> sequence = np.random.randn(5, 8)   # 5 tokens, dim 8
>>> context = enc_dec.encode(sequence)  # shape (4,) - compressed!
>>> recon = enc_dec.decode(context, length=5)  # shape (5, 8)
>>> # recon != sequence due to information loss
\`\`\``,
    difficulty: "Medium",
    weekNumber: 2,
    tags: '["encoder-decoder", "bottleneck", "sequence-models"]',
    theory: `The encoder-decoder architecture is the foundation of seq2seq models (machine translation, summarization). The key tension: you must compress all source information into a fixed vector.

**Encoder (this problem):** Mean-pool the input sequence into a single vector. This is a lossy compression - a 100-token sequence gets squeezed into the same size vector as a 5-token sequence.

**Decoder:** Given only the context vector, reconstruct each position. The decoder applies a learned linear transformation to produce each output position.

**The information bottleneck problem:** This fixed-size context vector is the motivation behind attention mechanisms. Long sequences lose critical details when forced through a narrow bottleneck. Bahdanau attention (2014) solved this by letting the decoder look at all encoder positions, not just the compressed vector.

**Reconstruction loss:** \`L = mean((input - reconstruction)^2)\`. The MSE loss measures how much information was lost in the compression. Lower hidden_dim = more compression = higher loss.`,
    hints: '["Encode by applying a linear layer to each input vector, then mean-pooling across the sequence", "Decode by applying a different linear layer to the context vector, repeated for each output position", "Use np.mean(encoded, axis=0) for mean pooling", "The bottleneck is controlled by hidden_dim: smaller = more compression"]',
    visualizationComponent: "EncoderDecoderViz",
    sortOrder: 9,
    starterCode: `import numpy as np

class EncoderDecoder:
    def __init__(self, input_dim, hidden_dim, max_len=50):
        """
        Simple encoder-decoder with bottleneck.

        Args:
            input_dim: dimension of input/output vectors
            hidden_dim: dimension of the bottleneck (context vector)
            max_len: maximum sequence length
        """
        # Your initialization here
        pass

    def encode(self, sequence):
        """
        Encode a sequence into a fixed-size context vector.

        Args:
            sequence: numpy array of shape (seq_len, input_dim)

        Returns:
            numpy array of shape (hidden_dim,)
        """
        # Your implementation here
        pass

    def decode(self, context, length):
        """
        Decode a context vector into a sequence.

        Args:
            context: numpy array of shape (hidden_dim,)
            length: int - number of output positions

        Returns:
            numpy array of shape (length, input_dim)
        """
        # Your implementation here
        pass

    def reconstruction_loss(self, sequence):
        """
        Encode then decode, return MSE loss.

        Args:
            sequence: numpy array of shape (seq_len, input_dim)

        Returns:
            float - mean squared error
        """
        # Your implementation here
        pass`,
    solution: `\`\`\`python
import numpy as np

class EncoderDecoder:
    def __init__(self, input_dim, hidden_dim, max_len=50):
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        # Encoder projection: input_dim -> hidden_dim
        scale_enc = np.sqrt(2.0 / input_dim)
        self.W_enc = np.random.randn(input_dim, hidden_dim) * scale_enc
        self.b_enc = np.zeros(hidden_dim)
        # Decoder projection: hidden_dim -> input_dim
        scale_dec = np.sqrt(2.0 / hidden_dim)
        self.W_dec = np.random.randn(hidden_dim, input_dim) * scale_dec
        self.b_dec = np.zeros(input_dim)

    def encode(self, sequence):
        # Project each position to hidden_dim, then mean-pool
        projected = sequence @ self.W_enc + self.b_enc  # (seq_len, hidden_dim)
        context = np.mean(projected, axis=0)  # (hidden_dim,)
        return context

    def decode(self, context, length):
        # Project context back to input_dim for each position
        output_single = context @ self.W_dec + self.b_dec  # (input_dim,)
        output = np.tile(output_single, (length, 1))  # (length, input_dim)
        return output

    def reconstruction_loss(self, sequence):
        context = self.encode(sequence)
        recon = self.decode(context, len(sequence))
        return float(np.mean((sequence - recon) ** 2))
\`\`\`

**Approach:** The encoder projects each position to hidden_dim via a linear layer and averages across positions. The decoder projects the context vector back to input_dim - it produces the same vector for every position (since it only has the context). The reconstruction loss shows how much information the bottleneck destroys.`,
    testCases: [
      { id: "t1", name: "Encode shape", inputs: { input_dim: 8, hidden_dim: 4, seq_len: 5 }, isPublic: true },
      { id: "t2", name: "Decode shape", inputs: { input_dim: 8, hidden_dim: 4, length: 3 }, isPublic: true },
      { id: "t3", name: "Bottleneck increases loss", inputs: { input_dim: 8, hidden_dim_small: 2, hidden_dim_large: 8 }, isPublic: false },
      { id: "t4", name: "Loss is non-negative", inputs: { input_dim: 4, hidden_dim: 2, seq_len: 10 }, isPublic: false },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },

  // ========== WEEK 3: Attention (new problems) ==========
  {
    id: "self-attention-from-scratch",
    type: "coding",
    title: "Self-Attention with Masking",
    description: `Implement self-attention with padding mask support.

Given queries Q, keys K, and values V (all derived from the same input), compute:

\`Attention(Q, K, V) = softmax(Q @ K^T / sqrt(d_k)) @ V\`

Handle padding by setting attention scores to \`-inf\` at padded positions before softmax, so padded tokens receive zero attention weight.

**Example:**
\`\`\`python
>>> X = np.random.randn(2, 4, 8)    # batch=2, seq_len=4, d_model=8
>>> mask = np.array([[1,1,1,0],       # sequence 1: 3 real tokens, 1 padding
...                  [1,1,0,0]])      # sequence 2: 2 real tokens, 2 padding
>>> out = self_attention(X, mask)
>>> out.shape
(2, 4, 8)
\`\`\``,
    difficulty: "Medium",
    weekNumber: 3,
    tags: '["attention", "transformers", "masking"]',
    theory: `Self-attention lets each token in a sequence attend to every other token, creating context-aware representations.

**The QKV mechanism:**
- Q (query): "What am I looking for?"
- K (key): "What do I contain?"
- V (value): "What information do I carry?"

Attention score between token i and token j = \`Q[i] . K[j] / sqrt(d_k)\`. The \`sqrt(d_k)\` scaling prevents dot products from growing too large with high dimensions (which would push softmax into saturation).

**Padding mask:** Batched sequences have different lengths, padded to the same size. Without masking, real tokens would attend to padding (garbage values). The mask sets padding positions to -inf before softmax, which maps to 0 attention weight after softmax.

**The computation:**
1. Project input X to Q, K, V using linear layers (or use X directly for raw self-attention)
2. Compute scores: \`S = Q @ K^T / sqrt(d_k)\`
3. Apply mask: \`S[mask == 0] = -inf\`
4. Normalize: \`weights = softmax(S, axis=-1)\`
5. Output: \`out = weights @ V\``,
    hints: '["Scale the dot product by 1/sqrt(d_k) where d_k is the key dimension (last dim of K)", "The mask shape should broadcast: expand mask to (batch, 1, seq_len) or (batch, seq_len, seq_len)", "Use -1e9 instead of -inf to avoid NaN in softmax when an entire row is masked", "Softmax is applied along the last axis (over key positions)"]',
    visualizationComponent: "AttentionHeatmapViz",
    sortOrder: 4,
    starterCode: `import numpy as np

def self_attention(X, mask=None):
    """
    Compute self-attention with optional padding mask.

    Uses X directly as Q, K, V (no learned projections).

    Args:
        X: input tensor, shape (batch_size, seq_len, d_model)
        mask: padding mask, shape (batch_size, seq_len)
              1 = real token, 0 = padding

    Returns:
        numpy array of shape (batch_size, seq_len, d_model)
    """
    # Your implementation here
    pass`,
    solution: `\`\`\`python
import numpy as np

def self_attention(X, mask=None):
    batch_size, seq_len, d_k = X.shape

    # Q, K, V are all X (no projections in this simplified version)
    Q, K, V = X, X, X

    # Compute attention scores
    scores = Q @ K.transpose(0, 2, 1) / np.sqrt(d_k)  # (batch, seq, seq)

    # Apply padding mask
    if mask is not None:
        # Expand mask: (batch, seq_len) -> (batch, 1, seq_len)
        # This masks out attention TO padded positions
        mask_expanded = mask[:, np.newaxis, :]  # (batch, 1, seq_len)
        scores = np.where(mask_expanded == 1, scores, -1e9)

    # Softmax along last axis
    scores_shifted = scores - np.max(scores, axis=-1, keepdims=True)
    exp_scores = np.exp(scores_shifted)
    weights = exp_scores / np.sum(exp_scores, axis=-1, keepdims=True)

    # Weighted sum of values
    out = weights @ V  # (batch, seq, d_model)
    return out
\`\`\`

**Approach:** Compute scaled dot-product attention. The mask is broadcast so that each query position cannot attend to padded key positions. After masking, softmax normalizes the remaining (non-masked) scores to sum to 1.`,
    testCases: [
      {
        id: "t1",
        name: "Output shape matches input",
        inputs: { batch_size: 2, seq_len: 4, d_model: 8, mask: [[1, 1, 1, 0], [1, 1, 0, 0]] },
        isPublic: true,
      },
      {
        id: "t2",
        name: "No mask (full attention)",
        inputs: { batch_size: 1, seq_len: 3, d_model: 4, mask: null },
        isPublic: true,
      },
      {
        id: "t3",
        name: "All masked except one",
        inputs: { batch_size: 1, seq_len: 3, d_model: 4, mask: [[1, 0, 0]] },
        isPublic: false,
      },
      {
        id: "t4",
        name: "Attention weights sum to 1",
        inputs: { batch_size: 2, seq_len: 5, d_model: 8, check: "weight_sum" },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "feed-forward-network",
    type: "coding",
    title: "Transformer FFN Block",
    description: `Implement the feed-forward network (FFN) block used in every transformer layer.

The FFN applies two linear transformations with a GELU activation in between:

\`FFN(x) = Linear2(GELU(Linear1(x)))\`

Where:
- Linear1 projects from \`d_model\` to \`4 * d_model\` (expansion)
- GELU activation
- Linear2 projects from \`4 * d_model\` back to \`d_model\` (compression)

**Example:**
\`\`\`python
>>> ffn = FeedForward(d_model=512)
>>> x = np.random.randn(2, 10, 512)  # batch=2, seq_len=10, d_model=512
>>> out = ffn.forward(x)
>>> out.shape
(2, 10, 512)
\`\`\``,
    difficulty: "Easy",
    weekNumber: 3,
    tags: '["transformers", "feed-forward", "neural-networks"]',
    theory: `The FFN block processes each token position independently (no cross-position interaction). While attention handles token mixing, the FFN handles feature mixing.

**Why 4x expansion?** The original transformer uses \`d_ff = 4 * d_model\`. The wider intermediate layer gives the network more capacity to transform features. Think of it as: project to a higher-dimensional space where the GELU can make nonlinear decisions, then project back.

**GELU over ReLU:** Modern transformers (GPT-2+, BERT) use GELU because its smooth curve provides better gradient flow than ReLU's hard cutoff. The GELU approximation: \`0.5 * x * (1 + tanh(sqrt(2/pi) * (x + 0.044715 * x^3)))\`.

**Parameter count:** For d_model=768 (GPT-2), the FFN has 768*3072 + 3072 + 3072*768 + 768 = ~4.7M parameters per layer. The FFN typically accounts for ~2/3 of a transformer layer's parameters.

**Applied independently per position:** The same FFN weights process every token position. This is why transformers are efficient - the FFN doesn't scale with sequence length.`,
    hints: '["Initialize weights with Xavier/He initialization scaled appropriately", "GELU approximation: 0.5 * x * (1 + np.tanh(np.sqrt(2/np.pi) * (x + 0.044715 * x**3)))", "The input and output dimensions are the same (d_model)", "Handle 3D input (batch, seq, features) - the linear layers operate on the last dimension"]',
    visualizationComponent: "FeedForwardViz",
    sortOrder: 5,
    starterCode: `import numpy as np

class FeedForward:
    def __init__(self, d_model, d_ff=None):
        """
        Transformer feed-forward block.

        Args:
            d_model: model dimension (input and output)
            d_ff: inner dimension (default: 4 * d_model)
        """
        # Your initialization here
        pass

    def gelu(self, x):
        """GELU activation (tanh approximation)."""
        # Your implementation here
        pass

    def forward(self, x):
        """
        Forward pass.

        Args:
            x: input tensor, shape (..., d_model)

        Returns:
            output tensor, shape (..., d_model)
        """
        # Your implementation here
        pass`,
    solution: `\`\`\`python
import numpy as np

class FeedForward:
    def __init__(self, d_model, d_ff=None):
        d_ff = d_ff or 4 * d_model
        self.d_model = d_model
        self.d_ff = d_ff
        # Xavier initialization
        self.W1 = np.random.randn(d_model, d_ff) * np.sqrt(2.0 / (d_model + d_ff))
        self.b1 = np.zeros(d_ff)
        self.W2 = np.random.randn(d_ff, d_model) * np.sqrt(2.0 / (d_ff + d_model))
        self.b2 = np.zeros(d_model)

    def gelu(self, x):
        return 0.5 * x * (1 + np.tanh(np.sqrt(2.0 / np.pi) * (x + 0.044715 * x ** 3)))

    def forward(self, x):
        hidden = self.gelu(x @ self.W1 + self.b1)
        return hidden @ self.W2 + self.b2
\`\`\`

**Approach:** Two matrix multiplies with GELU in between. The @ operator handles batched input (the last two dimensions are used for the matmul, batch dimensions are broadcast). d_model -> 4*d_model -> d_model.`,
    testCases: [
      { id: "t1", name: "Output shape 3D", inputs: { d_model: 64, batch_size: 2, seq_len: 5 }, isPublic: true },
      { id: "t2", name: "Output shape 2D", inputs: { d_model: 32, batch_size: 4 }, isPublic: true },
      { id: "t3", name: "Custom d_ff", inputs: { d_model: 64, d_ff: 128, batch_size: 1, seq_len: 3 }, isPublic: false },
      { id: "t4", name: "GELU at zero", inputs: { check: "gelu_zero" }, isPublic: false },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "rotary-embeddings",
    type: "coding",
    title: "Rotary Position Embeddings (RoPE)",
    description: `Implement Rotary Position Embeddings (RoPE) from scratch.

RoPE encodes position by rotating query and key vectors. For each pair of dimensions (2i, 2i+1), apply a rotation by angle \`theta * position\`:

\`\`\`
q_rotated[2i]   = q[2i] * cos(m*theta_i) - q[2i+1] * sin(m*theta_i)
q_rotated[2i+1] = q[2i] * sin(m*theta_i) + q[2i+1] * cos(m*theta_i)
\`\`\`

Where \`theta_i = 1 / 10000^(2i/d)\` and \`m\` is the position index.

**Example:**
\`\`\`python
>>> rope = RoPE(d_model=8)
>>> q = np.random.randn(1, 4, 8)  # batch=1, seq_len=4, d=8
>>> q_rotated = rope.apply(q)
>>> q_rotated.shape
(1, 4, 8)
\`\`\``,
    difficulty: "Hard",
    weekNumber: 3,
    tags: '["positional-encoding", "transformers", "rope"]',
    theory: `RoPE (Su et al., 2021) is used in LLaMA, Mistral, GPT-NeoX, and most modern LLMs. It encodes position by rotating pairs of dimensions in Q and K vectors.

**Why rotation?** The dot product of two rotated vectors depends on their RELATIVE position, not absolute positions. If Q at position 3 and K at position 7 are rotated, the attention score depends on the distance 4 - which is exactly what we want for language.

**The frequency schedule:** Each pair of dimensions rotates at a different frequency: \`theta_i = 1/10000^(2i/d)\`. Low-indexed dimensions rotate slowly (capture long-range patterns), high-indexed dimensions rotate fast (capture local patterns). This is analogous to Fourier features.

**Advantages over learned positional embeddings:**
1. Generalizes to longer sequences than seen in training (extrapolation)
2. Decays attention with distance (nearby tokens attend more strongly)
3. No extra parameters to learn

**Implementation:** Process dimensions in pairs. For each pair (2i, 2i+1), apply a 2D rotation matrix parameterized by position * theta_i.`,
    hints: '["Compute theta_i = 1.0 / (10000 ** (2i / d_model)) for i = 0, 1, ..., d_model/2 - 1", "For position m, the rotation angle for pair i is m * theta_i", "Apply the 2D rotation: [cos -sin; sin cos] to each pair of dimensions", "Use broadcasting: compute all angles for all positions at once with np.outer(positions, thetas)"]',
    visualizationComponent: "RotaryEmbeddingViz",
    sortOrder: 6,
    starterCode: `import numpy as np

class RoPE:
    def __init__(self, d_model, base=10000):
        """
        Rotary Position Embeddings.

        Args:
            d_model: model dimension (must be even)
            base: base for frequency computation (default 10000)
        """
        # Your initialization here
        pass

    def apply(self, x):
        """
        Apply rotary embeddings to input tensor.

        Args:
            x: input tensor, shape (batch_size, seq_len, d_model)

        Returns:
            rotated tensor, same shape as input
        """
        # Your implementation here
        pass`,
    solution: `\`\`\`python
import numpy as np

class RoPE:
    def __init__(self, d_model, base=10000):
        assert d_model % 2 == 0, "d_model must be even"
        self.d_model = d_model
        # Frequency for each pair: theta_i = 1 / base^(2i/d)
        i = np.arange(0, d_model, 2, dtype=np.float64)
        self.thetas = 1.0 / (base ** (i / d_model))  # shape (d_model/2,)

    def apply(self, x):
        batch_size, seq_len, d = x.shape
        positions = np.arange(seq_len, dtype=np.float64)

        # Angles: (seq_len, d_model/2)
        angles = np.outer(positions, self.thetas)

        cos_angles = np.cos(angles)  # (seq_len, d/2)
        sin_angles = np.sin(angles)  # (seq_len, d/2)

        # Split x into even and odd dimensions
        x_even = x[:, :, 0::2]  # (batch, seq, d/2)
        x_odd = x[:, :, 1::2]   # (batch, seq, d/2)

        # Apply rotation
        rotated_even = x_even * cos_angles - x_odd * sin_angles
        rotated_odd = x_even * sin_angles + x_odd * cos_angles

        # Interleave back
        out = np.empty_like(x)
        out[:, :, 0::2] = rotated_even
        out[:, :, 1::2] = rotated_odd
        return out
\`\`\`

**Approach:** Precompute frequency thetas for each dimension pair. For each position, compute rotation angles = position * theta. Split the input into even/odd dimension pairs, apply the 2D rotation formula, and interleave back. Broadcasting handles the batch dimension.`,
    testCases: [
      { id: "t1", name: "Output shape", inputs: { d_model: 8, batch_size: 2, seq_len: 4 }, isPublic: true },
      { id: "t2", name: "Position 0 unchanged", inputs: { d_model: 8, batch_size: 1, seq_len: 1, check: "pos0" }, isPublic: true },
      { id: "t3", name: "Norm preserved", inputs: { d_model: 16, batch_size: 1, seq_len: 5 }, isPublic: false },
      { id: "t4", name: "Relative position in dot product", inputs: { d_model: 8, seq_len: 10, check: "relative" }, isPublic: false },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "transformer-block",
    type: "coding",
    title: "Transformer Decoder Block",
    description: `Assemble a complete transformer decoder block from its components.

A transformer decoder block consists of:
1. **Masked Self-Attention** + Add & LayerNorm (Pre-Norm style)
2. **Feed-Forward Network** + Add & LayerNorm (Pre-Norm style)

Pre-Norm means: \`output = x + Sublayer(LayerNorm(x))\`

The causal mask ensures each position can only attend to itself and earlier positions (no future leaking).

**Example:**
\`\`\`python
>>> block = TransformerBlock(d_model=64, n_heads=4)
>>> x = np.random.randn(2, 10, 64)  # batch=2, seq_len=10
>>> out = block.forward(x)
>>> out.shape
(2, 10, 64)
\`\`\``,
    difficulty: "Hard",
    weekNumber: 3,
    tags: '["transformers", "decoder", "architecture"]',
    theory: `The transformer decoder block is the building block of GPT, LLaMA, and all autoregressive language models. Each block refines the representation with two sub-layers.

**Pre-Norm vs Post-Norm:**
- Post-Norm (original transformer): \`output = LayerNorm(x + Sublayer(x))\`
- Pre-Norm (GPT-2+, LLaMA): \`output = x + Sublayer(LayerNorm(x))\`
Pre-Norm is more stable for deep networks because the residual path is "clean" (no normalization in the skip connection).

**Causal mask:** For autoregressive generation, position i must not attend to positions j > i. The mask is a lower-triangular matrix of 1s. This is applied alongside the padding mask.

**Layer normalization:** Normalizes across the feature dimension (not batch). For each token independently: subtract mean, divide by std, scale by learnable gamma and shift by beta.

**The residual stream:** Think of x as a "residual stream" that each sub-layer reads from and writes to. Each sub-layer adds its contribution: attention adds context mixing, FFN adds feature transformation.`,
    hints: '["Create a causal mask: np.tril(np.ones((seq_len, seq_len)))", "LayerNorm: normalize over the last axis, with learnable gamma and beta", "Pre-Norm order: norm first, then sublayer, then add residual", "For multi-head attention, reshape d_model into (n_heads, d_k) where d_k = d_model / n_heads"]',
    visualizationComponent: "GPTArchitectureViz",
    sortOrder: 7,
    starterCode: `import numpy as np

class TransformerBlock:
    def __init__(self, d_model, n_heads, d_ff=None):
        """
        A single transformer decoder block (Pre-Norm).

        Args:
            d_model: model dimension
            n_heads: number of attention heads
            d_ff: FFN inner dimension (default: 4 * d_model)
        """
        # Your initialization here
        pass

    def layer_norm(self, x, gamma, beta, eps=1e-5):
        """
        Layer normalization.

        Args:
            x: input, shape (..., d_model)
            gamma: scale, shape (d_model,)
            beta: shift, shape (d_model,)

        Returns:
            normalized tensor, same shape
        """
        # Your implementation here
        pass

    def causal_attention(self, x):
        """
        Masked (causal) self-attention.

        Args:
            x: input, shape (batch_size, seq_len, d_model)

        Returns:
            attention output, shape (batch_size, seq_len, d_model)
        """
        # Your implementation here
        pass

    def feed_forward(self, x):
        """
        FFN: Linear -> GELU -> Linear.

        Args:
            x: input, shape (..., d_model)

        Returns:
            output, shape (..., d_model)
        """
        # Your implementation here
        pass

    def forward(self, x):
        """
        Full transformer block forward pass (Pre-Norm).

        Args:
            x: input, shape (batch_size, seq_len, d_model)

        Returns:
            output, shape (batch_size, seq_len, d_model)
        """
        # Your implementation here
        pass`,
    solution: `\`\`\`python
import numpy as np

class TransformerBlock:
    def __init__(self, d_model, n_heads, d_ff=None):
        self.d_model = d_model
        self.n_heads = n_heads
        self.d_k = d_model // n_heads
        d_ff = d_ff or 4 * d_model

        # Attention projections
        scale_attn = np.sqrt(2.0 / d_model)
        self.W_q = np.random.randn(d_model, d_model) * scale_attn
        self.W_k = np.random.randn(d_model, d_model) * scale_attn
        self.W_v = np.random.randn(d_model, d_model) * scale_attn
        self.W_o = np.random.randn(d_model, d_model) * scale_attn

        # FFN
        scale_ff = np.sqrt(2.0 / d_model)
        self.W1 = np.random.randn(d_model, d_ff) * scale_ff
        self.b1 = np.zeros(d_ff)
        self.W2 = np.random.randn(d_ff, d_model) * np.sqrt(2.0 / d_ff)
        self.b2 = np.zeros(d_model)

        # Layer norm parameters
        self.ln1_gamma = np.ones(d_model)
        self.ln1_beta = np.zeros(d_model)
        self.ln2_gamma = np.ones(d_model)
        self.ln2_beta = np.zeros(d_model)

    def layer_norm(self, x, gamma, beta, eps=1e-5):
        mean = np.mean(x, axis=-1, keepdims=True)
        var = np.var(x, axis=-1, keepdims=True)
        x_norm = (x - mean) / np.sqrt(var + eps)
        return gamma * x_norm + beta

    def causal_attention(self, x):
        batch_size, seq_len, _ = x.shape

        Q = x @ self.W_q  # (batch, seq, d_model)
        K = x @ self.W_k
        V = x @ self.W_v

        # Reshape for multi-head: (batch, seq, n_heads, d_k) -> (batch, n_heads, seq, d_k)
        Q = Q.reshape(batch_size, seq_len, self.n_heads, self.d_k).transpose(0, 2, 1, 3)
        K = K.reshape(batch_size, seq_len, self.n_heads, self.d_k).transpose(0, 2, 1, 3)
        V = V.reshape(batch_size, seq_len, self.n_heads, self.d_k).transpose(0, 2, 1, 3)

        # Scaled dot-product attention
        scores = Q @ K.transpose(0, 1, 3, 2) / np.sqrt(self.d_k)

        # Causal mask
        causal_mask = np.tril(np.ones((seq_len, seq_len)))
        scores = np.where(causal_mask == 1, scores, -1e9)

        # Softmax
        scores_shifted = scores - np.max(scores, axis=-1, keepdims=True)
        exp_scores = np.exp(scores_shifted)
        weights = exp_scores / np.sum(exp_scores, axis=-1, keepdims=True)

        # Apply attention
        attn_out = weights @ V  # (batch, n_heads, seq, d_k)

        # Reshape back: (batch, n_heads, seq, d_k) -> (batch, seq, d_model)
        attn_out = attn_out.transpose(0, 2, 1, 3).reshape(batch_size, seq_len, self.d_model)

        return attn_out @ self.W_o

    def feed_forward(self, x):
        hidden = x @ self.W1 + self.b1
        # GELU
        hidden = 0.5 * hidden * (1 + np.tanh(np.sqrt(2.0 / np.pi) * (hidden + 0.044715 * hidden ** 3)))
        return hidden @ self.W2 + self.b2

    def forward(self, x):
        # Pre-Norm: Attention sub-layer
        x = x + self.causal_attention(self.layer_norm(x, self.ln1_gamma, self.ln1_beta))
        # Pre-Norm: FFN sub-layer
        x = x + self.feed_forward(self.layer_norm(x, self.ln2_gamma, self.ln2_beta))
        return x
\`\`\`

**Approach:** The block chains two pre-norm sub-layers. Causal attention uses multi-head projections, a lower-triangular mask, and scaled dot-product attention. The FFN uses GELU. Each sub-layer adds its output to the residual stream.`,
    testCases: [
      { id: "t1", name: "Output shape", inputs: { d_model: 64, n_heads: 4, batch_size: 2, seq_len: 8 }, isPublic: true },
      { id: "t2", name: "Single token", inputs: { d_model: 32, n_heads: 2, batch_size: 1, seq_len: 1 }, isPublic: true },
      { id: "t3", name: "Causal property", inputs: { d_model: 32, n_heads: 2, seq_len: 5, check: "causal" }, isPublic: false },
      { id: "t4", name: "Residual connection", inputs: { d_model: 64, n_heads: 4, check: "residual" }, isPublic: false },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "residual-connections",
    type: "coding",
    title: "Residual Connections",
    description: `Implement and analyze residual (skip) connections.

Build two small networks - one with residual connections and one without - and show how residual connections affect gradient flow through depth.

1. **PlainNet:** Stack N linear layers with ReLU: \`x -> Linear -> ReLU -> Linear -> ReLU -> ...\`
2. **ResNet:** Same, but add skip connections: \`x -> (Linear -> ReLU) + x -> (Linear -> ReLU) + x -> ...\`

Implement a function that computes the gradient magnitude at the input after passing through N layers.

**Example:**
\`\`\`python
>>> plain = PlainNet(dim=32, n_layers=10)
>>> res = ResNet(dim=32, n_layers=10)
>>> grad_plain = compute_input_gradient(plain, x)
>>> grad_res = compute_input_gradient(res, x)
>>> grad_res > grad_plain  # residuals prevent vanishing gradients
True
\`\`\``,
    difficulty: "Easy",
    weekNumber: 3,
    tags: '["residual-connections", "gradient-flow", "architecture"]',
    theory: `Residual connections (He et al., 2015) make deep networks trainable by creating a shortcut for gradients to flow backwards.

**The problem:** In a plain network with L layers, the gradient must pass through L matrix multiplications during backprop. If each multiplication shrinks the gradient (eigenvalues < 1), the gradient vanishes exponentially: gradient ~ 0.9^L. At L=50, that is a ~0.005x reduction.

**The solution:** A residual connection computes \`output = F(x) + x\`. During backprop, the gradient of the identity path is 1. So the total gradient is \`dF/dx + 1\`. Even if dF/dx vanishes, the gradient through the skip connection is exactly 1.

**Why this works mathematically:** The output of layer l is \`x_l = F_l(x_{l-1}) + x_{l-1}\`. Unrolling: \`x_L = x_0 + sum(F_l(x_{l-1}))\`. The gradient of x_L w.r.t. x_0 is \`1 + sum(dF_l/dx)\`. The "1" term guarantees gradient flow regardless of what the F_l terms do.

**In transformers:** Every sub-layer (attention, FFN) uses a residual connection. The "residual stream" carries information forward, and each sub-layer adds its contribution.`,
    hints: '["For the plain net, just chain Linear+ReLU layers", "For the res net, add the input to the output of each Linear+ReLU block", "To compute gradients numerically, use finite differences: (f(x+eps) - f(x-eps)) / (2*eps)", "The gradient magnitude is np.linalg.norm(gradient_vector)"]',
    visualizationComponent: "ResidualConnectionViz",
    sortOrder: 8,
    starterCode: `import numpy as np

class PlainNet:
    def __init__(self, dim, n_layers):
        """
        Plain network: stack of Linear+ReLU layers.

        Args:
            dim: input/output dimension (same for all layers)
            n_layers: number of layers
        """
        # Your initialization here
        pass

    def forward(self, x):
        """Forward pass through all layers."""
        # Your implementation here
        pass

class ResNet:
    def __init__(self, dim, n_layers):
        """
        Residual network: Linear+ReLU with skip connections.

        Args:
            dim: input/output dimension
            n_layers: number of layers
        """
        # Your initialization here
        pass

    def forward(self, x):
        """Forward pass with residual connections."""
        # Your implementation here
        pass

def compute_input_gradient(net, x, eps=1e-5):
    """
    Compute gradient magnitude at input using finite differences.

    Args:
        net: PlainNet or ResNet instance
        x: input vector, shape (dim,)
        eps: finite difference step size

    Returns:
        float - L2 norm of the gradient
    """
    # Your implementation here
    pass`,
    solution: `\`\`\`python
import numpy as np

class PlainNet:
    def __init__(self, dim, n_layers):
        self.layers = []
        scale = np.sqrt(2.0 / dim)
        for _ in range(n_layers):
            W = np.random.randn(dim, dim) * scale
            b = np.zeros(dim)
            self.layers.append((W, b))

    def forward(self, x):
        for W, b in self.layers:
            x = np.maximum(0, x @ W + b)  # Linear + ReLU
        return x

class ResNet:
    def __init__(self, dim, n_layers):
        self.layers = []
        scale = np.sqrt(2.0 / dim)
        for _ in range(n_layers):
            W = np.random.randn(dim, dim) * scale
            b = np.zeros(dim)
            self.layers.append((W, b))

    def forward(self, x):
        for W, b in self.layers:
            x = np.maximum(0, x @ W + b) + x  # Linear + ReLU + skip
        return x

def compute_input_gradient(net, x, eps=1e-5):
    dim = x.shape[0]
    grad = np.zeros(dim)
    f_x = np.sum(net.forward(x))
    for i in range(dim):
        x_plus = x.copy()
        x_plus[i] += eps
        x_minus = x.copy()
        x_minus[i] -= eps
        grad[i] = (np.sum(net.forward(x_plus)) - np.sum(net.forward(x_minus))) / (2 * eps)
    return float(np.linalg.norm(grad))
\`\`\`

**Approach:** Both networks stack linear+ReLU layers. ResNet adds \`+ x\` after each block. The gradient computation uses numerical finite differences - perturb each input dimension by +/- eps and measure the output change. ResNet's skip connections maintain a gradient path of magnitude ~1, while PlainNet's gradients decay with depth.`,
    testCases: [
      { id: "t1", name: "PlainNet output shape", inputs: { dim: 16, n_layers: 5 }, isPublic: true },
      { id: "t2", name: "ResNet output shape", inputs: { dim: 16, n_layers: 5 }, isPublic: true },
      { id: "t3", name: "ResNet gradients larger (deep)", inputs: { dim: 16, n_layers: 20, check: "grad_comparison" }, isPublic: false },
      { id: "t4", name: "Gradient is positive", inputs: { dim: 8, n_layers: 3, check: "grad_positive" }, isPublic: false },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "transformer-components-quiz",
    type: "quiz",
    title: "Transformer Components",
    description: "Test your understanding of transformer building blocks: layer norm, residual connections, FFN, positional encoding, and their roles.",
    difficulty: "Medium",
    weekNumber: 3,
    tags: '["transformers", "architecture", "quiz"]',
    theory: `The transformer combines several components, each solving a specific problem:

**Layer Normalization** normalizes across the feature dimension for each token independently. Unlike batch norm (normalizes across the batch), layer norm works the same way at train and inference time and handles variable batch sizes.

**Residual connections** create a "highway" for gradients: \`output = sublayer(x) + x\`. Without them, gradients vanish through dozens of layers. The residual stream acts as a shared workspace that all layers read from and write to.

**FFN (Feed-Forward Network)** applies per-position feature transformation. Attention handles token-token interaction; FFN handles feature-feature interaction. The 4x expansion gives the network more capacity for non-linear transformations.

**Positional encoding** gives the model position awareness. Without it, self-attention is permutation-invariant (changing word order wouldn't change the output). Options: sinusoidal (fixed), learned embeddings, RoPE (rotation-based).

**Multi-head attention** splits d_model into n_heads parallel attention computations. Each head can learn different patterns (one head might track syntax, another semantics). Heads are concatenated and projected back to d_model.`,
    hints: "[]",
    visualizationComponent: "AttentionQuizViz",
    sortOrder: 9,
    starterCode: null,
    testCases: null,
    questions: [
      {
        id: "q1",
        questionNumber: 1,
        questionText: "Why do transformers use Layer Normalization instead of Batch Normalization?",
        options: {
          a: "Layer Norm is faster to compute",
          b: "Layer Norm works independently per token and doesn't depend on batch size, making it stable for variable-length sequences",
          c: "Batch Norm cannot normalize floating-point numbers",
          d: "Layer Norm uses fewer parameters",
        },
        correctAnswer: "b",
        explanation: "Batch Norm computes statistics across the batch dimension, which is problematic for: (1) variable sequence lengths in a batch, (2) small batch sizes during inference, (3) different behavior at train vs. test time. Layer Norm computes statistics across the feature dimension for each token independently, avoiding all these issues.",
      },
      {
        id: "q2",
        questionNumber: 2,
        questionText: "What would happen to a 48-layer transformer if you removed all residual connections?",
        options: {
          a: "Training would be slightly slower but converge to the same result",
          b: "The model would use less memory",
          c: "Gradients would vanish during backpropagation, making the model untrainable",
          d: "The model would overfit faster",
        },
        correctAnswer: "c",
        explanation: "Without residual connections, gradients must pass through 48 layers of matrix multiplications during backprop. Each multiplication can shrink the gradient. After 48 layers, the gradient reaching the early layers would be negligibly small, preventing those layers from learning. Residual connections provide a direct gradient path with gradient 1.",
      },
      {
        id: "q3",
        questionNumber: 3,
        questionText: "In a transformer FFN block (d_model -> 4*d_model -> d_model), what purpose does the 4x expansion serve?",
        options: {
          a: "It reduces computation by compressing the representation",
          b: "It provides a higher-dimensional space for nonlinear feature transformations before projecting back",
          c: "It increases the sequence length the model can handle",
          d: "It allows the model to attend to 4x more tokens",
        },
        correctAnswer: "b",
        explanation: "The expansion to 4*d_model creates a wider intermediate representation where the GELU activation can make richer nonlinear decisions. Think of it as temporarily \"zooming in\" on the feature space. The projection back to d_model keeps the residual stream dimension fixed. The FFN accounts for roughly 2/3 of each layer's parameters.",
      },
      {
        id: "q4",
        questionNumber: 4,
        questionText: "Without any positional encoding, what property does self-attention have?",
        options: {
          a: "It can only attend to adjacent tokens",
          b: "It produces the same output regardless of input order (permutation invariant)",
          c: "It attends to all positions equally",
          d: "It cannot compute attention scores",
        },
        correctAnswer: "b",
        explanation: "Self-attention computes pairwise dot products between all positions. Shuffling the input positions produces the same attention scores (just reordered). The output for each token depends on WHAT other tokens are present, not WHERE they are. Positional encodings break this symmetry by making each position distinguishable.",
      },
      {
        id: "q5",
        questionNumber: 5,
        questionText: "Why does the attention mechanism divide by sqrt(d_k)?",
        options: {
          a: "To normalize the attention weights to sum to 1",
          b: "To reduce memory usage during computation",
          c: "To prevent dot products from growing large with dimension, which would push softmax into saturation",
          d: "To make the computation numerically stable on GPUs",
        },
        correctAnswer: "c",
        explanation: "If Q and K have entries with variance 1, their dot product has variance d_k. For d_k=64, dot products would typically be ~8 in magnitude, pushing softmax into near-one-hot outputs with vanishingly small gradients. Dividing by sqrt(d_k) keeps the variance at 1, keeping softmax in a regime with useful gradients.",
      },
      {
        id: "q6",
        questionNumber: 6,
        questionText: "In multi-head attention with d_model=768 and 12 heads, each head operates on vectors of dimension:",
        options: {
          a: "768",
          b: "64",
          c: "12",
          d: "768 * 12 = 9216",
        },
        correctAnswer: "b",
        explanation: "Multi-head attention splits d_model across heads: d_k = d_model / n_heads = 768 / 12 = 64. Each head independently computes attention on 64-dimensional Q, K, V vectors. The outputs of all 12 heads are concatenated (12 * 64 = 768) and projected back to d_model. This is computationally equivalent to single-head attention with d_k=768, but each head can learn different attention patterns.",
      },
    ],
    solution: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
];
