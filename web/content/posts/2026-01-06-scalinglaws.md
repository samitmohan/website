---
layout: post
title: "Scaling Laws"
date:   2026-01-06 14:06:04 +0530
categories: tech
tokens: "~1k"
description: "Maybe intelligence is just a lot of compute applied to a lot of data having a lot of parameters.."
tags: [llm, papers]
---

A neural network is a pile of multiplies and adds. Training one is more multiplies and adds. Take away the hype and an LLM is three numbers: how many parameters, how many tokens, how many FLOPs.

So the real question is a budget question. You have a fixed number of FLOPs. How do you split them between parameters and tokens? OpenAI measured the answer in 2020 ([**Scaling Laws for Neural Language Models**](https://arxiv.org/pdf/2001.08361)). DeepMind corrected it in 2022 (Chinchilla). This post counts the FLOPs first, then spends them.

## FLOPs

A FLOP is one floating-point operation: one multiply or one add of two decimal numbers. Compute, *C*, is the total number of FLOPs in a training run. Count them from the bottom up:

1. For one weight, the network multiplies an input by the weight, then adds the result to a running sum. That is 2 FLOPs.
2. Each weight does this one time for each token. So a model with *N* parameters costs approximately 2*N* FLOPs per token in the forward pass.
3. Training also runs a backward pass. It computes two gradients for each layer: one for the inputs, to send back to the layer below, and one for the weights, to update them. Each costs approximately as much as the forward pass, so the backward pass is approximately 4*N*.

Total: 6*N* FLOPs per token. Train on *D* tokens and the compute is C ≈ 6ND. Kaplan et al. use this same estimate. Attention adds a term that grows with the context length, but it is small for large models.

<svg viewBox="0 0 560 560" role="img" aria-label="Counting FLOPs: 2 per weight, 2N per token forward, 4N backward, 6N per training token" style="width:100%;max-width:520px;height:auto;display:block;margin:24px auto;font-family:var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif">
  <defs><marker id="fl-ah" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M1,1 L8,5 L1,9" fill="none" stroke="currentColor" stroke-opacity="0.6" stroke-width="1.5"/></marker></defs>
  <text x="20" y="28" font-size="15" font-weight="600" fill="currentColor">1 · One weight</text>
  <circle cx="70" cy="80" r="22" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-opacity="0.5"/>
  <text x="70" y="85" font-size="14" text-anchor="middle" fill="currentColor">x</text>
  <text x="70" y="122" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">2.0</text>
  <line x1="94" y1="80" x2="148" y2="80" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.5" marker-end="url(#fl-ah)"/>
  <rect x="150" y="60" width="100" height="40" rx="8" fill="rgba(156,54,181,0.14)" stroke="rgba(156,54,181,1)"/>
  <text x="200" y="85" font-size="14" text-anchor="middle" fill="currentColor">× w</text>
  <text x="200" y="122" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">w = 0.5 → 1.0</text>
  <line x1="252" y1="80" x2="298" y2="80" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.5" marker-end="url(#fl-ah)"/>
  <rect x="300" y="60" width="100" height="40" rx="8" fill="rgba(156,54,181,0.14)" stroke="rgba(156,54,181,1)"/>
  <text x="350" y="85" font-size="14" text-anchor="middle" fill="currentColor">+ sum</text>
  <text x="350" y="122" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">sum + 1.0</text>
  <text x="430" y="78" font-size="14" font-weight="600" fill="rgba(156,54,181,1)">1 multiply</text>
  <text x="430" y="98" font-size="14" font-weight="600" fill="rgba(156,54,181,1)">+ 1 add</text>
  <text x="430" y="122" font-size="14" font-weight="600" fill="currentColor">= 2 FLOPs</text>
  <line x1="20" y1="150" x2="540" y2="150" stroke="currentColor" stroke-opacity="0.12"/>
  <text x="20" y="180" font-size="15" font-weight="600" fill="currentColor">2 · One layer, one token</text>
  <line x1="128" y1="210" x2="312" y2="232" stroke="rgba(156,54,181,1)" stroke-opacity="0.6" stroke-width="1.5"/><line x1="128" y1="210" x2="312" y2="278" stroke="rgba(156,54,181,1)" stroke-opacity="0.6" stroke-width="1.5"/><line x1="128" y1="255" x2="312" y2="232" stroke="rgba(156,54,181,1)" stroke-opacity="0.6" stroke-width="1.5"/><line x1="128" y1="255" x2="312" y2="278" stroke="rgba(156,54,181,1)" stroke-opacity="0.6" stroke-width="1.5"/><line x1="128" y1="300" x2="312" y2="232" stroke="rgba(156,54,181,1)" stroke-opacity="0.6" stroke-width="1.5"/><line x1="128" y1="300" x2="312" y2="278" stroke="rgba(156,54,181,1)" stroke-opacity="0.6" stroke-width="1.5"/><circle cx="110" cy="210" r="18" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-opacity="0.5"/><circle cx="110" cy="255" r="18" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-opacity="0.5"/><circle cx="110" cy="300" r="18" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-opacity="0.5"/><circle cx="330" cy="232" r="18" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-opacity="0.5"/><circle cx="330" cy="278" r="18" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-opacity="0.5"/>
  <text x="110" y="335" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">3 inputs</text>
  <text x="330" y="335" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">2 outputs</text>
  <text x="385" y="225" font-size="14" fill="currentColor">3 × 2 = <tspan fill="rgba(156,54,181,1)" font-weight="600">6 weights</tspan></text>
  <text x="385" y="250" font-size="14" fill="currentColor">6 × 2 = 12 FLOPs</text>
  <text x="385" y="275" font-size="14" font-weight="600" fill="currentColor">2 FLOPs per weight</text>
  <text x="385" y="300" font-size="12" fill="currentColor" fill-opacity="0.7">N weights → 2N per token</text>
  <line x1="20" y1="355" x2="540" y2="355" stroke="currentColor" stroke-opacity="0.12"/>
  <text x="20" y="385" font-size="15" font-weight="600" fill="currentColor">3 · One training step, one token</text>
  <rect x="60" y="405" width="140" height="40" fill="rgba(34,158,68,0.22)" stroke="rgba(34,158,68,1)"/>
  <text x="130" y="430" font-size="13" text-anchor="middle" fill="currentColor">forward 2N</text>
  <rect x="200" y="405" width="140" height="40" fill="rgba(25,113,194,0.18)" stroke="rgba(25,113,194,1)"/>
  <text x="270" y="424" font-size="12" text-anchor="middle" fill="currentColor">gradient for</text>
  <text x="270" y="439" font-size="12" text-anchor="middle" fill="currentColor">inputs 2N</text>
  <rect x="340" y="405" width="140" height="40" fill="rgba(25,113,194,0.18)" stroke="rgba(25,113,194,1)"/>
  <text x="410" y="424" font-size="12" text-anchor="middle" fill="currentColor">gradient for</text>
  <text x="410" y="439" font-size="12" text-anchor="middle" fill="currentColor">weights 2N</text>
  <path d="M200 452 v6 h280 v-6" fill="none" stroke="rgba(25,113,194,1)"/>
  <text x="340" y="474" font-size="12" text-anchor="middle" fill="rgba(25,113,194,1)" font-weight="600">backward 4N</text>
  <text x="280" y="505" font-size="15" font-weight="600" text-anchor="middle" fill="currentColor">6N per token × D tokens → C ≈ 6ND</text>
  <text x="280" y="532" font-size="13" text-anchor="middle" fill="currentColor" fill-opacity="0.75">GPT-3: 6 × 175B × 300B ≈ 3.2 × 10²³ FLOPs</text>
</svg>

Now put hardware under it. GPT-3 took approximately 3.2 × 10²³ FLOPs. An NVIDIA H100 is rated at approximately 10¹⁵ FLOPs per second (dense BF16, the peak on paper). One H100 at 100% of that peak needs approximately 3.2 × 10⁸ seconds: 10 years. Real runs get much less than peak, so labs use thousands of GPUs for months.

Kaplan et al. measure compute in PF-days: 10¹⁵ FLOPs per second for one day, 8.64 × 10¹⁹ FLOPs. That is approximately one H100 at peak for one day.

-----

## scaling laws

A scaling law is a simple rule that predicts the loss of a language model as you make it larger. With these rules, you tune on small, cheap models, then extrapolate to the large model and nail it in a single run. You do not have to guess hyperparameters at full scale.

Kaplan et al. (2020) quantified this with three power laws:

$$
L(N) \sim N^{-0.076}
$$

$$
L(D) \sim D^{-0.095}
$$

$$
L(C) \sim C^{-0.050}
$$

where *N* = number of parameters, *D* = dataset size (tokens), *C* = compute budget (FLOPs), and *L* = [cross-entropy loss](/blog/microgpt#loss-cross-entropy).

A power law is a straight line on a log-log plot. The loss drops when you add parameters, data or compute, but the small exponents give diminishing returns. Each 10x increase in parameters multiplies the loss by 10^-0.076 ≈ 0.84, a 16% drop. 10x more data gives a 20% drop. 10x more compute gives an 11% drop.

![Kaplan et al. 2020, Figure 1](/assets/images/scaling_laws/scaling_loss.webp)
*Figure: Kaplan et al. (2020), Figure 1. Test loss against compute, dataset size and parameters. Each one is a straight line on log-log axes.*

![sl](/assets/images/scaling_laws/scaling_laws.webp)
*Figure: Classic machine learning expects a model to overfit as it gets larger (left). At LLM scale, the loss continues to fall as scale increases (right).*

### chinchilla

Two years later, Hoffmann et al. (2022) found that GPT-3 and other large models were undertrained: too many parameters, not enough data. For compute-optimal training, they scale parameters and tokens equally: each time you double the parameters, double the tokens. This gives approximately 20 tokens per parameter.

They tested this with Chinchilla: 70B parameters trained on 1.4T tokens. Chinchilla used the same compute as DeepMind's Gopher (280B parameters, 300B tokens), with 4x fewer parameters and 4x more data. It beat Gopher, GPT-3 (175B), Jurassic-1 (178B) and MT-NLG (530B).

<svg viewBox="0 0 560 410" role="img" aria-label="Parameters and training tokens of large language models: GPT-3, Gopher and others sit far below 20 tokens per parameter, Chinchilla sits on it" style="width:100%;max-width:520px;height:auto;display:block;margin:24px auto;font-family:var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif">
  <style>
    .sc-a { animation: sc-a 12s infinite; } @keyframes sc-a { 0%, 3% { opacity: 0; } 7%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .sc-b { animation: sc-b 12s infinite; } @keyframes sc-b { 0%, 33% { opacity: 0; } 37%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .sc-c { animation: sc-c 12s infinite; } @keyframes sc-c { 0%, 63% { opacity: 0; } 67%, 95% { opacity: 1; } 100% { opacity: 0; } }
    .sc-t1 { animation: sc-t1 12s infinite; } @keyframes sc-t1 { 0%, 3% { opacity: 0; } 7%, 30% { opacity: 1; } 33%, 100% { opacity: 0; } }
    .sc-t2 { animation: sc-t2 12s infinite; } @keyframes sc-t2 { 0%, 33% { opacity: 0; } 37%, 60% { opacity: 1; } 63%, 100% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) {
      .sc-a, .sc-b, .sc-c { animation: none; opacity: 1; }
      .sc-t1, .sc-t2 { animation: none; opacity: 0; }
    }
  </style>
  <line x1="80" y1="290" x2="520" y2="290" stroke="currentColor" stroke-opacity="0.4"/><line x1="80" y1="290" x2="80" y2="30" stroke="currentColor" stroke-opacity="0.4"/><line x1="114.3" y1="290" x2="114.3" y2="295" stroke="currentColor" stroke-opacity="0.4"/><text x="114.3" y="310" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">50B</text><line x1="220.9" y1="290" x2="220.9" y2="295" stroke="currentColor" stroke-opacity="0.4"/><text x="220.9" y="310" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">100B</text><line x1="327.4" y1="290" x2="327.4" y2="295" stroke="currentColor" stroke-opacity="0.4"/><text x="327.4" y="310" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">200B</text><line x1="468.3" y1="290" x2="468.3" y2="295" stroke="currentColor" stroke-opacity="0.4"/><text x="468.3" y="310" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity="0.7">500B</text><line x1="75" y1="290.0" x2="80" y2="290.0" stroke="currentColor" stroke-opacity="0.4"/><text x="71" y="294.0" font-size="12" text-anchor="end" fill="currentColor" fill-opacity="0.7">100B</text><line x1="75" y1="212.6" x2="80" y2="212.6" stroke="currentColor" stroke-opacity="0.4"/><text x="71" y="216.6" font-size="12" text-anchor="end" fill="currentColor" fill-opacity="0.7">300B</text><line x1="75" y1="127.7" x2="80" y2="127.7" stroke="currentColor" stroke-opacity="0.4"/><text x="71" y="131.7" font-size="12" text-anchor="end" fill="currentColor" fill-opacity="0.7">1T</text><line x1="75" y1="50.3" x2="80" y2="50.3" stroke="currentColor" stroke-opacity="0.4"/><text x="71" y="54.3" font-size="12" text-anchor="end" fill="currentColor" fill-opacity="0.7">3T</text><text x="300.0" y="330" font-size="13" text-anchor="middle" fill="currentColor">Parameters (log scale)</text><text x="22" y="160.0" font-size="13" text-anchor="middle" fill="currentColor" transform="rotate(-90 22 160.0)">Training tokens (log scale)</text>
  <g class="sc-a"><circle cx="269.3" cy="253.4" r="6" fill="rgba(220,60,60,1)"/><text x="261.3" y="257.4" font-size="13" font-weight="600" fill="rgba(220,60,60,1)" text-anchor="end">LaMDA</text><circle cx="307.8" cy="212.6" r="6" fill="rgba(220,60,60,1)"/><text x="299.8" y="204.6" font-size="13" font-weight="600" fill="rgba(220,60,60,1)" text-anchor="end">GPT-3, Jurassic-1</text><circle cx="379.1" cy="212.6" r="6" fill="rgba(220,60,60,1)"/><text x="387.1" y="204.6" font-size="13" font-weight="600" fill="rgba(220,60,60,1)" text-anchor="start">Gopher</text><circle cx="477.2" cy="220.0" r="6" fill="rgba(220,60,60,1)"/><text x="469.2" y="236.0" font-size="13" font-weight="600" fill="rgba(220,60,60,1)" text-anchor="end">MT-NLG</text></g>
  <g class="sc-b"><line x1="80.0" y1="143.4" x2="327.4" y2="30.0" stroke="rgba(34,158,68,1)" stroke-width="2.5" stroke-dasharray="7 5"/><text x="291.2" y="54.3" font-size="13" font-weight="600" fill="rgba(34,158,68,1)">20 tokens per parameter</text></g>
  <g class="sc-c"><circle cx="166.0" cy="104.0" r="7" fill="rgba(34,158,68,1)"/><text x="178.0" y="109.0" font-size="13" font-weight="600" fill="rgba(34,158,68,1)">Chinchilla</text></g>
  <g font-size="14" text-anchor="middle" fill="currentColor">
    <text class="sc-t1" x="280" y="372">Large models in 2020-2022: 137B-530B parameters,</text>
    <text class="sc-t1" x="280" y="394" fill-opacity="0.7">trained on 168B-300B tokens.</text>
    <text class="sc-t2" x="280" y="372">Compute-optimal: approximately 20 tokens per parameter.</text>
    <text class="sc-t2" x="280" y="394" fill-opacity="0.7">All of them sit far below the line: too little data.</text>
    <text class="sc-c" x="280" y="372" font-weight="600">Chinchilla: 70B parameters, 1.4T tokens, on the line.</text>
    <text class="sc-c" x="280" y="394" fill-opacity="0.7">Same compute as Gopher, and it beat Gopher and GPT-3.</text>
  </g>
</svg>
*Figure: Parameters and training tokens from Hoffmann et al. (2022), Table 1.*

The calculator uses C ≈ 6ND from the [FLOPs](#flops) section. For the same C, Kaplan's rule puts more of the budget into parameters. Chinchilla's rule puts more into data.

<style>
.chinchilla-widget{background:var(--surface);border-radius:12px;padding:20px 24px;margin:24px 0;font-family:inherit;color:var(--ink)}
.chinchilla-widget h4{margin:0 0 12px;color:var(--ink);font-size:16px}
.chinchilla-widget p.desc{font-size:13px;color:var(--muted);margin:0 0 16px}
.chinchilla-widget .presets{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.chinchilla-widget .presets button{background:var(--hairline);color:var(--ink);border:0;border-radius:999px;padding:6px 14px;min-height:32px;cursor:pointer;font-size:13px;font-family:var(--font-mono,monospace);transition:background .15s,color .15s}
.chinchilla-widget .presets button:hover{background:var(--accent-soft)}
.chinchilla-widget .presets button.active{background:var(--ink);color:var(--bg)}
.chinchilla-widget input[type=text]{width:100%;box-sizing:border-box;background:var(--bg);color:var(--ink);border:1px solid var(--hairline);border-radius:8px;padding:8px 12px;font-size:14px;font-family:var(--font-mono,monospace);margin-bottom:16px}
.chinchilla-widget .results{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.chinchilla-widget .result-card{background:var(--bg);border-radius:8px;padding:14px 16px;border-left:3px solid rgba(34,158,68,1)}
.chinchilla-widget .result-card.old{border-left-color:rgba(220,60,60,1)}
.chinchilla-widget .result-card .label{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px}
.chinchilla-widget .result-card .val{font-size:15px;font-weight:600;color:var(--ink);font-family:var(--font-mono,monospace)}
.chinchilla-widget .result-card .val span{font-weight:400;font-size:12px;color:var(--muted)}
.chinchilla-widget .summary{margin-top:14px;padding:12px 16px;background:var(--bg);border-radius:8px;font-size:13px;color:var(--ink);line-height:1.6;font-family:var(--font-mono,monospace)}
@media(max-width:500px){.chinchilla-widget .results{grid-template-columns:1fr}}
</style>

<div id="chinchilla-calc" class="chinchilla-widget">
  <h4>Chinchilla Compute Allocator</h4>
  <p class="desc">Enter a compute budget in FLOPs. Compare the Kaplan (2020) allocation with the Chinchilla (2022) allocation.</p>
  <div class="presets"></div>
  <input type="text" id="cc-input" placeholder="e.g. 1e21">
  <div class="results">
    <div class="result-card old">
      <div class="label">Kaplan (2020): more params</div>
      <div class="val" id="cc-kaplan">-</div>
    </div>
    <div class="result-card">
      <div class="label">Chinchilla (2022): balanced</div>
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
    // Training compute: C = 6 * N * D (approximately 6 FLOPs per parameter per training token).
    // Chinchilla (Hoffmann et al. 2022): approximately 20 tokens per parameter, so C = 120 * N^2.
    var chinN = Math.sqrt(C / 120);
    var chinD = 20 * chinN;
    // Kaplan et al. (2020), Table 6: N_opt = 1.3e9 * (C in PF-days)^0.73, 1 PF-day = 8.64e19 FLOPs.
    var kapN = 1.3e9 * Math.pow(C / 8.64e19, 0.73);
    var kapD = C / (6 * kapN);
    kaplanEl.innerHTML = 'N = ' + fmt(kapN) + ' params<br>D = ' + fmt(kapD) + ' tokens';
    chinchillaEl.innerHTML = 'N = ' + fmt(chinN) + ' params<br>D = ' + fmt(chinD) + ' tokens';
    var r = chinD / kapD;
    summaryEl.innerHTML = 'With C = ' + fmtFlops(C) + ' FLOPs:<br>' +
      'Chinchilla: ' + fmt(chinN) + ' params, ' + fmt(chinD) + ' tokens (' + (chinD / chinN).toFixed(0) + ' tokens per param)<br>' +
      'Kaplan: ' + fmt(kapN) + ' params, ' + fmt(kapD) + ' tokens (' + (kapD / kapN).toFixed(1) + ' tokens per param)<br>' +
      (r >= 1
        ? 'Chinchilla uses ' + r.toFixed(1) + 'x more data and ' + r.toFixed(1) + 'x fewer params'
        : 'At this small budget the two rules swap: Kaplan uses ' + (1 / r).toFixed(1) + 'x more data');
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

Kaplan et al. trained on one dataset (WebText2) and tested on others (books, Wikipedia, Common Crawl). Each test set gives a parallel line: the data changes the offset, not the slope. So a data difference that shows at small scale stays at large scale, and you can test data choices on small models.

![datacomposition](/assets/images/scaling_laws/dc.webp)

Repeating data helps up to about 4 epochs, then returns fall off fast ([Muennighoff et al., 2023](https://arxiv.org/abs/2305.16264)). That sets up the real tradeoff: repeat high-quality data, or pull in new lower-quality data.

### how to design a huge LM

- Use a [transformer](/blog/how-chatgpt-works#the-transformer), not an LSTM. In Kaplan et al., the transformer loss continues to drop as you add parameters. [MoE](/blog/paper#moe) (mixture of experts) is the only change that beats a vanilla transformer every time.
- Use Adam, not [SGD](/blog/nn#stochastic-gradient-descent), when you train for many epochs. Adam adapts the step size for each weight instead of one fixed rate.
- For depth, 1 vs 2 layers is night and day. From 2 layers up, depth barely matters for the same number of parameters (Kaplan et al., Figure 6).
- For batch size, a bigger batch gives more gradient signal per step, up to a critical batch size. Past it, you spend compute for little gain.

### recap

You pick which of the three knobs to turn: parameters, data, or compute. You can turn all three. The Chinchilla paper showed most labs were turning the wrong rknob. They were making models too big and not training them on enough data. Chinchilla (70B params, approximately 4.7x the data of GPT-3) beat the much larger GPT-3 with a better split of the compute budget.

> Loss ~ f(parameters, data, compute): all three matter, but how you balance them matters more.

Different labs make different bets on this tradeoff. ChatGPT scales up parameters and broad data with a very large compute budget, for generality. DeepSeek goes the other way, for reasoning efficiency: DeepSeek-V3 is a mixture-of-experts model that uses only 37B of its 671B parameters for each token, with higher-quality data and more inference-time compute. Both obey the same scaling laws, they just allocate their budgets differently.

### limitations and what's next

The catch: we're running out of high-quality text. Two escape routes are in play. Synthetic data (AlphaGo Zero learned entirely from self-play) and reasoning models like o1 that spend more compute at inference, thinking longer to answer better, which is its own new scaling axis. New architectures are the other hope, but nothing has unseated the transformer yet, usually because the alternatives aren't numerically stable.
