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
  const before = await page.getAttribute("html", "data-theme");
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

await check("home widget responds: softmax temperature flattens the bars", async (page) => {
  await page.goto(base + "/");
  await page.getByRole("heading", { name: "Widgets" }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  const toy = page.locator("figure:has(input[type=range])").first();
  const top = () => toy.locator("span.font-mono").first().innerText();
  const before = await top();
  await toy.locator('input[type="range"]').fill("4");
  await page.waitForTimeout(300);
  const after = await top();
  expect(parseInt(after) < parseInt(before), `top prob ${before} -> ${after}`);
  return `${before} -> ${after}`;
});

await check("home: post widget opens in a sheet and mounts", async (page) => {
  await page.goto(base + "/");
  await page.getByRole("heading", { name: "Widgets" }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  const row = page.locator("figure").first().locator("xpath=..");
  await row.evaluate((r) => (r.scrollLeft = r.scrollWidth));
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: /open it/ }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ timeout: 3000 });
  await page.waitForFunction(() => (document.querySelector('[role="dialog"] [id]')?.children.length ?? 0) > 0, null, { timeout: 5000 });
});

await check("deck: clicking a card turns it over and opens its photo; shuffle deals a new hand", async (page) => {
  await page.goto(base + "/things");
  await page.getByRole("heading", { name: "Things I like" }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: /card 7, face down/ }).click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ timeout: 3000 });
  const name = await dialog.getAttribute("aria-label");
  // The opened card's face is the thing's photo, and it must actually load.
  const img = dialog.locator(".deck-card--big img");
  await img.evaluate((el) => (el.complete ? null : new Promise((r) => (el.onload = el.onerror = r))));
  const w = await img.evaluate((el) => el.naturalWidth);
  expect(w > 0, `opened card photo did not load (${await img.getAttribute("src")})`);
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "detached", timeout: 3000 });
  await page.getByRole("button", { name: "shuffle" }).click();
  await page.waitForTimeout(2400);
  const down = await page.getByRole("button", { name: /face down/ }).count();
  expect(down === 7, `expected a fresh face-down hand of 7, saw ${down}`);
  return `"${name}"`;
});

await check("pick a card shows one with its caption", async (page) => {
  await page.goto(base + "/things");
  await page.getByRole("heading", { name: "Things I like" }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "pick a card" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ timeout: 3000 });
  // The backdrop must cover the whole viewport, not just the section it lives in.
  const cover = await dialog.evaluate((d) => {
    const r = d.parentElement.getBoundingClientRect();
    return [Math.round(r.width), innerWidth, Math.round(r.height), innerHeight];
  });
  expect(cover[0] === cover[1] && cover[2] === cover[3], `backdrop ${cover[0]}x${cover[2]} in a ${cover[1]}x${cover[3]} viewport`);
  return `"${await dialog.getAttribute("aria-label")}"`;
});

await check("gallery: a memory-card save opens and pages through photos", async (page) => {
  await page.goto(base + "/things");
  await page.getByRole("button", { name: "Start the memory card" }).click();
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: "Skip to the memory card" }).click();
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: /^Goa, .* Open\.$/ }).click();
  const dialog = page.getByRole("dialog", { name: "Goa" });
  await dialog.waitFor({ timeout: 3000 });
  await page.waitForTimeout(900); // the loading bar
  const shown = () => dialog.locator("img").getAttribute("src");
  const before = await shown();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(300);
  const after = await shown();
  expect(before && after && before !== after, `photo did not change: ${before} -> ${after}`);
  // The on-screen controller buttons work too, and the viewer covers the whole viewport.
  const cover = await dialog.evaluate((d) => [Math.round(d.getBoundingClientRect().width), innerWidth]);
  expect(cover[0] === cover[1], `viewer ${cover[0]}px wide in a ${cover[1]}px viewport`);
  await dialog.getByRole("button", { name: /next/ }).click();
  await page.waitForTimeout(300);
  expect((await shown()) !== after, "the next button did nothing");
  await dialog.getByRole("button", { name: /back a photo/ }).click();
  await page.waitForTimeout(300);
  expect((await shown()) === after, "the back-a-photo button did nothing");
  await dialog.getByRole("button", { name: /^back$/ }).click();
  await dialog.waitFor({ state: "detached", timeout: 3000 });
  // Dashboard hints: enter opens the selected save, back powers off.
  await page.getByRole("group", { name: "Memory card" }).getByRole("button", { name: /enter/ }).click();
  await page.getByRole("dialog").waitFor({ timeout: 3000 });
  await page.keyboard.press("Escape");
  await page.getByRole("group", { name: "Memory card" }).getByRole("button", { name: /^back$/ }).click();
  await page.getByRole("button", { name: "Start the memory card" }).waitFor({ timeout: 3000 });
});

await check("footer garden grows under the pointer and clears", async (page) => {
  await page.goto(base + "/about");
  // Instant: the site's CSS smooth scrolling would otherwise still be gliding when the baseline is read.
  await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  const canvas = page.locator("footer canvas");
  const box = await canvas.boundingBox();
  // Pixels that are not the background colour (sampled at the corner): sticker plus growth.
  const ink = () => canvas.evaluate((c) => {
    const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    const [r, g, b] = [d[0], d[1], d[2]];
    let n = 0;
    for (let i = 0; i < d.length; i += 16) if (Math.abs(d[i] - r) + Math.abs(d[i + 1] - g) + Math.abs(d[i + 2] - b) > 30) n++;
    return n;
  });
  const sticker = await ink();
  for (let k = 0; k < 24; k++) await page.mouse.move(box.x + 60 + k * 30, box.y + 40 + (k % 5) * 30, { steps: 3 });
  await page.waitForTimeout(1200);
  const grown = await ink();
  expect(grown > sticker * 1.1, `no growth: ${sticker} -> ${grown}`);
  await page.getByRole("radio", { name: "jacaranda" }).click();
  await page.waitForTimeout(700); // the band fades over 500ms
  const bg = await page.locator("footer").evaluate((f) => getComputedStyle(f).backgroundColor);
  expect(bg === "rgb(239, 234, 246)", `palette did not repaint the band: ${bg}`);
  await page.getByRole("button", { name: "clear" }).click();
  await page.waitForTimeout(300);
  const cleared = await ink();
  expect(cleared <= sticker * 1.02, `clear left growth behind: ${sticker} vs ${cleared}`);
  return `${sticker} -> ${grown} -> ${cleared}`;
});

await check("first visit is dark; the double-click note shows and retires after a flip", async (page) => {
  await page.goto(base + "/about");
  const theme = () => page.getAttribute("html", "data-theme");
  expect((await theme()) === "dark", `first visit on a light-mode OS got ${await theme()}`);
  const note = page.getByText("double-click anywhere to flip black and white");
  await page.waitForTimeout(400);
  const shown = await note.evaluate((el) => +getComputedStyle(el).opacity);
  expect(shown === 1, `note opacity ${shown} on a first visit`);
  await page.mouse.dblclick(1200, 300);
  await page.waitForTimeout(900);
  expect((await theme()) === "light", "double-click did not flip to light");
  await page.reload();
  await page.waitForTimeout(400);
  const after = await note.evaluate((el) => +getComputedStyle(el).opacity);
  expect(after === 0 && (await theme()) === "light", `after a flip: note ${after}, theme ${await theme()}`);
  return "dark -> light, note retired";
}, { colorScheme: "light" });

await check("left rail: a colour changes the accent and it survives a reload", async (page) => {
  await page.goto(base + "/about");
  const accent = () => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim());
  const before = await accent();
  await page.getByRole("button", { name: "colour and light switches" }).click();
  await page.waitForTimeout(600);
  await page.getByRole("radio", { name: "site colour: light green" }).click();
  const after = await accent();
  expect(after !== before, `accent stayed ${before}`);
  await page.reload();
  expect((await page.getAttribute("html", "data-accent")) === "light-green", "accent not restored on reload");
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
