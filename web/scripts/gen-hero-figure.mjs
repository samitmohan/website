#!/usr/bin/env node
/**
 * Generates public/gradient-descent.svg, the figure hung from the top of the
 * homepage: the ball-on-a-loss-curve picture from every optimisation chapter.
 *
 * Run by hand (`npm run figure`). The output is committed like the other
 * drawings in public/; this exists because the roll is 120 sampled frames of a
 * real optimiser run, and a hand-edited version of that is a file nobody can
 * retune. Change a constant below and re-run.
 *
 * It is the momentum figure specifically, so the curve is a double well:
 *
 *   L(u) = u^4 - 2u^2 + TILT*u
 *
 * which has a shallow minimum, a barrier, and a deeper one. The ball is
 * released high on the left, rolls into the shallow minimum, and carries
 * enough velocity through it to clear the barrier and settle in the deep one.
 * Plain gradient descent stops in the first well; that difference is the whole
 * reason the picture is famous, and it is why this draws two wells and not a
 * bowl.
 *
 * Every position comes from actually running heavy-ball momentum on L. The
 * ball sits on the curve's normal, so it rests ON the curve at every frame,
 * and its rotation is real arc length over radius, so it rolls rather than
 * slides.
 *
 * Two earlier versions of this file are worth not repeating: a nimbu-mirchi
 * charm swinging over a perspective bowl (two projections in one drawing, and
 * the loudest colour on the site), and a plumb bob on a thread over a circular
 * arc (geometrically clean, but a pendulum is not the picture anyone means by
 * "gradient descent").
 */
import { writeFileSync } from "fs";
import path from "path";

const OUT = path.join(
  import.meta.dirname,
  "..",
  "public",
  "gradient-descent.svg",
);

/* ---------------------------------------------------------------- geometry */
const W = 320;
/* 120, not the 176 the first version used. The element is 400px wide at most
   (.home-hang), so the viewBox scale is 400/320 = 1.25 and every unit of
   height here costs 1.25px of page. .home-stage starts the wordmark at
   clamp(150px, 23vh, 240px), so ink much past 140px of page has the drawing
   arriving in the name. Measured ink at the real render size is printed when
   the raster check runs. */
const H = 120;
const X0 = 22; // curve's left edge, in viewBox units
const X1 = 298; // curve's right edge
const Y_TOP = 15; // where the highest point of the curve sits
/* 88, not 100. The deep well is the curve's lowest point by construction, so
   at 100 its leader line ran from y=100 to the label's y=101 and was a single
   unit long - invisible, while the shallow well's leader was 40 units and
   perfectly visible. Lifting the floor gives both minima a leader that reads
   as the same annotation. */
const Y_BOT = 88; // where the lowest point sits
const BALL_R = 7;

/* ------------------------------------------------------------------- loss */
const TILT = -0.35; // asymmetry. Negative puts the DEEP well on the right.
const U_LIM = 1.62; // domain, symmetric. Sets how high the shoulders climb.

const L = (u) => u ** 4 - 2 * u * u + TILT * u;
const dL = (u) => 4 * u ** 3 - 4 * u + TILT;

/* ------------------------------------------------------------- optimiser
   Heavy-ball momentum, which is the method the rolling-ball analogy is an
   analogy FOR: velocity accumulates downhill and friction bleeds it off.
   v <- BETA*v - ETA*L'(u);  u <- u + v
   BETA is the friction, ETA the step. These two are the whole tuning: too
   little of either and the ball parks in the shallow well, which is a correct
   run of the wrong figure. */
/* Measured by sweeping both against "does the run end in the deep well":
   at BETA 0.92 the ball escapes for any ETA from 0.008 up, and at BETA 0.86 it
   needs ETA 0.02 to escape at all. Lower friction buys the escape with a
   gentler step, which is the slower and better-looking roll. Below BETA 0.9,
   ETA 0.012 or less parks in the shallow well: a correct run of the wrong
   figure. */
const BETA = 0.92;
const ETA = 0.008;
const U_START = -1.6;
/* Simulate generously and cut at the settle point rather than fixing a step
   count. The dynamics here resolve in about 100 steps; a fixed 900 spent 90%
   of the frames on a ball already at rest, so the roll played out inside the
   first two frames of the animation and the rest was a held image. */
const SIM_MAX = 4000;
const SETTLE_EPS = 0.02; // in u, how close to the minimum counts as arrived

/* ------------------------------------------------------------------ output */
const FRAMES = 120;
const CYCLE = 7600; // ms, whole loop including the hold at the minimum
const MOTION = 6000; // ms of rolling
const REST_HOLD = 600; // ms fully opaque at the minimum before fading
const FADE = 400; // ms to fade back in at the release point

/* ------------------------------------------------------------ projection */
const uToX = (u) => X0 + ((u + U_LIM) / (2 * U_LIM)) * (X1 - X0);
const L_HI = Math.max(L(-U_LIM), L(U_LIM));
const L_LO = Math.min(...[...Array(2001)].map((_, i) => L(-U_LIM + (i / 2000) * 2 * U_LIM)));
const K_Y = (Y_BOT - Y_TOP) / (L_HI - L_LO); // viewBox units per unit of loss
const lToY = (l) => Y_TOP + (L_HI - l) * K_Y;
/** dy/dx of the drawn curve at u. Chain rule through both mappings. */
const slope = (u) => (-K_Y * dL(u)) / ((X1 - X0) / (2 * U_LIM));

const f = (n) => Number(n.toFixed(1));
const f2 = (n) => Number(n.toFixed(2));

/** Ball centre: the curve point pushed BALL_R along the upward normal, so the
 *  ball is tangent to the curve instead of centred on it. */
function centre(u) {
  const m = slope(u);
  const n = Math.hypot(1, m);
  return [uToX(u) + (BALL_R * m) / n, lToY(L(u)) - BALL_R / n];
}

/* --------------------------------------------------------------- markers
   The two stationary points that make the figure an argument: the shallow well
   the ball rolls through, and the deep one it ends in. Found by scanning the
   sampled curve rather than by solving L'(u) = 0 - the samples are the thing
   being drawn, so a marker placed from them cannot sit off the ink. */
const mins = [];
{
  const N = 4000;
  for (let i = 1; i < N; i++) {
    const at = (j) => -U_LIM + (j / N) * 2 * U_LIM;
    if (L(at(i)) < L(at(i - 1)) && L(at(i)) < L(at(i + 1))) mins.push(at(i));
  }
}
mins.sort((a, b) => L(a) - L(b));
const [uGlobal, uLocal] = mins;

/* ------------------------------------------------------------------- run */
const traj = [];
{
  let u = U_START;
  let v = 0;
  for (let i = 0; i < SIM_MAX; i++) {
    traj.push(u);
    v = BETA * v - ETA * dL(u);
    u += v;
    if (!Number.isFinite(u)) throw new Error("run diverged: lower BETA or ETA");
  }
  // Cut at the last step that is still moving. Everything past it is the same
  // frame repeated, and holding it is the fade's job, not the roll's.
  let last = traj.length - 1;
  while (last > 0 && Math.abs(traj[last] - uGlobal) <= SETTLE_EPS) last--;
  traj.length = Math.min(traj.length, last + 2);
}
if (Math.abs(traj[traj.length - 1] - uGlobal) > 0.08) {
  throw new Error(
    `run ended at u=${traj[traj.length - 1].toFixed(3)}, not the deep well at ` +
      `${uGlobal.toFixed(3)}. The ball is parked in the shallow one: raise BETA or ETA.`,
  );
}

/* Resample to FRAMES, interpolating between steps rather than snapping to the
   nearest one: the run is ~100 steps and FRAMES is 120, so nearest-index
   repeats some frames and drops others, which stutters a roll that is
   otherwise smooth.

   Rotation is real: a ball rolling without slipping turns by ds/r, and the
   sign follows the direction of travel, so it unwinds when the ball rolls back
   down the far wall of the deep well. */
const keys = [];
let rot = 0;
const uAt = (t) => {
  const g = t * (traj.length - 1);
  const i = Math.min(Math.floor(g), traj.length - 2);
  return traj[i] + (traj[i + 1] - traj[i]) * (g - i);
};
let [px, py] = centre(uAt(0));
for (let i = 0; i <= FRAMES; i++) {
  const [cx, cy] = centre(uAt(i / FRAMES));
  if (i > 0) {
    const ds = Math.hypot(cx - px, cy - py);
    rot += ((cx >= px ? ds : -ds) / BALL_R) * (180 / Math.PI);
  }
  [px, py] = [cx, cy];
  const pct = f2((i / FRAMES) * (MOTION / CYCLE) * 100);
  keys.push(`${pct}%{transform:translate(${f(cx)}px,${f(cy)}px)rotate(${f(rot)}deg)}`);
}

const settled = `translate(${f(px)}px,${f(py)}px)rotate(${f(rot)}deg)`;
const holdPct = f2((MOTION / CYCLE) * 100);
const restPct = f2(((MOTION + REST_HOLD) / CYCLE) * 100);
const fadePct = f2(((CYCLE - FADE) / CYCLE) * 100);
const [sx, sy] = centre(U_START);
// Hold at the minimum, fade out, jump back to the release point, fade in. A
// converged run has to be cut somewhere and a fade is the only cut that is not
// a snap.
keys.push(`${holdPct}%,${fadePct}%{transform:${settled}}`);
keys.push(
  `${f2(Number(fadePct) + 0.01)}%,100%{transform:translate(${f(sx)}px,${f(sy)}px)rotate(0deg)}`,
);

/* ----------------------------------------------------------------- curve */
const curve = [];
for (let i = 0; i <= 220; i++) {
  const uu = -U_LIM + (i / 220) * 2 * U_LIM;
  curve.push(`${i === 0 ? "M" : "L"}${f(uToX(uu))} ${f(lToY(L(uu)))}`);
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
<title>Gradient descent with momentum</title>
<desc>A ball is released high on the left of a double-welled loss curve. It rolls down, gathers enough speed crossing the shallow minimum to climb the barrier beyond it, and settles in the deeper minimum on the right.</desc>
<style><![CDATA[
  /* --struct carries the geometry: one literal that has to clear the 3:1 bar
     for graphical objects on every ground this file lands on. The site is
     light-only, so that is #FFFDF8 and #FFFFFF. globals.css overrides it to a
     warmed #877F70 (3.90:1 on #FFFDF8) when the file is inlined; the #8A8A90
     below is the fallback for the img case.

     This file declares no --brand and carries no accent literal. The two door
     figures below it on the homepage take the accent of the page they open
     onto, and that is what leaves them as the only colour on the route. */
  svg { font-family:var(--font-mono,ui-monospace),SFMono-Regular,Menlo,monospace; --struct:#8A8A90; }
  /* Matches only when this file IS the document, i.e. loaded through an img
     element - the one case that gets no CSS from a host page. Inlined, the svg
     is not the root, this does not match, and currentColor inherits. */
  svg:root { color:#141414; }

  .gd-curve { fill:none; stroke:var(--struct); stroke-width:1.3; stroke-linejoin:round; opacity:.55; }
  .gd-well  { stroke:var(--struct); stroke-width:.8; opacity:.3; stroke-dasharray:2.5 3.5; }
  .gd-start { fill:none; stroke:currentColor; stroke-width:1.1; opacity:.42; }
  .gd-pit   { fill:currentColor; opacity:.45; }
  .gd-lab   { font-size:8.5px; letter-spacing:.04em; fill:currentColor; opacity:.6; }

  /* The ball. Two elements, one group: the disc, and one spoke so the roll is
     visible at all - a plain circle rotating is a circle. */
  .gd-ball  { fill:currentColor; opacity:.9; }
  /* The spoke is a hole in the ball, so it is painted in the ground rather
     than in ink. --background is what globals.css sets the page to; the
     literal is the fallback for the img case, where no host CSS reaches. */
  .gd-spoke { stroke:var(--background,#FFFDF8); stroke-width:1.1; opacity:.5; stroke-linecap:round; }

  /* One moving group, translate + rotate only, so this stays on the
     compositor. transform-box:view-box makes the transform read in viewBox
     units rather than against the group's own bounding box. */
  .gd-roll {
    transform-box:view-box;
    animation:gd-run ${CYCLE}ms linear infinite, gd-fade ${CYCLE}ms linear infinite;
  }
  @keyframes gd-run{${keys.join("")}}
  @keyframes gd-fade{0%,${restPct}%{opacity:1}${fadePct}%{opacity:0}${f2(Number(fadePct) + 0.01)}%{opacity:0}100%{opacity:1}}
  /* Motion off: park the ball in the deep minimum, which is the figure's
     conclusion rather than an arbitrary frame of it. */
  @media (prefers-reduced-motion:reduce) {
    .gd-roll { animation:none; transform:${settled}; }
  }
]]></style>
<path class="gd-curve" d="${curve.join("")}"/>
<line class="gd-well" x1="${f(uToX(uLocal))}" y1="${f(lToY(L(uLocal)))}" x2="${f(uToX(uLocal))}" y2="${H - 20}"/>
<line class="gd-well" x1="${f(uToX(uGlobal))}" y1="${f(lToY(L(uGlobal)))}" x2="${f(uToX(uGlobal))}" y2="${H - 20}"/>
<circle class="gd-pit" cx="${f(uToX(uLocal))}" cy="${f(lToY(L(uLocal)))}" r="1.5"/>
<circle class="gd-pit" cx="${f(uToX(uGlobal))}" cy="${f(lToY(L(uGlobal)))}" r="2"/>
<text class="gd-lab" x="${f(uToX(uLocal))}" y="${H - 10}" text-anchor="middle">local</text>
<text class="gd-lab" x="${f(uToX(uGlobal))}" y="${H - 10}" text-anchor="middle">global</text>
<circle class="gd-start" cx="${f(sx)}" cy="${f(sy)}" r="${BALL_R}"/>
<g class="gd-roll"><circle class="gd-ball" r="${BALL_R}"/><line class="gd-spoke" x1="0" y1="0" x2="0" y2="${-(BALL_R - 1.8)}"/></g>
</svg>
`;

writeFileSync(OUT, svg);
console.log(`  ${path.relative(process.cwd(), OUT)}  ${svg.length} B`);
console.log(`  wells: local u=${f2(uLocal)} L=${f2(L(uLocal))}   global u=${f2(uGlobal)} L=${f2(L(uGlobal))}`);
console.log(`  run: ${traj.length} steps, u ${f2(U_START)} -> ${f2(traj[traj.length - 1])}, roll ${f(rot)}deg`);
