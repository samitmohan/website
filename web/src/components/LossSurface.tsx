"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/*
 * Himmelblau's function, log-scaled so the four minima read as valleys rather
 * than a flat floor under one enormous peak. The balls descend the same
 * log1p(f) that is drawn, so what you see is what they optimise.
 */
const R = 5; // domain is [-R, R]^2
const H = 2.2; // world height of the tallest point
const himmel = (x: number, y: number) => (x * x + y - 11) ** 2 + (x + y * y - 7) ** 2;
const FMAX = Math.log1p(himmel(-R, -R));
const loss = (x: number, y: number) => Math.log1p(himmel(x, y)) / FMAX;
function grad(x: number, y: number): [number, number] {
  const a = x * x + y - 11;
  const b = x + y * y - 7;
  const k = 1 / ((1 + himmel(x, y)) * FMAX);
  return [(4 * x * a + 2 * b) * k, (2 * a + 4 * y * b) * k];
}

const S = 4; // world half-width of the surface
const toWorld = (x: number, y: number) => new THREE.Vector3((x / R) * S, loss(x, y) * H, (y / R) * S);

type Runner = {
  p: [number, number];
  m: [number, number];
  v: [number, number];
  t: number;
  kind: "sgd" | "adam";
  ball: THREE.Mesh;
  trail: THREE.Line;
  pts: THREE.Vector3[];
  done: boolean;
};

function step(r: Runner) {
  const [gx, gy] = grad(r.p[0], r.p[1]);
  if (r.kind === "sgd") {
    // Plain gradient descent with a little noise standing in for minibatches.
    // The step is clipped so a steep wall cannot fling the ball off the map.
    const lr = 0.9;
    const g = Math.hypot(gx, gy), c = g * lr > 0.12 ? 0.12 / (g * lr) : 1;
    r.p[0] -= lr * gx * c + (Math.random() - 0.5) * 0.01;
    r.p[1] -= lr * gy * c + (Math.random() - 0.5) * 0.01;
  } else {
    const lr = 0.06, b1 = 0.9, b2 = 0.999, eps = 1e-8;
    r.t += 1;
    r.m = [b1 * r.m[0] + (1 - b1) * gx, b1 * r.m[1] + (1 - b1) * gy];
    r.v = [b2 * r.v[0] + (1 - b2) * gx * gx, b2 * r.v[1] + (1 - b2) * gy * gy];
    const mh = [r.m[0] / (1 - b1 ** r.t), r.m[1] / (1 - b1 ** r.t)];
    const vh = [r.v[0] / (1 - b2 ** r.t), r.v[1] / (1 - b2 ** r.t)];
    r.p[0] -= (lr * mh[0]) / (Math.sqrt(vh[0]) + eps);
    r.p[1] -= (lr * mh[1]) / (Math.sqrt(vh[1]) + eps);
  }
  r.p[0] = Math.max(-R, Math.min(R, r.p[0]));
  r.p[1] = Math.max(-R, Math.min(R, r.p[1]));
  if (Math.hypot(gx, gy) < 2e-4 || r.pts.length > 600) r.done = true;
}

function cssColor(name: string) {
  return new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#111");
}

export function LossSurface({ className = "" }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [hint, setHint] = useState(true);
  const [stats, setStats] = useState<{ sgd: number; adam: number } | null>(null);
  const api = useRef<{ reset: () => void } | null>(null);

  useEffect(() => {
    const el = host.current!;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = "manipulation";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    const pivot = new THREE.Group();
    scene.add(pivot);

    // Filled surface: paints the background colour so far grid lines are hidden.
    const N = 48;
    const geo = new THREE.PlaneGeometry(2 * S, 2 * S, N, N);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = (pos.getX(i) / S) * R, y = (pos.getZ(i) / S) * R;
      pos.setY(i, loss(x, y) * H);
    }
    const fill = new THREE.MeshBasicMaterial({ polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    const surface = new THREE.Mesh(geo, fill);
    pivot.add(surface);

    // Grid lines every few vertices, in ink.
    const lineMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.35 });
    const gridPts: THREE.Vector3[] = [];
    const G = 28;
    for (let i = 0; i <= G; i++) {
      for (let j = 0; j < G; j++) {
        const u = -R + (2 * R * i) / G, a = -R + (2 * R * j) / G, b = -R + (2 * R * (j + 1)) / G;
        gridPts.push(toWorld(u, a), toWorld(u, b), toWorld(a, u), toWorld(b, u));
      }
    }
    const grid = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(gridPts), lineMat);
    pivot.add(grid);

    const runners: Runner[] = [];
    const ballGeo = new THREE.SphereGeometry(0.09, 20, 20);
    const accentMat = new THREE.MeshBasicMaterial();
    const inkMat = new THREE.MeshBasicMaterial();
    const accentLine = new THREE.LineBasicMaterial();
    const inkLine = new THREE.LineBasicMaterial();

    const paint = () => {
      const bg = cssColor("--bg"), ink = cssColor("--ink"), accent = cssColor("--accent");
      fill.color = bg;
      lineMat.color = ink;
      inkMat.color = ink;
      inkLine.color = ink;
      accentMat.color = accent;
      accentLine.color = accent;
    };
    paint();
    const onTheme = () => requestAnimationFrame(paint);
    window.addEventListener("themechange", onTheme);
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", onTheme);

    const spawn = (x: number, y: number) => {
      for (const kind of ["sgd", "adam"] as const) {
        const ball = new THREE.Mesh(ballGeo, kind === "sgd" ? accentMat : inkMat);
        const trail = new THREE.Line(new THREE.BufferGeometry(), kind === "sgd" ? accentLine : inkLine);
        pivot.add(ball, trail);
        // Adam starts a hair offset so the two balls never sit exactly on top of each other.
        const o = kind === "adam" ? 0.05 : 0;
        runners.push({ p: [x + o, y + o], m: [0, 0], v: [0, 0], t: 0, kind, ball, trail, pts: [], done: false });
      }
      while (runners.length > 8) {
        const r = runners.shift()!;
        pivot.remove(r.ball, r.trail);
        r.trail.geometry.dispose();
      }
    };
    const reset = () => {
      for (const r of runners.splice(0)) {
        pivot.remove(r.ball, r.trail);
        r.trail.geometry.dispose();
      }
      setStats(null);
    };
    api.current = { reset };

    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const onClick = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObject(surface)[0];
      if (!hit) return;
      const local = pivot.worldToLocal(hit.point.clone());
      spawn((local.x / S) * R, (local.z / S) * R);
      setHint(false);
    };
    renderer.domElement.addEventListener("pointerdown", onClick);

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      camera.position.set(0, 8.6, 11.8);
      camera.lookAt(0, 0.4, 0);
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    let raf = 0;
    let frame = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      frame++;
      if (!still) pivot.rotation.y += 0.0012;
      let changed = false;
      for (const r of runners) {
        if (r.done) continue;
        for (let k = 0; k < 2; k++) step(r);
        const w = toWorld(r.p[0], r.p[1]);
        w.y += 0.08;
        r.ball.position.copy(w);
        r.pts.push(w.clone());
        r.trail.geometry.dispose();
        r.trail.geometry = new THREE.BufferGeometry().setFromPoints(r.pts);
        changed = true;
      }
      if (changed && frame % 6 === 0) {
        const last = (k: Runner["kind"]) => runners.filter((r) => r.kind === k).at(-1);
        const s = last("sgd"), a = last("adam");
        if (s && a) setStats({ sgd: loss(s.p[0], s.p[1]), adam: loss(a.p[0], a.p[1]) });
      }
      renderer.render(scene, camera);
    };
    loop();

    // An opening drop, so the toy explains itself before anyone clicks.
    const opener = setTimeout(() => spawn(-0.6, 4.4), still ? 0 : 1400);

    return () => {
      clearTimeout(opener);
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("themechange", onTheme);
      mq.removeEventListener("change", onTheme);
      renderer.domElement.removeEventListener("pointerdown", onClick);
      renderer.dispose();
      geo.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <figure className={`relative ${className}`}>
      <div ref={host} className="aspect-[3/2] w-full cursor-crosshair overflow-hidden rounded-xl" />
      <figcaption className="pointer-events-none absolute inset-x-3 bottom-2 flex items-end justify-between gap-2">
        <span className="meta">
          {hint ? "click the surface to drop a ball" : (
            <>
              <span className="text-accent">● sgd</span> {stats ? stats.sgd.toFixed(3) : "-"}
              <span className="ml-3 text-ink">● adam</span> {stats ? stats.adam.toFixed(3) : "-"}
            </>
          )}
        </span>
        <button
          type="button"
          onClick={() => api.current?.reset()}
          className="meta pointer-events-auto rounded-full bg-surface px-2.5 py-1 hover:text-ink"
        >
          reset
        </button>
      </figcaption>
    </figure>
  );
}
