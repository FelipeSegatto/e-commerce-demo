import { chromium } from "playwright";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.setDefaultTimeout(15000);
const base = process.env.DEMO_BASE_URL || "http://localhost:3000";
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
async function go(path) {
  await page.goto(base + path);
  await page
    .locator('[data-demo-state="ready"]')
    .waitFor({ state: "attached" });
}
try {
  await go("/");
  assert.equal(await page.locator(".home-curation .product-card").count(), 8);
  assert.equal(await page.locator(".home-shelf .product-card").count(), 12);
  assert.equal(await page.locator(".editorial-product").count(), 3);
  const banners = await page
    .locator(
      ".hero-art img,.offers-visual img,.personal-art img,.editorial-feature img",
    )
    .evaluateAll((images) => images.map((i) => i.src));
  assert.equal(banners.length, 4);
  assert.equal(new Set(banners).size, 4);
  assert.equal(
    await page.locator('a[href="/admin"],a[href="/vendedor"]').count(),
    0,
  );
  assert.equal(await page.locator(".mode-switcher").count(), 1);
  const trigger = page.locator(".mode-switcher summary");
  await trigger.focus();
  await page.keyboard.press("Enter");
  await page.locator(".mode-panel").waitFor();
  await page.keyboard.press("Escape");
  assert.equal(await page.locator(".mode-switcher").getAttribute("open"), null);
  assert.equal(
    await trigger.evaluate((e) => e === document.activeElement),
    true,
  );
  await trigger.click();
  await page
    .getByRole("heading", { name: "Escolhidos para encantar." })
    .click();
  assert.equal(await page.locator(".mode-switcher").getAttribute("open"), null);
  await trigger.click();
  await page.getByRole("button", { name: /Administrador/ }).click();
  await page.waitForURL("**/admin");
  assert.match(await trigger.getAttribute("aria-label"), /Administrador/);
  await trigger.click();
  await page.getByRole("button", { name: /Vendedor/ }).click();
  await page.waitForURL("**/vendedor");
  assert.match(await trigger.getAttribute("aria-label"), /Vendedor/);
  await trigger.click();
  await page.getByRole("button", { name: /Loja Descobrir/ }).click();
  await page.waitForURL(base + "/");
  const rail = page.locator(".product-shelf").first();
  assert.ok((await rail.evaluate((e) => e.scrollLeft)) <= 2);
  await page
    .getByRole("button", { name: "Próximos produtos: Um carinho até R$ 75." })
    .click();
  await page.waitForFunction(
    () => document.querySelector(".product-shelf").scrollLeft > 100,
  );
  await page.locator("img").evaluateAll((images) =>
    Promise.all(
      images.map(async (i) => {
        i.loading = "eager";
        await i.decode();
      }),
    ),
  );
  await page.screenshot({
    path: "/tmp/home-merch-desktop.png",
    fullPage: true,
  });
  await trigger.click();
  await page.locator(".mode-panel").screenshot({ path: "/tmp/mode-panel.png" });
  await page.keyboard.press("Escape");
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await go("/");
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      "home overflow " + width,
    );
    await trigger.click();
    await page.locator(".mode-panel").waitFor();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      "mode overflow " + width,
    );
    await page.keyboard.press("Escape");
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "/tmp/home-merch-mobile.png", fullPage: true });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: 24 curated products, unique banner photos, scrolling shelves, single mode switcher, keyboard/outside close, three mode routes, and 320/390/768px layouts.",
  );
} finally {
  await browser.close();
}
