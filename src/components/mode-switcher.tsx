"use client";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { demoRepository } from "@/services/demo";
import { Icon, useDemo } from "./demo-provider";
const modes = [
  {
    id: "loja",
    title: "Loja",
    description: "Descobrir presentes e fazer um pedido",
    href: "/",
    icon: "bag",
  },
  {
    id: "admin",
    title: "Administrador",
    description: "Produtos, estoque, pedidos e descontos",
    href: "/admin",
    icon: "chart",
  },
  {
    id: "vendedor",
    title: "Vendedor",
    description: "Atender clientes e criar propostas",
    href: "/vendedor",
    icon: "user",
  },
];
export function ModeSwitcher() {
  const path = usePathname();
  const router = useRouter();
  const { update, notify } = useDemo();
  const ref = useRef<HTMLDetailsElement>(null);
  const active =
    modes.find((m) => path.startsWith(m.href) && m.id !== "loja") || modes[0];
  const close = () => {
    if (ref.current) ref.current.open = false;
  };
  useEffect(() => {
    function outside(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) close();
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  return (
    <details
      ref={ref}
      className="mode-switcher"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          close();
          ref.current?.querySelector("summary")?.focus();
        }
      }}
    >
      <summary
        aria-label={`Explorar modos da demonstração. Modo atual: ${active.title}`}
      >
        <span className="mode-switcher-mark">
          <Icon name="gift" size={18} />
        </span>
        <span className="mode-switcher-label">
          <small>EXPLORAR DEMO</small>
          <b>{active.title}</b>
        </span>
        <span className="mode-switcher-chevron" aria-hidden="true">
          ⌃
        </span>
      </summary>
      <div className="mode-panel" aria-label="Modos da demonstração">
        <div className="mode-panel-heading">
          <p className="eyebrow">UMA LOJA, TRÊS PERSPECTIVAS</p>
          <h2>Como você quer explorar?</h2>
          <p>Troque de modo a qualquer momento.</p>
        </div>
        <div className="mode-options">
          {modes.map((mode) => (
            <button
              key={mode.id}
              className={active.id === mode.id ? "active" : ""}
              aria-current={active.id === mode.id ? "true" : undefined}
              onClick={() => {
                close();
                router.push(mode.href);
              }}
            >
              <span className="mode-icon">
                <Icon name={mode.icon} size={20} />
              </span>
              <span>
                <b>{mode.title}</b>
                <small>{mode.description}</small>
              </span>
              <Icon
                name={active.id === mode.id ? "check" : "arrow"}
                size={17}
              />
            </button>
          ))}
        </div>
        <div className="mode-panel-footer">
          <span>Dados e pedidos simulados</span>
          <button
            onClick={() => {
              if (
                window.confirm(
                  "Reiniciar sacola, pedidos e alterações desta demonstração?",
                )
              ) {
                update(() => demoRepository.reset());
                notify("Demonstração reiniciada.");
                close();
                router.push("/");
              }
            }}
          >
            Reiniciar demo
          </button>
        </div>
      </div>
    </details>
  );
}
