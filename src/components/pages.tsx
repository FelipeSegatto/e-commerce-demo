"use client";
/* eslint-disable @next/next/no-img-element */
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon, useDemo } from "./demo-provider";
import { categories, money } from "@/services/catalog";
import { ProductCard } from "./product-card";
import { ProductImage } from "./product-image";
import { Catalog } from "./catalog";
import { CouponSection } from "./coupons";
import { HomeMerchandising } from "./home-merchandising";
import { Discovery } from "./discovery";
import { evaluateCoupon } from "@/services/coupons";
import { proposalMatchesCart } from "@/services/proposals";
import { Operations } from "./operations";

export function PageTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="page-title">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}
function Home({ banner }: { banner?: React.ReactNode }) {
  const { state } = useDemo();
  const featuredCoupon =
    state.coupons.find((c) => c.active !== false && c.firstOrderOnly) ||
    state.coupons.find((c) => c.active !== false);
  const biggestDiscount = Math.max(
    0,
    ...state.products.map((p) =>
      p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0,
    ),
  );
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="little-line" />
            PRESENTEAR É UM JEITO DE DIZER
          </p>
          <h1>
            Tem carinho
            <br />
            que cabe em
            <br />
            <em>um presente.</em>
          </h1>
          <p>
            Para celebrar, agradecer ou só lembrar:
            <br />
            “vi isso e pensei em você”. Encontre o seu jeito de presentear.
          </p>
          <Link className="button" href="/catalogo">
            Encontrar um presente <Icon name="arrow" size={18} />
          </Link>
          <span className="hero-footnote">
            ESCOLHIDOS COM CUIDADO. ENTREGUES COM CARINHO.
          </span>
        </div>
        <div className="hero-art">
          <img
            src="/photos/hero.jpg"
            alt="Composição de presente com embalagem clara e flores delicadas"
          />
          <span className="hero-stamp">
            Pequenos gestos
            <br />
            <i>grandes sentimentos</i>
          </span>
          <span className="hero-number">01 / UM BOM COMEÇO</span>
        </div>
      </section>
      <div className="benefits">
        <span>
          <Icon name="gift" />
          Embalagem que encanta
        </span>
        <span>
          <Icon name="heart" />
          Um cartão com suas palavras
        </span>
        <span>
          <Icon name="truck" />
          Entrega ou retirada
        </span>
        <span>
          <Icon name="check" />
          Cuidado em cada detalhe
        </span>
      </div>
      <section
        className="offers-banner container"
        aria-label="Ofertas especiais"
      >
        <div>
          <p className="eyebrow">BONS PRESENTES. MELHORES SURPRESAS.</p>
          <h2>
            Seu próximo gesto
            <br />
            <em>tem um preço especial.</em>
          </h2>
          <p>Uma seleção para encantar sem esperar uma grande ocasião.</p>
          <Link className="button" href="/catalogo?ofertas=1">
            Descobrir ofertas <Icon name="arrow" size={18} />
          </Link>
        </div>
        <div className="offers-visual">
          <img
            src="/photos/cesta-giftstore-2.jpg"
            alt="Composição gourmet com vinho e chocolates"
          />
          <span>
            ATÉ <b>{biggestDiscount}%</b> OFF
          </span>
        </div>
        <div className="offers-coupon">
          <Icon name="gift" size={28} />
          <span>
            {featuredCoupon?.firstOrderOnly
              ? "PRIMEIRA COMPRA?"
              : "UM CARINHO A MAIS"}
          </span>
          <b>{featuredCoupon?.code || "PRESENTEIE"}</b>
          <p>
            {featuredCoupon
              ? `${featuredCoupon.percent}% nos produtos elegíveis`
              : "Explore a seleção de presentes"}
          </p>
          <small>Demo · Não cumulativo com ofertas de vendedor</small>
        </div>
      </section>
      <section className="section container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CADA PESSOA, UM JEITO DE PRESENTEAR</p>
            <h2>O que combina com o seu carinho?</h2>
          </div>
        </div>
        <div className="category-grid">
          {categories.map((c, i) => (
            <a
              className="category-card"
              key={c}
              href={"/catalogo?categoria=" + encodeURIComponent(c)}
            >
              <span className="category-icon">
                {["✧", "▦", "♡", "☼", "▧", "✿", "◯", "◇"][i]}
              </span>
              <span>{c}</span>
              <Icon name="arrow" size={16} />
            </a>
          ))}
        </div>
      </section>
      <HomeMerchandising section="selection" />
      {banner}
      <HomeMerchandising section="home" />
      <HomeMerchandising section="budget" />
      <section className="personal-banner container">
        <div className="personal-art">
          <img
            src="/photos/gift-basket.jpg"
            alt="Cesta de chocolates e flores em embalagem para presente"
          />
        </div>
        <div>
          <p className="eyebrow">UM PRESENTE COM A SUA VOZ</p>
          <h2>
            O detalhe que faz
            <br />
            <em>ser só de vocês.</em>
          </h2>
          <p>
            Uma mensagem, uma cor, uma escolha especial.
            <br />
            Transforme um presente em uma lembrança.
          </p>
          <Link className="button light" href="/personalizados">
            Criar um presente único <Icon name="arrow" size={18} />
          </Link>
        </div>
      </section>
      <Discovery />
      <HomeMerchandising section="rituals" />
      <CouponSection compact />
      <section className="section container manifesto">
        <p className="eyebrow">MAIS DO QUE COISAS, CONEXÕES</p>
        <h2>
          Não precisa de uma grande ocasião.
          <br />
          Só de alguém que importa.
        </h2>
        <Link className="text-link" href="/sobre">
          Conheça a Gift Store <Icon name="arrow" size={16} />
        </Link>
      </section>
    </>
  );
}
function ProductDetail({ slug }: { slug: string }) {
  const { state, ready, add } = useDemo();
  const p = state.products.find((p) => p.slug === slug);
  const [option, setOption] = useState("");
  const [message, setMessage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  if (!p)
    return (
      <div className="empty">
        <h1>{ready ? "Presente não encontrado" : "Carregando presente…"}</h1>
        <Link href="/catalogo">Voltar ao catálogo</Link>
      </div>
    );
  return (
    <div className="container section">
      <div className="breadcrumb">
        <Link href="/">Início</Link> / <Link href="/catalogo">Presentes</Link> /{" "}
        {p.name}
      </div>
      <div className="detail-grid">
        <div className="detail-image">
          <ProductImage product={p} option={option} loading="eager" />
        </div>
        <div className="detail-copy">
          <p className="eyebrow">
            {p.category} · {p.stock ? "DISPONÍVEL" : "ESGOTADO"}
          </p>
          <h1>{p.name}</h1>
          <div className="detail-price">
            {money(p.price)}{" "}
            {p.originalPrice && <del>{money(p.originalPrice)}</del>}
          </div>
          <p>{p.description}</p>
          <div className="product-attributes">
            {p.brand && (
              <span>
                Marca <b>{p.brand}</b>
              </span>
            )}
            {p.subcategory && (
              <span>
                Tipo <b>{p.subcategory}</b>
              </span>
            )}
            {p.color && (
              <span>
                Cor <b>{p.color}</b>
              </span>
            )}
            {p.material && (
              <span>
                Material <b>{p.material}</b>
              </span>
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (p.options && !option) {
                setError("Escolha uma opção antes de adicionar.");
                return;
              }
              setError("");
              add({ productId: p.id, quantity, option, message });
            }}
          >
            {p.options && (
              <fieldset>
                <legend>Escolha a opção</legend>
                <div className="option-list">
                  {p.options.map((o) => (
                    <button
                      type="button"
                      key={o}
                      className={option === o ? "selected" : ""}
                      onClick={() => setOption(o)}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
            {p.customizable && (
              <label>
                Uma mensagem para o cartão{" "}
                <span className="muted">(opcional)</span>
                <textarea
                  maxLength={180}
                  placeholder="Escreva algo que só você diria…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <small>{message.length}/180 caracteres</small>
              </label>
            )}
            <div className="buy-row">
              <label className="quantity-label">
                Quantidade
                <input
                  aria-label="Quantidade"
                  type="number"
                  min="1"
                  max={Math.max(1, p.stock)}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(
                        1,
                        Math.min(p.stock, Number(e.target.value) || 1),
                      ),
                    )
                  }
                />
              </label>
              <button className="button" disabled={!p.stock} type="submit">
                <Icon name="bag" />
                {p.stock ? "Adicionar à sacola" : "Produto indisponível"}
              </button>
            </div>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
          </form>
          <Link className="text-link" href="/sacola">
            Ver minha sacola <Icon name="arrow" size={16} />
          </Link>
          <div className="detail-perks">
            <span>
              <Icon name="gift" size={18} />
              Embalagem para presente inclusa
            </span>
            <span>
              <Icon name="truck" size={18} />
              Entrega ou retirada na simulação
            </span>
          </div>
        </div>
      </div>
      <div className="section-heading related-heading">
        <h2>Outros jeitos de fazer sorrir</h2>
      </div>
      <div className="product-grid">
        {state.products
          .filter((i) => i.id !== p.id)
          .sort(
            (a, b) =>
              Number(b.category === p.category) -
              Number(a.category === p.category),
          )
          .slice(0, 4)
          .map((i) => (
            <ProductCard key={i.id} product={i} />
          ))}
      </div>
    </div>
  );
}
function Cart() {
  const { state, update, add, notify } = useDemo();
  const [coupon, setCoupon] = useState("");
  const params = useSearchParams();
  const [appliedCoupon, setAppliedCoupon] = useState(params.get("cupom") || "");
  const couponResult = evaluateCoupon(
    appliedCoupon,
    state.cart,
    state.products,
    state.orders.length,
    state.coupons,
  );
  const subtotal = state.cart.reduce(
    (n, i) =>
      n +
      (state.products.find((p) => p.id === i.productId)?.price || 0) *
        i.quantity,
    0,
  );
  if (!state.cart.length)
    return (
      <div className="empty">
        <Icon name="bag" size={48} />
        <h1>Sua sacola espera por um carinho.</h1>
        <p>Escolha um presente e comece uma boa surpresa.</p>
        <Link className="button" href="/catalogo">
          Explorar presentes <Icon name="arrow" />
        </Link>
      </div>
    );
  return (
    <div className="container section">
      <PageTitle
        eyebrow="QUASE PRONTO PARA SURPREENDER"
        title="Sua sacola"
        description="Confira cada detalhe do seu presente."
      />
      <div className="cart-layout">
        <div className="cart-list">
          {state.cart.map((item) => {
            const p = state.products.find((p) => p.id === item.productId);
            if (!p) return null;
            return (
              <article className="cart-item" key={item.key}>
                <Link href={"/produto/" + p.slug}>
                  <ProductImage product={p} option={item.option} />
                </Link>
                <div>
                  <p className="eyebrow">{p.category}</p>
                  <Link href={"/produto/" + p.slug}>
                    <h3>{p.name}</h3>
                  </Link>
                  {item.option && <p>{item.option}</p>}
                  {item.message && (
                    <p className="gift-message">Cartão: “{item.message}”</p>
                  )}
                  <div className="quantity-controls">
                    <button
                      aria-label={`Diminuir quantidade de ${p.name}`}
                      onClick={() =>
                        update((s) => ({
                          ...s,
                          cart: s.cart.flatMap((i) =>
                            i.key === item.key
                              ? i.quantity === 1
                                ? []
                                : [{ ...i, quantity: i.quantity - 1 }]
                              : [i],
                          ),
                        }))
                      }
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      aria-label={`Aumentar quantidade de ${p.name}`}
                      onClick={() => add({ ...item, quantity: 1 })}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="remove"
                    onClick={() =>
                      update((s) => ({
                        ...s,
                        cart: s.cart.filter((i) => i.key !== item.key),
                      }))
                    }
                  >
                    Remover
                  </button>
                </div>
                <strong>{money(p.price * item.quantity)}</strong>
              </article>
            );
          })}
          <Link className="text-link" href="/catalogo">
            ← Continuar escolhendo
          </Link>
        </div>
        <aside className="summary">
          <h2>Resumo do carinho</h2>
          <div>
            <span>Produtos</span>
            <b>{money(subtotal)}</b>
          </div>
          <div>
            <span>Entrega</span>
            <span>No checkout</span>
          </div>
          <form
            className="coupon"
            onSubmit={(e) => {
              e.preventDefault();
              const result = evaluateCoupon(
                coupon,
                state.cart,
                state.products,
                state.orders.length,
                state.coupons,
              );
              setAppliedCoupon(result.valid ? result.coupon!.code : "");
              notify(result.message);
            }}
          >
            <input
              aria-label="Cupom de desconto"
              placeholder="Cupom de desconto"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
            />
            <button>Aplicar</button>
          </form>
          {couponResult.valid && (
            <div>
              <span>
                {couponResult.coupon!.code} ({couponResult.coupon!.percent}%)
              </span>
              <b>− {money(couponResult.discount)}</b>
            </div>
          )}
          {appliedCoupon && !couponResult.valid && (
            <p className="error" role="alert">
              {couponResult.message}
            </p>
          )}
          {couponResult.valid && (
            <button className="remove" onClick={() => setAppliedCoupon("")}>
              Remover cupom
            </button>
          )}
          <Link className="text-link" href="/cupons">
            Descobrir cupons por tema
          </Link>
          <div className="total">
            <span>Subtotal</span>
            <b>{money(subtotal - couponResult.discount)}</b>
          </div>
          <Link
            className="button"
            href={
              "/checkout" +
              (couponResult.valid ? "?cupom=" + couponResult.coupon!.code : "")
            }
          >
            Continuar para checkout <Icon name="arrow" size={16} />
          </Link>
          <p className="fine-print">
            Demonstração: nenhuma cobrança será realizada.
          </p>
        </aside>
      </div>
    </div>
  );
}
function Checkout() {
  const { state, update, notify } = useDemo();
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState("");
  const [delivery, setDelivery] = useState("retirada");
  const [payment, setPayment] = useState("Pix");
  const [form, setForm] = useState({
    name: "",
    email: "",
    cep: "",
    street: "",
    number: "",
    city: "",
  });
  const steps = [
    "Identificação",
    "Endereço",
    "Entrega",
    "Pagamento",
    "Revisão",
  ];
  const subtotal = state.cart.reduce(
    (n, i) =>
      n +
      (state.products.find((p) => p.id === i.productId)?.price || 0) *
        i.quantity,
    0,
  );
  const proposal = state.proposals.find(
    (p) => p.id === params.get("oferta") && p.status === "Aprovada",
  );
  const validProposal = proposal && proposalMatchesCart(proposal, state.cart);
  const couponResult = evaluateCoupon(
    params.get("cupom") || "",
    state.cart,
    state.products,
    state.orders.length,
    state.coupons,
  );
  const discountAmount = validProposal
    ? Math.round(subtotal * proposal.discount) / 100
    : couponResult.discount;
  const discounted = discountAmount > 0;
  const total =
    Math.round(
      (subtotal - discountAmount + (delivery === "entrega" ? 19.9 : 0)) * 100,
    ) / 100;
  function field(
    key: keyof typeof form,
    label: string,
    type = "text",
    pattern?: string,
  ) {
    return (
      <label>
        {label}
        <input
          required
          type={type}
          pattern={pattern}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        />
      </label>
    );
  }
  if (done)
    return (
      <div className="empty confirmation">
        <span className="success-icon">
          <Icon name="check" size={44} />
        </span>
        <p className="eyebrow">SIMULAÇÃO CONCLUÍDA</p>
        <h1>Um presente, muitas possibilidades.</h1>
        <p>
          O pedido <strong>{done}</strong> foi criado na demonstração.
          <br />
          Não houve pagamento nem envio de produtos.
        </p>
        <Link className="button" href="/conta">
          Acompanhar meu pedido
        </Link>
        <Link className="text-link" href="/catalogo">
          Continuar explorando
        </Link>
      </div>
    );
  if (params.get("oferta") && !validProposal)
    return (
      <div className="empty">
        <h1>Esta oferta não está disponível para compra.</h1>
        <p>
          Ela pode ter sido concluída, aguardar aprovação ou não corresponder
          aos produtos da sacola. Revise a proposta antes de continuar.
        </p>
        <Link className="button" href="/vendedor/propostas">
          Revisar propostas
        </Link>
      </div>
    );
  if (!state.cart.length)
    return (
      <div className="empty">
        <h1>Primeiro, escolha um presente.</h1>
        <Link className="button" href="/catalogo">
          Ver catálogo
        </Link>
      </div>
    );
  return (
    <div className="container section">
      <PageTitle eyebrow="FALTA POUCO" title="Prepare a sua surpresa" />
      <ol className="checkout-steps">
        {steps.map((s, i) => (
          <li
            className={i === step ? "current" : i < step ? "complete" : ""}
            key={s}
          >
            <span>{i < step ? "✓" : i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
      <div className="cart-layout">
        <form
          className="checkout-form panel"
          onSubmit={(e) => {
            e.preventDefault();
            if (step < 4) {
              setStep(step + 1);
              return;
            }
            if (
              state.cart.some(
                (i) =>
                  state.cart
                    .filter((c) => c.productId === i.productId)
                    .reduce((n, c) => n + c.quantity, 0) >
                  (state.products.find((p) => p.id === i.productId)?.stock ||
                    0),
              )
            ) {
              notify("O estoque mudou. Revise as quantidades na sacola.");
              return;
            }
            const id = "GS-" + Date.now().toString(36).toUpperCase();
            update((s) => ({
              ...s,
              orders: [
                {
                  id,
                  createdAt: new Date().toISOString(),
                  items: s.cart.map((item) => ({
                    ...item,
                    unitPrice:
                      s.products.find((p) => p.id === item.productId)?.price ||
                      0,
                  })),
                  total,
                  delivery,
                  payment,
                  status: "Recebido",
                  customer: form.name,
                  channel: "online",
                  seller: validProposal
                    ? proposal.seller || "Vendedor Demo"
                    : undefined,
                  proposalId: validProposal ? proposal.id : undefined,
                  coupon:
                    !validProposal && couponResult.valid
                      ? couponResult.coupon!.code
                      : undefined,
                  discount: discountAmount,
                },
                ...s.orders,
              ],
              products: s.products.map((p) => ({
                ...p,
                stock:
                  p.stock -
                  s.cart
                    .filter((i) => i.productId === p.id)
                    .reduce((n, i) => n + i.quantity, 0),
              })),
              proposals: s.proposals.map((p) =>
                validProposal && p.id === proposal.id
                  ? { ...p, status: "Convertida" }
                  : p,
              ),
              cart: [],
              session: "Cliente Demo",
            }));
            setDone(id);
          }}
        >
          <h2>{steps[step]}</h2>
          {step === 0 && (
            <>
              <p>Use dados fictícios para experimentar este fluxo.</p>
              {field("name", "Nome para o pedido")}
              {field("email", "E-mail demonstrativo", "email")}
            </>
          )}
          {step === 1 && (
            <>
              <p>Endereço fictício, apenas para a simulação da entrega.</p>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={delivery === "retirada"}
                  onChange={(e) =>
                    setDelivery(e.target.checked ? "retirada" : "entrega")
                  }
                />{" "}
                Vou retirar na loja
              </label>
              {delivery === "entrega" && (
                <>
                  {field(
                    "cep",
                    "CEP (8 dígitos)",
                    "text",
                    "[0-9]{5}-?[0-9]{3}",
                  )}
                  {field("street", "Rua")}
                  <div className="form-grid">
                    {field("number", "Número")}
                    {field("city", "Cidade")}
                  </div>
                </>
              )}
            </>
          )}
          {step === 2 && (
            <>
              <label
                className={
                  "radio-card " + (delivery === "retirada" ? "selected" : "")
                }
              >
                <input
                  type="radio"
                  name="delivery"
                  checked={delivery === "retirada"}
                  onChange={() => setDelivery("retirada")}
                />
                <span>
                  <b>Retirada na loja</b>
                  <small>Grátis · Pronto em até 2 dias úteis (simulação)</small>
                </span>
              </label>
              <label
                className={
                  "radio-card " + (delivery === "entrega" ? "selected" : "")
                }
              >
                <input
                  type="radio"
                  name="delivery"
                  checked={delivery === "entrega"}
                  onChange={() => {
                    setDelivery("entrega");
                    if (!form.street) setStep(1);
                  }}
                />
                <span>
                  <b>Entrega padrão · {money(19.9)}</b>
                  <small>
                    3 a 5 dias úteis · Valor demonstrativo, sem consulta de CEP
                  </small>
                </span>
              </label>
            </>
          )}
          {step === 3 && (
            <>
              <p>
                Escolha uma forma de pagamento para visualizar o pedido. Não
                solicitamos dados bancários.
              </p>
              {["Pix", "Cartão de crédito"].map((p) => (
                <label
                  className={"radio-card " + (payment === p ? "selected" : "")}
                  key={p}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === p}
                    onChange={() => setPayment(p)}
                  />
                  <span>
                    <b>{p}</b>
                    <small>
                      {p === "Pix"
                        ? "Confirmação simulada, sem QR Code real"
                        : "Nenhum número de cartão será coletado"}
                    </small>
                  </span>
                </label>
              ))}
            </>
          )}
          {step === 4 && (
            <>
              <p>Confira antes de concluir a simulação.</p>
              <div className="review-row">
                <b>{form.name}</b>
                <span>{form.email}</span>
              </div>
              <div className="review-row">
                <b>
                  {delivery === "retirada"
                    ? "Retirada na loja"
                    : "Entrega padrão"}
                </b>
                <span>
                  {delivery === "entrega"
                    ? `${form.street}, ${form.number} · ${form.city} · ${form.cep}`
                    : "Endereço e retirada demonstrativos"}
                </span>
              </div>
              <div className="review-row">
                <b>{payment}</b>
                <span>Pagamento simulado</span>
              </div>
              <label className="check-label">
                <input type="checkbox" required /> Entendo que este é um pedido
                demonstrativo.
              </label>
            </>
          )}
          <div className="form-actions">
            {step > 0 && (
              <button
                className="button outline"
                type="button"
                onClick={() => setStep(step - 1)}
              >
                Voltar
              </button>
            )}
            <button className="button" type="submit">
              {step === 4 ? "Concluir simulação" : "Continuar"}{" "}
              <Icon name="arrow" size={16} />
            </button>
          </div>
        </form>
        <aside className="summary">
          <h2>Seu presente</h2>
          {state.cart.map((i) => (
            <div key={i.key}>
              <span>
                {i.quantity} ×{" "}
                {state.products.find((p) => p.id === i.productId)?.name}
              </span>
              <b>
                {money(
                  (state.products.find((p) => p.id === i.productId)?.price ||
                    0) * i.quantity,
                )}
              </b>
            </div>
          ))}
          {params.get("cupom") && !validProposal && !couponResult.valid && (
            <p className="error" role="alert">
              {couponResult.message}
            </p>
          )}
          {discounted && (
            <div>
              <span>
                {validProposal
                  ? "Desconto da oferta"
                  : "Cupom " + couponResult.coupon?.code}
              </span>
              <b>− {money(discountAmount)}</b>
            </div>
          )}
          <div>
            <span>Entrega</span>
            <b>{delivery === "entrega" ? money(19.9) : "Grátis"}</b>
          </div>
          <div className="total">
            <span>Total</span>
            <b>{money(total)}</b>
          </div>
          <p className="fine-print">
            Todos os dados deste checkout ficam apenas neste navegador.
          </p>
        </aside>
      </div>
    </div>
  );
}
function Auth({ register = false }: { register?: boolean }) {
  const { update, notify } = useDemo();
  const router = useRouter();
  const [name, setName] = useState("");
  return (
    <div className="auth-layout">
      <div className="auth-story">
        <p className="eyebrow">GIFT STORE</p>
        <h1>
          Os seus próximos
          <br />
          <em>bons momentos.</em>
        </h1>
        <img src="/photos/gift-basket.jpg" alt="Presente com laço" />
      </div>
      <div className="auth-form">
        <PageTitle
          eyebrow="BEM-VINDO POR AQUI"
          title={
            register
              ? "Comece sua coleção de momentos"
              : "Que bom te ver de novo"
          }
          description="Este acesso é demonstrativo. Use dados fictícios."
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update((s) => ({ ...s, session: name || "Cliente Demo" }));
            router.push("/conta");
            notify("Perfil demonstrativo ativado.");
          }}
        >
          {register && (
            <label>
              Como podemos te chamar?
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          )}
          <label>
            E-mail
            <input required type="email" placeholder="demo@example.com" />
          </label>
          <label>
            Senha fictícia
            <input
              required
              type="password"
              minLength={6}
              autoComplete="off"
              placeholder="Use uma senha fictícia (6 caracteres)"
            />
          </label>
          {register && (
            <label className="check-label">
              <input type="checkbox" required /> Concordo com o uso
              demonstrativo deste perfil.
            </label>
          )}
          <button className="button">
            {register ? "Criar conta demonstrativa" : "Entrar na demonstração"}{" "}
            <Icon name="arrow" size={16} />
          </button>
        </form>
        {!register && (
          <button
            className="text-link"
            onClick={() =>
              notify(
                "Acesso simulado: use qualquer e-mail válido e uma senha fictícia de 6 caracteres.",
              )
            }
          >
            Como funciona o acesso?
          </button>
        )}
        <p>
          {register ? "Já está por aqui?" : "Ainda não tem uma conta?"}{" "}
          <Link className="text-link" href={register ? "/entrar" : "/cadastro"}>
            {register ? "Entrar" : "Criar uma conta"}
          </Link>
        </p>
      </div>
    </div>
  );
}
function Account() {
  const { state, update, notify } = useDemo();
  const [tab, setTab] = useState("pedidos");
  const [name, setName] = useState(state.session || "Cliente Demo");
  const [address, setAddress] = useState("");
  const [savedAddress, setSavedAddress] = useState("");
  return (
    <div className="container section">
      <PageTitle
        eyebrow="SEU CANTINHO"
        title={`Olá, ${state.session || "Cliente Demo"}.`}
        description="Seus presentes e suas próximas boas surpresas."
      />
      <div className="account-layout">
        <nav className="account-nav">
          {[
            ["pedidos", "Meus pedidos"],
            ["dados", "Meus dados"],
            ["enderecos", "Endereços"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={tab === id ? "active" : ""}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
          <Link href="/favoritos">Meus favoritos</Link>
          <Link
            href="/"
            onClick={() => update((s) => ({ ...s, session: null }))}
          >
            Sair do perfil
          </Link>
        </nav>
        <div className="panel">
          <h2>
            {tab === "pedidos"
              ? "Meus pedidos"
              : tab === "dados"
                ? "Meus dados"
                : "Endereços"}
          </h2>
          {tab === "pedidos" &&
            (state.orders.length ? (
              state.orders.map((o) => (
                <details className="order-card" key={o.id}>
                  <summary>
                    <strong>{o.id}</strong>
                    <span>
                      {new Date(o.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="badge">{o.status}</span>
                    <b>{money(o.total)}</b>
                  </summary>
                  <div className="order-detail">
                    {o.items.map((i) => (
                      <p key={i.key}>
                        {i.quantity} ×{" "}
                        {state.products.find((p) => p.id === i.productId)?.name}
                        {i.option && ` · ${i.option}`}
                        {i.message && ` · Cartão: ${i.message}`}
                      </p>
                    ))}
                    <p>
                      {o.delivery === "entrega"
                        ? "Entrega padrão"
                        : "Retirada na loja"}{" "}
                      · {o.payment} · Simulação sem cobrança
                    </p>
                  </div>
                </details>
              ))
            ) : (
              <div className="empty compact">
                <Icon name="gift" size={36} />
                <h3>Uma boa surpresa começa aqui.</h3>
                <p>Seus pedidos demonstrativos aparecerão neste espaço.</p>
                <Link className="button" href="/catalogo">
                  Escolher presente
                </Link>
              </div>
            ))}
          {tab === "dados" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                update((s) => ({ ...s, session: name }));
                notify("Nome do perfil demonstrativo atualizado.");
              }}
            >
              <p>Use somente informações fictícias.</p>
              <label>
                Nome de exibição
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <button className="button">Salvar perfil</button>
            </form>
          )}
          {tab === "enderecos" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSavedAddress(address);
                notify("Endereço demonstrativo adicionado nesta sessão.");
              }}
            >
              <p>Exemplo de cadastro de endereço, sem consulta externa.</p>
              {savedAddress && <div className="notice">{savedAddress}</div>}
              <label>
                Endereço fictício
                <input
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua Exemplo, 123 · Cidade Demo"
                />
              </label>
              <button className="button">Adicionar endereço</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
function Info({ page }: { page: string }) {
  const { notify } = useDemo();
  if (page === "contato")
    return (
      <div className="container section">
        <PageTitle
          eyebrow="VAMOS CONVERSAR"
          title="Todo carinho começa com uma conversa."
          description="Deixe uma mensagem para experimentar o fluxo de atendimento."
        />
        <div className="info-grid">
          <div>
            <h2>Conte com a gente</h2>
            <p>
              Tem uma ideia de presente? Quer personalizar uma surpresa? Este é
              o espaço para começar.
            </p>
            <div className="notice">
              Canal demonstrativo. Nenhuma mensagem será enviada.
            </div>
          </div>
          <form
            className="panel"
            onSubmit={(e) => {
              e.preventDefault();
              notify(
                "Mensagem simulada recebida. Nenhum contato externo foi realizado.",
              );
              e.currentTarget.reset();
            }}
          >
            <label>
              Nome fictício
              <input required />
            </label>
            <label>
              E-mail fictício
              <input required type="email" />
            </label>
            <label>
              Sua mensagem
              <textarea required minLength={5} />
            </label>
            <button className="button">
              Simular envio <Icon name="arrow" size={16} />
            </button>
          </form>
        </div>
      </div>
    );
  if (page === "politicas")
    return (
      <div className="container section prose">
        <PageTitle
          eyebrow="CUIDADO TAMBÉM É TRANSPARÊNCIA"
          title="Entrega, trocas e privacidade"
        />
        {[
          [
            "Sobre esta demonstração",
            "Gift Store é uma demonstração de loja de presentes com vendas híbridas: o vendedor monta uma proposta com vários produtos, que pode ser usada pelo cliente no checkout online ou concluída pelo vendedor no atendimento físico. Descontos acima de 10% aguardam aprovação do admin. Ao concluir, o sistema gera o pedido, identifica canal e vendedor e baixa o estoque. Não há pagamentos ou entregas reais. Os dados e links de oferta ficam neste navegador.",
          ],
          [
            "Entrega e retirada",
            "O checkout permite explorar entrega padrão por R$ 19,90 ou retirada gratuita. Os prazos são exemplos, sem integração logística.",
          ],
          [
            "Trocas e devoluções",
            "Uma política comercial real será definida antes de qualquer operação de venda. Na demo, você pode reiniciar os dados no seletor de perfis.",
          ],
          [
            "Seus dados",
            "Sacola, favoritos, pedidos e alterações administrativas ficam no armazenamento local deste navegador. Use apenas dados fictícios. Não coletamos números de cartão ou documentos pessoais.",
          ],
          [
            "Próximas integrações",
            "Autenticação, catálogo, estoque, pedidos, frete e pagamento precisarão de serviços de backend e validação de regras antes do lançamento.",
          ],
        ].map(([title, text]) => (
          <details key={title} open>
            <summary>{title}</summary>
            <p>{text}</p>
          </details>
        ))}
      </div>
    );
  return (
    <div className="container section">
      <div className="about-grid">
        <div>
          <p className="eyebrow">PRESENTES PARA SENTIR</p>
          <h1>
            A gente acredita
            <br />
            no poder dos
            <br />
            <em>pequenos gestos.</em>
          </h1>
          <p>
            Um chocolate para adoçar um dia corrido. Um perfume que vira
            lembrança. Um quadro que faz uma casa parecer mais sua.
          </p>
          <p>
            A Gift Store nasce dessa ideia: presentear é perceber o outro. É
            escolher, com tempo e carinho, algo que diz “você importa”.
          </p>
          <Link className="button" href="/catalogo">
            Encontre seu próximo gesto <Icon name="arrow" size={16} />
          </Link>
          <p className="fine-print">
            História e marca criadas exclusivamente para esta demonstração.
          </p>
          <h2>Uma loja, dois jeitos de comprar.</h2>
          <p>
            Esta demo combina compras online e atendimento presencial. O
            vendedor monta uma proposta com vários presentes e o cliente pode
            usá-la no checkout ou concluir a compra na loja com o vendedor. O
            desconto aprovado acompanha a oferta; a conclusão cria o pedido e
            atualiza o estoque.
          </p>
          <p className="fine-print">
            Pagamentos são simulados. Ofertas e pedidos ficam salvos neste
            navegador.
          </p>
        </div>
        <img src="/photos/hero.jpg" alt="Composição de presentes com flores" />
      </div>
    </div>
  );
}
function PageContent({
  path,
  banner,
}: {
  path: string;
  banner?: React.ReactNode;
}) {
  const query = useSearchParams().toString();
  if (
    path.startsWith("/admin") ||
    path.startsWith("/vendedor") ||
    path.startsWith("/oferta")
  )
    return <Operations key={path + query} path={path} />;
  if (path === "/") return <Home banner={banner} />;
  if (path === "/catalogo") return <Catalog key={path} />;
  if (path === "/cupons") return <CouponSection />;
  if (path === "/presentear") return <Discovery full />;
  if (path === "/favoritos") return <Catalog favorites />;
  if (path === "/personalizados") return <Catalog custom />;
  if (path.startsWith("/produto/"))
    return <ProductDetail key={path} slug={path.split("/")[2]} />;
  if (path === "/sacola") return <Cart />;
  if (path === "/checkout") return <Checkout />;
  if (path === "/entrar" || path === "/cadastro")
    return <Auth key={path} register={path === "/cadastro"} />;
  if (path === "/conta") return <Account />;
  if (["/sobre", "/contato", "/politicas"].includes(path))
    return <Info page={path.slice(1)} />;
  return (
    <div className="empty">
      <h1>Página não encontrada</h1>
      <Link className="button" href="/">
        Voltar ao início
      </Link>
    </div>
  );
}

const subscribeToHydration = () => () => {};
export function DemoPage({
  path,
  banner,
}: {
  path: string;
  banner?: React.ReactNode;
}) {
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  return (
    <>
      <span hidden data-demo-page={hydrated ? path : undefined} />
      <PageContent path={path} banner={banner} />
    </>
  );
}
