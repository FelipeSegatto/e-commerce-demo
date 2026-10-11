import { Suspense } from "react";
import { DemoPage } from "@/components/pages";
import { notFound } from "next/navigation";
const routes = [
  "catalogo",
  "cupons",
  "presentear",
  "produto",
  "sacola",
  "checkout",
  "conta",
  "entrar",
  "cadastro",
  "personalizados",
  "sobre",
  "contato",
  "politicas",
  "favoritos",
  "vendedor",
  "admin",
  "oferta",
];
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  if (
    !routes.includes(slug[0]) ||
    slug.length > 2 ||
    (slug.length === 2 &&
      !["produto", "admin", "vendedor", "oferta"].includes(slug[0]))
  )
    notFound();
  return (
    <Suspense fallback={<div className="empty">Carregando…</div>}>
      <DemoPage path={"/" + slug.join("/")} />
    </Suspense>
  );
}
