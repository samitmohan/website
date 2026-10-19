// Exercises the interactive pieces in a real browser against the static export.
//
//   npx serve out -l 3211 &
//   node scripts/interact.mjs [baseUrl]
//
// Each check prints ok/FAIL; the script exits non-zero if any fail.
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3211";
const browser = await chromium.launch();
let failed = 0;

async function check(name, fn, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  try {
    const detail = await fn(page);
    if (errors.length) throw new Error(errors.join("; "));
    console.log(`ok   ${name}${detail ? ` (${detail})` : ""}`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${name}: ${e.message.split("\n")[0]}`);
  }
  await ctx.close();
}

const expect = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

await check("double-click switches theme and it survives a reload", async (page) => {
  await page.goto(base + "/about");
  const before = await page.evaluate(() => matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  await page.mouse.dblclick(1300, 600);
  await page.waitForTimeout(800);
  const after = await page.getAttribute("html", "data-theme");
  expect(after && after !== before, `theme stayed ${before}`);
  await page.reload();
  const persisted = await page.getAttribute("html", "data-theme");
  expect(persisted === after, `reload gave ${persisted}`);
  return `${before} -> ${after}`;
});

await check("widget mounts after client-side navigation", async (page) => {
  await page.goto(base + "/blog");
  await page.click('a[href="/blog/microgpt"]');
  await page.waitForURL("**/blog/microgpt");
  const root = page.locator("#microgpt-stepper");
  await root.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => (document.getElementById("microgpt-stepper")?.children.length ?? 0) > 0, null, { timeout: 5000 });
  return `${await root.locator("*").count()} nodes`;
});

await check("project card opens its write-up", async (page) => {
  await page.goto(base + "/projects");
  await page.waitForTimeout(1200);
  await page.locator("button", { hasText: "minitorch" }).first().click();
  const dialog = page.getByRole("dialog", { name: "minitorch" });
  await dialog.waitFor({ timeout: 3000 });
  const fade = await page.evaluate(() => document.documentElement.hasAttribute("data-write-up-open"));
  expect(fade, "chrome did not fade");
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "detached", timeout: 3000 });
});

await check("book opens a flipbook and pages turn", async (page) => {
  await page.goto(base + "/shelf");
  await page.waitForTimeout(1200);
  await page.locator('button[title^="Attention Is All You Need"]').click();
  const dialog = page.getByRole("dialog", { name: "Attention Is All You Need" });
  await dialog.waitFor({ timeout: 3000 });
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(1400);
  const text = await dialog.innerText();
  expect(text.includes("1 / 2"), `page counter missing: ${text.slice(0, 60)}`);
});

await check("rubbing a negative develops it", async (page) => {
  await page.goto(base + "/photos");
  await page.waitForTimeout(1500);
  const frame = page.locator("figure button").first();
  const box = await frame.boundingBox();
  for (let y = box.y + 8; y < box.y + box.height; y += 18) {
    await page.mouse.move(box.x + 4, y);
    await page.mouse.move(box.x + box.width - 4, y, { steps: 12 });
  }
  await page.waitForTimeout(300);
  const label = await page.locator("figure figcaption").first().innerText();
  expect(label.includes("developed"), `still "${label}"`);
});

await check(
  "reduced motion shows the finished bio immediately",
  async (page) => {
    await page.goto(base + "/");
    await page.waitForTimeout(300);
    const struck = await page.locator("p span[aria-hidden] span.text-muted").count();
    expect(struck === 2, `expected 2 struck words, saw ${struck}`);
  },
  { reducedMotion: "reduce" },
);

await browser.close();
process.exit(failed ? 1 : 0);
