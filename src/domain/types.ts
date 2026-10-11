export type Category =
  "Perfumes" | "Chocolates" | "Quadros" | "Balões" | "Kits & cestas";
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
};
export type CartItem = {
  key: string;
  productId: string;
  quantity: number;
  option: string;
  message: string;
};
export type Order = {
  id: string;
  createdAt: string;
  items: CartItem[];
  total: number;
  delivery: string;
  payment: string;
  status: "Recebido" | "Em preparação" | "Enviado" | "Entregue";
  customer: string;
};
export type Proposal = {
  id: string;
  customer: string;
  productId: string;
  quantity: number;
  discount: number;
  status: "Aguardando aprovação" | "Aprovada" | "Convertida";
};
export type DemoState = {
  cart: CartItem[];
  favorites: string[];
  orders: Order[];
  proposals: Proposal[];
  products: Product[];
  session: string | null;
};
