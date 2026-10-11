import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty">
      <p className="eyebrow">404</p>
      <h1>Este caminho não está na nossa coleção.</h1>
      <Link className="button" href="/">
        Voltar ao início
      </Link>
    </div>
  );
}
