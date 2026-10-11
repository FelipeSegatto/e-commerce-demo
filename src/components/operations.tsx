"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Finance } from "./finance";
import { ProductImage } from "./product-image";
import { useDemo, Icon } from "./demo-provider";
import { categories, money } from "@/services/catalog";
import {
  proposalItems,
  proposalSubtotal,
  proposalStockValid,
} from "@/services/proposals";
import type { ProposalItem, Order, Product } from "@/domain/types";

const labels: Record<string, string> = {
  produtos: "Produtos",
  estoque: "Estoque",
  pedidos: "Pedidos",
  financeiro: "Financeiro",
  equipe: "Equipe",
  descontos: "Aprovação de descontos",
  catalogo: "Catálogo de presentes",
  propostas: "Minhas propostas",
  "nova-proposta": "Criar proposta",
  "novo-produto": "Novo produto",
};
export function Operations({ path }: { path: string }) {
  const { state, update, notify } = useDemo();
  const router = useRouter();
  const params = useSearchParams();
  const [now] = useState(() => Date.now());
  const seller = path.startsWith("/vendedor");
  const page = path.split("/")[2] || "dashboard";
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [items, setItems] = useState<ProposalItem[]>([
    { productId: params.get("produto") || "p1", quantity: 1 },
  ]);
  const editItem = (index: number, change: Partial<ProposalItem>) =>
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, ...change } : item)),
    );
  const [discount, setDiscount] = useState(0);
  const [customer, setCustomer] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "Perfumes",
    price: "",
    stock: "",
    description: "",
  });
  const [member, setMember] = useState("");
  const [members, setMembers] = useState(["Admin Demo", "Vendedor Demo"]);
  const [period, setPeriod] = useState("30");
  const pending = state.proposals.filter(
    (p) => p.status === "Aguardando aprovação",
  );
  const low = state.products.filter((p) => p.stock <= 5);
  const subtotal = proposalSubtotal(items, state.products);
  const filteredProducts = state.products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "Todos" || p.category === filter),
  );
  const tableProducts = (inventory = false) => (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Categoria</th>
            <th>Preço</th>
            <th>Estoque</th>
            <th>{inventory ? "Ajuste local" : "Ação"}</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((p) => (
            <tr key={p.id}>
              <td>
                <div className="table-product">
                  <ProductImage product={p} />
                  <span>
                    <b>{p.name}</b>
                    <small>{p.id.toUpperCase()}</small>
                  </span>
                </div>
              </td>
              <td>{p.category}</td>
              <td>{money(p.price)}</td>
              <td>
                <span className={"badge " + (p.stock <= 5 ? "warning" : "")}>
                  {p.stock} unidades
                </span>
              </td>
              <td>
                {inventory ? (
                  <input
                    aria-label={`Estoque de ${p.name}`}
                    className="stock-input"
                    type="number"
                    min="0"
                    max="9999"
                    value={p.stock}
                    onChange={(e) => {
                      const stock = Math.max(0, Number(e.target.value) || 0);
                      update((s) => ({
                        ...s,
                        products: s.products.map((i) =>
                          i.id === p.id ? { ...i, stock } : i,
                        ),
                      }));
                    }}
                  />
                ) : (
                  <Link className="text-link" href={"/produto/" + p.slug}>
                    Ver produto ↗
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!filteredProducts.length && (
        <p className="empty compact">Nenhum produto encontrado.</p>
      )}
    </div>
  );
  if (path.startsWith("/oferta")) {
    const proposal = state.proposals.find((p) => p.id === page);
    const lines = proposal ? proposalItems(proposal) : [];
    const product = state.products.find((p) => p.id === lines[0]?.productId);
    if (
      !proposal ||
      !product ||
      lines.some((item) => !state.products.some((p) => p.id === item.productId))
    )
      return (
        <div className="empty">
          <h1>Oferta não encontrada neste navegador.</h1>
          <p>
            Os links de demonstração funcionam somente onde a proposta foi
            criada.
          </p>
          <Link className="button" href="/catalogo">
            Ver presentes
          </Link>
        </div>
      );
    return (
      <div className="container section">
        <p className="eyebrow">UMA ESCOLHA ESPECIAL</p>
        <h1>Um presente para {proposal.customer}</h1>
        <div className="detail-grid">
          <img className="offer-image" src={product.image} alt={product.name} />
          <div className="panel">
            <h2>
              {lines.length > 1 ? "Sua seleção de presentes" : product.name}
            </h2>
            {lines.map((item) => {
              const gift = state.products.find((p) => p.id === item.productId)!;
              return (
                <div className="proposal-summary-item" key={item.productId}>
                  <ProductImage product={gift} />
                  <div>
                    <b>{gift.name}</b>
                    <p>
                      {item.quantity} unidade(s) ·{" "}
                      {money(gift.price * item.quantity)}
                    </p>
                  </div>
                </div>
              );
            })}
            <p>{proposal.discount}% de desconto sobre a seleção</p>
            <div className="detail-price">
              {money(
                proposalSubtotal(lines, state.products) *
                  (1 - proposal.discount / 100),
              )}
            </div>
            <span className="badge">{proposal.status}</span>
            <p className="fine-print">
              Oferta demonstrativa. Não há cobrança ou reserva de estoque.
            </p>
            <button
              className="button"
              disabled={
                proposal.status !== "Aprovada" ||
                !proposalStockValid(lines, state.products)
              }
              onClick={() => {
                if (!proposalStockValid(lines, state.products)) {
                  notify("Estoque insuficiente para esta oferta.");
                  return;
                }
                update((s) => ({
                  ...s,
                  cart: lines.map((item, index) => ({
                    key: proposal.id + "-" + index,
                    productId: item.productId,
                    quantity: item.quantity,
                    option:
                      state.products.find((p) => p.id === item.productId)
                        ?.options?.[0] || "",
                    message: "",
                  })),
                }));
                router.push("/checkout?oferta=" + proposal.id);
              }}
            >
              Usar esta oferta <Icon name="arrow" size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }
  const base = seller ? "/vendedor" : "/admin";
  return (
    <div className="operations-content">
      <div className="operations-heading">
        <div>
          <p className="eyebrow">
            {seller ? "VENDAS ASSISTIDAS" : "GESTÃO DA LOJA"}
          </p>
          <h1>
            {page === "dashboard"
              ? "Visão geral"
              : labels[page] || "Página não encontrada"}
          </h1>
          <p>Dados locais e fictícios · Gift Store</p>
        </div>
        {page === "dashboard" && (
          <select
            aria-label="Período dos indicadores"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
          </select>
        )}
        {page === "produtos" && (
          <Link className="button" href="/admin/novo-produto">
            + Novo produto
          </Link>
        )}
        {page === "propostas" && (
          <Link className="button" href="/vendedor/nova-proposta">
            + Criar proposta
          </Link>
        )}
      </div>
      {page === "dashboard" && (
        <>
          <div className="metrics">
            <div>
              <Icon name="chart" />
              <p>{seller ? "Valor em propostas" : "Vendas simuladas"}</p>
              <h2>
                {money(
                  seller
                    ? state.proposals.reduce(
                        (sum, p) =>
                          sum +
                          proposalSubtotal(proposalItems(p), state.products) *
                            (1 - p.discount / 100),
                        0,
                      )
                    : state.orders
                        .filter(
                          (o) =>
                            now - Date.parse(o.createdAt) <
                            Number(period) * 86400000,
                        )
                        .reduce((sum, o) => sum + o.total, 0),
                )}
              </h2>
              <small>
                {seller
                  ? "Não representa vendas concluídas"
                  : "Pedidos criados no período"}
              </small>
            </div>
            <div>
              <Icon name="bag" />
              <p>{seller ? "Propostas criadas" : "Pedidos"}</p>
              <h2>
                {seller
                  ? state.proposals.length
                  : state.orders.filter(
                      (o) =>
                        now - Date.parse(o.createdAt) <
                        Number(period) * 86400000,
                    ).length}
              </h2>
              <small>Simulações neste navegador</small>
            </div>
            <div>
              <Icon name="gift" />
              <p>{seller ? "Aguardando aprovação" : "Produtos ativos"}</p>
              <h2>
                {seller
                  ? pending.length
                  : state.products.filter((p) => p.stock > 0).length}
              </h2>
              <small>
                {seller ? "Descontos acima de 10%" : "Com estoque disponível"}
              </small>
            </div>
            <div>
              <Icon name="box" />
              <p>{seller ? "Propostas convertidas" : "Estoque baixo"}</p>
              <h2>
                {seller
                  ? state.proposals.filter((p) => p.status === "Convertida")
                      .length
                  : low.length}
              </h2>
              <small>
                {seller
                  ? "Pedidos concluídos pela oferta"
                  : "Produtos com até 5 unidades"}
              </small>
            </div>
          </div>
          <div className="dashboard-grid">
            <section className="panel">
              <div className="section-heading">
                <h2>
                  {seller ? "Suas próximas conversas" : "Últimos pedidos"}
                </h2>
                <Link
                  className="text-link"
                  href={base + (seller ? "/propostas" : "/pedidos")}
                >
                  Ver todos →
                </Link>
              </div>
              {seller ? (
                <>
                  <p>
                    Prepare uma oferta personalizada e acompanhe a aprovação de
                    descontos.
                  </p>
                  <Link className="button" href="/vendedor/nova-proposta">
                    Criar primeira proposta
                  </Link>
                </>
              ) : state.orders.length ? (
                state.orders.slice(0, 5).map((o) => (
                  <div className="list-row" key={o.id}>
                    <b>{o.id}</b>
                    <span>{o.status}</span>
                    <strong>{money(o.total)}</strong>
                  </div>
                ))
              ) : (
                <div className="empty compact">
                  <Icon name="bag" size={32} />
                  <h3>A operação começa com uma surpresa.</h3>
                  <p>Conclua um checkout na loja para ver o pedido aqui.</p>
                  <Link className="text-link" href="/catalogo">
                    Explorar a loja →
                  </Link>
                </div>
              )}
            </section>
            <section className="panel">
              <h2>{seller ? "Como funciona" : "Precisa de atenção"}</h2>
              {seller ? (
                <ol className="workflow-list">
                  <li>Escolha um produto e um cliente fictício.</li>
                  <li>Até 10% de desconto: aprovação automática.</li>
                  <li>Acima de 10%: aprovação pelo administrador.</li>
                  <li>Abra o link da oferta e simule um pedido.</li>
                </ol>
              ) : (
                <>
                  {low.map((p) => (
                    <div className="list-row" key={p.id}>
                      <span>{p.name}</span>
                      <b>{p.stock} un.</b>
                    </div>
                  ))}
                  <Link className="text-link" href="/admin/estoque">
                    Gerenciar estoque →
                  </Link>
                  <p>{pending.length} desconto(s) aguardando aprovação.</p>
                </>
              )}
            </section>
          </div>
        </>
      )}
      {["produtos", "estoque", "catalogo"].includes(page) && (
        <>
          <div className="ops-filters">
            <input
              aria-label="Buscar produtos"
              placeholder="Buscar por nome…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              aria-label="Filtrar categoria"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {["Todos", ...categories].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <section className="panel">
            {page === "catalogo" ? (
              <div className="seller-grid">
                {filteredProducts.map((p) => (
                  <div className="seller-card" key={p.id}>
                    <ProductImage product={p} />
                    <h3>{p.name}</h3>
                    <p>
                      {money(p.price)} · {p.stock} un.
                    </p>
                    <Link
                      className="button outline"
                      href={"/vendedor/nova-proposta?produto=" + p.id}
                    >
                      Criar proposta
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              tableProducts(page === "estoque")
            )}
            {page === "estoque" && (
              <p className="fine-print">
                Ajustes salvos automaticamente apenas neste navegador. Não há
                reserva de estoque no backend.
              </p>
            )}
          </section>
        </>
      )}
      {page === "novo-produto" && (
        <form
          className="panel operation-form"
          onSubmit={(e) => {
            e.preventDefault();
            const id = "p-" + Date.now();
            const p: Product = {
              id,
              slug: id,
              name: newProduct.name,
              category: newProduct.category as Product["category"],
              price: Number(newProduct.price),
              stock: Number(newProduct.stock),
              description: newProduct.description,
              image: "/illustrations/kit.svg",
              customizable: true,
            };
            update((s) => ({ ...s, products: [...s.products, p] }));
            notify("Produto demonstrativo criado.");
            router.push("/admin/produtos");
          }}
        >
          <p>Crie um item fictício para explorar o cadastro e vê-lo na loja.</p>
          <label>
            Nome do produto
            <input
              required
              maxLength={80}
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
            />
          </label>
          <label>
            Categoria
            <select
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct({ ...newProduct, category: e.target.value })
              }
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <div className="form-grid">
            <label>
              Preço (R$)
              <input
                required
                type="number"
                min="0.01"
                step=".01"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
              />
            </label>
            <label>
              Estoque
              <input
                required
                type="number"
                min="0"
                step="1"
                value={newProduct.stock}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, stock: e.target.value })
                }
              />
            </label>
          </div>
          <label>
            Descrição
            <textarea
              required
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
            />
          </label>
          <p className="fine-print">
            O novo produto usará a ilustração genérica de presente.
          </p>
          <div className="form-actions">
            <Link className="button outline" href="/admin/produtos">
              Cancelar
            </Link>
            <button className="button">Salvar produto</button>
          </div>
        </form>
      )}
      {page === "nova-proposta" && (
        <form
          className="panel operation-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!proposalStockValid(items, state.products)) {
              notify("Quantidade maior que o estoque disponível.");
              return;
            }
            const id = "PRO-" + Date.now().toString(36).toUpperCase();
            update((s) => ({
              ...s,
              proposals: [
                {
                  id,
                  customer,
                  items: items.map((item) => ({ ...item })),
                  discount,
                  status: discount > 10 ? "Aguardando aprovação" : "Aprovada",
                },
                ...s.proposals,
              ],
            }));
            notify(
              discount > 10
                ? "Proposta enviada para aprovação."
                : "Proposta aprovada automaticamente.",
            );
            router.push("/vendedor/propostas");
          }}
        >
          <label>
            Cliente fictício
            <input
              required
              maxLength={80}
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Cliente Exemplo"
            />
          </label>
          <div className="proposal-items">
            {items.map((item, index) => {
              const selected = state.products.find(
                (p) => p.id === item.productId,
              );
              return (
                <fieldset className="proposal-item" key={index}>
                  <legend>Produto {index + 1}</legend>
                  <label>
                    Produto
                    <select
                      aria-label={"Produto " + (index + 1)}
                      value={item.productId}
                      onChange={(e) =>
                        editItem(index, {
                          productId: e.target.value,
                          quantity: 1,
                        })
                      }
                    >
                      {state.products
                        .filter(
                          (p) =>
                            p.stock > 0 &&
                            !items.some(
                              (line, i) =>
                                i !== index && line.productId === p.id,
                            ),
                        )
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} · {money(p.price)}
                          </option>
                        ))}
                    </select>
                  </label>
                  <div className="proposal-item-actions">
                    <label>
                      Quantidade
                      <input
                        aria-label={"Quantidade do produto " + (index + 1)}
                        required
                        type="number"
                        min="1"
                        max={selected?.stock || 1}
                        value={item.quantity}
                        onChange={(e) =>
                          editItem(index, { quantity: Number(e.target.value) })
                        }
                      />
                    </label>
                    <b>{money((selected?.price || 0) * item.quantity)}</b>
                    <button
                      type="button"
                      className="text-link"
                      disabled={items.length === 1}
                      aria-label={"Remover produto " + (index + 1)}
                      onClick={() =>
                        setItems((current) =>
                          current.filter((_, i) => i !== index),
                        )
                      }
                    >
                      Remover
                    </button>
                  </div>
                </fieldset>
              );
            })}
            <button
              type="button"
              className="button outline"
              disabled={
                !state.products.some(
                  (p) =>
                    p.stock > 0 &&
                    !items.some((item) => item.productId === p.id),
                )
              }
              onClick={() => {
                const next = state.products.find(
                  (p) =>
                    p.stock > 0 &&
                    !items.some((item) => item.productId === p.id),
                );
                if (next)
                  setItems((current) => [
                    ...current,
                    { productId: next.id, quantity: 1 },
                  ]);
              }}
            >
              + Adicionar produto
            </button>
          </div>
          <div className="form-grid">
            <label>
              Desconto (%)
              <input
                required
                type="number"
                min="0"
                max="50"
                step="1"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="notice">
            {discount > 10
              ? "Acima de 10%: a proposta aguarda aprovação do administrador."
              : "Até 10%: aprovação automática nesta demo."}
          </div>
          <div className="total">
            <span>Total da oferta</span>
            <b>{money(subtotal * (1 - discount / 100))}</b>
          </div>
          <button className="button">
            Criar proposta <Icon name="arrow" size={16} />
          </button>
        </form>
      )}
      {["propostas", "descontos"].includes(page) && (
        <section className="panel">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Proposta</th>
                  <th>Cliente</th>
                  <th>Desconto</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {state.proposals.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <b>{p.id}</b>
                      <small>
                        {proposalItems(p)
                          .map(
                            (item) =>
                              `${item.quantity}× ${state.products.find((i) => i.id === item.productId)?.name || "Produto indisponível"}`,
                          )
                          .join(" · ")}
                      </small>
                    </td>
                    <td>{p.customer}</td>
                    <td>{p.discount}%</td>
                    <td>
                      <span
                        className={
                          "badge " +
                          (p.status === "Aguardando aprovação" ? "warning" : "")
                        }
                      >
                        {p.status}
                      </span>
                    </td>
                    <td>
                      {page === "descontos" &&
                      p.status === "Aguardando aprovação" ? (
                        <button
                          className="button small"
                          onClick={() => {
                            update((s) => ({
                              ...s,
                              proposals: s.proposals.map((i) =>
                                i.id === p.id
                                  ? { ...i, status: "Aprovada" }
                                  : i,
                              ),
                            }));
                            notify("Desconto aprovado na demonstração.");
                          }}
                        >
                          Aprovar
                        </button>
                      ) : p.status === "Aprovada" ? (
                        <Link className="text-link" href={"/oferta/" + p.id}>
                          Abrir oferta ↗
                        </Link>
                      ) : p.status === "Convertida" ? (
                        "Pedido concluído"
                      ) : (
                        "Aguardando admin"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!state.proposals.length && (
            <div className="empty compact">
              <h3>Nenhuma proposta por aqui.</h3>
              <Link className="button" href="/vendedor/nova-proposta">
                Criar uma proposta
              </Link>
            </div>
          )}
          <p className="fine-print">
            Links de oferta são locais e não podem ser enviados para outro
            navegador.
          </p>
        </section>
      )}
      {page === "pedidos" && (
        <section className="panel">
          <div className="ops-filters">
            <input
              aria-label="Buscar pedido"
              placeholder="Número ou cliente…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              aria-label="Filtrar status"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {[
                "Todos",
                "Recebido",
                "Em preparação",
                "Enviado",
                "Entregue",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Valor</th>
                  <th>Pagamento</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {state.orders
                  .filter(
                    (o) =>
                      (filter === "Todos" || filter === o.status) &&
                      `${o.id} ${o.customer}`
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                  )
                  .map((o) => (
                    <tr key={o.id}>
                      <td>
                        <b>{o.id}</b>
                        <small>
                          {new Date(o.createdAt).toLocaleDateString("pt-BR")}
                        </small>
                      </td>
                      <td>{o.customer}</td>
                      <td>{money(o.total)}</td>
                      <td>
                        {o.payment}
                        <small>Simulado</small>
                      </td>
                      <td>
                        <select
                          aria-label={`Status do pedido ${o.id}`}
                          value={o.status}
                          onChange={(e) =>
                            update((s) => ({
                              ...s,
                              orders: s.orders.map((i) =>
                                i.id === o.id
                                  ? {
                                      ...i,
                                      status: e.target.value as Order["status"],
                                    }
                                  : i,
                              ),
                            }))
                          }
                        >
                          {[
                            "Recebido",
                            "Em preparação",
                            "Enviado",
                            "Entregue",
                          ].map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {!state.orders.length && (
            <div className="empty compact">
              <h3>Ainda não há pedidos.</h3>
              <p>
                Conclua uma compra simulada na loja para iniciar este fluxo.
              </p>
              <Link className="button" href="/catalogo">
                Ir para a loja
              </Link>
            </div>
          )}
        </section>
      )}
      {page === "financeiro" && (
        <Finance orders={state.orders} products={state.products} now={now} />
      )}
      {page === "equipe" && (
        <section className="panel">
          <h2>Perfis demonstrativos</h2>
          {members.map((m, i) => (
            <div className="list-row" key={m}>
              <span className="avatar">{m.slice(0, 2).toUpperCase()}</span>
              <b>{m}</b>
              <span>{i === 0 ? "Administrador" : "Vendedor"}</span>
              <span className="badge">Demo</span>
            </div>
          ))}
          <form
            className="inline-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (members.includes(member)) {
                notify("Este nome já está na lista.");
                return;
              }
              setMembers([...members, member]);
              setMember("");
              notify(
                "Perfil fictício adicionado nesta sessão. Nenhum convite foi enviado.",
              );
            }}
          >
            <input
              required
              maxLength={60}
              aria-label="Nome do perfil fictício"
              placeholder="Nome fictício do vendedor"
              value={member}
              onChange={(e) => setMember(e.target.value)}
            />
            <button className="button">Adicionar perfil</button>
          </form>
          <p className="fine-print">
            Perfis ilustrativos, sem autenticação ou permissões reais. Novos
            perfis duram somente nesta sessão da página.
          </p>
        </section>
      )}
      {![
        "dashboard",
        "produtos",
        "estoque",
        "catalogo",
        "novo-produto",
        "nova-proposta",
        "propostas",
        "descontos",
        "pedidos",
        "financeiro",
        "equipe",
      ].includes(page) && (
        <Link className="button" href={base}>
          Voltar ao painel
        </Link>
      )}
    </div>
  );
}
