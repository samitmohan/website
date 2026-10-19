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

await check("lab toy responds: softmax temperature flattens the bars", async (page) => {
  await page.goto(base + "/things");
  await page.waitForTimeout(1200);
  const top = () => page.locator("figure").first().locator("span.font-mono").first().innerText();
  const before = await top();
  await page.locator('figure input[type="range"]').first().fill("4");
  await page.waitForTimeout(300);
  const after = await top();
  expect(parseInt(after) < parseInt(before), `top prob ${before} -> ${after}`);
  return `${before} -> ${after}`;
});

await check("post widget opens in a sheet and mounts", async (page) => {
  await page.goto(base + "/things");
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: /open it/ }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ timeout: 3000 });
  await page.waitForFunction(() => (document.querySelector('[role="dialog"] [id]')?.children.length ?? 0) > 0, null, { timeout: 5000 });
});

await check("shuffle swaps the things in the vicinity", async (page) => {
  await page.goto(base + "/things");
  await page.waitForTimeout(1200);
  const titles = () => page.locator("[data-thing] [title]").evaluateAll((els) => els.map((e) => e.getAttribute("title")).join("|"));
  const before = await titles();
  await page.getByRole("button", { name: "shuffle" }).click();
  await page.waitForTimeout(400);
  expect((await titles()) !== before, "same six things after shuffle");
});

await check("rubbing a negative develops it", async (page) => {
  await page.goto(base + "/things");
  const frame = page.getByRole("button", { name: /Open frame/ }).first();
  await frame.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  const box = await frame.boundingBox();
  // Hovering alone must not develop anything.
  await page.mouse.move(box.x + 2, box.y + 10);
  await page.mouse.move(box.x + box.width - 2, box.y + box.height - 10, { steps: 30 });
  await page.waitForTimeout(300);
  const untouched = await frame.locator("canvas").evaluate((c) => getComputedStyle(c).opacity);
  expect(untouched === "1", `hover developed the frame (opacity ${untouched})`);
  // Pressing and dragging does.
  await page.mouse.move(box.x + 2, box.y + 6);
  await page.mouse.down();
  for (let y = box.y + 6; y < box.y + box.height; y += 12) {
    await page.mouse.move(box.x + 2, y, { steps: 3 });
    await page.mouse.move(box.x + box.width - 2, y, { steps: 14 });
  }
  await page.mouse.up();
  await page.waitForTimeout(1200);
  const opacity = await frame.locator("canvas").evaluate((c) => getComputedStyle(c).opacity);
  expect(opacity === "0", `negative opacity still ${opacity}`);
});

await check("footer swatch changes the accent and it survives a reload", async (page) => {
  await page.goto(base + "/about");
  const accent = () => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim());
  const before = await accent();
  await page.getByRole("radio", { name: "green" }).click();
  const after = await accent();
  expect(after !== before, `accent stayed ${before}`);
  await page.reload();
  expect((await page.getAttribute("html", "data-accent")) === "green", "accent not restored on reload");
  return `${before} -> ${after}`;
});

await check("things I like captions are the post's own bullets", async (page) => {
  await page.goto(base + "/things");
  await page.waitForTimeout(1200);
  const reader = await page.context().newPage();
  await reader.goto(base + "/blog/things-i-like");
  const post = await reader.locator(".prose").innerText();
  const bullets = await reader.locator(".prose li").count();
  await reader.close();
  const seen = new Set();
  for (let r = 0; r < 8; r++) {
    for (const t of await page.locator("[data-thing] [title]").evaluateAll((els) => els.map((e) => e.getAttribute("title")))) {
      expect(post.includes(t), `caption not in the post: "${t}"`);
      seen.add(t);
    }
    await page.getByRole("button", { name: "shuffle" }).click();
    await page.waitForTimeout(150);
  }
  expect(seen.size === bullets, `saw ${seen.size} of ${bullets} bullets across 8 shuffles`);
  return `${seen.size}/${bullets} bullets seen, all verbatim`;
});

await check(
  "reduced motion shows the finished bio immediately",
  async (page) => {
    await page.goto(base + "/");
    await page.waitForTimeout(300);
    const typed = await page.locator("p span[aria-hidden].absolute").first().innerText();
    expect(typed.includes("watching 24/7"), `bio not finished: "${typed}"`);
  },
  { reducedMotion: "reduce" },
);

await browser.close();
process.exit(failed ? 1 : 0);
