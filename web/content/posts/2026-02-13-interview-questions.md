---
layout: post
title: "My favourite interview questions"
date: 2026-02-13 14:06:04 +0530
categories: tech
tokens: "~6.5k"
description: "Five questions I'd ask"
tags: [interviews]
---

Because no one wants to ask the candidate to derive Kadane's algorithm in 30 minutes while pretending they've never seen it.

---

## Q1: what is the complexity of matrix multiplication? 

> O(n^3)

For two n×n matrices, each of the n² outputs is a dot product of length n: n multiplies and n adds. That is n³ multiply-adds, or 2n³ FLOPs ([what a FLOP is](/blog/scalinglaws#flops)). For n = 1024, that is 2.1 billion FLOPs.

First you check if they can even be multiplied: the columns of `a` must equal the rows of `b`. Then you create an output array to store the results. Then you run a triple loop. You'd be surprised how many people (including my roomate at IDFC bank) think it's n²

```python
import numpy as np

def matrixmul(a, b):
    m, n1 = len(a), len(a[0])
    n2, p = len(b), len(b[0])
    if n1 != n2: return -1
    # else do matrix mul
    c = [[0 for _ in range(p)] for _ in range(m)]
    for i in range(m):
        for j in range(p):
            for k in range(n1):
                c[i][j] += a[i][k] * b[k][j]
    return c

def matrixmulNumpy(a, b):
    a, b = np.array(a), np.array(b)
    if a.shape[1] != b.shape[0]: return -1
    return (a @ b).tolist()
```

How do you optimise it? Let's do a test, using this same on float32 precision, on M4 macbook (n = 1024; the pure Python version uses n = 256 because n = 1024 takes minutes):

| Version | GFLOP/s | vs Python |
|---|---|---|
| Pure Python triple loop | 0.06 | 1× |
| C, i-j-k loop, `clang -O3` | 2.45 | approximately 44× |
| C, i-k-j loop, `clang -O3` | 32.6 | approximately 580× |
| NumPy `a @ b` (Apple Accelerate BLAS) | 1,529 | approximately 27,000× |

**1. Loop order is worth 13×.** NumPy and C store matrices row by row, so accessing elements next to each other in a row is faster. In the i-j-k loop order, the code jumps around memory when reading matrix b. Each step moves 4 KB to get just 4 bytes of data. Most of the data loaded into the CPU cache goes unused.
In the i-k-j loop order, the code reads elements next to each other in a row. It makes better use of the CPU cache because almost every byte loaded gets used.  It also allows the compiler to use SIMD instructions, which perform multiple multiplications and additions in a single instruction.
We can verify this using `clang -Rpass=loop-vectorize` option: it vectorizes the i-k-j loop but not the i-j-k loop.

The result: Both loops perform the same calculations and have the same O(n³) time complexity, but changing the loop order makes the code 13× faster because it uses memory and the CPU more efficiently.

<svg viewBox="0 0 560 352" role="img" aria-label="Matrix B in row-major memory: the i-j-k loop walks down a column and touches 8 cache lines, the i-k-j loop walks along a row and touches 1" style="width:100%;max-width:520px;height:auto;display:block;margin:24px auto;font-family:var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif">
  <style>
    .ma-c0 { animation: ma-c0 9s infinite; } @keyframes ma-c0 { 0%, 5% { opacity: 0; } 7%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ma-c1 { animation: ma-c1 9s infinite; } @keyframes ma-c1 { 0%, 15% { opacity: 0; } 17%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ma-c2 { animation: ma-c2 9s infinite; } @keyframes ma-c2 { 0%, 25% { opacity: 0; } 27%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ma-c3 { animation: ma-c3 9s infinite; } @keyframes ma-c3 { 0%, 35% { opacity: 0; } 37%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ma-c4 { animation: ma-c4 9s infinite; } @keyframes ma-c4 { 0%, 45% { opacity: 0; } 47%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ma-c5 { animation: ma-c5 9s infinite; } @keyframes ma-c5 { 0%, 55% { opacity: 0; } 57%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ma-c6 { animation: ma-c6 9s infinite; } @keyframes ma-c6 { 0%, 65% { opacity: 0; } 67%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ma-c7 { animation: ma-c7 9s infinite; } @keyframes ma-c7 { 0%, 75% { opacity: 0; } 77%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ma-t1 { animation: ma-t1 9s infinite; } @keyframes ma-t1 { 0%, 85% { opacity: 0; } 87%, 95% { opacity: 1; } 100% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) {
      .ma-c0, .ma-c1, .ma-c2, .ma-c3, .ma-c4, .ma-c5, .ma-c6, .ma-c7, .ma-t1 { animation: none; opacity: 1; }
    }
  </style>
  <text x="40" y="28" font-size="14" font-weight="600" fill="currentColor">i-j-k: inner loop over k</text>
  <text x="40" y="46" font-size="12" fill="currentColor" fill-opacity="0.7">walks DOWN a column of B</text>
  <rect x="40" y="60" width="208" height="26" fill="currentColor" fill-opacity="0.08" stroke="currentColor" stroke-opacity="0.25"/>
  <line x1="66" y1="60" x2="66" y2="86" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="92" y1="60" x2="92" y2="86" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="118" y1="60" x2="118" y2="86" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="144" y1="60" x2="144" y2="86" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="170" y1="60" x2="170" y2="86" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="196" y1="60" x2="196" y2="86" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="222" y1="60" x2="222" y2="86" stroke="currentColor" stroke-opacity="0.12"/>
  <rect x="40" y="86" width="208" height="26" fill="currentColor" fill-opacity="0.04" stroke="currentColor" stroke-opacity="0.25"/>
  <line x1="66" y1="86" x2="66" y2="112" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="92" y1="86" x2="92" y2="112" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="118" y1="86" x2="118" y2="112" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="144" y1="86" x2="144" y2="112" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="170" y1="86" x2="170" y2="112" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="196" y1="86" x2="196" y2="112" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="222" y1="86" x2="222" y2="112" stroke="currentColor" stroke-opacity="0.12"/>
  <rect x="40" y="112" width="208" height="26" fill="currentColor" fill-opacity="0.08" stroke="currentColor" stroke-opacity="0.25"/>
  <line x1="66" y1="112" x2="66" y2="138" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="92" y1="112" x2="92" y2="138" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="118" y1="112" x2="118" y2="138" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="144" y1="112" x2="144" y2="138" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="170" y1="112" x2="170" y2="138" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="196" y1="112" x2="196" y2="138" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="222" y1="112" x2="222" y2="138" stroke="currentColor" stroke-opacity="0.12"/>
  <rect x="40" y="138" width="208" height="26" fill="currentColor" fill-opacity="0.04" stroke="currentColor" stroke-opacity="0.25"/>
  <line x1="66" y1="138" x2="66" y2="164" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="92" y1="138" x2="92" y2="164" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="118" y1="138" x2="118" y2="164" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="144" y1="138" x2="144" y2="164" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="170" y1="138" x2="170" y2="164" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="196" y1="138" x2="196" y2="164" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="222" y1="138" x2="222" y2="164" stroke="currentColor" stroke-opacity="0.12"/>
  <rect x="40" y="164" width="208" height="26" fill="currentColor" fill-opacity="0.08" stroke="currentColor" stroke-opacity="0.25"/>
  <line x1="66" y1="164" x2="66" y2="190" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="92" y1="164" x2="92" y2="190" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="118" y1="164" x2="118" y2="190" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="144" y1="164" x2="144" y2="190" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="170" y1="164" x2="170" y2="190" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="196" y1="164" x2="196" y2="190" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="222" y1="164" x2="222" y2="190" stroke="currentColor" stroke-opacity="0.12"/>
  <rect x="40" y="190" width="208" height="26" fill="currentColor" fill-opacity="0.04" stroke="currentColor" stroke-opacity="0.25"/>
  <line x1="66" y1="190" x2="66" y2="216" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="92" y1="190" x2="92" y2="216" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="118" y1="190" x2="118" y2="216" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="144" y1="190" x2="144" y2="216" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="170" y1="190" x2="170" y2="216" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="196" y1="190" x2="196" y2="216" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="222" y1="190" x2="222" y2="216" stroke="currentColor" stroke-opacity="0.12"/>
  <rect x="40" y="216" width="208" height="26" fill="currentColor" fill-opacity="0.08" stroke="currentColor" stroke-opacity="0.25"/>
  <line x1="66" y1="216" x2="66" y2="242" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="92" y1="216" x2="92" y2="242" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="118" y1="216" x2="118" y2="242" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="144" y1="216" x2="144" y2="242" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="170" y1="216" x2="170" y2="242" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="196" y1="216" x2="196" y2="242" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="222" y1="216" x2="222" y2="242" stroke="currentColor" stroke-opacity="0.12"/>
  <rect x="40" y="242" width="208" height="26" fill="currentColor" fill-opacity="0.04" stroke="currentColor" stroke-opacity="0.25"/>
  <line x1="66" y1="242" x2="66" y2="268" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="92" y1="242" x2="92" y2="268" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="118" y1="242" x2="118" y2="268" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="144" y1="242" x2="144" y2="268" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="170" y1="242" x2="170" y2="268" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="196" y1="242" x2="196" y2="268" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="222" y1="242" x2="222" y2="268" stroke="currentColor" stroke-opacity="0.12"/>
  <rect class="ma-c0" x="94" y="62" width="22" height="22" rx="3" fill="rgba(220,60,60,0.75)"/>
  <rect class="ma-c1" x="94" y="88" width="22" height="22" rx="3" fill="rgba(220,60,60,0.75)"/>
  <rect class="ma-c2" x="94" y="114" width="22" height="22" rx="3" fill="rgba(220,60,60,0.75)"/>
  <rect class="ma-c3" x="94" y="140" width="22" height="22" rx="3" fill="rgba(220,60,60,0.75)"/>
  <rect class="ma-c4" x="94" y="166" width="22" height="22" rx="3" fill="rgba(220,60,60,0.75)"/>
  <rect class="ma-c5" x="94" y="192" width="22" height="22" rx="3" fill="rgba(220,60,60,0.75)"/>
  <rect class="ma-c6" x="94" y="218" width="22" height="22" rx="3" fill="rgba(220,60,60,0.75)"/>
  <rect class="ma-c7" x="94" y="244" width="22" height="22" rx="3" fill="rgba(220,60,60,0.75)"/>
  <text class="ma-t1" x="40" y="292" font-size="13" font-weight="600" fill="rgba(220,60,60,1)">8 cache lines for 8 numbers</text>
  <text x="310" y="28" font-size="14" font-weight="600" fill="currentColor">i-k-j: inner loop over j</text>
  <text x="310" y="46" font-size="12" fill="currentColor" fill-opacity="0.7">walks ALONG a row of B</text>
  <rect x="310" y="60" width="208" height="26" fill="currentColor" fill-opacity="0.08" stroke="currentColor" stroke-opacity="0.25"/>
  <line x1="336" y1="60" x2="336" y2="86" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="362" y1="60" x2="362" y2="86" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="388" y1="60" x2="388" y2="86" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="414" y1="60" x2="414" y2="86" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="440" y1="60" x2="440" y2="86" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="466" y1="60" x2="466" y2="86" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="492" y1="60" x2="492" y2="86" stroke="currentColor" stroke-opacity="0.12"/>
  <rect x="310" y="86" width="208" height="26" fill="currentColor" fill-opacity="0.04" stroke="currentColor" stroke-opacity="0.25"/>
  <line x1="336" y1="86" x2="336" y2="112" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="362" y1="86" x2="362" y2="112" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="388" y1="86" x2="388" y2="112" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="414" y1="86" x2="414" y2="112" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="440" y1="86" x2="440" y2="112" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="466" y1="86" x2="466" y2="112" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="492" y1="86" x2="492" y2="112" stroke="currentColor" stroke-opacity="0.12"/>
  <rect x="310" y="112" width="208" height="26" fill="currentColor" fill-opacity="0.08" stroke="currentColor" stroke-opacity="0.25"/>
  <line x1="336" y1="112" x2="336" y2="138" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="362" y1="112" x2="362" y2="138" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="388" y1="112" x2="388" y2="138" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="414" y1="112" x2="414" y2="138" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="440" y1="112" x2="440" y2="138" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="466" y1="112" x2="466" y2="138" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="492" y1="112" x2="492" y2="138" stroke="currentColor" stroke-opacity="0.12"/>
  <rect x="310" y="138" width="208" height="26" fill="currentColor" fill-opacity="0.04" stroke="currentColor" stroke-opacity="0.25"/>
  <line x1="336" y1="138" x2="336" y2="164" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="362" y1="138" x2="362" y2="164" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="388" y1="138" x2="388" y2="164" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="414" y1="138" x2="414" y2="164" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="440" y1="138" x2="440" y2="164" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="466" y1="138" x2="466" y2="164" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="492" y1="138" x2="492" y2="164" stroke="currentColor" stroke-opacity="0.12"/>
  <rect x="310" y="164" width="208" height="26" fill="currentColor" fill-opacity="0.08" stroke="currentColor" stroke-opacity="0.25"/>
  <line x1="336" y1="164" x2="336" y2="190" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="362" y1="164" x2="362" y2="190" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="388" y1="164" x2="388" y2="190" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="414" y1="164" x2="414" y2="190" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="440" y1="164" x2="440" y2="190" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="466" y1="164" x2="466" y2="190" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="492" y1="164" x2="492" y2="190" stroke="currentColor" stroke-opacity="0.12"/>
  <rect x="310" y="190" width="208" height="26" fill="currentColor" fill-opacity="0.04" stroke="currentColor" stroke-opacity="0.25"/>
  <line x1="336" y1="190" x2="336" y2="216" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="362" y1="190" x2="362" y2="216" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="388" y1="190" x2="388" y2="216" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="414" y1="190" x2="414" y2="216" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="440" y1="190" x2="440" y2="216" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="466" y1="190" x2="466" y2="216" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="492" y1="190" x2="492" y2="216" stroke="currentColor" stroke-opacity="0.12"/>
  <rect x="310" y="216" width="208" height="26" fill="currentColor" fill-opacity="0.08" stroke="currentColor" stroke-opacity="0.25"/>
  <line x1="336" y1="216" x2="336" y2="242" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="362" y1="216" x2="362" y2="242" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="388" y1="216" x2="388" y2="242" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="414" y1="216" x2="414" y2="242" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="440" y1="216" x2="440" y2="242" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="466" y1="216" x2="466" y2="242" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="492" y1="216" x2="492" y2="242" stroke="currentColor" stroke-opacity="0.12"/>
  <rect x="310" y="242" width="208" height="26" fill="currentColor" fill-opacity="0.04" stroke="currentColor" stroke-opacity="0.25"/>
  <line x1="336" y1="242" x2="336" y2="268" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="362" y1="242" x2="362" y2="268" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="388" y1="242" x2="388" y2="268" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="414" y1="242" x2="414" y2="268" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="440" y1="242" x2="440" y2="268" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="466" y1="242" x2="466" y2="268" stroke="currentColor" stroke-opacity="0.12"/>
  <line x1="492" y1="242" x2="492" y2="268" stroke="currentColor" stroke-opacity="0.12"/>
  <rect class="ma-c0" x="312" y="114" width="22" height="22" rx="3" fill="rgba(34,158,68,0.75)"/>
  <rect class="ma-c1" x="338" y="114" width="22" height="22" rx="3" fill="rgba(34,158,68,0.75)"/>
  <rect class="ma-c2" x="364" y="114" width="22" height="22" rx="3" fill="rgba(34,158,68,0.75)"/>
  <rect class="ma-c3" x="390" y="114" width="22" height="22" rx="3" fill="rgba(34,158,68,0.75)"/>
  <rect class="ma-c4" x="416" y="114" width="22" height="22" rx="3" fill="rgba(34,158,68,0.75)"/>
  <rect class="ma-c5" x="442" y="114" width="22" height="22" rx="3" fill="rgba(34,158,68,0.75)"/>
  <rect class="ma-c6" x="468" y="114" width="22" height="22" rx="3" fill="rgba(34,158,68,0.75)"/>
  <rect class="ma-c7" x="494" y="114" width="22" height="22" rx="3" fill="rgba(34,158,68,0.75)"/>
  <text class="ma-t1" x="310" y="292" font-size="13" font-weight="600" fill="rgba(34,158,68,1)">1 cache line for 8 numbers</text>
  <text x="280" y="320" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">Each band is one row of B, contiguous in memory. Measured on an M4 (n = 1024):</text>
  <text x="280" y="338" font-size="13" font-weight="600" text-anchor="middle" fill="currentColor">i-j-k 2.45 GFLOP/s · i-k-j 32.6 GFLOP/s</text>
</svg>

*Figure: why the inner loop order matters. Each band is one row of `b`, contiguous in memory. Walking down a column touches a new cache line for every number.*

**2. Tiling** Compute `c` in 64×64 blocks so the working set stays in cache. 

**3. Let BLAS do it.** When you write `a @ b` in NumPy, you are not running Python. NumPy calls BLAS (Basic Linear Algebra Subprograms), they are another 47× faster than my best loop. They keep a small block of `c` in registers so that each loaded number feeds many multiply-adds, they pack tiles into contiguous buffers, they use SIMD, and they use every core. Python only makes the call.

```python
import numpy as np
import time

n = 1024
a, b = np.random.rand(n, n).astype(np.float32), np.random.rand(n, n).astype(np.float32)

start = time.perf_counter()
c = a @ b
t = time.perf_counter() - start
print(f"numpy (BLAS) {n}x{n}: {t*1e3:.2f} ms, {2*n**3/t/1e9:.0f} GFLOP/s")

# now try the naive python triple loop with n=1024 and see how long you have to wait...
```

**What about Strassen's Algorithm?** No one really remembers, it's anyway O(n^2.807) and I don't like to ask algorithmic cramming questions.. because I don't know them.

---

## Q2: given a function that generates a random number between 0 and 1 (uniformly distributed), calculate pi.

> first response when I ask this is "what??"

Draw a unit square. Now draw a quarter circle of radius 1 inside it, center at the origin.

The area of the square is 1. The area of the quarter circle will be area of circle divided by 4::  $\pi r^2 / 4 = \pi / 4$.

Now throw random points at the square. Because points uniformly distributed at random, the the probability of a point landing inside the quarter circle is area of quarter circle / area of square. The point obviously has (x, y) and if $x^2 + y^2 \le 1$, the point landed inside the quarter circle. The fraction of point inside converges to the ratio of the areas, $\pi / 4$, which is almost 79% which means 79% of points should land inside quarter circle, which means if you throw 1000 points, 790 are inside, 210 on the outside, get the ratio: 3.76.. yo that's close to the number pi.

So $\pi = 4 \times \text{inside} / \text{total}$. 

```python
import random

def estimate_pi(n):
    inside = 0
    for _ in range(n):
        x, y = random.random(), random.random()
        if x**2 + y**2 <= 1:
            inside += 1
    return 4 * inside / n

# more darts = better estimate
for n in [100, 1_000, 10_000, 100_000, 1_000_000]:
    print(f"n={n:>10,} -> pi = {estimate_pi(n):.6f}")
```

<svg viewBox="0 0 560 350" role="img" aria-label="Monte Carlo estimate of pi: random darts in a unit square, the fraction inside the quarter circle times 4 approaches pi" style="width:100%;max-width:520px;height:auto;display:block;margin:24px auto;font-family:var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif">
  <style>
    .mc-b0 { animation: mc-b0 10s infinite; } @keyframes mc-b0 { 0%, 5% { opacity: 0; } 7%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .mc-b1 { animation: mc-b1 10s infinite; } @keyframes mc-b1 { 0%, 27% { opacity: 0; } 29%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .mc-b2 { animation: mc-b2 10s infinite; } @keyframes mc-b2 { 0%, 49% { opacity: 0; } 51%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .mc-b3 { animation: mc-b3 10s infinite; } @keyframes mc-b3 { 0%, 71% { opacity: 0; } 73%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .mc-e0 { animation: mc-e0 10s infinite; } @keyframes mc-e0 { 0%, 5% { opacity: 0; } 7%, 25% { opacity: 1; } 27%, 100% { opacity: 0; } }
    .mc-e1 { animation: mc-e1 10s infinite; } @keyframes mc-e1 { 0%, 27% { opacity: 0; } 29%, 47% { opacity: 1; } 49%, 100% { opacity: 0; } }
    .mc-e2 { animation: mc-e2 10s infinite; } @keyframes mc-e2 { 0%, 49% { opacity: 0; } 51%, 69% { opacity: 1; } 71%, 100% { opacity: 0; } }
    .mc-e3 { animation: mc-e3 10s infinite; } @keyframes mc-e3 { 0%, 71% { opacity: 0; } 73%, 95% { opacity: 1; } 97%, 100% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) {
      .mc-b0, .mc-b1, .mc-b2, .mc-b3, .mc-e3 { animation: none; opacity: 1; }
      .mc-e0, .mc-e1, .mc-e2 { animation: none; opacity: 0; }
    }
  </style>
  <rect x="40" y="30" width="280" height="280" fill="currentColor" fill-opacity="0.04" stroke="currentColor" stroke-opacity="0.4"/>
  <path d="M40 30 A280 280 0 0 1 320 310" fill="none" stroke="currentColor" stroke-opacity="0.6" stroke-width="1.5"/>
  <text x="40" y="328" font-size="11" text-anchor="middle" fill="currentColor" fill-opacity="0.7">0</text><text x="320" y="328" font-size="11" text-anchor="middle" fill="currentColor" fill-opacity="0.7">1</text><text x="30" y="34" font-size="11" text-anchor="end" fill="currentColor" fill-opacity="0.7">1</text>
  <g class="mc-b0"><circle cx="215.0" cy="58.8" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="257.2" cy="246.9" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="124.0" cy="65.4" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="41.5" cy="80.1" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="263.2" cy="179.0" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="124.8" cy="232.0" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="111.4" cy="185.4" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="181.3" cy="155.0" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="318.7" cy="88.1" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="214.2" cy="33.1" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="100.3" cy="265.1" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="211.5" cy="297.7" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="50.0" cy="165.8" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="170.5" cy="53.2" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="216.2" cy="166.0" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="179.1" cy="240.7" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="43.3" cy="256.1" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="233.8" cy="253.8" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="143.5" cy="309.0" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="272.4" cy="266.8" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="114.9" cy="63.5" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="182.7" cy="72.8" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="219.1" cy="102.3" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="65.6" cy="158.5" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="182.2" cy="66.0" r="3" fill="rgba(220,60,60,0.85)"/></g>
  <g class="mc-e0"><text x="350" y="120" font-size="14" fill="currentColor">darts: 25</text><text x="350" y="146" font-size="14" fill="currentColor">inside: <tspan fill="rgba(34,158,68,1)" font-weight="600">20</tspan></text><text x="350" y="186" font-size="20" font-weight="600" fill="currentColor">π ≈ 4 × 20/25</text><text x="350" y="214" font-size="20" font-weight="600" fill="currentColor">= 3.20</text></g>
  <g class="mc-b1"><circle cx="141.2" cy="142.5" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="56.6" cy="201.5" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="130.5" cy="267.9" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="268.6" cy="203.8" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="314.0" cy="144.8" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="209.4" cy="131.4" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="229.4" cy="267.8" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="163.3" cy="242.9" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="152.7" cy="282.9" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="311.0" cy="249.8" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="228.1" cy="225.9" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="284.7" cy="124.6" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="76.9" cy="73.4" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="304.6" cy="56.9" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="199.5" cy="269.3" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="93.9" cy="50.2" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="194.7" cy="259.4" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="287.5" cy="130.4" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="199.5" cy="204.6" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="155.1" cy="242.9" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="50.7" cy="64.7" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="171.0" cy="156.7" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="130.2" cy="99.6" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="47.1" cy="205.8" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="48.5" cy="275.6" r="3" fill="rgba(34,158,68,0.85)"/></g>
  <g class="mc-e1"><text x="350" y="120" font-size="14" fill="currentColor">darts: 50</text><text x="350" y="146" font-size="14" fill="currentColor">inside: <tspan fill="rgba(34,158,68,1)" font-weight="600">41</tspan></text><text x="350" y="186" font-size="20" font-weight="600" fill="currentColor">π ≈ 4 × 41/50</text><text x="350" y="214" font-size="20" font-weight="600" fill="currentColor">= 3.28</text></g>
  <g class="mc-b2"><circle cx="310.8" cy="125.8" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="159.9" cy="163.4" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="284.4" cy="213.6" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="205.3" cy="118.6" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="139.5" cy="164.7" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="254.3" cy="55.4" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="82.3" cy="48.6" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="41.5" cy="99.2" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="266.9" cy="271.7" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="157.3" cy="81.7" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="44.0" cy="134.0" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="262.0" cy="166.4" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="243.2" cy="246.6" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="95.6" cy="208.3" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="90.2" cy="213.1" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="305.5" cy="149.5" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="135.2" cy="234.0" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="306.6" cy="185.5" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="314.5" cy="165.7" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="185.9" cy="59.0" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="248.0" cy="147.4" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="159.5" cy="64.1" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="155.3" cy="51.6" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="59.2" cy="189.6" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="185.5" cy="43.7" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="110.3" cy="84.3" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="229.4" cy="109.2" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="216.3" cy="38.0" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="133.2" cy="198.5" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="96.8" cy="295.8" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="99.6" cy="53.7" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="275.2" cy="278.5" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="209.1" cy="175.8" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="206.5" cy="125.4" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="125.9" cy="40.8" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="170.4" cy="134.1" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="217.9" cy="258.5" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="57.3" cy="194.8" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="253.9" cy="81.7" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="244.4" cy="278.3" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="295.7" cy="85.4" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="285.8" cy="163.5" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="296.4" cy="296.9" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="48.5" cy="304.3" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="110.8" cy="240.4" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="92.5" cy="151.2" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="50.9" cy="144.7" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="86.5" cy="120.2" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="45.9" cy="223.0" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="302.7" cy="159.2" r="3" fill="rgba(220,60,60,0.85)"/></g>
  <g class="mc-e2"><text x="350" y="120" font-size="14" fill="currentColor">darts: 100</text><text x="350" y="146" font-size="14" fill="currentColor">inside: <tspan fill="rgba(34,158,68,1)" font-weight="600">77</tspan></text><text x="350" y="186" font-size="20" font-weight="600" fill="currentColor">π ≈ 4 × 77/100</text><text x="350" y="214" font-size="20" font-weight="600" fill="currentColor">= 3.08</text></g>
  <g class="mc-b3"><circle cx="267.2" cy="125.8" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="211.0" cy="256.4" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="200.8" cy="298.9" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="264.5" cy="41.2" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="279.1" cy="295.8" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="134.8" cy="221.0" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="71.6" cy="134.5" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="263.3" cy="222.2" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="281.6" cy="86.8" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="76.2" cy="95.3" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="287.1" cy="254.8" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="200.6" cy="131.2" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="210.6" cy="283.1" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="225.1" cy="133.1" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="270.7" cy="85.0" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="131.6" cy="107.8" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="282.8" cy="60.0" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="85.2" cy="302.5" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="222.2" cy="249.9" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="197.8" cy="45.5" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="146.2" cy="239.2" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="167.8" cy="126.0" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="68.3" cy="203.4" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="77.4" cy="124.5" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="272.6" cy="204.5" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="144.1" cy="158.9" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="100.2" cy="240.7" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="132.4" cy="181.9" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="62.8" cy="99.2" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="202.1" cy="226.1" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="61.7" cy="96.3" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="76.7" cy="272.7" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="76.6" cy="287.2" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="293.8" cy="234.6" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="125.8" cy="76.8" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="213.6" cy="257.6" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="161.7" cy="62.5" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="145.1" cy="111.0" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="67.1" cy="106.3" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="257.4" cy="78.8" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="228.8" cy="206.2" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="58.0" cy="164.7" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="252.1" cy="256.6" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="114.5" cy="159.9" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="249.5" cy="59.0" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="75.2" cy="258.4" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="263.9" cy="129.5" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="241.9" cy="30.9" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="303.0" cy="74.0" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="257.6" cy="199.4" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="219.5" cy="258.4" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="252.7" cy="97.8" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="242.0" cy="185.5" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="145.9" cy="192.5" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="49.3" cy="73.6" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="191.9" cy="201.5" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="193.4" cy="107.9" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="146.8" cy="77.4" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="297.4" cy="201.5" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="78.6" cy="97.1" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="318.0" cy="268.6" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="239.5" cy="78.9" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="297.8" cy="275.5" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="65.7" cy="33.4" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="72.7" cy="260.5" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="201.0" cy="185.0" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="250.1" cy="256.6" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="296.0" cy="249.2" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="255.4" cy="291.1" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="172.6" cy="300.9" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="127.9" cy="222.6" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="241.5" cy="182.6" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="55.9" cy="31.3" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="288.8" cy="53.4" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="109.0" cy="199.6" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="103.6" cy="275.0" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="49.2" cy="169.1" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="74.5" cy="260.6" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="280.9" cy="174.4" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="91.4" cy="122.4" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="114.4" cy="162.5" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="119.2" cy="165.5" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="216.0" cy="159.9" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="150.8" cy="88.6" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="284.6" cy="259.8" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="78.2" cy="278.3" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="314.3" cy="46.4" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="104.6" cy="38.4" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="98.2" cy="168.2" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="179.3" cy="53.8" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="51.3" cy="221.7" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="208.0" cy="291.4" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="106.2" cy="179.8" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="286.6" cy="96.9" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="272.1" cy="96.9" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="238.2" cy="72.1" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="230.8" cy="104.0" r="3" fill="rgba(220,60,60,0.85)"/><circle cx="124.5" cy="263.1" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="251.8" cy="263.6" r="3" fill="rgba(34,158,68,0.85)"/><circle cx="297.4" cy="142.9" r="3" fill="rgba(220,60,60,0.85)"/></g>
  <g class="mc-e3"><text x="350" y="120" font-size="14" fill="currentColor">darts: 200</text><text x="350" y="146" font-size="14" fill="currentColor">inside: <tspan fill="rgba(34,158,68,1)" font-weight="600">155</tspan></text><text x="350" y="186" font-size="20" font-weight="600" fill="currentColor">π ≈ 4 × 155/200</text><text x="350" y="214" font-size="20" font-weight="600" fill="currentColor">= 3.10</text></g>
  <text x="350" y="262" font-size="13" fill="currentColor" fill-opacity="0.7">true π = 3.14159…</text>
  <text x="350" y="284" font-size="12" fill="currentColor" fill-opacity="0.7">The error shrinks like 1/√n</text>
</svg>

*Figure: 200 random points. The estimate after 25, 50, 100 and 200 darts: 3.2, 3.28, 3.08, 3.1.*

Found this problem on my goat's channel [Joma Tech](https://www.youtube.com/watch?v=pvimAM_SLic&t=68s)

---

## Q3: what happens when you enter www.google.com and press enter?

> This was inspired by this [repo](https://github.com/alex/what-happens-when) I read long time ago

If you start from the key press.. #InstantHire

**1. The key press.** The keyboard controller detects the key, the keyboard sends a USB HID (human interface device) report, the OS turns it into a key event/interrupt, and the browser gets "Enter".

**2. The browser reads the address bar.** "www.google.com" has no scheme, so the browser decides it is a URL, not a search query, and adds `https://`. If you type `google.com` instead, Google answers with a `301` redirect to `www.google.com`, which costs one more round trip.

**3. DNS: name to IP address.** The network routes IP addresses, not names. The browser checks its own cache, then the OS cache, then asks a DNS resolver (your router, your ISP or a public resolver). On a miss, the resolver asks a root nameserver, then the `.com` nameservers, then Google's own nameservers. My lookup took 2 ms because the answer was cached. Each run returned a different IP (142.251.150.119, 142.251.151.119, 142.251.155.119): Google spreads traffic over many front-end servers.

**4. TCP: one round trip.** SYN, SYN-ACK, ACK. Both sides agree on sequence numbers before any data flows, so TCP can detect and resend lost packets. Acknowledgement is necessary. Connected at 11 ms, so one round trip to Google's server is approximately 9 ms from here.

**5. TLS 1.3: one more round trip.** The browser sends a ClientHello with its supported ciphers and a key share. The server answers with its key share, its certificate (signed by a certificate authority) and a Finished message. Both sides compute the same secret from the two key shares and everything after this is encrypted with symmetric keys derived from it. TLS was done at 40-63 ms. Basically checking if all packets have arrived.

**6. HTTP: the request.** `GET /` over HTTP/2, with headers: cookies, user-agent, accept-encoding. Google's load balancers send it to a server that builds the page. The first byte of the response arrived at 140-189 ms, so most of the time is the server's work and the network, not the handshakes.

**7. Rendering.** Parse the HTML into a DOM tree and the CSS into a CSSOM. Combine them into a render tree, compute the layout (the position and size of every element), paint pixels, and composite the layers on the GPU. The HTML references more files (JavaScript, images), and the browser fetches them in parallel over the same connection.

<svg viewBox="0 0 560 520" role="img" aria-label="Loading www.google.com: DNS lookup, TCP handshake, TLS 1.3 handshake, HTTP request and response, with times measured from one machine" style="width:100%;max-width:520px;height:auto;display:block;margin:24px auto;font-family:var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif">
  <style>
    .ns-s0 { animation: ns-s0 12s infinite; } @keyframes ns-s0 { 0%, 4% { opacity: 0; } 6%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ns-s1 { animation: ns-s1 12s infinite; } @keyframes ns-s1 { 0%, 12% { opacity: 0; } 14%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ns-s2 { animation: ns-s2 12s infinite; } @keyframes ns-s2 { 0%, 20% { opacity: 0; } 22%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ns-s3 { animation: ns-s3 12s infinite; } @keyframes ns-s3 { 0%, 28% { opacity: 0; } 30%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ns-s4 { animation: ns-s4 12s infinite; } @keyframes ns-s4 { 0%, 36% { opacity: 0; } 38%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ns-s5 { animation: ns-s5 12s infinite; } @keyframes ns-s5 { 0%, 44% { opacity: 0; } 46%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ns-s6 { animation: ns-s6 12s infinite; } @keyframes ns-s6 { 0%, 52% { opacity: 0; } 54%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ns-s7 { animation: ns-s7 12s infinite; } @keyframes ns-s7 { 0%, 60% { opacity: 0; } 62%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ns-s8 { animation: ns-s8 12s infinite; } @keyframes ns-s8 { 0%, 68% { opacity: 0; } 70%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ns-s9 { animation: ns-s9 12s infinite; } @keyframes ns-s9 { 0%, 76% { opacity: 0; } 78%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ns-m0 { animation: ns-m0 12s infinite; } @keyframes ns-m0 { 0%, 12% { opacity: 0; } 14%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ns-m1 { animation: ns-m1 12s infinite; } @keyframes ns-m1 { 0%, 36% { opacity: 0; } 38%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ns-m2 { animation: ns-m2 12s infinite; } @keyframes ns-m2 { 0%, 60% { opacity: 0; } 62%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .ns-m3 { animation: ns-m3 12s infinite; } @keyframes ns-m3 { 0%, 76% { opacity: 0; } 78%, 95% { opacity: 1; } 100% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) {
      .ns-s0, .ns-s1, .ns-s2, .ns-s3, .ns-s4, .ns-s5, .ns-s6, .ns-s7, .ns-s8, .ns-s9, .ns-m0, .ns-m1, .ns-m2, .ns-m3 { animation: none; opacity: 1; }
    }
  </style>
  <defs><marker id="ns-ah" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M1,1 L8,5 L1,9" fill="none" stroke="currentColor" stroke-width="1.5"/></marker></defs>
  <rect x="72" y="18" width="116" height="30" rx="8" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-opacity="0.35"/><text x="130" y="38" font-size="13" text-anchor="middle" fill="currentColor">browser</text>
  <line x1="130" y1="48" x2="130" y2="430" stroke="currentColor" stroke-opacity="0.2" stroke-dasharray="4 4"/>
  <rect x="242" y="18" width="116" height="30" rx="8" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-opacity="0.35"/><text x="300" y="38" font-size="13" text-anchor="middle" fill="currentColor">DNS resolver</text>
  <line x1="300" y1="48" x2="300" y2="430" stroke="currentColor" stroke-opacity="0.2" stroke-dasharray="4 4"/>
  <rect x="422" y="18" width="116" height="30" rx="8" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-opacity="0.35"/><text x="480" y="38" font-size="13" text-anchor="middle" fill="currentColor">www.google.com</text>
  <line x1="480" y1="48" x2="480" y2="430" stroke="currentColor" stroke-opacity="0.2" stroke-dasharray="4 4"/>
  <g class="ns-s0" color="rgba(240,140,0,1)"><line x1="134" y1="70" x2="294" y2="70" stroke="currentColor" stroke-width="2" marker-end="url(#ns-ah)"/><text x="215.0" y="64" font-size="12" text-anchor="middle" fill="currentColor">where is www.google.com?</text></g>
  <g class="ns-s1" color="rgba(240,140,0,1)"><line x1="296" y1="100" x2="136" y2="100" stroke="currentColor" stroke-width="2" marker-end="url(#ns-ah)"/><text x="215.0" y="94" font-size="12" text-anchor="middle" fill="currentColor">142.251.x.x</text></g>
  <g class="ns-s2" color="rgba(25,113,194,1)"><line x1="134" y1="150" x2="474" y2="150" stroke="currentColor" stroke-width="2" marker-end="url(#ns-ah)"/><text x="305.0" y="144" font-size="12" text-anchor="middle" fill="currentColor">SYN</text></g>
  <g class="ns-s3" color="rgba(25,113,194,1)"><line x1="476" y1="180" x2="136" y2="180" stroke="currentColor" stroke-width="2" marker-end="url(#ns-ah)"/><text x="305.0" y="174" font-size="12" text-anchor="middle" fill="currentColor">SYN-ACK</text></g>
  <g class="ns-s4" color="rgba(25,113,194,1)"><line x1="134" y1="210" x2="474" y2="210" stroke="currentColor" stroke-width="2" marker-end="url(#ns-ah)"/><text x="305.0" y="204" font-size="12" text-anchor="middle" fill="currentColor">ACK</text></g>
  <g class="ns-s5" color="rgba(156,54,181,1)"><line x1="134" y1="260" x2="474" y2="260" stroke="currentColor" stroke-width="2" marker-end="url(#ns-ah)"/><text x="305.0" y="254" font-size="12" text-anchor="middle" fill="currentColor">ClientHello + key share</text></g>
  <g class="ns-s6" color="rgba(156,54,181,1)"><line x1="476" y1="290" x2="136" y2="290" stroke="currentColor" stroke-width="2" marker-end="url(#ns-ah)"/><text x="305.0" y="284" font-size="12" text-anchor="middle" fill="currentColor">ServerHello + cert + Finished</text></g>
  <g class="ns-s7" color="rgba(156,54,181,1)"><line x1="134" y1="320" x2="474" y2="320" stroke="currentColor" stroke-width="2" marker-end="url(#ns-ah)"/><text x="305.0" y="314" font-size="12" text-anchor="middle" fill="currentColor">Finished</text></g>
  <g class="ns-s8" color="rgba(34,158,68,1)"><line x1="134" y1="370" x2="474" y2="370" stroke="currentColor" stroke-width="2" marker-end="url(#ns-ah)"/><text x="305.0" y="364" font-size="12" text-anchor="middle" fill="currentColor">GET / (HTTP/2)</text></g>
  <g class="ns-s9" color="rgba(34,158,68,1)"><line x1="476" y1="400" x2="136" y2="400" stroke="currentColor" stroke-width="2" marker-end="url(#ns-ah)"/><text x="305.0" y="394" font-size="12" text-anchor="middle" fill="currentColor">200 OK + HTML</text></g>
  <text class="ns-m0" x="8" y="104" font-size="11" font-weight="600" fill="currentColor" fill-opacity="0.85">2 ms (cached)</text>
  <text class="ns-m1" x="8" y="214" font-size="11" font-weight="600" fill="currentColor" fill-opacity="0.85">11 ms</text>
  <text class="ns-m2" x="8" y="324" font-size="11" font-weight="600" fill="currentColor" fill-opacity="0.85">40-63 ms</text>
  <text class="ns-m3" x="8" y="404" font-size="11" font-weight="600" fill="currentColor" fill-opacity="0.85">140-189 ms</text>
  <g font-size="12" fill="currentColor" fill-opacity="0.75">
    <text x="280" y="462" text-anchor="middle">DNS 1 round trip (to a cache) · TCP 1 · TLS 1.3 1 · HTTP 1</text>
    <text x="280" y="484" text-anchor="middle">Times: curl from my machine, cumulative from the start, 3 runs</text>
    <text x="280" y="506" text-anchor="middle">Next visit: HTTP/3 over QUIC merges TCP and TLS into one round trip</text>
  </g>
</svg>

*Figure: one page load as round trips. DNS, TCP and TLS each cost a round trip before the first byte of HTML moves.*

**The follow-up question: can you skip a round trip?** Yes. Google's response includes `alt-svc: h3=":443"`. That header tells the browser that HTTP/3 is available. On the next visit, Chrome uses QUIC over UDP, which merges the transport handshake and the TLS 1.3 handshake into one round trip.

You can see steps 3 to 6 in code:

```python
import socket
import ssl

# step 1: DNS
ip = socket.getaddrinfo('www.google.com', 443)[0][4][0]
print(f"DNS: www.google.com -> {ip}")

# step 2: TCP + TLS
sock = socket.create_connection(('www.google.com', 443))
context = ssl.create_default_context()
ssock = context.wrap_socket(sock, server_hostname='www.google.com')
print(f"TLS: {ssock.version()}")

# step 3: raw HTTP request
ssock.sendall(b'GET / HTTP/1.1\r\nHost: www.google.com\r\nConnection: close\r\n\r\n')
response = ssock.recv(512).decode()
print(response[:200])
ssock.close()
```

You can measure each phase yourself:

```bash
curl -s -o /dev/null -w "dns %{time_namelookup} tcp %{time_connect} tls %{time_appconnect} first byte %{time_starttransfer}\n" https://www.google.com/ #dns 0.008278 tcp 0.018217 tls 0.050770 first byte 0.157129
```

---

## Q4: how does CUDA work? what is Flash Attention?

> do you know what happens when you call torch.device("cuda") ?

This is a tricky one to write an "answer" to so I'll start with 3 things: the hardware, the programming, and an example of [Flash Attention](/blog/inference#6-flashattention)

### the hardware

A GPU is many small processors called streaming multiprocessors (SMs). My RTX 3090 has 82. Each SM runs threads in groups of 32 called **warps**, and all 32 threads of a warp execute the same instruction at the same time on different data. NVIDIA calls this SIMT (single instruction, multiple threads).

The memory is a hierarchy, from fast and small to slow and large:

1. **Registers**, private to each thread.
2. **Shared memory**, on the SM and shared by the threads of one block. It holds tens of KB per block.
3. **L2 cache**, shared by all SMs.
4. **Global memory** (VRAM), the GBs on the card: GDDR on gaming cards, HBM on data-center cards.

Each step down is slower. Fast GPU code keeps its data in the top two levels. You can see a nice diagram of this on [Modal](https://modal.com/gpu-glossary/readme)

### the programming

A **kernel** is a function that runs one time per thread. You launch a **grid** of **blocks**, and each block holds up to 1024 threads. Inside the kernel, `blockIdx` and `threadIdx` tell each thread which piece of the work is its own. Same concept we learnt in OS class.. Threads in one block share the block's shared memory and can wait for each other with `__syncthreads()`.

For matmul, the natural mapping is one thread per output element:

```python
# CPU: one thread loops over everything sequentially
for i in range(N):
    for j in range(N):
        for k in range(N):
            C[i][j] += A[i][k] * B[k][j]
```

```c
// GPU (CUDA): one thread per output element C[i][j]
__global__ void matmul(float* A, float* B, float* C, int N) {
    int i = blockIdx.y * blockDim.y + threadIdx.y;
    int j = blockIdx.x * blockDim.x + threadIdx.x;
    float sum = 0;
    for (int k = 0; k < N; k++)
        sum += A[i*N + k] * B[k*N + j];
    C[i*N + j] = sum;
}
// launched with <<<grid, block>>>, e.g. 32x32 threads per block
```

The two outer loops become the thread grid. For N = 4096 that is 16.8 million threads. They don't all run at once: each SM runs as many warps as fit, and the rest wait for a free slot.

<svg viewBox="0 0 560 372" role="img" aria-label="CUDA mapping for matmul: the output C is split into blocks, each block into threads, one thread per output element; the tiled kernel loads tiles of A and B into shared memory" style="width:100%;max-width:520px;height:auto;display:block;margin:24px auto;font-family:var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif">
  <text x="30" y="30" font-size="14" font-weight="600" fill="currentColor">grid of blocks → threads</text>
  <rect x="30" y="50" width="96" height="96" fill="none" stroke="currentColor" stroke-opacity="0.6" stroke-width="2"/>
  <rect x="126" y="50" width="96" height="96" fill="none" stroke="currentColor" stroke-opacity="0.6" stroke-width="2"/>
  <rect x="30" y="146" width="96" height="96" fill="rgba(25,113,194,0.18)" stroke="currentColor" stroke-opacity="0.6" stroke-width="2"/>
  <rect x="126" y="146" width="96" height="96" fill="none" stroke="currentColor" stroke-opacity="0.6" stroke-width="2"/>
  <rect x="30" y="50" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="54" y="50" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="78" y="50" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="102" y="50" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="126" y="50" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="150" y="50" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="174" y="50" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="198" y="50" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="30" y="74" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="54" y="74" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="78" y="74" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="102" y="74" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="126" y="74" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="150" y="74" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="174" y="74" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="198" y="74" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="30" y="98" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="54" y="98" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="78" y="98" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="102" y="98" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="126" y="98" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="150" y="98" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="174" y="98" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="198" y="98" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="30" y="122" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="54" y="122" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="78" y="122" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="102" y="122" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="126" y="122" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="150" y="122" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="174" y="122" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="198" y="122" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="30" y="146" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="54" y="146" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="78" y="146" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="102" y="146" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="126" y="146" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="150" y="146" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="174" y="146" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="198" y="146" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="30" y="170" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="54" y="170" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="78" y="170" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="102" y="170" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="126" y="170" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="150" y="170" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="174" y="170" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="198" y="170" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="30" y="194" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="54" y="194" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="78" y="194" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="102" y="194" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="126" y="194" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="150" y="194" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="174" y="194" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="198" y="194" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="30" y="218" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="54" y="218" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="78" y="218" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="102" y="218" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="126" y="218" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="150" y="218" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="174" y="218" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="198" y="218" width="24" height="24" fill="none" stroke="currentColor" stroke-opacity="0.15"/>
  <rect x="80" y="172" width="20" height="20" rx="3" fill="rgba(220,60,60,0.8)"/>
  <text x="30" y="264" font-size="12" fill="rgba(25,113,194,1)" font-weight="600">block (y=1, x=0)</text>
  <text x="30" y="282" font-size="12" fill="rgba(220,60,60,1)" font-weight="600">thread (y=1, x=2) → C[5][2]</text>
  <text x="30" y="304" font-size="11" fill="currentColor" fill-opacity="0.75">i = blockIdx.y × blockDim.y + threadIdx.y = 1 × 4 + 1</text>
  <text x="30" y="320" font-size="11" fill="currentColor" fill-opacity="0.75">j = blockIdx.x × blockDim.x + threadIdx.x = 0 × 4 + 2</text>
  <text x="300" y="30" font-size="14" font-weight="600" fill="currentColor">tiled: share loads in a block</text>
  <rect x="420" y="172" width="40" height="40" fill="rgba(25,113,194,0.25)" stroke="rgba(25,113,194,1)" stroke-width="2"/>
  <text x="440.0" y="228" font-size="12" text-anchor="middle" fill="rgba(25,113,194,1)" font-weight="600">C block</text>
  <rect x="374" y="172" width="40" height="40" fill="rgba(34,158,68,0.2)" stroke="rgba(34,158,68,1)" stroke-dasharray="3 3"/>
  <rect x="420" y="126" width="40" height="40" fill="rgba(156,54,181,0.2)" stroke="rgba(156,54,181,1)" stroke-dasharray="3 3"/>
  <rect x="334" y="172" width="40" height="40" fill="rgba(34,158,68,0.2)" stroke="rgba(34,158,68,1)" stroke-dasharray="3 3"/>
  <rect x="420" y="86" width="40" height="40" fill="rgba(156,54,181,0.2)" stroke="rgba(156,54,181,1)" stroke-dasharray="3 3"/>
  <rect x="294" y="172" width="40" height="40" fill="rgba(34,158,68,0.2)" stroke="rgba(34,158,68,1)" stroke-dasharray="3 3"/>
  <rect x="420" y="46" width="40" height="40" fill="rgba(156,54,181,0.2)" stroke="rgba(156,54,181,1)" stroke-dasharray="3 3"/>
  <text x="294" y="164" font-size="12" fill="rgba(34,158,68,1)" font-weight="600">A: row band</text>
  <text x="468" y="92" font-size="12" fill="rgba(156,54,181,1)" font-weight="600">B: column</text>
  <text x="468" y="108" font-size="12" fill="rgba(156,54,181,1)" font-weight="600">band</text>
  <g font-size="12" fill="currentColor"><text x="300" y="258">1. load one tile of A and one of B</text><text x="300" y="276">   into shared memory</text><text x="300" y="296">2. __syncthreads()</text><text x="300" y="316">3. each thread uses each loaded</text><text x="300" y="334">   number 32 times</text><text x="300" y="354">4. move to the next pair of tiles</text></g>
</svg>

*Figure: left, how block and thread indices pick the output element. Right, the tiled kernel: the threads of one block load tiles of A and B into shared memory and reuse them.*

### making the kernel fast

The naive kernel reads every number of A and B from global memory again and again: each thread reads 2N numbers to do 2N FLOPs. The fix is the same idea as cache blocking on the CPU. The threads of a block load a 32×32 tile of A and a 32×32 tile of B into shared memory one time, wait at `__syncthreads()`, and then each loaded number feeds 32 multiply-adds:

```c
#define TILE 32
__global__ void tiled(const float* A, const float* B, float* C, int N) {
    __shared__ float As[TILE][TILE], Bs[TILE][TILE];
    int i = blockIdx.y * TILE + threadIdx.y, j = blockIdx.x * TILE + threadIdx.x;
    float s = 0;
    for (int t = 0; t < N; t += TILE) {
        As[threadIdx.y][threadIdx.x] = A[i*N + t + threadIdx.x];    // each thread loads one number
        Bs[threadIdx.y][threadIdx.x] = B[(t + threadIdx.y)*N + j];
        __syncthreads();                                            // wait until the tile is loaded
        for (int k = 0; k < TILE; k++) s += As[threadIdx.y][k] * Bs[k][threadIdx.x];
        __syncthreads();                                            // wait before the next tile overwrites it
    }
    C[i*N + j] = s;
}
```

I measured both kernels and cuBLAS on an RTX 3090 (N = 4096, float32, TF32 off). All three give the same output:

| Kernel | Time | TFLOP/s |
|---|---|---|
| Naive, one thread per output | 62 ms | 2.2 |
| Tiled, shared memory | 44 ms | 3.1 |
| cuBLAS (`torch.matmul`) | 4.9 ms | 28.3 |

### Flash Attention

Standard attention computes S = QKᵀ, an N×N matrix, writes it to global memory, reads it back for the softmax, writes the result, and reads it again to multiply by V. For N = 4096 in fp16, S is 32 MiB per head, per layer. The math per byte is small, so the GPU waits on memory: attention is **memory-bound**.

Flash Attention never stores S. It takes one block of queries at a time and streams blocks of K and V through shared memory. The problem is the softmax: it needs the maximum and the sum over the whole row, and the row arrives one tile at a time. The fix is the **online softmax**. For each query row, keep a running maximum m, a running sum ℓ and a running output O. When a new tile of scores s arrives:

$$
\begin{aligned}
m' &= \max(m, \max(s)) \\
\ell' &= \ell \, e^{m - m'} + \textstyle\sum e^{s - m'} \\
O' &= O \, e^{m - m'} + e^{s - m'} V_{tile}
\end{aligned}
$$

At the end, divide O by ℓ. The factor $e^{m - m'}$ fixes the old partial sums whenever a larger score appears. O(N) extra memory instead of O(N²), and far fewer trips to global memory. This is a little overkill for an interview but it's experience agnostic.. I know some companies that tell you to write Flash Attention from scratch.. God bless them candidates.

<svg viewBox="0 0 560 352" role="img" aria-label="Standard attention writes the full N by N score matrix to global memory; Flash Attention streams K and V tiles through shared memory for one block of queries and keeps a running max and sum" style="width:100%;max-width:520px;height:auto;display:block;margin:24px auto;font-family:var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif">
  <style>
    .fa-k0 { animation: fa-k0 10s infinite; } @keyframes fa-k0 { 0%, 5% { opacity: 0; } 7%, 25% { opacity: 1; } 27%, 100% { opacity: 0; } }
    .fa-k1 { animation: fa-k1 10s infinite; } @keyframes fa-k1 { 0%, 27% { opacity: 0; } 29%, 47% { opacity: 1; } 49%, 100% { opacity: 0; } }
    .fa-k2 { animation: fa-k2 10s infinite; } @keyframes fa-k2 { 0%, 49% { opacity: 0; } 51%, 69% { opacity: 1; } 71%, 100% { opacity: 0; } }
    .fa-k3 { animation: fa-k3 10s infinite; } @keyframes fa-k3 { 0%, 71% { opacity: 0; } 73%, 95% { opacity: 1; } 97%, 100% { opacity: 0; } }
    .fa-done { animation: fa-done 10s infinite; } @keyframes fa-done { 0%, 88% { opacity: 0; } 90%, 95% { opacity: 1; } 100% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) {
      .fa-done { animation: none; opacity: 1; }
      .fa-k0, .fa-k1, .fa-k2 { animation: none; opacity: 0; }
    }
  </style>
  <style>@media (prefers-reduced-motion: reduce) { .fa-k3 { animation: none; opacity: 1; } }</style>
  <text x="30" y="30" font-size="14" font-weight="600" fill="rgba(220,60,60,1)">standard: S = QKᵀ is N × N</text>
  <text x="30" y="48" font-size="12" fill="currentColor" fill-opacity="0.7">written to and read from global memory</text>
  <rect x="30" y="60" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="52" y="60" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="74" y="60" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="96" y="60" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="118" y="60" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="140" y="60" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="162" y="60" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="184" y="60" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="30" y="82" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="52" y="82" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="74" y="82" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="96" y="82" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="118" y="82" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="140" y="82" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="162" y="82" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="184" y="82" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="30" y="104" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="52" y="104" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="74" y="104" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="96" y="104" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="118" y="104" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="140" y="104" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="162" y="104" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="184" y="104" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="30" y="126" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="52" y="126" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="74" y="126" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="96" y="126" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="118" y="126" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="140" y="126" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="162" y="126" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="184" y="126" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="30" y="148" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="52" y="148" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="74" y="148" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="96" y="148" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="118" y="148" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="140" y="148" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="162" y="148" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="184" y="148" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="30" y="170" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="52" y="170" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="74" y="170" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="96" y="170" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="118" y="170" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="140" y="170" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="162" y="170" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="184" y="170" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="30" y="192" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="52" y="192" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="74" y="192" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="96" y="192" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="118" y="192" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="140" y="192" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="162" y="192" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="184" y="192" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="30" y="214" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="52" y="214" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="74" y="214" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="96" y="214" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="118" y="214" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="140" y="214" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="162" y="214" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <rect x="184" y="214" width="22" height="22" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.6)"/>
  <text x="30" y="258" font-size="12" fill="currentColor">N = 4096, fp16: 32 MiB per head</text>
  <text x="300" y="30" font-size="14" font-weight="600" fill="rgba(34,158,68,1)">flash: one Q block at a time</text>
  <text x="300" y="48" font-size="12" fill="currentColor" fill-opacity="0.7">K, V tiles stream through shared memory</text>
  <rect x="300" y="60" width="176" height="44" fill="rgba(34,158,68,0.2)" stroke="rgba(34,158,68,1)"/><text x="482" y="86" font-size="12" fill="currentColor">Q block</text>
  <rect x="300" y="126" width="44" height="44" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-dasharray="3 3"/>
  <g class="fa-k0"><rect x="300" y="126" width="44" height="44" fill="rgba(25,113,194,0.35)" stroke="rgba(25,113,194,1)"/><text x="300" y="206" font-size="12" fill="currentColor">tile 1 of 4: scores for this block only</text></g>
  <rect x="344" y="126" width="44" height="44" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-dasharray="3 3"/>
  <g class="fa-k1"><rect x="344" y="126" width="44" height="44" fill="rgba(25,113,194,0.35)" stroke="rgba(25,113,194,1)"/><text x="300" y="206" font-size="12" fill="currentColor">tile 2 of 4: scores for this block only</text></g>
  <rect x="388" y="126" width="44" height="44" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-dasharray="3 3"/>
  <g class="fa-k2"><rect x="388" y="126" width="44" height="44" fill="rgba(25,113,194,0.35)" stroke="rgba(25,113,194,1)"/><text x="300" y="206" font-size="12" fill="currentColor">tile 3 of 4: scores for this block only</text></g>
  <rect x="432" y="126" width="44" height="44" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-dasharray="3 3"/>
  <g class="fa-k3"><rect x="432" y="126" width="44" height="44" fill="rgba(25,113,194,0.35)" stroke="rgba(25,113,194,1)"/><text x="300" y="206" font-size="12" fill="currentColor">tile 4 of 4: scores for this block only</text></g>
  <text x="482" y="152" font-size="12" fill="currentColor">K, V tiles</text>
  <g font-size="12" fill="currentColor"><text x="300" y="236">keep per query row:</text><text x="300" y="254">m = running max of scores</text><text x="300" y="272">ℓ = running sum of exp(score − m)</text><text x="300" y="290">O = running weighted sum of V</text></g>
  <text class="fa-done" x="280" y="326" font-size="13" font-weight="600" text-anchor="middle" fill="currentColor">Same exact result. The N × N matrix never exists.</text>
</svg>

*Figure: standard attention materializes the full N×N matrix in global memory. Flash Attention streams K and V tiles through shared memory and keeps only the running max, sum and output for each query row.*

It is the same idea for the third time in this post: move the work into fast memory, and reuse every number you load as many times as you can.

---

## Q5: implement a GPT from scratch. no libraries.

I mean.. if you can walk me through this, that also works..

### autograd: why it matters

Autograd records every operation of the forward pass in a graph. You call `loss.backward()`, and it walks the graph in reverse and multiplies the local derivatives. [Chain rule](/blog/math#more-on-chain-rule).

PyTorch hides this behind one method call ([how PyTorch autograd works](/blog/torch#autograd)). MicroGPT does it one scalar at a timeso you can see the gradient of every number.

### what is a gradient, practically?

A gradient tells you what a small nudge does. Take a weight with a gradient of `0.5`. Increase that weight by a tiny amount, and the loss increases by half that amount. Training nudges every weight in the *opposite* direction of its gradient, so the loss goes down.

### the value class: building the computational graph

The `Value` class is the whole autograd engine. Each `Value` wraps one floating-point number and tracks three things:

1. `data`, the number itself. The forward pass computes it.
2. `grad`, the derivative of the final loss with respect to this number. The backward pass fills it in.
3. `_children` and `local_grads`, the inputs that created this value and the local derivative of the operation with respect to each input.

When you compute `a + b` or `a * b` on two `Value` objects, Python calls `__add__` or `__mul__`. That method creates a new `Value`, which stores its inputs and the local gradients. For addition, the local gradient with respect to each input is `1.0`, because $\partial(a+b)/\partial a = \partial(a+b)/\partial b = 1$. For multiplication, the local gradient with respect to `a` is `b.data`, and the local gradient with respect to `b` is `a.data`. The reason is $\partial(ab)/\partial a = b$ and $\partial(ab)/\partial b = a$.

These objects make a directed acyclic graph (DAG). Each node is a scalar. Each edge goes from an input to the value it helps compute.

In PyTorch, you write `x = torch.randn(10, 10, requires_grad=True)`. In MicroGPT, the same 10×10 matrix is a list of lists with 100 separate `Value` objects. A call to `backward()` visits every addition and multiplication that produced the loss, one scalar at a time.

### the chain rule and DAG traversal

For a chain $L = f(g(h(w)))$:

$$
\frac{dL}{dw} = \frac{dL}{dg} \cdot \frac{dg}{dh} \cdot \frac{dh}{dw}
$$

Each factor is a local gradient. Multiply the local gradients along the path and you get the total.

`backward()` does two things:

1. **Topological sort.** A recursive depth-first search (DFS) appends each node to a list after all of its inputs. So every node comes after the nodes it depends on.
2. **Reverse traversal.** The code sets the gradient of the loss to 1.0, because $dL/dL = 1$. Then it walks the sorted list backwards. For each node, it adds `local_grad * v.grad` to the `.grad` of each input.

The `+=` is important. When a value feeds many operations, its gradient is the sum of the contributions from all of them. Take a `w` that feeds both `a = w * 3` and `b = w * 5`:

$$
\frac{dL}{dw} = 3 \, \frac{dL}{da} + 5 \, \frac{dL}{db}
$$

The [MicroGPT post](/blog/microgpt#backward) explains the same `backward()` step by step.

<img src="/assets/images/interview/microgpt_autograd.webp" alt="Autograd Value class - scalar computation graph with backward() chain rule, showing L=(a*b)+c example with gradient flow" style="max-width:100%">

*Every operation builds a DAG node. `backward()` walks the DAG in reverse and multiplies the local gradients by the chain rule.*

<svg viewBox="0 0 560 340" role="img" aria-label="Computational graph for e = a times b plus d with a = 3, b = 4, d = 5. The forward pass builds the nodes left to right. The backward pass starts at e with grad 1 and gives grad 1 to c and d, grad 4 to a and grad 3 to b" style="width:100%;max-width:520px;height:auto;display:block;margin:24px auto;font-family:var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif">
  <style>
    .cg-n0 { animation: cg-n0 10s infinite; } @keyframes cg-n0 { 0%, 2% { opacity: 0; } 4%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .cg-n1 { animation: cg-n1 10s infinite; } @keyframes cg-n1 { 0%, 12% { opacity: 0; } 14%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .cg-n2 { animation: cg-n2 10s infinite; } @keyframes cg-n2 { 0%, 24% { opacity: 0; } 26%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .cg-f { animation: cg-f 10s infinite; } @keyframes cg-f { 0%, 2% { opacity: 0; } 4%, 42% { opacity: 1; } 44%, 100% { opacity: 0; } }
    .cg-b { animation: cg-b 10s infinite; } @keyframes cg-b { 0%, 44% { opacity: 0; } 46%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .cg-g0 { animation: cg-g0 10s infinite; } @keyframes cg-g0 { 0%, 48% { opacity: 0; } 50%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .cg-g1 { animation: cg-g1 10s infinite; } @keyframes cg-g1 { 0%, 60% { opacity: 0; } 62%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .cg-g2 { animation: cg-g2 10s infinite; } @keyframes cg-g2 { 0%, 72% { opacity: 0; } 74%, 95% { opacity: 1; } 100% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) {
      .cg-n0, .cg-n1, .cg-n2, .cg-b, .cg-g0, .cg-g1, .cg-g2 { animation: none; opacity: 1; }
      .cg-f { animation: none; opacity: 0; }
    }
  </style>
  <defs><marker id="cg-ab" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M1,1 L8,5 L1,9" fill="none" stroke="rgba(25,113,194,1)" stroke-width="1.5"/></marker><marker id="cg-ar" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M1,1 L8,5 L1,9" fill="none" stroke="rgba(220,60,60,1)" stroke-width="1.5"/></marker></defs>
  <text class="cg-f" x="12" y="28" font-size="14" font-weight="600" fill="rgba(25,113,194,1)">forward: each operation creates a node</text>
  <text class="cg-b" x="12" y="28" font-size="14" font-weight="600" fill="rgba(220,60,60,1)">backward: child.grad += local × grad, from e back to a and b</text>
  <g class="cg-n0">
    <rect x="12" y="56" width="96" height="46" rx="10" fill="rgba(34,158,68,0.12)" stroke="rgba(34,158,68,0.8)"/><text x="60" y="84" font-size="14" text-anchor="middle" fill="currentColor">a = 3</text>
    <rect x="12" y="196" width="96" height="46" rx="10" fill="rgba(34,158,68,0.12)" stroke="rgba(34,158,68,0.8)"/><text x="60" y="224" font-size="14" text-anchor="middle" fill="currentColor">b = 4</text>
    <rect x="212" y="256" width="96" height="46" rx="10" fill="rgba(34,158,68,0.12)" stroke="rgba(34,158,68,0.8)"/><text x="260" y="284" font-size="14" text-anchor="middle" fill="currentColor">d = 5</text>
  </g>
  <g class="cg-n1">
    <line x1="108" y1="79" x2="210" y2="137" stroke="rgba(25,113,194,0.8)" stroke-width="1.5" marker-end="url(#cg-ab)"/>
    <line x1="108" y1="219" x2="210" y2="161" stroke="rgba(25,113,194,0.8)" stroke-width="1.5" marker-end="url(#cg-ab)"/>
    <rect x="212" y="126" width="96" height="46" rx="10" fill="rgba(25,113,194,0.12)" stroke="rgba(25,113,194,0.8)"/><text x="260" y="145" font-size="13" text-anchor="middle" fill="currentColor">c = a × b</text><text x="260" y="163" font-size="13" font-weight="600" text-anchor="middle" fill="currentColor">= 12</text>
  </g>
  <g class="cg-n2">
    <line x1="308" y1="149" x2="422" y2="204" stroke="rgba(25,113,194,0.8)" stroke-width="1.5" marker-end="url(#cg-ab)"/>
    <line x1="308" y1="279" x2="422" y2="224" stroke="rgba(25,113,194,0.8)" stroke-width="1.5" marker-end="url(#cg-ab)"/>
    <rect x="424" y="191" width="96" height="46" rx="10" fill="rgba(25,113,194,0.12)" stroke="rgba(25,113,194,0.8)"/><text x="472" y="210" font-size="13" text-anchor="middle" fill="currentColor">e = c + d</text><text x="472" y="228" font-size="13" font-weight="600" text-anchor="middle" fill="currentColor">= 17</text>
  </g>
  <g class="cg-g0">
    <text x="472" y="258" font-size="13" font-weight="600" text-anchor="middle" fill="rgba(220,60,60,1)">grad = 1 (seed)</text>
  </g>
  <g class="cg-g1">
    <line x1="424" y1="203" x2="312" y2="149" stroke="rgba(220,60,60,0.9)" stroke-width="2" marker-end="url(#cg-ar)"/>
    <line x1="424" y1="225" x2="312" y2="279" stroke="rgba(220,60,60,0.9)" stroke-width="2" marker-end="url(#cg-ar)"/>
    <text x="372" y="160" font-size="12" text-anchor="middle" fill="rgba(156,54,181,1)">local 1</text>
    <text x="372" y="282" font-size="12" text-anchor="middle" fill="rgba(156,54,181,1)">local 1</text>
    <text x="260" y="192" font-size="13" font-weight="600" text-anchor="middle" fill="rgba(220,60,60,1)">grad = 1 × 1 = 1</text>
    <text x="260" y="322" font-size="13" font-weight="600" text-anchor="middle" fill="rgba(220,60,60,1)">grad = 1 × 1 = 1</text>
  </g>
  <g class="cg-g2">
    <line x1="212" y1="137" x2="112" y2="80" stroke="rgba(220,60,60,0.9)" stroke-width="2" marker-end="url(#cg-ar)"/>
    <line x1="212" y1="161" x2="112" y2="218" stroke="rgba(220,60,60,0.9)" stroke-width="2" marker-end="url(#cg-ar)"/>
    <text x="174" y="96" font-size="12" text-anchor="middle" fill="rgba(156,54,181,1)">local b = 4</text>
    <text x="174" y="214" font-size="12" text-anchor="middle" fill="rgba(156,54,181,1)">local a = 3</text>
    <text x="60" y="122" font-size="13" font-weight="600" text-anchor="middle" fill="rgba(220,60,60,1)">grad = 4 × 1 = 4</text>
    <text x="60" y="262" font-size="13" font-weight="600" text-anchor="middle" fill="rgba(220,60,60,1)">grad = 3 × 1 = 3</text>
  </g>
</svg>

*Figure: the forward pass builds the DAG for e = a × b + d. The backward pass seeds e.grad = 1 and walks the graph in reverse. Each input gets local gradient × output gradient: a.grad = b = 4, b.grad = a = 3.*

- A linear layer. Instead of `nn.Linear(16, 16, bias=False)`, MicroGPT computes one dot product per row of the weight matrix: `[sum(wi * xi for wi, xi in zip(wo, x)) for wo in w]`.
- The activation. Instead of `nn.ReLU()`, the `Value` class has a `relu()` method. It returns `max(0, x)` and stores a local gradient of 1 or 0.
- The normalisation. `rmsnorm(x)` divides each element of the list by the root mean square of the list. It has no learnable gain.

### sequential training and the KV cache

Biggest break from how PyTorch trains.

- A PyTorch GPT trains on all positions of a sequence in parallel. It takes a `[batch, seq_len]` tensor and uses a [causal mask](/blog/microgpt#causal-masking), a triangle of $-\infty$ scores, to hide future tokens.
- MicroGPT processes one token at a time (`for pos_id in range(n)`). It appends the keys and values of each position to a list, the [KV cache](/blog/inference#5-the-kv-cache).

With a 2D causal mask, the scalar `Value` code would compute the full score matrix and then throw away the masked half. With the cache, position t sees only the keys and values of positions 0 to t, so the model cannot peek ahead. The code is also easier to read.

<img src="/assets/images/interview/microgpt_attention.webp" alt="Multi-head attention - Q,K,V projections split into 4 heads, scaled dot-product attention with KV cache" style="max-width:100%">

*4 heads × 4 dimensions = 16. Each head attends over the KV cache on its own. The code concatenates the 4 head outputs and multiplies them by Wo.*

### Adam from scratch

In PyTorch, you call `optimizer.step()`. MicroGPT implements [Adam](/blog/minitorch#adam) by hand. For each parameter, it tracks:

1. `m`, the first moment. It is a moving average of the gradient (momentum).
2. `v`, the second moment. It is a moving average of the squared gradient (uncentered variance).
3. `m_hat` and `v_hat`, the bias-corrected moments. `m` and `v` start at 0, so they are too small in the first steps. Division by $1 - \beta^t$ removes this bias.

Then it updates `param.data` directly, with learning rate $\alpha$ and step $t$:

$$
\theta \leftarrow \theta - \alpha \, \frac{\hat{m}_t}{\sqrt{\hat{v}_t} + \epsilon}
$$

Each weight gets its own step size, from the history of its own gradients. The code puts $\epsilon$ outside the square root, as in Algorithm 1 of the [Adam paper](https://arxiv.org/abs/1412.6980). It uses $\beta_1 = 0.85$ and $\beta_2 = 0.99$, the values from Karpathy's microgpt. 

<img src="/assets/images/interview/microgpt_training.webp" alt="Training loop - tokenize, forward pass, cross-entropy loss, backward pass, Adam optimizer update, zero gradients" style="max-width:100%">

*One complete training step: tokenize a name, run gpt(), compute the cross-entropy loss, call backward(), do the Adam update with learning-rate decay, and set the gradients to zero.*

### the gradient journey

A call to `loss.backward()` multiplies local derivatives from the loss back to every weight.

Start at the last operation, `loss = total_loss / batch_size`.

- `backward()` sets `loss.grad` to `1.0`.
- `total_loss.grad` becomes `1.0 / batch_size`, the local gradient of the division.
- If `total_loss = loss1 + loss2`, then `loss1.grad` and `loss2.grad` both get `total_loss.grad`, because the derivative of `x + y` with respect to `x` is 1.

The same steps continue back to the token embeddings. After `loss.backward()` and before the Adam update, you can print `state_dict['wte'][10][5].grad`. It shows how much dimension 5 of the embedding of token 10 (both 0-indexed) changes the loss of the batch, for example a batch with a name like "Andre-j" in it.

### numerical stability: the `max_logit` trick

In the `softmax` function, you'll see:

```python
max_logit = max(l.data for l in logits)
exp_logits = [(logit - max_logit).exp() for logit in logits]
```

**Why?** $e^x$ grows fast. With a logit of 100, $e^{100} \approx 2.7 \times 10^{43}$. That overflows float32, whose maximum is about $3.4 \times 10^{38}$. Python floats are float64, and `math.exp` raises `OverflowError` for inputs above about 709.8.

Subtract the maximum first, and the largest term becomes $e^0 = 1$. Every other term falls between 0 and 1. Softmax is shift-invariant, so the result does not change:

$$
\mathrm{softmax}(x)_i = \frac{e^{x_i}}{\sum_j e^{x_j}} = \frac{e^{x_i - c}}{\sum_j e^{x_j - c}}
$$

It's a clever trick to stop it from crashing..

### embedding + positional encoding

The model adds two learned vectors: the row of `wte` for the token, and the row of `wpe` for its position. The original transformer uses fixed sin/cos [positional encodings](/blog/math#positional-encoding) instead.

<img src="/assets/images/interview/microgpt_embedding.webp" alt="Embedding and positional encoding - wte token lookup table and wpe position lookup table, element-wise addition" style="max-width:100%">

*wte (27×16) encodes what the token IS, wpe (16×16) encodes where the token SITS. Both are learnable, no sin/cos here.*

<img src="/assets/images/interview/microgpt_architecture.webp" alt="MicroGPT GPT Architecture - decoder-only transformer pipeline from token input to next-token prediction" style="max-width:100%">

*The `gpt()` function as a pipeline: embedding lookup, RMSNorm, multi-head attention with residual, MLP with residual, lm_head projection, softmax.*

### the code (200 lines)

If you can code this in an hour even in pseudocode, you probably know the transformer architecture in detail.

```python
import math
import random
import urllib.request

random.seed(42)

names_url = 'https://raw.githubusercontent.com/karpathy/makemore/refs/heads/master/names.txt'
urllib.request.urlretrieve(names_url, 'names.txt')

docs = [l.strip() for l in open('names.txt').read().strip().split('\n') if l.strip()]
random.shuffle(docs)

print(f"Number of docs: {len(docs)}")

# Tokeniser
chars = sorted(set(''.join(docs))) # unique characters in the dataset
BOS = len(chars) # beginning of sequence token
vocab_size = len(chars) + 1 # number of unique characters + 1 for the BOS token

print(f"Vocab size: {vocab_size}")

# Autograd for DAG of operations

class Value:
    def __init__(self, data, _children=(), local_grads = ()):
        self.data = data # the value of this node (scalar (forward pass))
        self.grad = 0 # derivative of loss wrt this node
        self._children = _children # children of this node in the computational graph
        self.local_grads = local_grads # local derivatives of this node wrt its children

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, _children=(self, other))
        out.local_grads = (1.0, 1.0)
        return out

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, _children=(self, other))
        out.local_grads = (other.data, self.data)
        return out

    def __pow__(self, other):
        assert isinstance(other, (int, float)), "only supporting int/float powers for now"
        return Value(self.data**other, (self,), (other * self.data**(other-1),))

    def log(self): return Value(math.log(self.data + 1e-10), (self,), (1/(self.data + 1e-10),))
    def exp(self): return Value(math.exp(self.data), (self,), (math.exp(self.data),))
    def relu(self): return Value(max(0, self.data), (self,), (float(self.data > 0),))

    def __neg__(self): return self * -1
    def __radd__(self, other): return self + other
    def __sub__(self, other): return self + (-other)
    def __rsub__(self, other): return other + (-self)
    def __rmul__(self, other): return self * other
    def __truediv__(self, other): return self * other**-1
    def __rtruediv__(self, other): return other * self**-1
    def __lt__(self, other): return self.data < (other.data if isinstance(other, Value) else other)
    def __gt__(self, other): return self.data > (other.data if isinstance(other, Value) else other)

    def backward(self):
        topological_graph = []
        visited = set()
        def build_top(v):
            if v not in visited:
                visited.add(v)
                for child in v._children:
                    build_top(child)
                topological_graph.append(v)

        build_top(self)
        self.grad = 1 # seed the gradient of the output node with 1.0 (dL/dL = 1)
        for v in reversed(topological_graph):
            for child, local_grad in zip(v._children, v.local_grads):
                child.grad += local_grad * v.grad


# Initialise the parameters of the model
n_embed = 16
n_head = 4
n_layer = 1
block_size = 16 # maximum context length for predictions
head_dim = n_embed // n_head # dimension of each attention head

# Randomly initialise the parameters of the model as Value objects
matrix = lambda rows, cols: [[Value(random.gauss(0, 0.08)) for _ in range(cols)] for _ in range(rows)]
state_dict = {'wte': matrix(vocab_size, n_embed), 'wpe': matrix(block_size, n_embed), 'lm_head': matrix(vocab_size, n_embed)}

for i in range(n_layer):
    state_dict[f'blocks.{i}.attn.wq'] = matrix(n_embed, n_embed)
    state_dict[f'blocks.{i}.attn.wk'] = matrix(n_embed, n_embed)
    state_dict[f'blocks.{i}.attn.wv'] = matrix(n_embed, n_embed)
    state_dict[f'blocks.{i}.attn.wo'] = matrix(n_embed, n_embed)
    state_dict[f'blocks.{i}.mlp_fc1'] = matrix(4 * n_embed, n_embed)
    state_dict[f'blocks.{i}.mlp_fc2'] = matrix(n_embed, 4 * n_embed)

params = [p for matrix in state_dict.values() for row in matrix for p in row] # flatten the parameters into a single list
print(f"Number of parameters: {len(params)}")

# model architecture -> GPT-2 style (RMSNorm instead of LayerNorm, no biases, ReLU instead of GeLU)

# Linear layer used for forward pass
def linear(x, w):
    return [sum(wi * xi for wi, xi in zip(wo, x)) for wo in w]

# Convert logits to probabilities between 0 and 1 that sum to 1
def softmax(logits):
    max_logit = max(l.data for l in logits)
    exp_logits = [(logit - max_logit).exp() for logit in logits] # subtract max logit for numerical stability
    sum_exp_logits = sum(exp_logits)
    return [exp_logit / sum_exp_logits for exp_logit in exp_logits]

# RMSNorm used in the transformer blocks: divide x by its root mean square (no learnable gain)
def rmsnorm(x):
    eps = 1e-8
    mean_square = sum(xi**2 for xi in x) / len(x)
    root_mean_square = (mean_square + eps)**0.5
    return [xi / root_mean_square for xi in x]

# Decoder-only transformer architecture
def gpt(token_id, pos_id, keys, values):
    token_embedding = state_dict['wte'][token_id] # get the token embedding for the input token ID
    position_embedding = state_dict['wpe'][pos_id] # get the position embedding for the input position ID
    x = [te + pe for te, pe in zip(token_embedding, position_embedding)] # add the token and position embeddings to get the input representation for the transformer block
    x = rmsnorm(x) # apply RMSNorm to the input representation
    for i in range(n_layer):
        # mha block
        x_residual = x # save the input to the MHA block for the residual connection
        x = rmsnorm(x)
        q = linear(x, state_dict[f'blocks.{i}.attn.wq']) # compute the query vectors for the MHA block
        k = linear(x, state_dict[f'blocks.{i}.attn.wk']) # compute the key vectors for the MHA block
        v = linear(x, state_dict[f'blocks.{i}.attn.wv']) # compute the value vectors for the MHA block
        keys[i].append(k)
        values[i].append(v)
        x_attention = []
        for h in range(n_head):
            hsize = h * head_dim # compute the start index of the current head in the query/key/value vectors
            qh = q[hsize:hsize+head_dim] # get the query vector for the current head
            kh = [ki[hsize:hsize+head_dim] for ki in keys[i]] # get the key vectors for the current head from all previous time steps
            vh = [vi[hsize:hsize+head_dim] for vi in values[i]] # get the value vectors for the current head from all previous time steps
            attention_scores = [sum(qhi * khi for qhi, khi in zip(qh, khj)) / math.sqrt(head_dim) for khj in kh] # compute the attention scores for the current head
            attention_weights = softmax(attention_scores) # compute the attention weights for the current head
            head_output = [sum(aw * vhi for aw, vhi in zip(attention_weights, vhj)) for vhj in zip(*vh)] # compute the output of the current head as a weighted sum of the value vectors
            x_attention.extend(head_output) # concatenate the outputs of all heads to get the output of the MHA block
        x_attention = linear(x_attention, state_dict[f'blocks.{i}.attn.wo']) # apply the output projection to the concatenated head outputs
        x = [a + b for a, b in zip(x_attention, x_residual)] # add the residual connection to get the output of the MHA block
        # mlp block
        x_residual = x # save the input to the MLP block for the residual connection
        x = rmsnorm(x) # apply RMSNorm to the input of the MLP block
        x = linear(x, state_dict[f'blocks.{i}.mlp_fc1']) # apply the first linear layer of the MLP block
        x = [xi.relu() for xi in x] # apply the ReLU activation function to the output of the first linear layer
        x = linear(x, state_dict[f'blocks.{i}.mlp_fc2'])
        x = [a + b for a, b in zip(x, x_residual)] # add the residual connection to get the output of the MLP block
    logits = linear(x, state_dict['lm_head']) # apply the final linear layer to get the logits for the next token prediction
    return logits


# Adam optimiser
learning_rate, beta1, beta2, eps_adam = 0.01, 0.85, 0.99, 1e-8
m = [0.0] * len(params) # initialize the first moment vector for Adam
v = [0.0] * len(params) # initialize the second moment vector for Adam

# Training loop
num_steps = 20
for step in range(num_steps):
    # forward pass
    total_loss = Value(0.0)

    batch_size = 8
    for b in range(batch_size):
        # take a document from the dataset and convert it to a list of token IDs (add BOS token at the beginning)
        doc = docs[(step * batch_size + b) % len(docs)]
        tokens = [BOS] + [chars.index(c) for c in doc] + [BOS]
        n = min(block_size, len(tokens) - 1)

        keys = [[] for _ in range(n_layer)]
        values = [[] for _ in range(n_layer)]

        losses = []
        for pos_id in range(n):
            token_id, target_id = tokens[pos_id], tokens[pos_id + 1]
            logits = gpt(token_id, pos_id, keys, values)
            probs = softmax(logits)
            losses.append(-probs[target_id].log())
        total_loss += sum(losses) / n

    loss = total_loss / batch_size
    loss.backward() # compute the gradients of the loss with respect to all parameters in the computational graph (backward pass)

    # update the parameters using Adam (optimiser.step())
    learning_rate_target = learning_rate * (1 - step / num_steps) # linearly decay the learning rate toward zero (the last step uses learning_rate / num_steps)
    for i, param in enumerate(params):
        m[i] = beta1 * m[i] + (1 - beta1) * param.grad # update the first moment vector for the current parameter
        v[i] = beta2 * v[i] + (1 - beta2) * param.grad**2 # update the second moment vector for the current parameter
        m_hat = m[i] / (1 - beta1**(step + 1)) # compute the bias-corrected first moment estimate
        v_hat = v[i] / (1 - beta2**(step + 1)) # compute the bias-corrected second moment estimate
        param.data -= learning_rate_target * m_hat / (math.sqrt(v_hat) + eps_adam) # update the parameter using the Adam update rule
        param.grad = 0 # reset the gradient of the parameter to zero for the next iteration

    print(f"Step {step + 1}/{num_steps}, Loss: {loss.data:.4f}")

# inference (no_grad())
temperature = 0.5 # control creativity of generated text
print("\nGenerated names:")
for _ in range(10):
    keys, values = [[] for _ in range(n_layer)], [[] for _ in range(n_layer)] # reset the list of key and value vectors for each transformer block
    token_id = BOS # start with the BOS token
    generated_name = ''
    for pos_id in range(block_size):
        logits = gpt(token_id, pos_id, keys, values)
        probs = softmax([l / temperature for l in logits])
        token_id = random.choices(range(vocab_size), weights=[p.data for p in probs])[0]
        if token_id == BOS: # stop generating if we sample the BOS token again
            break
        generated_name += chars[token_id] # append the generated character to the name
    print(generated_name)
```

Run it: with `random.seed(42)`, the loss starts at 3.28, close to ln 27 = 3.30 (a uniform guess over 27 tokens), and falls to 2.68 after 20 steps.

> I also sometimes ask silly questions like speed of light, what is 13 in binary etc.. just to check their fluency with these numbers. In general, fluency with computers is what gets you hired, not passion.

---