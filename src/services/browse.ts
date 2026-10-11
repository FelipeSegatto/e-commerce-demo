import type { Product } from "@/domain/types";
import { productOccasions } from "./catalog";
import { coupons } from "./coupons";
export type Filters = {
  category: string;
  subcategory: string;
  brand: string;
  color: string;
  material: string;
  occasion: string;
  theme: string;
  search: string;
  min: number;
  max: number;
  available: boolean;
  offers: boolean;
  personalized: boolean;
  sort: string;
  limit: number;
};
export const MAX_PRICE = 3000;
export const defaults: Filters = {
  category: "Todos",
  subcategory: "Todos",
  brand: "Todas",
  color: "Todas",
  material: "Todos",
  occasion: "Todas",
  theme: "",
  search: "",
  min: 0,
  max: MAX_PRICE,
  available: false,
  offers: false,
  personalized: false,
  sort: "featured",
  limit: 12,
};
export const budgets = [
  { id: "ate75", label: "Até R$ 75", min: 0, max: 75 },
  { id: "75a150", label: "R$ 75 a R$ 150", min: 75, max: 150 },
  { id: "150a300", label: "R$ 150 a R$ 300", min: 150, max: 300 },
  { id: "300a600", label: "R$ 300 a R$ 600", min: 300, max: 600 },
  { id: "acima600", label: "Acima de R$ 600", min: 600, max: MAX_PRICE },
];
export const normalizeText = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
export function parseFilters(query: URLSearchParams): Filters {
  const preset = budgets.find((b) => b.id === query.get("faixa"));
  const number = (key: string, fallback: number) => {
    const n = Number(query.get(key));
    return query.has(key) && Number.isFinite(n)
      ? Math.max(0, Math.min(MAX_PRICE, n))
      : fallback;
  };
  const min = number(
    "min",
    preset?.min || (query.get("faixa") === "acima150" ? 150 : 0),
  );
  const max = number("max", preset?.max || MAX_PRICE);
  return {
    ...defaults,
    category: query.get("categoria") || defaults.category,
    subcategory: query.get("tipo") || defaults.subcategory,
    brand: query.get("marca") || defaults.brand,
    color: query.get("cor") || defaults.color,
    material: query.get("material") || defaults.material,
    occasion: query.get("ocasiao") || defaults.occasion,
    theme: query.get("tema") || "",
    search: query.get("busca") || "",
    min: Math.min(min, max),
    max: Math.max(min, max),
    available: query.get("disponiveis") === "1",
    offers: query.get("ofertas") === "1",
    personalized: query.get("personalizados") === "1",
    sort: query.get("ordem") || "featured",
    limit: Math.max(12, Math.min(120, Number(query.get("limite")) || 12)),
  };
}
export function filtersQuery(filters: Filters): string {
  const query = new URLSearchParams();
  const names: Record<string, string> = {
    category: "categoria",
    subcategory: "tipo",
    brand: "marca",
    color: "cor",
    material: "material",
    occasion: "ocasiao",
    theme: "tema",
    search: "busca",
    min: "min",
    max: "max",
    available: "disponiveis",
    offers: "ofertas",
    personalized: "personalizados",
    sort: "ordem",
    limit: "limite",
  };
  for (const key of Object.keys(names) as (keyof Filters)[])
    if (filters[key] !== defaults[key])
      query.set(
        names[key],
        typeof filters[key] === "boolean" ? "1" : String(filters[key]),
      );
  return query.toString();
}
export function matchesFilters(p: Product, f: Filters): boolean {
  const campaign = coupons.find((c) => c.theme === f.theme);
  const terms = normalizeText(f.search.trim()).split(/\s+/).filter(Boolean);
  const haystack = normalizeText(
    [
      p.name,
      p.category,
      p.subcategory,
      p.brand,
      p.color,
      ...productOccasions(p),
    ].join(" "),
  );
  return (
    (f.category === "Todos" || p.category === f.category) &&
    (f.subcategory === "Todos" || p.subcategory === f.subcategory) &&
    (f.brand === "Todas" || p.brand === f.brand) &&
    (f.color === "Todas" || p.color === f.color) &&
    (f.material === "Todos" || p.material === f.material) &&
    (f.occasion === "Todas" || productOccasions(p).includes(f.occasion)) &&
    (!campaign ||
      !campaign.categories.length ||
      campaign.categories.includes(p.category)) &&
    p.price >= f.min &&
    p.price <= f.max &&
    (!f.available || p.stock > 0) &&
    (!f.offers || (!!p.originalPrice && p.originalPrice > p.price)) &&
    (!f.personalized || !!p.customizable) &&
    terms.every((t) => haystack.includes(t))
  );
}
export function browseProducts(
  products: Product[],
  filters: Filters,
): Product[] {
  return products
    .filter((p) => matchesFilters(p, filters))
    .sort((a, b) =>
      filters.sort === "asc"
        ? a.price - b.price
        : filters.sort === "desc"
          ? b.price - a.price
          : filters.sort === "name"
            ? a.name.localeCompare(b.name, "pt-BR")
            : filters.sort === "discount"
              ? ((b.originalPrice || b.price) - b.price) / b.price -
                ((a.originalPrice || a.price) - a.price) / a.price
              : 0,
    );
}
export function facetCount(
  products: Product[],
  filters: Filters,
  key: keyof Filters,
  value: string,
): number {
  return products.filter((p) => matchesFilters(p, { ...filters, [key]: value }))
    .length;
}
