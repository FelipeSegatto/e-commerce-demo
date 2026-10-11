"use client";
import { useState } from "react";
import Link from "next/link";
import type { Order, Product } from "@/domain/types";
import { money, initialProducts } from "@/services/catalog";
import {
  financialSummary,
  demoSalesHistory,
  salesTimeline,
} from "@/services/finance";

export function Finance({
  orders,
  products,
  now,
}: {
  orders: Order[];
  products: Product[];
  now: number;
}) {
  const [period, setPeriod] = useState("12");
  const [source, setSource] = useState("history");
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const timeline = salesTimeline(
    source === "history" ? demoSalesHistory(initialProducts, now) : orders,
    period,
    now,
  );
  const summary = financialSummary(timeline.orders, "all", now);
  const peak = [...timeline.points].sort((a, b) => b.total - a.total)[0];
  const volumePeak = [...timeline.points].sort(
    (a, b) => b.orders - a.orders,
  )[0];
  const pointName = (point: typeof peak) =>
    period === "month"
      ? `O dia ${point.label}`
      : new Date(point.key + "-01T12:00:00Z").toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        });
  const selected = timeline.points.find((p) => p.key === selectedPoint);
  const categoryTotals = new Map<string, number>();
  for (const order of timeline.orders) {
    const weights = order.items.map((item) => ({
      category:
        (source === "history" ? initialProducts : products).find(
          (p) => p.id === item.productId,
        )?.category || "Outros",
      value:
        (item.unitPrice ??
          products.find((p) => p.id === item.productId)?.price ??
          0) * item.quantity,
    }));
    const gross = weights.reduce((sum, item) => sum + item.value, 0);
    for (const item of weights)
      categoryTotals.set(
        item.category,
        (categoryTotals.get(item.category) || 0) +
          (gross
            ? (item.value / gross) *
              (order.total - (order.delivery === "entrega" ? 19.9 : 0))
            : 0),
      );
  }
  const categories = [...categoryTotals].sort((a, b) => b[1] - a[1]);
  const leadingCategory = categories[0];
  return (
    <>
      <section className="panel finance-story">
        <div className="finance-story-heading">
          <div>
            <p className="eyebrow">CADA PEDIDO COMPÕE O RESULTADO</p>
            <h2>O caminho de cada venda</h2>
          </div>
          <div className="finance-controls">
            <label>
              Dados
              <select
                aria-label="Dados"
                value={source}
                onChange={(e) => {
                  setSource(e.target.value);
                  setSelectedPoint(null);
                }}
              >
                <option value="history">Histórico demonstrativo</option>
                <option value="browser">Pedidos deste navegador</option>
              </select>
            </label>
            <label>
              Período
              <select
                aria-label="Período"
                value={period}
                onChange={(e) => {
                  setPeriod(e.target.value);
                  setSelectedPoint(null);
                }}
              >
                <option value="12">Últimos 12 meses</option>
                <option value="6">Últimos 6 meses</option>
                <option value="3">Últimos 3 meses</option>
                <option value="month">Mês atual</option>
              </select>
            </label>
          </div>
        </div>
        <p className="finance-reading">
          {summary.orders.length
            ? `Neste período, ${summary.orders.length} pedido(s) somam ${money(summary.total)}, com valor médio de ${money(summary.average)}. Foram concedidos ${money(summary.discounts)} em descontos. ${summary.delivered} pedido(s) foram entregues e ${summary.pending} ainda estão em andamento.`
            : "O resultado começa com o primeiro pedido. Quando uma compra for simulada, você poderá acompanhar o valor dos pedidos, os descontos e as entregas por aqui."}
        </p>
        {summary.orders.length > 0 && (
          <p className="finance-reading">
            {pointName(peak)} concentrou o maior valor de pedidos do período:{" "}
            {money(peak.total)} em {peak.orders} pedido(s), com ticket médio de{" "}
            {money(peak.total / peak.orders)}.
            {volumePeak.key !== peak.key &&
              ` ${pointName(volumePeak)} teve o maior volume: ${volumePeak.orders} pedidos, com ticket médio de ${money(volumePeak.total / volumePeak.orders)}.`}
            {leadingCategory &&
              ` ${leadingCategory[0]} lidera o valor dos produtos vendidos, com ${money(leadingCategory[1])} após descontos.`}
          </p>
        )}
        <p className="fine-print">
          {source === "history"
            ? "Cenário demonstrativo de uma loja de presentes, com maior movimento em maio, junho e no fim do ano. Cada indicador é calculado a partir dos mesmos pedidos fictícios."
            : "Esta visão usa os pedidos simulados e salvos neste navegador."}{" "}
          O mês atual inclui somente os dias transcorridos.
        </p>
        <Link className="text-link" href="/admin/pedidos">
          Acompanhar pedidos ↗
        </Link>
      </section>
      <div className="metrics finance-metrics">
        <div>
          <p>Valor dos pedidos</p>
          <h2>{money(summary.total)}</h2>
          <small>Inclui frete · {summary.orders.length} pedido(s)</small>
        </div>
        <div>
          <p>Descontos concedidos</p>
          <h2>{money(summary.discounts)}</h2>
          <small>Cupons e ofertas do vendedor</small>
        </div>
        <div>
          <p>Ticket médio</p>
          <h2>{money(summary.average)}</h2>
          <small>Valor médio por pedido</small>
        </div>
      </div>
      <div className="finance-grid finance-charts">
        {(["total", "orders"] as const).map((metric) => {
          const maximum = Math.max(1, ...timeline.points.map((p) => p[metric]));
          return (
            <section className="panel" key={metric}>
              <h2>
                {metric === "total"
                  ? "Valor dos pedidos ao longo do tempo"
                  : "Quantos pedidos compõem o resultado"}
              </h2>
              <p className="fine-print">
                {period === "month"
                  ? "Por dia do mês atual"
                  : "Por mês · último mês parcial"}
                . Clique nas barras para explorar.
              </p>
              <div className="finance-bars">
                {timeline.points.map((point) => (
                  <button
                    type="button"
                    className="finance-bar"
                    key={point.key}
                    aria-pressed={selectedPoint === point.key}
                    aria-label={`${point.label}: ${money(point.total)}, ${point.orders} pedidos`}
                    onClick={() => setSelectedPoint(point.key)}
                  >
                    <span className="finance-bar-value">
                      {metric === "total"
                        ? new Intl.NumberFormat("pt-BR", {
                            notation: "compact",
                            maximumFractionDigits: 1,
                          }).format(point.total)
                        : point.orders}
                    </span>
                    <span className="finance-bar-space">
                      <span
                        style={{
                          height: `${(point[metric] / maximum) * 100}%`,
                        }}
                      />
                    </span>
                    <span className="finance-bar-label">{point.label}</span>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      {selected && (
        <div className="notice finance-point-detail" role="status">
          {period === "month" ? "Dia " : ""}
          {selected.label}: {selected.orders} pedido(s), {money(selected.total)}{" "}
          em valor total e ticket médio de{" "}
          {money(selected.orders ? selected.total / selected.orders : 0)}.
        </div>
      )}
      <section className="panel finance-category-panel">
        <h2>Quais presentes compõem as vendas</h2>
        <p className="fine-print">
          Valor dos produtos após descontos, sem frete.
        </p>
        {categories.length ? (
          categories.map(([category, value]) => (
            <div className="finance-payment" key={category}>
              <div className="list-row">
                <span>{category}</span>
                <b>{money(value)}</b>
              </div>
              <div className="finance-payment-track" aria-hidden="true">
                <span
                  style={{
                    width: `${(value / Math.max(1, summary.total - summary.delivery)) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <p>Nenhuma venda neste período.</p>
        )}
      </section>
      <div className="finance-grid">
        <section className="panel">
          <h2>Como o valor se compõe</h2>
          <div className="list-row">
            <span>Produtos antes dos descontos</span>
            <b>{money(summary.grossProducts)}</b>
          </div>
          <div className="list-row">
            <span>Descontos</span>
            <b>− {money(summary.discounts)}</b>
          </div>
          <div className="list-row">
            <span>Frete</span>
            <b>+ {money(summary.delivery)}</b>
          </div>
          <div className="total">
            <span>Valor final dos pedidos</span>
            <b>{money(summary.total)}</b>
          </div>
          <Link className="text-link" href="/admin/descontos">
            Revisar propostas e descontos ↗
          </Link>
        </section>
        <section className="panel">
          <h2>Escolhas de pagamento</h2>
          {summary.payments.length ? (
            summary.payments.map((payment) => (
              <div className="finance-payment" key={payment.name}>
                <div className="list-row">
                  <span>{payment.name}</span>
                  <b>{money(payment.total)}</b>
                </div>
                <div className="finance-payment-track" aria-hidden="true">
                  <span
                    style={{
                      width: `${summary.total ? (payment.total / summary.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="fine-print">
              As formas de pagamento aparecem após o primeiro pedido deste
              período.
            </p>
          )}
          <p className="fine-print">
            Valores de pedidos simulados. Nenhum pagamento foi cobrado ou
            recebido.
          </p>
        </section>
      </div>
    </>
  );
}
