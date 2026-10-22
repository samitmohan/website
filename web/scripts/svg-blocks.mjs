// A blank line inside an inline <svg> in a post ends markdown's HTML block. The next line can then
// be wrapped in a <p>, and a <p> inside an SVG closes the SVG early: everything after it silently
// disappears from the figure. Fails if any post has a blank line between <svg> and </svg>.
import { readdirSync, readFileSync } from "node:fs";

const dir = new URL("../content/posts/", import.meta.url);
let bad = 0;
for (const f of readdirSync(dir).filter((f) => /\.(md|markdown)$/.test(f))) {
  const lines = readFileSync(new URL(f, dir), "utf8").split("\n");
  let open = 0;
  lines.forEach((l, i) => {
    if (/<svg[\s>]/.test(l)) open = i + 1;
    if (open && l.trim() === "") { console.log(`FAIL ${f}:${i + 1} blank line inside <svg> opened at line ${open}`); bad++; }
    if (/<\/svg>/.test(l)) open = 0;
  });
}
console.log(bad ? `${bad} blank lines inside inline SVGs` : "ok   no blank lines inside inline SVGs");
process.exit(bad ? 1 : 0);
