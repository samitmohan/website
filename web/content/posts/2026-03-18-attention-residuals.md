---
layout: post
title: "Attention Residuals"
date:   2026-03-18 18:00:00 +0530
categories: tech
tokens: "~9k"
math: true
description: "30 lines of simple code that optimises residual networks by a margin"
tags: [llm, papers]
---

Quick context about resnets: neural networks learn by [backpropagating](/blog/nn#backpropagation) gradients through layers. The deeper the network, the more times those gradients get multiplied by small numbers (sigmoid derivatives, weight matrices). After enough layers, [gradients shrink to zero](/blog/math#1-vanishing-gradients) and early layers stop learning. This is the vanishing gradient problem, and it's why stacking more layers didn't work for a long time.

By 2015, careful initialization and [BatchNorm](/blog/math#batch-normalisation) had fixed most of the vanishing gradient problem. Deeper networks still trained worse, and ResNet fixed that in 2015. Then everyone moved on. Ten years later, Moonshot AI (the Kimi team) looked at the fix.

---

## deeper should be better

Stack more layers. Learn more complex features. Get better results. That's the intuition, and it's wrong.

In 2015, He et al. trained plain convolutional networks (no skip connections) of increasing depth on CIFAR-10. A 56-layer network has more capacity than a 20-layer network, so it should do better. It can represent everything the 20-layer net can (set the extra 36 layers to identity) plus more. 

<svg viewBox="0 0 560 344" role="img" aria-label="Bar chart of CIFAR-10 test error for plain networks: Plain-20 9.26 percent, Plain-32 10.00 percent, Plain-44 11.22 percent, Plain-56 13.58 percent" style="width:100%;max-width:520px;height:auto;display:block;margin:24px auto;font-family:var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif">
  <style>
    .dg-b0 { animation: dg-b0 10s infinite; } @keyframes dg-b0 { 0%, 4% { opacity: 0; } 6%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .dg-b1 { animation: dg-b1 10s infinite; } @keyframes dg-b1 { 0%, 18% { opacity: 0; } 20%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .dg-b2 { animation: dg-b2 10s infinite; } @keyframes dg-b2 { 0%, 32% { opacity: 0; } 34%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .dg-b3 { animation: dg-b3 10s infinite; } @keyframes dg-b3 { 0%, 46% { opacity: 0; } 48%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .dg-t { animation: dg-t 10s infinite; } @keyframes dg-t { 0%, 62% { opacity: 0; } 64%, 95% { opacity: 1; } 100% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) {
      .dg-b0, .dg-b1, .dg-b2, .dg-b3, .dg-t { animation: none; opacity: 1; }
    }
  </style>
  <text x="12" y="28" font-size="14" text-anchor="start" fill="currentColor" font-weight="600">CIFAR-10 test error, plain networks (no skip connections)</text>
  <line x1="80" y1="290.0" x2="530" y2="290.0" stroke="currentColor" stroke-opacity="0.12"/>
  <text x="74" y="294" font-size="12" text-anchor="end" fill="currentColor" fill-opacity="0.7">0%</text>
  <line x1="80" y1="216.7" x2="530" y2="216.7" stroke="currentColor" stroke-opacity="0.12"/>
  <text x="74" y="220.667" font-size="12" text-anchor="end" fill="currentColor" fill-opacity="0.7">5%</text>
  <line x1="80" y1="143.3" x2="530" y2="143.3" stroke="currentColor" stroke-opacity="0.12"/>
  <text x="74" y="147.333" font-size="12" text-anchor="end" fill="currentColor" fill-opacity="0.7">10%</text>
  <line x1="80" y1="70.0" x2="530" y2="70.0" stroke="currentColor" stroke-opacity="0.12"/>
  <text x="74" y="74" font-size="12" text-anchor="end" fill="currentColor" fill-opacity="0.7">15%</text>
  <g class="dg-b0"><rect x="110" y="154.2" width="72" height="135.8" rx="3" fill="rgba(25,113,194,0.25)" stroke="rgba(25,113,194,0.9)"/><text x="146" y="146.187" font-size="13" text-anchor="middle" fill="currentColor" font-weight="600">9.26%</text><text x="146" y="310" font-size="12" text-anchor="middle" fill="currentColor">Plain-20</text></g>
  <g class="dg-b1"><rect x="218" y="143.3" width="72" height="146.7" rx="3" fill="rgba(25,113,194,0.25)" stroke="rgba(25,113,194,0.9)"/><text x="254" y="135.333" font-size="13" text-anchor="middle" fill="currentColor" font-weight="600">10.00%</text><text x="254" y="310" font-size="12" text-anchor="middle" fill="currentColor">Plain-32</text></g>
  <g class="dg-b2"><rect x="326" y="125.4" width="72" height="164.6" rx="3" fill="rgba(25,113,194,0.25)" stroke="rgba(25,113,194,0.9)"/><text x="362" y="117.44" font-size="13" text-anchor="middle" fill="currentColor" font-weight="600">11.22%</text><text x="362" y="310" font-size="12" text-anchor="middle" fill="currentColor">Plain-44</text></g>
  <g class="dg-b3"><rect x="434" y="90.8" width="72" height="199.2" rx="3" fill="rgba(220,60,60,0.25)" stroke="rgba(220,60,60,0.9)"/><text x="470" y="82.8267" font-size="13" text-anchor="middle" fill="currentColor" font-weight="600">13.58%</text><text x="470" y="310" font-size="12" text-anchor="middle" fill="currentColor">Plain-56</text></g>
  <g class="dg-t"><text x="310" y="330" font-size="13" text-anchor="middle" fill="rgba(220,60,60,1)">more layers, higher test error and higher training error</text></g>
</svg>

*Figure: my reproduction of He et al.'s plain-network CIFAR-10 runs. Each deeper plain network has a higher test error.*

More layers, *worse* accuracy. And this isn't overfitting: the training error is also higher for deeper networks. It isn't vanishing gradients either. He et al. trained these nets with BatchNorm and checked that the backward gradients had healthy norms. The optimizer can't find a good solution for the deeper net.

The degradation problem: theoretical capacity is there, but the optimizer can't reach it.

---

## the fix: skip connections

Skip connections ([explained here](/blog/math#resnets--residual-networks)) let a block learn $F(x)$ and output $F(x) + x$. When the shape changes, the shortcut pads the extra channels with zeros (the paper's option A) or uses a 1x1 conv (option B).

In theory, extra layers can't make things worse, because the worst case is identity. In practice there is a limit. The paper's 1202-layer ResNet got 7.93% test error on CIFAR-10, worse than the 110-layer one (6.43%), and the authors blame overfitting.

---

## proof it works

Same architectures, same training setup, plus skip connections:

![Plain-20 and ResNet-20 train and test error per epoch on CIFAR-10](/assets/images/attn_res/plain_vs_residual.webp)

*Figure: Plain-20 against ResNet-20 with option A and option B shortcuts, from my reproduction. Dashed lines are training error, solid lines are test error.*

![Train and test error per epoch for plain and residual networks at 20, 32, 44 and 56 layers on CIFAR-10](/assets/images/attn_res/side_by_side.webp)

*Figure: all four depths from my reproduction. Left: plain nets, where deeper is worse on both training and test error. Right: ResNets with option A shortcuts.*

| Model | Test error (my run) | Test error (paper) |
|-------|-----------|-----------|
| Plain-20 | 9.26% | not listed |
| ResNet-20 | 8.64% | 8.75% |
| Plain-56 | 13.58% | not listed |
| ResNet-56 | 7.47% | 6.97% |

The paper numbers come from its Table 6. The paper shows plain nets only as curves (Figure 6).

Plain-56 was the worst model. ResNet-56 is the best. Skip connections fix the degradation problem and let deeper networks use their capacity.

The full implementation with training code, plots, and all ResNet variants: [deep-residual-learning-pytorch](https://github.com/samitmohan/deep-residual-learning-pytorch)

`x = x + F(x)` became the default wiring for ResNets, [transformers](/blog/how-chatgpt-works#the-transformer), and diffusion models alike. Researchers tried variants (Highway gates, ReZero, LayerScale, DenseFormer), but the plain sum stayed the default for ten years.

---

## the one line nobody questioned

```python
x = x + self.attn(self.norm1(x))  # this is in every LLM ever
```

But the weight on every layer's contribution is exactly **1.0**. Layer 1 gets the same importance as layer 64. The initial embedding gets the same weight as the final attention output. That's kinda dumb if you think about it.

Moonshot thought about it.

---

## three problems with `x = x + Layer(x)`

### 1. magnitude growth

64-layer transformer. After all layers, your hidden state is:

```
h_64 = x_0 + F_1(x_0) + F_2(h_1) + ... + F_64(h_63)
```

65 terms. All added with weight 1.0. What happens to the norm?

```python
import torch
import torch.nn as nn

torch.manual_seed(42)
d = 512
n_layers = 64

x = torch.randn(1, 10, d)
layers = nn.ModuleList([nn.Linear(d, d, bias=False) for _ in range(n_layers)])

norms = [x.norm().item()]
for layer in layers:
    with torch.no_grad():
        x = x + layer(x)
    norms.append(x.norm().item())

for i in [0, 8, 16, 32, 64]:
    print(f"After layer {i:2d}: norm = {norms[i]:.1f}")
```

Output: `72 -> 227 -> 725 -> 7241 -> 730954`

About 10,000x growth (730954 / 71.7 = 10,190). No single layer does anything extreme. Each one multiplies the norm by about 1.155, and 64 of those compound in a running sum with no normalization.

The 1.155 is not an accident. `nn.Linear` starts its weights uniform in $\pm 1/\sqrt{d}$, so $W x$ has about $1/\sqrt{3}$ the norm of $x$ and points in an unrelated direction. Then $\|x + Wx\|^2 \approx (1 + 1/3)\|x\|^2$, and each layer multiplies the norm by $\sqrt{4/3} \approx 1.1547$. Slide the depth. Watch the hidden norm explode under vanilla residuals.

<style>
.rg-w{background:var(--surface);color:var(--ink);border-radius:12px;padding:16px 20px;margin:24px 0;font-family:inherit}
.rg-w label{font-size:14px;display:block;margin-bottom:6px}
.rg-w input[type=range]{width:100%;margin:8px 0;accent-color:var(--ink)}
.rg-w svg{display:block;width:100%;height:auto}
.rg-w .result{font-size:16px;font-weight:600;margin-top:8px;font-family:var(--font-mono,monospace)}
.rg-w .result span{color:var(--accent)}
.rg-w .note{font-size:13px;color:var(--muted);margin-top:4px}
</style>
<div class="rg-w">
  <label>Number of layers: <strong id="rg-count">64</strong></label>
  <input type="range" min="4" max="96" value="64" id="rg-slider" aria-label="Number of layers">
  <svg id="rg-plot" viewBox="0 0 560 220" role="img" aria-label="Norm growth on a log scale: the line is the expected growth, the dots are the norms measured with the PyTorch code above"></svg>
  <div class="result">‖h‖ grows <span id="rg-ratio">9,955x</span></div>
  <div class="note" id="rg-note">expected (4/3)^(L/2); line = expected, dots = measured in PyTorch (seed 42)</div>
</div>
<script>
lazyWidget('rg-plot', function(){
  var measured = [[0,71.7],[8,227.1],[16,724.9],[24,2327.1],[32,7240.7],[40,23427.4],[48,74300.9],[56,235073.7],[64,730953.6]];
  var slider = document.getElementById('rg-slider'), svg = document.getElementById('rg-plot');
  var x0 = 52, x1 = 548, y0 = 196, y1 = 12, maxDec = 6;
  function y(r){ return y0 - (Math.log10(r) / maxDec) * (y0 - y1); }
  function draw(){
    var L = parseInt(slider.value, 10), s = '';
    for (var d = 0; d <= maxDec; d++) {
      var yy = y(Math.pow(10, d)).toFixed(1);
      s += '<line x1="' + x0 + '" y1="' + yy + '" x2="' + x1 + '" y2="' + yy + '" stroke="currentColor" stroke-opacity="0.12"/>';
      s += '<text x="' + (x0 - 6) + '" y="' + (+yy + 4) + '" font-size="11" text-anchor="end" fill="currentColor" fill-opacity="0.7">' + ['1x','10x','100x','1Kx','10Kx','100Kx','1Mx'][d] + '</text>';
    }
    var pts = [];
    for (var l = 0; l <= L; l++) pts.push((x0 + (x1 - x0) * l / L).toFixed(1) + ',' + y(Math.pow(4/3, l/2)).toFixed(1));
    s += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="rgba(220,60,60,1)" stroke-width="2"/>';
    measured.forEach(function(m){ if (m[0] <= L) s += '<circle cx="' + (x0 + (x1 - x0) * m[0] / L).toFixed(1) + '" cy="' + y(m[1] / 71.7).toFixed(1) + '" r="4" fill="rgba(25,113,194,1)"/>'; });
    s += '<text x="' + x0 + '" y="214" font-size="11" fill="currentColor" fill-opacity="0.7">layer 0</text><text x="' + x1 + '" y="214" font-size="11" text-anchor="end" fill="currentColor" fill-opacity="0.7">layer ' + L + '</text>';
    svg.innerHTML = s;
    document.getElementById('rg-count').textContent = L;
    document.getElementById('rg-ratio').textContent = Math.round(Math.pow(4/3, L/2)).toLocaleString('en-US') + 'x';
  }
  slider.addEventListener('input', draw);
  draw();
});
</script>

### 2. information dilution

> imagine a meeting with 64 people. everyone speaks for exactly one minute. at the end you write a summary but you're forced to weight everyone equally.

That's standard residuals. After 64 layers, each layer contributes ~1.5% of the final hidden state (1/65, if every term has the same size). Layer 47 found a critical pattern between two tokens. Same weight as layer 3, which just copied the embedding.

<svg viewBox="0 0 560 360" role="img" aria-label="Three columns for 4, 16 and 64 layers. One layer owns 20.0 percent, 5.9 percent and 1.5 percent of the residual sum" style="width:100%;max-width:520px;height:auto;display:block;margin:24px auto;font-family:var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif">
  <style>
    .dl-c0 { animation: dl-c0 10s infinite; } @keyframes dl-c0 { 0%, 4% { opacity: 0; } 6%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .dl-c1 { animation: dl-c1 10s infinite; } @keyframes dl-c1 { 0%, 26% { opacity: 0; } 28%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .dl-c2 { animation: dl-c2 10s infinite; } @keyframes dl-c2 { 0%, 48% { opacity: 0; } 50%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .dl-t { animation: dl-t 10s infinite; } @keyframes dl-t { 0%, 70% { opacity: 0; } 72%, 95% { opacity: 1; } 100% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) {
      .dl-c0, .dl-c1, .dl-c2, .dl-t { animation: none; opacity: 1; }
    }
  </style>
  <text x="12" y="28" font-size="14" text-anchor="start" fill="currentColor" font-weight="600">Share of the residual sum that one layer owns</text>
  <g class="dl-c0"><text x="105" y="58" font-size="13" text-anchor="middle" fill="currentColor" font-weight="600">4 layers</text><rect x="60" y="70" width="90" height="220" rx="4" fill="rgba(25,113,194,0.10)" stroke="rgba(25,113,194,0.6)"/><line x1="60" y1="114.0" x2="150" y2="114.0" stroke="rgba(25,113,194,0.35)" stroke-width="0.6"/><line x1="60" y1="158.0" x2="150" y2="158.0" stroke="rgba(25,113,194,0.35)" stroke-width="0.6"/><line x1="60" y1="202.0" x2="150" y2="202.0" stroke="rgba(25,113,194,0.35)" stroke-width="0.6"/><line x1="60" y1="246.0" x2="150" y2="246.0" stroke="rgba(25,113,194,0.35)" stroke-width="0.6"/><rect x="60" y="158.0" width="90" height="44.0" fill="rgba(220,60,60,0.75)"/><text x="105" y="312" font-size="13" text-anchor="middle" fill="rgba(220,60,60,1)">one layer: 20.0%</text></g>
  <g class="dl-c1"><text x="275" y="58" font-size="13" text-anchor="middle" fill="currentColor" font-weight="600">16 layers</text><rect x="230" y="70" width="90" height="220" rx="4" fill="rgba(25,113,194,0.10)" stroke="rgba(25,113,194,0.6)"/><line x1="230" y1="82.9" x2="320" y2="82.9" stroke="rgba(25,113,194,0.35)" stroke-width="0.6"/><line x1="230" y1="95.9" x2="320" y2="95.9" stroke="rgba(25,113,194,0.35)" stroke-width="0.6"/><line x1="230" y1="108.8" x2="320" y2="108.8" stroke="rgba(25,113,194,0.35)" stroke-width="0.6"/><line x1="230" y1="121.8" x2="320" y2="121.8" stroke="rgba(25,113,194,0.35)" stroke-width="0.6"/><line x1="230" y1="134.7" x2="320" y2="134.7" stroke="rgba(25,113,194,0.35)" stroke-width="0.6"/><line x1="230" y1="147.6" x2="320" y2="147.6" stroke="rgba(25,113,194,0.35)" stroke-width="0.6"/><line x1="230" y1="160.6" x2="320" y2="160.6" stroke="rgba(25,113,194,0.35)" stroke-width="0.6"/><line x1="230" y1="173.5" x2="320" y2="173.5" stroke="rgba(25,113,194,0.35)" stroke-width="0.6"/><line x1="230" y1="186.5" x2="320" y2="186.5" stroke="rgba(25,113,194,0.35)" stroke-width="0.6"/><line x1="230" y1="199.4" x2="320" y2="199.4" stroke="rgba(25,113,194,0.35)" stroke-width="0.6"/><line x1="230" y1="212.4" x2="320" y2="212.4" stroke="rgba(25,113,194,0.35)" stroke-width="0.6"/><line x1="230" y1="225.3" x2="320" y2="225.3" stroke="rgba(25,113,194,0.35)" stroke-width="0.6"/><line x1="230" y1="238.2" x2="320" y2="238.2" stroke="rgba(25,113,194,0.35)" stroke-width="0.6"/><line x1="230" y1="251.2" x2="320" y2="251.2" stroke="rgba(25,113,194,0.35)" stroke-width="0.6"/><line x1="230" y1="264.1" x2="320" y2="264.1" stroke="rgba(25,113,194,0.35)" stroke-width="0.6"/><line x1="230" y1="277.1" x2="320" y2="277.1" stroke="rgba(25,113,194,0.35)" stroke-width="0.6"/><rect x="230" y="173.5" width="90" height="12.9" fill="rgba(220,60,60,0.75)"/><text x="275" y="312" font-size="13" text-anchor="middle" fill="rgba(220,60,60,1)">one layer: 5.9%</text></g>
  <g class="dl-c2"><text x="445" y="58" font-size="13" text-anchor="middle" fill="currentColor" font-weight="600">64 layers</text><rect x="400" y="70" width="90" height="220" rx="4" fill="rgba(25,113,194,0.10)" stroke="rgba(25,113,194,0.6)"/><rect x="400" y="178.3" width="90" height="3.4" fill="rgba(220,60,60,0.75)"/><text x="445" y="312" font-size="13" text-anchor="middle" fill="rgba(220,60,60,1)">one layer: 1.5%</text></g>
  <g class="dl-t"><text x="280" y="346" font-size="13" text-anchor="middle" fill="currentColor">deeper network, smaller share per layer: 1 / (n + 1)</text></g>
</svg>

*Figure: the residual sum holds the embedding plus n layer outputs. If all terms have the same size, one layer owns 1/(n + 1) of it.*

The deeper your network, the less any individual layer matters. A 128-layer model gives each layer about half the share of a 64-layer model (1/129 against 1/65).

### 3. prenorm makes it worse

PreNorm should fix this. It normalizes the input of each sub-layer (the 2017 transformer used PostNorm, which normalizes after the add):

```python
x = x + self.attn(self.norm1(x))  # norm bounds the input
```

The input to attention has a fixed scale, so its output stays near a fixed size. But you're adding that output to `x`, which is the ever-growing running sum. Each new layer's signal is a smaller and smaller fraction of the total.

<svg viewBox="0 0 560 366" role="img" aria-label="Stacked bars for layers 1 to 8: the running sum grows by one unit per layer while each new layer adds one unit, so the new layer's share falls from 50 percent to 11 percent" style="width:100%;max-width:520px;height:auto;display:block;margin:24px auto;font-family:var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif">
  <style>
    .pn-b0 { animation: pn-b0 10s infinite; } @keyframes pn-b0 { 0%, 2% { opacity: 0; } 4%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .pn-b1 { animation: pn-b1 10s infinite; } @keyframes pn-b1 { 0%, 10% { opacity: 0; } 12%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .pn-b2 { animation: pn-b2 10s infinite; } @keyframes pn-b2 { 0%, 18% { opacity: 0; } 20%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .pn-b3 { animation: pn-b3 10s infinite; } @keyframes pn-b3 { 0%, 26% { opacity: 0; } 28%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .pn-b4 { animation: pn-b4 10s infinite; } @keyframes pn-b4 { 0%, 34% { opacity: 0; } 36%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .pn-b5 { animation: pn-b5 10s infinite; } @keyframes pn-b5 { 0%, 42% { opacity: 0; } 44%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .pn-b6 { animation: pn-b6 10s infinite; } @keyframes pn-b6 { 0%, 50% { opacity: 0; } 52%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .pn-b7 { animation: pn-b7 10s infinite; } @keyframes pn-b7 { 0%, 58% { opacity: 0; } 60%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .pn-t { animation: pn-t 10s infinite; } @keyframes pn-t { 0%, 72% { opacity: 0; } 74%, 95% { opacity: 1; } 100% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) {
      .pn-b0, .pn-b1, .pn-b2, .pn-b3, .pn-b4, .pn-b5, .pn-b6, .pn-b7, .pn-t { animation: none; opacity: 1; }
    }
  </style>
  <text x="12" y="28" font-size="14" text-anchor="start" fill="currentColor" font-weight="600">PreNorm: bounded layer output, growing running sum</text>
  <rect x="330" y="40" width="12" height="12" fill="rgba(25,113,194,0.35)" stroke="rgba(25,113,194,0.9)"/><text x="348" y="50" font-size="12" text-anchor="start" fill="currentColor">running sum x</text>
  <rect x="330" y="58" width="12" height="12" fill="rgba(220,60,60,0.6)" stroke="rgba(220,60,60,0.9)"/><text x="348" y="68" font-size="12" text-anchor="start" fill="currentColor">new Layer(Norm(x))</text>
  <g class="pn-b0"><rect x="40" y="287.0" width="44" height="23" fill="rgba(25,113,194,0.35)" stroke="rgba(25,113,194,0.9)"/><rect x="40" y="264.0" width="44" height="23" fill="rgba(220,60,60,0.6)" stroke="rgba(220,60,60,0.9)"/><text x="62" y="258" font-size="12" text-anchor="middle" fill="currentColor" font-weight="600">50%</text><text x="62" y="328" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">L1</text></g>
  <g class="pn-b1"><rect x="102" y="264.0" width="44" height="46" fill="rgba(25,113,194,0.35)" stroke="rgba(25,113,194,0.9)"/><rect x="102" y="241.0" width="44" height="23" fill="rgba(220,60,60,0.6)" stroke="rgba(220,60,60,0.9)"/><text x="124" y="235" font-size="12" text-anchor="middle" fill="currentColor" font-weight="600">33%</text><text x="124" y="328" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">L2</text></g>
  <g class="pn-b2"><rect x="164" y="241.0" width="44" height="69" fill="rgba(25,113,194,0.35)" stroke="rgba(25,113,194,0.9)"/><rect x="164" y="218.0" width="44" height="23" fill="rgba(220,60,60,0.6)" stroke="rgba(220,60,60,0.9)"/><text x="186" y="212" font-size="12" text-anchor="middle" fill="currentColor" font-weight="600">25%</text><text x="186" y="328" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">L3</text></g>
  <g class="pn-b3"><rect x="226" y="218.0" width="44" height="92" fill="rgba(25,113,194,0.35)" stroke="rgba(25,113,194,0.9)"/><rect x="226" y="195.0" width="44" height="23" fill="rgba(220,60,60,0.6)" stroke="rgba(220,60,60,0.9)"/><text x="248" y="189" font-size="12" text-anchor="middle" fill="currentColor" font-weight="600">20%</text><text x="248" y="328" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">L4</text></g>
  <g class="pn-b4"><rect x="288" y="195.0" width="44" height="115" fill="rgba(25,113,194,0.35)" stroke="rgba(25,113,194,0.9)"/><rect x="288" y="172.0" width="44" height="23" fill="rgba(220,60,60,0.6)" stroke="rgba(220,60,60,0.9)"/><text x="310" y="166" font-size="12" text-anchor="middle" fill="currentColor" font-weight="600">17%</text><text x="310" y="328" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">L5</text></g>
  <g class="pn-b5"><rect x="350" y="172.0" width="44" height="138" fill="rgba(25,113,194,0.35)" stroke="rgba(25,113,194,0.9)"/><rect x="350" y="149.0" width="44" height="23" fill="rgba(220,60,60,0.6)" stroke="rgba(220,60,60,0.9)"/><text x="372" y="143" font-size="12" text-anchor="middle" fill="currentColor" font-weight="600">14%</text><text x="372" y="328" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">L6</text></g>
  <g class="pn-b6"><rect x="412" y="149.0" width="44" height="161" fill="rgba(25,113,194,0.35)" stroke="rgba(25,113,194,0.9)"/><rect x="412" y="126.0" width="44" height="23" fill="rgba(220,60,60,0.6)" stroke="rgba(220,60,60,0.9)"/><text x="434" y="120" font-size="12" text-anchor="middle" fill="currentColor" font-weight="600">12.5%</text><text x="434" y="328" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">L7</text></g>
  <g class="pn-b7"><rect x="474" y="126.0" width="44" height="184" fill="rgba(25,113,194,0.35)" stroke="rgba(25,113,194,0.9)"/><rect x="474" y="103.0" width="44" height="23" fill="rgba(220,60,60,0.6)" stroke="rgba(220,60,60,0.9)"/><text x="496" y="97" font-size="12" text-anchor="middle" fill="currentColor" font-weight="600">11%</text><text x="496" y="328" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">L8</text></g>
  <g class="pn-t"><text x="280" y="352" font-size="13" text-anchor="middle" fill="rgba(220,60,60,1)">the new layer owns 1 / (l + 1) of the sum after layer l</text></g>
</svg>

*Figure: a toy PreNorm stack. The sum starts at 1 (the embedding), and each layer adds an output of size 1 in the same direction. The newest layer's share falls as 1/(l + 1).*

In a 64-layer PreNorm transformer, the last layers own a small share of the sum. Bounded output, unbounded accumulator. The paper measures this in its baseline. The output size of each block grows with depth (Figure 5b). Deeper layers must learn bigger outputs to stay relevant.

PreNorm solved gradient flow but not dilution. It made dilution worse.

---

## the fix: attention over depth

Fix: let the network **learn** the weights. Use [attention](/blog/how-chatgpt-works#how-attention-works), but attend over **depth** instead of over sequence positions. Before each layer, the network looks at the outputs of all earlier layers and decides which ones matter.

<svg viewBox="0 0 560 344" role="img" aria-label="Two bar charts over 8 earlier outputs. Standard residual gives each 12.5 percent. An example attention residual gives 5, 35, 8, 3, 12, 25, 2 and 10 percent" style="width:100%;max-width:520px;height:auto;display:block;margin:24px auto;font-family:var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif">
  <style>
    .wc-l { animation: wc-l 10s infinite; } @keyframes wc-l { 0%, 2% { opacity: 0; } 4%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .wc-r { animation: wc-r 10s infinite; } @keyframes wc-r { 0%, 30% { opacity: 0; } 32%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .wc-t { animation: wc-t 10s infinite; } @keyframes wc-t { 0%, 60% { opacity: 0; } 62%, 95% { opacity: 1; } 100% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) {
      .wc-l, .wc-r, .wc-t { animation: none; opacity: 1; }
    }
  </style>
  <g class="wc-l"><text x="140" y="30" font-size="14" text-anchor="middle" fill="rgba(25,113,194,1)" font-weight="600">Standard residual</text><text x="140" y="48" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">weight 1 each: 12.5% if all equal size</text><rect x="24" y="217.5" width="24" height="62.5" rx="2" fill="rgba(25,113,194,0.3)" stroke="rgba(25,113,194,0.9)"/><text x="36" y="296" font-size="11" text-anchor="middle" fill="currentColor" fill-opacity="0.7">L1</text><rect x="54" y="217.5" width="24" height="62.5" rx="2" fill="rgba(25,113,194,0.3)" stroke="rgba(25,113,194,0.9)"/><text x="66" y="296" font-size="11" text-anchor="middle" fill="currentColor" fill-opacity="0.7">L2</text><rect x="84" y="217.5" width="24" height="62.5" rx="2" fill="rgba(25,113,194,0.3)" stroke="rgba(25,113,194,0.9)"/><text x="96" y="296" font-size="11" text-anchor="middle" fill="currentColor" fill-opacity="0.7">L3</text><rect x="114" y="217.5" width="24" height="62.5" rx="2" fill="rgba(25,113,194,0.3)" stroke="rgba(25,113,194,0.9)"/><text x="126" y="296" font-size="11" text-anchor="middle" fill="currentColor" fill-opacity="0.7">L4</text><rect x="144" y="217.5" width="24" height="62.5" rx="2" fill="rgba(25,113,194,0.3)" stroke="rgba(25,113,194,0.9)"/><text x="156" y="296" font-size="11" text-anchor="middle" fill="currentColor" fill-opacity="0.7">L5</text><rect x="174" y="217.5" width="24" height="62.5" rx="2" fill="rgba(25,113,194,0.3)" stroke="rgba(25,113,194,0.9)"/><text x="186" y="296" font-size="11" text-anchor="middle" fill="currentColor" fill-opacity="0.7">L6</text><rect x="204" y="217.5" width="24" height="62.5" rx="2" fill="rgba(25,113,194,0.3)" stroke="rgba(25,113,194,0.9)"/><text x="216" y="296" font-size="11" text-anchor="middle" fill="currentColor" fill-opacity="0.7">L7</text><rect x="234" y="217.5" width="24" height="62.5" rx="2" fill="rgba(25,113,194,0.3)" stroke="rgba(25,113,194,0.9)"/><text x="246" y="296" font-size="11" text-anchor="middle" fill="currentColor" fill-opacity="0.7">L8</text><text x="140" y="207.5" font-size="12" text-anchor="middle" fill="currentColor" font-weight="600">12.5% each</text></g>
  <line x1="280" y1="20" x2="280" y2="300" stroke="currentColor" stroke-opacity="0.15" stroke-dasharray="4 4"/>
  <g class="wc-r"><text x="420" y="30" font-size="14" text-anchor="middle" fill="rgba(156,54,181,1)" font-weight="600">Attention residual</text><text x="420" y="48" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">example weights, softmax sums to 100%</text><rect x="304" y="255.0" width="24" height="25.0" rx="2" fill="rgba(156,54,181,0.3)" stroke="rgba(156,54,181,0.9)"/><text x="316" y="250" font-size="11" text-anchor="middle" fill="currentColor">5%</text><text x="316" y="296" font-size="11" text-anchor="middle" fill="currentColor" fill-opacity="0.7">L1</text><rect x="334" y="105.0" width="24" height="175.0" rx="2" fill="rgba(220,60,60,0.3)" stroke="rgba(220,60,60,0.9)"/><text x="346" y="100" font-size="11" text-anchor="middle" fill="currentColor">35%</text><text x="346" y="296" font-size="11" text-anchor="middle" fill="currentColor" fill-opacity="0.7">L2</text><rect x="364" y="240.0" width="24" height="40.0" rx="2" fill="rgba(156,54,181,0.3)" stroke="rgba(156,54,181,0.9)"/><text x="376" y="235" font-size="11" text-anchor="middle" fill="currentColor">8%</text><text x="376" y="296" font-size="11" text-anchor="middle" fill="currentColor" fill-opacity="0.7">L3</text><rect x="394" y="265.0" width="24" height="15.0" rx="2" fill="rgba(156,54,181,0.3)" stroke="rgba(156,54,181,0.9)"/><text x="406" y="260" font-size="11" text-anchor="middle" fill="currentColor">3%</text><text x="406" y="296" font-size="11" text-anchor="middle" fill="currentColor" fill-opacity="0.7">L4</text><rect x="424" y="220.0" width="24" height="60.0" rx="2" fill="rgba(156,54,181,0.3)" stroke="rgba(156,54,181,0.9)"/><text x="436" y="215" font-size="11" text-anchor="middle" fill="currentColor">12%</text><text x="436" y="296" font-size="11" text-anchor="middle" fill="currentColor" fill-opacity="0.7">L5</text><rect x="454" y="155.0" width="24" height="125.0" rx="2" fill="rgba(220,60,60,0.3)" stroke="rgba(220,60,60,0.9)"/><text x="466" y="150" font-size="11" text-anchor="middle" fill="currentColor">25%</text><text x="466" y="296" font-size="11" text-anchor="middle" fill="currentColor" fill-opacity="0.7">L6</text><rect x="484" y="270.0" width="24" height="10.0" rx="2" fill="rgba(156,54,181,0.3)" stroke="rgba(156,54,181,0.9)"/><text x="496" y="265" font-size="11" text-anchor="middle" fill="currentColor">2%</text><text x="496" y="296" font-size="11" text-anchor="middle" fill="currentColor" fill-opacity="0.7">L7</text><rect x="514" y="230.0" width="24" height="50.0" rx="2" fill="rgba(156,54,181,0.3)" stroke="rgba(156,54,181,0.9)"/><text x="526" y="225" font-size="11" text-anchor="middle" fill="currentColor">10%</text><text x="526" y="296" font-size="11" text-anchor="middle" fill="currentColor" fill-opacity="0.7">L8</text></g>
  <g class="wc-t"><text x="280" y="330" font-size="13" text-anchor="middle" fill="currentColor">the learned query decides which earlier outputs count</text></g>
</svg>

*Figure: an illustration, not measured weights. The paper's Figure 8 shows the weights a trained model with 16 attention and 16 MLP layers learns.*

Standard residual: every layer gets 12.5%. Attention residual: layer 2 gets 35%, layer 6 gets 25%, the rest share what's left. The network figures out what matters.

---

## the math (it's short)

The paper counts each attention and each MLP as its own layer. Let $h_l$ be the input to layer $l$, $h_1$ the token embedding, and $f_i$ layer $i$ without its residual add. A standard residual unfolds to an equal-weight sum:

$$
h_l = h_1 + \sum_{i=1}^{l-1} f_i(h_i)
$$

Attention residual replaces this with:

$$
h_l = \sum_{i=0}^{l-1} \alpha_{i \to l} \cdot v_i
$$

Where:
- $v_0 = h_1$ is the token embedding, and $v_i = f_i(h_i)$ is the raw output of layer $i$
- $\alpha_{i \to l} = \text{softmax}_i\left(w_l^\top \text{RMSNorm}(v_i)\right)$ is the attention weight, a softmax over the $l$ sources with no $1/\sqrt{d}$ scale
- $w_l$ is a **learned query vector** per layer, one $d$-dim vector that does not depend on the input. The weights still depend on the input through the $v_i$

RMSNorm (root-mean-square normalization) divides a vector by its RMS. So the scores depend on the *direction* of each layer's output, not its magnitude. It applies to the keys only: the values $v_i$ stay raw. Without it, layers with bigger outputs would dominate the softmax. In the paper's ablation, removing it raises the loss from 1.737 to 1.743.

$w_l$ is **zero-initialized**. When $w = 0$, all dot products are 0, softmax gives uniform weights. Start from democracy, learn to specialize. LoRA (low-rank adaptation) uses the same trick: its update matrix $B$ starts at zero.

<svg viewBox="0 0 560 352" role="img" aria-label="Depth attention for layer 5 at initialization: five sources v0 to v4, keys are RMSNorm of each source, the zero query gives every score 0, softmax gives every source weight 0.2, and h5 is the average of the five raw sources" style="width:100%;max-width:520px;height:auto;display:block;margin:24px auto;font-family:var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif">
  <style>
    .da-v { animation: da-v 10s infinite; } @keyframes da-v { 0%, 2% { opacity: 0; } 4%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .da-k { animation: da-k 10s infinite; } @keyframes da-k { 0%, 16% { opacity: 0; } 18%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .da-q { animation: da-q 10s infinite; } @keyframes da-q { 0%, 30% { opacity: 0; } 32%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .da-s { animation: da-s 10s infinite; } @keyframes da-s { 0%, 44% { opacity: 0; } 46%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .da-w { animation: da-w 10s infinite; } @keyframes da-w { 0%, 58% { opacity: 0; } 60%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .da-o { animation: da-o 10s infinite; } @keyframes da-o { 0%, 74% { opacity: 0; } 76%, 95% { opacity: 1; } 100% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) {
      .da-v, .da-k, .da-q, .da-s, .da-w, .da-o { animation: none; opacity: 1; }
    }
  </style>
  <defs><marker id="da-a" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M1,1 L8,5 L1,9" fill="none" stroke="rgba(120,120,120,1)" stroke-width="1.5"/></marker></defs>
  <text x="12" y="28" font-size="14" text-anchor="start" fill="currentColor" font-weight="600">Depth attention for layer 5, at step 0 (w5 = 0)</text>
  <g class="da-v"><rect x="12" y="54" width="150" height="32" rx="6" fill="rgba(25,113,194,0.12)" stroke="rgba(25,113,194,0.8)"/><text x="87" y="75" font-size="12" text-anchor="middle" fill="currentColor">v0 = h1 (embedding)</text><rect x="12" y="100" width="150" height="32" rx="6" fill="rgba(25,113,194,0.12)" stroke="rgba(25,113,194,0.8)"/><text x="87" y="121" font-size="12" text-anchor="middle" fill="currentColor">v1 = f1(h1)</text><rect x="12" y="146" width="150" height="32" rx="6" fill="rgba(25,113,194,0.12)" stroke="rgba(25,113,194,0.8)"/><text x="87" y="167" font-size="12" text-anchor="middle" fill="currentColor">v2 = f2(h2)</text><rect x="12" y="192" width="150" height="32" rx="6" fill="rgba(25,113,194,0.12)" stroke="rgba(25,113,194,0.8)"/><text x="87" y="213" font-size="12" text-anchor="middle" fill="currentColor">v3 = f3(h3)</text><rect x="12" y="238" width="150" height="32" rx="6" fill="rgba(25,113,194,0.12)" stroke="rgba(25,113,194,0.8)"/><text x="87" y="259" font-size="12" text-anchor="middle" fill="currentColor">v4 = f4(h4)</text></g>
  <g class="da-k"><line x1="166" y1="70" x2="190" y2="70" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#da-a)"/><text x="244" y="75" font-size="12" text-anchor="middle" fill="currentColor">RMSNorm(v0)</text><line x1="166" y1="116" x2="190" y2="116" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#da-a)"/><text x="244" y="121" font-size="12" text-anchor="middle" fill="currentColor">RMSNorm(v1)</text><line x1="166" y1="162" x2="190" y2="162" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#da-a)"/><text x="244" y="167" font-size="12" text-anchor="middle" fill="currentColor">RMSNorm(v2)</text><line x1="166" y1="208" x2="190" y2="208" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#da-a)"/><text x="244" y="213" font-size="12" text-anchor="middle" fill="currentColor">RMSNorm(v3)</text><line x1="166" y1="254" x2="190" y2="254" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#da-a)"/><text x="244" y="259" font-size="12" text-anchor="middle" fill="currentColor">RMSNorm(v4)</text><text x="244" y="52" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">keys</text></g>
  <g class="da-q"><rect x="300" y="36" width="110" height="28" rx="6" fill="rgba(156,54,181,0.12)" stroke="rgba(156,54,181,0.8)"/><text x="355" y="55" font-size="12" text-anchor="middle" fill="currentColor">query w5 = 0</text></g>
  <g class="da-s"><text x="356" y="75" font-size="12" text-anchor="middle" fill="currentColor">w5 · k = 0</text><text x="356" y="121" font-size="12" text-anchor="middle" fill="currentColor">w5 · k = 0</text><text x="356" y="167" font-size="12" text-anchor="middle" fill="currentColor">w5 · k = 0</text><text x="356" y="213" font-size="12" text-anchor="middle" fill="currentColor">w5 · k = 0</text><text x="356" y="259" font-size="12" text-anchor="middle" fill="currentColor">w5 · k = 0</text></g>
  <g class="da-w"><rect x="420" y="62" width="24" height="16" fill="rgba(34,158,68,0.4)" stroke="rgba(34,158,68,0.9)"/><text x="452" y="75" font-size="12" text-anchor="start" fill="currentColor">α = 0.2</text><rect x="420" y="108" width="24" height="16" fill="rgba(34,158,68,0.4)" stroke="rgba(34,158,68,0.9)"/><text x="452" y="121" font-size="12" text-anchor="start" fill="currentColor">α = 0.2</text><rect x="420" y="154" width="24" height="16" fill="rgba(34,158,68,0.4)" stroke="rgba(34,158,68,0.9)"/><text x="452" y="167" font-size="12" text-anchor="start" fill="currentColor">α = 0.2</text><rect x="420" y="200" width="24" height="16" fill="rgba(34,158,68,0.4)" stroke="rgba(34,158,68,0.9)"/><text x="452" y="213" font-size="12" text-anchor="start" fill="currentColor">α = 0.2</text><rect x="420" y="246" width="24" height="16" fill="rgba(34,158,68,0.4)" stroke="rgba(34,158,68,0.9)"/><text x="452" y="259" font-size="12" text-anchor="start" fill="currentColor">α = 0.2</text></g>
  <g class="da-o"><text x="280" y="316" font-size="13" text-anchor="middle" fill="currentColor" font-weight="600">softmax(0, 0, 0, 0, 0) = 0.2 each, so h5 = (v0 + v1 + v2 + v3 + v4) / 5</text><text x="280" y="338" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">values stay raw: only the keys go through RMSNorm</text></g>
</svg>

*Figure: one depth-attention step for layer 5 at step 0. The zero query gives every source the same score, so each weight is 0.2 and h5 is the average of the five raw sources.*

```python
import torch
import torch.nn.functional as F

w = torch.zeros(512)         # zero-initialized query
keys = torch.randn(8, 512)  # 8 checkpoint states

scores = keys @ w            # one score per checkpoint
weights = F.softmax(scores, dim=0)

print("Weights:", [f"{v:.4f}" for v in weights.tolist()])
# [0.1250, 0.1250, 0.1250, 0.1250, 0.1250, 0.1250, 0.1250, 0.1250]
```

$w = 0$ -> all dot products are 0 -> softmax gives uniform 1/8 weights. You start from averaging everything equally (which is reasonable), then the model learns to specialize.

The zero-init of the last BatchNorm scale in each ResNet block (Goyal et al., 2017) follows the same principle. 

---

## full attnres vs block attnres

Full AttnRes lets every layer attend over all previous outputs. Per token, that costs $O(L^2 d)$ compute and $O(Ld)$ memory. On one GPU this is cheap, because backprop keeps those outputs in memory anyway. At scale it gets expensive: with activation recomputation and pipeline parallelism, the system must now keep all $L$ outputs and send them between devices.

```python
# Full AttnRes: depth attention before EVERY layer
sources = [x]                       # v_0 = token embedding
for i, f in enumerate(layers):      # f = one attention or MLP layer, no residual add
    h = depth_attns[i](sources)     # attend over all previous outputs
    sources.append(f(h))            # list grows: 1, 2, 3, ... L
```

Layer 32 attends over 32 sources (the embedding plus 31 outputs). Layer 64 attends over 64. The source list grows linearly, and each attention call scales with its length.

Block AttnRes is the version Moonshot trains at scale. Split the 64 layers into 8 blocks of 8. Inside a block, layer outputs add up into a partial sum, like a standard residual stream. Depth attention still runs before every layer, but only over the finished block sums and the current partial sum:

- $b_0$ is the token embedding
- Layers 1-8: layer 1 attends over $\{b_0\}$, and each later layer attends over $\{b_0\}$ plus the partial sum. After layer 8, the partial sum becomes $b_1$
- Layers 9-16: each layer attends over $\{b_0, b_1\}$ plus the partial sum. After layer 16, it becomes $b_2$
- ...repeat. A layer in the last block attends over at most 9 sources: $b_0$ to $b_7$ plus the partial sum

<svg viewBox="0 0 560 354" role="img" aria-label="Block attention residuals with 12 layers in blocks of 4. Layer 11 attends over the embedding b0, the block sums b1 and b2, and the partial sum of layers 9 and 10, then adds its output to the partial sum" style="width:100%;max-width:520px;height:auto;display:block;margin:24px auto;font-family:var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif">
  <style>
    .bl-strip { animation: bl-strip 10s infinite; } @keyframes bl-strip { 0%, 2% { opacity: 0; } 4%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .bl-src { animation: bl-src 10s infinite; } @keyframes bl-src { 0%, 22% { opacity: 0; } 24%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .bl-att { animation: bl-att 10s infinite; } @keyframes bl-att { 0%, 38% { opacity: 0; } 40%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .bl-f { animation: bl-f 10s infinite; } @keyframes bl-f { 0%, 52% { opacity: 0; } 54%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .bl-p { animation: bl-p 10s infinite; } @keyframes bl-p { 0%, 64% { opacity: 0; } 66%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .bl-end { animation: bl-end 10s infinite; } @keyframes bl-end { 0%, 78% { opacity: 0; } 80%, 95% { opacity: 1; } 100% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) {
      .bl-strip, .bl-src, .bl-att, .bl-f, .bl-p, .bl-end { animation: none; opacity: 1; }
    }
  </style>
  <defs><marker id="bl-a" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M1,1 L8,5 L1,9" fill="none" stroke="rgba(120,120,120,1)" stroke-width="1.5"/></marker></defs>
  <text x="12" y="26" font-size="14" text-anchor="start" fill="currentColor" font-weight="600">Block AttnRes: 12 layers in blocks of 4</text>
  <g class="bl-strip"><circle cx="30" cy="70" r="9" fill="rgba(34,158,68,0.5)" stroke="rgba(34,158,68,1)"/><text x="30" y="98" font-size="12" text-anchor="middle" fill="currentColor">b0</text><rect x="56" y="48" width="132" height="44" rx="6" fill="rgba(25,113,194,0.08)" stroke="rgba(25,113,194,0.7)"/><rect x="62" y="56" width="27" height="28" rx="3" fill="rgba(25,113,194,0.25)" stroke="rgba(25,113,194,0.9)"/><text x="75.5" y="75" font-size="11" text-anchor="middle" fill="currentColor">L1</text><rect x="93" y="56" width="27" height="28" rx="3" fill="rgba(25,113,194,0.25)" stroke="rgba(25,113,194,0.9)"/><text x="106.5" y="75" font-size="11" text-anchor="middle" fill="currentColor">L2</text><rect x="124" y="56" width="27" height="28" rx="3" fill="rgba(25,113,194,0.25)" stroke="rgba(25,113,194,0.9)"/><text x="137.5" y="75" font-size="11" text-anchor="middle" fill="currentColor">L3</text><rect x="155" y="56" width="27" height="28" rx="3" fill="rgba(25,113,194,0.25)" stroke="rgba(25,113,194,0.9)"/><text x="168.5" y="75" font-size="11" text-anchor="middle" fill="currentColor">L4</text><circle cx="206" cy="70" r="9" fill="rgba(34,158,68,0.5)" stroke="rgba(34,158,68,1)"/><text x="206" y="98" font-size="12" text-anchor="middle" fill="currentColor">b1</text><rect x="224" y="48" width="132" height="44" rx="6" fill="rgba(25,113,194,0.08)" stroke="rgba(25,113,194,0.7)"/><rect x="230" y="56" width="27" height="28" rx="3" fill="rgba(25,113,194,0.25)" stroke="rgba(25,113,194,0.9)"/><text x="243.5" y="75" font-size="11" text-anchor="middle" fill="currentColor">L5</text><rect x="261" y="56" width="27" height="28" rx="3" fill="rgba(25,113,194,0.25)" stroke="rgba(25,113,194,0.9)"/><text x="274.5" y="75" font-size="11" text-anchor="middle" fill="currentColor">L6</text><rect x="292" y="56" width="27" height="28" rx="3" fill="rgba(25,113,194,0.25)" stroke="rgba(25,113,194,0.9)"/><text x="305.5" y="75" font-size="11" text-anchor="middle" fill="currentColor">L7</text><rect x="323" y="56" width="27" height="28" rx="3" fill="rgba(25,113,194,0.25)" stroke="rgba(25,113,194,0.9)"/><text x="336.5" y="75" font-size="11" text-anchor="middle" fill="currentColor">L8</text><circle cx="374" cy="70" r="9" fill="rgba(34,158,68,0.5)" stroke="rgba(34,158,68,1)"/><text x="374" y="98" font-size="12" text-anchor="middle" fill="currentColor">b2</text><rect x="392" y="48" width="132" height="44" rx="6" fill="rgba(156,54,181,0.08)" stroke="rgba(156,54,181,0.7)"/><rect x="398" y="56" width="27" height="28" rx="3" fill="rgba(156,54,181,0.25)" stroke="rgba(156,54,181,0.9)"/><text x="411.5" y="75" font-size="11" text-anchor="middle" fill="currentColor">L9</text><rect x="429" y="56" width="27" height="28" rx="3" fill="rgba(156,54,181,0.25)" stroke="rgba(156,54,181,0.9)"/><text x="442.5" y="75" font-size="11" text-anchor="middle" fill="currentColor">L10</text><rect x="460" y="56" width="27" height="28" rx="3" fill="rgba(220,60,60,0.35)" stroke="rgba(220,60,60,0.9)"/><text x="473.5" y="75" font-size="11" text-anchor="middle" fill="currentColor">L11</text><rect x="491" y="56" width="27" height="28" rx="3" fill="none" stroke="rgba(156,54,181,0.9)"/><text x="504.5" y="75" font-size="11" text-anchor="middle" fill="currentColor">L12</text><text x="122" y="118" font-size="11" text-anchor="middle" fill="currentColor" fill-opacity="0.7">b1 = f1 + ... + f4</text><text x="290" y="118" font-size="11" text-anchor="middle" fill="currentColor" fill-opacity="0.7">b2 = f5 + ... + f8</text><text x="458" y="118" font-size="11" text-anchor="middle" fill="currentColor" fill-opacity="0.7">partial: f9 + f10</text></g>
  <g class="bl-src"><text x="90" y="144" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">sources for layer 11</text><rect x="12" y="155" width="156" height="26" rx="5" fill="rgba(34,158,68,0.12)" stroke="rgba(34,158,68,0.8)"/><text x="90" y="173" font-size="12" text-anchor="middle" fill="currentColor">b0 (embedding)</text><rect x="12" y="189" width="156" height="26" rx="5" fill="rgba(34,158,68,0.12)" stroke="rgba(34,158,68,0.8)"/><text x="90" y="207" font-size="12" text-anchor="middle" fill="currentColor">b1</text><rect x="12" y="223" width="156" height="26" rx="5" fill="rgba(34,158,68,0.12)" stroke="rgba(34,158,68,0.8)"/><text x="90" y="241" font-size="12" text-anchor="middle" fill="currentColor">b2</text><rect x="12" y="257" width="156" height="26" rx="5" fill="rgba(156,54,181,0.12)" stroke="rgba(156,54,181,0.8)"/><text x="90" y="275" font-size="12" text-anchor="middle" fill="currentColor">partial sum f9 + f10</text></g>
  <g class="bl-att"><line x1="170" y1="168" x2="232" y2="214" stroke="currentColor" stroke-opacity="0.35" marker-end="url(#bl-a)"/><line x1="170" y1="202" x2="232" y2="214" stroke="currentColor" stroke-opacity="0.35" marker-end="url(#bl-a)"/><line x1="170" y1="236" x2="232" y2="214" stroke="currentColor" stroke-opacity="0.35" marker-end="url(#bl-a)"/><line x1="170" y1="270" x2="232" y2="214" stroke="currentColor" stroke-opacity="0.35" marker-end="url(#bl-a)"/><rect x="236" y="194" width="110" height="40" rx="8" fill="rgba(156,54,181,0.12)" stroke="rgba(156,54,181,0.8)"/><text x="291" y="211" font-size="12" text-anchor="middle" fill="currentColor">softmax over</text><text x="291" y="226" font-size="12" text-anchor="middle" fill="currentColor">4 sources</text></g>
  <g class="bl-f"><line x1="346" y1="214" x2="380" y2="214" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#bl-a)"/><text x="363" y="206" font-size="11" text-anchor="middle" fill="currentColor">h11</text><rect x="384" y="194" width="74" height="40" rx="8" fill="rgba(220,60,60,0.12)" stroke="rgba(220,60,60,0.8)"/><text x="421" y="219" font-size="13" text-anchor="middle" fill="currentColor">f11</text></g>
  <g class="bl-p"><path d="M458,214 H520 V140 H470" fill="none" stroke="rgba(156,54,181,0.9)" marker-end="url(#bl-a)"/><text x="500" y="262" font-size="12" text-anchor="middle" fill="rgba(156,54,181,1)">partial += f11(h11)</text></g>
  <g class="bl-end"><text x="280" y="318" font-size="13" text-anchor="middle" fill="currentColor" font-weight="600">after L12 the partial sum becomes b3 and joins the sources</text><text x="280" y="340" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">every layer runs depth attention; the paper uses about 8 blocks</text></g>
</svg>

*Figure: Block AttnRes on a small 12-layer model with blocks of 4. Layer 11 attends over the embedding, the two finished block sums and the partial sum of layers 9 and 10. Its output joins the partial sum.*

Magnitude grows only inside each block. The softmax-weighted average before the next layer resets it, and the paper's Figure 5b shows this repeating pattern.

---

## the code

This is the whole thing. `DepthAttention` is ~15 lines, the rest is wiring it into the existing transformer:

```python
import torch
import torch.nn as nn
import torch.nn.functional as F


class RMSNorm(nn.Module):
    def __init__(self, dim, eps=1e-6):
        super().__init__()
        self.eps = eps
        self.weight = nn.Parameter(torch.ones(dim))

    def forward(self, x):
        return x * torch.rsqrt(x.pow(2).mean(-1, keepdim=True) + self.eps) * self.weight


class DepthAttention(nn.Module):
    """Softmax attention over earlier sources, one learned query per layer."""

    def __init__(self, dim):
        super().__init__()
        self.query = nn.Parameter(torch.zeros(dim))  # zero-init!
        self.norm = RMSNorm(dim)

    def forward(self, sources):
        # sources: list of (B, T, D) tensors
        V = torch.stack(sources)                                     # (N, B, T, D)
        K = self.norm(V)                                             # keys are normalized, values are not
        scores = torch.einsum('d, n b t d -> n b t', self.query, K)
        weights = F.softmax(scores, dim=0)                           # softmax over depth
        return (weights.unsqueeze(-1) * V).sum(dim=0)                # (B, T, D)


class TransformerBlock(nn.Module):
    def __init__(self, dim, n_head, mlp_hidden_dim):
        super().__init__()
        self.norm1 = RMSNorm(dim)
        self.attn = nn.MultiheadAttention(dim, n_head, batch_first=True)
        self.norm2 = RMSNorm(dim)
        self.mlp = nn.Sequential(
            nn.Linear(dim, mlp_hidden_dim), nn.SiLU(),
            nn.Linear(mlp_hidden_dim, dim),
        )

    def attn_out(self, x):  # f for the attention layer (no residual add)
        normed = self.norm1(x)
        T = x.size(1)
        mask = torch.triu(torch.ones(T, T, dtype=torch.bool, device=x.device), 1)
        return self.attn(normed, normed, normed, attn_mask=mask)[0]

    def mlp_out(self, x):   # f for the MLP layer (no residual add)
        return self.mlp(self.norm2(x))

    def forward(self, x):   # standard PreNorm residual
        x = x + self.attn_out(x)
        x = x + self.mlp_out(x)
        return x


class TransformerWithBlockAttnRes(nn.Module):
    def __init__(self, vocab_size, dim, n_layers, n_head, block_size=8):
        super().__init__()
        # the paper counts attention and MLP as separate layers: 2 per TransformerBlock
        assert (2 * n_layers) % block_size == 0
        self.block_size = block_size
        self.token_embeddings = nn.Embedding(vocab_size, dim)

        self.layers = nn.ModuleList([
            TransformerBlock(dim, n_head, 4 * dim)
            for _ in range(n_layers)
        ])

        # one DepthAttention before every attention and MLP layer, plus one before the output
        self.depth_attns = nn.ModuleList([
            DepthAttention(dim) for _ in range(2 * n_layers + 1)
        ])

        self.norm_final = RMSNorm(dim)
        self.lm_head = nn.Linear(dim, vocab_size, bias=False)

    def forward(self, idx):
        blocks = [self.token_embeddings(idx)]  # b_0 = token embedding
        partial = None                          # running sum inside the current block
        sublayers = [f for layer in self.layers for f in (layer.attn_out, layer.mlp_out)]

        for i, f in enumerate(sublayers):
            sources = blocks if partial is None else blocks + [partial]
            h = self.depth_attns[i](sources)
            out = f(h)
            partial = out if partial is None else partial + out
            if (i + 1) % self.block_size == 0:   # block boundary
                blocks.append(partial)
                partial = None

        h = self.depth_attns[-1](blocks if partial is None else blocks + [partial])
        return self.lm_head(self.norm_final(h))
```

```python
# test it
model = TransformerWithBlockAttnRes(vocab_size=1000, dim=256, n_layers=32, n_head=4, block_size=8)
idx = torch.randint(0, 1000, (2, 64))
out = model(idx)
print(f"Input:  {idx.shape}")                                # (2, 64)
print(f"Output: {out.shape}")                                # (2, 64, 1000)
print(f"Depth attention modules: {len(model.depth_attns)}")  # 65
```

The diff from a standard PreNorm transformer is small. `TransformerBlock` keeps its weights. Its forward splits into `attn_out` and `mlp_out`, so the model can call each layer without the residual add. You add `DepthAttention` modules and change the forward loop to track block sums. ~30 lines of new code. The test model has 32 transformer blocks, so 64 layers in 8 blocks of 8, the same shape as the example above.

The cost is small. Each layer adds one $d$-dim query and one RMSNorm weight vector, so $2d$ parameters. For the test model that is 33,280 extra parameters, 0.13% of its 25.8M. The compute per token per layer is one dot product and one weighted sum over at most 9 sources. The paper reports under 4% training overhead with pipeline parallelism, negligible overhead without it, and under 2% inference latency overhead.

---

## results

> Kimi Linear: a 48B-parameter [mixture-of-experts](/blog/paper#moe) model with 3B active parameters, trained on 1.4T tokens. Block AttnRes against the same model with standard residuals.

| Benchmark | Baseline | + AttnRes | Delta |
|-----------|----------|-----------|-------|
| MMLU | 73.5 | 74.6 | +1.1 |
| GPQA-Diamond | 36.9 | 44.4 | **+7.5** |
| BBH | 76.3 | 78.0 | +1.7 |
| Math (Minerva) | 53.5 | 57.1 | +3.6 |
| HumanEval | 59.1 | 62.2 | +3.1 |
| MBPP | 72.0 | 73.9 | +1.9 |

These are 6 of the 15 benchmarks in the paper's Table 3. AttnRes matches or beats the baseline on all 15. In the [scaling-law](/blog/scalinglaws#scaling-laws) runs, Block AttnRes matches the loss of a baseline trained with **1.25x more compute**. The +7.5 on GPQA-Diamond is wild for 30 lines of code.

Problem: these are Moonshot's internal runs at massive scale. The [official repo](https://github.com/MoonshotAI/Attention-Residuals) has the paper and PyTorch-style pseudocode, not training code. Reproducing these numbers needs their data and compute.

When I run it on my system, trained as a character-level language model. The data is the markdown source of two of my posts ([math](/blog/math) and [how ChatGPT works](/blog/how-chatgpt-works)). The setup is dim 128 and 8 transformer blocks, so 16 layers in 4 AttnRes blocks of 4. Training uses AdamW at learning rate 1e-3 for 600 steps with batches of 32 sequences of 128 characters, on the M4 CPU.

The baseline is the same model with the standard residual forward pass. Validation loss is the mean over 20 held-out batches.

| Run | Val loss, seed 0 | Val loss, seed 1 | Wall time per run |
|-----|------|------|------|
| Standard residual | 2.353 | 2.351 | 118 s, 106 s |
| Block AttnRes | 2.310 | 2.352 | 226 s, 203 s |

At laptop scale it's a coin flip. Seed 0 favors AttnRes by 0.04, seed 1 is a tie, and two seeds can't separate that from noise. AttnRes took about 2x the wall time, because my Python loop runs every depth attention as separate small ops. The paper's smallest model already has 194M active parameters and trains on 38.7B tokens. That's where the gains show up...

---

## when this doesn't work

[Ziming Liu](https://kindxiaoming.github.io/blog/2026/attention-residual/) (the KAN guy) makes a good no-free-lunch argument: if AttnRes wins on language modeling, it has to lose somewhere else.

He builds a toy experiment with MLP-only networks. He mixes the labels of a linear task and a random memorization task, then compares training loss at 4, 10 and 30 blocks. The result:

- On structured data (the linear end), AttnRes wins.
- On memorization data (random input-output pairs), standard residuals win. AttnRes hurts.

Depth makes the memorization gap worse. At 30 blocks on pure random labels, AttnRes ends at about 0.35 training loss against about 0.11 for standard residuals. At that depth its win on the linear end is gone. At 4 and 10 blocks, AttnRes reaches about 0.001 on the linear task against about 0.01 for standard residuals. I read these values off his log-scale plot.

Why? Liu offers a guess and calls it intuition, not proof. The zero-init trick that makes AttnRes safe also makes it dumb at the start. When $w = 0$, all weights are uniform: $h_l = \frac{1}{l}\left(h_1 + \sum_{i=1}^{l-1} v_i\right)$. That's pure averaging.

The model has to learn its way out of this averaging regime before it can do anything useful. For memorization, every layer must add its own signal, so that averaging phase may be a tax the model never recovers from. Liu also notes that his zero init may cause this bias, and a non-zero init may reduce it.

Liu frames the trade-off as **stability vs expressivity**. Softmax bounds the weights (they sum to 1), which stabilizes training but caps how much any single layer can contribute. Standard residuals let layers contribute unbounded signal. That gives messier gradients, but more raw capacity for brute-force memorization.

Language modeling is mostly structured (syntax, semantics, reasoning patterns). Liu reads Kimi's gains as a sign of that structure. But if your task is closer to lookup tables than language, don't assume this is a free upgrade.

---

## transformer++ upgrade list

The running list of things that make modern LLMs better than the 2017 transformer:

- [LayerNorm](/blog/math#layernorm) $\to$ RMSNorm
- ReLU $\to$ SwiGLU
- Absolute [positional encoding](/blog/math#positional-encoding) $\to$ [RoPE](/blog/paper#multi-head-latent-attention) (rotary position embeddings)
- Post-Norm $\to$ Pre-Norm
- **Standard residual $\to$ Attention residual** (new)

The attention and MLP code inside each layer stays the same. The change is one level up: how the model combines layer outputs into each layer's input.

---

## what else are we not questioning?

The residual weight was 1.0 for a decade. Softmax temperature is always 1/sqrt(d). Position information is always added or rotated in, never concatenated. Layer count is always uniform across the model. Somewhere in there is another 30-line patch worth +7.5 on GPQA.

---

## references

- [Attention Residuals](https://arxiv.org/abs/2603.15031), Moonshot AI (Kimi team)
- [When does Kimi's Attention Residuals work?](https://kindxiaoming.github.io/blog/2026/attention-residual/), Ziming Liu's no-free-lunch analysis
- [Attention Residuals repo](https://github.com/MoonshotAI/Attention-Residuals) (paper and pseudocode)
- [Deep Residual Learning (ResNet)](https://arxiv.org/abs/1512.03385)
- [Accurate, Large Minibatch SGD](https://arxiv.org/abs/1706.02677), Goyal et al., the zero-init BatchNorm scale
- [LoRA](https://arxiv.org/abs/2106.09685), Hu et al.
- [My CIFAR-10 ResNet implementation](https://github.com/samitmohan/deep-residual-learning-pytorch)
- [Vanishing gradients explained](/blog/math#1-vanishing-gradients), from my math post
- [Backpropagation from scratch](/blog/nn#backpropagation), from my neural networks post
- [Transformers](/blog/how-chatgpt-works#the-transformer): attention, residuals in the transformer block
- [AttnRes notebook](https://colab.research.google.com/drive/1FGVHFRY2ShFeQWPXTW30e_K-caW1_l-S), standalone implementation with weight heatmap visualizations, by [Arjun](https://www.k-a.in/AttnRes.html)
