// Median Lighthouse numbers over N runs (single runs are noisy).
// Usage: node scripts/lh-median.mjs <base url> <runs> <route> [route...]
import { execFileSync } from "node:child_process";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const [base, runs, ...routes] = process.argv.slice(2);
const dir = mkdtempSync(path.join(tmpdir(), "lh-"));
const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
for (const r of routes) {
  const rows = [];
  for (let i = 0; i < Number(runs); i++) {
    const out = path.join(dir, `r${i}.json`);
    execFileSync("npx", ["-y", "lighthouse@12", base + r, "--quiet", "--only-categories=performance", "--throttling-method=devtools", "--chrome-flags=--headless=new", "--output=json", `--output-path=${out}`], { stdio: "ignore" });
    const d = JSON.parse(readFileSync(out, "utf8"));
    rows.push({ perf: d.categories.performance.score * 100, fcp: d.audits["first-contentful-paint"].numericValue, lcp: d.audits["largest-contentful-paint"].numericValue, tbt: d.audits["total-blocking-time"].numericValue, kb: d.audits["total-byte-weight"].numericValue / 1024 });
  }
  const m = (k) => Math.round(med(rows.map((x) => x[k])));
  console.log(`${r.padEnd(18)} perf ${m("perf")}  FCP ${m("fcp")}ms  LCP ${m("lcp")}ms  TBT ${m("tbt")}ms  ${m("kb")} KB`);
}
