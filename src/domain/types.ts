import type { Coupon } from "@/services/coupons";
export type Category =
  | "Perfumes"
  | "Chocolates"
  | "Banho & cuidados"
  | "Casa & aromas"
  | "Casa & decoração"
  | "Flores & buquês"
  | "Festas & decoração"
  | "Kits & cestas";
export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  stock: number;
  badge?: string;
  options?: string[];
  customizable?: boolean;
  subcategory?: string;
  brand?: string;
  color?: string;
  material?: string;
  occasions?: string[];
  imagePending?: boolean;
  expectedImage?: string;
  variantImages?: Record<string, string>;
  pendingVariantImages?: Record<string, string>;
};
export type CartItem = {
  key: string;
  productId: string;
  quantity: number;
  option: string;
  message: string;
  unitPrice?: number;
};
export type Order = {
  channel?: "online" | "presencial";
  seller?: string;
  proposalId?: string;
  id: string;
  createdAt: string;
  items: CartItem[];
  total: number;
  delivery: string;
  payment: string;
  status: "Recebido" | "Em preparação" | "Enviado" | "Entregue";
  customer: string;
  coupon?: string;
  discount?: number;
};
export type ProposalItem = {
  productId: string;
  quantity: number;
};
export type Proposal = {
  seller?: string;
  id: string;
  customer: string;
  items?: ProposalItem[];
  /** Single-product proposals saved by earlier demo versions. */
  productId?: string;
  quantity?: number;
  discount: number;
  status: "Aguardando aprovação" | "Aprovada" | "Convertida";
};
export type DemoState = {
  coupons: Coupon[];
  editedProductIds?: string[];
  catalogRevision?: number;
  cart: CartItem[];
  favorites: string[];
  orders: Order[];
  proposals: Proposal[];
  products: Product[];
  session: string | null;
};
