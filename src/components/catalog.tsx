"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useDemo, Icon } from "./demo-provider";
import { ProductCard } from "./product-card";
import { categories, money, occasions } from "@/services/catalog";
import {
  budgets,
  defaults,
  parseFilters,
  filtersQuery,
  browseProducts,
  facetCount,
  MAX_PRICE,
  type Filters,
} from "@/services/browse";

export function Catalog({
  favorites = false,
  custom = false,
}: {
  favorites?: boolean;
  custom?: boolean;
}) {
  const { state } = useDemo();
  const coupons = state.coupons.filter((c) => c.active !== false);
  const path = usePathname();
  const params = useSearchParams();
  const filters = parseFilters(new URLSearchParams(params.toString()));
  const source = state.products.filter(
    (p) =>
      (!favorites || state.favorites.includes(p.id)) &&
      (!custom || p.customizable),
  );
  const products = browseProducts(source, filters, state.coupons);
  const theme = coupons.find((c) => c.theme === filters.theme);
  const update = (change: Partial<Filters>) => {
    const next = {
      ...parseFilters(new URLSearchParams(window.location.search)),
      ...change,
      limit: change.limit ?? 12,
    };
    if (next.min > next.max) {
      if ("min" in change) next.max = next.min;
      else next.min = next.max;
    }
    const query = filtersQuery(next);
    window.history.replaceState(null, "", path + (query ? "?" + query : ""));
  };
  const clear = () => window.history.replaceState(null, "", path);
  const categoryScope = source.filter(
    (p) => filters.category === "Todos" || p.category === filters.category,
  );
  const values = (key: "subcategory" | "brand" | "color" | "material") =>
    Array.from(
      new Set(categoryScope.map((p) => p[key]).filter((v): v is string => !!v)),
    ).sort((a, b) => a.localeCompare(b, "pt-BR"));
  const field = (
    key: keyof Filters,
    label: string,
    all: string,
    list: string[],
  ) => (
    <label key={key}>
      {label}
      <select
        aria-label={label}
        value={String(filters[key])}
        onChange={(e) => update({ [key]: e.target.value })}
      >
        <option value={all}>Todas as opções</option>
        {Array.from(
          new Set([
            ...list,
            ...(filters[key] !== all ? [String(filters[key])] : []),
          ]),
        ).map((value) => (
          <option key={value} value={value}>
            {value} ({facetCount(source, filters, key, value, state.coupons)})
          </option>
        ))}
      </select>
    </label>
  );
  const active: (keyof Filters)[] = [
    "category",
    "subcategory",
    "brand",
    "color",
    "material",
    "occasion",
    "theme",
    "search",
    "available",
    "offers",
    "personalized",
  ];
  const labels: Partial<Record<keyof Filters, string>> = {
    category: filters.category,
    subcategory: filters.subcategory,
    brand: filters.brand,
    color: filters.color,
    material: filters.material,
    occasion: filters.occasion,
    theme: theme?.title || filters.theme,
    search: "Busca: " + filters.search,
    available: "Disponíveis",
    offers: "Em oferta",
    personalized: "Personalizados",
  };
  const hasFilters =
    active.some((key) => filters[key] !== defaults[key]) ||
    filters.min !== 0 ||
    filters.max !== MAX_PRICE;
  return (
    <div className="container section">
      <div className="page-title">
        <p className="eyebrow">
          {favorites
            ? "SUA SELEÇÃO"
            : custom
              ? "DO SEU JEITO"
              : theme
                ? "UMA SELEÇÃO COM SENTIDO"
                : "ENCONTRE O SEU PRESENTE"}
        </p>
        <h1>
          {favorites
            ? "Guardados com carinho"
            : custom
              ? "Presentes personalizados"
              : theme
                ? theme.title
                : "Um presente para cada sentimento"}
        </h1>
        <p>
          {theme
            ? theme.description
            : "Explore coleções, ocasiões e marcas. Encontre um presente que combina com você."}
        </p>
      </div>
      {theme && (
        <div className="collection-coupon">
          <Icon name="gift" />
          <div>
            <b>
              {theme.percent}% com {theme.code}
            </b>
            <span>
              {theme.minimum
                ? `A partir de ${money(theme.minimum)} em produtos elegíveis`
                : "Sem valor mínimo"}{" "}
              · Até {money(theme.cap)} de desconto
            </span>
          </div>
          <Link className="text-link" href="/cupons">
            Ver condições
          </Link>
        </div>
      )}
      <div className="catalog-layout">
        <aside className="filters intelligent-filters">
          <div className="filter-heading">
            <h3>Encontre seu presente</h3>
            {hasFilters && <button onClick={clear}>Limpar</button>}
          </div>
          <details open>
            <summary>Categorias</summary>
            <div className="facet-options">
              {["Todos", ...categories].map((c) => {
                const count = facetCount(
                  source,
                  { ...filters, subcategory: "Todos" },
                  "category",
                  c,
                );
                return (
                  <button
                    key={c}
                    className={filters.category === c ? "active" : ""}
                    disabled={!count && filters.category !== c}
                    onClick={() =>
                      update({ category: c, subcategory: "Todos" })
                    }
                  >
                    {c}
                    <span>{count}</span>
                  </button>
                );
              })}
            </div>
          </details>
          <details open>
            <summary>Seu orçamento</summary>
            <div className="budget-pills">
              {budgets.map((b) => (
                <button
                  key={b.id}
                  className={
                    filters.min === b.min && filters.max === b.max
                      ? "active"
                      : ""
                  }
                  onClick={() => update({ min: b.min, max: b.max })}
                >
                  {b.label}
                </button>
              ))}
            </div>
            <div className="price-inputs">
              <label>
                De (R$)
                <input
                  aria-label="Preço mínimo"
                  type="number"
                  min="0"
                  max={MAX_PRICE}
                  step="1"
                  value={filters.min}
                  onChange={(e) =>
                    update({
                      min: Math.min(
                        MAX_PRICE,
                        Math.max(0, Number(e.target.value) || 0),
                      ),
                    })
                  }
                />
              </label>
              <label>
                Até (R$)
                <input
                  aria-label="Preço máximo"
                  type="number"
                  min="0"
                  max={MAX_PRICE}
                  step="1"
                  value={filters.max}
                  onChange={(e) =>
                    update({
                      max: Math.min(
                        MAX_PRICE,
                        Math.max(0, Number(e.target.value) || 0),
                      ),
                    })
                  }
                />
              </label>
            </div>
            <input
              className="price-slider"
              type="range"
              aria-label="Ajustar orçamento máximo"
              min="0"
              max={MAX_PRICE}
              step="10"
              value={filters.max}
              onChange={(e) => update({ max: Number(e.target.value) })}
            />
            <small>Até {money(filters.max)}</small>
          </details>
          <details open>
            <summary>Detalhes que importam</summary>
            <div className="facet-fields">
              {field(
                "subcategory",
                "Tipo de produto",
                "Todos",
                values("subcategory"),
              )}
              {field("brand", "Marca", "Todas", values("brand"))}
              {field("occasion", "Por ocasião", "Todas", occasions)}
              {field("color", "Cor", "Todas", values("color"))}
              {field("material", "Material", "Todos", values("material"))}
            </div>
          </details>
          <details open>
            <summary>Preferências</summary>
            {(["available", "offers", "personalized"] as const).map(
              (key, i) => (
                <label key={key} className="check-label">
                  <input
                    type="checkbox"
                    checked={filters[key]}
                    onChange={(e) => update({ [key]: e.target.checked })}
                  />
                  {
                    [
                      "Somente disponíveis",
                      "Somente ofertas",
                      "Com personalização",
                    ][i]
                  }
                </label>
              ),
            )}
          </details>
          <Link className="filter-helper" href="/presentear">
            <Icon name="gift" size={24} />
            <b>Precisa de uma ideia?</b>
            <span>Escolha por ocasião e orçamento →</span>
          </Link>
        </aside>
        <div className="catalog-results">
          <div className="catalog-controls">
            <input
              aria-label="Filtrar produtos"
              placeholder="Busque por produto, marca ou categoria…"
              value={filters.search}
              onChange={(e) => update({ search: e.target.value })}
            />
            <select
              aria-label="Ordenar produtos"
              value={filters.sort}
              onChange={(e) => update({ sort: e.target.value })}
            >
              <option value="featured">Nossa seleção</option>
              <option value="asc">Menor preço</option>
              <option value="desc">Maior preço</option>
              <option value="discount">Maior desconto</option>
              <option value="name">Nome A–Z</option>
            </select>
          </div>
          <div className="active-filters" aria-label="Filtros ativos">
            {active
              .filter((key) => filters[key] !== defaults[key])
              .map((key) => (
                <button
                  key={key}
                  onClick={() =>
                    update({
                      [key]: defaults[key],
                      ...(key === "category" ? { subcategory: "Todos" } : {}),
                    })
                  }
                >
                  {labels[key]} ×
                </button>
              ))}
            {(filters.min !== 0 || filters.max !== MAX_PRICE) && (
              <button onClick={() => update({ min: 0, max: MAX_PRICE })}>
                {money(filters.min)} – {money(filters.max)} ×
              </button>
            )}
            {hasFilters && (
              <button className="clear-filters" onClick={clear}>
                Limpar filtros
              </button>
            )}
          </div>
          <div className="results-bar">
            <p className="result-count" role="status" aria-live="polite">
              {products.length} presentes encontrados
            </p>
            <span>{state.products.length} produtos no catálogo</span>
          </div>
          {products.length ? (
            <>
              <div className="product-grid catalog-products">
                {products.slice(0, filters.limit).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {products.length > filters.limit && (
                <div className="load-more">
                  <p>
                    Mostrando {Math.min(filters.limit, products.length)} de{" "}
                    {products.length} presentes
                  </p>
                  <button
                    className="button outline"
                    onClick={() => update({ limit: filters.limit + 12 })}
                  >
                    Carregar mais presentes <Icon name="arrow" size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty">
              <Icon name={favorites ? "heart" : "search"} size={40} />
              <h2>
                {favorites && !source.length
                  ? "Sua coleção começa com um coração."
                  : "Ainda não encontramos essa combinação."}
              </h2>
              <p>
                {favorites && !source.length
                  ? "Toque no coração de um produto para guardá-lo aqui."
                  : "Tente ampliar o orçamento ou remover um filtro."}
              </p>
              {hasFilters ? (
                <button className="button" onClick={clear}>
                  Limpar filtros
                </button>
              ) : (
                <Link className="button" href="/catalogo">
                  Explorar catálogo
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
