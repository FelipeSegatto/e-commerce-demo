import type { DemoState } from "@/domain/types";
import { initialProducts, CATALOG_REVISION } from "./catalog";
import { coupons } from "./coupons";
const KEY = "gift-store-demo-v1";
export const freshState = (): DemoState => ({
  catalogRevision: CATALOG_REVISION,
  coupons: structuredClone(coupons),
  cart: [],
  favorites: [],
  orders: [],
  proposals: [],
  products: structuredClone(initialProducts),
  session: null,
});
export const demoRepository = {
  load(): DemoState {
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || "null");
      if (
        data &&
        Array.isArray(data.products) &&
        Array.isArray(data.cart) &&
        Array.isArray(data.orders) &&
        Array.isArray(data.favorites) &&
        Array.isArray(data.proposals)
      )
        return migrateCatalog({
          ...data,
          coupons: Array.isArray(data.coupons)
            ? data.coupons
            : structuredClone(coupons),
        } as DemoState);
    } catch {
      /* Corrupt or inaccessible local storage falls back to demo defaults. */
    }
    return freshState();
  },
  save(state: DemoState): void {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* The demo remains usable in memory when storage is unavailable. */
    }
  },
  reset(): DemoState {
    const state = freshState();
    this.save(state);
    return state;
  },
};

export function migrateCatalog(state: DemoState): DemoState {
  if (state.catalogRevision === CATALOG_REVISION) return state;
  const stored = new Map(state.products.map((p) => [p.id, p]));
  const defaults = new Set(initialProducts.map((p) => p.id));
  return {
    ...state,
    catalogRevision: CATALOG_REVISION,
    products: [
      ...initialProducts.map((p) => ({
        ...p,
        ...(state.editedProductIds?.includes(p.id) ? stored.get(p.id) : {}),
        stock: stored.get(p.id)?.stock ?? p.stock,
      })),
      ...state.products.filter((p) => !defaults.has(p.id)),
    ],
  };
}
