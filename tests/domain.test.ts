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
