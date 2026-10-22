---
layout: post
title: "Building PyTorch from scratch"
date: 2026-03-11 14:06:04 +0530
categories: tech
tokens: "~18k"
math: true
description: "Made this in order to learn Deep Learning"
tags: [ml, from-scratch]
---

A Pytorch like library under 1000 lines in numpy.

The training loop is forward pass → compute loss → `zero_grad()` → `.backward()` → `optimizer.step()`. 
**MNIST accuracy** = 94.90% ([CNN](/blog/nn#mnist-from-minitorch-custom-implementation-of-pytorch)), 95.15% (MLP)

*Prerequisites:* python, calculus ([chain rule](/blog/math#more-on-chain-rule)), some pytorch. if not, read [neural networks](/blog/nn), [tensor library](/blog/torch), and [backprop math](/blog/math) first.

Docs: [minitorch documentation, examples and source code](https://samitmohan.github.io/minitorch/)

---

## 1. what's in the box

- `tensor.py` (561 lines) is the core: the Tensor class, all operators and autograd.
- `module.py` (142 lines) has the Module system and the Sequential container.
- `layers.py` (166 lines) has Linear, ReLU, Sigmoid, Tanh, Softmax, GELU, LayerNorm, Embedding, Dropout and BatchNorm1d.
- `conv.py` (158 lines) has Conv2d, MaxPool2d, Flatten and im2col/col2im.
- `functional.py` (97 lines) has the activation functions.
- `loss.py` (27 lines) has MSE, BCE and cross-entropy.
- `optim.py` (113 lines) has SGD, Adam, gradient clipping and LR schedulers.
- `grad_check.py` (60 lines) does numerical gradient verification.
- `viz.py` (39 lines) draws the computation graph.
- `data.py` (28 lines) has the DataLoader.
- `transformer.py` (104 lines) has a small GPT built from the parts above.

---

## 2. the tensor

A tensor is a multi-dimensional array. It can also record the operations on it, so autograd can compute gradients later.

```python
class Tensor:
    def __init__(self, data, *, requires_grad=False):
        if isinstance(data, np.ndarray):
            self.data = data if data.dtype in (np.float32, np.float64) else data.astype(np.float32)
        elif isinstance(data, np.floating):
            self.data = np.array(data, dtype=data.dtype)
        else:
            self.data = np.array(data, dtype=np.float32)
        self.requires_grad = requires_grad and _grad_enabled
        self.grad = None
        self._backward = lambda: None
        self._prev = set()
        self._op = ''
```

Six fields do all the work:

- `data` is a NumPy array that holds the values. Cast everything to float32 (or keep float64), this is because for grad we need to diffrentiate and  you can't differentiate integers.
- `requires_grad` is a boolean flag. If it is `True`, the tensor tracks operations. Notice it's AND'd with `_grad_enabled`. More on that in a moment.
- `grad` holds the gradient after `.backward()`. It starts as `None` and gets created on first use.
- `_backward` is a closure. Every operation that creates a new tensor stuffs a function in here that pushes gradients back to the inputs.
- `_prev` is the set of parent tensors that created this one. Together with `_backward`, it forms the **[computation graph](/blog/torch#autograd)**.
- `_op` is a string label for debugging and visualization ('add', 'mul', 'matmul', etc.).

Static constructors wrap NumPy:

```python
@staticmethod
def zeros(*shape, requires_grad=False):
    return Tensor(np.zeros(shape, dtype=np.float32), requires_grad=requires_grad)

@staticmethod
def randn(*shape, requires_grad=False):
    return Tensor(np.random.randn(*shape).astype(np.float32), requires_grad=requires_grad)
```

Then there's the **`no_grad`**, during inference, you don't want to build a computation graph; it wastes memory and you'll never call backward. So we have a global flag:

```python
_grad_enabled = True

class no_grad:
    def __enter__(self):
        global _grad_enabled
        self._prev = _grad_enabled
        _grad_enabled = False
        return self

    def __exit__(self, *args):
        global _grad_enabled
        _grad_enabled = self._prev
```

When you write `with no_grad():`, it flips the global to `False`. Any new tensor created inside the block gets `requires_grad=False` regardless of what you asked for, because of the `requires_grad and _grad_enabled` check in `__init__`. On exit, it restores the previous state. PyTorch's `torch.no_grad()` works the same way.

---

## 3. the autograd engine

The core of the whole thing.

### the computation graph

Every arithmetic operation on tensors computes a result and also records *how* to send gradients back to its inputs. When you write `c = a + b`, tensor `c` carries two things:

1. The numerical result (`c.data = a.data + b.data`)
2. A closure (`c._backward`) that knows: "if someone gives me the gradient of the loss with respect to `c`, here's how to compute the gradients with respect to `a` and `b`"

The tensors and their `_prev` links form a **directed acyclic graph** (DAG). The leaf tensors (your weights and inputs) are at the roots. The loss scalar is at the tip. Every intermediate result is a node in between, connected by the operations that created it.

### walking through an example

Let's trace through this step by step:

```python
a = Tensor([1.0, 2.0], requires_grad=True)
b = a ** 2        # b = [1, 4]
c = b.sum()       # c = 5.0
c.backward()
# a.grad = [2.0, 4.0]
```

<svg viewBox="0 0 560 290" role="img" aria-label="Computation graph for b = a squared and c = b summed, with a = [1, 2]. The forward pass builds a, pow, b, sum and c from left to right. The backward pass seeds c.grad = 1, gives b.grad = [1, 1] and a.grad = [2, 4]. The constant 2 gets no gradient" style="width:100%;max-width:520px;height:auto;display:block;margin:24px auto;font-family:var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif">
  <style>
    .ag-n0 { animation: ag-n0 10s infinite; } @keyframes ag-n0 { 0%, 2% { opacity: 0; } 4%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ag-n1 { animation: ag-n1 10s infinite; } @keyframes ag-n1 { 0%, 12% { opacity: 0; } 14%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ag-n2 { animation: ag-n2 10s infinite; } @keyframes ag-n2 { 0%, 24% { opacity: 0; } 26%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ag-f { animation: ag-f 10s infinite; } @keyframes ag-f { 0%, 2% { opacity: 0; } 4%, 42% { opacity: 1; } 44%, 100% { opacity: 0; } }
    .ag-b { animation: ag-b 10s infinite; } @keyframes ag-b { 0%, 44% { opacity: 0; } 46%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ag-g0 { animation: ag-g0 10s infinite; } @keyframes ag-g0 { 0%, 48% { opacity: 0; } 50%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ag-g1 { animation: ag-g1 10s infinite; } @keyframes ag-g1 { 0%, 60% { opacity: 0; } 62%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ag-g2 { animation: ag-g2 10s infinite; } @keyframes ag-g2 { 0%, 72% { opacity: 0; } 74%, 95% { opacity: 1; } 100% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) {
      .ag-n0, .ag-n1, .ag-n2, .ag-b, .ag-g0, .ag-g1, .ag-g2 { animation: none; opacity: 1; }
      .ag-f { animation: none; opacity: 0; }
    }
  </style>
  <defs><marker id="ag-ab" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M1,1 L8,5 L1,9" fill="none" stroke="rgba(25,113,194,1)" stroke-width="1.5"/></marker><marker id="ag-ar" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M1,1 L8,5 L1,9" fill="none" stroke="rgba(220,60,60,1)" stroke-width="1.5"/></marker></defs>
  <text class="ag-f" x="12" y="28" font-size="14" font-weight="600" fill="rgba(25,113,194,1)">forward: each operation creates a node</text>
  <text class="ag-b" x="12" y="28" font-size="14" font-weight="600" fill="rgba(220,60,60,1)">backward: walk the topological order in reverse</text>
  <g class="ag-n0">
    <rect x="12" y="96" width="96" height="46" rx="10" fill="rgba(34,158,68,0.12)" stroke="rgba(34,158,68,0.8)"/><text x="60" y="124" font-size="14" text-anchor="middle" fill="currentColor">a = [1, 2]</text>
    <rect x="140" y="206" width="64" height="40" rx="10" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-opacity="0.4"/><text x="172" y="231" font-size="13" text-anchor="middle" fill="currentColor">2</text>
    <text x="172" y="264" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">constant, no grad</text>
  </g>
  <g class="ag-n1">
    <line x1="108" y1="119" x2="138" y2="119" stroke="rgba(25,113,194,0.8)" stroke-width="1.5" marker-end="url(#ag-ab)"/>
    <line x1="172" y1="206" x2="172" y2="146" stroke="rgba(25,113,194,0.8)" stroke-width="1.5" marker-end="url(#ag-ab)"/>
    <rect x="140" y="102" width="64" height="34" rx="8" fill="rgba(156,54,181,0.12)" stroke="rgba(156,54,181,0.8)"/><text x="172" y="124" font-size="13" text-anchor="middle" fill="currentColor">pow</text>
    <line x1="204" y1="119" x2="234" y2="119" stroke="rgba(25,113,194,0.8)" stroke-width="1.5" marker-end="url(#ag-ab)"/>
    <rect x="236" y="96" width="96" height="46" rx="10" fill="rgba(25,113,194,0.12)" stroke="rgba(25,113,194,0.8)"/><text x="284" y="124" font-size="14" text-anchor="middle" fill="currentColor">b = [1, 4]</text>
  </g>
  <g class="ag-n2">
    <line x1="332" y1="119" x2="362" y2="119" stroke="rgba(25,113,194,0.8)" stroke-width="1.5" marker-end="url(#ag-ab)"/>
    <rect x="364" y="102" width="64" height="34" rx="8" fill="rgba(156,54,181,0.12)" stroke="rgba(156,54,181,0.8)"/><text x="396" y="124" font-size="13" text-anchor="middle" fill="currentColor">sum</text>
    <line x1="428" y1="119" x2="458" y2="119" stroke="rgba(25,113,194,0.8)" stroke-width="1.5" marker-end="url(#ag-ab)"/>
    <rect x="460" y="96" width="88" height="46" rx="10" fill="rgba(25,113,194,0.12)" stroke="rgba(25,113,194,0.8)"/><text x="504" y="124" font-size="14" text-anchor="middle" fill="currentColor">c = 5</text>
  </g>
  <g class="ag-g0">
    <text x="504" y="84" font-size="13" font-weight="600" text-anchor="middle" fill="rgba(220,60,60,1)">grad = 1 (seed)</text>
  </g>
  <g class="ag-g1">
    <line x1="460" y1="162" x2="336" y2="162" stroke="rgba(220,60,60,0.9)" stroke-width="2" marker-end="url(#ag-ar)"/>
    <text x="396" y="182" font-size="12" text-anchor="middle" fill="rgba(156,54,181,1)">copy to each element</text>
    <text x="284" y="84" font-size="13" font-weight="600" text-anchor="middle" fill="rgba(220,60,60,1)">grad = [1, 1]</text>
  </g>
  <g class="ag-g2">
    <line x1="236" y1="162" x2="112" y2="162" stroke="rgba(220,60,60,0.9)" stroke-width="2" marker-end="url(#ag-ar)"/>
    <text x="136" y="182" font-size="12" text-anchor="end" fill="rgba(156,54,181,1)">local 2a</text>
    <text x="60" y="64" font-size="13" font-weight="600" text-anchor="middle" fill="rgba(220,60,60,1)">grad = 2a × [1, 1]</text>
    <text x="60" y="84" font-size="13" font-weight="600" text-anchor="middle" fill="rgba(220,60,60,1)">= [2, 4]</text>
  </g>
</svg>

*Figure: the forward pass builds a, pow, b, sum and c. The backward pass seeds c.grad = 1, copies it to every element of b, then multiplies by the local gradient 2a. The constant 2 never gets a gradient.*

**Step 1: `a = Tensor([1.0, 2.0], requires_grad=True)`**

This creates a leaf tensor. Its `_backward` is a no-op and its `_prev` is empty. It's a starting point.

**Step 2: `b = a ** 2`**

This calls `__pow__`. Looking at the actual code:

```python
def __pow__(self, other):
    other = other if isinstance(other, Tensor) else Tensor(other)
    out = Tensor(self.data ** other.data, requires_grad=self._should_track(other))

    def _backward():
        if self.requires_grad:
            # d(a^b)/da = b * a^(b-1)
            _accum_grad(self, _sum_to_shape(other.data * (self.data ** (other.data - 1)) * out.grad, self.data.shape))
        if other.requires_grad:
            # d(a^b)/db = a^b * ln(|a|), only valid for positive base
            safe_base = np.abs(self.data) + 1e-12
            _accum_grad(other, _sum_to_shape(out.data * np.log(safe_base) * out.grad, other.data.shape))

    out._backward = _backward
    out._prev = {self, other}
    out._op = 'pow'
    return out
```

The forward pass computes `[1.0, 4.0]`. The closure captures `a`, the constant `2` and `out`, and applies $\frac{d}{dx}x^n = nx^{n-1}$ when it runs. The constant `2` becomes a `Tensor` too, so `b._prev = {a, Tensor(2)}`. `_prev` is a Python set, so it has no fixed order.

**Step 3: `c = b.sum()`**

`sum` builds the same kind of node. Its closure copies the scalar gradient to every element of `b`, because the derivative of a sum with respect to each input is 1.

**Step 4: `c.backward()`**

Here's `backward()`:

```python
def backward(self):
    assert self.data.size == 1, "backward() only works on scalar tensors - call .sum() or .mean() first"

    # iterative post-order DFS so deep graphs don't blow the recursion limit
    topo = []
    visited = set()
    stack = [(self, False)]
    while stack:
        node, processed = stack.pop()
        if processed:
            topo.append(node)
            continue
        if node in visited:
            continue
        visited.add(node)
        stack.append((node, True))
        for child in node._prev:
            if child not in visited:
                stack.append((child, False))

    for node in topo:
        if node._prev and node is not self:
            node.grad = None

    if self.grad is None:
        self.grad = np.ones_like(self.data)

    for node in reversed(topo):
        if node.grad is None:
            continue
        node._backward()
```

The general idea (topological sort, seed the output with 1, walk the graph in reverse) is in [the torch post](/blog/torch#autograd), [MicroGPT's backward](/blog/microgpt#backward) and the [computational graph walkthrough](/blog/interview-questions#the-value-class-building-the-computational-graph). Three parts are specific to minitorch:

1. The sort uses an explicit stack instead of recursion, so a deep graph cannot hit Python's recursion limit. Because `_prev` is a set, `a` and `Tensor(2)` can come out in either order: `[a, Tensor(2), b, c]` or `[Tensor(2), a, b, c]`. Both orders are valid.
2. Every non-leaf node except `c` drops its old `.grad` first. Without this step, a second `backward()` adds on top of the old values.
3. The reverse pass skips a node with no gradient, such as a node built under `no_grad`. `Tensor(2)` never gets a gradient, so its no-op closure never runs.

The result is `a.grad = [2.0, 4.0]`, which is correct: $\frac{d}{da}(a_1^2 + a_2^2) = [2a_1, 2a_2] = [2, 4]$.

### the helper functions

Two small helpers keep the backward closures correct.

**`_accum_grad`** handles the fact that a tensor might be used multiple times in a computation (like `a * a`). Each usage contributes to the gradient, so we *accumulate* rather than overwrite:

```python
def _accum_grad(tensor, grad):
    if tensor.grad is None:
        tensor.grad = np.zeros_like(tensor.data)
    tensor.grad += grad
```

**`_sum_to_shape`** handles **[broadcasting](/blog/torch#broadcasting) gradients**. When NumPy broadcasts a `(1, 3)` tensor against a `(4, 3)` tensor, the result is `(4, 3)`. But in the backward pass, the gradient is `(4, 3)` and we need `(1, 3)` for the smaller input. The fix sums along the broadcast dimensions:

```python
def _sum_to_shape(grad, shape):
    while grad.ndim > len(shape):
        grad = grad.sum(axis=0)
    for i, (g_dim, s_dim) in enumerate(zip(grad.shape, shape)):
        if s_dim == 1 and g_dim != 1:
            grad = grad.sum(axis=i, keepdims=True)
    return grad.reshape(shape)
```

Why does summing undo broadcasting? Broadcasting copies a value to multiple positions in the forward pass. That single value *contributed* to multiple outputs. In the backward pass, we sum those contributions back into one gradient.

My first version didn't handle broadcasting at all. Gradients passed through with whatever shape they had. Training "worked" in the sense that loss went down, but the gradients were wrong. No error, just silently wrong numbers. The model converged to mediocre accuracy with no obvious cause. Gradient checking (section 11) revealed the shape mismatches. The fix is three lines of code; finding it took an entire evening, classic case of AI can't find bugs.

### three operators in detail

Every operator follows the same pattern as `__pow__` above. Only the line inside `_backward` changes.

- Addition passes the gradient through to both inputs, because $\frac{\partial}{\partial a}(a + b) = 1$: `_sum_to_shape(out.grad, self.data.shape)`.
- Multiplication multiplies the gradient by the *other* input, because $\frac{\partial}{\partial a}(a \cdot b) = b$: `_sum_to_shape(other.data * out.grad, self.data.shape)`.

**Matrix multiply** is the tricky one. If $C = A @ B$ where $A$ is $(m, k)$ and $B$ is $(k, n)$, then:

$$
\frac{\partial L}{\partial A} = \frac{\partial L}{\partial C} \cdot B^T \qquad \frac{\partial L}{\partial B} = A^T \cdot \frac{\partial L}{\partial C}
$$

This falls out of the chain rule applied to matrix calculus. The shapes match:

- `out.grad` is $(m, n)$
- $B^T$ is $(n, k)$
- So `out.grad @ B.T` is $(m, k)$, the same shape as `self`

```python
def __matmul__(self, other):
    out = Tensor(self.data @ other.data, requires_grad=self._should_track(other))

    def _backward():
        if self.requires_grad:
            grad = out.grad @ other.data.swapaxes(-1, -2)
            _accum_grad(self, _sum_to_shape(grad, self.data.shape))
        if other.requires_grad:
            grad = self.data.swapaxes(-1, -2) @ out.grad
            _accum_grad(other, _sum_to_shape(grad, other.data.shape))

    out._backward = _backward
    out._prev = {self, other}
    out._op = 'matmul'
    return out
```

`swapaxes(-1, -2)` transposes the last two axes and keeps any batch axes, so the same code works for 2D and batched matmul. `_sum_to_shape` sums the gradient over batch axes that came from broadcasting.

This exact pattern shows up again in the Conv2d backward pass.

---

## 4. operations

Every operation in minitorch follows the same template:

1. Compute the forward result using NumPy
2. Define a `_backward` closure that uses the chain rule
3. Set `out._backward`, `out._prev`, `out._op`
4. Return the new tensor

Once you've seen this pattern three times, you've seen all thirty of them. Here's ReLU from `functional.py`:

```python
def relu(x):
    data = np.maximum(0, x.data)
    out = Tensor(data, requires_grad=x.requires_grad)

    def _backward():
        if x.requires_grad:
            _accum_grad(x, (x.data > 0) * out.grad)

    out._backward = _backward
    out._prev = {x}
    out._op = 'relu'
    return out
```

`(x.data > 0)` is a boolean mask that gates the gradient. Same structure as everything else: compute forward, capture what you need in the closure, define backward using the chain rule.

Sigmoid, tanh, softmax and log-softmax all follow the same template. The only interesting wrinkle is **numerical stability**. In float32, `exp(x)` overflows to `inf` for any input greater than about 88.7, so naive softmax breaks. My first forward pass produced NaN loss. The fix subtracts the max before `exp()`. Softmax does not change when you shift all inputs by the same amount, and the largest exponent becomes 0. Log-softmax uses the same shift and computes `shifted - log(sum(exp(shifted)))` in one step, so it never takes the log of a probability that rounded to 0.

Here's the full catalog:

| Category | Operations |
|----------|-----------|
| Arithmetic | `+`, `-`, `*`, `/`, `**`, unary `-`, `@` (matmul) |
| Reductions | `sum`, `mean`, `var`, `std`, `max`, `min` |
| Shape | `reshape`, `transpose`, `squeeze`, `unsqueeze`, `__getitem__` |
| Elementwise | `exp`, `log`, `clamp`, `abs` |
| Activations | `relu`, `sigmoid`, `tanh`, `gelu`, `softmax`, `log_softmax` |
| Tensor ops | `cat`, `stack` |

Most of them have a hand-written backward closure. `var`, `std`, unary `-` and `gelu` are built from other ops, so they get their backward for free. You can chain any combination and the backward pass works, because the chain rule composes.

[tinygrad](https://github.com/tinygrad/tinygrad) cuts this list down much further. It puts every op into one of three groups (`tinygrad/uop/__init__.py`, commit c015351):

- Elementwise ops work on each value on its own, such as ADD, MUL, EXP2 and WHERE.
- Reduce ops collapse an axis with ADD, MUL or MAX.
- Movement ops change only the shape or the view: RESHAPE, EXPAND, PERMUTE, PAD, SHRINK and FLIP.

The whole tinygrad backward pass is one table of 30 pattern rules in `tinygrad/mixin/gradient.py`. Conv has no rule of its own. `conv2d` pads the input, makes a pooling view with movement ops, then multiplies and sums (`tinygrad/mixin/op.py`). minitorch also has 30 backward closures, but three of them are hand-written for whole layers: Conv2d, MaxPool2d and Dropout.

---

## 5. the module system

Tensors with autograd need organizing into layers and models. That's the **Module** system.

```python
class Module:
    def __init__(self):
        self._training = True

    def forward(self, *args, **kwargs):
        raise NotImplementedError

    def __call__(self, *args, **kwargs):
        return self.forward(*args, **kwargs)
```

Subclasses override `forward`. Callers write `model(x)`, which goes through `__call__`. In minitorch, `__call__` only passes the call on to `forward`. Real PyTorch also runs hooks there.

**`parameters()`** recursively collects all trainable tensors by introspecting `__dict__`:

```python
def parameters(self):
    params = []
    for val in self.__dict__.values():
        if isinstance(val, Tensor) and val.requires_grad:
            params.append(val)
        elif isinstance(val, Module):
            params.extend(val.parameters())
        elif isinstance(val, (list, tuple)):
            for item in val:
                if isinstance(item, Tensor) and item.requires_grad:
                    params.append(item)
                elif isinstance(item, Module):
                    params.extend(item.parameters())
    return _dedup(params)
```

If you assign a `Tensor` with `requires_grad=True` to `self.whatever`, `parameters()` finds it. Same for child `Module`. It walks lists and tuples too, which is how `Sequential` stores its layers. `_dedup` drops a tensor that shows up twice, such as a tied weight, so the optimizer does not step it twice.

`state_dict()` and `load_state_dict()` copy the parameters (and the BatchNorm running statistics) to and from a dict, and `save()` / `load()` write that dict with `np.savez`. `train()` and `eval()` toggle Dropout and BatchNorm. `Sequential` is a for-loop over layers.

<svg viewBox="0 0 560 330" role="img" aria-label="A Sequential model holds a layers list: Linear(784, 128), ReLU and Linear(128, 10). parameters() collects the weight and bias of both Linear layers, 4 tensors with 101,770 numbers. state_dict() names them layers.0.weight, layers.0.bias, layers.2.weight and layers.2.bias" style="width:100%;max-width:520px;height:auto;display:block;margin:24px auto;font-family:var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif">
  <style>
    .ms-0 { animation: ms-0 9s infinite; } @keyframes ms-0 { 0%, 2% { opacity: 0; } 5%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ms-1 { animation: ms-1 9s infinite; } @keyframes ms-1 { 0%, 15% { opacity: 0; } 18%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ms-2 { animation: ms-2 9s infinite; } @keyframes ms-2 { 0%, 35% { opacity: 0; } 38%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ms-3 { animation: ms-3 9s infinite; } @keyframes ms-3 { 0%, 55% { opacity: 0; } 58%, 95% { opacity: 1; } 100% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) {
      .ms-0, .ms-1, .ms-2, .ms-3 { animation: none; opacity: 1; }
    }
  </style>
  <g class="ms-0">
    <rect x="200" y="16" width="160" height="42" rx="10" fill="rgba(25,113,194,0.12)" stroke="rgba(25,113,194,0.8)"/><text x="280" y="42" font-size="14" font-weight="600" text-anchor="middle" fill="currentColor">Sequential</text>
  </g>
  <g class="ms-1">
    <line x1="280" y1="58" x2="92" y2="104" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.5"/>
    <line x1="280" y1="58" x2="280" y2="104" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.5"/>
    <line x1="280" y1="58" x2="468" y2="104" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.5"/>
    <text x="150" y="80" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">layers[0]</text>
    <text x="310" y="88" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">[1]</text>
    <text x="410" y="80" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">[2]</text>
    <rect x="12" y="104" width="160" height="42" rx="10" fill="rgba(25,113,194,0.12)" stroke="rgba(25,113,194,0.8)"/><text x="92" y="130" font-size="14" text-anchor="middle" fill="currentColor">Linear(784, 128)</text>
    <rect x="200" y="104" width="160" height="42" rx="10" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-opacity="0.4"/><text x="280" y="130" font-size="14" text-anchor="middle" fill="currentColor">ReLU</text>
    <rect x="388" y="104" width="160" height="42" rx="10" fill="rgba(25,113,194,0.12)" stroke="rgba(25,113,194,0.8)"/><text x="468" y="130" font-size="14" text-anchor="middle" fill="currentColor">Linear(128, 10)</text>
  </g>
  <g class="ms-2">
    <rect x="22" y="160" width="140" height="28" rx="8" fill="rgba(34,158,68,0.12)" stroke="rgba(34,158,68,0.8)"/><text x="92" y="179" font-size="13" text-anchor="middle" fill="currentColor">weight (784, 128)</text>
    <rect x="22" y="196" width="140" height="28" rx="8" fill="rgba(34,158,68,0.12)" stroke="rgba(34,158,68,0.8)"/><text x="92" y="215" font-size="13" text-anchor="middle" fill="currentColor">bias (128,)</text>
    <text x="280" y="183" font-size="13" text-anchor="middle" fill="currentColor" fill-opacity="0.7">no parameters</text>
    <rect x="398" y="160" width="140" height="28" rx="8" fill="rgba(34,158,68,0.12)" stroke="rgba(34,158,68,0.8)"/><text x="468" y="179" font-size="13" text-anchor="middle" fill="currentColor">weight (128, 10)</text>
    <rect x="398" y="196" width="140" height="28" rx="8" fill="rgba(34,158,68,0.12)" stroke="rgba(34,158,68,0.8)"/><text x="468" y="215" font-size="13" text-anchor="middle" fill="currentColor">bias (10,)</text>
    <text x="12" y="256" font-size="14" font-weight="600" fill="rgba(34,158,68,1)">parameters() → 4 tensors, 101,770 numbers</text>
  </g>
  <g class="ms-3">
    <text x="12" y="290" font-size="14" font-weight="600" fill="rgba(156,54,181,1)">state_dict() keys</text>
    <text x="12" y="314" font-size="13" fill="currentColor">layers.0.weight · layers.0.bias · layers.2.weight · layers.2.bias</text>
  </g>
</svg>

*Figure: `parameters()` walks the `layers` list of the MNIST MLP from section 10 and collects four tensors. `state_dict()` names each one by its path.*

---

## 6. layers

### linear

Matrix multiply plus bias:

```python
class Linear(Module):
    def __init__(self, in_features, out_features, bias=True, init='kaiming'):
        super().__init__()
        if init == 'xavier':
            scale = np.sqrt(2.0 / (in_features + out_features))
        else:
            scale = np.sqrt(2.0 / in_features)
        self.weight = Tensor(
            (np.random.randn(in_features, out_features) * scale).astype(np.float32),
            requires_grad=True
        )
        self.bias = Tensor(
            np.zeros(out_features, dtype=np.float32),
            requires_grad=True
        ) if bias else None

    def forward(self, x):
        y = x @ self.weight
        if self.bias is not None:
            y = y + self.bias
        return y
```

The autograd engine handles the backward pass, because `@` and `+` already have backward closures.

I first tried `np.random.randn` with no scaling. The MLP "trained", but badly. The initial weights were way too large. On 1,000 MNIST images, unscaled weights give logits with a standard deviation of 72, against 0.4 with Kaiming init, so the first softmax is close to one-hot and often wrong. A rerun of the current MNIST script with unscaled weights starts at a loss of 60.1 and ends at 85.50% test accuracy. The fix scales the weights:

- Kaiming init scales by $\sqrt{2/\text{fan\_in}}$. The factor of 2 compensates for ReLU, which zeroes about half of its inputs.
- Xavier init scales by $\sqrt{2/(\text{fan\_in} + \text{fan\_out})}$. It suits sigmoid and tanh.

Switching to Kaiming init takes the same run to 95.15%. The numerator matters less than the $1/\sqrt{\text{fan\_in}}$ part: `1.0` instead of `2.0` (LeCun init) gives 94.90%.

Activation layers (ReLU, Sigmoid, Tanh) are one-line wrappers around the functional versions so they can slot into `Sequential`. Nothing interesting there.

### dropout

**Dropout** zeros random elements during training to prevent overfitting. The implementation uses the **inverted dropout** pattern:

```python
class Dropout(Module):
    def __init__(self, p=0.5):
        super().__init__()
        self.p = p

    def forward(self, x):
        if not self._training or self.p == 0.0:
            return x
        mask = (np.random.rand(*x.data.shape) > self.p).astype(np.float32)
        scale = 1.0 / (1.0 - self.p)
        out = Tensor(x.data * mask * scale, requires_grad=x.requires_grad)

        def _backward():
            if x.requires_grad:
                _accum_grad(x, out.grad * mask * scale)

        out._backward = _backward
        out._prev = {x}
        out._op = 'dropout'
        return out
```

The key detail is the `1/(1-p)` scaling. This is "inverted" dropout. It scales *during training*, so the network works unchanged at test time. Without it, activations are $(1-p)$ times smaller during training than inference, and model silently breaks at eval time.

### BatchNorm1d

**[Batch normalization](/blog/math#batch-normalisation)** normalizes each feature across the batch, then applies a learnable scale and shift:

```python
class BatchNorm1d(Module):
    def __init__(self, num_features, eps=1e-5, momentum=0.1):
        super().__init__()
        self.gamma = Tensor(np.ones(num_features, dtype=np.float32), requires_grad=True)
        self.beta = Tensor(np.zeros(num_features, dtype=np.float32), requires_grad=True)
        self.eps = eps
        self.momentum = momentum
        self.running_mean = np.zeros(num_features, dtype=np.float32)
        self.running_var = np.ones(num_features, dtype=np.float32)

    def forward(self, x):
        if self._training:
            mean = x.mean(axis=0, keepdims=True)
            diff = x - mean
            var = (diff ** 2).mean(axis=0, keepdims=True)
            x_hat = diff / (var + self.eps) ** 0.5

            self.running_mean = (1 - self.momentum) * self.running_mean + self.momentum * mean.data.flatten()
            self.running_var = (1 - self.momentum) * self.running_var + self.momentum * var.data.flatten()
        else:
            rm = Tensor(self.running_mean.reshape(1, -1))
            rv = Tensor(self.running_var.reshape(1, -1))
            x_hat = (x - rm) / (rv + self.eps) ** 0.5

        return x_hat * self.gamma + self.beta
```

During training, it normalizes each feature by the batch mean and variance, then applies the learnable $\gamma$ (scale) and $\beta$ (shift). It also tracks running statistics with an exponential moving average for use at eval time (where batch stats are meaningless with a single sample).

The nice thing here is that it needs no hand-written backward. The forward pass uses only differentiable Tensor operations (mean, subtraction, division, pow), so autograd handles it.

---

## 7. loss functions

The scalar you call `.backward()` on.

```python
def mse_loss(input, target):
    return ((input - target) ** 2).mean()
```

MSE is a one-liner. Gradients flow through `mean`, `**`, and `-` with no extra code. BCE is similar (clamp inputs to avoid `log(0)`, apply the binary cross-entropy formula). The interesting one is [cross-entropy](/blog/math#cross-entropy-loss-code):

```python
def cross_entropy_loss(input, target):
    if target.data.ndim == 1 or (target.data.ndim == 2 and target.data.shape[1] == 1):
        labels = target.data.flatten().astype(np.int64)
        one_hot = np.zeros((input.data.shape[0], input.data.shape[1]), dtype=np.float32)
        one_hot[np.arange(len(labels)), labels] = 1.0
        target = Tensor(one_hot, requires_grad=False)

    log_probs = F.log_softmax(input, axis=1)
    N = input.data.shape[0]
    return (-log_probs * target).sum() / N
```

It accepts either integer class labels or one-hot vectors. If you pass labels, it converts them to one-hot first. Then it uses `log_softmax`, not `log(softmax(x))`. Why? Softmax can round a small probability to 0, and the log of a number near 0 is a huge negative number. The `log_softmax` function fuses the two operations and uses the log-sum-exp trick to stay stable.

The formula is:

$$
\text{CE} = -\frac{1}{N}\sum_i \sum_c y_{ic} \log \text{softmax}(x_i)_c
$$

Since $y$ is one-hot, this simplifies to picking out the log-probability of the correct class.

---

## 8. optimizers

Takes gradients from `.backward()` and updates parameters.

### SGD with momentum

Vanilla [SGD](/blog/nn#stochastic-gradient-descent): $\theta \leftarrow \theta - \alpha \nabla L$. Momentum adds a velocity term:

$$
v_t = \mu \cdot v_{t-1} + g_t
$$
$$
\theta_t = \theta_{t-1} - \alpha \cdot v_t
$$

where $\mu$ is the momentum coefficient (typically 0.9), $g_t$ is the current gradient, and $\alpha$ is the learning rate.

```python
class SGD(Optimizer):
    def __init__(self, params, lr=1e-3, momentum=0.0, weight_decay=0.0):
        super().__init__(params, lr, weight_decay)
        self.momentum = momentum
        self.velocities = [np.zeros_like(p.data) for p in self.params]

    def step(self):
        for p, v in zip(self.params, self.velocities):
            if not p.requires_grad or p.grad is None:
                continue
            grad = p.grad.copy()
            if self.weight_decay:
                grad = grad + self.weight_decay * p.data
            v[:] = self.momentum * v + grad
            p.data -= self.lr * v
```

Momentum is a ball rolling downhill. If the gradient keeps pointing the same direction, velocity builds. If it oscillates, opposing contributions cancel out.

### Adam

**Adam** (Adaptive Moment Estimation) tracks both the first moment (mean) and second moment (uncentered variance) of the gradients:

$$
m_t = \beta_1 m_{t-1} + (1 - \beta_1) g_t
$$
$$
v_t = \beta_2 v_{t-1} + (1 - \beta_2) g_t^2
$$

These estimates are biased toward zero at the start (since they're initialized to zero), so we apply bias correction:

$$
\hat{m}_t = \frac{m_t}{1 - \beta_1^t} \qquad \hat{v}_t = \frac{v_t}{1 - \beta_2^t}
$$

Then update:

$$
\theta_t = \theta_{t-1} - \alpha \cdot \frac{\hat{m}_t}{\sqrt{\hat{v}_t} + \epsilon}
$$

```python
class Adam(Optimizer):
    def __init__(self, params, lr=1e-3, betas=(0.9, 0.999), eps=1e-8, weight_decay=0.0):
        super().__init__(params, lr, weight_decay)
        self.beta1, self.beta2 = betas
        self.eps = eps
        self.t = 0
        self.m = [np.zeros_like(p.data) for p in self.params]
        self.v = [np.zeros_like(p.data) for p in self.params]

    def step(self):
        self.t += 1
        for i, p in enumerate(self.params):
            if not p.requires_grad or p.grad is None:
                continue
            grad = p.grad.copy()
            if self.weight_decay:
                grad = grad + self.weight_decay * p.data
            self.m[i] = self.beta1 * self.m[i] + (1 - self.beta1) * grad
            self.v[i] = self.beta2 * self.v[i] + (1 - self.beta2) * (grad * grad)
            m_hat = self.m[i] / (1 - self.beta1 ** self.t)
            v_hat = self.v[i] / (1 - self.beta2 ** self.t)
            p.data -= self.lr * m_hat / (np.sqrt(v_hat) + self.eps)
```

Adam adapts the step size per parameter. The division by $\sqrt{\hat{v}_t}$ cancels the scale of the gradient, so a parameter with a large, steady gradient moves about $\alpha$ per step, the same as one with a small, steady gradient. When the gradient is noisy, $\hat{m}_t$ is small compared to $\sqrt{\hat{v}_t}$, and the step gets smaller.

<svg viewBox="0 0 560 300" role="img" aria-label="Adam update for one parameter. The gradient g feeds two running averages: m with beta1 and v of g squared with beta2. Bias correction divides them by 1 minus beta to the power t. The update subtracts alpha times m hat over the square root of v hat plus epsilon. A measured first step on f of theta = (theta minus 3) squared from theta = 0 with alpha = 0.1 gives g = -6, m = -0.6, m hat = -6, v = 0.036, v hat = 36 and theta = 0.1" style="width:100%;max-width:520px;height:auto;display:block;margin:24px auto;font-family:var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif">
  <style>
    .ad-0 { animation: ad-0 9s infinite; } @keyframes ad-0 { 0%, 2% { opacity: 0; } 5%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ad-1 { animation: ad-1 9s infinite; } @keyframes ad-1 { 0%, 15% { opacity: 0; } 18%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ad-2 { animation: ad-2 9s infinite; } @keyframes ad-2 { 0%, 30% { opacity: 0; } 33%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ad-3 { animation: ad-3 9s infinite; } @keyframes ad-3 { 0%, 45% { opacity: 0; } 48%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ad-4 { animation: ad-4 9s infinite; } @keyframes ad-4 { 0%, 60% { opacity: 0; } 63%, 95% { opacity: 1; } 100% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) {
      .ad-0, .ad-1, .ad-2, .ad-3, .ad-4 { animation: none; opacity: 1; }
    }
  </style>
  <defs><marker id="ad-ab" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M1,1 L8,5 L1,9" fill="none" stroke="rgba(25,113,194,1)" stroke-width="1.5"/></marker></defs>
  <g class="ad-0">
    <rect x="12" y="100" width="56" height="40" rx="10" fill="rgba(220,60,60,0.12)" stroke="rgba(220,60,60,0.8)"/><text x="40" y="125" font-size="15" font-weight="600" text-anchor="middle" fill="currentColor">g</text>
  </g>
  <g class="ad-1">
    <line x1="68" y1="112" x2="94" y2="72" stroke="rgba(25,113,194,0.8)" stroke-width="1.5" marker-end="url(#ad-ab)"/>
    <line x1="68" y1="128" x2="94" y2="168" stroke="rgba(25,113,194,0.8)" stroke-width="1.5" marker-end="url(#ad-ab)"/>
    <rect x="96" y="48" width="176" height="40" rx="10" fill="rgba(25,113,194,0.12)" stroke="rgba(25,113,194,0.8)"/><text x="184" y="73" font-size="13" text-anchor="middle" fill="currentColor">m = β₁·m + (1−β₁)·g</text>
    <rect x="96" y="152" width="176" height="40" rx="10" fill="rgba(25,113,194,0.12)" stroke="rgba(25,113,194,0.8)"/><text x="184" y="177" font-size="13" text-anchor="middle" fill="currentColor">v = β₂·v + (1−β₂)·g²</text>
    <text x="184" y="38" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">mean of g</text>
    <text x="184" y="210" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">mean of g²</text>
  </g>
  <g class="ad-2">
    <line x1="272" y1="68" x2="294" y2="68" stroke="rgba(25,113,194,0.8)" stroke-width="1.5" marker-end="url(#ad-ab)"/>
    <line x1="272" y1="172" x2="294" y2="172" stroke="rgba(25,113,194,0.8)" stroke-width="1.5" marker-end="url(#ad-ab)"/>
    <rect x="296" y="48" width="128" height="40" rx="10" fill="rgba(156,54,181,0.12)" stroke="rgba(156,54,181,0.8)"/><text x="360" y="73" font-size="13" text-anchor="middle" fill="currentColor">m̂ = m / (1−β₁ᵗ)</text>
    <rect x="296" y="152" width="128" height="40" rx="10" fill="rgba(156,54,181,0.12)" stroke="rgba(156,54,181,0.8)"/><text x="360" y="177" font-size="13" text-anchor="middle" fill="currentColor">v̂ = v / (1−β₂ᵗ)</text>
    <text x="360" y="38" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">bias correction</text>
  </g>
  <g class="ad-3">
    <line x1="424" y1="68" x2="446" y2="100" stroke="rgba(25,113,194,0.8)" stroke-width="1.5" marker-end="url(#ad-ab)"/>
    <line x1="424" y1="172" x2="446" y2="140" stroke="rgba(25,113,194,0.8)" stroke-width="1.5" marker-end="url(#ad-ab)"/>
    <rect x="448" y="92" width="100" height="56" rx="10" fill="rgba(34,158,68,0.12)" stroke="rgba(34,158,68,0.8)"/><text x="498" y="115" font-size="13" text-anchor="middle" fill="currentColor">θ −= α · m̂</text><text x="498" y="135" font-size="13" text-anchor="middle" fill="currentColor">/ (√v̂ + ε)</text>
  </g>
  <g class="ad-4">
    <text x="12" y="244" font-size="13" font-weight="600" fill="rgba(156,54,181,1)">step 1, measured: f(θ) = (θ − 3)², θ = 0, α = 0.1</text>
    <text x="12" y="266" font-size="13" fill="currentColor">g = −6 · m = −0.6 → m̂ = −6 · v = 0.036 → v̂ = 36</text>
    <text x="12" y="288" font-size="13" fill="currentColor">θ = 0 − 0.1 · (−6 / 6) = 0.1</text>
  </g>
</svg>

*Figure: Adam keeps two running averages per parameter. At step 1, `m` and `v` are 10x and 1000x too small, and bias correction scales them back. The numbers come from one `Adam.step()` in minitorch.*

minitorch also has gradient clipping (both norm and value), StepLR, and cosine annealing schedulers. The implementations are in `optim.py` 

---

## 9. convolutions

> [convolution is just matrix multiplication](https://lovellbrian.github.io/2023/10/23/Convolution.html)

Naive convolution is nested loops. Painfully slow. A standard trick is **im2col**, which turns the convolution into a matrix multiply.

### the im2col trick

A convolution with a $k \times k$ kernel takes a $k \times k$ patch of the input and dots it with the kernel. It does this at every valid position. What if we extracted *every* patch, flattened each into a row, and stacked them into a matrix? Then the convolution becomes a single matrix multiply.

For an input of shape $(N, C, H, W)$ with kernel size $(k_h, k_w)$:

1. Extract every $(C, k_h, k_w)$ patch at every valid spatial position
2. Flatten each patch into a row vector of length $C \cdot k_h \cdot k_w$
3. Stack all $N \cdot O_H \cdot O_W$ patches into a matrix
4. Multiply by the weight matrix (which has one row per output channel)

<svg viewBox="0 0 560 330" role="img" aria-label="im2col on a 4 by 4 input with values 1 to 16 and a 3 by 3 kernel with columns 1, 0, -1. The four 3 by 3 patches become the four rows of a 4 by 9 matrix. That matrix times the kernel flattened to a 9 by 1 column gives four outputs of -6, reshaped to a 2 by 2 output" style="width:100%;max-width:520px;height:auto;display:block;margin:24px auto;font-family:var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif">
  <style>
    .ic-0 { animation: ic-0 12s infinite; } @keyframes ic-0 { 0%, 2% { opacity: 0; } 5%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ic-1 { animation: ic-1 12s infinite; } @keyframes ic-1 { 0%, 12% { opacity: 0; } 15%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ic-2 { animation: ic-2 12s infinite; } @keyframes ic-2 { 0%, 22% { opacity: 0; } 25%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ic-3 { animation: ic-3 12s infinite; } @keyframes ic-3 { 0%, 32% { opacity: 0; } 35%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ic-4 { animation: ic-4 12s infinite; } @keyframes ic-4 { 0%, 42% { opacity: 0; } 45%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ic-5 { animation: ic-5 12s infinite; } @keyframes ic-5 { 0%, 55% { opacity: 0; } 58%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ic-6 { animation: ic-6 12s infinite; } @keyframes ic-6 { 0%, 70% { opacity: 0; } 73%, 95% { opacity: 1; } 100% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) {
      .ic-0, .ic-1, .ic-2, .ic-3, .ic-4, .ic-5, .ic-6 { animation: none; opacity: 1; }
    }
  </style>
  <g class="ic-0">
    <text x="12" y="40" font-size="13" font-weight="600" fill="currentColor">input 4×4</text>
    <rect x="12" y="50" width="22" height="22" fill="currentColor" fill-opacity="0.04" stroke="currentColor" stroke-opacity="0.4"/><text x="23" y="65" font-size="11" text-anchor="middle" fill="currentColor">1</text>
    <rect x="34" y="50" width="22" height="22" fill="currentColor" fill-opacity="0.04" stroke="currentColor" stroke-opacity="0.4"/><text x="45" y="65" font-size="11" text-anchor="middle" fill="currentColor">2</text>
    <rect x="56" y="50" width="22" height="22" fill="currentColor" fill-opacity="0.04" stroke="currentColor" stroke-opacity="0.4"/><text x="67" y="65" font-size="11" text-anchor="middle" fill="currentColor">3</text>
    <rect x="78" y="50" width="22" height="22" fill="currentColor" fill-opacity="0.04" stroke="currentColor" stroke-opacity="0.4"/><text x="89" y="65" font-size="11" text-anchor="middle" fill="currentColor">4</text>
    <rect x="12" y="72" width="22" height="22" fill="currentColor" fill-opacity="0.04" stroke="currentColor" stroke-opacity="0.4"/><text x="23" y="87" font-size="11" text-anchor="middle" fill="currentColor">5</text>
    <rect x="34" y="72" width="22" height="22" fill="currentColor" fill-opacity="0.04" stroke="currentColor" stroke-opacity="0.4"/><text x="45" y="87" font-size="11" text-anchor="middle" fill="currentColor">6</text>
    <rect x="56" y="72" width="22" height="22" fill="currentColor" fill-opacity="0.04" stroke="currentColor" stroke-opacity="0.4"/><text x="67" y="87" font-size="11" text-anchor="middle" fill="currentColor">7</text>
    <rect x="78" y="72" width="22" height="22" fill="currentColor" fill-opacity="0.04" stroke="currentColor" stroke-opacity="0.4"/><text x="89" y="87" font-size="11" text-anchor="middle" fill="currentColor">8</text>
    <rect x="12" y="94" width="22" height="22" fill="currentColor" fill-opacity="0.04" stroke="currentColor" stroke-opacity="0.4"/><text x="23" y="109" font-size="11" text-anchor="middle" fill="currentColor">9</text>
    <rect x="34" y="94" width="22" height="22" fill="currentColor" fill-opacity="0.04" stroke="currentColor" stroke-opacity="0.4"/><text x="45" y="109" font-size="11" text-anchor="middle" fill="currentColor">10</text>
    <rect x="56" y="94" width="22" height="22" fill="currentColor" fill-opacity="0.04" stroke="currentColor" stroke-opacity="0.4"/><text x="67" y="109" font-size="11" text-anchor="middle" fill="currentColor">11</text>
    <rect x="78" y="94" width="22" height="22" fill="currentColor" fill-opacity="0.04" stroke="currentColor" stroke-opacity="0.4"/><text x="89" y="109" font-size="11" text-anchor="middle" fill="currentColor">12</text>
    <rect x="12" y="116" width="22" height="22" fill="currentColor" fill-opacity="0.04" stroke="currentColor" stroke-opacity="0.4"/><text x="23" y="131" font-size="11" text-anchor="middle" fill="currentColor">13</text>
    <rect x="34" y="116" width="22" height="22" fill="currentColor" fill-opacity="0.04" stroke="currentColor" stroke-opacity="0.4"/><text x="45" y="131" font-size="11" text-anchor="middle" fill="currentColor">14</text>
    <rect x="56" y="116" width="22" height="22" fill="currentColor" fill-opacity="0.04" stroke="currentColor" stroke-opacity="0.4"/><text x="67" y="131" font-size="11" text-anchor="middle" fill="currentColor">15</text>
    <rect x="78" y="116" width="22" height="22" fill="currentColor" fill-opacity="0.04" stroke="currentColor" stroke-opacity="0.4"/><text x="89" y="131" font-size="11" text-anchor="middle" fill="currentColor">16</text>
    <text x="12" y="186" font-size="13" font-weight="600" fill="currentColor">kernel 3×3</text>
    <rect x="12" y="196" width="22" height="22" fill="rgba(220,160,40,0.14)" stroke="rgba(220,160,40,0.8)"/><text x="23" y="211" font-size="11" text-anchor="middle" fill="currentColor">1</text>
    <rect x="34" y="196" width="22" height="22" fill="rgba(220,160,40,0.14)" stroke="rgba(220,160,40,0.8)"/><text x="45" y="211" font-size="11" text-anchor="middle" fill="currentColor">0</text>
    <rect x="56" y="196" width="22" height="22" fill="rgba(220,160,40,0.14)" stroke="rgba(220,160,40,0.8)"/><text x="67" y="211" font-size="11" text-anchor="middle" fill="currentColor">-1</text>
    <rect x="12" y="218" width="22" height="22" fill="rgba(220,160,40,0.14)" stroke="rgba(220,160,40,0.8)"/><text x="23" y="233" font-size="11" text-anchor="middle" fill="currentColor">1</text>
    <rect x="34" y="218" width="22" height="22" fill="rgba(220,160,40,0.14)" stroke="rgba(220,160,40,0.8)"/><text x="45" y="233" font-size="11" text-anchor="middle" fill="currentColor">0</text>
    <rect x="56" y="218" width="22" height="22" fill="rgba(220,160,40,0.14)" stroke="rgba(220,160,40,0.8)"/><text x="67" y="233" font-size="11" text-anchor="middle" fill="currentColor">-1</text>
    <rect x="12" y="240" width="22" height="22" fill="rgba(220,160,40,0.14)" stroke="rgba(220,160,40,0.8)"/><text x="23" y="255" font-size="11" text-anchor="middle" fill="currentColor">1</text>
    <rect x="34" y="240" width="22" height="22" fill="rgba(220,160,40,0.14)" stroke="rgba(220,160,40,0.8)"/><text x="45" y="255" font-size="11" text-anchor="middle" fill="currentColor">0</text>
    <rect x="56" y="240" width="22" height="22" fill="rgba(220,160,40,0.14)" stroke="rgba(220,160,40,0.8)"/><text x="67" y="255" font-size="11" text-anchor="middle" fill="currentColor">-1</text>
  </g>
  <text class="ic-1" x="130" y="40" font-size="13" font-weight="600" fill="currentColor">im2col: one patch per row (4×9)</text>
  <g class="ic-1">
    <rect x="13" y="51" width="64" height="64" fill="none" stroke="rgba(220,60,60,1)" stroke-width="2"/>
    <rect x="130" y="50" width="22" height="22" fill="rgba(220,60,60,0.12)" stroke="rgba(220,60,60,0.7)"/><text x="141" y="65" font-size="11" text-anchor="middle" fill="currentColor">1</text>
    <rect x="152" y="50" width="22" height="22" fill="rgba(220,60,60,0.12)" stroke="rgba(220,60,60,0.7)"/><text x="163" y="65" font-size="11" text-anchor="middle" fill="currentColor">2</text>
    <rect x="174" y="50" width="22" height="22" fill="rgba(220,60,60,0.12)" stroke="rgba(220,60,60,0.7)"/><text x="185" y="65" font-size="11" text-anchor="middle" fill="currentColor">3</text>
    <rect x="196" y="50" width="22" height="22" fill="rgba(220,60,60,0.12)" stroke="rgba(220,60,60,0.7)"/><text x="207" y="65" font-size="11" text-anchor="middle" fill="currentColor">5</text>
    <rect x="218" y="50" width="22" height="22" fill="rgba(220,60,60,0.12)" stroke="rgba(220,60,60,0.7)"/><text x="229" y="65" font-size="11" text-anchor="middle" fill="currentColor">6</text>
    <rect x="240" y="50" width="22" height="22" fill="rgba(220,60,60,0.12)" stroke="rgba(220,60,60,0.7)"/><text x="251" y="65" font-size="11" text-anchor="middle" fill="currentColor">7</text>
    <rect x="262" y="50" width="22" height="22" fill="rgba(220,60,60,0.12)" stroke="rgba(220,60,60,0.7)"/><text x="273" y="65" font-size="11" text-anchor="middle" fill="currentColor">9</text>
    <rect x="284" y="50" width="22" height="22" fill="rgba(220,60,60,0.12)" stroke="rgba(220,60,60,0.7)"/><text x="295" y="65" font-size="11" text-anchor="middle" fill="currentColor">10</text>
    <rect x="306" y="50" width="22" height="22" fill="rgba(220,60,60,0.12)" stroke="rgba(220,60,60,0.7)"/><text x="317" y="65" font-size="11" text-anchor="middle" fill="currentColor">11</text>
  </g>
  <g class="ic-2">
    <rect x="36" y="51" width="64" height="64" fill="none" stroke="rgba(25,113,194,1)" stroke-width="2"/>
    <rect x="130" y="72" width="22" height="22" fill="rgba(25,113,194,0.12)" stroke="rgba(25,113,194,0.7)"/><text x="141" y="87" font-size="11" text-anchor="middle" fill="currentColor">2</text>
    <rect x="152" y="72" width="22" height="22" fill="rgba(25,113,194,0.12)" stroke="rgba(25,113,194,0.7)"/><text x="163" y="87" font-size="11" text-anchor="middle" fill="currentColor">3</text>
    <rect x="174" y="72" width="22" height="22" fill="rgba(25,113,194,0.12)" stroke="rgba(25,113,194,0.7)"/><text x="185" y="87" font-size="11" text-anchor="middle" fill="currentColor">4</text>
    <rect x="196" y="72" width="22" height="22" fill="rgba(25,113,194,0.12)" stroke="rgba(25,113,194,0.7)"/><text x="207" y="87" font-size="11" text-anchor="middle" fill="currentColor">6</text>
    <rect x="218" y="72" width="22" height="22" fill="rgba(25,113,194,0.12)" stroke="rgba(25,113,194,0.7)"/><text x="229" y="87" font-size="11" text-anchor="middle" fill="currentColor">7</text>
    <rect x="240" y="72" width="22" height="22" fill="rgba(25,113,194,0.12)" stroke="rgba(25,113,194,0.7)"/><text x="251" y="87" font-size="11" text-anchor="middle" fill="currentColor">8</text>
    <rect x="262" y="72" width="22" height="22" fill="rgba(25,113,194,0.12)" stroke="rgba(25,113,194,0.7)"/><text x="273" y="87" font-size="11" text-anchor="middle" fill="currentColor">10</text>
    <rect x="284" y="72" width="22" height="22" fill="rgba(25,113,194,0.12)" stroke="rgba(25,113,194,0.7)"/><text x="295" y="87" font-size="11" text-anchor="middle" fill="currentColor">11</text>
    <rect x="306" y="72" width="22" height="22" fill="rgba(25,113,194,0.12)" stroke="rgba(25,113,194,0.7)"/><text x="317" y="87" font-size="11" text-anchor="middle" fill="currentColor">12</text>
  </g>
  <g class="ic-3">
    <rect x="13" y="74" width="64" height="64" fill="none" stroke="rgba(34,158,68,1)" stroke-width="2"/>
    <rect x="130" y="94" width="22" height="22" fill="rgba(34,158,68,0.12)" stroke="rgba(34,158,68,0.7)"/><text x="141" y="109" font-size="11" text-anchor="middle" fill="currentColor">5</text>
    <rect x="152" y="94" width="22" height="22" fill="rgba(34,158,68,0.12)" stroke="rgba(34,158,68,0.7)"/><text x="163" y="109" font-size="11" text-anchor="middle" fill="currentColor">6</text>
    <rect x="174" y="94" width="22" height="22" fill="rgba(34,158,68,0.12)" stroke="rgba(34,158,68,0.7)"/><text x="185" y="109" font-size="11" text-anchor="middle" fill="currentColor">7</text>
    <rect x="196" y="94" width="22" height="22" fill="rgba(34,158,68,0.12)" stroke="rgba(34,158,68,0.7)"/><text x="207" y="109" font-size="11" text-anchor="middle" fill="currentColor">9</text>
    <rect x="218" y="94" width="22" height="22" fill="rgba(34,158,68,0.12)" stroke="rgba(34,158,68,0.7)"/><text x="229" y="109" font-size="11" text-anchor="middle" fill="currentColor">10</text>
    <rect x="240" y="94" width="22" height="22" fill="rgba(34,158,68,0.12)" stroke="rgba(34,158,68,0.7)"/><text x="251" y="109" font-size="11" text-anchor="middle" fill="currentColor">11</text>
    <rect x="262" y="94" width="22" height="22" fill="rgba(34,158,68,0.12)" stroke="rgba(34,158,68,0.7)"/><text x="273" y="109" font-size="11" text-anchor="middle" fill="currentColor">13</text>
    <rect x="284" y="94" width="22" height="22" fill="rgba(34,158,68,0.12)" stroke="rgba(34,158,68,0.7)"/><text x="295" y="109" font-size="11" text-anchor="middle" fill="currentColor">14</text>
    <rect x="306" y="94" width="22" height="22" fill="rgba(34,158,68,0.12)" stroke="rgba(34,158,68,0.7)"/><text x="317" y="109" font-size="11" text-anchor="middle" fill="currentColor">15</text>
  </g>
  <g class="ic-4">
    <rect x="36" y="74" width="64" height="64" fill="none" stroke="rgba(156,54,181,1)" stroke-width="2"/>
    <rect x="130" y="116" width="22" height="22" fill="rgba(156,54,181,0.12)" stroke="rgba(156,54,181,0.7)"/><text x="141" y="131" font-size="11" text-anchor="middle" fill="currentColor">6</text>
    <rect x="152" y="116" width="22" height="22" fill="rgba(156,54,181,0.12)" stroke="rgba(156,54,181,0.7)"/><text x="163" y="131" font-size="11" text-anchor="middle" fill="currentColor">7</text>
    <rect x="174" y="116" width="22" height="22" fill="rgba(156,54,181,0.12)" stroke="rgba(156,54,181,0.7)"/><text x="185" y="131" font-size="11" text-anchor="middle" fill="currentColor">8</text>
    <rect x="196" y="116" width="22" height="22" fill="rgba(156,54,181,0.12)" stroke="rgba(156,54,181,0.7)"/><text x="207" y="131" font-size="11" text-anchor="middle" fill="currentColor">10</text>
    <rect x="218" y="116" width="22" height="22" fill="rgba(156,54,181,0.12)" stroke="rgba(156,54,181,0.7)"/><text x="229" y="131" font-size="11" text-anchor="middle" fill="currentColor">11</text>
    <rect x="240" y="116" width="22" height="22" fill="rgba(156,54,181,0.12)" stroke="rgba(156,54,181,0.7)"/><text x="251" y="131" font-size="11" text-anchor="middle" fill="currentColor">12</text>
    <rect x="262" y="116" width="22" height="22" fill="rgba(156,54,181,0.12)" stroke="rgba(156,54,181,0.7)"/><text x="273" y="131" font-size="11" text-anchor="middle" fill="currentColor">14</text>
    <rect x="284" y="116" width="22" height="22" fill="rgba(156,54,181,0.12)" stroke="rgba(156,54,181,0.7)"/><text x="295" y="131" font-size="11" text-anchor="middle" fill="currentColor">15</text>
    <rect x="306" y="116" width="22" height="22" fill="rgba(156,54,181,0.12)" stroke="rgba(156,54,181,0.7)"/><text x="317" y="131" font-size="11" text-anchor="middle" fill="currentColor">16</text>
  </g>
  <g class="ic-5">
    <text x="338" y="110" font-size="16" text-anchor="middle" fill="currentColor">@</text>
    <text x="362" y="40" font-size="13" font-weight="600" text-anchor="middle" fill="currentColor">9×1</text>
    <rect x="351" y="50" width="22" height="22" fill="rgba(220,160,40,0.14)" stroke="rgba(220,160,40,0.8)"/><text x="362" y="65" font-size="11" text-anchor="middle" fill="currentColor">1</text>
    <rect x="351" y="72" width="22" height="22" fill="rgba(220,160,40,0.14)" stroke="rgba(220,160,40,0.8)"/><text x="362" y="87" font-size="11" text-anchor="middle" fill="currentColor">0</text>
    <rect x="351" y="94" width="22" height="22" fill="rgba(220,160,40,0.14)" stroke="rgba(220,160,40,0.8)"/><text x="362" y="109" font-size="11" text-anchor="middle" fill="currentColor">-1</text>
    <rect x="351" y="116" width="22" height="22" fill="rgba(220,160,40,0.14)" stroke="rgba(220,160,40,0.8)"/><text x="362" y="131" font-size="11" text-anchor="middle" fill="currentColor">1</text>
    <rect x="351" y="138" width="22" height="22" fill="rgba(220,160,40,0.14)" stroke="rgba(220,160,40,0.8)"/><text x="362" y="153" font-size="11" text-anchor="middle" fill="currentColor">0</text>
    <rect x="351" y="160" width="22" height="22" fill="rgba(220,160,40,0.14)" stroke="rgba(220,160,40,0.8)"/><text x="362" y="175" font-size="11" text-anchor="middle" fill="currentColor">-1</text>
    <rect x="351" y="182" width="22" height="22" fill="rgba(220,160,40,0.14)" stroke="rgba(220,160,40,0.8)"/><text x="362" y="197" font-size="11" text-anchor="middle" fill="currentColor">1</text>
    <rect x="351" y="204" width="22" height="22" fill="rgba(220,160,40,0.14)" stroke="rgba(220,160,40,0.8)"/><text x="362" y="219" font-size="11" text-anchor="middle" fill="currentColor">0</text>
    <rect x="351" y="226" width="22" height="22" fill="rgba(220,160,40,0.14)" stroke="rgba(220,160,40,0.8)"/><text x="362" y="241" font-size="11" text-anchor="middle" fill="currentColor">-1</text>
    <text x="388" y="110" font-size="16" text-anchor="middle" fill="currentColor">=</text>
  </g>
  <g class="ic-6">
    <text x="413" y="40" font-size="13" font-weight="600" text-anchor="middle" fill="currentColor">4×1</text>
    <rect x="402" y="50" width="22" height="22" fill="rgba(220,60,60,0.12)" stroke="rgba(220,60,60,0.7)"/><text x="413" y="65" font-size="11" text-anchor="middle" fill="currentColor">-6</text>
    <rect x="402" y="72" width="22" height="22" fill="rgba(25,113,194,0.12)" stroke="rgba(25,113,194,0.7)"/><text x="413" y="87" font-size="11" text-anchor="middle" fill="currentColor">-6</text>
    <rect x="402" y="94" width="22" height="22" fill="rgba(34,158,68,0.12)" stroke="rgba(34,158,68,0.7)"/><text x="413" y="109" font-size="11" text-anchor="middle" fill="currentColor">-6</text>
    <rect x="402" y="116" width="22" height="22" fill="rgba(156,54,181,0.12)" stroke="rgba(156,54,181,0.7)"/><text x="413" y="131" font-size="11" text-anchor="middle" fill="currentColor">-6</text>
    <line x1="430" y1="94" x2="462" y2="94" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.5"/>
    <text x="446" y="86" font-size="11" text-anchor="middle" fill="currentColor" fill-opacity="0.7">reshape</text>
    <text x="500" y="40" font-size="13" font-weight="600" text-anchor="middle" fill="currentColor">output 2×2</text>
    <rect x="470" y="64" width="30" height="30" fill="rgba(220,60,60,0.12)" stroke="rgba(220,60,60,0.7)"/><text x="485" y="83" font-size="11" text-anchor="middle" fill="currentColor">-6</text>
    <rect x="500" y="64" width="30" height="30" fill="rgba(25,113,194,0.12)" stroke="rgba(25,113,194,0.7)"/><text x="515" y="83" font-size="11" text-anchor="middle" fill="currentColor">-6</text>
    <rect x="470" y="94" width="30" height="30" fill="rgba(34,158,68,0.12)" stroke="rgba(34,158,68,0.7)"/><text x="485" y="113" font-size="11" text-anchor="middle" fill="currentColor">-6</text>
    <rect x="500" y="94" width="30" height="30" fill="rgba(156,54,181,0.12)" stroke="rgba(156,54,181,0.7)"/><text x="515" y="113" font-size="11" text-anchor="middle" fill="currentColor">-6</text>
    <text x="130" y="290" font-size="13" fill="currentColor">row 1 · kernel = (1 − 3) + (5 − 7) + (9 − 11) = −6</text>
    <text x="130" y="312" font-size="13" fill="currentColor" fill-opacity="0.7">same numbers as im2col() and Conv2d in minitorch</text>
  </g>
</svg>

*Figure: im2col on a 4×4 input with a 3×3 kernel. Each 3×3 patch becomes one row of a 4×9 matrix. One matrix multiply with the flattened kernel gives all four outputs, and a reshape gives the 2×2 output map.*

```python
def im2col(input_data, kh, kw, stride, padding):
    N, C, H, W = input_data.shape
    if padding > 0:
        input_data = np.pad(input_data, ((0, 0), (0, 0), (padding, padding), (padding, padding)))
    _, _, H_pad, W_pad = input_data.shape
    OH = (H_pad - kh) // stride + 1
    OW = (W_pad - kw) // stride + 1

    cols = np.zeros((N, C, kh, kw, OH, OW), dtype=input_data.dtype)
    for y in range(kh):
        y_max = y + stride * OH
        for x in range(kw):
            x_max = x + stride * OW
            cols[:, :, y, x, :, :] = input_data[:, :, y:y_max:stride, x:x_max:stride]

    return cols.transpose(0, 4, 5, 1, 2, 3).reshape(N * OH * OW, -1)
```

The loops here are over the kernel dimensions ($k_h \times k_w$), not over the spatial dimensions. For a $3 \times 3$ kernel, that's only 9 iterations regardless of image size. Each iteration uses one strided NumPy slice to copy the values at one kernel position from every patch, batch element and channel at once. NumPy does the "expensive" spatial iteration inside that slice, in C.

The final `reshape` flattens each patch into a row, giving us a matrix of shape $(N \cdot O_H \cdot O_W, C \cdot k_h \cdot k_w)$.

**col2im** is the inverse operation, used in the backward pass. It takes the column matrix and scatters it back into the spatial format. The code mirrors `im2col` line for line: it undoes the reshape and transpose, runs the same 9-iteration loop over kernel positions, and cuts off the padding. The one real difference is the scatter line:

```python
img[:, :, y:y_max:stride, x:x_max:stride] += cols[:, :, y, x, :, :]
```

Note the `+=` instead of `=`. When the stride is smaller than the kernel, adjacent patches overlap, so the same input position contributes to multiple output positions. In the backward pass, we need to accumulate all those gradient contributions.

### Conv2d

With im2col, the Conv2d forward pass is clean:

```python
class Conv2d(Module):
    def __init__(self, in_channels, out_channels, kernel_size, stride=1, padding=0):
        super().__init__()
        self.in_channels = in_channels
        self.out_channels = out_channels
        self.kernel_size = kernel_size if isinstance(kernel_size, tuple) else (kernel_size, kernel_size)
        self.stride = stride
        self.padding = padding

        kh, kw = self.kernel_size
        fan_in = in_channels * kh * kw
        scale = np.sqrt(2.0 / fan_in)
        self.weight = Tensor(
            (np.random.randn(out_channels, in_channels * kh * kw) * scale).astype(np.float32),
            requires_grad=True
        )
        self.bias = Tensor(np.zeros(out_channels, dtype=np.float32), requires_grad=True)
```

Notice the weight shape: `(out_channels, in_channels * kh * kw)`. We store the kernel *already flattened* for the matrix multiply. Kaiming initialization with `fan_in = in_channels * kh * kw`.

```python
    def forward(self, x):
        N, C, H, W = x.data.shape
        kh, kw = self.kernel_size
        OH = (H + 2 * self.padding - kh) // self.stride + 1
        OW = (W + 2 * self.padding - kw) // self.stride + 1

        cols = im2col(x.data, kh, kw, self.stride, self.padding)
        out_data = cols @ self.weight.data.T + self.bias.data
        out_data = out_data.reshape(N, OH, OW, self.out_channels).transpose(0, 3, 1, 2)
        out = Tensor(
            out_data,
            requires_grad=x.requires_grad or self.weight.requires_grad or self.bias.requires_grad,
        )
```

The forward pass is three lines of real work:
1. `im2col` extracts patches into a matrix
2. Matrix multiply with transposed weights, add bias
3. Reshape and transpose back to $(N, C_{out}, O_H, O_W)$

The backward pass reverses this:

```python
        def _backward():
            dout = out.grad.transpose(0, 2, 3, 1).reshape(-1, self.out_channels)

            if self.weight.requires_grad:
                _accum_grad(self.weight, dout.T @ cols)

            if self.bias.requires_grad:
                _accum_grad(self.bias, dout.sum(axis=0))

            if x.requires_grad:
                dcols = dout @ self.weight.data
                dx = col2im(dcols, x.data.shape, kh, kw, self.stride, self.padding)
                _accum_grad(x, dx)
```

This is the same pattern as the matmul backward. The weight gradient is `dout.T @ cols`. The input gradient goes through `col2im` to scatter back to the spatial format.

The conv backward was the hardest part of the entire project. The im2col data has shape `(N, C, kh, kw, OH, OW)` and needs a specific transpose order before reshaping. I had the axes wrong for three days. The forward pass worked fine, gradient checking would fail, and the error message was just "max diff = 847.3". Not helpful. The fix was the axis order: `.transpose(0, 4, 5, 1, 2, 3)` puts `N, OH, OW` first and `C, kh, kw` last, so each row is one patch. I only figured it out by writing out the shape at each step on paper.

### MaxPool2d

Max pooling extracts non-overlapping (or overlapping) patches and takes the maximum of each. The forward pass uses NumPy's **stride tricks** to create a view of all patches without copying data:

```python
class MaxPool2d(Module):
    def __init__(self, kernel_size, stride=None):
        super().__init__()
        self.kernel_size = kernel_size if isinstance(kernel_size, tuple) else (kernel_size, kernel_size)
        self.stride = stride if stride is not None else self.kernel_size[0]

    def forward(self, x):
        N, C, H, W = x.data.shape
        kh, kw = self.kernel_size
        s = self.stride
        OH = (H - kh) // s + 1
        OW = (W - kw) // s + 1

        strides = x.data.strides
        patches = np.lib.stride_tricks.as_strided(
            x.data,
            shape=(N, C, OH, OW, kh, kw),
            strides=(strides[0], strides[1], strides[2] * s, strides[3] * s, strides[2], strides[3])
        )
        out_data = patches.max(axis=(4, 5))
        out = Tensor(out_data, requires_grad=x.requires_grad)
        saved_patches = patches.copy()
```

`as_strided` creates a *[view](/blog/torch#views-vs-copies)* into the same memory with custom strides. We see the data as patches without copying anything. The backward pass needs the patches later, so the forward pass keeps one copy in `saved_patches`.

The backward pass needs to route gradients only through the positions that were the maximum:

```python
        def _backward():
            if x.requires_grad:
                if x.grad is None:
                    x.grad = np.zeros_like(x.data)
                max_vals = out.data[:, :, :, :, None, None]
                mask = (saved_patches == max_vals).astype(np.float32)
                mask_sum = mask.sum(axis=(4, 5), keepdims=True)
                mask = mask / np.maximum(mask_sum, 1.0)
                weighted = mask * out.grad[:, :, :, :, None, None]
                for i in range(kh):
                    for j in range(kw):
                        x.grad[:, :, i:i+s*OH:s, j:j+s*OW:s] += weighted[:, :, :, :, i, j]
```

The mask identifies which input positions were the maximum. If there are ties (multiple positions equal to the max), the `mask / mask_sum` line splits the gradient evenly among them. Then the loop scatters the weighted gradients back to the input positions with strided indexing.

**Flatten** converts spatial feature maps to vectors for the fully connected layers:

```python
class Flatten(Module):
    def forward(self, x):
        batch_size = x.data.shape[0]
        return x.reshape(batch_size, -1)
```

`reshape` already has a backward closure, so Flatten gets its backward for free.

---

## 10. putting it all together

### simple regression

Learn $y = 2x + 1$:

```python
import numpy as np
from minitorch import Tensor, Sequential, Linear, SGD, mse_loss

np.random.seed(0)
x_np = np.random.rand(100, 1).astype(np.float32)
y_np = 2 * x_np + 1 + 0.1 * np.random.randn(100, 1).astype(np.float32)

x = Tensor(x_np)
y = Tensor(y_np)

model = Sequential(Linear(1, 1))
optimizer = SGD(model.parameters(), lr=0.1, momentum=0.9)

for epoch in range(100):
    pred = model(x)
    loss = mse_loss(pred, y)
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
```

Forward, loss, zero_grad, backward, step. Five lines, same whether you're fitting a line or training a [language model](/blog/microgpt). After 100 epochs this run learns a weight of 1.998 and a bias of 1.017.

### MNIST MLP

```python
def build_mlp():
    return Sequential(
        Linear(784, 128),
        ReLU(),
        Linear(128, 10),
    )
```

784 inputs (28x28 flattened), 128 hidden, 10 classes. Trained with Adam, batch size 100, 15 epochs on 10k samples, tested on 2k (`mnist_example.py`, seed 0):

```
Epoch 1/15, Loss: 0.7611
Epoch 5/15, Loss: 0.1739
Epoch 10/15, Loss: 0.0755
Epoch 15/15, Loss: 0.0359
Test Accuracy: 95.15%
```

95% on MNIST with a two-layer network and 1,522 lines of framework code.

### MNIST CNN

```python
def build_cnn():
    return Sequential(
        Conv2d(1, 16, 3, padding=1),   # 28x28 -> 28x28
        ReLU(),
        MaxPool2d(2),                    # 28x28 -> 14x14
        Conv2d(16, 32, 3, padding=1),   # 14x14 -> 14x14
        ReLU(),
        MaxPool2d(2),                    # 14x14 -> 7x7
        Flatten(),                       # 32*7*7 = 1568
        Linear(1568, 128),
        ReLU(),
        Dropout(0.25),
        Linear(128, 10),
    )
```

Two conv-relu-pool blocks, flatten, two linear layers with dropout. 10 epochs on 2k samples, same test set and seed:

```
Epoch 1/10, Loss: 1.3821
Epoch 5/10, Loss: 0.1996
Epoch 10/10, Loss: 0.0777
Test Accuracy: 94.90%
```

94.9% with a CNN on only 2,000 training samples. The convolutions are doing real work: the MLP needs 5x the data to get 0.25 points more.

The training loop is the standard five-line pattern, and evaluation uses `no_grad()` to skip graph building. The API mirrors PyTorch.

---

## 11. gradient checking

The only reliable check is to compute gradients the dumb way, with finite differences, and compare them:

$$
f'(x) \approx \frac{f(x + \epsilon) - f(x - \epsilon)}{2\epsilon}
$$

This central difference has an $O(\epsilon^2)$ truncation error.

```python
def numerical_gradient(f, inputs, eps=1e-5):
    grads = []
    orig_data = [inp.data.copy() for inp in inputs]
    for inp in inputs:
        inp.data = inp.data.astype(np.float64)
    f64_data = [inp.data.copy() for inp in inputs]

    for k, inp in enumerate(inputs):
        grad = np.zeros(inp.data.shape, dtype=np.float64)
        it = np.nditer(f64_data[k], flags=['multi_index'])
        while not it.finished:
            idx = it.multi_index
            old_val = f64_data[k][idx]

            inp.data = f64_data[k].copy()
            inp.data[idx] = old_val + eps
            loss_plus = float(f().data)

            inp.data = f64_data[k].copy()
            inp.data[idx] = old_val - eps
            loss_minus = float(f().data)

            grad[idx] = (loss_plus - loss_minus) / (2 * eps)
            it.iternext()
        inp.data = f64_data[k].copy()
        grads.append(grad.astype(np.float32))

    for inp, od in zip(inputs, orig_data):
        inp.data = od
    return grads
```

Note the conversion to float64. With float32 and a small epsilon, `loss_plus - loss_minus` subtracts two almost equal numbers and loses most of its digits (catastrophic cancellation), so the result can be garbage. Float64 gives us enough precision. At the end, the function puts the original float32 data back.

The `check_gradient` function runs both the analytical backward pass and the numerical approximation, then compares with `np.allclose`:

```python
def check_gradient(f, inputs, eps=1e-5, atol=1e-4, rtol=1e-3):
    for inp in inputs:
        inp.zero_grad()
    loss = f()
    loss.backward()
    analytic = [inp.grad.copy() for inp in inputs]

    numerical = numerical_gradient(f, inputs, eps)

    for i, (a, n) in enumerate(zip(analytic, numerical)):
        if not np.allclose(a, n, atol=atol, rtol=rtol):
            max_diff = np.max(np.abs(a - n))
            raise AssertionError(
                f"Gradient check failed for input {i}: max diff = {max_diff}\n"
                f"Analytic:\n{a}\nNumerical:\n{n}"
            )
    return True
```

---

## 12. what's missing 

minitorch gets 95% on MNIST. Real PyTorch trains GPT-4. Here's the gap.

Compiled kernels are the big one. Everything here runs through interpreted Python and NumPy. A production framework compiles to C++/[CUDA](/blog/interview-questions#q4-how-does-cuda-work-what-is-flash-attention) and [fuses operations](/blog/torch#what-happens-when-you-call-torchadd) into single kernel launches. Closing this gap is a year of work minimum, also I do not CUDA (yet; I'm [learning](https://www.manning.com/books/cuda-for-deep-learning))

How slow is it, then? On a CPU, less than you'd think. I timed forward plus backward on an M4 Mac against PyTorch 2.14.1 on the CPU (4 threads, median of 20 runs):

| Workload | minitorch | PyTorch (CPU) |
|---|---|---|
| 512×512 matmul | 1.13 ms | 0.80 ms |
| MNIST MLP train step, batch 100 | 0.50 ms | 0.31 ms |
| Conv2d(1, 16, 3), batch 100, 28×28 | 3.35 ms | 3.97 ms |
| Conv2d(16, 32, 3), batch 100, 14×14 | 13.04 ms | 5.76 ms |

Fusion is where a real framework pulls ahead. Take `((x * 2 + 1).exp() * 0.5 - 1).sum()` on 4 million float32 values (16 MB). minitorch runs five elementwise ops, and each one writes a new 16 MB array. Same machine, same timing method:

| Version | Time |
|---|---|
| minitorch | 16.02 ms |
| NumPy, one new array per op | 13.18 ms |
| NumPy, one reused buffer | 7.36 ms |
| PyTorch eager (runs each op when you call it) | 4.14 ms |

Reusing one buffer almost halves the NumPy time, because memory traffic is the cost here, not math. A lazy framework sees the whole expression before it runs anything. It can then emit one kernel that reads `x` once and writes one number.

That is the main thing tinygrad does that minitorch doesn't. George Hotz's first tinygrad commit (1bb2583, 17 Oct 2020) has a 76-line `tensor.py`: a Tensor with `_prev`, plus Function classes with `forward` and `backward`. That is the same design as minitorch's closures. tinygrad at commit c015351 (Aug 2026) is about 35,000 lines of Python, without generated files. The extra code adds:

- laziness, where ops only build a graph and nothing runs until `.realize()` (`tinygrad/tensor.py`). I need to implement this soon.
- a scheduler that groups the graph into kernels (`tinygrad/schedule/`). Can do this also in the next build.
- code generation for C-style languages, PTX, LLVM IR, WGSL and AMD (`tinygrad/renderer/`). This is beyond my scope.. Last time I did C was in 3rd year.
- a JIT (`tinygrad/engine/jit.py`). Need to study JIT for this...

There is no GPU support. I tried an optional CuPy backend and removed it because it did not work. A real CUDA implementation would need custom kernels.

There are no in-place operations. Every op creates a new tensor. This simplifies the graph (no aliasing) but wastes memory. Supporting `x.add_(y)` requires version counting to detect when in-place ops invalidate the graph. Which I was unable to do. I'll get there someday... need to #lockin

Distributed training, mixed precision and JIT are each their own project. Distributed needs NCCL and gradient all-reduce. Float16 mixed precision needs loss scaling. JIT needs a tracer and compiler.

It's a cool project with a lot of scope of improvement and optimisation, which is what I'm learning right now. I'll update this when v2 comes out.

---

## 14. references

- [neural networks from scratch](/blog/nn), building a neural network without a framework
- [tensors and autograd](/blog/torch), the math behind automatic differentiation
- [backpropagation math](/blog/math), deriving the chain rule for neural networks
- [micrograd](https://github.com/karpathy/micrograd), Karpathy's scalar-valued autograd engine
- [tinygrad](https://github.com/tinygrad/tinygrad), George Hotz's minimal deep learning framework
- [PyTorch internals](http://blog.ezyang.com/2019/05/pytorch-internals/), Edward Yang's tour of PyTorch's C++ core
- [Kaiming He et al., "Delving Deep into Rectifiers"](https://arxiv.org/abs/1502.01852), the Kaiming initialization paper
- [Glorot & Bengio, "Understanding the difficulty of training deep feedforward neural networks"](https://proceedings.mlr.press/v9/glorot10a.html), the Xavier initialization paper
- [Kingma & Ba, "Adam: A Method for Stochastic Optimization"](https://arxiv.org/abs/1412.6980), the Adam optimizer paper
- [Ioffe & Szegedy, "Batch Normalization"](https://arxiv.org/abs/1502.03167), the batch normalization paper
