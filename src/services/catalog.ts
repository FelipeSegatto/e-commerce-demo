import type { Category, Product } from "@/domain/types";
export const categories: Category[] = [
  "Perfumes",
  "Chocolates",
  "Quadros",
  "Balões",
  "Kits & cestas",
];
export const initialProducts: Product[] = [
  {
    id: "p1",
    slug: "kit-pequenas-alegrias",
    name: "Kit Pequenas Alegrias",
    category: "Kits & cestas",
    price: 159.9,
    originalPrice: 189.9,
    image: "/photos/gift-basket.jpg",
    description:
      "Um abraço em forma de presente. Chocolates, flores delicadas e um cartão com as suas palavras, em uma composição cuidadosamente preparada.",
    stock: 12,
    badge: "Queridinho",
    customizable: true,
  },
  {
    id: "p2",
    slug: "perfume-jardim",
    name: "Kit Fragrâncias Essenciais",
    category: "Perfumes",
    price: 139.9,
    image: "/photos/perfume-kit.jpg",
    description:
      "Uma seleção de fragrâncias e cuidados em miniaturas, organizada em um estojo compacto para levar pequenos momentos de cuidado a qualquer lugar.",
    stock: 8,
    badge: "Novidade",
    options: ["Floral", "Cítrico", "Amadeirado"],
  },
  {
    id: "p3",
    slug: "chocolates-afeto",
    name: "Caixa de Chocolates Afeto",
    category: "Chocolates",
    price: 69.9,
    image: "/photos/chocolates.jpg",
    description:
      "Doze pequenos motivos para sorrir. Bombons sortidos em uma caixa especial para presentear. Contém leite e pode conter castanhas.",
    stock: 20,
    options: ["Ao leite", "Meio amargo", "Sortidos"],
    customizable: true,
  },
  {
    id: "p4",
    slug: "baloes-celebrar",
    name: "Buquê de Balões Celebrar",
    category: "Balões",
    price: 89.9,
    image: "/photos/balloons.jpg",
    description:
      "Uma composição festiva de cinco balões, pronta para colorir uma surpresa. Disponível em três paletas e com mensagem personalizada.",
    stock: 7,
    options: ["Terracota & creme", "Rosa & dourado", "Azul & prata"],
    customizable: true,
  },
  {
    id: "p5",
    slug: "quadro-casa",
    name: "Porta-retrato Memórias",
    category: "Quadros",
    price: 119.9,
    image: "/photos/frame.jpg",
    description:
      "Uma moldura de madeira natural para guardar uma lembrança especial. Espaço para uma foto de 10 × 15 cm. Um detalhe acolhedor para qualquer cantinho.",
    stock: 5,
    options: ["Madeira natural", "Branca", "Preta"],
  },
  {
    id: "p6",
    slug: "cesta-bom-dia",
    name: "Cesta Boas-vindas",
    category: "Kits & cestas",
    price: 179.9,
    image: "/photos/baby-basket.jpg",
    description:
      "Uma cesta acolhedora com pelúcia, chocolates e pequenos cuidados. Uma forma delicada de celebrar começos e novas histórias. Acompanha cartão personalizado.",
    stock: 9,
    customizable: true,
    badge: "Feito com carinho",
  },
  {
    id: "p7",
    slug: "perfume-brisa",
    name: "Difusor Brisa",
    category: "Perfumes",
    price: 99.9,
    image: "/photos/diffuser.jpg",
    description:
      "Um difusor de ambiente com varetas e uma fragrância fresca. Um toque de cuidado para deixar a casa mais acolhedora.",
    stock: 0,
    badge: "Em breve",
  },
  {
    id: "p8",
    slug: "quadro-jardim",
    name: "Quadro Jardim de Formas",
    category: "Quadros",
    price: 129.9,
    image: "/illustrations/frame-green.svg",
    description:
      "Uma composição botânica em tons de verde. Impressão de 30 × 40 cm, com moldura natural e acabamento fosco.",
    stock: 10,
    options: ["Madeira natural", "Branca"],
  },
];
// Replace this adapter with your API implementation; UI consumes the same domain types.
export const catalogService = {
  list: async (): Promise<Product[]> => structuredClone(initialProducts),
  findBySlug: async (slug: string): Promise<Product | undefined> =>
    initialProducts.find((p) => p.slug === slug),
};
export const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

export const occasions = [
  "Aniversário",
  "Agradecimento",
  "Amor & carinho",
  "Casa nova",
  "Boas-vindas",
];
export function productOccasions(product: Product): string[] {
  const map: Record<Category, string[]> = {
    Perfumes: ["Aniversário", "Agradecimento", "Amor & carinho"],
    Chocolates: ["Aniversário", "Agradecimento", "Amor & carinho"],
    Quadros: ["Casa nova", "Aniversário", "Agradecimento"],
    Balões: ["Aniversário", "Boas-vindas"],
    "Kits & cestas": ["Aniversário", "Amor & carinho", "Boas-vindas"],
  };
  return map[product.category] || [];
}
