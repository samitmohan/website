// Extracts the `const DATA = [...]` array out of ml-interview-guide.html
// and writes it to web/lib/learning-data.json (the Learning tab's source
// of truth). Run from repo root: node scripts/extract-learning-data.mjs
//
// Warning: web/lib/learning-data.json has hand-added Q&A entries beyond
// what's in the HTML source. Re-running this script overwrites them —
// only run it if you're intentionally re-syncing from the HTML guide.
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const htmlPath = path.join(repoRoot, "ml-interview-guide.html");
const outPath = path.join(repoRoot, "web/lib/learning-data.json");

const html = fs.readFileSync(htmlPath, "utf8");
const scriptContent = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</script>"));
const start = scriptContent.indexOf("const DATA = [");

let depth = 0;
let inStr = false;
let strChar = "";
let escape = false;
let i = start + "const DATA = ".length;
for (; i < scriptContent.length; i++) {
  const c = scriptContent[i];
  if (escape) {
    escape = false;
    continue;
  }
  if (c === "\\") {
    escape = true;
    continue;
  }
  if (inStr) {
    if (c === strChar) inStr = false;
    continue;
  }
  if (c === "'" || c === '"' || c === "`") {
    inStr = true;
    strChar = c;
    continue;
  }
  if (c === "[" || c === "{") depth++;
  else if (c === "]" || c === "}") {
    depth--;
    if (depth === 0) {
      i++;
      break;
    }
  }
}

const dataDef = scriptContent.slice(start, i).replace("const DATA", "DATA");
const ctx = vm.createContext({ console });
vm.runInContext(dataDef, ctx);
const DATA = ctx.DATA;

const sections = DATA.filter((s) => s.title !== "16. Interactive Demos");
sections.forEach((s) => {
  delete s.icon;
  if (s.subs) s.subs.forEach((sub) => sub.qs.forEach((q) => delete q.id));
});

fs.writeFileSync(outPath, JSON.stringify(sections, null, 2));
console.log(`Wrote ${sections.length} sections to ${path.relative(repoRoot, outPath)}`);
