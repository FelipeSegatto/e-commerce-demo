import type { DemoState } from "@/domain/types";
import { initialProducts } from "./catalog";
const KEY = "gift-store-demo-v1";
export const freshState = (): DemoState => ({
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
        return data;
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
