import type { DemoState, Order } from "@/domain/types";
import {
  proposalItems,
  proposalStockValid,
  proposalSubtotal,
} from "./proposals";

export function completePhysicalSale(
  state: DemoState,
  proposalId: string,
  payment: string,
  orderId: string,
  createdAt: string,
): { state: DemoState; order?: Order; error?: string } {
  const proposal = state.proposals.find((p) => p.id === proposalId);
  if (!proposal || proposal.status !== "Aprovada")
    return {
      state,
      error: "A proposta precisa estar aprovada e ainda não utilizada.",
    };
  const lines = proposalItems(proposal);
  if (!proposalStockValid(lines, state.products))
    return {
      state,
      error: "O estoque mudou. Revise a proposta antes de concluir.",
    };
  if (!["Pix", "Cartão de crédito", "Dinheiro"].includes(payment))
    return { state, error: "Escolha uma forma de pagamento válida." };
  const subtotal = proposalSubtotal(lines, state.products);
  const discount = Math.round(subtotal * proposal.discount) / 100;
  const order: Order = {
    id: orderId,
    createdAt,
    customer: proposal.customer,
    channel: "presencial",
    seller: proposal.seller || "Vendedor Demo",
    proposalId,
    items: lines.map((line, i) => ({
      ...line,
      key: proposal.id + "-" + i,
      option:
        state.products.find((p) => p.id === line.productId)?.options?.[0] || "",
      message: "",
      unitPrice: state.products.find((p) => p.id === line.productId)!.price,
    })),
    total: Math.round((subtotal - discount) * 100) / 100,
    discount,
    delivery: "retirada",
    payment,
    status: "Entregue",
  };
  return {
    order,
    state: {
      ...state,
      orders: [order, ...state.orders],
      proposals: state.proposals.map((p) =>
        p.id === proposalId ? { ...p, status: "Convertida" } : p,
      ),
      products: state.products.map((p) => ({
        ...p,
        stock:
          p.stock -
          lines
            .filter((line) => line.productId === p.id)
            .reduce((sum, line) => sum + line.quantity, 0),
      })),
    },
  };
}
