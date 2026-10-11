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
page.on("pageerror", (error) => errors.push(error.message));
async function go(path) {
  await page.goto(base + path);
  await page
    .locator('[data-demo-state="ready"]')
    .waitFor({ state: "attached" });
}
try {
  await go("/admin/produtos");
  await page.evaluate(() => localStorage.clear());
  await go("/admin/produtos");
  assert.equal(
    await page.getByRole("link", { name: "Estoque", exact: true }).count(),
    0,
  );
  await page
    .getByRole("button", { name: "Editar Kit Pequenas Alegrias", exact: true })
    .click();
  await page
    .getByLabel("Nome do produto", { exact: true })
    .fill("Mudança cancelada");
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("dialog").count(), 0);
  await page
    .getByRole("button", { name: "Editar Kit Pequenas Alegrias", exact: true })
    .click();
  await page
    .getByLabel("Nome do produto", { exact: true })
    .fill("Kit editado pelo admin");
  await page.getByLabel("Preço (R$)", { exact: true }).fill("149.9");
  await page.getByLabel("Estoque", { exact: true }).fill("4");
  await page
    .getByRole("button", { name: "Salvar alterações", exact: true })
    .click();
  await page.getByText("Kit editado pelo admin", { exact: true }).waitFor();
  await go("/admin/estoque");
  assert.equal(
    await page.getByLabel("Estoque de Kit editado pelo admin").inputValue(),
    "4",
  );
  await page.getByLabel("Buscar produtos").fill("Kit editado");
  await page.getByLabel("Filtrar estoque").selectOption("Baixo estoque");
  assert.equal(await page.locator("tbody tr").count(), 1);
  await page.getByLabel("Filtrar estoque").selectOption("Sem estoque");
  assert.equal(await page.locator("tbody tr").count(), 0);
  await go("/produto/kit-pequenas-alegrias");
  await page
    .getByRole("heading", { name: "Kit editado pelo admin", exact: true })
    .waitFor();
  await go("/admin/cupons");
  await page
    .getByRole("button", { name: "Pausar cupom CASA15", exact: true })
    .click();
  await go("/cupons");
  assert.equal(
    await page.locator(".campaign-code").filter({ hasText: "CASA15" }).count(),
    0,
  );
  await go("/admin/cupons");
  await page
    .getByRole("button", { name: "Editar cupom GIFT10", exact: true })
    .click();
  await page.getByLabel("Desconto (%)", { exact: true }).fill("20");
  await page.getByLabel("Desconto máximo (R$)", { exact: true }).fill("10");
  await page
    .getByLabel("Somente no primeiro pedido", { exact: true })
    .uncheck();
  await page.getByLabel("Casa & decoração", { exact: true }).check();
  await page.getByRole("button", { name: "Salvar cupom", exact: true }).click();
  await page.getByRole("button", { name: "+ Novo cupom", exact: true }).click();
  await page.getByLabel("Código", { exact: true }).fill("GIFT10");
  await page
    .getByLabel("Título da campanha", { exact: true })
    .fill("Chocolate de presente");
  await page
    .getByLabel("Descrição", { exact: true })
    .fill("Uma seleção especial de chocolates.");
  await page.getByLabel("Chocolates", { exact: true }).check();
  await page.getByRole("button", { name: "Salvar cupom", exact: true }).click();
  await page.getByRole("dialog").getByRole("alert").waitFor();
  await page.getByLabel("Código", { exact: true }).fill("TESTE20");
  await page.getByRole("button", { name: "Salvar cupom", exact: true }).click();
  await page.getByText("TESTE20", { exact: true }).waitFor();
  await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem("gift-store-demo-v1"));
    state.cart = [
      {
        key: "admin-test",
        productId: "p5",
        quantity: 1,
        option: "Madeira natural",
        message: "",
      },
    ];
    localStorage.setItem("gift-store-demo-v1", JSON.stringify(state));
  });
  await go("/sacola");
  await page.getByLabel("Cupom de desconto").fill("CASA15");
  await page.getByRole("button", { name: "Aplicar", exact: true }).click();
  await page.getByText("Este cupom está pausado.", { exact: true }).waitFor();
  await page.getByLabel("Cupom de desconto").fill("GIFT10");
  await page.getByRole("button", { name: "Aplicar", exact: true }).click();
  await page.getByText("GIFT10 (20%)", { exact: true }).waitFor();
  await go("/cupons");
  await page
    .locator(".campaign-card")
    .filter({ hasText: "TESTE20" })
    .getByRole("link", { name: /Ver presentes elegíveis/ })
    .click();
  await page.waitForURL(
    (url) => url.pathname === "/catalogo" && url.searchParams.has("tema"),
  );
  await page.locator(".product-card").first().waitFor();
  for (const category of await page
    .locator(".product-card .eyebrow")
    .allTextContents())
    assert.equal(category, "Chocolates");
  await go("/admin/financeiro");
  for (const period of ["12", "6", "3", "month"]) {
    await page.getByLabel("Período", { exact: true }).selectOption(period);
    const days = Number(
      new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        timeZone: "America/Sao_Paulo",
      }).format(new Date()),
    );
    assert.equal(
      await page.locator(".finance-bar").count(),
      (period === "month" ? days : Number(period)) * 2,
    );
    await page.locator(".finance-bar").first().click();
    await page.locator(".finance-point-detail").waitFor();
  }
  await page.getByLabel("Dados", { exact: true }).selectOption("browser");
  await page
    .getByText("O resultado começa com o primeiro pedido.", { exact: false })
    .waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByLabel("Dados", { exact: true }).selectOption("history");
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await go("/admin/produtos");
  await page
    .getByRole("button", { name: "Editar Kit editado pelo admin", exact: true })
    .click();
  assert.equal(
    await page.evaluate(
      () =>
        document.querySelector("dialog").getBoundingClientRect().width <=
        innerWidth,
    ),
    true,
  );
  await page.screenshot({
    path: "/tmp/admin-product-modal-mobile.png",
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: unified products/stock, editing/cancel/persistence, stock filters, coupon edits/pause/new campaign/checkout and four financial ranges on desktop/mobile.",
  );
} finally {
  await browser.close();
}
