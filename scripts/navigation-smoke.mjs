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
  const nav = page.getByRole("navigation", { name: "Navegação da loja" });
  await nav.getByRole("link", { name: "Presentes", exact: true }).click();
  await page.waitForURL(base + "/catalogo");
  await nav.getByRole("link", { name: "Por ocasião", exact: true }).click();
  await page.waitForURL(base + "/presentear");
  for (const category of [
    "Perfumes",
    "Chocolates",
    "Casa & decoração",
    "Flores & buquês",
  ]) {
    await nav.getByRole("link", { name: category, exact: true }).click();
    await page.waitForURL(
      (url) =>
        url.pathname === "/catalogo" &&
        url.searchParams.get("categoria") === category,
    );
    await page.locator(".catalog-results").waitFor();
    assert.ok(
      (await page.locator(".catalog-results").innerText()).includes(category),
    );
  }
  await go("/");
  const homeCategories = await page
    .locator(".category-card")
    .evaluateAll((links) =>
      links.map((a) => ({
        name: a.querySelector("span:nth-child(2)").textContent,
        href: a.getAttribute("href"),
      })),
    );
  for (const category of homeCategories) {
    await page.locator(`.category-card[href="${category.href}"]`).click();
    await page.waitForURL(
      (url) => url.searchParams.get("categoria") === category.name,
    );
    await page.locator(".catalog-results").waitFor();
    await go("/");
  }
  await collect();
  const present = page.getByRole("button", {
    name: "Abrir coleções de presentes",
    exact: false,
  });
  await present.hover();
  await page.locator("#gift-mega-panel").waitFor();
  await present.click();
  assert.equal(await present.getAttribute("aria-expanded"), "true");
  await collect();
  await present.click();
  await page.locator("#gift-mega-panel").waitFor({ state: "detached" });
  await page
    .getByRole("button", { name: "Abrir ocasiões", exact: false })
    .click();
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
  await page
    .getByRole("button", { name: "Abrir coleções de presentes" })
    .hover();
  await page
    .getByRole("link", { name: "Com a sua mensagem", exact: true })
    .click();
  await page.waitForURL(
    (url) => url.pathname === "/catalogo" && url.searchParams.get("personalizados") === "1",
  );
  assert.equal(
    await page.getByLabel("Com personalização", { exact: true }).isChecked(),
    true,
  );
  assert.ok(await page.locator(".product-card").count() > 0);
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
