---
layout: post
title: "Some Python tricks"
date:   2025-10-25 14:06:04 +0530
categories: tech
tokens: "~2k"
description: "Random Python tricks I've picked up."
published: true
tags: [python]
---

How to write more pythonic (god I hate this word) code.

---

## \*args and \*\*kwargs

Useful when you don't know how many arguments are going to be passed to your function at runtime.

```python
def add(*args):
    return sum(args)

print(add(1, 2, 23, 5)) # 31 (works no matter how many arguments passed)

# keyword arguments (dictionary like)
def printer(**kwargs):
    for key, value in kwargs.items():
        print(f"{key} - {value}")

printer(name="samit", age=22) # name - samit, age - 22
```

### lambda + dict dispatch

Replace a switch statement with a dictionary of lambdas.

```python
def dispatch(operator, x, y):
    return {
        "add": lambda: x + y,
        "sub": lambda: x - y,
        "mul": lambda: x * y,
        "div": lambda: x / y,
    }.get(operator, lambda: None)()

result = dispatch("mul", 2, 8)  # 16
```

### lru_cache: dynamic programming what??

#### pre-requisite: decorators

Decorators wrap a function through a closure, modifying its behavior without changing the source.

```python
def uppercase(func):
    def wrapper():
        return func().upper()
    return wrapper

@uppercase
def greet():
    return "yo"

print(greet())  # "YO"
```

<video autoplay loop muted playsinline style="max-width:100%" preload="none" poster="/assets/images/python/decorators_poster.jpg">
  <source src="/assets/images/python/decorators.mp4" type="video/mp4">
</video>
*The decorator wraps greet(), intercepts the return value, transforms "yo" to "YO".*

`@lru_cache` is memoization for free:

```python
from functools import lru_cache

def fib_slow(n):                  # O(2ⁿ): recomputes the same subtrees forever
    if n <= 1:
        return n
    return fib_slow(n-1) + fib_slow(n-2)

@lru_cache(maxsize=None)
def fib_fast(n):                  # O(n): each value computed once
    if n <= 1:
        return n
    return fib_fast(n-1) + fib_fast(n-2)

print(fib_fast(40))  # instant
```

<video autoplay loop muted playsinline style="max-width:100%" preload="none" poster="/assets/images/python/lru_cache_poster.jpg">
  <source src="/assets/images/python/lru_cache.mp4" type="video/mp4">
</video>
*Left: naive fib explodes into duplicate calls. Right: cached fib computes each value once.*

Play with `n`. Toggle `@lru_cache`. Watch the tree collapse from O(2ⁿ) to O(n).

<link rel="stylesheet" href="/widgets/lru-fib.css">
<div id="lru-fib"></div>
<script src="/widgets/lru-fib.js" defer></script>

---

### itertools and Counter

```python
from itertools import permutations, combinations
from collections import Counter

list(permutations("ABC", 2))  # [('A', 'B'), ('A', 'C'), ('B', 'A'), ...]
list(combinations([1, 2, 3, 4], 2))  # [(1,2), (1,3), (1,4), (2,3), (2,4), (3,4)]

arr = [1, 3, 4, 2, 1, 4, 1, 4, 2, 5, 2, 1, 4, 2, 1]
Counter(arr).most_common(3)  # [(1, 5), (4, 4), (2, 4)]
```

### don't use nested loops when you can use itertools

```python
from itertools import product

# God this is bad
for a in list_a:
    for b in list_b:
        for c in list_c:
            if a + b + c == 2077:
                print(a, b, c)

# Hell yeah
for a, b, c in product(list_a, list_b, list_c):
    if a + b + c == 2077:
        print(a, b, c)
```

### generators

No need to store the entire sequence in memory.

```python
# loads the whole file
def read_bad(filename):
    with open(filename) as f:
        return f.read().split('\n')

# streams line by line, constant memory
def read_good(filename):
    with open(filename) as f:
        for line in f:
            yield line.strip()

# the difference, concretely:
squares_list = [x**2 for x in range(1000000)]      # ~37 MB
squares_gen  = (x**2 for x in range(1000000))      # ~88 bytes
```

### shallow vs deep copy (this will bite you)

```python
import copy

xs = [[1, 2, 3], [4, 5, 6]]
ys = list(xs)         # shallow: inner lists are shared
xs[1][0] = "X"
print(ys)             # [[1, 2, 3], ['X', 6]] -- ys changed too

zs = copy.deepcopy(xs)  # independent copy, no shared references
```

### defaultdict: no key checking

```python
from collections import defaultdict

word_count = defaultdict(int)
for word in ["apple", "banana", "apple"]:
    word_count[word] += 1  # apple: 2, banana: 1
```

### binary search with bisect

Use `bisect` for searching in sorted arrays or maintaining sorted order.

```python
import bisect

arr = [1, 3, 5, 5, 5, 7, 9]

# bisect_left:  leftmost insertion point (index of first match)
# bisect_right: rightmost insertion point (index after last match)
bisect.bisect_left(arr, 5)   # 2  (first 5)
bisect.bisect_right(arr, 5)  # 5  (after last 5)

# insort keeps the list sorted on insert
bisect.insort(arr, 6)        # [1, 3, 5, 5, 5, 6, 7, 9]
```

### dict merge + walrus

```python
# merge with unpacking
merged = {**{"a": 1}, **{"b": 2}}   # {'a': 1, 'b': 2}

# assign and test in one expression
data = list(range(11))
if (length := len(data)) > 10:
    print(f"List is long: {length} items")
```

### matrix one-liners

```python
# transpose with zip
matrix = [[8, 9, 10], [11, 12, 13]]
list(zip(*matrix))  # [(8, 11), (9, 12), (10, 13)]

# flatten
import itertools
list(itertools.chain.from_iterable([[1, 2], [3, 4], [5, 6]]))  # [1, 2, 3, 4, 5, 6]
```

### package management

Stop using `pip` directly for project management. Use `uv`:

```bash
# old way
pip install requests
pip freeze > requirements.txt

# uv (written in Rust)
uv add requests
uv sync
```

- [uv Documentation](https://github.com/astral-sh/uv)

### tuples vs lists, under the hood

The `dis` module shows the bytecode. Tuples are baked in at compile time, lists are built at runtime.

```python
import dis

dis.dis(compile("(28, 's', 'a', 'm')", "", "eval"))
#   RESUME           0
#   RETURN_CONST     0 ((28, 's', 'a', 'm'))   <- one constant

dis.dis(compile("[28, 's', 'a', 'm']", "", "eval"))
#   RESUME           0
#   BUILD_LIST       0
#   LOAD_CONST       0 ((28, 's', 'a', 'm'))
#   LIST_EXTEND      1                          <- assembled at runtime
#   RETURN_VALUE
```

That's why a constant tuple is faster than the equivalent list literal.
