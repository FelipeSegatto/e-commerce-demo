import { chromium } from "playwright";
import assert from "node:assert/strict";
(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : {}),
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const base = process.env.DEMO_BASE_URL || "http://localhost:3000";
  const goto = async (path) => {
    const response = await page.goto(base + path);
    assert.equal(response.status(), 200, path);
    await page
      .locator(`[data-demo-page="${path.split("?")[0]}"]`)
      .waitFor({ state: "attached" });
    await page
      .locator('[data-demo-state="ready"]')
      .waitFor({ state: "attached" });
  };
  async function checkout(name) {
    await page.getByLabel("Nome para o pedido").fill(name);
    await page.getByLabel("E-mail demonstrativo").fill("demo@example.com");
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
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
  }
  try {
    await goto("/");
    assert.match(await page.title(), /Gift Store/);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(200);
    await page.screenshot({
      path: process.env.SMOKE_SCREENSHOT_DIR
        ? process.env.SMOKE_SCREENSHOT_DIR + "/desktop.png"
        : "/tmp/gift-home.png",
      fullPage: true,
    });
    // Browsing refinements: keyboard/hover mega menu, linked filters and demo profiles.
    const presents = page.getByRole("button", {
      name: "Presentes",
      exact: false,
    });
    await presents.hover();
    await page.locator("#gift-mega-panel").waitFor();
    await page.keyboard.press("Escape");
    await page.locator("#gift-mega-panel").waitFor({ state: "detached" });
    await presents.focus();
    await presents.press("Enter");
    await page.locator("#gift-mega-panel").waitFor();
    await page
      .locator("#gift-mega-panel")
      .getByRole("link", { name: "Presentes até R$ 75", exact: true })
      .click();
    await page.getByLabel("Preço máximo").waitFor();
    assert.equal(await page.getByLabel("Preço máximo").inputValue(), "75");
    const products = await page.evaluate(
      () => JSON.parse(localStorage.getItem("gift-store-demo-v1")).products,
    );
    async function results(count) {
      await page
        .getByText(`${count} presentes encontrados`, { exact: true })
        .waitFor();
      assert.equal(
        await page.locator(".product-card").count(),
        Math.min(count, 12),
      );
    }
    await results(products.filter((p) => p.price <= 75).length);
    await page
      .getByLabel("Por ocasião", { exact: true })
      .selectOption("Casa nova");
    await results(
      products.filter(
        (p) =>
          p.price <= 75 &&
          ["Casa & decoração", "Casa & aromas"].includes(p.category),
      ).length,
    );
    await page
      .getByRole("button", { name: "Limpar filtros", exact: true })
      .first()
      .click();
    await results(93);
    await page
      .getByRole("checkbox", { name: "Somente ofertas", exact: true })
      .click();
    await results(products.filter((p) => p.originalPrice > p.price).length);
    await page
      .getByRole("checkbox", { name: "Com personalização", exact: true })
      .click();
    await results(
      products.filter((p) => p.originalPrice > p.price && p.customizable)
        .length,
    );
    const quickAdd = page.locator(".card-add").first();
    await quickAdd.hover();
    await page.waitForFunction(
      () =>
        getComputedStyle(document.querySelector(".card-add"))
          .backgroundPositionX === "100%",
    );
    await quickAdd.click();
    await page.getByRole("link", { name: "Sacola com 1 itens" }).waitFor();
    await goto("/sacola");
    await page.getByRole("button", { name: "Remover", exact: true }).click();
    await page.getByRole("link", { name: "Admin", exact: true }).click();
    await page
      .getByRole("heading", { name: "Visão geral", exact: true })
      .waitFor();
    await page.waitForURL("**/admin");
    await page.getByRole("link", { name: "Vendedor", exact: true }).click();
    await page
      .getByRole("heading", { name: "Visão geral", exact: true })
      .waitFor();
    await page.waitForURL("**/vendedor");
    await goto("/");
    await page
      .getByRole("link", { name: "Descobrir ofertas", exact: true })
      .click();
    await page
      .getByRole("checkbox", { name: "Somente ofertas", exact: true })
      .waitFor();
    assert.equal(
      await page
        .getByRole("checkbox", { name: "Somente ofertas", exact: true })
        .isChecked(),
      true,
    );
    await goto("/catalogo");
    await page
      .getByRole("navigation")
      .first()
      .getByRole("link", { name: "Chocolates", exact: true })
      .click();
    await results(products.filter((p) => p.category === "Chocolates").length);
    await goto("/produto/chocolates-afeto");
    await page
      .locator(".detail-copy")
      .getByRole("button", { name: "Adicionar à sacola", exact: true })
      .click();
    await page.getByText("Escolha uma opção antes de adicionar.").waitFor();
    await page.getByRole("button", { name: "Sortidos", exact: true }).click();
    await page
      .getByLabel("Uma mensagem para o cartão")
      .fill("Um presente para celebrar você!");
    await page
      .locator(".detail-copy")
      .getByRole("button", { name: "Adicionar à sacola", exact: true })
      .click();
    await page.getByRole("link", { name: "Ver minha sacola" }).click();
    await page.getByText("Cartão: “Um presente para celebrar você!”").waitFor();
    await page.getByLabel("Cupom de desconto").fill("GIFT10");
    await page.getByRole("button", { name: "Aplicar", exact: true }).click();
    await page.getByText("GIFT10 (10%)").waitFor();
    await page.getByRole("link", { name: "Continuar para checkout" }).click();
    await checkout("Cliente Exemplo");
    await goto("/conta");
    assert.equal(await page.locator(".order-card").count(), 1);
    await page.reload();
    await page.locator(".order-card").waitFor();
    await goto("/admin/pedidos");
    await page.getByLabel(/Status do pedido/).selectOption("Em preparação");
    await goto("/conta");
    await page.getByText("Em preparação", { exact: true }).waitFor();
    await goto("/vendedor/nova-proposta?produto=p3");
    await page.getByLabel("Cliente fictício").fill("Cliente Oferta");
    await page.getByLabel("Desconto (%)").fill("15");
    await page
      .getByRole("button", { name: "Criar proposta", exact: true })
      .click();
    await page.getByText("Aguardando aprovação", { exact: true }).waitFor();
    await goto("/admin/descontos");
    await page.getByRole("button", { name: "Aprovar", exact: true }).click();
    await page.getByText("Aprovada", { exact: true }).waitFor();
    await page.getByRole("link", { name: "Abrir oferta" }).click();
    await page.getByRole("button", { name: "Usar esta oferta" }).click();
    await page.getByText("Desconto da oferta", { exact: true }).waitFor();
    await checkout("Cliente Oferta");
    await goto("/vendedor/propostas");
    await page.getByText("Convertida", { exact: true }).waitFor();
    await goto("/admin/estoque");
    assert.equal(
      await page
        .getByLabel("Estoque de Caixa de Chocolates Afeto")
        .inputValue(),
      "18",
    );
    await page.getByLabel("Estoque de Caixa de Chocolates Afeto").fill("0");
    await goto("/produto/chocolates-afeto");
    assert.equal(
      await page
        .getByRole("button", { name: "Produto indisponível" })
        .isDisabled(),
      true,
    );
    await goto("/catalogo");
    await page
      .getByRole("button", {
        name: /Adicionar Kit Pequenas Alegrias aos favoritos/,
      })
      .click();
    await goto("/favoritos");
    assert.equal(await page.locator(".product-card").count(), 1);
    await goto("/admin/novo-produto");
    await page.getByLabel("Nome do produto").fill("Presente de Teste");
    await page.getByLabel("Preço (R$)").fill("29.9");
    await page.getByLabel("Estoque", { exact: true }).fill("3");
    await page
      .getByLabel("Descrição")
      .fill("Produto fictício para validar o cadastro.");
    await page.getByRole("button", { name: "Salvar produto" }).click();
    await page.getByText("Presente de Teste", { exact: true }).waitFor();
    const routes = [
      "/",
      "/catalogo",
      "/cupons",
      "/presentear",
      "/personalizados",
      "/sobre",
      "/contato",
      "/politicas",
      "/entrar",
      "/cadastro",
      "/conta",
      "/sacola",
      "/favoritos",
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
    ];
    await page.setViewportSize({ width: 390, height: 844 });
    for (const path of routes) {
      await goto(path);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth,
        ),
        false,
        "mobile overflow " + path,
      );
      await page.locator("img").evaluateAll((images) =>
        Promise.all(
          images.map(async (image) => {
            image.loading = "eager";
            try {
              await image.decode();
            } catch {
              /* Assert invalid images below. */
            }
          }),
        ),
      );
      const bad = await page
        .locator("img")
        .evaluateAll((images) =>
          images
            .filter((i) => !i.complete || i.naturalWidth === 0)
            .map((i) => i.src),
        );
      assert.deepEqual(bad, [], "images " + path);
    }
    await goto("/");
    await page.screenshot({
      path: process.env.SMOKE_SCREENSHOT_DIR
        ? process.env.SMOKE_SCREENSHOT_DIR + "/mobile.png"
        : "/tmp/gift-mobile.png",
      fullPage: true,
    });
    const touch = await browser.newPage({
      viewport: { width: 320, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    await touch.goto(base);
    await touch
      .locator('[data-demo-state="ready"]')
      .waitFor({ state: "attached" });
    assert.equal(
      await touch.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      "320px layout",
    );
    await touch.getByRole("button", { name: "Presentes", exact: false }).tap();
    await touch.locator("#gift-mega-panel").waitFor();
    await touch.getByRole("button", { name: "Fechar mega menu" }).tap();
    await touch.locator("#gift-mega-panel").waitFor({ state: "detached" });
    await touch.locator(".profiles-menu summary").tap();
    await touch
      .locator(".profiles-menu")
      .getByRole("link", { name: "Administrador", exact: true })
      .tap();
    await touch.waitForURL("**/admin");
    await touch.close();
    const notFound = await page.goto(base + "/nao-existe");
    assert.equal(notFound.status(), 404);
    assert.deepEqual(errors, [], "browser runtime errors");
    console.log(
      "PASS: catálogo, opções obrigatórias, personalização, cupom, checkout, persistência, pedidos, propostas/aprovação/conversão, estoque, favoritos, cadastro de produto, 23 rotas mobile, imagens e 404.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
