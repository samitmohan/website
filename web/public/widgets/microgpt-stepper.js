(function () {
  var ROOT_ID = "microgpt-stepper";

  var VOCAB = ["the", "cat", "sat", "on", "mat", "dog", "ran", "."];
  var D = 8;
  var H = 2;
  var HD = D / H; // 4
  var TOKENS = [0, 1, 2]; // "the cat sat"
  var SEQ = TOKENS.length;

  function rng(seed) {
    var s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s / 2147483647) * 2 - 1;
    };
  }

  function randMat(r, rows, cols, scale) {
    var M = [];
    for (var i = 0; i < rows; i++) {
      var row = [];
      for (var j = 0; j < cols; j++) row.push(r() * scale);
      M.push(row);
    }
    return M;
  }

  function zeros(rows, cols) {
    var M = [];
    for (var i = 0; i < rows; i++) {
      var row = [];
      for (var j = 0; j < cols; j++) row.push(0);
      M.push(row);
    }
    return M;
  }

  function matmul(A, B) {
    var m = A.length, k = A[0].length, n = B[0].length;
    var C = zeros(m, n);
    for (var i = 0; i < m; i++) {
      for (var j = 0; j < n; j++) {
        var s = 0;
        for (var p = 0; p < k; p++) s += A[i][p] * B[p][j];
        C[i][j] = s;
      }
    }
    return C;
  }

  function addMat(A, B) {
    return A.map(function (row, i) {
      return row.map(function (v, j) { return v + B[i][j]; });
    });
  }

  function transpose(A) {
    return A[0].map(function (_, j) {
      return A.map(function (row) { return row[j]; });
    });
  }

  function layerNorm(M, g, b, eps) {
    eps = eps || 1e-5;
    return M.map(function (row) {
      var mean = row.reduce(function (a, x) { return a + x; }, 0) / row.length;
      var variance = row.reduce(function (a, x) { return a + (x - mean) * (x - mean); }, 0) / row.length;
      var inv = 1 / Math.sqrt(variance + eps);
      return row.map(function (v, i) { return ((v - mean) * inv) * g[i] + b[i]; });
    });
  }

  function gelu(x) {
    return 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x * x * x)));
  }

  function applyGelu(M) {
    return M.map(function (row) { return row.map(gelu); });
  }

  function softmaxRow(arr) {
    var m = -Infinity;
    for (var i = 0; i < arr.length; i++) if (arr[i] > m) m = arr[i];
    var e = arr.map(function (v) { return v === -Infinity ? 0 : Math.exp(v - m); });
    var s = 0;
    for (var k = 0; k < e.length; k++) s += e[k];
    return e.map(function (v) { return s === 0 ? 0 : v / s; });
  }

  function softmaxMat(M, mask) {
    return M.map(function (row, i) {
      var masked = mask ? row.map(function (v, j) { return mask[i][j] ? v : -Infinity; }) : row;
      return softmaxRow(masked);
    });
  }

  // Init weights with fixed seed
  var r = rng(42);
  var W = {
    tokEmb: randMat(r, VOCAB.length, D, 0.5),
    posEmb: randMat(r, SEQ, D, 0.4),
    ln1g: Array(D).fill(1), ln1b: Array(D).fill(0),
    Wq: randMat(r, D, D, 0.35),
    Wk: randMat(r, D, D, 0.35),
    Wv: randMat(r, D, D, 0.35),
    Wo: randMat(r, D, D, 0.35),
    ln2g: Array(D).fill(1), ln2b: Array(D).fill(0),
    Wff1: randMat(r, D, 4 * D, 0.25),
    Wff2: randMat(r, 4 * D, D, 0.25),
    lnFg: Array(D).fill(1), lnFb: Array(D).fill(0)
  };

  function splitHeads(M) {
    var heads = [];
    for (var h = 0; h < H; h++) {
      heads.push(M.map(function (row) { return row.slice(h * HD, (h + 1) * HD); }));
    }
    return heads;
  }

  function forward() {
    var steps = [];

    var tokEmb = TOKENS.map(function (t) { return W.tokEmb[t].slice(); });
    steps.push({
      name: "embed tokens",
      desc: 'Each token is an index into the embedding table. Row i of W_emb becomes the vector for token i. Sequence: "the cat sat".',
      tensors: [["token embeddings", tokEmb, "row = sequence position, col = embedding dim (D=8)"]]
    });

    var posEmb = W.posEmb.slice(0, SEQ);
    var x1 = addMat(tokEmb, posEmb);
    steps.push({
      name: "+ position",
      desc: "Add positional embedding. Without this, attention is permutation-invariant — 'the cat sat' and 'sat cat the' would look identical to the model.",
      tensors: [
        ["position embed", posEmb, "one row per position"],
        ["sum", x1, "token + pos, ready for the block"]
      ]
    });

    var x1n = layerNorm(x1, W.ln1g, W.ln1b);
    steps.push({
      name: "LayerNorm 1",
      desc: "Pre-attention LayerNorm: each row gets mean 0 and variance 1, then a learned per-dim scale and shift.",
      tensors: [["normalized", x1n, "each row independently normalized"]]
    });

    var Q = matmul(x1n, W.Wq);
    var K = matmul(x1n, W.Wk);
    var V = matmul(x1n, W.Wv);
    steps.push({
      name: "Q, K, V",
      desc: "Three linear projections of the same input. Q = what I'm looking for. K = what I have to offer. V = what I'll hand over.",
      tensors: [["Q", Q], ["K", K], ["V", V]]
    });

    var Qh = splitHeads(Q);
    var Kh = splitHeads(K);
    var Vh = splitHeads(V);
    var scores = Qh.map(function (q, h) {
      var s = matmul(q, transpose(Kh[h]));
      return s.map(function (row) { return row.map(function (v) { return v / Math.sqrt(HD); }); });
    });
    steps.push({
      name: "attention scores",
      desc: "Per head: Q @ Kᵀ / √d_h. Row i, col j = how much query i wants to attend to key j. Two heads, each [seq × seq].",
      tensors: scores.map(function (s, h) {
        return ["head " + (h + 1) + " scores", s, "row = query position, col = key position"];
      })
    });

    var mask = [];
    for (var i = 0; i < SEQ; i++) {
      var row = [];
      for (var j = 0; j < SEQ; j++) row.push(j <= i ? 1 : 0);
      mask.push(row);
    }
    var attn = scores.map(function (s) { return softmaxMat(s, mask); });
    steps.push({
      name: "mask + softmax",
      desc: "Causal mask (token j > i can't be attended) plus row-wise softmax. Each row now sums to 1.",
      tensors: attn.map(function (a, h) {
        return ["head " + (h + 1) + " weights", a, "future tokens get 0; rows sum to 1"];
      })
    });

    var outH = attn.map(function (a, h) { return matmul(a, Vh[h]); });
    steps.push({
      name: "weights @ V",
      desc: "Multiply attention weights by V. Each output row is a weighted sum of value vectors — the context for that position.",
      tensors: outH.map(function (o, h) {
        return ["head " + (h + 1) + " out", o, "mixed context per position"];
      })
    });

    var concat = [];
    for (var ci = 0; ci < SEQ; ci++) {
      var crow = [];
      for (var ch = 0; ch < H; ch++) crow = crow.concat(outH[ch][ci]);
      concat.push(crow);
    }
    var proj = matmul(concat, W.Wo);
    var x2 = addMat(x1, proj);
    steps.push({
      name: "concat + W_o + residual",
      desc: "Concatenate heads, project back to D dims via W_o, then add the residual stream. x ← x + Attn(LN(x)).",
      tensors: [
        ["W_o output", proj, "attention block output"],
        ["+ residual", x2, "stream after attention"]
      ]
    });

    var x2n = layerNorm(x2, W.ln2g, W.ln2b);
    var ff1 = applyGelu(matmul(x2n, W.Wff1));
    var ff2 = matmul(ff1, W.Wff2);
    var x3 = addMat(x2, ff2);
    steps.push({
      name: "FFN block",
      desc: "LN → Linear(D → 4D) → GELU → Linear(4D → D) → add residual. Per-token, no token mixing here — that was attention's job.",
      tensors: [
        ["hidden (after GELU)", ff1, "[seq × 4D]"],
        ["FFN output", ff2, "back to D dims"],
        ["+ residual", x3, "stream after the block"]
      ]
    });

    var xf = layerNorm(x3, W.lnFg, W.lnFb);
    var tokEmbT = transpose(W.tokEmb);
    var logits = matmul(xf, tokEmbT);
    steps.push({
      name: "logits",
      desc: "Final LayerNorm, then logits = x · W_embᵀ (tied weights). The last row predicts the next token. Cols = vocab.",
      tensors: [["logits", logits, "row = position, col = vocab token"]]
    });

    var lastLogits = logits[logits.length - 1];
    var probs = softmaxRow(lastLogits);
    var sampledIdx = 0;
    var best = -Infinity;
    for (var pi = 0; pi < probs.length; pi++) {
      if (probs[pi] > best) { best = probs[pi]; sampledIdx = pi; }
    }
    steps.push({
      name: "sample",
      desc: "Softmax the last row of logits. Argmax picks the next token. Vocab labels shown above each cell.",
      tensors: [["probs over vocab", [probs], "max at index " + sampledIdx + " → \"" + VOCAB[sampledIdx] + "\""]],
      sampled: sampledIdx
    });

    return steps;
  }

  function fmt(v) {
    var s = v.toFixed(2);
    return s === "-0.00" ? "0.00" : s;
  }

  function cellStyle(v) {
    var a = Math.min(Math.abs(v) * 0.7, 0.55);
    var col = v >= 0 ? "rgba(96,165,250," + a.toFixed(2) + ")" : "rgba(248,113,113," + a.toFixed(2) + ")";
    return "background:" + col + ";";
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  function renderTensor(name, M, hint, vocabHeader) {
    var rows = M.length, cols = M[0].length;
    var html = '<div class="mg-tensor">';
    html += '<div class="mg-tname">' + escapeHTML(name) + ' <span class="mg-shape">[' + rows + '×' + cols + ']</span></div>';
    if (vocabHeader) {
      html += '<div class="mg-grid" style="grid-template-columns:repeat(' + cols + ',minmax(36px,1fr));margin-bottom:2px">';
      for (var v = 0; v < cols; v++) {
        html += '<div style="text-align:center;font-size:9.5px;color:var(--muted-foreground,#9ca3af)">' + escapeHTML(VOCAB[v]) + '</div>';
      }
      html += '</div>';
    }
    html += '<div class="mg-grid" style="grid-template-columns:repeat(' + cols + ',minmax(36px,1fr))">';
    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < cols; j++) {
        html += '<div class="mg-cell" style="' + cellStyle(M[i][j]) + '">' + fmt(M[i][j]) + '</div>';
      }
    }
    html += '</div>';
    if (hint) html += '<div class="mg-hint">' + escapeHTML(hint) + '</div>';
    html += '</div>';
    return html;
  }

  function mount() {
    var root = document.getElementById(ROOT_ID);
    if (!root) return;
    var steps = forward();
    var idx = 0;

    function render() {
      var s = steps[idx];
      var pct = ((idx + 1) / steps.length) * 100;
      var html = '';
      html += '<div class="mg-header">';
      html += '<div class="mg-step">' + (idx + 1) + ' / ' + steps.length + ': <b>' + escapeHTML(s.name) + '</b></div>';
      html += '<div class="mg-controls">';
      html += '<button data-act="prev"' + (idx === 0 ? ' disabled' : '') + '>← prev</button>';
      html += '<button data-act="next"' + (idx === steps.length - 1 ? ' disabled' : '') + '>next →</button>';
      html += '<button data-act="reset">restart</button>';
      html += '</div></div>';
      html += '<div class="mg-progress"><div class="mg-progress-fill" style="width:' + pct + '%"></div></div>';
      html += '<div class="mg-desc">' + escapeHTML(s.desc) + '</div>';
      html += '<div class="mg-tensors">';
      for (var t = 0; t < s.tensors.length; t++) {
        var name = s.tensors[t][0];
        var M = s.tensors[t][1];
        var hint = s.tensors[t][2] || "";
        var showVocab = s.name === "logits" || s.name === "sample";
        html += renderTensor(name, M, hint, showVocab);
      }
      html += '</div>';
      root.innerHTML = html;
      var btns = root.querySelectorAll('button');
      for (var b = 0; b < btns.length; b++) {
        btns[b].addEventListener('click', function (e) {
          var act = e.currentTarget.getAttribute('data-act');
          if (act === 'prev' && idx > 0) idx--;
          else if (act === 'next' && idx < steps.length - 1) idx++;
          else if (act === 'reset') idx = 0;
          render();
        });
      }
    }

    render();
  }

  if (typeof window.lazyWidget === 'function') {
    window.lazyWidget(ROOT_ID, mount);
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
