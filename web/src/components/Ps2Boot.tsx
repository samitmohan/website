"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/*
 * The PS2 boot screen, rebuilt. On the real console the towers in the blue
 * mist are the saves on the memory card: one tower per game, taller the more
 * data it holds. Here each tower is a trip and each block one of its photos.
 * Coloured dots circle the scene, the camera drifts round and then pushes into
 * the mist, and blue dust gathers into words. No console logos or names.
 */

const DOT_COLORS = [0xff7ab6, 0x5fe3b0, 0xff5a5a, 0x6fa8ff];
const ORBIT = 5200; // ms of slow drift before the push into the mist
const PUSH = 1500; // ms of the push
const WORD = "MEMORY CARD";

export function Ps2Boot({ towers, onStart }: { towers: number[]; onStart: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const dust = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = host.current!, dc = dust.current!;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%";

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a1840, 0.05);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);

    // Towers: stacked translucent blocks with bright edges, set round the middle.
    const block = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const edges = new THREE.EdgesGeometry(block);
    const fill = new THREE.MeshBasicMaterial({ color: 0x9cc4ff, transparent: true, opacity: 0.16, depthWrite: false });
    const line = new THREE.LineBasicMaterial({ color: 0xd8e8ff, transparent: true, opacity: 0.7 });
    const cubes: { mesh: THREE.Object3D; at: number }[] = [];
    const n = Math.max(1, towers.length);
    towers.forEach((count, t) => {
      const a = (t / n) * Math.PI * 2 + 0.6;
      const r = n === 1 ? 2.4 : 2.6 + (t % 2) * 0.8;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      for (let k = 0; k < count; k++) {
        const g = new THREE.Group();
        g.add(new THREE.Mesh(block, fill), new THREE.LineSegments(edges, line));
        g.position.set(x, 0.45 + k * 0.95, z);
        g.rotation.y = a;
        scene.add(g);
        cubes.push({ mesh: g, at: 250 + t * 180 + k * 70 }); // each block drops in, bottom first
      }
    });

    // Floor: a faint grid under the mist.
    const grid = new THREE.GridHelper(40, 40, 0x2a4fa8, 0x16285c);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.35;
    scene.add(grid);

    // Coloured dots circling the scene.
    const dots = Array.from({ length: 46 }, (_, i) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.045 + (i % 3) * 0.015, 8, 8),
        new THREE.MeshBasicMaterial({ color: DOT_COLORS[i % 4], transparent: true, opacity: 0.9, fog: false }),
      );
      scene.add(m);
      return { m, r: 2.2 + ((i * 37) % 50) / 10, y: 0.5 + ((i * 53) % 70) / 10, sp: 0.15 + ((i * 17) % 10) / 40, ph: i * 1.7 };
    });

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      dc.width = Math.round(w * Math.min(devicePixelRatio, 2));
      dc.height = Math.round(h * Math.min(devicePixelRatio, 2));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // Blue dust that gathers into the word once the camera is in the mist.
    const g2 = dc.getContext("2d")!;
    let grains: { x: number; y: number; tx: number; ty: number; d: number }[] = [];
    const makeDust = () => {
      const W = dc.width, H = dc.height;
      const off = document.createElement("canvas");
      off.width = W;
      off.height = H;
      const o = off.getContext("2d")!;
      const size = Math.min(W * 0.085, H * 0.16);
      o.font = `600 ${size}px ui-sans-serif, system-ui, sans-serif`;
      o.textAlign = "center";
      o.textBaseline = "middle";
      o.fillStyle = "#fff";
      o.fillText(WORD.split("").join(String.fromCharCode(8202)), W / 2, H * 0.44);
      const px = o.getImageData(0, 0, W, H).data;
      const step = Math.max(3, Math.round(size / 18));
      grains = [];
      for (let y = 0; y < H; y += step)
        for (let x = 0; x < W; x += step)
          if (px[(y * W + x) * 4 + 3] > 128) {
            const a = Math.random() * Math.PI * 2, rr = Math.max(W, H) * (0.4 + Math.random() * 0.5);
            grains.push({ x: W / 2 + Math.cos(a) * rr, y: H / 2 + Math.sin(a) * rr, tx: x, ty: y, d: Math.random() * 500 });
          }
    };

    const t0 = performance.now();
    let raf = 0, visible = true, shown = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const t = still ? ORBIT + PUSH + 2600 : now - t0;

      for (const c of cubes) {
        const u = Math.min(1, Math.max(0, (t - c.at) / 600));
        const e = 1 - (1 - u) ** 3;
        c.mesh.scale.setScalar(Math.max(0.001, e));
        c.mesh.rotation.y += still ? 0 : 0.002;
      }
      for (const d of dots) {
        const a = d.ph + (t / 1000) * d.sp;
        d.m.position.set(Math.cos(a) * d.r, d.y + Math.sin(a * 2) * 0.2, Math.sin(a) * d.r);
      }

      // Camera: a slow low orbit, then a push forward into the mist.
      const orbit = Math.min(t, ORBIT) / ORBIT;
      const push = Math.min(1, Math.max(0, (t - ORBIT) / PUSH));
      const ease = push * push * (3 - 2 * push);
      // Wide and low first, so the towers stand whole in frame; the push heads
      // for the empty middle and stops short of the towers round it.
      const ang = -1.15 + orbit * 0.7;
      const dist = 19 - ease * 13;
      camera.position.set(Math.cos(ang) * dist, 3.2 + orbit * 1.4 - ease * 1.2, Math.sin(ang) * dist);
      camera.lookAt(0, 4.4 - ease * 0.8, 0);
      (scene.fog as THREE.FogExp2).density = 0.05 + ease * 0.2;
      renderer.render(scene, camera);

      // The dust starts as the push ends.
      const td = t - ORBIT - PUSH * 0.6;
      g2.setTransform(1, 0, 0, 1, 0, 0);
      g2.clearRect(0, 0, dc.width, dc.height);
      if (td > 0) {
        if (!grains.length) makeDust();
        g2.fillStyle = "rgba(190, 215, 255, 0.95)";
        g2.shadowColor = "rgba(120, 170, 255, 0.9)";
        g2.shadowBlur = 6;
        for (const p of grains) {
          const u = Math.min(1, Math.max(0, (td - p.d) / 1400));
          const e = 1 - (1 - u) ** 4;
          const x = p.x + (p.tx - p.x) * e, y = p.y + (p.ty - p.y) * e;
          g2.globalAlpha = 0.25 + 0.75 * e;
          g2.fillRect(x, y, 2, 2);
        }
        g2.globalAlpha = 1;
        if (!shown && td > 1700) {
          shown = true;
          setReady(true);
        }
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      renderer.dispose();
      block.dispose();
      edges.dispose();
      el.removeChild(renderer.domElement);
    };
  }, [towers]);

  return (
    <button
      type="button"
      onClick={onStart}
      aria-label="Start the memory card"
      className="ps2-boot relative block aspect-[16/10] w-full overflow-hidden rounded-[22px] text-left sm:aspect-[16/8]"
    >
      <div ref={host} className="absolute inset-0" />
      <canvas ref={dust} className="pointer-events-none absolute inset-0 size-full" aria-hidden />
      <span
        className="ps2-text absolute inset-x-0 bottom-[9%] text-center text-[12px] tracking-[.3em] uppercase transition-opacity duration-700"
        style={{ opacity: ready ? 1 : 0, animation: ready ? "ps2-blink 1.6s ease-in-out infinite" : undefined }}
      >
        press <span className="text-[#ff6b6b]">◯</span> to start
      </span>
    </button>
  );
}
