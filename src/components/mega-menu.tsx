"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { coupons } from "@/services/coupons";
import { categories, occasions } from "@/services/catalog";
import { Icon } from "./demo-provider";

export function MegaMenu() {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<string | null>(null);
  const close = () => setOpen(null);
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        root.current
          ?.querySelector<HTMLButtonElement>(
            ".mega-trigger[aria-expanded=true]",
          )
          ?.focus();
        setOpen(null);
      }
    };
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target))
        setOpen(null);
    };
    window.addEventListener("keydown", handler);
    window.addEventListener("pointerdown", outside);
    return () => {
      window.removeEventListener("keydown", handler);
      window.removeEventListener("pointerdown", outside);
    };
  }, [open]);
  const isOccasion = open === "ocasioes";
  return (
    <div
      ref={root}
      className="mega-navigation"
      onMouseLeave={close}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) close();
      }}
    >
      <nav className="category-nav" aria-label="Navegação da loja">
        <button
          className="mega-trigger"
          aria-expanded={open === "presentes"}
          aria-controls="gift-mega-panel"
          onMouseEnter={() => {
            if (window.matchMedia("(hover:hover)").matches)
              setOpen("presentes");
          }}
          onClick={() => setOpen(open === "presentes" ? null : "presentes")}
        >
          Presentes <span aria-hidden="true">⌄</span>
        </button>
        {categories
          .filter((c) =>
            [
              "Perfumes",
              "Chocolates",
              "Casa & decoração",
              "Flores & buquês",
            ].includes(c),
          )
          .map((c) => (
            <Link
              key={c}
              href={"/catalogo?categoria=" + encodeURIComponent(c)}
              onMouseEnter={close}
              onClick={close}
            >
              {c}
            </Link>
          ))}
        <button
          className="mega-trigger"
          aria-expanded={open === "ocasioes"}
          aria-controls="gift-mega-panel"
          onMouseEnter={() => {
            if (window.matchMedia("(hover:hover)").matches) setOpen("ocasioes");
          }}
          onClick={() => setOpen(open === "ocasioes" ? null : "ocasioes")}
        >
          Por ocasião <span aria-hidden="true">⌄</span>
        </button>
        <Link
          className="nav-offers"
          href="/catalogo?ofertas=1"
          onMouseEnter={close}
        >
          Ofertas <span className="offer-dot" />
        </Link>
        <Link href="/personalizados" onMouseEnter={close}>
          Personalizados
        </Link>
        <Link href="/cupons" onMouseEnter={close}>
          Cupons
        </Link>
      </nav>
      {open && (
        <div id="gift-mega-panel" className="mega-panel">
          <div className="mega-inner">
            <div>
              <p className="eyebrow">
                {isOccasion
                  ? "CADA MOMENTO MERECE UM PRESENTE"
                  : "UM UNIVERSO DE PEQUENOS GESTOS"}
              </p>
              <h2>
                {isOccasion
                  ? "Qual é a ocasião?"
                  : "Encontre o presente certo."}
              </h2>
              <Link className="text-link" href="/catalogo" onClick={close}>
                Ver todos os presentes <Icon name="arrow" size={16} />
              </Link>
            </div>
            <div className="mega-columns">
              <section>
                <h3>{isOccasion ? "Para celebrar" : "Nossas coleções"}</h3>
                {(isOccasion ? occasions : categories).map((item) => (
                  <Link
                    key={item}
                    href={
                      "/catalogo?" +
                      (isOccasion ? "ocasiao" : "categoria") +
                      "=" +
                      encodeURIComponent(item)
                    }
                    onClick={close}
                  >
                    {item}
                    <Icon name="arrow" size={13} />
                  </Link>
                ))}
              </section>
              <section>
                <h3>Uma boa escolha</h3>
                <Link href="/catalogo?faixa=ate75" onClick={close}>
                  Presentes até R$ 75
                </Link>
                <Link href="/catalogo?faixa=75a150" onClick={close}>
                  De R$ 75 a R$ 150
                </Link>
                <Link href="/catalogo?ofertas=1" onClick={close}>
                  Seleção em oferta
                </Link>
                <Link href="/personalizados" onClick={close}>
                  Com a sua mensagem
                </Link>
              </section>
            </div>
            <Link
              className="mega-feature"
              href="/catalogo?ofertas=1"
              onClick={close}
            >
              <span className="mega-photo" />
              <div>
                <span className="eyebrow">PEQUENAS SURPRESAS</span>
                <h3>
                  Mais carinho.
                  <br />
                  Um preço especial.
                </h3>
                <span>
                  Explorar ofertas <Icon name="arrow" size={15} />
                </span>
              </div>
            </Link>
          </div>
          <div className="mega-themes">
            <span>Explore por tema</span>
            {coupons.slice(1).map((c) => (
              <Link
                href={"/catalogo?tema=" + c.theme}
                key={c.theme}
                onClick={close}
              >
                {c.title}
              </Link>
            ))}
            <Link className="text-link" href="/presentear" onClick={close}>
              Precisa de uma ideia? →
            </Link>
          </div>
          <div className="mega-bottom">
            <span>
              Escolhidos com cuidado, do primeiro clique ao último laço.
            </span>
            <button onClick={close} aria-label="Fechar mega menu">
              Fechar ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
