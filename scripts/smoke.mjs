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
    await goto("/catalogo");
    await page
      .getByRole("navigation")
      .first()
      .getByRole("link", { name: "Chocolates", exact: true })
      .click();
    await page.getByText("1 presentes encontrados").waitFor();
    assert.equal(await page.locator(".product-card").count(), 1);
    await goto("/produto/chocolates-afeto");
    await page
      .getByRole("button", { name: "Adicionar à sacola", exact: true })
      .click();
    await page.getByText("Escolha uma opção antes de adicionar.").waitFor();
    await page.getByRole("button", { name: "Sortidos", exact: true }).click();
    await page
      .getByLabel("Uma mensagem para o cartão")
      .fill("Um presente para celebrar você!");
    await page
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
    const notFound = await page.goto(base + "/nao-existe");
    assert.equal(notFound.status(), 404);
    assert.deepEqual(errors, [], "browser runtime errors");
    console.log(
      "PASS: catálogo, opções obrigatórias, personalização, cupom, checkout, persistência, pedidos, propostas/aprovação/conversão, estoque, favoritos, cadastro de produto, 21 rotas mobile, imagens e 404.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
