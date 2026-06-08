(function () {
  var ROOT_ID = "vllm-batching";

  var TOTAL_KV_BLOCKS = 32;
  var TOTAL_STEPS = 40;
  var MAX_BATCH = 6;
  var PROMPT_RANGE = [3, 9];
  var GEN_RANGE = [5, 14];
  var ARRIVAL_BAR_W = 100;

  function seeded(seed) {
    var s = seed % 2147483647; if (s <= 0) s += 2147483646;
    return function () { s = (s * 16807) % 2147483647; return s / 2147483647; };
  }

  function generateRequests(rng) {
    var arrivals = [0, 0, 1, 3, 4, 6, 8, 10, 13, 16, 20];
    return arrivals.map(function (a, i) {
      var promptLen = PROMPT_RANGE[0] + Math.floor(rng() * (PROMPT_RANGE[1] - PROMPT_RANGE[0]));
      var genLen = GEN_RANGE[0] + Math.floor(rng() * (GEN_RANGE[1] - GEN_RANGE[0]));
      return {
        id: i,
        name: "req " + (i + 1),
        arrival: a,
        promptLen: promptLen,
        genLen: genLen,
        state: "waiting",
        prefillDone: 0,
        decoded: 0,
        startStep: -1,
        endStep: -1,
        kvBlocks: 0
      };
    });
  }

  function simulate(reqs) {
    var frames = [];
    var active = [];
    var step = 0;
    var kvUsed = 0;

    function snapshot(reason) {
      frames.push({
        step: step,
        kvUsed: kvUsed,
        reqs: reqs.map(function (r) { return Object.assign({}, r); }),
        active: active.slice(),
        reason: reason
      });
    }

    while (step < TOTAL_STEPS) {
      // Admit waiting requests up to MAX_BATCH if KV cache has room
      for (var i = 0; i < reqs.length && active.length < MAX_BATCH; i++) {
        var r = reqs[i];
        if (r.state === "waiting" && r.arrival <= step) {
          var need = Math.ceil(r.promptLen / 4);
          if (kvUsed + need <= TOTAL_KV_BLOCKS) {
            r.state = "prefill";
            r.kvBlocks = need;
            r.startStep = step;
            kvUsed += need;
            active.push(r.id);
          }
        }
      }

      // Run one step on each active request
      for (var j = 0; j < active.length; j++) {
        var rr = reqs[active[j]];
        if (rr.state === "prefill") {
          rr.state = "decode";
        } else if (rr.state === "decode") {
          rr.decoded++;
          // grow KV by 1 block every 4 decoded tokens
          if (rr.decoded % 4 === 0) {
            if (kvUsed + 1 <= TOTAL_KV_BLOCKS) {
              kvUsed++;
              rr.kvBlocks++;
            }
          }
          if (rr.decoded >= rr.genLen) {
            rr.state = "done";
            rr.endStep = step;
            kvUsed -= rr.kvBlocks;
          }
        }
      }
      active = active.filter(function (id) { return reqs[id].state !== "done"; });

      snapshot("step " + step);
      step++;
    }
    return frames;
  }

  function buildExplain(frame) {
    var waiting = frame.reqs.filter(function (r) { return r.state === "waiting" && r.arrival <= frame.step; }).length;
    var prefill = frame.active.filter(function (id) { return frame.reqs[id].state === "prefill" || (frame.reqs[id].startStep === frame.step); }).length;
    var decode = frame.active.length;
    var done = frame.reqs.filter(function (r) { return r.state === "done"; }).length;
    var kvPct = Math.round((frame.kvUsed / TOTAL_KV_BLOCKS) * 100);
    var s = "Step <b>" + frame.step + "</b>. ";
    s += "Batch: <b>" + frame.active.length + "</b> active. ";
    s += "KV cache: <b>" + frame.kvUsed + " / " + TOTAL_KV_BLOCKS + "</b> blocks (" + kvPct + "%). ";
    if (waiting > 0) s += "<b>" + waiting + "</b> request(s) waiting — scheduler will admit when KV has room. ";
    if (done > 0) s += "<b>" + done + "</b> finished, KV freed.";
    return s;
  }

  function render(root, frames, idx) {
    var f = frames[idx];
    var html = "";

    html += '<div class="vb-header">';
    html += '<div class="vb-title">continuous batching · KV cache · ' + MAX_BATCH + '-way max</div>';
    html += '<div class="vb-controls">';
    html += '<button data-act="prev"' + (idx === 0 ? ' disabled' : '') + '>← prev</button>';
    html += '<button data-act="play">' + (root.dataset.playing === "1" ? "pause" : "play") + '</button>';
    html += '<button data-act="next"' + (idx === frames.length - 1 ? ' disabled' : '') + '>next →</button>';
    html += '<button data-act="reset">reset</button>';
    html += '</div></div>';

    html += '<div class="vb-meta">';
    html += '<span>step <b>' + f.step + ' / ' + (TOTAL_STEPS - 1) + '</b></span>';
    html += '<span>batch <b>' + f.active.length + ' / ' + MAX_BATCH + '</b></span>';
    html += '<span>KV <b>' + f.kvUsed + ' / ' + TOTAL_KV_BLOCKS + '</b></span>';
    html += '</div>';

    var kvPct = (f.kvUsed / TOTAL_KV_BLOCKS) * 100;
    html += '<div class="vb-kv"><div class="vb-kv-fill" style="width:' + kvPct + '%"></div></div>';

    html += '<div class="vb-grid">';
    for (var i = 0; i < f.reqs.length; i++) {
      var r = f.reqs[i];
      var arrivalPct = (r.arrival / TOTAL_STEPS) * 100;
      var startPct = r.startStep >= 0 ? (r.startStep / TOTAL_STEPS) * 100 : null;
      var nowPct = (f.step / TOTAL_STEPS) * 100;
      var endPct = r.endStep >= 0 ? (r.endStep / TOTAL_STEPS) * 100 : nowPct;

      html += '<div class="vb-row">';
      html += '<div class="vb-rowlabel">' + r.name + '</div>';
      html += '<div class="vb-track">';

      // waiting segment from arrival to start
      if (r.arrival <= f.step) {
        var waitEnd = startPct !== null ? startPct : nowPct;
        if (waitEnd > arrivalPct) {
          html += '<div class="vb-tick waiting" style="left:' + arrivalPct + '%;width:' + (waitEnd - arrivalPct) + '%"></div>';
        }
      }
      // prefill at startStep (1 step wide)
      if (r.startStep >= 0 && r.startStep <= f.step) {
        var pfW = (1 / TOTAL_STEPS) * 100;
        html += '<div class="vb-tick prefill" style="left:' + startPct + '%;width:' + pfW + '%"></div>';
      }
      // decode from startStep+1 to endStep or now
      if (r.startStep >= 0 && f.step > r.startStep) {
        var dStart = ((r.startStep + 1) / TOTAL_STEPS) * 100;
        var dEnd = endPct;
        if (dEnd > dStart) {
          var cls = r.state === "done" ? "done" : "decode";
          html += '<div class="vb-tick ' + cls + '" style="left:' + dStart + '%;width:' + (dEnd - dStart) + '%"></div>';
        }
      }

      html += '</div>';
      var stateLabel = r.state === "waiting" && r.arrival > f.step ? "—" :
        r.state === "done" ? "done" :
        r.state === "waiting" ? "queued" :
        r.state === "prefill" ? "prefill" :
        "decode " + r.decoded + "/" + r.genLen;
      html += '<div class="vb-rowstate">' + stateLabel + '</div>';
      html += '</div>';
    }
    html += '</div>';

    html += '<div class="vb-legend">';
    html += '<span><span class="vb-dot" style="background:rgba(156,163,175,0.45)"></span>queued</span>';
    html += '<span><span class="vb-dot" style="background:rgba(167,139,250,0.7)"></span>prefill</span>';
    html += '<span><span class="vb-dot" style="background:rgba(96,165,250,0.7)"></span>decode</span>';
    html += '<span><span class="vb-dot" style="background:rgba(74,222,128,0.55)"></span>done</span>';
    html += '</div>';

    html += '<div class="vb-explain">' + buildExplain(f) + '</div>';

    root.innerHTML = html;
  }

  function mount() {
    var root = document.getElementById(ROOT_ID);
    if (!root) return;
    var rng = seeded(7);
    var reqs = generateRequests(rng);
    var frames = simulate(reqs);
    var idx = 0;
    var timer = null;

    function tick() {
      if (idx < frames.length - 1) {
        idx++;
        draw();
      } else {
        clearInterval(timer);
        timer = null;
        root.dataset.playing = "";
        draw();
      }
    }

    function draw() {
      render(root, frames, idx);
      var btns = root.querySelectorAll("button");
      for (var i = 0; i < btns.length; i++) {
        btns[i].addEventListener("click", function (e) {
          var act = e.currentTarget.getAttribute("data-act");
          if (act === "prev" && idx > 0) { idx--; }
          else if (act === "next" && idx < frames.length - 1) { idx++; }
          else if (act === "reset") { idx = 0; }
          else if (act === "play") {
            if (timer) { clearInterval(timer); timer = null; root.dataset.playing = ""; }
            else { root.dataset.playing = "1"; timer = setInterval(tick, 380); }
          }
          draw();
        });
      }
    }

    draw();
  }

  if (typeof window.lazyWidget === "function") {
    window.lazyWidget(ROOT_ID, mount);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
