"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { AfterimagePass } from "three/addons/postprocessing/AfterimagePass.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";

/*
 * The PS2 boot sequence. Looking straight down on a field of tall grey towers
 * round a blue fog, glass cubes tumble and comet lights streak while the
 * camera drifts; "Sony Computer Entertainment" holds in the middle, the
 * camera flies up into the smear, the screen goes black, and the PlayStation 2
 * wordmark comes and goes. Each frame is blended 62.5% into the next, which is
 * where the console's trailing glow comes from.
 *
 * Timeline, seconds from power-on (measured from frame captures):
 *   0.0-1.0 black · 1.0-2.0 scene in · 2.6-5.6 SCE text · 6.2-7.3 fly-up and
 *   fade · 8.3-10.6 wordmark · 11.3 done.
 */

const T = { sceneIn: 1.0, textIn: 2.6, textOut: 5.6, fly: 6.2, black: 7.3, logoIn: 8.3, logoOut: 10.6, done: 11.3 };

const COLS = 14;
const ROWS = 9;
const PITCH = 5.2;
const HALF = 2.2;

/**
 * Tower heights, after the console's height field (as documented by the
 * osdbits reverse engineering): a strong radial bump left of centre, a half
 * weight one to the lower right, scaled by 0.85, an integer dither of +-50, and
 * a clamp to [32, 220]. The spread is what gives the scene its depth: tall
 * towers rise close to the camera while short ones sink into the dark.
 */
function heights(): number[][] {
  const R = Math.sqrt(5202);
  const ramp = (d: number) => Math.min(255, Math.max(32, (255 * (R - d)) / R));
  const out: number[][] = [];
  for (let i = 0; i < COLS; i++) {
    out[i] = [];
    for (let j = 0; j < ROWS; j++) {
      const x = (i - COLS / 2 + 0.5) * PITCH, z = (j - ROWS / 2 + 0.5) * PITCH;
      let v = ramp(2 * Math.hypot(x + 5.1, z)) + 0.5 * ramp(4 * Math.hypot(x - 10.2, z - 5.1));
      v = v * 0.85 - 10 * ((Math.trunc(((i + j) * i) / (j + 1)) % 11) - 5);
      out[i][j] = Math.min(220, Math.max(32, v));
    }
  }
  return out;
}

function noiseCanvas(size: number, seed: number, color: [number, number, number], alpha: number) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const img = g.createImageData(size, size);
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  // Value noise over a few octaves, then a soft round falloff so a layer has no edges.
  const grid = (n: number) => Array.from({ length: (n + 1) * (n + 1) }, rnd);
  const octs = [4, 8, 16].map((n) => ({ n, g: grid(n) }));
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      let v = 0, w = 0;
      for (const [k, o] of octs.entries()) {
        const fx = (x / size) * o.n, fy = (y / size) * o.n, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
        const at = (a: number, b: number) => o.g[b * (o.n + 1) + a];
        const top = at(x0, y0) * (1 - tx) + at(x0 + 1, y0) * tx, bot = at(x0, y0 + 1) * (1 - tx) + at(x0 + 1, y0 + 1) * tx;
        const amp = 1 / (k + 1);
        v += (top * (1 - ty) + bot * ty) * amp;
        w += amp;
      }
      v /= w;
      const d = Math.hypot(x / size - 0.5, y / size - 0.5) * 2;
      const fall = Math.max(0, 1 - d) ** 1.6;
      const i = (y * size + x) * 4;
      img.data[i] = color[0];
      img.data[i + 1] = color[1];
      img.data[i + 2] = color[2];
      img.data[i + 3] = 255 * Math.min(1, Math.max(0, (v - 0.35) * 1.9)) * fall * alpha;
    }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.18, "rgba(255,255,255,.85)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function wallTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#c4c7ce";
  g.fillRect(0, 0, 128, 128);
  const img = g.getImageData(0, 0, 128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 22;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function Ps2Boot({ onDone }: { onDone: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const [t, setT] = useState(0);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const el = host.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%";

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 120, 330);
    const camera = new THREE.PerspectiveCamera(27, 16 / 9, 1, 800);

    // Light from above: tower tops bright, sides falling into shadow.
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const sun = new THREE.DirectionalLight(0xffffff, 1.6);
    sun.position.set(0.3, 1, 0.2);
    scene.add(sun);

    // The tower field, standing on y = 0 and seen from above.
    const wall = wallTexture();
    const towerMat = new THREE.MeshLambertMaterial({ map: wall, color: 0xffffff });
    const box = new THREE.BoxGeometry(HALF * 2, 1, HALF * 2);
    box.translate(0, 0.5, 0);
    const H = heights();
    // On the console the memory card's play history decides which cells hold a
    // tower; here a fixed hash fills a little under half of them, the same way
    // on every visit.
    const filled: [number, number][] = [];
    for (let i = 0; i < COLS; i++)
      for (let j = 0; j < ROWS; j++) {
        const h = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
        if (h - Math.floor(h) < 0.45) filled.push([i, j]);
      }
    const towers = new THREE.InstancedMesh(box, towerMat, filled.length);
    const m = new THREE.Matrix4();
    let k = 0;
    for (const [i, j] of filled) {
      m.compose(
        new THREE.Vector3((i - COLS / 2 + 0.5) * PITCH, 0, (j - ROWS / 2 + 0.5) * PITCH),
        new THREE.Quaternion(),
        new THREE.Vector3(1, H[i][j], 1),
      );
      towers.setMatrixAt(k++, m);
    }
    scene.add(towers);

    // Blue fog: six additive noise layers stacked through the field, drifting.
    const fog = Array.from({ length: 6 }, (_, l) => {
      const tex = noiseCanvas(128, 31 + l * 7, [118, 146, 255], 0.9 - l * 0.08);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: 0.7 });
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(64, 64), mat);
      plane.rotation.x = -Math.PI / 2;
      plane.position.set(-4 + l * 0.6, 200 + l * 12, 1 - l * 0.5);
      scene.add(plane);
      return { plane, tex, speed: 0.004 + l * 0.0015 };
    });

    // Five glass cubes tumbling between the camera and the towers.
    const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
    const cubes = [
      { p: [1, 300, -3], s: 6, tint: 0x8aa2ff, op: 0.62 },
      { p: [-19, 296, -13], s: 6, tint: 0x30343e, op: 0.85 },
      { p: [21, 300, -15], s: 6.5, tint: 0x30343e, op: 0.85 },
      { p: [-17, 292, 13], s: 6.5, tint: 0x3a4152, op: 0.8 },
      { p: [19, 298, 10], s: 5, tint: 0x3a4152, op: 0.8 },
    ].map((c, i) => {
      const mat = new THREE.MeshPhongMaterial({ color: c.tint, specular: 0xdfe8ff, shininess: 80, transparent: true, opacity: c.op, fog: false });
      const mesh = new THREE.Mesh(cubeGeo, mat);
      mesh.scale.setScalar(c.s);
      mesh.position.set(c.p[0], c.p[1], c.p[2]);
      const rim = new THREE.LineSegments(new THREE.EdgesGeometry(cubeGeo), new THREE.LineBasicMaterial({ color: 0xcfdcff, transparent: true, opacity: 0.35, fog: false }));
      mesh.add(rim);
      scene.add(mesh);
      return { mesh, spin: new THREE.Vector3(0.21 + i * 0.05, 0.33 - i * 0.04, 0.17 + i * 0.03) };
    });

    // Comet lights with thin trails.
    const glow = glowTexture();
    const comets = [0xff6fae, 0x6dff8a, 0xc38cff, 0xff6f86].map((color, i) => {
      const head = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
      head.scale.setScalar(1.1);
      scene.add(head);
      const N = 36;
      const pts = new Float32Array(N * 3);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
      const cols = new Float32Array(N * 3);
      const c = new THREE.Color(color);
      for (let q = 0; q < N; q++) {
        const f = 1 - q / N;
        cols.set([c.r * f, c.g * f, c.b * f], q * 3);
      }
      geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
      const trail = new THREE.Line(geo, new THREE.LineBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, fog: false }));
      scene.add(trail);
      return { head, trail, pts, N, ph: i * 1.7, r: 9 + i * 3, y: 270 + i * 5 };
    });

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const after = new AfterimagePass(0.625);
    composer.addPass(after);
    composer.addPass(new OutputPass());

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const start = performance.now();
    let raf = 0, finished = false;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const s = (now - start) / 1000;
      setT(s);
      if (s >= T.done && !finished) {
        finished = true;
        done.current();
      }
      if (s > T.black + 0.2) {
        renderer.setClearColor(0x000000, 1);
        renderer.clear();
        return;
      }

      // Camera: a slow drift with a gentle roll, then an accelerating fly-up into the field.
      const drift = Math.max(0, s - T.sceneIn);
      const fly = Math.max(0, s - T.fly);
      // About 130 units above the tallest tops at rest, as measured from the reference frame.
      const height = 350 - drift * 2.2 - fly * fly * 110;
      camera.position.set(Math.sin(drift * 0.12) * 5, height, Math.cos(drift * 0.1) * 3 + 6);
      camera.up.set(Math.sin(drift * 0.05 + fly * fly * 0.6), 0, -Math.cos(drift * 0.05 + fly * fly * 0.6));
      // A slight forward tilt, so the near towers show their long sides.
      camera.lookAt(camera.position.x * 0.3, 0, camera.position.z * 0.3 - 10);

      for (const c of cubes) {
        c.mesh.rotation.x += c.spin.x * 0.016;
        c.mesh.rotation.y += c.spin.y * 0.016;
        c.mesh.rotation.z += c.spin.z * 0.016;
      }
      for (const f of fog) f.tex.offset.set(s * f.speed, s * f.speed * 0.6);
      for (const c of comets) {
        const a = c.ph + s * 1.1;
        const x = Math.cos(a) * c.r + Math.sin(a * 2.3) * 6, z = Math.sin(a * 1.3) * c.r * 0.7, y = c.y + Math.sin(a * 0.7) * 6;
        c.head.position.set(x, y, z);
        c.pts.copyWithin(3, 0, (c.N - 1) * 3);
        c.pts.set([x, y, z], 0);
        if (s < 0.1) for (let q = 0; q < c.N; q++) c.pts.set([x, y, z], q * 3);
        c.trail.geometry.attributes.position.needsUpdate = true;
      }

      // Fade the whole scene in and out by dimming exposure.
      const level = smooth(T.sceneIn, T.sceneIn + 1, s) * (1 - smooth(T.fly + 0.5, T.black, s));
      renderer.toneMappingExposure = level;
      renderer.toneMapping = THREE.LinearToneMapping;
      composer.render();
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      composer.dispose();
      renderer.dispose();
      box.dispose();
      cubeGeo.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  const sce = smooth(T.textIn, T.textIn + 0.8, t) * (1 - smooth(T.textOut, T.textOut + 0.6, t));
  const logo = smooth(T.logoIn, T.logoIn + 0.8, t) * (1 - smooth(T.logoOut, T.logoOut + 0.7, t));

  return (
    <div className="absolute inset-0 bg-black">
      <div ref={host} className="absolute inset-0" />
      <p
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[clamp(15px,2.6vw,26px)] font-semibold tracking-[.01em] text-white"
        style={{ opacity: sce, fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', textShadow: "0 0 12px rgba(255,255,255,.35)" }}
      >
        Sony Computer Entertainment
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/ps2/ps2-logo.svg"
        alt="PlayStation 2"
        className="pointer-events-none absolute top-1/2 left-1/2 w-[min(58%,420px)] -translate-x-1/2 -translate-y-1/2"
        style={{ opacity: logo }}
      />
    </div>
  );
}
