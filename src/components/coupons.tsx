"use client";
import Link from "next/link";
import { coupons } from "@/services/coupons";
import { money } from "@/services/catalog";
import { useDemo, Icon } from "./demo-provider";
export function CouponSection({ compact = false }: { compact?: boolean }) {
  const { notify } = useDemo();
  return (
    <section
      className={
        compact
          ? "coupon-section container section"
          : "coupon-page container section"
      }
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">UM TEMA, UM CARINHO A MAIS</p>
          {compact ? (
            <h2>Escolha o momento. Encontre seu cupom.</h2>
          ) : (
            <h1>Presentes que combinam com o momento.</h1>
          )}
          <p className="coupon-intro">
            Cupons demonstrativos, aplicados somente aos produtos elegíveis.
          </p>
        </div>
        {compact && (
          <Link className="text-link" href="/cupons">
            Ver todos <Icon name="arrow" size={16} />
          </Link>
        )}
      </div>
      <div className="coupon-grid">
        {(compact ? coupons.slice(1, 4) : coupons).map((c) => (
          <article className={"campaign-card " + c.color} key={c.code}>
            <div>
              <p className="eyebrow">
                {c.firstOrderOnly
                  ? "BEM-VINDO POR AQUI"
                  : c.theme === "casa"
                    ? "CASA NOVA"
                    : c.theme === "bem-estar"
                      ? "BEM-ESTAR"
                      : c.theme === "celebrar"
                        ? "CELEBRAÇÃO"
                        : c.theme === "afeto"
                          ? "AMOR & CARINHO"
                          : "GOURMET"}
              </p>
              <h3>{c.title}</h3>
              <p>{c.description}</p>
              <span className="campaign-percent">
                {c.percent}
                <small>%</small> <i>OFF</i>
              </span>
            </div>
            <div className="campaign-code">
              <b>{c.code}</b>
              <button
                aria-label={"Copiar cupom " + c.code}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(c.code);
                    notify(`Cupom ${c.code} copiado. Cole na sacola.`);
                  } catch {
                    notify(`Seu cupom: ${c.code}. Digite na sacola.`);
                  }
                }}
              >
                Copiar código
              </button>
            </div>
            <Link className="campaign-link" href={"/catalogo?tema=" + c.theme}>
              Ver presentes elegíveis <Icon name="arrow" size={16} />
            </Link>
            <details>
              <summary>Condições do cupom</summary>
              <p>
                {c.categories.length
                  ? c.categories.join(", ")
                  : "Todas as categorias"}
                .{" "}
                {c.minimum
                  ? `Mínimo de ${money(c.minimum)} em produtos elegíveis.`
                  : "Sem valor mínimo."}{" "}
                Desconto máximo de {money(c.cap)}.{" "}
                {c.firstOrderOnly
                  ? "Somente no primeiro pedido demonstrativo. "
                  : ""}
                Um cupom por pedido, sem acumular com desconto de vendedor.
                Frete não participa do desconto.
              </p>
            </details>
          </article>
        ))}
      </div>
    </section>
  );
}
