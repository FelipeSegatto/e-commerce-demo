import type { CartItem, Product, Proposal, ProposalItem } from "@/domain/types";

export function proposalItems(proposal: Proposal): ProposalItem[] {
  if (proposal.items) return proposal.items;
  return proposal.productId && proposal.quantity
    ? [{ productId: proposal.productId, quantity: proposal.quantity }]
    : [];
}

export function proposalSubtotal(items: ProposalItem[], products: Product[]) {
  return items.reduce(
    (sum, item) =>
      sum +
      (products.find((p) => p.id === item.productId)?.price || 0) *
        item.quantity,
    0,
  );
}

export function proposalStockValid(items: ProposalItem[], products: Product[]) {
  return (
    items.length > 0 &&
    items.every((item) => {
      const product = products.find((p) => p.id === item.productId);
      const quantity = items
        .filter((i) => i.productId === item.productId)
        .reduce((sum, i) => sum + i.quantity, 0);
      return (
        !!product &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        quantity <= product.stock
      );
    })
  );
}

export function proposalMatchesCart(proposal: Proposal, cart: CartItem[]) {
  const items = proposalItems(proposal);
  const totals = (lines: ProposalItem[]) => {
    const result = new Map<string, number>();
    for (const line of lines)
      result.set(
        line.productId,
        (result.get(line.productId) || 0) + line.quantity,
      );
    return result;
  };
  const expected = totals(items);
  const actual = totals(cart);
  return (
    items.length > 0 &&
    expected.size === actual.size &&
    [...expected].every(([id, quantity]) => actual.get(id) === quantity)
  );
}
