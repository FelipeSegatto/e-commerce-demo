import type { CartItem, Category, Product } from "@/domain/types";
export type Coupon = {
  active?: boolean;
  code: string;
  theme: string;
  title: string;
  description: string;
  percent: number;
  categories: Category[];
  minimum: number;
  cap: number;
  firstOrderOnly?: boolean;
  color: string;
};
export const coupons: Coupon[] = [
  {
    code: "GIFT10",
    theme: "boas-vindas",
    title: "Seu primeiro presente",
    description: "Um carinho extra para começar.",
    percent: 10,
    categories: [],
    minimum: 0,
    cap: 100,
    firstOrderOnly: true,
    color: "olive",
  },
  {
    code: "CASA15",
    theme: "casa",
    title: "Casa nova, novos afetos",
    description: "Decoração e aromas para deixar a casa com a sua cara.",
    percent: 15,
    categories: ["Casa & decoração", "Casa & aromas"],
    minimum: 120,
    cap: 120,
    color: "sand",
  },
  {
    code: "CUIDADO12",
    theme: "bem-estar",
    title: "Uma pausa para você",
    description: "Fragrâncias e cuidados para pequenos rituais.",
    percent: 12,
    categories: ["Perfumes", "Banho & cuidados"],
    minimum: 150,
    cap: 150,
    color: "olive",
  },
  {
    code: "FESTA10",
    theme: "celebrar",
    title: "Toda ocasião merece festa",
    description: "Balões, decoração de festa e chocolates.",
    percent: 10,
    categories: ["Festas & decoração", "Chocolates"],
    minimum: 60,
    cap: 60,
    color: "rose",
  },
  {
    code: "AFETO12",
    theme: "afeto",
    title: "Para dizer: lembrei de você",
    description: "Flores, chocolates e perfumes para surpreender.",
    percent: 12,
    categories: ["Flores & buquês", "Chocolates", "Perfumes"],
    minimum: 120,
    cap: 120,
    color: "rose",
  },
  {
    code: "GOURMET10",
    theme: "gourmet",
    title: "Sabores para compartilhar",
    description: "Cestas e chocolates que viram um bom encontro.",
    percent: 10,
    categories: ["Kits & cestas", "Chocolates"],
    minimum: 100,
    cap: 100,
    color: "sand",
  },
];
export type CouponResult = {
  valid: boolean;
  coupon: Coupon | null;
  discount: number;
  eligibleSubtotal: number;
  message: string;
};
export function evaluateCoupon(
  code: string,
  cart: CartItem[],
  products: Product[],
  orderCount = 0,
  availableCoupons: Coupon[] = coupons,
): CouponResult {
  const coupon =
    availableCoupons.find((c) => c.code === code.trim().toUpperCase()) || null;
  const result: CouponResult = {
    valid: false,
    coupon,
    discount: 0,
    eligibleSubtotal: 0,
    message: "Cupom não encontrado.",
  };
  if (!coupon) return result;
  if (coupon.active === false)
    return { ...result, message: "Este cupom está pausado." };
  if (coupon.firstOrderOnly && orderCount > 0)
    return {
      ...result,
      message: `${coupon.code} é válido apenas para o primeiro pedido demonstrativo.`,
    };
  const eligibleSubtotal = cart.reduce((sum, item) => {
    const p = products.find((p) => p.id === item.productId);
    return p &&
      (!coupon.categories.length || coupon.categories.includes(p.category))
      ? sum + p.price * item.quantity
      : sum;
  }, 0);
  if (eligibleSubtotal <= 0)
    return {
      ...result,
      message: "Adicione produtos das categorias deste cupom à sacola.",
    };
  if (eligibleSubtotal < coupon.minimum)
    return {
      ...result,
      eligibleSubtotal,
      message: `Este cupom exige pelo menos R$ ${coupon.minimum.toFixed(2).replace(".", ",")} em produtos elegíveis.`,
    };
  const discount =
    Math.round(
      Math.min((eligibleSubtotal * coupon.percent) / 100, coupon.cap) * 100,
    ) / 100;
  return {
    valid: true,
    coupon,
    discount,
    eligibleSubtotal,
    message: `Cupom ${coupon.code} aplicado nos produtos elegíveis.`,
  };
}
