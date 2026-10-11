"use client";
import { useRef } from "react";
import Link from "next/link";
import type { Product } from "@/domain/types";
import { money } from "@/services/catalog";
import { useDemo, Icon } from "./demo-provider";
import { ProductCard } from "./product-card";
import { ProductImage } from "./product-image";
const selection = [
  "libre-yves-saint-laurent",
  "vaso-de-vidro-colorido",
  "rosas-rose",
  "selecao-de-bombons-godiva",
  "vela-maison",
  "kit-pausa-para-o-cha",
  "almofada-textura-creme",
  "tobacco-vanille-tom-ford",
];
const home = [
  "manta-listrada-com-franjas",
  "lanterna-decorativa",
  "quadro-abstrato-terracota",
];
const rituals = [
  "soleil-neige-tom-ford",
  "gloam-aesop",
  "duo-de-limpeza-aesop",
  "sabonete-liquido-verbena",
  "kit-de-cuidados-faciais-aesop",
  "balsamo-labial-karite",
];
function pick(products: Product[], slugs: string[]) {
  return slugs.flatMap((slug) => {
    const p = products.find((p) => p.slug === slug);
    return p ? [p] : [];
  });
}
function Shelf({
  products,
  eyebrow,
  title,
  description,
  href,
  label,
}: {
  products: Product[];
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  label: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (direction: number) =>
    track.current?.scrollBy({
      left: direction * track.current.clientWidth,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  return (
    <section className="section container home-shelf" aria-label={title}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p className="shelf-description">{description}</p>
        </div>
        <Link className="text-link" href={href}>
          {label}
          <Icon name="arrow" size={16} />
        </Link>
      </div>
      <div
        className="product-shelf"
        ref={track}
        tabIndex={0}
        role="region"
        aria-label={`Produtos: ${title}`}
      >
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <div className="shelf-footer">
        <span>{products.length} ideias escolhidas para você</span>
        <div>
          <button
            aria-label={`Produtos anteriores: ${title}`}
            onClick={() => scroll(-1)}
          >
            <Icon name="arrow" size={18} />
          </button>
          <button
            aria-label={`Próximos produtos: ${title}`}
            onClick={() => scroll(1)}
          >
            <Icon name="arrow" size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
export function HomeMerchandising({
  section,
}: {
  section: "selection" | "home" | "budget" | "rituals";
}) {
  const { state } = useDemo();
  if (section === "selection")
    return (
      <section
        className="section container home-curation"
        aria-label="Escolhidos para encantar"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">O NOSSO OLHAR, A SUA ESCOLHA</p>
            <h2>Escolhidos para encantar.</h2>
            <p className="shelf-description">
              Formas bonitas, bons aromas e pequenos motivos para surpreender.
            </p>
          </div>
          <Link className="text-link" href="/catalogo">
            Explorar o catálogo
            <Icon name="arrow" size={16} />
          </Link>
        </div>
        <div className="product-grid">
          {pick(state.products, selection).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    );
  if (section === "home") {
    const feature = state.products.find(
      (p) => p.slug === "vaso-branco-ondulado",
    );
    return (
      <section
        className="section container home-editorial"
        aria-label="Um novo olhar para a casa"
      >
        <div className="editorial-feature">
          <div>
            <p className="eyebrow">TEXTURAS, FORMAS E ACONCHEGO</p>
            <h2>
              Um novo olhar
              <br />
              <em>para a casa.</em>
            </h2>
            <p>
              Peças que conversam entre si.
              <br />E fazem qualquer canto ganhar afeto.
            </p>
            <Link className="text-link" href="/catalogo?tema=casa">
              Ver a coleção para casa
              <Icon name="arrow" size={16} />
            </Link>
          </div>
          {feature && (
            <Link
              className="editorial-feature-product"
              href={"/produto/" + feature.slug}
            >
              <ProductImage product={feature} />
              <span>
                {feature.name}
                <b>{money(feature.price)}</b>
                <Icon name="arrow" size={18} />
              </span>
            </Link>
          )}
        </div>
        <div className="editorial-picks">
          <p className="eyebrow">COMBINA COM ESSE MOMENTO</p>
          {pick(state.products, home).map((p) => (
            <Link
              key={p.id}
              className="editorial-product"
              href={"/produto/" + p.slug}
            >
              <ProductImage product={p} />
              <span>
                <small>{p.subcategory}</small>
                <h3>{p.name}</h3>
                <b>{money(p.price)}</b>
              </span>
              <Icon name="arrow" size={18} />
            </Link>
          ))}
          <Link
            className="text-link"
            href="/catalogo?categoria=Casa%20%26%20decora%C3%A7%C3%A3o"
          >
            Todos os detalhes para casa
            <Icon name="arrow" size={16} />
          </Link>
        </div>
      </section>
    );
  }
  if (section === "budget") {
    const preferred = [
      "lip-balm-creamy",
      "folha-decorativa-de-palmeira",
      "jogo-americano-natural",
      "sabonete-em-barra-verbena",
      "baloes-pastel",
      "lindor-ao-leite",
    ];
    const eligible = state.products.filter(
      (p) =>
        p.price <= 75 &&
        p.stock > 0 &&
        !selection.includes(p.slug) &&
        !home.includes(p.slug) &&
        !rituals.includes(p.slug),
    );
    const chosen = pick(eligible, preferred);
    const products = [
      ...chosen,
      ...eligible.filter((p) => !chosen.includes(p)),
    ].slice(0, 6);
    return (
      <Shelf
        products={products}
        eyebrow="PEQUENOS GESTOS, GRANDES SORRISOS"
        title="Um carinho até R$ 75."
        description="Boas ideias que cabem no orçamento, sem perder o encanto."
        href="/catalogo?faixa=ate75"
        label="Ver até R$ 75"
      />
    );
  }
  return (
    <Shelf
      products={pick(state.products, rituals)}
      eyebrow="O TEMPO DE CUIDAR"
      title="Transforme a pausa em presente."
      description="Fragrâncias e cuidados para fazer do cotidiano um pequeno ritual."
      href="/catalogo?tema=bem-estar"
      label="Ver autocuidado"
    />
  );
}
