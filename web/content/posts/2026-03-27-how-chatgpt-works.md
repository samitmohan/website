---
layout: post
title: "What happens when you press 'submit' on ChatGPT?"
date:   2026-03-27 00:00:00 +0530
categories: [tech]
tokens: "~12k"
description: "From raw internet text to a streaming response"
tags: [llm]
---

<style>
:root {
  --cg-bg: var(--surface);
  --cg-bg-alt: var(--bg);
  --cg-border: var(--hairline);
  --cg-muted: var(--muted);
  --cg-muted2: var(--muted);
  --cg-muted3: var(--muted);
  --cg-muted4: #c7ccd4;
  --cg-blue: #1b48c8;
  --cg-blue-bg: #e8eefc;
  --cg-blue-border: #bcd0f5;
  --cg-green: #0d622c;
  --cg-green-bg: #e6f7ee;
  --cg-green-border: #b6e3c8;
  --cg-yellow: #7a4a05;
  --cg-yellow-bg: #f9f3d6;
  --cg-yellow-border: #e6dca3;
  --cg-purple: #6315e9;
  --cg-purple-bg: #efe8fc;
  --cg-purple-border: #d7c4f6;
  --cg-pink: #a21b57;
  --cg-pink-bg: #fce8f1;
  --cg-pink-border: #f6c4da;
  --cg-teal: #086059;
  --cg-teal-bg: #e0f6f4;
  --cg-teal-border: #b3e5e0;
  --cg-orange: #953808;
  --cg-orange-bg: #fdece1;
  --cg-orange-border: #f6cfb5;
  --cg-red-bg: #fce8e8;
  --cg-red: #a71b1b;
  --cg-red-border: #f2c2c2;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --cg-muted4: #5b5e65;
    --cg-blue: #a2b3f3;
    --cg-blue-bg: #1a2340;
    --cg-blue-border: #303f6b;
    --cg-green: #4ade80;
    --cg-green-bg: #14301f;
    --cg-green-border: #204d34;
    --cg-yellow: #d6b24a;
    --cg-yellow-bg: #2c2712;
    --cg-yellow-border: #4a4020;
    --cg-purple: #c4a7f8;
    --cg-purple-bg: #241a3d;
    --cg-purple-border: #3d2c66;
    --cg-pink: #f798ca;
    --cg-pink-bg: #331526;
    --cg-pink-border: #5a2942;
    --cg-teal: #2dd4bf;
    --cg-teal-bg: #10302c;
    --cg-teal-border: #1c4d47;
    --cg-orange: #fb9f52;
    --cg-orange-bg: #311d0e;
    --cg-orange-border: #563318;
    --cg-red-bg: #331616;
    --cg-red: #fa9a9a;
    --cg-red-border: #5a2929;
  }
}

:root[data-theme="dark"] {
  --cg-muted4: #5b5e65;
  --cg-blue: #a2b3f3;
  --cg-blue-bg: #1a2340;
  --cg-blue-border: #303f6b;
  --cg-green: #4ade80;
  --cg-green-bg: #14301f;
  --cg-green-border: #204d34;
  --cg-yellow: #d6b24a;
  --cg-yellow-bg: #2c2712;
  --cg-yellow-border: #4a4020;
  --cg-purple: #c4a7f8;
  --cg-purple-bg: #241a3d;
  --cg-purple-border: #3d2c66;
  --cg-pink: #f798ca;
  --cg-pink-bg: #331526;
  --cg-pink-border: #5a2942;
  --cg-teal: #2dd4bf;
  --cg-teal-bg: #10302c;
  --cg-teal-border: #1c4d47;
  --cg-orange: #fb9f52;
  --cg-orange-bg: #311d0e;
  --cg-orange-border: #563318;
  --cg-red-bg: #331616;
  --cg-red: #fa9a9a;
  --cg-red-border: #5a2929;
}
</style>


You press Enter. Between that and the first token in your browser sit trillions of tokens of training data, a deep stack of transformer layers (GPT-3 has 96), a reward model trained on human rankings, a KV cache that grows by one token per step in GPU memory, and a continuous batching scheduler that keeps the GPUs busy.

---

## the data

OpenAI never published how many tokens GPT-4 saw. A 2023 SemiAnalysis leak put it at about 13 trillion. Most web-scale text starts as raw HTML from [Common Crawl](https://commoncrawl.org/), which publishes a new crawl about once a month. The October 2026 crawl has 2.16 billion web pages, 371 TiB uncompressed. Raw Common Crawl is mostly garbage: boilerplate, navigation menus, duplicate content, spam.

The GPT-2 authors chose not to train on raw Common Crawl. They cite an earlier study that found a large amount of its documents "mostly unintelligible." So they switched to a different signal: Reddit karma. They scraped outbound links from Reddit posts with at least 3 karma. If humans upvoted it, it clears a basic quality bar.

![The WebText paragraph from the GPT-2 paper](/assets/images/chatgpt/gpt2-crawler.png)

*Figure: how OpenAI built WebText. Source: Radford et al. 2019, "Language Models are Unsupervised Multitask Learners", section 2.1.*

The cleaning pipeline every serious dataset now runs:
1. Parse the HTML, remove the tags, and keep the main text.
2. Remove duplicates. The same article has copies on hundreds of sites.
3. Filter by language. Common Crawl covers 100+ languages.
4. Filter for quality. Remove spam, adult content and low-quality text.
5. Remove personally identifiable information (PII): email addresses, IP addresses, API keys.

[FineWeb](https://huggingface.co/datasets/HuggingFaceFW/fineweb) is the best public example of this pipeline. Hugging Face starts from Common Crawl and ends up with cleaned English text: 15 trillion tokens (GPT-2 tokenizer) in the first release, more than 18.5 trillion now. A URL blocklist from the University of Toulouse removes adult sites. A fastText classifier keeps English pages. Hand-written heuristic filters (from Gopher, C4, and their own) remove low-quality text, and MinHash removes near-duplicates. They chose not to use a learned quality classifier for FineWeb; the FineWeb-Edu subset adds one.

![FineWeb data pipeline](/assets/images/chatgpt/fineweb.png)

*Figure: the FineWeb pipeline. Source: Hugging Face, "FineWeb: decanting the web for the finest text data at scale".*

Each row has `text`, `id`, `dump` (which crawl it came from), `url`, and a few more columns. Streaming the first row:

```python
from datasets import load_dataset

ds = load_dataset("HuggingFaceFW/fineweb", split="train", streaming=True)
row = next(iter(ds))
print(list(row))
# ['text', 'id', 'dump', 'url', 'date', 'file_path', 'language', 'language_score', 'token_count']
print(row["dump"], row["token_count"], row["text"][:60])
# CC-MAIN-2013-20 717 How AP reported in all formats from tornado-stricken regions
```

The model learns only what's in the training data. Two models at identical parameter count but different data quality will perform very differently. No architecture change fixes a bad corpus.

---

## tokenization

The model reads integers, not text.

A token is roughly a word or subword. In GPT-4o's tokenizer (`o200k_base`), " unbelievable" with a leading space is one token, but "Unbelievable" at the start of a line splits into "Un" + "bel" + "ievable". Characters are too granular (4096 characters = 4096 steps). Full words break on anything outside the training vocabulary. You can't handle novel words or code identifiers.

The standard is **BPE (Byte Pair Encoding)**. Start with individual bytes, then merge the most frequent adjacent pair again and again.

![Tokenization overview](/assets/images/chatgpt/tokenisation.png)

Two phases. Training runs once on the corpus and learns the merge rules:

```python
def get_stats(ids):
    counts = {}
    for pair in zip(ids, ids[1:]):
        counts[pair] = counts.get(pair, 0) + 1
    return counts

def merge(ids, pair, idx):
    newids = []
    i = 0
    while i < len(ids):
        if i < len(ids) - 1 and ids[i] == pair[0] and ids[i+1] == pair[1]:
            newids.append(idx)
            i += 2
        else:
            newids.append(ids[i])
            i += 1
    return newids

# GPT-2 runs this 50,000 times on a large corpus
# "t","h" -> "th" -> "the" (if "th"+"e" is frequent enough)
```

Inference applies the learned merges to new text:

```python
def encode(text, merges):
    tokens = list(text.encode("utf-8"))   # start as raw bytes
    while len(tokens) >= 2:
        stats = get_stats(tokens)
        pair = min(stats, key=lambda p: merges.get(p, float("inf")))
        if pair not in merges:
            break
        tokens = merge(tokens, pair, merges[pair])
    return tokens
```

![Inference phase tokenization](/assets/images/chatgpt/inferencetokenisation.png)

*Figure: at inference the tokenizer maps text to IDs and back. tiktoken's `o200k_base` gives `[60751, 668, 261, 41751]` for "Tell me a joke"; the first ID in the figure does not match.*

In practice you'd use tiktoken:

```python
import tiktoken
enc = tiktoken.encoding_for_model("gpt-4o")   # o200k_base
tokens = enc.encode("How does ChatGPT work?")
print(tokens)         # [5299, 2226, 17554, 162016, 1101, 30]
print(len(tokens))    # 6
```

GPT-4's older `cl100k_base` tokenizer needs 7 tokens for the same sentence: it splits "ChatGPT" into " Chat" + "G" + "PT". Bigger vocabularies give shorter sequences. I counted these with tiktoken:

| Text | GPT-2 (`gpt2`) | GPT-4 (`cl100k_base`) | GPT-4o (`o200k_base`) |
|---|---|---|---|
| "How does ChatGPT work?" | 7 | 7 | 6 |
| "Explain transformers." | 5 | 4 | 3 |
| "Unbelievable" | 4 | 3 | 3 |
| Vocabulary size | 50,257 | 100,277 | 200,019 |

Explore token splits interactively at [tiktokenizer.vercel.app](https://tiktokenizer.vercel.app/).

Fewer tokens per sentence = less compute per request. Token efficiency is a real cost lever at scale.

<div class="token-animation">
  <p class="anim-label">Tokenizing with o200k_base (GPT-4o): "How does ChatGPT work?"</p>
  <div class="token-row">
    <span class="token t1">How</span>
    <span class="token t2"> does</span>
    <span class="token t3"> Chat</span>
    <span class="token t4">GPT</span>
    <span class="token t6"> work</span>
    <span class="token t7">?</span>
  </div>
  <p class="token-count">6 tokens</p>
</div>

<style>
.token-animation {
  background: var(--cg-bg);
  border-radius: 8px;
  padding: 20px 24px;
  margin: 20px 0;
  font-family: monospace;
}
.anim-label {
  color: var(--cg-muted);
  font-size: 13px;
  margin: 0 0 14px 0;
  padding-right: 84px;
}
.token-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.token {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 600;
  opacity: 0;
  transform: translateY(8px);
  animation: fadeUp 0.3s forwards;
}
.token-count {
  color: var(--cg-muted2);
  font-size: 12px;
  margin: 12px 0 0 0;
  opacity: 0;
  animation: fadeUp 0.3s 2.5s forwards;
}
.t1 { background: var(--cg-blue-border); color: var(--cg-blue); animation-delay: 0.2s; }
.t2 { background: var(--cg-purple-border); color: var(--cg-purple); animation-delay: 0.5s; }
.t3 { background: var(--cg-green-border); color: var(--cg-green); animation-delay: 0.8s; }
.t4 { background: var(--cg-orange-border); color: var(--cg-orange); animation-delay: 1.1s; }
.t5 { background: var(--cg-pink-border); color: var(--cg-pink); animation-delay: 1.4s; }
.t6 { background: var(--cg-green-border); color: var(--cg-green); animation-delay: 1.7s; }
.t7 { background: var(--cg-teal-border); color: var(--cg-teal); animation-delay: 2.0s; }
@keyframes fadeUp {
  to { opacity: 1; transform: translateY(0); }
}
</style>

---

## the transformer

Modern LLMs use a decoder-only transformer. Token integers go in, a probability distribution over the next token comes out.

![Decoder-only architecture](/assets/images/chatgpt/decoderonly.png)

*Figure: the decoder half of the original Transformer. Source: Vaswani et al. 2017, "Attention Is All You Need", Figure 1. A decoder-only model such as GPT drops the middle attention sublayer, which reads from the encoder.*

Three parts:
1. The embedding layer turns token IDs into dense vectors: 4,096 numbers per token in Llama 2 7B, 12,288 in GPT-3 175B.
2. N identical transformer blocks refine those vectors: 32 blocks in Llama 2 7B, 96 in GPT-3 175B.
3. The output layer turns the final vector into a logit vector, one float per vocabulary token: 50,257 for GPT-2, about 200,000 for GPT-4o.

![Input and output of decoder](/assets/images/chatgpt/inpoutofdecode.png)

![Embedding and transformer block flow](/assets/images/chatgpt/trans.png)

Each block has two sublayers:
- In attention, tokens exchange information with each other.
- In the MLP (multilayer perceptron, also called the feed-forward network or FFN), each token processes its own vector alone.

Attention moves information between tokens. The MLP changes each token's vector based on what it collected. [Residual connections](/blog/math#resnets--residual-networks) accumulate: each block adds to the previous vector instead of replacing it.

| Part | Job |
|---|---|
| Attention | Routing: moves information between tokens |
| MLP / FFN | Computation: processes each token |
| Residual | Memory: accumulates what each block adds |

### how attention works

Every token computes three vectors at every layer:
- Q (query): what am I looking for?
- K (key): what do I advertise about myself?
- V (value): what information do I carry?

The attention score between positions i and j is `dot(Q_i, K_j) / sqrt(d_k)`. Without the `sqrt(d_k)` scale, large dot products push softmax into regions with very small gradients. A [softmax](/blog/math#activation-functions) turns the scores into weights. The weighted sum of the V vectors gives the output.

Like a search engine: Query is your search string, Keys are document titles, Values are the document contents. Dot product is the relevance score.

For "bank" in "river bank":
- `Q_bank · K_river` = high score, borrows "river" meaning
- `Q_bank · K_finance` = low score, ignores finance context

```python
import numpy as np

def attention(Q, K, V, mask=None):
    d_k = Q.shape[-1]
    scores = Q @ K.T / np.sqrt(d_k)
    if mask is not None:
        scores = scores + mask          # -inf for future positions
    scores -= scores.max(axis=-1, keepdims=True)
    weights = np.exp(scores)
    weights /= weights.sum(axis=-1, keepdims=True)
    return weights @ V
```

The [causal mask](/blog/math#causal-masking) fills future positions with -inf before softmax. Each token only attends to itself and earlier tokens. This constraint lets the model generate one token at a time without peeking ahead.

Multi-head attention runs several attention operations in parallel, each with its own weight matrices: 8 heads in the original Transformer, 96 in GPT-3 175B. Different heads learn different relationships, such as subject-verb agreement, coreference and syntactic structure. The model concatenates the head outputs and projects them back to the model width.

For a deeper look at how residual connections and attention interact across layers, see [from residual connections to attention residuals](/blog/attention-residuals).

![Transformer architecture](/assets/images/chatgpt/archTrans.png)

*Figure: the full encoder-decoder Transformer. Source: Vaswani et al. 2017, Figure 1. The red box marks the encoder, which decoder-only models such as GPT do not have.*

<div class="attn-viz">
  <p class="anim-label">Self-attention: "The cat sat on the mat"</p>
  <div class="attn-tokens">
    <span class="atk" id="atk0">The</span>
    <span class="atk" id="atk1">cat</span>
    <span class="atk" id="atk2">sat</span>
    <span class="atk" id="atk3">on</span>
    <span class="atk" id="atk4">the</span>
    <span class="atk" id="atk5">mat</span>
  </div>
  <p class="attn-caption">"sat" attends most to "cat" (subject of the verb). Different heads learn different dependency types.</p>
</div>

<style>
.attn-viz {
  background: var(--cg-bg);
  border-radius: 8px;
  padding: 20px 24px;
  margin: 20px 0;
}
.attn-tokens {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.atk {
  padding: 6px 14px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid var(--cg-blue-border);
  color: var(--cg-blue);
  background: var(--cg-blue-bg);
  opacity: 0;
  animation: fadeUp 0.25s forwards;
}
#atk0 { animation-delay: 0.1s; }
#atk1 { animation-delay: 0.3s; background: var(--cg-green-bg); border-color: var(--cg-green-border); color: var(--cg-green); }
#atk2 { animation-delay: 0.5s; background: var(--cg-orange-bg); border-color: var(--cg-orange-border); color: var(--cg-orange); }
#atk3 { animation-delay: 0.7s; }
#atk4 { animation-delay: 0.9s; background: var(--cg-blue-bg); border-color: var(--cg-blue-border); color: var(--cg-blue); }
#atk5 { animation-delay: 1.1s; background: var(--cg-purple-bg); border-color: var(--cg-purple-border); color: var(--cg-purple); }
.attn-caption {
  color: var(--cg-muted2);
  font-size: 12px;
  margin: 12px 0 0 0;
  opacity: 0;
  animation: fadeUp 0.3s 1.5s forwards;
}
</style>

### context window

The context window is the model's working memory: every token it can attend to at once. When a chat gets too long, the app must drop or summarize old messages, and the model has no access to what it drops.

GPT-2: 1,024 tokens. GPT-4o: 128,000 tokens. Larger context = more GPU memory and more compute per token, but it allows longer documents and conversations.

<div class="ctx-win-viz">
  <p class="anim-label">Context window filling: tokens accumulate, the oldest get dropped when it is full</p>
  <div class="ctx-win-outer">
    <div class="ctx-win-inner" id="ctxwin-bar"></div>
  </div>
  <div class="ctx-win-meta">
    <span id="ctxwin-count">0 tokens used</span>
    <span>128,000 token limit</span>
  </div>
  <p class="ctx-win-note" id="ctxwin-note">Tokens accumulate left to right. When the window fills, the app drops the oldest tokens. The model has no access to them after that.</p>
</div>

<script>
window._anims = window._anims || {};
(function(){
  var timers=[];
  window._anims.ctxwin = function(){
    timers.forEach(clearTimeout); timers=[];
    var bar=document.getElementById("ctxwin-bar");
    var countEl=document.getElementById("ctxwin-count");
    var noteEl=document.getElementById("ctxwin-note");
    if(!bar) return;
    bar.innerHTML='';
    if(countEl) countEl.textContent='0 tokens used';
    if(noteEl){ noteEl.textContent='Tokens accumulate left to right. When the window fills, the app drops the oldest tokens.'; noteEl.style.color='var(--cg-muted2)'; }
    var segs=[
      {label:"system",  flex:5,  color:"var(--cg-blue-bg)",border:"var(--cg-blue-border)",text:"var(--cg-blue)", tok:6400},
      {label:"turn 1",  flex:12, color:"var(--cg-green-bg)",border:"var(--cg-green-border)",text:"var(--cg-green)", tok:21760},
      {label:"turn 2",  flex:12, color:"var(--cg-yellow-bg)",border:"var(--cg-yellow-border)",text:"var(--cg-yellow)", tok:37120},
      {label:"turn 3",  flex:18, color:"var(--cg-purple-bg)",border:"var(--cg-purple-border)",text:"var(--cg-purple)", tok:60160},
      {label:"turn 4",  flex:20, color:"var(--cg-pink-bg)",border:"var(--cg-pink-border)",text:"var(--cg-pink)", tok:85760},
      {label:"new msg", flex:8,  color:"var(--cg-teal-bg)",border:"var(--cg-teal-border)",text:"var(--cg-teal)", tok:96000},
      {label:"overflow \u2192",flex:25,color:"var(--cg-red-bg)",border:"var(--cg-red-bg)",text:"var(--cg-red)",tok:128000},
    ];
    segs.forEach(function(seg,i){
      timers.push(setTimeout(function(){
        var el=document.createElement("div");
        el.className="ctx-win-seg";
        el.style.flex=seg.flex+"";
        el.style.background=seg.color;
        el.style.borderColor=seg.border;
        el.style.color=seg.text;
        el.textContent=seg.label;
        bar.appendChild(el);
        if(countEl) countEl.textContent=seg.tok.toLocaleString()+" tokens used";
        if(i===segs.length-1 && noteEl){ noteEl.style.color="var(--cg-red)"; noteEl.textContent="Window full. The app must drop or summarize the oldest turns. The model has no memory of what it drops."; }
      },600*(i+1)));
    });
  };
})();
</script>

<style>
.ctx-win-viz {
  background: var(--cg-bg);
  border-radius: 8px;
  padding: 20px 24px;
  margin: 20px 0;
}
.ctx-win-outer {
  height: 36px;
  background: var(--cg-bg-alt);
  border: 1px solid var(--cg-border);
  border-radius: 4px;
  overflow: hidden;
  margin: 12px 0 6px;
  padding: 2px;
}
.ctx-win-inner {
  display: flex;
  gap: 2px;
  height: 100%;
}
.ctx-win-seg {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  font-family: monospace;
  font-size: 10px;
  font-weight: 600;
  border: 1px solid;
  white-space: nowrap;
  overflow: hidden;
  padding: 0 3px;
  opacity: 0;
  animation: fadeUp 0.35s forwards;
}
.ctx-win-meta {
  display: flex;
  justify-content: space-between;
  font-family: monospace;
  font-size: 11px;
  color: var(--cg-muted3);
}
.ctx-win-note {
  color: var(--cg-muted2);
  font-size: 12px;
  margin: 10px 0 0;
  transition: color 0.6s;
}
</style>

### the modern decoder stack

The transformer above is 2017. Llama, Qwen, DeepSeek, Gemma keep the skeleton and swap almost every component:

- **RMSNorm, pre-norm.** RMSNorm (root mean square norm) is cheaper than [LayerNorm](/blog/math#layernorm). Putting it before each sublayer (pre-norm) lets gradients survive deeper stacks.
- **RoPE.** Rotary position embedding replaces the original [positional encoding](/blog/math#positional-encoding). It rotates Q and K by an angle that scales with position, so the dot product depends on the distance between tokens. YaRN stretches it past the trained length.
- **GQA.** In grouped-query attention, groups of query heads share one key/value head: Llama 3 70B has 64 query heads but only 8 KV heads, so its [KV cache](#kv-cache) (explained below) is 8x smaller than with one KV head per query head. It is the same lever the [inference post](/blog/inference#mha--mqa--gqa--mla) leans on, decided at architecture time.
- **SwiGLU MLP.** `W2 @ (silu(W1 @ x) * (W3 @ x))`. It is gated and has two up-projections instead of one. It gives lower loss than a plain ReLU MLP of the same size.
- **Hybrid attention.** Most layers attend only to a local window, a few stay global. You get long context without paying quadratic cost in every layer.

[life of a token](https://www.aleksagordic.com/blog/transformer) walks one vector through all of this if you want the longer read.

### when does generation stop?

Three stopping conditions:
- The model generates a special end-of-sequence (EOS) token.
- The output hits the configured `max_tokens` limit.
- The output matches a stop sequence that the caller set, such as `"\n\n"`.

A repetition penalty does not stop generation. It lowers the logits of tokens that already appeared, so the model repeats itself less.

---

## pretraining

Take 15 trillion tokens of cleaned text. Feed sequences into the transformer. At each position, predict the next token. Compute the [cross-entropy loss](/blog/math#cross-entropy-loss-code) against the actual token. Backprop. Repeat. (If you want to understand how backprop and the tensor operations underneath this work, [building pytorch from scratch](/blog/minitorch) walks through it.)

The supervision signal is the text itself.

The model learns whatever is predictable in human-written text: grammar, facts, reasoning patterns, code structure, mathematical notation. No one programs this in. It falls out of the loss.

**GPT-2** as a concrete example:
- Dataset: WebText, 40GB of text in slightly over 8 million documents, from Reddit links with at least 3 karma.
- Sizes in the paper: 117M, 345M, 762M and 1,542M parameters.
- Architecture: decoder-only, 1,024-token context window, byte-level BPE tokenizer with 50,257 tokens.
- Cost: OpenAI did not publish it.
- Today: Karpathy's [llm.c](https://github.com/karpathy/llm.c/discussions/677) reproduced the 1.5B model in 2024 in about 24 hours on one 8xH100 node, for about $672.

GPT-4 scale: trillions of tokens, thousands of GPUs, months. Sam Altman said GPT-4 cost more than $100M to train. OpenAI has not published GPT-4's architecture. Leaked reports from 2023 say it is a Mixture of Experts (MoE): each block has several expert FFNs, and a router sends each token to only 2 of them. The same reports (SemiAnalysis, July 2023) put the total at about 1.8 trillion parameters in 16 experts, with about 280 billion active per token. Treat these numbers as rumors. MoE gives you the capacity of a very large model at the per-token compute of a much smaller one. The [DeepSeek-V3 post](/blog/paper#moe) shows the routing code.

<div class="moe-viz">
  <p class="anim-label">MoE: router picks 2 of 8 FFN experts per token per layer</p>
  <div class="moe-top">
    <div class="moe-token-box" id="moe-tok-box">token: "Paris"</div>
    <div class="moe-router-lbl">&#8595; router (learned linear layer, softmax scores)</div>
  </div>
  <div class="moe-expert-row">
    <div class="moe-exp" id="mexp0">E0</div>
    <div class="moe-exp" id="mexp1">E1</div>
    <div class="moe-exp" id="mexp2">E2</div>
    <div class="moe-exp" id="mexp3">E3</div>
    <div class="moe-exp" id="mexp4">E4</div>
    <div class="moe-exp" id="mexp5">E5</div>
    <div class="moe-exp" id="mexp6">E6</div>
    <div class="moe-exp" id="mexp7">E7</div>
  </div>
  <p class="moe-note" id="moe-note-txt">The top-2 experts by router score run. 2 of 8 = 25% of the expert FFN weights per token.</p>
</div>

<script>
window._anims = window._anims || {};
(function(){
  var moeInterval=null, moeIdx=0;
  window._anims.moe = function(){
    if(moeInterval) clearInterval(moeInterval);
    moeIdx=0;
    var examples=[
      {token:'"Paris"',    active:[2,5], note:"E2 and E5 score highest. 2 of 8 experts run: 25% of the expert FFN weights."},
      {token:'"def"',      active:[0,7], note:"E0 and E7 score highest. A different token can pick a different pair."},
      {token:'"integral"', active:[1,4], note:"E1 and E4 score highest. The router decides per token and per layer."},
      {token:'"Hello"',    active:[3,6], note:"E3 and E6 score highest. Mixtral's authors found no clean topic split between experts."},
    ];
    function step(){
      var ex=examples[moeIdx%examples.length];
      for(var i=0;i<8;i++){ var el=document.getElementById("mexp"+i); if(el) el.className="moe-exp"; }
      var tb=document.getElementById("moe-tok-box"); if(tb) tb.textContent="token: "+ex.token;
      setTimeout(function(){
        ex.active.forEach(function(e){ var el=document.getElementById("mexp"+e); if(el) el.className="moe-exp moe-active"; });
        var nt=document.getElementById("moe-note-txt"); if(nt) nt.textContent=ex.note;
      },450);
      moeIdx++;
    }
    step();
    moeInterval=setInterval(step,2600);
  };
})();
</script>

<style>
.moe-viz {
  background: var(--cg-bg);
  border-radius: 8px;
  padding: 20px 24px;
  margin: 20px 0;
}
.moe-top { text-align: center; margin-bottom: 10px; }
.moe-token-box {
  display: inline-block;
  background: var(--cg-blue-bg);
  border: 1px solid var(--cg-blue-border);
  color: var(--cg-blue);
  font-family: monospace;
  font-size: 13px;
  font-weight: 700;
  padding: 5px 14px;
  border-radius: 5px;
}
.moe-router-lbl {
  font-family: monospace;
  font-size: 11px;
  color: var(--cg-green);
  margin: 5px 0 2px;
}
.moe-expert-row {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}
.moe-exp {
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-family: monospace;
  font-size: 12px;
  font-weight: 700;
  background: var(--cg-bg-alt);
  border: 1px solid var(--cg-border);
  color: var(--cg-muted);
  transition: background 0.35s, border-color 0.35s, color 0.35s, box-shadow 0.35s;
}
.moe-active {
  background: var(--cg-green-bg) !important;
  border-color: var(--cg-green-border) !important;
  color: var(--cg-green) !important;
  box-shadow: 0 0 10px var(--cg-green-bg)80;
}
.moe-note {
  color: var(--cg-muted2);
  font-size: 12px;
  margin: 12px 0 0;
  font-family: monospace;
}
</style>

What comes out: a very good autocomplete. Feed it "The capital of France is" and it outputs "Paris" with high probability. Feed it a half-written function and it completes it. Ask it a question and it continues your text instead of answering. The base model has no concept of question vs answer. It learned text continuation.

### pretraining is compression

Shannon showed that prediction and compression are the same problem. If a model gives the next token probability p, an arithmetic coder can store that token in about -log2(p) bits. Better prediction = smaller file.

Marcus Hutter took this seriously. The [Hutter Prize](http://prize.hutter1.net/) offers €500,000 to whoever compresses 1GB of English Wikipedia below a target size. The prize bets that compression = intelligence. To compress English text well, you need to model it: grammar, syntax, world facts, coreference, causal structure. A lookup table won't do it. You need a predictor that generalizes.

This is what pretraining produces. DeepMind's "Language Modeling Is Compression" (2023) used Chinchilla 70B as the predictor for an arithmetic coder. It compressed enwik9 (the 1GB Wikipedia file) to 8.3% of its raw size, about 0.66 bits per byte, if you don't count the model's own size. gzip gets 32.3%. Shannon's 1951 experiments put the entropy of English between 0.6 and 1.3 bits per letter.

The weights don't store the internet. They store what predicts the internet. That's why the model knows "The Eiffel Tower is in Paris" without having memorized that specific string. It learned the statistical structure that makes "Paris" the right continuation. It's also why the model hallucinates: it generates the most probable continuation and does not look up stored facts. When training data is sparse on a topic, plausible-sounding text and true text are indistinguishable to the predictor.

Pretraining is where the money goes. Alignment costs a fraction of it. The InstructGPT paper gives the numbers for its 175B model: SFT took 4.9 petaflop/s-days and PPO took 60, against 3,640 for GPT-3 pretraining. That is under 2% of the pretraining compute.

How much data and how large a model to train? That's the Chinchilla question, covered in detail in [scaling laws](/blog/scalinglaws#chinchilla).

![Pretraining vs post-training overview](/assets/images/chatgpt/preandpost.png)

---

## post-training: making it an assistant

### SFT (supervised fine-tuning)

Curate 10,000-100,000 examples of (prompt, ideal response). Continue training with the same loss function at a much smaller learning rate. The model learns to respond in a useful format.

SFT is cheap. The knowledge is already in the weights; you're redirecting it. The base model knows what "the capital of France" is. SFT teaches it to answer instead of continuing the sentence.

OpenAI says it trained ChatGPT's first SFT model on dialogues that human AI trainers wrote, mixed with the InstructGPT dataset converted to dialogue format. The InstructGPT SFT set has 12,725 training prompts, with demonstrations written by contractors.

The loss is the same next-token loss as pretraining. The input is the prompt followed by the ideal answer, and the loss counts only the answer tokens:

```python
logits = model(prompt + answer)                    # token IDs in, logits out
loss = cross_entropy(logits[len(prompt)-1:-1], answer)
```

Problem: "ideal" is subjective. Different annotators write different ideal responses. The loss treats every output token equally. It gives no signal for tone, helpfulness, or avoiding harmful content.

![SFT data preparation](/assets/images/chatgpt/data_prep_sft.webp)

*Figure: one SFT example in (prompt, response) format, taken from the Stanford Alpaca dataset.*

### RLHF (reinforcement learning from human feedback)

Code and math have verifiable correct answers. Writing and brainstorming don't, so you need a reward model to score them.

Four steps:

1. The SFT model generates several responses to each prompt. InstructGPT showed labelers between 4 and 9.
2. Human annotators rank them: A > C > B > D.
3. A reward model learns from these rankings. It maps (prompt, response) to one scalar score. For each pair where the labelers preferred $y_w$ over $y_l$, the loss pushes the preferred score up (a Bradley-Terry model):

$$
\text{loss} = -\log \sigma\big(r(x, y_w) - r(x, y_l)\big)
$$

4. PPO (Proximal Policy Optimization) updates the SFT model to maximize the reward model's score. A KL-divergence penalty stops it drifting too far from the SFT starting point:

$$
\max_\theta \; \mathbb{E}\big[R(x, y)\big] - \beta \, \mathrm{KL}\big(\pi_\theta \,\|\, \pi_{\text{SFT}}\big)
$$

The first term maximizes reward. The second term keeps the model close to the SFT model. Without the penalty, the model learns to exploit the reward model and produces unnatural outputs that score high (reward hacking).

<div class="rlhf-loop">
  <p class="anim-label">RLHF training loop</p>
  <div class="rlhf-steps">
    <div class="rstep rs1" id="rs1">SFT Model</div>
    <div class="rs-arrow ra1">&#8595;</div>
    <div class="rstep rs2" id="rs2">Generate<br>4-9 responses</div>
    <div class="rs-arrow ra2">&#8595;</div>
    <div class="rstep rs3" id="rs3">Human ranking<br>A &gt; C &gt; B &gt; D</div>
    <div class="rs-arrow ra3">&#8595;</div>
    <div class="rstep rs4" id="rs4">Train reward model<br>R(prompt, response)</div>
    <div class="rs-arrow ra4">&#8595;</div>
    <div class="rstep rs5" id="rs5">PPO update<br>maximize R &minus; &beta;&middot;KL</div>
    <div class="rs-arrow ra5">&#8593;</div>
    <div class="rstep rs6" id="rs6">Improved policy</div>
  </div>
</div>

<style>
.rlhf-loop {
  background: var(--cg-bg);
  border-radius: 8px;
  padding: 20px 24px;
  margin: 20px 0;
}
.rlhf-steps {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}
.rstep {
  padding: 8px 18px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  opacity: 0;
  animation: fadeUp 0.3s forwards;
}
.rs-arrow {
  color: var(--cg-green-border);
  font-size: 16px;
  margin-left: 20px;
  opacity: 0;
  animation: fadeUp 0.2s forwards;
}
.rs1 { background: var(--cg-blue-bg); color: var(--cg-blue); border: 1px solid var(--cg-blue-border); animation-delay: 0.2s; }
.rs2 { background: var(--cg-green-bg); color: var(--cg-green); border: 1px solid var(--cg-green-border); animation-delay: 0.6s; }
.rs3 { background: var(--cg-yellow-bg); color: var(--cg-yellow); border: 1px solid var(--cg-yellow-border); animation-delay: 1.0s; }
.rs4 { background: var(--cg-purple-bg); color: var(--cg-purple); border: 1px solid var(--cg-purple-border); animation-delay: 1.4s; }
.rs5 { background: var(--cg-pink-bg); color: var(--cg-pink); border: 1px solid var(--cg-pink-border); animation-delay: 1.8s; }
.rs6 { background: var(--cg-teal-bg); color: var(--cg-teal); border: 1px solid var(--cg-teal-border); animation-delay: 2.2s; }
.ra1 { animation-delay: 0.4s; }
.ra2 { animation-delay: 0.8s; }
.ra3 { animation-delay: 1.2s; }
.ra4 { animation-delay: 1.6s; }
.ra5 { animation-delay: 2.0s; color: var(--cg-orange-border); }
</style>

| Stage | Purpose | Data | Objective |
|-------|---------|------|-----------|
| Pretraining | Learn language | Internet text | Next-token prediction |
| SFT | Follow instructions | (instruction, response) pairs | Supervised loss |
| RLHF | Align to human preference | Ranked responses | Maximize reward |

![Summary](/assets/images/chatgpt/summary.webp)

*Figure: the four training stages, their data, compute and objective. The figure's dataset sizes and GPU counts are rough orders of magnitude.*

### DPO: a simpler alternative to PPO

DPO (Direct Preference Optimization) reframes alignment as supervised learning. Given a preferred response $y_w$ and a rejected response $y_l$ for the same prompt $x$, the loss is:

$$
h(y) = \beta \log \frac{\pi(y \mid x)}{\pi_{\text{ref}}(y \mid x)}
$$

$$
\text{loss} = -\log \sigma\big(h(y_w) - h(y_l)\big)
$$

$\pi$ is the model you train and $\pi_{\text{ref}}$ is the frozen SFT model. $h(y)$ is the implicit reward: how much more likely the trained model makes a response than the reference does. No reward model. No RL loop. The reward is implicit in the policy itself. It uses the same preference data as RLHF with far less machinery. Llama 3, Mixtral and Phi-3 use DPO instead of PPO in post-training, and variants such as ORPO and SimPO change the loss further.

PPO keeps four models in memory at the same time: the policy, a frozen reference, the reward model, and a value function. The optimization is fragile and sensitive to hyperparameters. DPO trains on a fixed set of preference pairs, while PPO and GRPO sample new responses during training. For reasoning models, where the reward comes from checking the answer, these online RL methods still dominate.

### thinking models

o1 and DeepSeek-R1 are RL-trained to emit reasoning tokens before the final answer. DeepSeek-R1 writes them in a `<think>...</think>` block and works through the problem step by step before it commits to a response. o1 hides its reasoning tokens from the user.

```text
User: "What is 237 x 194?"

Normal model:
  -> "237 x 194 = 45,978"  (immediate, sometimes wrong)

Thinking model:
  <think>
  237 x 194 = 237 x 200 - 237 x 6
  237 x 200 = 47,400
  237 x 6 = 1,422
  47,400 - 1,422 = 45,978
  </think>
  -> "237 x 194 = 45,978"  (verified via reasoning)
```

#### GRPO: how R1 was trained

DeepSeek-R1 uses GRPO (Group Relative Policy Optimization) instead of PPO. PPO needs a separate critic network to estimate a value baseline. GRPO removes the critic. It samples a group of G responses per prompt and uses the group's own rewards as the baseline:

```python
import numpy as np

# PPO: advantage = reward - V(state), where V is a learned value network
# GRPO: normalize each reward against its own group
rewards = np.array([1.0, 0.0, 0.0, 1.0])   # G=4 responses to one prompt
advantages = (rewards - rewards.mean()) / rewards.std()
print(advantages)                           # [ 1. -1. -1.  1.]
```

For math and code, where a rule checks the answer as right or wrong, GRPO is simpler: there is no value function to train and no actor-critic mismatch. R1's training worked because "does this answer match the ground truth" is a clean reward signal. The structured chain-of-thought emerged from RL on math problems. The model discovered that working through intermediate steps improved its reward on verifiable answers.

When thinking tokens are worth the cost:

| Task | Use thinking | Reason |
|------|-------------|--------|
| Multi-step math | Yes | Each step is verifiable, RL can optimize |
| Complex code | Yes | Logic chains benefit from working through |
| Factual lookup | No | Answer is in weights, no reasoning path needed |
| Creative writing | No | Chain-of-thought doesn't help creativity |
| Simple Q&A | No | Many times the tokens, no accuracy gain |

Thinking models are expensive: they can spend hundreds or thousands of reasoning tokens before a 50-token answer. For tasks where correctness is verifiable and errors are costly, that overhead is justified. For everything else, the standard model is better value.

---

## decoding: how text gets generated

The model outputs logits: a vector with one float per vocabulary token, about 200,000 floats for GPT-4o. You need a strategy to pick a token.

<div class="autogen-viz">
  <p class="anim-label">Autoregressive decode: one forward pass per token</p>
  <div class="ag-seq">
    <span class="ag-tok ag-p">The</span><span class="ag-tok ag-p"> capital</span><span class="ag-tok ag-p"> of</span><span class="ag-tok ag-p"> France</span><span class="ag-tok ag-p"> is</span><span id="ag-gen-container"></span><span class="ag-cursor" id="ag-cur">&#9611;</span>
  </div>
  <p class="ag-note" id="ag-note-txt">The model reads the whole prompt in one pass. Sampling from a 200,000-token distribution...</p>
</div>

<script>
window._anims = window._anims || {};
(function(){
  var timers = [];
  window._anims.autogen = function(){
    timers.forEach(clearTimeout); timers = [];
    var container = document.getElementById("ag-gen-container");
    var noteEl = document.getElementById("ag-note-txt");
    var cursor = document.getElementById("ag-cur");
    if(!container) return;
    container.innerHTML = '';
    if(cursor) cursor.style.display = 'inline';
    if(noteEl) noteEl.textContent = 'The model reads the whole prompt in one pass. Sampling from a 200,000-token distribution...';
    var tokens=[" Paris","."," It"," is"," known"," as"," the"," City"," of"," Light","."];
    var notes=["' Paris' sampled. The KV cache grows by 1 token.","'.' sampled. Context now 7 tokens.","Sampling continues. Each step reads the full growing KV cache.","","","","","","","","EOS token generated. Decode stops."];
    tokens.forEach(function(tok,i){
      timers.push(setTimeout(function(){
        var span=document.createElement("span");
        span.className="ag-tok ag-g";
        span.textContent=tok;
        container.appendChild(span);
        if(notes[i]) noteEl.textContent=notes[i];
        if(i===tokens.length-1) cursor.style.display="none";
      },700*(i+1)));
    });
  };
})();
</script>

<style>
.autogen-viz {
  background: var(--cg-bg);
  border-radius: 8px;
  padding: 20px 24px;
  margin: 20px 0;
  font-family: monospace;
}
.ag-seq {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  margin: 12px 0 8px;
  font-size: 15px;
  line-height: 2;
}
.ag-tok { border-radius: 3px; }
.ag-p { background: var(--cg-blue-bg); color: var(--cg-blue); padding: 2px 5px; margin-right: 1px; }
.ag-g {
  background: var(--cg-green-bg); color: var(--cg-green); border: 1px solid var(--cg-green-border);
  padding: 2px 6px; margin-left: 1px;
  opacity: 0; animation: fadeUp 0.3s forwards;
}
.ag-cursor { color: var(--cg-blue); animation: blink 0.9s infinite; margin-left: 2px; }
.ag-note { color: var(--cg-muted2); font-size: 12px; margin: 10px 0 0; }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
</style>

![Choosing from probabilities](/assets/images/chatgpt/choosingprob.png)

*Figure: after "I hope you are", the model gives "well" 86% and four other tokens the rest. The decoding strategy decides which token to pick.*

### greedy search

Always pick the highest-probability token. Deterministic. Fast. Gets stuck in repetitive loops.

![Greedy search](/assets/images/chatgpt/greedy.webp)

*Figure: GPT-2 with greedy decoding repeats "I'm not sure if I'll ever be able to walk with my dog". The prompt is from the Hugging Face blog post "How to generate text".*

### beam search

Keep the B most likely sequences at each step (beam width B, often 3 to 5). Beam search finds sequences with a higher total probability than greedy, at B times the cost. It is still deterministic and often less diverse. Translation and summarization use it, where you want the most likely output and not randomness.

![Beam search](/assets/images/chatgpt/beam.png)

*Figure: beam search with B = 3 after the word "How". Each step keeps the three best paths.*

### multinomial sampling

Sample according to probabilities. This adds randomness: you might pick a low-probability token. It can produce incoherent text if nothing constrains it.

![Multinomial sampling](/assets/images/chatgpt/multinomial.png)

### top-K sampling

Pick the top K tokens by probability. Sample from those K. Fixed candidate set size is a problem: sometimes the model is very confident (K=1 is ideal), sometimes uncertain (K=50 makes sense). A fixed K fits neither case.

![Top-K sampling](/assets/images/chatgpt/topk.png)

*Figure: top-K with K = 3 keeps "are", "is" and "do" and samples only from those.*

### top-P (nucleus) sampling

Pick the smallest set of tokens whose cumulative probability reaches p (typically 0.9). The size of the candidate set adapts to the model's confidence.

![Top-P sampling distribution](/assets/images/chatgpt/topp.png)

*Figure: with p = 0.88, a confident model keeps one token ("lot", 89%). An uncertain model keeps four (31 + 29 + 24 + 7 = 91%).*

![Top-P results comparison](/assets/images/chatgpt/topPresults.webp)

*Figure: the same GPT-2 prompt with top-p = 0.92 and top-k disabled. The text no longer loops. Source: the Hugging Face "How to generate text" example.*

```python
import numpy as np

def top_p_sample(logits, p=0.9, temperature=1.0):
    logits = logits / temperature
    logits -= logits.max()
    probs = np.exp(logits)
    probs /= probs.sum()
    sorted_idx = np.argsort(probs)[::-1]
    sorted_probs = probs[sorted_idx]
    cumsum = np.cumsum(sorted_probs)
    cutoff = int(np.searchsorted(cumsum, p)) + 1
    nucleus_probs = sorted_probs[:cutoff]
    nucleus_probs /= nucleus_probs.sum()
    chosen_rank = np.random.choice(cutoff, p=nucleus_probs)
    return int(sorted_idx[chosen_rank])
```

### temperature

Temperature T divides the logits $z_i$ before the softmax:

$$
p_i = \frac{e^{z_i / T}}{\sum_j e^{z_j / T}}
$$

Temperature < 1.0 sharpens the distribution (model becomes more confident). Temperature > 1.0 flattens it (more random). Temperature approaching 0 approaches greedy. Take the six-token distribution from the top-P widget below, with "Paris" at 0.86 after normalizing. At T = 0.5, "Paris" goes up to 0.99. At T = 2.0, it drops to 0.55.

OpenAI does not publish per-task settings for its own products. The table below is a community rule of thumb, not an official setting:

![Hyperparameter table](/assets/images/chatgpt/hyperparameter.png)

Using Hugging Face:

```python
from transformers import set_seed
set_seed(42)

output = model.generate(
    **model_inputs,
    max_new_tokens=40,
    do_sample=True,
    top_p=0.92,
    temperature=0.8,
    top_k=0
)
```

Decoding strategy comparison:

| Strategy | Type | When to use |
|---|---|---|
| Greedy | Deterministic | One best answer, formal translation |
| Beam Search | Deterministic | Summarization, a few good candidates |
| Top-K | Stochastic | Chat, creative text, fixed candidate set |
| Top-P | Stochastic | Chat, creative text, dynamic set (modern LLMs) |

<div class="topp-viz">
  <p class="anim-label">Top-P sampling (p=0.9): probability distribution over next token</p>
  <div class="bar-container">
    <div class="bar-wrap">
      <div class="bar b1" style="--h:85%"><span class="bar-label">Paris</span></div>
    </div>
    <div class="bar-wrap">
      <div class="bar b2" style="--h:6%"><span class="bar-label">Lyon</span></div>
    </div>
    <div class="bar-wrap">
      <div class="bar b3 excluded" style="--h:4%"><span class="bar-label">France</span></div>
    </div>
    <div class="bar-wrap">
      <div class="bar b4 excluded" style="--h:2%"><span class="bar-label">Nice</span></div>
    </div>
    <div class="bar-wrap">
      <div class="bar b5 excluded" style="--h:1%"><span class="bar-label">Marseille</span></div>
    </div>
    <div class="bar-wrap">
      <div class="bar b6 excluded" style="--h:0.5%"><span class="bar-label">...</span></div>
    </div>
  </div>
  <p class="topp-note">Paris 85% + Lyon 6% = 91%, which reaches p = 0.9. Nucleus = {Paris, Lyon}. France (4%) and the rest drop out. Sample from the nucleus only.</p>
</div>

<style>
.topp-viz {
  background: var(--cg-bg);
  border-radius: 8px;
  padding: 20px 24px;
  margin: 20px 0;
}
.bar-container {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  height: 120px;
  margin: 16px 0 8px;
}
.bar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  flex: 1;
}
.bar {
  width: 100%;
  height: var(--h);
  border-radius: 4px 4px 0 0;
  position: relative;
  animation: growUp 0.5s ease-out both;
  transform-origin: bottom;
}
.bar-label {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: var(--cg-muted);
  white-space: nowrap;
  font-family: monospace;
}
.b1 { background: var(--cg-green-border); animation-delay: 0.1s; }
.b2 { background: var(--cg-blue-border); animation-delay: 0.2s; }
.b3 { background: var(--cg-purple-border); animation-delay: 0.3s; }
.excluded { background: var(--cg-muted4); }
.b4 { animation-delay: 0.4s; }
.b5 { animation-delay: 0.5s; }
.b6 { animation-delay: 0.6s; }
.topp-note {
  color: var(--cg-muted2);
  font-size: 12px;
  margin: 28px 0 0 0;
  opacity: 0;
  animation: fadeUp 0.3s 1.2s forwards;
}
@keyframes growUp {
  from { transform: scaleY(0); opacity: 0; }
  to { transform: scaleY(1); opacity: 1; }
}
</style>

---

## what happens when you press enter

One request, start to finish.

<div class="pipeline-viz">
  <p class="anim-label">Request flow: Enter key to first token</p>
  <div class="pipeline-steps">
    <div class="pstep ps1">Client<br><span class="ps-sub">POST /v1/chat</span></div>
    <div class="ps-arrow">&#8594;</div>
    <div class="pstep ps2">CDN<br><span class="ps-sub">TLS, edge</span></div>
    <div class="ps-arrow">&#8594;</div>
    <div class="pstep ps3">Gateway<br><span class="ps-sub">auth/rate</span></div>
    <div class="ps-arrow">&#8594;</div>
    <div class="pstep ps4">Backend<br><span class="ps-sub">tokenize</span></div>
    <div class="ps-arrow">&#8594;</div>
    <div class="pstep ps5">Safety<br><span class="ps-sub">moderation</span></div>
    <div class="ps-arrow">&#8594;</div>
    <div class="pstep ps6">GPU Cluster<br><span class="ps-sub">prefill+decode</span></div>
    <div class="ps-arrow">&#8594;</div>
    <div class="pstep ps7">SSE Stream<br><span class="ps-sub">tokens/sec</span></div>
  </div>
</div>

<style>
.pipeline-viz {
  background: var(--cg-bg);
  border-radius: 8px;
  padding: 20px 24px;
  margin: 20px 0;
}
.pipeline-steps {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 4px;
}
.pstep {
  padding: 10px 14px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  line-height: 1.4;
  opacity: 0;
  animation: fadeUp 0.3s forwards;
}
.ps-sub {
  font-size: 10px;
  font-weight: 400;
  opacity: 1;
}
.ps-arrow {
  color: var(--cg-muted4);
  font-size: 18px;
  opacity: 0;
  animation: fadeUp 0.2s forwards;
}
.ps1 { background: var(--cg-blue-bg); color: var(--cg-blue); border: 1px solid var(--cg-blue-border); animation-delay: 0.1s; }
.ps2 { background: var(--cg-green-bg); color: var(--cg-green); border: 1px solid var(--cg-green-border); animation-delay: 0.4s; }
.ps3 { background: var(--cg-orange-bg); color: var(--cg-orange); border: 1px solid var(--cg-orange-border); animation-delay: 0.7s; }
.ps4 { background: var(--cg-purple-bg); color: var(--cg-purple); border: 1px solid var(--cg-purple-border); animation-delay: 1.0s; }
.ps5 { background: var(--cg-red-bg); color: var(--cg-orange); border: 1px solid var(--cg-red-border); animation-delay: 1.3s; }
.ps6 { background: var(--cg-teal-bg); color: var(--cg-teal); border: 1px solid var(--cg-teal-border); animation-delay: 1.6s; }
.ps7 { background: var(--cg-yellow-bg); color: var(--cg-yellow); border: 1px solid var(--cg-yellow-border); animation-delay: 1.9s; }
.ps-arrow:nth-child(2)  { animation-delay: 0.25s; }
.ps-arrow:nth-child(4)  { animation-delay: 0.55s; }
.ps-arrow:nth-child(6)  { animation-delay: 0.85s; }
.ps-arrow:nth-child(8)  { animation-delay: 1.15s; }
.ps-arrow:nth-child(10) { animation-delay: 1.45s; }
.ps-arrow:nth-child(12) { animation-delay: 1.75s; }
</style>

![System design overview](/assets/images/chatgpt/sysDesign.webp)

*Figure: a chatbot request path with safety checks on the prompt and on the response, and session history fed back into the next prompt.*

OpenAI does not publish per-stage latencies. The latency column is an illustrative budget, not a measurement:

| Step | Component | What it does | Latency (illustrative) |
|------|-----------|--------------|---------|
| 1 | Client | POST /v1/chat/completions | - |
| 2 | CDN/Edge | TLS termination, DDoS, geo-routing | ~20ms |
| 3 | API Gateway | Auth, rate limit, route | ~5ms |
| 4 | Backend | Context build, tokenize | ~10ms |
| 5 | Safety | Input moderation classifier | ~12ms |
| 6 | Inference cluster | Prefill + decode | time to first token (TTFT) ~50-200ms, then tokens/sec |
| 7 | Streamer | Server-Sent Events (SSE) chunks to client | overlaps with decode |
| 8 | Safety | Output moderation | ~8ms |
| 9 | Post-processing | Detokenize, log, bill | ~2ms |

### 1. client

The ChatGPT web app talks to its own backend, but the public API takes the same kind of request. With the API, you send:

```json
{
  "model": "gpt-4o",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Explain transformers."}
  ],
  "stream": true,
  "temperature": 0.7,
  "max_tokens": 1024
}
```

`stream: true` makes the server answer with a Server-Sent Events (SSE) stream. Tokens stream back as the model generates them. SSE is one-directional (server to client), which is all you need. WebSockets are bidirectional and add complexity you don't need here. SSE is plain HTTP: one long response that the server keeps writing to.

### 2. CDN / edge

A content delivery network (CDN) handles TLS termination and DDoS protection at the edge. Both `chatgpt.com` and `api.openai.com` answer with `server: cloudflare` headers. The TLS handshake round trips go to a nearby edge server and not to a far origin.

### 3. API gateway

The front door. Three jobs. OpenAI does not publish its gateway design, so the details below show a typical design.

First, auth. The gateway validates the API key, for example by hashing it and looking up the hash in a fast key-value store such as Redis. An invalid key returns `401` at once, and no traffic goes deeper.

Second, rate limiting, for example with a token bucket:

```text
Token Bucket:
  Rate: 100 tokens/sec
  Bucket capacity: 1000 tokens

  Request arrives: costs 10 tokens -> allowed
  Burst request: costs 500 -> allowed (bucket had space)
  Bucket empty -> REJECTED (429 Too Many Requests)
```

Third, routing. The model name decides which GPU cluster gets the request. OpenAI does not publish which GPUs serve which model.

### 4. backend service

Assembles the full context:

```text
System Prompt (fixed per deployment)
    +
Conversation History (retrieved from DB or passed in request)
    +
User's new message
    +
Any tool call outputs
    =
Full Context (up to 128K tokens for GPT-4o)
```

If the conversation history is too long, the backend drops the oldest messages. The backend tokenizes the full context with tiktoken, checks it against the context window limit, and estimates billing.

### 5. safety layer (input)

Before the expensive model sees anything, a small, fast classifier checks the prompt for hate speech, self-harm, illegal content, and jailbreak attempts. If it flags the prompt, the system rejects the request here and spends no GPU time on the big model.

### output safety layer

The output gets a check too. OpenAI does not publish how it moderates output. One design runs output moderation in parallel with streaming (step 7 below), not after it: while the model generates tokens 10-20, the classifier checks tokens 1-9. If it finds a violation mid-stream, the server cuts the response and the client receives an error. Because the check runs in parallel, it adds almost nothing to the total response time.

The `finish_reason` field in every API response tells you what stopped generation:
- `"stop"`: the model generated an EOS token, or the output hit a stop sequence.
- `"length"`: the output hit the `max_tokens` limit.
- `"content_filter"`: a content filter flagged the output and removed content.
- `"tool_calls"`: the model called a tool (tool calling is in step 8 below).

If you're building on the API and users report truncated responses, `finish_reason` is the first thing to check.

### 6. inference cluster

Two distinct phases for every request (the [inference post](/blog/inference#3-prefill-vs-decode) goes deeper):

Prefill processes the entire input prompt in one forward pass. The transformer attends over all input tokens at the same time. The output is the KV cache: the key and value vectors for every layer and every input token. Prefill is compute-bound.

Decode generates tokens one at a time. Each step runs a forward pass for the new token only and reads the cached K/V from earlier steps. It appends the new token's K/V to the cache, samples, and repeats. Decode is memory-bandwidth-bound: each step reads every weight of the model from GPU memory once, and all sequences in the batch share that read.

Open-source serving uses engines such as vLLM, TensorRT-LLM, or SGLang, not raw PyTorch. These handle batching, KV cache management, and kernel optimization. OpenAI's own engine is not public.

The hardware is NVIDIA A100 (80GB), H100 (80GB), or H200 (141GB) class GPUs. A 100B parameter model at FP16 needs 200GB for the weights alone, so it needs several GPUs. Tensor parallelism splits each layer's matrices (attention heads and MLP) across GPUs; pipeline parallelism splits model depth across nodes.

```text
Model Parallelism:
  Node 1: [GPU0] [GPU1] [GPU2] [GPU3]  <- Layers 1-48
  Node 2: [GPU4] [GPU5] [GPU6] [GPU7]  <- Layers 49-96
```

#### the arithmetic of one request

Put real numbers on prefill and decode with an open model whose config is public. Llama 3 70B has 80 layers, 8 KV heads and a head dimension of 128 (Llama 3 paper, Table 3). Its checkpoint holds 70.6 billion parameters (the Hugging Face model files). An H100 SXM has 80 GB of memory and 3.35 TB/s of memory bandwidth (NVIDIA's H100 spec page).

The KV cache stores a K and a V vector for every layer and every KV head, at 2 bytes per number in BF16:

$$
2 \times 80 \times 8 \times 128 \times 2 = 327{,}680 \text{ bytes}
$$

That is 320 KiB per token.

It adds up to 2.5 GiB for an 8K-token conversation and 40 GiB at 128K tokens, for one user.

The weights take 2 bytes per parameter in BF16, 1 in INT8 and half a byte in INT4 (the [quantization](#quantization) section below explains these formats): 141 GB, 71 GB and 35 GB. 141 GB does not fit on one 80 GB H100.

At batch size 1, each decode step reads every weight once to produce one token. So memory bandwidth sets the speed limit:

$$
\text{tokens/s} \le \frac{\text{memory bandwidth}}{\text{weight bytes}}
$$

- BF16 needs two H100s with tensor parallelism. Together they read at 6.7 TB/s: 6.7 TB/s / 141 GB = about 47 tokens/s.
- INT4 (35 GB) fits on one H100: 3.35 TB/s / 35 GB = about 95 tokens/s.

These are upper bounds. Real kernels never reach full bandwidth. Batching shares that one read of the weights across many requests, so 32 users cost almost the same weight traffic as one. That is why [continuous batching](#continuous-batching) exists.

### 7. streaming back

Each token streams back via SSE as the model generates it. Each event is one `data:` line followed by a blank line (fields shortened here):

```text
data: {"object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"The"}}]}

data: {"object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":" transformer"}}]}

data: {"object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":" architecture"}}]}

data: [DONE]
```

For a 500-token response at 50 tokens/sec: 10 seconds total. Without streaming you stare at a blank screen for 10 seconds. With streaming you start reading after the first token, about 130ms in the illustrative budget below.

### 8. post-processing

After generation: detokenize (token IDs back to text), strip control tokens, normalize whitespace, count tokens for billing.

Tool calling (function calling) works like this. When the model needs real-time data, it generates a structured tool call instead of text. In the Chat Completions API, the assistant message carries it, and `arguments` is a JSON string:

```json
{
  "role": "assistant",
  "tool_calls": [{
    "id": "call_abc123",
    "type": "function",
    "function": {
      "name": "web_search",
      "arguments": "{\"query\": \"current weather in Mumbai\"}"
    }
  }]
}
```

The backend intercepts this, runs the tool, puts the result back into the context, and the model generates its final answer. That's what makes an AI agent: it takes actions in a loop, not just text in response to text. For how retrieval fits into this (RAG, vector search, chunking), see [rag](/blog/rag).

### logging and observability

Every request emits structured metrics at each layer:

```text
request_id:       "req_abc123"
user_id:          "usr_456"
model:            "gpt-4o"
input_tokens:     512
output_tokens:    248
total_latency_ms: 2340
ttft_ms:          210        <- Time To First Token
tps:              116        <- Tokens Per Second during decode
region:           "us-east-1"
gpu_node:         "h100-node-42"
finish_reason:    "stop"
safety_flagged:   false
```

The record is consistent: 210ms + 248 tokens / 116 tokens per second = about 2,340ms total.

TTFT (time to first token) and TPS (tokens per second) are the two numbers anyone running inference cares about. TTFT measures how quickly you start responding; prefill and queue wait dominate it. TPS measures throughput during decode; model size, quantization, and GPU memory bandwidth dominate it. Optimizing one doesn't improve the other by default. Disaggregated serving exists because prefill and decode respond to different hardware improvements.

### full latency breakdown

An illustrative budget for one GPT-4o request ("Explain the transformer architecture", ~400 token response). OpenAI does not publish these numbers. Only the token count comes from a measurement (about 20 input tokens with `o200k_base`, counting the system prompt and the chat-format overhead):

| Stage | Time |
|---|---|
| CDN / TLS handshake | ~20ms |
| API gateway (auth + rate limit) | ~5ms |
| Backend context build | ~10ms |
| Input safety check | ~12ms |
| Queue wait (continuous batching) | ~30ms |
| Prefill (~20 input tokens) | ~50ms |
| Decode (400 output tokens at 100 tok/s) | ~4,000ms |
| Output safety check | ~8ms |
| Network streaming | ~15ms |
| TTFT (sum of the first six rows) | ~127ms |
| Total wall-clock | ~4,150ms |

The bottleneck is decode. Quantization, speculative decoding, and better hardware all target decode throughput.

---

## inference optimizations

### KV cache

Without a cache, decode step n reruns all n previous tokens to rebuild their K/V, which is O(n^2) work for the whole response. With the cache, each step computes K/V for the new token only, and the cache grows in GPU memory (VRAM) by 320 KiB per token for Llama 3 70B (from the arithmetic above). The [inference post](/blog/inference#5-the-kv-cache) works through the cache size.

<div class="kv-viz">
  <p class="anim-label">KV cache growing during decode</p>
  <div class="kv-row" id="kvrow">
    <div class="kv-block prefill-block">Prefill: [system + user prompt]</div>
  </div>
  <div class="decode-tokens" id="dtokens"></div>
  <p class="kv-note" id="kvnote"></p>
</div>

<style>
.kv-viz {
  background: var(--cg-bg);
  border-radius: 8px;
  padding: 20px 24px;
  margin: 20px 0;
}
.kv-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 12px 0 8px;
}
.prefill-block {
  background: var(--cg-green-bg);
  border: 1px solid var(--cg-green-border);
  color: var(--cg-green);
  padding: 5px 12px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
}
.decode-tokens {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}
.kv-token {
  background: var(--cg-blue-bg);
  border: 1px solid var(--cg-blue-border);
  color: var(--cg-blue);
  padding: 5px 10px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
  opacity: 0;
  animation: fadeUp 0.3s forwards;
}
.kv-note {
  color: var(--cg-muted2);
  font-size: 12px;
  margin: 10px 0 0 0;
  opacity: 0;
  transition: opacity 0.4s;
}
</style>

[PagedAttention](/blog/inference#71---pagedattention-os-virtual-memory-for-the-kv-cache) (from vLLM) stores the KV cache in fixed-size pages with a page table, like OS virtual memory, instead of one large contiguous block per sequence. The vLLM paper measured that older systems used only 20-38% of their KV cache memory for real token states, and vLLM gets 2-4x their throughput at the same latency.

### continuous batching

Static batching waits for every request in a batch to finish before it starts the next batch, so one long request holds everyone else. [Continuous batching](/blog/inference#72---continuous-batching) checks at each decode step which sequences are done and fills their slots with new requests at once; the Orca paper (OSDI 2022) reported 36.9x the throughput of NVIDIA FasterTransformer on GPT-3 175B at the same latency.

<div class="cbatch-viz">
  <p class="anim-label">Static vs continuous batching: GPU slot utilization over time &rarr;</p>

  <p class="cbt-heading">Static batching: the whole batch waits for the slowest request</p>
  <div class="cbt-grid">
    <div class="cbt-row"><span class="cbt-lbl">Slot 1</span><div class="cbt-track"><div class="cbt-blk cbt-a" style="flex:1.0">A</div><div class="cbt-idle" style="flex:0.5">idle</div><div class="cbt-blk cbt-d" style="flex:1.0">D</div></div></div>
    <div class="cbt-row"><span class="cbt-lbl">Slot 2</span><div class="cbt-track"><div class="cbt-blk cbt-b" style="flex:1.5">B (long)</div><div class="cbt-blk cbt-e" style="flex:1.0">E</div></div></div>
    <div class="cbt-row"><span class="cbt-lbl">Slot 3</span><div class="cbt-track"><div class="cbt-blk cbt-c" style="flex:0.5">C</div><div class="cbt-idle cbt-waste" style="flex:1.0">waits for B</div><div class="cbt-blk cbt-f" style="flex:1.0">F</div></div></div>
  </div>
  <p class="cbt-heading" style="margin-top:16px">Continuous batching: a new request fills a slot the moment one finishes</p>
  <div class="cbt-grid">
    <div class="cbt-row"><span class="cbt-lbl">Slot 1</span><div class="cbt-track"><div class="cbt-blk cbt-a cba1" style="flex:1.0">A</div><div class="cbt-blk cbt-d cba2" style="flex:1.0">D</div><div class="cbt-blk cbt-g cba3" style="flex:0.5">G</div></div></div>
    <div class="cbt-row"><span class="cbt-lbl">Slot 2</span><div class="cbt-track"><div class="cbt-blk cbt-b cba1" style="flex:1.5">B</div><div class="cbt-blk cbt-e cba2" style="flex:1.0">E</div></div></div>
    <div class="cbt-row"><span class="cbt-lbl">Slot 3</span><div class="cbt-track"><div class="cbt-blk cbt-c cba1" style="flex:0.5">C</div><div class="cbt-blk cbt-f cba2" style="flex:1.0">F</div><div class="cbt-blk cbt-h cba3" style="flex:1.0">H</div></div></div>
  </div>
  <p class="cbt-note">Same time span and same request lengths in both charts. Static batching leaves 1.5 slot-units idle and starts 6 requests. Continuous batching leaves none idle and starts 8.</p>
</div>

<style>
.cbatch-viz {
  background: var(--cg-bg);
  border-radius: 8px;
  padding: 20px 24px;
  margin: 20px 0;
}
.cbt-heading {
  font-family: monospace;
  font-size: 12px;
  color: var(--cg-muted);
  margin: 0 0 8px 0;
}
.cbt-grid { display: flex; flex-direction: column; gap: 4px; }
.cbt-row { display: flex; align-items: center; gap: 8px; }
.cbt-lbl { font-family: monospace; font-size: 11px; color: var(--cg-muted3); width: 44px; flex-shrink: 0; }
.cbt-track { display: flex; flex: 1; gap: 2px; height: 32px; }
.cbt-blk {
  display: flex; align-items: center; justify-content: center;
  border-radius: 4px; font-family: monospace; font-size: 12px; font-weight: 700;
  flex: 1;
}
.cbt-idle {
  display: flex; align-items: center; justify-content: center;
  border-radius: 4px; font-family: monospace; font-size: 10px; font-weight: 400;
  flex: 1;
  background: var(--cg-bg-alt); border: 1px dashed var(--cg-border); color: var(--cg-muted);
}
.cbt-waste { color: var(--cg-red); border-color: var(--cg-red-bg); background: var(--cg-red-bg); }
.cbt-a { background: var(--cg-blue-bg); border: 1px solid var(--cg-blue-border); color: var(--cg-blue); }
.cbt-b { background: var(--cg-green-bg); border: 1px solid var(--cg-green-border); color: var(--cg-green); }
.cbt-c { background: var(--cg-orange-bg); border: 1px solid var(--cg-orange-border); color: var(--cg-orange); }
.cbt-d { background: var(--cg-purple-bg); border: 1px solid var(--cg-purple-border); color: var(--cg-purple); }
.cbt-e { background: var(--cg-yellow-bg); border: 1px solid var(--cg-yellow-border); color: var(--cg-yellow); }
.cbt-f { background: var(--cg-pink-bg); border: 1px solid var(--cg-pink-border); color: var(--cg-pink); }
.cbt-g { background: var(--cg-teal-bg); border: 1px solid var(--cg-teal-border); color: var(--cg-teal); }
.cbt-h { background: var(--cg-pink-bg); border: 1px solid var(--cg-pink-border); color: var(--cg-pink); }
.cbt-i { background: var(--cg-purple-bg); border: 1px solid var(--cg-pink-border); color: var(--cg-purple); }
.cbt-a, .cbt-b, .cbt-c, .cbt-d, .cbt-e, .cbt-f, .cbt-g, .cbt-h, .cbt-i { }
.cba1 { opacity: 0; animation: fadeUp 0.4s 0.1s forwards; }
.cba2 { opacity: 0; animation: fadeUp 0.4s 0.7s forwards; }
.cba3 { opacity: 0; animation: fadeUp 0.4s 1.3s forwards; }
.cbt-note {
  color: var(--cg-muted2); font-size: 12px; margin: 10px 0 0;
  opacity: 0; animation: fadeUp 0.3s 1.8s forwards;
}
</style>

### quantization

Quantization stores the weights in INT8 (1 byte) or INT4 (half a byte) instead of BF16 (2 bytes), and GPTQ, AWQ or QLoRA (fine-tuning on a 4-bit base) keep the quality loss small. Decode is memory-bound, so Llama 3 70B drops from 141 GB to 35 GB in INT4, fits on one H100, and decodes faster (see the arithmetic above). The [inference post](/blog/inference#8-quantization) covers the formats in depth.

```python
import torch
from transformers import AutoModelForCausalLM, BitsAndBytesConfig

# Load the base model in 4-bit NF4, the storage format QLoRA uses
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,
)
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-13b-hf",
    quantization_config=bnb_config,
)
```

### speculative decoding

Each decode step requires one full forward pass through the large model. At 100 tokens/sec for a 4000ms response, the large model is the bottleneck.

Fix: a small draft model generates 4-5 candidate tokens ahead. The large model checks all of them in a single forward pass with rejection sampling. It accepts a draft token x with probability min(1, p(x)/q(x)), where p is the large model's probability and q is the draft model's. Even 3 of 5 accepted is a net win, because the check is one pass and the draft model is fast.

```text
Draft model (small, fast):  "The capital of France is Paris."
Large model (70B, slow):    check all 6 tokens in ONE pass -> all accepted
Result: 6 tokens, plus 1 bonus token from the same pass, for 1 large-model forward pass
```

If the large model rejects a draft token, it discards the rest of the draft and samples its own token at that position. The output distribution is the same as sampling from the large model alone. Leviathan et al. (2022) measured 2-3x on T5-XXL. Chen et al. (2023) measured 2-2.5x on Chinchilla 70B with a 4B draft model. It works because text is predictable enough that a good small model gets most tokens right.

<div class="spec-viz">
  <p class="anim-label">Speculative decoding: draft 5, verify 1 pass</p>
  <div class="spec-row">
    <div class="spec-label">Draft (7B):</div>
    <div class="spec-tokens">
      <span class="stoken st1 accepted">The</span>
      <span class="stoken st2 accepted">capital</span>
      <span class="stoken st3 accepted">of</span>
      <span class="stoken st4 accepted">France</span>
      <span class="stoken st5 rejected">was</span>
    </div>
  </div>
  <div class="spec-row" style="margin-top:8px">
    <div class="spec-label">Verify (70B):</div>
    <div class="spec-tokens">
      <span class="stoken st6 accepted">The</span>
      <span class="stoken st7 accepted">capital</span>
      <span class="stoken st8 accepted">of</span>
      <span class="stoken st9 accepted">France</span>
      <span class="stoken st10 corrected">is</span>
    </div>
  </div>
  <p class="spec-note" id="specnote">4 draft tokens accepted, "was" rejected and replaced by the large model's "is". 5 tokens from 1 large-model pass.</p>
</div>

<style>
.spec-viz {
  background: var(--cg-bg);
  border-radius: 8px;
  padding: 20px 24px;
  margin: 20px 0;
}
.spec-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.spec-label {
  font-family: monospace;
  font-size: 12px;
  color: var(--cg-muted2);
  width: 90px;
  flex-shrink: 0;
}
.spec-tokens {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.stoken {
  padding: 4px 10px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
  font-weight: 600;
  opacity: 0;
  animation: fadeUp 0.25s forwards;
}
.accepted { background: var(--cg-green-bg); border: 1px solid var(--cg-green-border); color: var(--cg-green); }
.rejected  { background: var(--cg-red-bg); border: 1px solid var(--cg-red-border); color: var(--cg-red); }
.corrected { background: var(--cg-orange-bg); border: 1px solid var(--cg-orange-border); color: var(--cg-orange); }
.st1  { animation-delay: 0.2s; }
.st2  { animation-delay: 0.5s; }
.st3  { animation-delay: 0.8s; }
.st4  { animation-delay: 1.1s; }
.st5  { animation-delay: 1.4s; }
.st6  { animation-delay: 1.8s; }
.st7  { animation-delay: 2.0s; }
.st8  { animation-delay: 2.2s; }
.st9  { animation-delay: 2.4s; }
.st10 { animation-delay: 2.6s; }
.spec-note {
  color: var(--cg-muted2);
  font-size: 12px;
  margin: 14px 0 0 0;
  opacity: 0;
  animation: fadeUp 0.3s 3.0s forwards;
}
</style>

### flash attention

Standard attention writes the full `seq x seq` score matrix to slow HBM (high-bandwidth memory, the GPU's main memory) and reads it back: 4096 x 4096 = 16.8 million scores, 32 MiB in FP16, per head per layer. [FlashAttention](/blog/inference#6-flashattention) computes the same exact result in tiles that fit in fast on-chip SRAM, keeps a running softmax, and never writes the full matrix to HBM; the paper reported a 3x training speedup on GPT-2 at 1K tokens, and FlashAttention-2 is about 2x faster again. The [interview post](/blog/interview-questions#flash-attention) walks through the kernel.

![Memory movements in GPU inference](/assets/images/chatgpt/memory_movements.png)

*Figure: bytes read and written (FP16, 2 bytes per number) and FLOPs for each step of standard attention, with N tokens and head dimension d. The N x N matrices S and P make the round trip to HBM.*

<div class="flash-viz">
  <p class="anim-label">Standard attention vs Flash Attention: where the matrix lives</p>
  <div class="flash-compare">
    <div class="flash-side">
      <p class="flash-side-lbl">Standard attention</p>
      <div class="flash-grid" id="flash-std-grid"></div>
      <p class="flash-mem-lbl hmem-lbl">HBM (slow DRAM): O(N&sup2;) memory</p>
    </div>
    <div class="flash-side">
      <p class="flash-side-lbl">Flash Attention</p>
      <div class="flash-grid" id="flash-fa-grid"></div>
      <p class="flash-mem-lbl smem-lbl">SRAM (on-chip, fast): O(N) extra memory</p>
    </div>
  </div>
  <p class="flash-note">Left: full NxN matrix written to slow HBM every layer. Right: 2x2 tiles computed one at a time in fast SRAM, result accumulated, matrix never materialized.</p>
</div>

<script>
window._anims = window._anims || {};
(function(){
  var flashTimers=[];
  window._anims.flash = function(){
    flashTimers.forEach(clearTimeout); flashTimers=[];
    var N=4;
    var stdG=document.getElementById("flash-std-grid");
    var faG=document.getElementById("flash-fa-grid");
    if(!stdG||!faG) return;
    stdG.innerHTML=''; faG.innerHTML='';
    var stdCells=[], faCells=[];
    for(var r=0;r<N;r++){
      for(var c=0;c<N;c++){
        var s=document.createElement("div"); s.className="fcell"; stdG.appendChild(s); stdCells.push(s);
        var f=document.createElement("div"); f.className="fcell"; faG.appendChild(f); faCells.push(f);
      }
    }
    flashTimers.push(setTimeout(function(){
      stdCells.forEach(function(c){ c.className="fcell fcell-hbm"; });
    },400));
    var tileSize=2, t=0, tileDelay=500;
    for(var tr=0;tr<N;tr+=tileSize){
      for(var tc=0;tc<N;tc+=tileSize){
        (function(row,col,d){
          flashTimers.push(setTimeout(function(){
            var idxs=[];
            for(var dr=0;dr<tileSize;dr++) for(var dc=0;dc<tileSize;dc++) idxs.push((row+dr)*N+(col+dc));
            idxs.forEach(function(i){ faCells[i].className="fcell fcell-sram"; });
            setTimeout(function(){ idxs.forEach(function(i){ faCells[i].className="fcell fcell-done"; }); },350);
          },d));
        })(tr,tc,t*tileDelay+700);
        t++;
      }
    }
  };
})();
</script>

<style>
.flash-viz {
  background: var(--cg-bg);
  border-radius: 8px;
  padding: 20px 24px;
  margin: 20px 0;
}
.flash-compare {
  display: flex;
  gap: 32px;
  justify-content: center;
  margin: 14px 0 8px;
}
.flash-side { flex: 1; max-width: 180px; }
.flash-side-lbl {
  font-family: monospace;
  font-size: 12px;
  color: var(--cg-muted);
  margin: 0 0 8px;
  text-align: center;
}
.flash-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3px;
}
.fcell {
  aspect-ratio: 1;
  border-radius: 3px;
  background: var(--cg-bg-alt);
  border: 1px solid var(--cg-bg);
  transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
}
.fcell-hbm { background: var(--cg-red-bg); border-color: var(--cg-red-border); }
.fcell-sram { background: var(--cg-green-bg); border-color: var(--cg-green-border); box-shadow: 0 0 5px var(--cg-green-border)80; }
.fcell-done { background: var(--cg-green-bg); border-color: var(--cg-green-border); }
.flash-mem-lbl {
  font-family: monospace;
  font-size: 11px;
  margin: 8px 0 0;
  text-align: center;
}
.hmem-lbl { color: var(--cg-red); }
.smem-lbl { color: var(--cg-green); }
.flash-note {
  color: var(--cg-muted2);
  font-size: 12px;
  margin: 10px 0 0;
}
</style>

Sparse attention helps for very long contexts. Even with FlashAttention, full attention at 128k tokens costs a lot, because compute still grows as seq^2. Options:
- Sliding window: each position attends only to the last w positions. Compute grows as seq x w instead of seq^2. Mistral 7B uses a 4,096-token window.
- Local/global mix: most layers use a sliding window and a few use full attention. Gemma 2 alternates them; Gemma 3 uses 5 local layers (1,024-token window) for every global layer.

```python
import torch
from transformers import AutoModelForCausalLM

# Using FlashAttention-2 in Hugging Face
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Meta-Llama-3-8B",
    attn_implementation="flash_attention_2",
    torch_dtype=torch.bfloat16,
)
```

![Inference optimization overview](/assets/images/chatgpt/llminference.webp)

*Figure: a full inference stack, with model performance techniques and serving engines on top of the infrastructure.*

### cost vs latency tradeoffs

Every production decision is a trade between these three:

| Optimization | Latency | Cost/token | Quality |
|---|---|---|---|
| Larger batch size | higher (more queuing) | lower | unchanged |
| INT4 quantization | lower | lower | slight loss |
| Smaller model (3.5 vs 4) | much lower | much lower | lower |
| More GPUs per request | lower | higher | unchanged |
| Speculative decoding | lower | slightly higher | unchanged |
| Streaming | same total, lower perceived | unchanged | unchanged |
| KV cache reuse | lower | lower | unchanged |

Output tokens cost several times more than input tokens. GPT-4o costs \$2.50 per million input tokens and \$10.00 per million output tokens, 4x. The model generates output tokens one at a time, while it processes input tokens in parallel. Cached input (a repeated system prompt) is cheaper: \$1.25 per million for GPT-4o, half price.

One request with 500 input and 300 output tokens on GPT-4o costs:

$$
500 \times \frac{\$2.50}{10^6} + 300 \times \frac{\$10}{10^6}
$$

$$
= \$0.00125 + \$0.003 = \$0.00425
$$

If 400 of the input tokens are a cached system prompt, those 400 cost \$1.25 per million instead: 100 × \$2.50/1M + 400 × \$1.25/1M + 300 × \$10/1M = \$0.00375. (Prices from OpenAI's API pricing page, read on 22 October 2026.) Multiply by your volume, then check whether open weights on your own GPUs beat provider pricing at your scale.

---

## engineering tricks at scale

### prompt caching

The system prompt ("You are a helpful assistant...") is identical for every request in a deployment. Computing its KV cache from scratch every time wastes compute.

Cache the KV states for the system prompt once, reuse across all requests:

```text
Without prompt caching:
  Request 1: compute KV for [system(400 tokens) + user(100 tokens)] -> 500 tokens prefill
  Request 2: compute KV for [system(400 tokens) + user(80 tokens)]  -> 480 tokens prefill

With prompt caching:
  Startup:   compute KV for [system(400 tokens)]  -> cached
  Request 1: load cached + compute [user(100 tokens)] -> 100 tokens prefill (5x less)
  Request 2: load cached + compute [user(80 tokens)]  -> 80 tokens prefill
```

OpenAI bills cached input tokens for GPT-4o at half price. Anthropic keeps a cache entry for 5 minutes by default (1 hour as an option) and bills cache reads at a tenth of the base input price for most models. Caching saves both cost and latency, since prefill is compute-bound. The [inference post](/blog/inference#74---prefix-caching) covers prefix caching inside vLLM.

### model routing

Not every question needs GPT-4. "What's 2+2?" doesn't need the same compute as "Write a distributed cache in Rust."

A small classifier routes each request to the cheapest model that can handle it. The routes below are illustrative, not OpenAI's:

| Query | Model |
|---|---|
| "Hi" | a small, cheap model |
| "Summarize this email" | GPT-4o-mini |
| "Debug this kernel" | GPT-4o |
| "Prove this theorem" | a reasoning model such as o3 |

OpenAI says GPT-5 in ChatGPT is "a unified system" with a real-time router that picks between a fast model and a reasoning model. The RouteLLM paper (2024) reports more than 2x lower cost from routing, without a drop in response quality.

### semantic caching

If 1000 users ask "What is the capital of France?" within an hour, there's no reason to run inference 1000 times.

Embed user queries. Check [cosine similarity](/blog/math#cosine-similarity) against a cache. If similarity > 0.95, return the cached response and skip the model.

```text
User: "What's the capital of France?"
  -> embed query
  -> cosine similarity search against cache
  -> match found (similarity=0.97) with "What is France's capital?"
  -> return cached response (0ms inference)
```

Breaks for creative or personalized queries: two users asking for a poem should get different answers, not a cache hit.

### prefix sharing (RadixAttention)

In multi-turn conversation, every new message re-sends the entire conversation history. The KV cache for previous turns was already computed.

SGLang's RadixAttention stores KV caches in a radix tree indexed by token prefix. New requests sharing a prefix with an old one reuse the cached states:

```text
Turn 1: [system + user_1]                                -> compute KV, cache
Turn 2: [system + user_1 + assistant_1 + user_2]         -> reuse first chunk
Turn 3: [system + user_1 + ... + assistant_2 + user_3]   -> more reuse
```

On turn 3, everything before the newest messages is already in the tree. Prefill runs only on the new tokens, as long as the cache still holds the rest.

### disaggregated serving

Prefill and decode have different hardware requirements:
- Prefill is compute-bound (lots of matrix math, GPU cores matter)
- Decode is memory-bandwidth-bound (loading model weights for each token)

Run them on separate GPU pools:

<svg viewBox="0 0 360 212" role="img" aria-label="Disaggregated prefill and decode" style="width:100%;max-width:440px;height:auto;display:block;margin:24px auto;font-family:var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif">
  <defs><marker id="cg-ah" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto"><path d="M1,1 L8,5 L1,9" fill="none" stroke="currentColor" stroke-opacity="0.45" stroke-width="1.5"/></marker></defs>
  <rect x="4" y="16" width="352" height="72" rx="10" fill="rgba(25,113,194,0.14)" stroke="currentColor" stroke-opacity="0.25"/>
  <text x="180" y="44" text-anchor="middle" font-size="14" font-weight="600" fill="currentColor">Prefill pool · high-compute GPUs</text>
  <text x="180" y="66" text-anchor="middle" font-size="12" fill="currentColor" fill-opacity="0.75">process all input tokens in parallel</text>
  <line x1="180" y1="88" x2="180" y2="124" stroke="currentColor" stroke-opacity="0.4" stroke-width="1.5" marker-end="url(#cg-ah)"/>
  <text x="194" y="110" font-size="12" fill="currentColor" fill-opacity="0.7">transfer KV cache</text>
  <rect x="4" y="124" width="352" height="72" rx="10" fill="rgba(34,158,68,0.16)" stroke="currentColor" stroke-opacity="0.25"/>
  <text x="180" y="152" text-anchor="middle" font-size="14" font-weight="600" fill="currentColor">Decode pool · memory-bandwidth-bound</text>
  <text x="180" y="174" text-anchor="middle" font-size="12" fill="currentColor" fill-opacity="0.75">one token per step, reading the cached KV</text>
</svg>

*Figure: disaggregated serving puts prefill and decode on separate GPU pools.*

Neither pool's workload slows the other. You scale each pool on its own.

### chunked prefill

For very long inputs (32k+ tokens), prefill can take seconds and blocks the entire GPU.

Break the input into chunks (e.g., 2048 tokens each) and interleave prefill chunks with decode steps from other requests. This stops long prompts from causing latency spikes for everyone else in the batch.

### graceful degradation under load

When traffic spikes (viral tweet about ChatGPT), the system can't crash. An illustrative ladder (OpenAI does not publish its policy):

| Load level | Action |
|---|---|
| Normal | Full model, full context, streaming |
| High | Route new requests to a smaller model |
| Very high | Reduce `max_tokens`, for example from 4096 to 1024 |
| Extreme | Queue with an estimated wait time |
| Critical | "We're experiencing high demand" |

Priority queuing is a common addition: paying customers go ahead of free users.

---

## evaluation

Perplexity (cross-entropy loss on held-out text) tracks how well a model predicts unseen text. Useful for comparing checkpoints during training. Useless for predicting whether the model gives good answers.

The standard benchmarks share the same failure mode: MMLU (57-subject multiple choice), HumanEval (164 Python problems run against test cases) and GSM8K (math word problems). Once a benchmark matters, labs optimize for it. Training data accumulates benchmark-adjacent content. Labs select checkpoints by score. GPT-4 scored 86.4% on MMLU (5-shot) at launch, and later models score higher. The number goes up without the capability following.

Chatbot Arena avoids this. Real users compare two anonymous models on their actual tasks. No fixed test set. Elo-style ratings come from millions of blind comparisons. When Arena rankings disagree with benchmark rankings, Arena is usually right.

Human evaluation (annotators rating outputs on helpfulness rubrics) is what RLHF trains on. It's also slow, expensive, and biased in a consistent direction: annotators prefer longer and more confident answers, so models learn to sound helpful. For open-ended questions there's no ground truth, and that bias compounds across training.

---

## the full picture

Pretraining a GPT-4 class model costs more than $100M and runs for months on thousands of GPUs. SFT and RLHF need a small fraction of that compute: under 2% for InstructGPT. The ongoing engineering challenge is inference: routing, batching, caching, safety, streaming, and observability for millions of concurrent users.

Next-token prediction on trillions of tokens is a simple objective. The weights that result encode facts, reasoning patterns, and enough of a world model to score in the top 10% on a simulated bar exam (GPT-4). The model generates the most probable continuation regardless of truth.

---

## further reading

- [InstructGPT](https://arxiv.org/abs/2203.02155) (RLHF in practice)
- [LLaMA 3](https://arxiv.org/abs/2407.21783) (training at scale)
- [vLLM/PagedAttention](https://arxiv.org/abs/2309.06180) (inference at scale)
- [FlashAttention-2](https://arxiv.org/abs/2307.08691) (memory-efficient attention)
- [Inside the transformer](https://www.aleksagordic.com/blog/transformer) (a token's journey through a modern decoder)
- [Quantization explained](https://ngrok.com/blog/quantization) (ngrok - INT4/INT8 quantization in practice)
- [Karpathy - Zero to Hero](https://www.youtube.com/playlist?list=PLAqhIrjkxruWIwMSOWxAywIRyoiOWHaXY)
- [ChatGPT in 200 lines](https://karpathy.github.io/2026/02/12/microgpt/)

<style>
.anim-replay-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--hairline);
  border: 0;
  color: var(--ink);
  font-family: monospace;
  font-size: 12px;
  cursor: pointer;
  padding: 3px 10px;
  border-radius: 999px;
  transition: background 0.2s, color 0.2s;
  line-height: 1.5;
  z-index: 10;
}
.anim-replay-btn:hover { background: var(--ink); color: var(--bg); }
.token-animation, .attn-viz, .rlhf-loop, .topp-viz, .pipeline-viz, .spec-viz,
.cbatch-viz, .autogen-viz, .ctx-win-viz, .moe-viz, .flash-viz, .kv-viz {
  position: relative;
}
.token { transition: transform 0.15s; }
.token:hover { transform: scale(1.1); cursor: default; }
</style>

<script>
(function(){
  window._anims = window._anims || {};
  var kvTimers=[];
  window._anims.kvcache = function(){
    var c=document.getElementById("dtokens");
    var n=document.getElementById("kvnote");
    if(!c) return;
    kvTimers.forEach(clearTimeout); kvTimers=[];
    c.innerHTML='';
    if(n){ n.textContent=''; n.style.opacity='0'; }
    ["The"," capital"," of"," France"," is"," Paris","."].forEach(function(t,i){
      kvTimers.push(setTimeout(function(){
        var el=document.createElement("span");
        el.className="kv-token"; el.textContent=t; el.style.animationDelay="0s";
        c.appendChild(el);
        if(i===6) kvTimers.push(setTimeout(function(){ if(n){ n.textContent="Cache grows with each new token. Longer context = more VRAM."; n.style.opacity="1"; } },400));
      },800*(i+1)));
    });
  };
  function resetCSS(container){
    var items=[];
    container.querySelectorAll('*').forEach(function(el){
      var a=window.getComputedStyle(el).animationName;
      if(a && a!=='none'){ items.push(el); el.style.animation='none'; }
    });
    void container.offsetWidth;
    items.forEach(function(el){ el.style.animation=''; });
  }
  var fnMap={
    'autogen-viz': function(){ if(window._anims.autogen) window._anims.autogen(); },
    'ctx-win-viz': function(){ if(window._anims.ctxwin)  window._anims.ctxwin();  },
    'moe-viz':     function(){ if(window._anims.moe)     window._anims.moe();     },
    'flash-viz':   function(){ if(window._anims.flash)   window._anims.flash();   },
    'kv-viz':      function(){ if(window._anims.kvcache) window._anims.kvcache(); },
  };
  function getReplayFn(el){
    for(var k in fnMap){ if(el.classList.contains(k)) return fnMap[k]; }
    return null;
  }
  function addReplayBtn(container, fn){
    if(container.querySelector('.anim-replay-btn')) return;
    var btn=document.createElement('button');
    btn.className='anim-replay-btn';
    btn.textContent='↺ replay';
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      if(typeof fn==='function') fn();
      else resetCSS(container);
    });
    container.appendChild(btn);
  }
  function init(){
    var sel='.token-animation,.attn-viz,.rlhf-loop,.topp-viz,.pipeline-viz,.spec-viz,.cbatch-viz,.autogen-viz,.ctx-win-viz,.moe-viz,.flash-viz,.kv-viz';
    var containers=document.querySelectorAll(sel);
    if('IntersectionObserver' in window){
      var triggered=new Set();
      var obs=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          var c=entry.target;
          if(entry.isIntersecting && !triggered.has(c)){
            triggered.add(c);
            var fn=getReplayFn(c);
            if(fn) fn(); else resetCSS(c);
          }
        });
      },{threshold:0.25,rootMargin:'0px 0px -40px 0px'});
      containers.forEach(function(c){ obs.observe(c); });
    } else {
      containers.forEach(function(c){ var fn=getReplayFn(c); if(fn) fn(); });
    }
    containers.forEach(function(c){
      addReplayBtn(c, getReplayFn(c) || function(){ resetCSS(c); });
    });
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init);
  } else {
    init();
  }
})();
</script>
