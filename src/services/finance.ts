import type { Order } from "@/domain/types";

const businessDateKey = (value: string | number) => new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit",
}).format(new Date(value));

export function financialSummary(orders: Order[], period: string, now: number) {
  const selected = orders.filter((order) => {
    const created = Date.parse(order.createdAt);
    return (
      period === "all" ||
      (created <= now && created >= now - Number(period) * 86400000)
    );
  });
  const total = selected.reduce((sum, order) => sum + order.total, 0);
  const discounts = selected.reduce(
    (sum, order) => sum + (order.discount || 0),
    0,
  );
  const delivery = selected.reduce(
    (sum, order) => sum + (order.delivery === "entrega" ? 19.9 : 0),
    0,
  );
  const delivered = selected.filter((order) => order.status === "Entregue");
  const payments = Array.from(new Set(selected.map((order) => order.payment)))
    .map((payment) => ({
      name: payment,
      total: selected
        .filter((order) => order.payment === payment)
        .reduce((sum, order) => sum + order.total, 0),
    }))
    .sort((a, b) => b.total - a.total);
  return {
    orders: selected,
    total,
    discounts,
    delivery,
    grossProducts: total + discounts - delivery,
    average: selected.length ? total / selected.length : 0,
    delivered: delivered.length,
    pending: selected.length - delivered.length,
    payments,
  };
}

export function demoSalesHistory(
  products: import("@/domain/types").Product[],
  now: number,
): Order[] {
  const today = new Date(businessDateKey(now) + "T12:00:00Z");
  const result: Order[] = [];
  const volumes = [24, 22, 26, 34, 46, 42, 28, 26, 29, 31, 48, 68];
  const round = (value: number) => Math.round(value * 100) / 100;
  for (let offset = 11; offset >= 0; offset--) {
    const start = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - offset, 1),
    );
    const month = start.getUTCMonth();
    const days = new Date(
      Date.UTC(start.getUTCFullYear(), month + 1, 0),
    ).getUTCDate();
    const seasonal =
      month === 11 || month === 10
        ? ["Kits & cestas", "Chocolates", "Casa & decoração"]
        : month === 4
          ? ["Banho & cuidados", "Flores & buquês", "Perfumes"]
          : month === 5
            ? ["Perfumes", "Chocolates", "Kits & cestas"]
            : [
                "Chocolates",
                "Casa & decoração",
                "Kits & cestas",
                "Banho & cuidados",
                "Perfumes",
              ];
    for (let index = 0; index < volumes[month]; index++) {
      const date = Date.UTC(
        start.getUTCFullYear(),
        month,
        1 + (index % days),
        12,
      );
      if (date > now) continue;
      const category = seasonal[index % seasonal.length];
      const candidates = products.filter((p) => p.category === category);
      const product = candidates[(index * 3 + month) % candidates.length];
      if (!product) continue;
      const picks =
        index % 4 === 0
          ? [product, products.find((p) => p.id === "p3")!].filter(
              (p, i, all) =>
                p && all.findIndex((other) => other.id === p.id) === i,
            )
          : [product];
      const items = picks.map((p, i) => ({
        key: `history-${offset}-${index}-${i}`,
        productId: p.id,
        quantity: index % 9 === 0 ? 2 : 1,
        option: p.options?.[0] || "",
        message: "",
        unitPrice: p.price,
      }));
      const gross = round(
        items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
      );
      const discount = round(
        gross * (index % 5 === 0 ? 0.1 : index % 7 === 0 ? 0.05 : 0),
      );
      const delivery = index % 3 === 0 ? "entrega" : "retirada";
      result.push({
        id: `DEMO-${start.getUTCFullYear()}-${month + 1}-${index}`,
        createdAt: new Date(date).toISOString(),
        items,
        total: round(gross - discount + (delivery === "entrega" ? 19.9 : 0)),
        discount,
        delivery,
        payment: index % 3 === 0 ? "Cartão de crédito" : "Pix",
        status: now - date > 7 * 86400000 ? "Entregue" : "Em preparação",
        customer: "Cliente demonstrativo",
      });
    }
  }
  return result;
}

export function salesTimeline(orders: Order[], range: string, now: number) {
  const today = new Date(businessDateKey(now) + "T12:00:00Z");
  const months = range === "month" ? 1 : Number(range);
  const start = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth() - months + 1,
    1,
  );
  const selected = orders.filter(
    (o) => businessDateKey(o.createdAt) >= new Date(start).toISOString().slice(0, 10) && Date.parse(o.createdAt) <= now,
  );
  const points = Array.from(
    { length: range === "month" ? today.getUTCDate() : months },
    (_, i) => {
      const date =
        range === "month"
          ? new Date(
              Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), i + 1),
            )
          : new Date(
              Date.UTC(
                today.getUTCFullYear(),
                today.getUTCMonth() - months + 1 + i,
                1,
              ),
            );
      const key = date.toISOString().slice(0, range === "month" ? 10 : 7);
      const entries = selected.filter((o) => businessDateKey(o.createdAt).startsWith(key));
      return {
        key,
        label:
          range === "month"
            ? String(i + 1)
            : date
                .toLocaleDateString("pt-BR", {
                  month: "short",
                  timeZone: "UTC",
                })
                .replace(".", "") +
              "/" +
              String(date.getUTCFullYear()).slice(-2),
        orders: entries.length,
        total: entries.reduce((sum, o) => sum + o.total, 0),
      };
    },
  );
  return { orders: selected, points };
}
