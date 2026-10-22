// remark-math treats $$...$$ on one line as inline math: the equation renders small, inside the
// paragraph, with no error. Display math needs $$ on lines of its own. Fails on any single-line
// $$...$$ outside fenced code in a post.
import { readdirSync, readFileSync } from "node:fs";

const dir = new URL("../content/posts/", import.meta.url);
let bad = 0;
for (const f of readdirSync(dir).filter((f) => /\.(md|markdown)$/.test(f))) {
  let fence = false;
  readFileSync(new URL(f, dir), "utf8").split("\n").forEach((l, i) => {
    if (l.startsWith("```")) fence = !fence;
    else if (!fence && /^\$\$.+\$\$\s*$/.test(l)) { console.log(`FAIL ${f}:${i + 1} single-line $$...$$ renders inline; put $$ on their own lines`); bad++; }
  });
}
console.log(bad ? `${bad} single-line display equations` : "ok   no single-line display equations");
process.exit(bad ? 1 : 0);
