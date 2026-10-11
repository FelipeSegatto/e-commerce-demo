import type { DemoState, StockMovement } from "@/domain/types";

export function adjustStock(
  state: DemoState,
  movement: StockMovement,
): { state: DemoState; error?: string } {
  const product = state.products.find((p) => p.id === movement.productId);
  if (!product || product.stock !== movement.previous)
    return {
      state,
      error: "O saldo mudou. Feche o ajuste e confira o estoque atualizado.",
    };
  if (
    !Number.isInteger(movement.quantity) ||
    movement.quantity === 0 ||
    movement.next !== movement.previous + movement.quantity ||
    movement.next < 0 ||
    movement.next > 9999 ||
    !movement.reason.trim()
  )
    return {
      state,
      error: "Informe uma quantidade válida e o motivo do ajuste.",
    };
  if (state.stockMovements?.some((item) => item.id === movement.id))
    return { state, error: "Este ajuste já foi registrado." };
  return {
    state: {
      ...state,
      products: state.products.map((p) =>
        p.id === product.id ? { ...p, stock: movement.next } : p,
      ),
      stockMovements: [movement, ...(state.stockMovements || [])],
    },
  };
}
