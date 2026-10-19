// Checks the PS2 boot sound against the boot animation: when the chime in
// public/ps2/boot.mp3 (10.50s into the file) plays relative to the PS2 logo
// fading in. Usage: node scripts/ps2-sync.mjs <base url> [throttle ms for the mp3]
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3211";
const delay = Number(process.argv[3] ?? 0);
const CHIME = 10.5;
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--autoplay-policy=no-user-gesture-required"] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.addInitScript(() => {
  localStorage.setItem("ps2-sound", "on");
  window.__starts = [];
  const orig = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (when = 0, offset = 0) {
    window.__starts.push({ at: performance.now(), offset });
    return orig.call(this, when, offset);
  };
});
const page = await ctx.newPage();
// Optionally slow the mp3 down to prove the offset start keeps sync on a slow network.
if (delay) await page.route("**/ps2/boot.mp3", async (r) => { await new Promise((d) => setTimeout(d, delay)); await r.continue(); });
// With a delay, click while the mp3 is still in flight (fetch does not hold the load event).
await page.goto(base + "/things", { waitUntil: delay ? "load" : "networkidle" });
await page.getByRole("button", { name: "Start the memory card" }).scrollIntoViewIfNeeded();
await page.getByRole("button", { name: "Start the memory card" }).click();
const logoAt = await page.evaluate(
  () =>
    new Promise((done) => {
      const t0 = performance.now();
      const poll = () => {
        const img = document.querySelector('img[src="/ps2/ps2-logo.svg"]');
        if (img && +getComputedStyle(img).opacity > 0.5) return done(performance.now());
        if (performance.now() - t0 > 20000) return done(null);
        requestAnimationFrame(poll);
      };
      poll();
    }),
);
const starts = await page.evaluate(() => window.__starts);
await browser.close();
if (!starts.length || logoAt === null) {
  console.log("FAIL", { starts, logoAt });
  process.exit(1);
}
const s = starts[0];
const chimeAt = s.at + (CHIME - s.offset) * 1000;
const diff = chimeAt - logoAt;
console.log(`audio started at offset ${s.offset.toFixed(2)}s (mp3 delay ${delay}ms); chime ${diff >= 0 ? "+" : ""}${diff.toFixed(0)}ms relative to logo half-visible`);
process.exit(Math.abs(diff) < 400 ? 0 : 1);
