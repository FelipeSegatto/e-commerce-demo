"use client";
import { useState, useId } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDemo, Icon } from "./demo-provider";
import { normalizeText } from "@/services/browse";
import { productOccasions, money } from "@/services/catalog";
export function SmartSearch() {
  const { state } = useDemo();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const id = useId();
  const words = normalizeText(query).trim().split(/\s+/).filter(Boolean);
  const results = words.length
    ? state.products
        .filter((p) =>
          words.every((word) =>
            normalizeText(
              [
                p.name,
                p.brand,
                p.category,
                p.subcategory,
                ...productOccasions(p),
              ].join(" "),
            ).includes(word),
          ),
        )
        .slice(0, 5)
    : [];
  function go(url: string) {
    setOpen(false);
    setActive(-1);
    router.push(url);
  }
  return (
    <div
      className="smart-search"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <form
        className="search"
        onSubmit={(e) => {
          e.preventDefault();
          go(
            active >= 0 && results[active]
              ? "/produto/" + results[active].slug
              : "/catalogo?busca=" + encodeURIComponent(query),
          );
        }}
      >
        <Icon name="search" size={18} />
        <input
          role="combobox"
          aria-label="Buscar presentes"
          aria-autocomplete="list"
          aria-expanded={open && !!query.trim()}
          aria-controls={id}
          aria-activedescendant={active >= 0 ? id + "-" + active : undefined}
          placeholder="Produto, marca, ocasião…"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              setActive(-1);
            }
            if (e.key === "ArrowDown" && results.length) {
              e.preventDefault();
              setActive((active + 1) % results.length);
              setOpen(true);
            }
            if (e.key === "ArrowUp" && results.length) {
              e.preventDefault();
              setActive(active <= 0 ? results.length - 1 : active - 1);
            }
          }}
        />
        <button aria-label="Pesquisar" type="submit">
          <Icon name="arrow" size={16} />
        </button>
      </form>
      {open && query.trim() && (
        <div className="search-suggestions">
          <p>ENCONTRE SEU PRÓXIMO PRESENTE</p>
          <div role="listbox" id={id} aria-label="Sugestões de produtos">
            {results.map((p, index) => (
              <Link
                role="option"
                aria-selected={active === index}
                id={id + "-" + index}
                href={"/produto/" + p.slug}
                className={active === index ? "active" : ""}
                key={p.id}
                onClick={() => setOpen(false)}
              >
                <span>
                  {p.name}
                  <small>
                    {p.brand} · {p.category}
                  </small>
                </span>
                <b>{money(p.price)}</b>
              </Link>
            ))}
          </div>
          {!results.length && (
            <span className="search-empty">
              Nenhum produto direto. Experimente outro termo.
            </span>
          )}
          <Link
            className="search-all"
            href={"/catalogo?busca=" + encodeURIComponent(query)}
            onClick={() => setOpen(false)}
          >
            Buscar “{query}” em todo o catálogo <Icon name="arrow" size={15} />
          </Link>
        </div>
      )}
    </div>
  );
}
