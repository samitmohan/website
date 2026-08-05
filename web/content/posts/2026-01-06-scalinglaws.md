---
layout: post
title: "Scaling laws"
date:   2026-01-06 14:06:04 +0530
categories: tech
tokens: "~1k"
description: "Maybe intelligence is just a lot of compute applied to a lot of data having a lot of parameters. OpenAI wrote a paper on this."
tags: [llm, papers]
---

OpenAI wrote a paper on what happens to model performance as you scale parameters, data, and compute. It's called [**Scaling Laws for Neural Language Models**](https://arxiv.org/pdf/2001.08361), 2020.

-----

## scaling laws

![sl](/assets/images/scaling_laws/scaling_laws.webp)

<video autoplay loop muted playsinline style="max-width:100%" preload="none" poster="/assets/images/scaling/scaling_curves_poster.jpg">
  <source src="/assets/images/scaling/scaling_curves.mp4" type="video/mp4">
</video>
*Scaling parameters alone, data alone, or both (Chinchilla) - same compute, different loss.*

Scaling laws are simple predictive rules for how a language model's loss behaves as you grow it. The practical payoff: tune on small, cheap models, then extrapolate to the large one and nail it in a single run instead of guessing hyperparameters at full scale.

Kaplan et al. (2020) quantified this with three power laws:

$$L(N) \sim N^{-0.076}$$

$$L(D) \sim D^{-0.095}$$

$$L(C) \sim C^{-0.050}$$

where *N* = number of parameters, *D* = dataset size (tokens), *C* = compute budget (FLOPs), and *L* = cross-entropy loss. Loss drops as a power law as you add more parameters, data, or compute, but the small exponents mean diminishing returns: each 10x increase in any factor buys only a modest drop in loss.

Two things followed from this. GPT-3 turned out to be undertrained, and Chinchilla (40% of the parameters of GPT-3, 4x the data) beat it by spending the same compute budget more wisely.

<style>
.chinchilla-widget{background:var(--bg-card,#1f2335);border:1px solid var(--border,#e1e4e8);border-radius:10px;padding:20px 24px;margin:24px 0;font-family:inherit}
.chinchilla-widget h4{margin:0 0 12px;color:var(--text-heading,#c0caf5);font-size:16px}
.chinchilla-widget p.desc{font-size:13px;color:var(--text-secondary,#787c99);margin:0 0 16px}
.chinchilla-widget .presets{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.chinchilla-widget .presets button{background:var(--bg-code,#16161e);color:var(--text,#a9b1d6);border:1px solid var(--border,#e1e4e8);border-radius:6px;padding:6px 14px;cursor:pointer;font-size:13px;font-family:var(--font-mono,'JetBrains Mono',monospace);transition:background .15s,border-color .15s}
.chinchilla-widget .presets button:hover,.chinchilla-widget .presets button.active{background:var(--accent,#0366d6);color:#fff;border-color:var(--accent,#0366d6)}
.chinchilla-widget input[type=text]{width:100%;box-sizing:border-box;background:var(--bg-input,#1f2335);color:var(--text,#a9b1d6);border:1px solid var(--border,#e1e4e8);border-radius:6px;padding:8px 12px;font-size:14px;font-family:var(--font-mono,'JetBrains Mono',monospace);margin-bottom:16px}
.chinchilla-widget .results{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.chinchilla-widget .result-card{background:var(--bg-code,#16161e);border-radius:8px;padding:14px 16px;border-left:3px solid var(--accent,#0366d6)}
.chinchilla-widget .result-card.old{border-left-color:#ff6b6b}
.chinchilla-widget .result-card .label{font-size:12px;color:var(--text-muted,#565f89);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px}
.chinchilla-widget .result-card .val{font-size:15px;font-weight:600;color:var(--text-heading,#c0caf5);font-family:var(--font-mono,'JetBrains Mono',monospace)}
.chinchilla-widget .result-card .val span{font-weight:400;font-size:12px;color:var(--text-muted,#565f89)}
.chinchilla-widget .summary{margin-top:14px;padding:12px 16px;background:var(--bg-code,#16161e);border-radius:8px;font-size:13px;color:var(--text,#a9b1d6);line-height:1.6;font-family:var(--font-mono,'JetBrains Mono',monospace)}
.dark .chinchilla-widget{background:#141416;border-color:#313136}
.dark .chinchilla-widget h4{color:#E7E7E9}
.dark .chinchilla-widget p.desc{color:#9CA0A9}
.dark .chinchilla-widget .presets button{background:#1c1c20;color:#E7E7E9;border-color:#313136}
.dark .chinchilla-widget .presets button:hover,.dark .chinchilla-widget .presets button.active{background:#1a2340;color:#8ea2f0;border-color:#8ea2f0}
.dark .chinchilla-widget input[type=text]{background:#1c1c20;color:#E7E7E9;border-color:#313136}
.dark .chinchilla-widget .result-card{background:#1c1c20;border-left-color:#8ea2f0}
.dark .chinchilla-widget .result-card.old{border-left-color:#f87171}
.dark .chinchilla-widget .result-card .label{color:#9CA0A9}
.dark .chinchilla-widget .result-card .val{color:#E7E7E9}
.dark .chinchilla-widget .result-card .val span{color:#9CA0A9}
.dark .chinchilla-widget .summary{background:#1c1c20;color:#E7E7E9}
@media(max-width:500px){.chinchilla-widget .results{grid-template-columns:1fr}}
</style>

<div id="chinchilla-calc" class="chinchilla-widget">
  <h4>Chinchilla Compute Allocator</h4>
  <p class="desc">Enter a compute budget in FLOPs. Compare Kaplan (2020) allocation vs Chinchilla (2022) optimal allocation.</p>
  <div class="presets"></div>
  <input type="text" id="cc-input" placeholder="e.g. 1e21">
  <div class="results">
    <div class="result-card old">
      <div class="label">Kaplan (2020) - params heavy</div>
      <div class="val" id="cc-kaplan">-</div>
    </div>
    <div class="result-card">
      <div class="label">Chinchilla (2022) - balanced</div>
      <div class="val" id="cc-chinchilla">-</div>
    </div>
  </div>
  <div class="summary" id="cc-summary"></div>
</div>

<script>
lazyWidget('chinchilla-calc', function(){
  var presets = [1e18, 1e20, 1e22, 1e24];
  var presetContainer = document.querySelector('#chinchilla-calc .presets');
  var input = document.getElementById('cc-input');
  var kaplanEl = document.getElementById('cc-kaplan');
  var chinchillaEl = document.getElementById('cc-chinchilla');
  var summaryEl = document.getElementById('cc-summary');
  function fmt(n){
    if(n>=1e15) return (n/1e15).toFixed(1)+'Q';
    if(n>=1e12) return (n/1e12).toFixed(1)+'T';
    if(n>=1e9) return (n/1e9).toFixed(1)+'B';
    if(n>=1e6) return (n/1e6).toFixed(1)+'M';
    if(n>=1e3) return (n/1e3).toFixed(1)+'K';
    return n.toFixed(0);
  }
  function fmtFlops(n){
    var exp = Math.floor(Math.log10(n));
    var mantissa = n / Math.pow(10, exp);
    return mantissa.toFixed(1) + 'e' + exp;
  }
  function compute(C){
    // Chinchilla: equal allocation in log space
    // C ~ 6 * N * D, with N_opt ~ C^0.5, D_opt ~ C^0.5
    // More precisely: N_opt = (C/6)^0.5, D_opt = (C/6)^0.5
    // so that 6*N*D = C
    var chinN = Math.pow(C / 6, 0.5);
    var chinD = Math.pow(C / 6, 0.5);
    // Kaplan: params-heavy allocation
    // Kaplan suggested N scales faster: N ~ C^0.73, D ~ C^0.27
    // Using C = 6*N*D constraint: N = (C/6)^0.73, D = C/(6*N)
    var kapN = Math.pow(C / 6, 0.73);
    var kapD = C / (6 * kapN);
    kaplanEl.innerHTML = 'N = ' + fmt(kapN) + ' params<br>D = ' + fmt(kapD) + ' tokens <span>(params-heavy)</span>';
    chinchillaEl.innerHTML = 'N = ' + fmt(chinN) + ' params<br>D = ' + fmt(chinD) + ' tokens <span>(balanced)</span>';
    summaryEl.innerHTML = 'With C = ' + fmtFlops(C) + ' FLOPs:<br>' +
      'Chinchilla says N = ' + fmt(chinN) + ' params, D = ' + fmt(chinD) + ' tokens<br>' +
      'Kaplan would use ' + fmt(kapN) + ' params but only ' + fmt(kapD) + ' tokens<br>' +
      'Ratio: Chinchilla uses ' + (chinD/kapD).toFixed(1) + 'x more data with ' + (kapN/chinN).toFixed(1) + 'x fewer params';
  }
  presets.forEach(function(p){
    var btn = document.createElement('button');
    btn.textContent = '10^' + Math.log10(p);
    btn.onclick = function(){
      document.querySelectorAll('#chinchilla-calc .presets button').forEach(function(b){b.classList.remove('active')});
      btn.classList.add('active');
      input.value = p.toExponential();
      compute(p);
    };
    presetContainer.appendChild(btn);
  });
  input.addEventListener('input', function(){
    document.querySelectorAll('#chinchilla-calc .presets button').forEach(function(b){b.classList.remove('active')});
    var v = parseFloat(input.value);
    if(!isNaN(v) && v > 0) compute(v);
  });
  compute(1e21);
  input.value = '1e21';
});
</script>

### data

Loss versus dataset size is also a power law, linear on a log-log plot.

![dl](/assets/images/scaling_laws/data_loss.webp)

Data *composition* shifts the offset, not the slope, so you can run data-selection experiments on a small model and trust they transfer to the big one.

![datacomposition](/assets/images/scaling_laws/dc.webp)

Repeating data helps up to about 4 epochs, then returns fall off fast. That sets up the real tradeoff: repeat high-quality data, or pull in new lower-quality data.

### how to design a huge LM

- **Architecture:** Transformer over LSTM; loss keeps dropping as you add parameters. MoE is the only thing that consistently beats a vanilla transformer.
- **Optimizer:** Adam over SGD once you train for many epochs (adaptive step sizes instead of one fixed rate).
- **Depth:** 1 vs 2 layers is night and day; past ~6 layers it plateaus.
- **Batch size:** bigger batches mean more gradient signal per step, up to a critical batch size; past it you spend compute for little gain.

### recap

You're always budget-constrained, so you pick which of the three knobs to turn: parameters, data, or compute. You can turn all three - there's no impossibility theorem - but nobody has infinite money. The Chinchilla paper showed most labs were turning the wrong knob. They were making models too big and not training them on enough data. Chinchilla (70B params, 4x the data of GPT-3) outperformed the much larger GPT-3 by allocating the compute budget more wisely.

> Loss ~ f(parameters, data, compute) - all three matter, but how you balance them matters more.

Different labs make different bets on this tradeoff. ChatGPT scales up parameters and broad data with massive compute - optimizing for generality. DeepSeek goes the other way: fewer parameters, higher-quality data, and more inference-time compute - optimizing for reasoning efficiency. Both obey the same scaling laws, they just allocate their budgets differently.

### limitations and what's next

The catch: we're running out of high-quality text. Two escape routes are in play. Synthetic data (AlphaGo learned entirely from self-play) and reasoning models like o1 that spend more compute at inference, thinking longer to answer better, which is its own new scaling axis. New architectures are the other hope, but nothing has unseated the transformer yet, usually because the alternatives aren't numerically stable.

![sl](/assets/images/scaling_laws/scaling_loss.webp)
