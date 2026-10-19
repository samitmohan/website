// Drives every route in a real browser: asserts the status, collects console
// errors, and screenshots each page at desktop and phone widths.
//
//   node scripts/smoke.mjs [baseUrl] [outDir] [--reduced] [route ...]
//
// Exits non-zero if any route returns an unexpected status or logs an error.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const reduced = args.includes("--reduced");
const pos = args.filter((a) => !a.startsWith("--"));
const base = pos[0] ?? "http://localhost:3210";
const out = pos[1] ?? "shots";
const routes = pos.length > 2 ? pos.slice(2) : ["/", "/mocks/a", "/mocks/b", "/mocks/c"];

mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const sizes = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } };
let failed = 0;

for (const route of routes) {
  for (const [name, viewport] of Object.entries(sizes)) {
    const page = await browser.newPage({ viewport, reducedMotion: reduced ? "reduce" : "no-preference" });
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    const res = await page.goto(base + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(3500); // let reveals and typing settle
    const file = path.join(out, `${route.replace(/\W+/g, "_") || "_"}-${name}${reduced ? "-reduced" : ""}.png`);
    await page.screenshot({ path: file, fullPage: true });
    const ok = res?.status() === 200 && errors.length === 0;
    if (!ok) failed++;
    console.log(`${ok ? "ok  " : "FAIL"} ${res?.status()} ${route} ${name}${errors.length ? "\n     " + errors.join("\n     ") : ""}`);
    await page.close();
  }
}

await browser.close();
process.exit(failed ? 1 : 0);
