// Mobile audit: every sitemap route at phone widths. Reports horizontal overflow,
// tap targets under 24px, text under 10px, and content clipped by the viewport edge.
// Usage: node scripts/mobile.mjs <base url> [shots dir]
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3211";
const shots = process.argv[3];
const routes = [...(await (await fetch(base + "/sitemap.xml")).text()).matchAll(/<loc>https?:\/\/[^/<]+(\/[^<]*)?<\/loc>/g)].map((m) => m[1] || "/");
const browser = await chromium.launch();
let bad = 0;
for (const width of [360, 390]) {
  const ctx = await browser.newContext({ viewport: { width, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  for (const route of routes) {
    await page.goto(base + route, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      scrollTo(0, 0);
    });
    await page.waitForTimeout(900);
    const r = await page.evaluate(() => {
      const W = document.documentElement.clientWidth;
      const out = { overflow: document.documentElement.scrollWidth - W, small: [], tiny: [], clipped: [] };
      const visible = (el) => { const s = getComputedStyle(el); const b = el.getBoundingClientRect(); return s.visibility !== "hidden" && s.display !== "none" && +s.opacity > 0.05 && b.width > 0 && b.height > 0; };
      const name = (el) => (el.getAttribute("aria-label") || el.textContent || el.tagName).trim().slice(0, 40);
      const inScroller = (el) => { for (let p = el.parentElement; p; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if (o === "auto" || o === "scroll" || o === "hidden") return true; } return false; };
      // WCAG 2.5.8: a target under 24px still passes if a 24px circle on its centre
      // touches no other target and no other undersized target's circle.
      const targets = [];
      for (const el of document.querySelectorAll("a, button, input, select, [role=tab], [role=radio]")) {
        if (!visible(el)) continue;
        // Links inside a sentence are exempt (the inline exception).
        const around = el.parentElement?.textContent.replace(el.textContent, "").trim() ?? "";
        if (el.tagName === "A" && getComputedStyle(el).display === "inline" && around.length > 0) continue;
        const b = el.getBoundingClientRect();
        targets.push({ el, b, cx: b.left + b.width / 2, cy: b.top + b.height / 2, small: b.width < 24 || b.height < 24 });
      }
      const gap = (t, o) => Math.hypot(Math.max(o.b.left - t.cx, 0, t.cx - o.b.right), Math.max(o.b.top - t.cy, 0, t.cy - o.b.bottom));
      for (const t of targets) {
        if (!t.small) continue;
        const crowded = targets.some((o) => o !== t && !o.el.contains(t.el) && !t.el.contains(o.el) && (o.small ? Math.hypot(o.cx - t.cx, o.cy - t.cy) < 24 : gap(t, o) < 12));
        if (crowded) out.small.push(`${name(t.el)} ${Math.round(t.b.width)}x${Math.round(t.b.height)}`);
      }
      for (const el of document.querySelectorAll("body *")) {
        if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
        if (!visible(el) || el.closest("svg, .katex")) continue;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs < 10) out.tiny.push(`${name(el)} ${fs}px`);
        const b = el.getBoundingClientRect();
        if ((b.right > W + 1 || b.left < -1) && !inScroller(el) && getComputedStyle(el).position !== "fixed") out.clipped.push(`${name(el)} [${Math.round(b.left)},${Math.round(b.right)}]`);
      }
      const uniq = (a) => [...new Set(a)];
      return { overflow: out.overflow, small: uniq(out.small), tiny: uniq(out.tiny), clipped: uniq(out.clipped) };
    });
    const issues = r.overflow > 0 || r.small.length || r.tiny.length || r.clipped.length;
    if (issues) {
      bad++;
      console.log(`${width} ${route}  overflow=${r.overflow}`);
      if (r.small.length) console.log("  small targets:", r.small.slice(0, 12).join(" | "), r.small.length > 12 ? `(+${r.small.length - 12})` : "");
      if (r.tiny.length) console.log("  tiny text:", r.tiny.slice(0, 8).join(" | "), r.tiny.length > 8 ? `(+${r.tiny.length - 8})` : "");
      if (r.clipped.length) console.log("  clipped:", r.clipped.slice(0, 8).join(" | "), r.clipped.length > 8 ? `(+${r.clipped.length - 8})` : "");
    }
    if (shots && width === 390 && !route.startsWith("/blog/")) await page.screenshot({ path: `${shots}/m390${route.replace(/\//g, "_") || "_"}.png`, fullPage: true });
  }
  await ctx.close();
}
await browser.close();
console.log(`${bad} route-widths with issues across ${routes.length} routes`);
process.exit(bad ? 1 : 0);
