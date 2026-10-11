import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { initialProducts, categories } from "../src/services/catalog";
import {
  defaults,
  parseFilters,
  filtersQuery,
  browseProducts,
  facetCount,
} from "../src/services/browse";
import { evaluateCoupon } from "../src/services/coupons";
import { freshState, migrateCatalog } from "../src/services/demo";
import {
  proposalItems,
  proposalSubtotal,
  proposalStockValid,
  proposalMatchesCart,
} from "../src/services/proposals";
import type { Proposal } from "../src/domain/types";
import {
  financialSummary,
  demoSalesHistory,
  salesTimeline,
} from "../src/services/finance";
import type { Order } from "../src/domain/types";

test("sales history reconciles every order and calendar chart across all ranges", () => {
  const now = Date.parse("2026-10-11T18:00:00Z");
  const orders = demoSalesHistory(initialProducts, now);
  assert.deepEqual(demoSalesHistory(initialProducts, now), orders);
  assert.ok(orders.length > 300);
  assert.equal(new Set(orders.map((o) => o.id)).size, orders.length);
  for (const order of orders) {
    const gross = order.items.reduce(
      (sum, item) => sum + item.unitPrice! * item.quantity,
      0,
    );
    assert.ok(
      Math.abs(
        order.total -
          (gross - order.discount! + (order.delivery === "entrega" ? 19.9 : 0)),
      ) < 0.00001,
    );
    assert.ok(Date.parse(order.createdAt) <= now);
  }
  for (const range of ["12", "6", "3", "month"]) {
    const timeline = salesTimeline(orders, range, now);
    assert.equal(
      timeline.points.length,
      range === "month" ? 11 : Number(range),
    );
    assert.equal(
      timeline.points.reduce((sum, point) => sum + point.orders, 0),
      timeline.orders.length,
    );
    assert.ok(
      Math.abs(
        timeline.points.reduce((sum, point) => sum + point.total, 0) -
          financialSummary(timeline.orders, "all", now).total,
      ) < 0.00001,
    );
  }
  const full = salesTimeline(orders, "12", now);
  assert.equal(full.points[0].key, "2025-11");
  assert.equal(full.points.at(-1)?.key, "2026-10");
  assert.equal(
    salesTimeline(orders, "month", now).orders.every((o) =>
      o.createdAt.startsWith("2026-10"),
    ),
    true,
  );
});

test("financial periods reconcile products, discounts, delivery and payment totals", () => {
  const now = Date.parse("2026-10-11T12:00:00Z");
  const order: Order = {
    id: "one",
    createdAt: "2026-10-10T12:00:00Z",
    items: [],
    total: 109.9,
    discount: 10,
    delivery: "entrega",
    payment: "Pix",
    status: "Recebido",
    customer: "Demo",
  };
  const old = {
    ...order,
    id: "old",
    createdAt: "2026-07-01T12:00:00Z",
    total: 50,
    discount: undefined,
    delivery: "retirada",
    status: "Entregue" as const,
  };
  const summary = financialSummary([order, old], "30", now);
  assert.equal(summary.orders.length, 1);
  assert.equal(summary.total, 109.9);
  assert.equal(summary.grossProducts, 100);
  assert.equal(summary.discounts, 10);
  assert.equal(summary.delivery, 19.9);
  assert.equal(summary.pending, 1);
  assert.equal(summary.payments[0].total, 109.9);
  assert.equal(financialSummary([order, old], "all", now).delivered, 1);
  assert.equal(financialSummary([], "7", now).average, 0);
});

test("multi-product offers validate aggregate stock and the exact cart composition", () => {
  const products = initialProducts.filter((p) => p.stock > 2).slice(0, 2);
  const items = products.map((p) => ({ productId: p.id, quantity: 2 }));
  const proposal: Proposal = {
    id: "multi",
    customer: "Cliente",
    items,
    discount: 15,
    status: "Aprovada",
  };
  const cart = items.map((item, i) => ({
    ...item,
    key: String(i),
    option: "",
    message: "",
  }));
  assert.equal(
    proposalSubtotal(items, products),
    products.reduce((n, p) => n + p.price * 2, 0),
  );
  assert.equal(proposalStockValid(items, products), true);
  assert.equal(
    proposalStockValid(
      [{ ...items[0], quantity: products[0].stock }, items[0]],
      products,
    ),
    false,
  );
  assert.equal(
    proposalStockValid([{ ...items[0], quantity: 1.5 }], products),
    false,
  );
  assert.equal(proposalStockValid([], products), false);
  assert.equal(proposalMatchesCart(proposal, cart.reverse()), true);
  assert.equal(proposalMatchesCart(proposal, cart.slice(0, 1)), false);
  assert.equal(
    proposalMatchesCart(proposal, [...cart, { ...cart[0], quantity: 1 }]),
    false,
  );
});

test("saved single-product proposals retain their items and checkout eligibility", () => {
  const proposal: Proposal = {
    id: "old",
    customer: "Cliente",
    productId: "p1",
    quantity: 2,
    discount: 5,
    status: "Aprovada",
  };
  assert.deepEqual(proposalItems(proposal), [{ productId: "p1", quantity: 2 }]);
  assert.equal(
    proposalMatchesCart(proposal, [
      { key: "old", productId: "p1", quantity: 2, option: "", message: "" },
    ]),
    true,
  );
});

test("catalog has unique IDs, valid categories and real image files, including variants", () => {
  assert.equal(initialProducts.length, 93);
  assert.equal(new Set(initialProducts.map((p) => p.id)).size, 93);
  assert.equal(new Set(initialProducts.map((p) => p.slug)).size, 93);
  for (const p of initialProducts) {
    assert.ok(categories.includes(p.category));
    assert.ok(!p.imagePending);
    for (const path of [p.image, ...Object.values(p.variantImages || {})])
      assert.ok(existsSync("public" + path), path);
  }
  const balloon = initialProducts.find((p) => p.slug === "baloes-metalizados")!;
  assert.notEqual(
    balloon.variantImages?.Dourado,
    balloon.variantImages?.["Rosé"],
  );
});
test("filters combine budget, occasion and brand, normalize accents and round trip URLs", () => {
  const f = parseFilters(
    new URLSearchParams(
      "marca=Aesop&min=100&max=450&ocasiao=Autocuidado&ordem=asc",
    ),
  );
  const list = browseProducts(initialProducts, f);
  assert.ok(list.length > 0);
  assert.ok(
    list.every((p) => p.brand === "Aesop" && p.price >= 100 && p.price <= 450),
  );
  assert.ok(list.every((p, i) => !i || p.price >= list[i - 1].price));
  assert.deepEqual(parseFilters(new URLSearchParams(filtersQuery(f))), f);
  assert.equal(
    browseProducts(initialProducts, {
      ...defaults,
      search: "locao facial protective",
    }).length,
    1,
  );
  assert.equal(
    facetCount(
      initialProducts,
      { ...defaults, max: 75 },
      "category",
      "Chocolates",
    ),
    initialProducts.filter((p) => p.category === "Chocolates" && p.price <= 75)
      .length,
  );
  const bounds = parseFilters(new URLSearchParams("min=500&max=100&limite=-2"));
  assert.equal(bounds.min, 100);
  assert.equal(bounds.max, 500);
  assert.equal(bounds.limit, 12);
});
test("coupon discounts only eligible items, enforces minimum, cap and first order", () => {
  const home = {
    ...initialProducts[4],
    price: 100,
    category: "Casa & decoração" as const,
  };
  const other = { ...initialProducts[1], price: 500 };
  const cart = [
    { key: "test", option: "", message: "", productId: home.id, quantity: 2 },
    { key: "test", option: "", message: "", productId: other.id, quantity: 1 },
  ];
  assert.equal(evaluateCoupon(" casa15 ", cart, [home, other]).discount, 30);
  assert.equal(
    evaluateCoupon(
      "CASA15",
      [
        {
          key: "test",
          option: "",
          message: "",
          productId: home.id,
          quantity: 1,
        },
        {
          key: "test",
          option: "",
          message: "",
          productId: other.id,
          quantity: 1,
        },
      ],
      [home, other],
    ).valid,
    false,
  );
  assert.equal(
    evaluateCoupon(
      "CASA15",
      [
        {
          key: "test",
          option: "",
          message: "",
          productId: home.id,
          quantity: 20,
        },
      ],
      [home],
    ).discount,
    120,
  );
  assert.equal(evaluateCoupon("GIFT10", cart, [home, other], 1).valid, false);
  assert.equal(evaluateCoupon("unknown", cart, [home, other]).valid, false);
  assert.equal(evaluateCoupon("GIFT10", cart, [home, other]).discount, 70);
  assert.equal(
    evaluateCoupon(
      "CASA15",
      [
        {
          key: "test",
          option: "",
          message: "",
          productId: home.id,
          quantity: 3,
        },
      ],
      [{ ...home, price: 59.9 }],
    ).discount,
    26.96,
  );
});
test("catalog migration adds products and photos while retaining stock, orders and custom products", () => {
  const state = freshState();
  delete state.catalogRevision;
  const custom = { ...state.products[0], id: "custom", slug: "custom" };
  state.products = [{ ...state.products[0], stock: 2 }, custom];
  state.favorites = ["p1"];
  state.cart = [
    { key: "test", option: "", message: "", productId: "p1", quantity: 1 },
  ];
  const migrated = migrateCatalog(state);
  assert.equal(migrated.products.length, 94);
  assert.equal(migrated.products[0].stock, 2);
  assert.deepEqual(migrated.favorites, state.favorites);
  assert.deepEqual(migrated.cart, state.cart);
  assert.equal(migrated.products.at(-1)?.id, "custom");
  assert.equal(migrateCatalog(migrated), migrated);
});

test("admin product edits survive future catalog updates and coupon rules drive discovery and checkout", () => {
  const state = freshState();
  delete state.catalogRevision;
  state.products[0] = {
    ...state.products[0],
    name: "Kit editado",
    price: 149.9,
    stock: 4,
  };
  state.editedProductIds = [state.products[0].id];
  assert.equal(migrateCatalog(state).products[0].name, "Kit editado");
  assert.equal(migrateCatalog(state).products[0].price, 149.9);
  const coupon = {
    ...state.coupons[0],
    firstOrderOnly: false,
    percent: 20,
    cap: 10,
    categories: ["Casa & decoração" as const],
  };
  const product = state.products.find(
    (p) => p.category === "Casa & decoração",
  )!;
  const cart = [
    { key: "one", productId: product.id, quantity: 1, option: "", message: "" },
  ];
  assert.equal(
    evaluateCoupon(coupon.code, cart, state.products, 2, [coupon]).discount,
    10,
  );
  assert.equal(
    evaluateCoupon(coupon.code, cart, state.products, 2, [
      { ...coupon, active: false },
    ]).valid,
    false,
  );
  const filters = parseFilters(new URLSearchParams("tema=" + coupon.theme));
  assert.ok(
    browseProducts(state.products, filters, [coupon]).every(
      (p) => p.category === "Casa & decoração",
    ),
  );
  assert.equal(
    browseProducts(state.products, filters, [{ ...coupon, active: false }])
      .length,
    0,
  );
});
