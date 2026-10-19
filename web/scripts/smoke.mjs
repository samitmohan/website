// Drives every route in a real browser: asserts the status, collects console
// errors, and screenshots each page at desktop and phone widths.
//
//   node scripts/smoke.mjs [baseUrl] [outDir] [--reduced] [--dark] [route ...]
//
// Point it at the static export (`npx serve out -l 3211`), not `next dev`:
// the /_img/ responsive variants only exist after `npm run build`.
//
// Exits non-zero if any route returns an unexpected status or logs an error.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const reduced = args.includes("--reduced");
const dark = args.includes("--dark");
const pos = args.filter((a) => !a.startsWith("--"));
const base = pos[0] ?? "http://localhost:3210";
const out = pos[1] ?? "shots";
// With no routes given, test every URL in the site's own sitemap.
const routes =
  pos.length > 2
    ? pos.slice(2)
    : [...(await (await fetch(base + "/sitemap.xml")).text()).matchAll(/<loc>https?:\/\/[^/<]+(\/[^<]*)?<\/loc>/g)].map((m) => m[1] || "/");

mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const sizes = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } };
let failed = 0;

for (const route of routes) {
  for (const [name, viewport] of Object.entries(sizes)) {
    const page = await browser.newPage({ viewport, reducedMotion: reduced ? "reduce" : "no-preference", colorScheme: dark ? "dark" : "light" });
    const errors = [];
    // Resource 404s are reported by URL below, so the console's URL-less copy is dropped.
    page.on("console", (m) => m.type() === "error" && !m.text().startsWith("Failed to load resource") && errors.push(m.text()));
    page.on("response", (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
    page.on("pageerror", (e) => errors.push(e.message));
    const res = await page.goto(base + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(3500); // let reveals and typing settle
    const file = path.join(out, `${route.replace(/\W+/g, "_") || "_"}-${name}${reduced ? "-reduced" : ""}${dark ? "-dark" : ""}.png`);
    await page.screenshot({ path: file, fullPage: true });
    const ok = res?.status() === 200 && errors.length === 0;
    if (!ok) failed++;
    console.log(`${ok ? "ok  " : "FAIL"} ${res?.status()} ${route} ${name}${errors.length ? "\n     " + errors.join("\n     ") : ""}`);
    await page.close();
  }
}

await browser.close();
process.exit(failed ? 1 : 0);
