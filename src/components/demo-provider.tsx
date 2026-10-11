"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { demoRepository, freshState } from "@/services/demo";
import { SmartSearch } from "./smart-search";
import { MegaMenu } from "./mega-menu";
import type { CartItem, DemoState } from "@/domain/types";

type Context = {
  state: DemoState;
  ready: boolean;
  update: (change: (s: DemoState) => DemoState) => void;
  notify: (message: string) => void;
  add: (item: Omit<CartItem, "key">) => void;
};
const DemoContext = createContext<Context | null>(null);
export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error("Missing DemoProvider");
  return value;
}
export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(freshState);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setState(demoRepository.load());
      setReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (ready) demoRepository.save(state);
  }, [state, ready]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  const update: Context["update"] = (change) => setState((s) => change(s));
  const add: Context["add"] = (item) => {
    const product = state.products.find((p) => p.id === item.productId);
    const quantityInCart = state.cart
      .filter((i) => i.productId === item.productId)
      .reduce((sum, i) => sum + i.quantity, 0);
    if (!product || item.quantity + quantityInCart > product.stock) {
      setToast("Quantidade indisponível no estoque demonstrativo.");
      return;
    }
    const key = JSON.stringify([item.productId, item.option, item.message]);
    update((s) => ({
      ...s,
      cart: s.cart.some((i) => i.key === key)
        ? s.cart.map((i) =>
            i.key === key ? { ...i, quantity: i.quantity + item.quantity } : i,
          )
        : [...s.cart, { ...item, key }],
    }));
    setToast("Presente adicionado à sacola.");
  };
  return (
    <DemoContext.Provider
      value={{ state, ready, update, notify: setToast, add }}
    >
      {children}
      <span hidden data-demo-state={ready ? "ready" : "loading"} />
      <div
        role="status"
        aria-live="polite"
        className={`toast ${toast ? "visible" : ""}`}
      >
        {toast}
      </div>
    </DemoContext.Provider>
  );
}
export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    bag: (
      <>
        <path d="M5 7h14l1 14H4L5 7Z" />
        <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      </>
    ),
    heart: (
      <path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z" />
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 22v-3a8 8 0 0 1 16 0v3" />
      </>
    ),
    search: (
      <>
        <circle cx="10" cy="10" r="7" />
        <path d="m16 16 5 5" />
      </>
    ),
    arrow: (
      <>
        <path d="M3 12h18m-6-6 6 6-6 6" />
      </>
    ),
    gift: (
      <>
        <path d="M3 9h18v4H3zm2 4v8h14v-8M12 9v12" />
        <path d="M12 9C1 9 6 0 12 9c6-9 11 0 0 0" />
      </>
    ),
    truck: (
      <>
        <path d="M2 5h12v12H2zm12 5h4l4 4v3h-8" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </>
    ),
    check: <path d="m4 12 5 5L20 6" />,
    menu: <path d="M3 6h18M3 12h18M3 18h18" />,
    chart: (
      <>
        <path d="M3 3v18h18M7 16v-5m5 5V7m5 9V4" />
      </>
    ),
    box: (
      <>
        <path d="m3 7 9-4 9 4v10l-9 4-9-4V7Zm0 0 9 4 9-4M12 11v10M7 5l9 4" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.gift}
    </svg>
  );
}
export function Shell({ children }: { children: React.ReactNode }) {
  const { state, update, notify } = useDemo();
  const path = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const workspace = path.startsWith("/admin")
    ? "admin"
    : path.startsWith("/vendedor")
      ? "vendedor"
      : null;
  const count = state.cart.reduce((n, i) => n + i.quantity, 0);
  const nav =
    workspace === "admin"
      ? [
          ["", "Visão geral"],
          ["produtos", "Produtos"],
          ["estoque", "Estoque"],
          ["pedidos", "Pedidos"],
          ["financeiro", "Financeiro"],
          ["equipe", "Equipe"],
          ["descontos", "Descontos"],
        ]
      : [
          ["", "Visão geral"],
          ["catalogo", "Catálogo"],
          ["nova-proposta", "Nova proposta"],
          ["propostas", "Minhas propostas"],
        ];
  return (
    <>
      {workspace ? (
        <div className="workspace">
          <aside className="sidebar">
            <Link className="brand" href="/">
              Gift Store
              <span>
                PAINEL{" "}
                {workspace === "admin" ? "ADMINISTRATIVO" : "DO VENDEDOR"}
              </span>
            </Link>
            <div className="side-profile">
              <span className="avatar">
                {workspace === "admin" ? "AD" : "VE"}
              </span>
              <div>
                {workspace === "admin" ? "Admin Demo" : "Vendedor Demo"}
                <small>Perfil demonstrativo</small>
              </div>
            </div>
            <nav>
              {nav.map(([slug, label]) => (
                <Link
                  className={
                    path === `/${workspace}${slug ? "/" + slug : ""}`
                      ? "active"
                      : ""
                  }
                  key={label}
                  href={`/${workspace}${slug ? "/" + slug : ""}`}
                >
                  <Icon name={slug === "" ? "chart" : "box"} size={18} />
                  {label}
                </Link>
              ))}
            </nav>
            <Link className="back-store" href="/">
              ← Voltar para a loja
            </Link>
          </aside>
          <main className="workspace-main">
            <div className="workspace-top">
              <span>
                Operação /{" "}
                {workspace === "admin" ? "Administração" : "Vendas assistidas"}
              </span>
              <span className="badge">Ambiente demonstrativo</span>
            </div>
            {children}
          </main>
        </div>
      ) : (
        <>
          <div className="promo">
            UM CARINHO A MAIS NA PRIMEIRA COMPRA · <strong>GIFT10</strong> · 10%
            DE DESCONTO
          </div>
          <header>
            <div className="header-inner">
              <button
                className="icon-button mobile-menu"
                aria-label="Alternar menu"
                onClick={() => setMenu(!menu)}
              >
                <Icon name="menu" />
              </button>
              <Link className="brand" href="/">
                Gift Store<span>PRESENTES PARA SENTIR</span>
              </Link>
              <SmartSearch />
              <div className="header-actions">
                <details className="profiles-menu">
                  <summary>
                    Perfis da demo <span aria-hidden="true">⌄</span>
                  </summary>
                  <div>
                    <p>Explore a operação</p>
                    <Link
                      href="/admin"
                      onClick={(e) =>
                        e.currentTarget
                          .closest("details")
                          ?.removeAttribute("open")
                      }
                    >
                      <Icon name="chart" size={17} />
                      Administrador
                      <Icon name="arrow" size={14} />
                    </Link>
                    <Link
                      href="/vendedor"
                      onClick={(e) =>
                        e.currentTarget
                          .closest("details")
                          ?.removeAttribute("open")
                      }
                    >
                      <Icon name="user" size={17} />
                      Vendedor
                      <Icon name="arrow" size={14} />
                    </Link>
                  </div>
                </details>
                <Link href="/favoritos" aria-label="Favoritos">
                  <Icon name="heart" />
                </Link>
                <Link
                  href={state.session ? "/conta" : "/entrar"}
                  aria-label="Minha conta"
                >
                  <Icon name="user" />
                </Link>
                <Link href="/sacola" aria-label={`Sacola com ${count} itens`}>
                  <Icon name="bag" />
                  <span className="bag-label">Sacola</span>
                  <b className="count">{count}</b>
                </Link>
              </div>
            </div>
            <MegaMenu />
            {menu && (
              <nav
                className="mobile-drawer"
                aria-label="Menu do celular"
                onClick={() => setMenu(false)}
              >
                <Link href="/catalogo">Todos os presentes</Link>
                <Link href="/catalogo?ofertas=1">Ofertas especiais</Link>
                <Link href="/cupons">Cupons por tema</Link>
                <Link href="/presentear">Assistente de presentes</Link>
                <Link href="/personalizados">Personalizados</Link>
                <Link href="/admin">Administrador</Link>
                <Link href="/vendedor">Vendedor</Link>
              </nav>
            )}
          </header>
          <main>{children}</main>
          <footer>
            <div className="footer-grid">
              <div>
                <Link className="brand" href="/">
                  Gift Store<span>PRESENTES PARA SENTIR</span>
                </Link>
                <p>
                  Pequenos gestos. Grandes sentimentos.
                  <br />
                  Um presente para cada jeito de querer bem.
                </p>
              </div>
              <div>
                <h4>Encontre seu mimo</h4>
                <Link href="/catalogo">Todos os presentes</Link>
                <Link href="/personalizados">Presentes personalizados</Link>
                <Link href="/cupons">Cupons por tema</Link>
                <Link href="/presentear">Encontre seu presente</Link>
                <Link href="/favoritos">Seus favoritos</Link>
              </div>
              <div>
                <h4>Por aqui</h4>
                <Link href="/sobre">Nossa história</Link>
                <Link href="/contato">Fale com a gente</Link>
                <Link href="/politicas">Entrega, trocas e privacidade</Link>
              </div>
              <div>
                <h4>Feito para demonstrar</h4>
                <Link href="/admin">Painel do administrador</Link>
                <Link href="/vendedor">Painel do vendedor</Link>
                <p>
                  Marca e catálogo fictícios.
                  <br />
                  Pedidos e pagamentos simulados.
                </p>
                <Link href="/conta">Minha conta</Link>
              </div>
            </div>
            <div className="footer-bottom">
              <span>
                © {new Date().getFullYear()} Gift Store · Demo independente
              </span>
              <span>Com carinho, em cada detalhe.</span>
            </div>
          </footer>
        </>
      )}
      <div className="demo-toolbar">
        <Link
          className={workspace === "admin" ? "current-profile" : ""}
          href="/admin"
        >
          Admin
        </Link>
        <Link
          className={workspace === "vendedor" ? "current-profile" : ""}
          href="/vendedor"
        >
          Vendedor
        </Link>
        <span>
          <b>DEMO</b>
          <span className="toolbar-note"> Explore os perfis</span>
        </span>
        <select
          aria-label="Perfil da demonstração"
          value={workspace || (state.session ? "cliente" : "visitante")}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "cliente")
              update((s) => ({ ...s, session: "Cliente Demo" }));
            else if (v === "visitante")
              update((s) => ({ ...s, session: null }));
            router.push(
              v === "admin" || v === "vendedor"
                ? "/" + v
                : v === "cliente"
                  ? "/conta"
                  : "/",
            );
          }}
        >
          <option value="visitante">Visitante</option>
          <option value="cliente">Cliente</option>
          <option value="vendedor">Vendedor</option>
          <option value="admin">Administrador</option>
        </select>
        <button
          onClick={() => {
            if (
              window.confirm(
                "Reiniciar sacola, pedidos e alterações desta demonstração?",
              )
            ) {
              update(() => demoRepository.reset());
              notify("Demonstração reiniciada.");
              router.push("/");
            }
          }}
        >
          Reiniciar
        </button>
      </div>
    </>
  );
}
