"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/domain/types";
import { money } from "@/services/catalog";
import { useDemo, Icon } from "./demo-provider";
import { ProductImage } from "./product-image";
export function ProductCard({ product: p }: { product: Product }) {
  const router = useRouter();
  const { state, update, add } = useDemo();
  const favorite = state.favorites.includes(p.id);
  return (
    <article className="product-card">
      <div className="product-image">
        <Link href={"/produto/" + p.slug}>
          <ProductImage
            product={p}
            className={
              p.subcategory === "Velas" ? "product-photo-contained" : undefined
            }
          />
        </Link>
        {p.originalPrice && p.originalPrice > p.price && (
          <span className="discount-badge">
            −{Math.round((1 - p.price / p.originalPrice) * 100)}%
          </span>
        )}
        {p.badge && <span className="product-badge">{p.badge}</span>}
        <button
          className={"favorite " + (favorite ? "selected" : "")}
          aria-label={`${favorite ? "Remover" : "Adicionar"} ${p.name} ${favorite ? "dos" : "aos"} favoritos`}
          onClick={() =>
            update((s) => ({
              ...s,
              favorites: favorite
                ? s.favorites.filter((id) => id !== p.id)
                : [...s.favorites, p.id],
            }))
          }
        >
          <Icon name="heart" size={18} />
        </button>
      </div>
      <div className="product-info">
        <p className="eyebrow">{p.category}</p>
        <Link href={"/produto/" + p.slug}>
          <h3>{p.name}</h3>
        </Link>
        <div className="price">
          {money(p.price)}{" "}
          {p.originalPrice && <del>{money(p.originalPrice)}</del>}
        </div>
        <button
          className="card-add"
          disabled={!p.stock}
          onClick={() =>
            p.options
              ? router.push("/produto/" + p.slug)
              : add({ productId: p.id, quantity: 1, option: "", message: "" })
          }
        >
          {!p.stock
            ? "Indisponível"
            : p.options
              ? "Escolher opções"
              : "Adicionar à sacola"}
          <span className="card-add-icon">
            <Icon name="bag" size={17} />
            <Icon name="arrow" size={16} />
          </span>
        </button>
      </div>
    </article>
  );
}
