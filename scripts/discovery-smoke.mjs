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
  await page
    .locator(`[data-demo-page="${path.split("?")[0]}"]`)
    .waitFor({ state: "attached" });
}
try {
  await go("/catalogo");
  await page.getByText("93 presentes encontrados", { exact: true }).waitFor();
  assert.equal(await page.locator(".product-card").count(), 12);
  await page.getByRole("button", { name: /Carregar mais/ }).click();
  await page.waitForFunction(
    () => document.querySelectorAll(".product-card").length === 24,
  );
  await page.reload();
  await page.waitForFunction(
    () => document.querySelectorAll(".product-card").length === 24,
  );
  await page
    .getByLabel("Filtrar produtos", { exact: true })
    .fill("locao facial protective");
  await page.getByText("1 presentes encontrados", { exact: true }).waitFor();
  await page.reload();
  await page.getByText("1 presentes encontrados", { exact: true }).waitFor();
  await go("/catalogo?tema=casa");
  assert.ok(
    (await page.locator(".collection-coupon").textContent()).includes("CASA15"),
  );
  await go("/produto/baloes-metalizados");
  await page.getByRole("button", { name: "Rosé", exact: true }).click();
  assert.match(
    await page.locator(".detail-image img").getAttribute("src"),
    /baloes-giftstore-6/,
  );
  await page.getByRole("button", { name: "Dourado", exact: true }).click();
  assert.match(
    await page.locator(".detail-image img").getAttribute("src"),
    /baloes-giftstore-7/,
  );
  await go("/produto/almofada-branca-com-pompons");
  const photo = page.locator(".detail-image img");
  assert.match(await photo.getAttribute("src"), /\.webp$/);
  await photo.evaluate((i) => i.decode());
  await page
    .locator(".detail-copy")
    .getByRole("button", { name: "Adicionar à sacola", exact: true })
    .click();
  await go("/sacola");
  await page.getByLabel("Cupom de desconto").fill("CASA15");
  await page.getByRole("button", { name: "Aplicar", exact: true }).click();
  // Two units meet this campaign's minimum without discounting shipping.
  if ((await page.getByText("CASA15 (15%)", { exact: true }).count()) === 0) {
    await page.getByRole("button", { name: /Aumentar/ }).click();
    await page.getByRole("button", { name: "Aplicar", exact: true }).click();
  }
  await page.getByText("CASA15 (15%)", { exact: true }).waitFor();
  await page.getByRole("link", { name: "Continuar para checkout" }).click();
  await page.getByText("Cupom CASA15", { exact: true }).waitFor();
  await page.getByLabel("Nome para o pedido").fill("Teste de cupom");
  await page.getByLabel("E-mail demonstrativo").fill("demo@example.com");
  for (let i = 0; i < 4; i++)
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page
    .getByRole("checkbox", {
      name: "Entendo que este é um pedido demonstrativo.",
    })
    .check();
  await page.getByRole("button", { name: "Concluir simulação" }).click();
  await page
    .getByRole("heading", { name: "Um presente, muitas possibilidades." })
    .waitFor();
  const order = await page.evaluate(
    () => JSON.parse(localStorage.getItem("gift-store-demo-v1")).orders[0],
  );
  assert.equal(order.coupon, "CASA15");
  assert.ok(order.discount > 0);
  await go("/");
  const search = page.getByRole("combobox", { name: "Buscar presentes" });
  await search.fill("karite");
  await page.getByRole("option").first().waitFor();
  await search.press("ArrowDown");
  await search.press("Enter");
  await page.waitForURL("**/produto/balsamo-labial-karite");
  assert.deepEqual(errors, []);
  console.log(
    "PASS: pagination, URL persistence, accent search, themed browsing, variant photos, WebP, themed coupon checkout and keyboard suggestions.",
  );
} finally {
  await browser.close();
}
