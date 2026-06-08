(function () {
  var ROOT_ID = "residual-growth";

  function seeded(s) {
    s = s % 2147483647; if (s <= 0) s += 2147483646;
    return function () { s = (s * 16807) % 2147483647; return s / 2147483647; };
  }

  // gaussian-ish via Box-Muller
  function gauss(rng) {
    var u = Math.max(rng(), 1e-9), v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function simulate(nLayers, mode, branchInitScale) {
    // We simulate the L2 norm of a hidden state vector h in R^d.
    // Treat F_l(h) as a vector with norm ~ branchInitScale * ||h|| under random init.
    var rng = seeded(13);
    var norm = 1.0; // starting hidden norm
    var norms = [norm];
    var contribAccum = 0;
    var contrib = [];
    for (var l = 1; l <= nLayers; l++) {
      // F_l output magnitude relative to h
      var alpha = branchInitScale * (0.9 + 0.2 * rng());
      // direction loosely correlated; use random projection coefficient r in [-0.3, 0.3]
      var rDir = (rng() - 0.5) * 0.6;
      if (mode === "vanilla") {
        // x = x + F(x)
        var fNorm = alpha * norm;
        // expected new norm (square sum + 2 r ||x|| ||F||)
        var newNorm = Math.sqrt(norm * norm + fNorm * fNorm + 2 * rDir * norm * fNorm);
        contribAccum += fNorm;
        contrib.push(fNorm);
        norm = newNorm;
      } else if (mode === "scaled") {
        // x = x + (1/sqrt(L)) F(x), the post's suggested fix
        var scale = 1 / Math.sqrt(nLayers);
        var fNorm2 = alpha * norm * scale;
        var nn2 = Math.sqrt(norm * norm + fNorm2 * fNorm2 + 2 * rDir * norm * fNorm2);
        contribAccum += fNorm2;
        contrib.push(fNorm2);
        norm = nn2;
      } else { // attnres
        // x = x + alpha_l F(x) with alpha_l decaying so deep layers contribute less
        var aL = 0.5 / Math.sqrt(l);
        var fNorm3 = alpha * norm * aL;
        var nn3 = Math.sqrt(norm * norm + fNorm3 * fNorm3 + 2 * rDir * norm * fNorm3);
        contribAccum += fNorm3;
        contrib.push(fNorm3);
        norm = nn3;
      }
      norms.push(norm);
    }
    return { norms: norms, contrib: contrib };
  }

  function renderPlot(svgEl, series, nLayers) {
    var W = svgEl.viewBox.baseVal.width;
    var H = svgEl.viewBox.baseVal.height;
    var padL = 38, padR = 12, padT = 8, padB = 26;
    var iw = W - padL - padR, ih = H - padT - padB;
    var maxY = 1;
    for (var i = 0; i < series.length; i++) {
      for (var j = 0; j < series[i].data.length; j++) {
        if (series[i].data[j] > maxY) maxY = series[i].data[j];
      }
    }
    maxY = Math.ceil(maxY * 1.1);

    function xAt(l) { return padL + (l / nLayers) * iw; }
    function yAt(v) { return padT + ih - (v / maxY) * ih; }

    var ns = "http://www.w3.org/2000/svg";
    while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);

    // axes
    var axisColor = "rgba(255,255,255,0.15)";
    var labelColor = "rgba(156,163,175,0.85)";
    var ax = document.createElementNS(ns, "line");
    ax.setAttribute("x1", padL); ax.setAttribute("y1", padT + ih);
    ax.setAttribute("x2", padL + iw); ax.setAttribute("y2", padT + ih);
    ax.setAttribute("stroke", axisColor);
    svgEl.appendChild(ax);
    var ay = document.createElementNS(ns, "line");
    ay.setAttribute("x1", padL); ay.setAttribute("y1", padT);
    ay.setAttribute("x2", padL); ay.setAttribute("y2", padT + ih);
    ay.setAttribute("stroke", axisColor);
    svgEl.appendChild(ay);

    // grid + y labels
    for (var g = 0; g <= 4; g++) {
      var yVal = (maxY * g) / 4;
      var yPx = yAt(yVal);
      var gl = document.createElementNS(ns, "line");
      gl.setAttribute("x1", padL); gl.setAttribute("y1", yPx);
      gl.setAttribute("x2", padL + iw); gl.setAttribute("y2", yPx);
      gl.setAttribute("stroke", "rgba(255,255,255,0.06)");
      svgEl.appendChild(gl);
      var tx = document.createElementNS(ns, "text");
      tx.setAttribute("x", padL - 6); tx.setAttribute("y", yPx + 3);
      tx.setAttribute("text-anchor", "end");
      tx.setAttribute("font-size", "10");
      tx.setAttribute("fill", labelColor);
      tx.setAttribute("font-family", "monospace");
      tx.textContent = yVal.toFixed(1);
      svgEl.appendChild(tx);
    }
    // x labels
    for (var k = 0; k <= 4; k++) {
      var lx = (nLayers * k) / 4;
      var px = xAt(lx);
      var tx2 = document.createElementNS(ns, "text");
      tx2.setAttribute("x", px); tx2.setAttribute("y", padT + ih + 16);
      tx2.setAttribute("text-anchor", "middle");
      tx2.setAttribute("font-size", "10");
      tx2.setAttribute("fill", labelColor);
      tx2.setAttribute("font-family", "monospace");
      tx2.textContent = Math.round(lx);
      svgEl.appendChild(tx2);
    }
    var axisLabel = document.createElementNS(ns, "text");
    axisLabel.setAttribute("x", padL + iw / 2);
    axisLabel.setAttribute("y", padT + ih + 22);
    axisLabel.setAttribute("text-anchor", "middle");
    axisLabel.setAttribute("font-size", "10");
    axisLabel.setAttribute("fill", labelColor);
    axisLabel.setAttribute("font-family", "monospace");
    axisLabel.textContent = "layer";
    svgEl.appendChild(axisLabel);
    var yLabel = document.createElementNS(ns, "text");
    yLabel.setAttribute("x", 8);
    yLabel.setAttribute("y", padT + ih / 2);
    yLabel.setAttribute("font-size", "10");
    yLabel.setAttribute("fill", labelColor);
    yLabel.setAttribute("font-family", "monospace");
    yLabel.setAttribute("transform", "rotate(-90 8 " + (padT + ih / 2) + ")");
    yLabel.setAttribute("text-anchor", "middle");
    yLabel.textContent = "‖h‖";
    svgEl.appendChild(yLabel);

    // series
    for (var s = 0; s < series.length; s++) {
      var d = "";
      var data = series[s].data;
      for (var l = 0; l < data.length; l++) {
        d += (l === 0 ? "M" : "L") + xAt(l).toFixed(1) + " " + yAt(data[l]).toFixed(1) + " ";
      }
      var path = document.createElementNS(ns, "path");
      path.setAttribute("d", d);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", series[s].color);
      path.setAttribute("stroke-width", "1.6");
      svgEl.appendChild(path);
    }

    // legend
    var legendX = padL + iw - 110;
    for (var s2 = 0; s2 < series.length; s2++) {
      var ly = padT + 4 + s2 * 14;
      var sw = document.createElementNS(ns, "rect");
      sw.setAttribute("x", legendX); sw.setAttribute("y", ly - 8);
      sw.setAttribute("width", 10); sw.setAttribute("height", 2);
      sw.setAttribute("fill", series[s2].color);
      svgEl.appendChild(sw);
      var lt = document.createElementNS(ns, "text");
      lt.setAttribute("x", legendX + 14); lt.setAttribute("y", ly);
      lt.setAttribute("font-size", "10");
      lt.setAttribute("fill", labelColor);
      lt.setAttribute("font-family", "monospace");
      lt.textContent = series[s2].label;
      svgEl.appendChild(lt);
    }
  }

  function mount() {
    var root = document.getElementById(ROOT_ID);
    if (!root) return;
    root.innerHTML = '' +
      '<div class="rg-header">' +
        '<div class="rg-title">residual norm growth · depth = <span id="rg-depth-val">32</span></div>' +
        '<div class="rg-controls">' +
          '<label>depth <input type="range" id="rg-depth" min="4" max="96" step="1" value="32" /></label>' +
          '<label>branch init <select id="rg-init"><option value="0.5">0.5</option><option value="1.0" selected>1.0</option><option value="1.5">1.5</option></select></label>' +
        '</div>' +
      '</div>' +
      '<svg class="rg-plot" viewBox="0 0 720 220" preserveAspectRatio="none"></svg>' +
      '<div class="rg-meta" id="rg-meta"></div>' +
      '<div class="rg-explain" id="rg-explain"></div>';

    var svg = root.querySelector("svg");
    var depthEl = root.querySelector("#rg-depth");
    var initEl = root.querySelector("#rg-init");
    var depthVal = root.querySelector("#rg-depth-val");
    var metaEl = root.querySelector("#rg-meta");
    var explainEl = root.querySelector("#rg-explain");

    function update() {
      var L = parseInt(depthEl.value, 10);
      var initScale = parseFloat(initEl.value);
      depthVal.textContent = L;
      var vanilla = simulate(L, "vanilla", initScale);
      var scaled = simulate(L, "scaled", initScale);
      var attnres = simulate(L, "attnres", initScale);

      renderPlot(svg, [
        { data: vanilla.norms, color: "#f87171", label: "x + F(x)" },
        { data: scaled.norms, color: "#fbbf24", label: "x + F(x)/√L" },
        { data: attnres.norms, color: "#60a5fa", label: "attn-res α_l" }
      ], L);

      var lastV = vanilla.norms[vanilla.norms.length - 1];
      var lastS = scaled.norms[scaled.norms.length - 1];
      var lastA = attnres.norms[attnres.norms.length - 1];
      metaEl.innerHTML =
        '<span>final ‖h‖ vanilla: <b>' + lastV.toFixed(2) + '</b></span>' +
        '<span>scaled: <b>' + lastS.toFixed(2) + '</b></span>' +
        '<span>attn-res: <b>' + lastA.toFixed(2) + '</b></span>';

      var ratio = (lastV / lastA).toFixed(1);
      explainEl.innerHTML =
        "At <b>L=" + L + "</b> layers, vanilla residuals (red) grow the hidden norm <b>" + ratio +
        "×</b> compared to attention residuals (blue). The early layers' contribution gets buried as new terms pile on. " +
        "Per-layer scale <b>α_l = 1/√l</b> tapers deep contributions, keeping the residual stream balanced.";
    }

    depthEl.addEventListener("input", update);
    initEl.addEventListener("change", update);
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
