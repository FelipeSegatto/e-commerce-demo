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
const links = new Set();
async function collect() {
  for (const href of await page
    .locator("a[href]")
    .evaluateAll((a) => a.map((a) => a.getAttribute("href")))) {
    assert.ok(href && href !== "#", "Empty anchor");
    if (href.startsWith("/")) links.add(href);
  }
}
async function go(path) {
  assert.equal((await page.goto(base + path)).status(), 200, path);
  await page
    .locator('[data-demo-state="ready"]')
    .waitFor({ state: "attached" });
  await page
    .locator(`[data-demo-page="${path.split("?")[0]}"]`)
    .waitFor({ state: "attached" });
}
try {
  await go("/");
  await collect();
  const present = page.getByRole("button", { name: "Presentes", exact: false });
  await present.hover();
  await page.locator("#gift-mega-panel").waitFor();
  await present.click();
  assert.equal(await present.getAttribute("aria-expanded"), "true");
  await collect();
  await present.click();
  await page.locator("#gift-mega-panel").waitFor({ state: "detached" });
  await page.getByRole("button", { name: "Por ocasião", exact: false }).click();
  await collect();
  await page
    .locator("#gift-mega-panel")
    .getByRole("link", { name: "Casa nova", exact: true })
    .click();
  await page.getByLabel("Por ocasião", { exact: true }).waitFor();
  assert.equal(
    await page.getByLabel("Por ocasião", { exact: true }).inputValue(),
    "Casa nova",
  );
  await go("/");
  for (const selector of [
    ".offers-banner .button",
    ".personal-banner .button",
    ".home-curation .text-link",
    ".editorial-feature .text-link",
  ]) {
    await page.locator(selector).click();
    await page.locator(".catalog-results").waitFor();
    await go("/");
  }
  assert.equal(
    await page
      .locator(".product-photo-contained")
      .first()
      .evaluate((i) => getComputedStyle(i).objectFit),
    "contain",
  );
  assert.equal(
    await page
      .locator(".personal-art img")
      .evaluate((i) => getComputedStyle(i).objectFit),
    "contain",
  );
  await page.locator("img").evaluateAll((images) =>
    Promise.all(
      images.map(async (i) => {
        i.loading = "eager";
        await i.decode();
      }),
    ),
  );
  await page.screenshot({ path: "/tmp/nav-home.png", fullPage: true });
  await present.click();
  await page.locator("#gift-mega-panel").waitFor();
  await page.screenshot({ path: "/tmp/navbar.png" });
  await page.keyboard.press("Escape");
  const routes = [
    "/catalogo?limite=120",
    "/cupons",
    "/presentear",
    "/personalizados",
    "/favoritos",
    "/sacola",
    "/entrar",
    "/cadastro",
    "/conta",
    "/sobre",
    "/contato",
    "/politicas",
    "/admin",
    "/admin/produtos",
    "/admin/estoque",
    "/admin/pedidos",
    "/admin/financeiro",
    "/admin/equipe",
    "/admin/descontos",
    "/vendedor",
    "/vendedor/catalogo",
    "/vendedor/propostas",
    "/vendedor/nova-proposta",
  ];
  for (const path of routes) {
    await go(path);
    await collect();
  }
  const pending = [...links];
  const broken = [];
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (pending.length) {
        const href = pending.shift();
        const response = await page.request.get(base + href);
        if (response.status() !== 200)
          broken.push({ href, status: response.status() });
        const html = await response.text();
        const text = await page.evaluate((html) => {
          const doc = new DOMParser().parseFromString(html, "text/html");
          doc.querySelectorAll("script,style").forEach((e) => e.remove());
          return doc.body.textContent;
        }, html);
        if (
          /Página não encontrada|Produto não encontrado|Oferta não encontrada/.test(
            text,
          )
        )
          broken.push({ href, text: text.trim().slice(-180) });
      }
    }),
  );
  assert.deepEqual(broken, [], "Broken internal link destinations");
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await go("/");
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      "overflow " + width,
    );
    await present.click();
    await page.locator("#gift-mega-panel").waitFor();
    await page.keyboard.press("Escape");
  }
  assert.deepEqual(errors, []);
  console.log(
    `PASS: ${links.size} internal links from home, both dropdowns, full catalog and 23 pages; real banner clicks, hover then click, repeated toggle, occasion filters, contain framing and mobile navigation.`,
  );
} finally {
  await browser.close();
}
