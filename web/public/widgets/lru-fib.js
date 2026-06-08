(function () {
  var ROOT_ID = "lru-fib";

  function buildTree(n, cached, cache) {
    var nodes = [];
    var seen = {};
    function rec(k, parentIdx, depth) {
      var idx = nodes.length;
      var hit = cached && cache.hasOwnProperty(k);
      nodes.push({ k: k, parent: parentIdx, depth: depth, hit: hit, expanded: !hit });
      if (cached) cache[k] = true;
      if (hit) return idx;
      if (k <= 1) return idx;
      rec(k - 1, idx, depth + 1);
      rec(k - 2, idx, depth + 1);
      return idx;
    }
    rec(n, -1, 0);
    return nodes;
  }

  function layoutTree(nodes) {
    var leaves = [];
    var byDepth = {};
    for (var i = 0; i < nodes.length; i++) {
      var d = nodes[i].depth;
      if (!byDepth[d]) byDepth[d] = [];
      byDepth[d].push(i);
    }
    // assign x by in-order traversal of expanded subtree
    var counter = 0;
    function place(idx) {
      var node = nodes[idx];
      if (!node.expanded || node.k <= 1) {
        node.x = counter++;
        return;
      }
      var children = [];
      for (var j = idx + 1; j < nodes.length; j++) {
        if (nodes[j].parent === idx) children.push(j);
        if (nodes[j].depth <= node.depth && j > idx) break;
      }
      if (children.length === 0) {
        node.x = counter++;
        return;
      }
      for (var c = 0; c < children.length; c++) place(children[c]);
      var first = nodes[children[0]].x, last = nodes[children[children.length - 1]].x;
      node.x = (first + last) / 2;
    }
    place(0);
    var maxX = 0, maxD = 0;
    for (var n = 0; n < nodes.length; n++) {
      if (nodes[n].x > maxX) maxX = nodes[n].x;
      if (nodes[n].depth > maxD) maxD = nodes[n].depth;
    }
    return { nodes: nodes, maxX: maxX || 1, maxD: maxD || 1 };
  }

  function renderTree(svg, layout, opts) {
    var W = svg.viewBox.baseVal.width;
    var H = svg.viewBox.baseVal.height;
    var padX = 18, padY = 16;
    var iw = W - 2 * padX, ih = H - 2 * padY;
    var nodes = layout.nodes;
    function xAt(x) { return padX + (x / layout.maxX) * iw; }
    function yAt(d) { return padY + (d / layout.maxD) * ih; }
    var ns = "http://www.w3.org/2000/svg";
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    // edges
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.parent === -1) continue;
      var p = nodes[n.parent];
      var line = document.createElementNS(ns, "line");
      line.setAttribute("x1", xAt(p.x));
      line.setAttribute("y1", yAt(p.depth) + 8);
      line.setAttribute("x2", xAt(n.x));
      line.setAttribute("y2", yAt(n.depth) - 8);
      line.setAttribute("stroke", "rgba(255,255,255,0.15)");
      line.setAttribute("stroke-width", "1");
      svg.appendChild(line);
    }
    // nodes
    var maxNodeR = 14;
    var minSpace = iw / Math.max(layout.maxX, 1);
    var r = Math.max(6, Math.min(maxNodeR, minSpace * 0.35));
    var labelSize = Math.max(8, Math.min(11, r));
    for (var j = 0; j < nodes.length; j++) {
      var nn = nodes[j];
      var fill, stroke;
      if (nn.hit) {
        fill = "rgba(74,222,128,0.25)"; stroke = "rgba(74,222,128,0.9)";
      } else if (nn.k <= 1) {
        fill = "rgba(167,139,250,0.2)"; stroke = "rgba(167,139,250,0.9)";
      } else {
        fill = "rgba(96,165,250,0.18)"; stroke = "rgba(96,165,250,0.9)";
      }
      var c = document.createElementNS(ns, "circle");
      c.setAttribute("cx", xAt(nn.x));
      c.setAttribute("cy", yAt(nn.depth));
      c.setAttribute("r", r);
      c.setAttribute("fill", fill);
      c.setAttribute("stroke", stroke);
      c.setAttribute("stroke-width", "1");
      svg.appendChild(c);
      var t = document.createElementNS(ns, "text");
      t.setAttribute("x", xAt(nn.x));
      t.setAttribute("y", yAt(nn.depth) + (labelSize / 3));
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("font-size", labelSize);
      t.setAttribute("fill", "rgba(229,231,235,0.95)");
      t.setAttribute("font-family", "monospace");
      t.textContent = nn.k;
      svg.appendChild(t);
    }
  }

  function mount() {
    var root = document.getElementById(ROOT_ID);
    if (!root) return;
    root.innerHTML = '' +
      '<div class="lf-header">' +
        '<div class="lf-title">fib(n) call tree · with and without @lru_cache</div>' +
        '<div class="lf-controls">' +
          '<label>n <input type="number" id="lf-n" min="2" max="14" value="8" /></label>' +
          '<button data-mode="raw" class="lf-active">raw</button>' +
          '<button data-mode="cached">@lru_cache</button>' +
        '</div>' +
      '</div>' +
      '<div class="lf-meta" id="lf-meta"></div>' +
      '<svg class="lf-tree" viewBox="0 0 720 280" preserveAspectRatio="none"></svg>' +
      '<div class="lf-legend">' +
        '<span><span class="lf-dot" style="background:rgba(96,165,250,0.8)"></span>compute</span>' +
        '<span><span class="lf-dot" style="background:rgba(74,222,128,0.8)"></span>cache hit</span>' +
        '<span><span class="lf-dot" style="background:rgba(167,139,250,0.8)"></span>base case</span>' +
      '</div>';

    var nEl = root.querySelector("#lf-n");
    var btns = root.querySelectorAll("button[data-mode]");
    var svg = root.querySelector("svg");
    var metaEl = root.querySelector("#lf-meta");
    var mode = "raw";

    function update() {
      var n = Math.max(2, Math.min(14, parseInt(nEl.value, 10) || 8));
      nEl.value = n;
      var cached = mode === "cached";
      var cache = {};
      var nodes = buildTree(n, cached, cache);
      var layout = layoutTree(nodes);
      renderTree(svg, layout, {});
      var hits = nodes.filter(function (x) { return x.hit; }).length;
      var computes = nodes.length - hits;
      metaEl.innerHTML =
        '<span>total calls: <b>' + nodes.length + '</b></span>' +
        '<span>compute: <b>' + computes + '</b></span>' +
        '<span>hits: <b>' + hits + '</b></span>' +
        '<span>complexity: <b>' + (cached ? 'O(n)' : 'O(2ⁿ)') + '</b></span>';
    }

    nEl.addEventListener("input", update);
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", function (e) {
        mode = e.currentTarget.getAttribute("data-mode");
        for (var b = 0; b < btns.length; b++) btns[b].classList.toggle("lf-active", btns[b] === e.currentTarget);
        update();
      });
    }
    update();
  }

  if (typeof window.lazyWidget === "function") {
    window.lazyWidget(ROOT_ID, mount);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
