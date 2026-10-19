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

await check("deck: a card turns over, shuffle deals a new hand", async (page) => {
  await page.goto(base + "/things");
  const deck = page.getByRole("heading", { name: "Things I like" });
  await deck.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: /card 1, face down/ }).click();
  await page.waitForTimeout(700);
  const first = await page.locator(".deck-card[aria-label]").first().getAttribute("aria-label");
  expect(first && !first.includes("face down"), `card did not turn over: ${first}`);
  await page.getByRole("button", { name: "shuffle" }).click();
  await page.waitForTimeout(2400);
  const down = await page.getByRole("button", { name: /face down/ }).count();
  expect(down === 7, `expected a fresh face-down hand of 7, saw ${down}`);
  return `"${first}"`;
});

await check("pick a card shows one with its caption", async (page) => {
  await page.goto(base + "/things");
  await page.getByRole("heading", { name: "Things I like" }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "pick a card" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ timeout: 3000 });
  return `"${await dialog.getAttribute("aria-label")}"`;
});

await check("gallery: a record opens, tracks change the photo", async (page) => {
  await page.goto(base + "/things");
  await page.getByRole("button", { name: /^Open Goa/ }).click();
  const dialog = page.getByRole("dialog", { name: "Goa" });
  await dialog.waitFor({ timeout: 3000 });
  const big = () => dialog.locator("figure img").getAttribute("src");
  const before = await big();
  await dialog.locator("ol button").nth(2).click();
  await page.waitForTimeout(300);
  const after = await big();
  expect(before !== after, "photo did not change with the track");
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "detached", timeout: 3000 });
});

await check("footer garden grows under the pointer and clears", async (page) => {
  await page.goto(base + "/about");
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  const canvas = page.locator("footer canvas");
  const box = await canvas.boundingBox();
  const ink = () => canvas.evaluate((c) => {
    const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    let n = 0;
    for (let i = 3; i < d.length; i += 16) if (d[i] > 0) n++;
    return n;
  });
  const sticker = await ink();
  for (let k = 0; k < 24; k++) await page.mouse.move(box.x + 60 + k * 30, box.y + 40 + (k % 5) * 30, { steps: 3 });
  await page.waitForTimeout(1200);
  const grown = await ink();
  expect(grown > sticker * 1.1, `no growth: ${sticker} -> ${grown}`);
  await page.getByRole("button", { name: "clear" }).click();
  await page.waitForTimeout(200);
  const cleared = await ink();
  expect(cleared === sticker, `clear left ${cleared - sticker} extra pixels`);
  return `${sticker} -> ${grown} -> ${cleared}`;
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

await check("things I like cards are the post's own bullets", async (page) => {
  const reader = await page.context().newPage();
  await reader.goto(base + "/blog/things-i-like");
  const post = await reader.locator(".prose").innerText();
  const bullets = await reader.locator(".prose li").count();
  await reader.close();
  await page.goto(base + "/things");
  await page.getByRole("heading", { name: "Things I like" }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  const seen = new Set();
  for (let r = 0; r < Math.ceil(bullets / 7); r++) {
    for (const t of await page.locator(".deck-card p").allInnerTexts()) {
      expect(post.includes(t), `card text not in the post: "${t}"`);
      seen.add(t);
    }
    await page.getByRole("button", { name: "shuffle" }).click();
    await page.waitForTimeout(2400);
  }
  expect(seen.size === bullets, `saw ${seen.size} of ${bullets} bullets across the deck`);
  return `${seen.size}/${bullets} cards, all verbatim`;
});

await check(
  "reduced motion shows the finished bio immediately",
  async (page) => {
    await page.goto(base + "/");
    await page.waitForTimeout(300);
    const typed = await page.locator("p span[aria-hidden].absolute").first().innerText();
    expect(typed.includes("300 cameras 24/7."), `bio not finished: "${typed}"`);
  },
  { reducedMotion: "reduce" },
);

await browser.close();
process.exit(failed ? 1 : 0);
