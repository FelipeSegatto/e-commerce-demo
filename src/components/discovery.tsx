"use client";
import { useState } from "react";
import Link from "next/link";
import { budgets, filtersQuery, defaults } from "@/services/browse";
import { occasions } from "@/services/catalog";
import { coupons } from "@/services/coupons";
import { Icon } from "./demo-provider";
export function Discovery({ full = false }: { full?: boolean }) {
  const [occasion, setOccasion] = useState("Todas");
  const [budget, setBudget] = useState("75a150");
  const range = budgets.find((b) => b.id === budget)!;
  return (
    <section
      className={
        "discovery container section " + (full ? "discovery-full" : "")
      }
    >
      <div className="discovery-copy">
        <p className="eyebrow">UM POUCO DE AJUDA PARA ESCOLHER</p>
        {full ? (
          <h1>Vamos encontrar o presente certo?</h1>
        ) : (
          <h2>
            Para quem importa.
            <br />
            <em>No seu orçamento.</em>
          </h2>
        )}
        <p>
          Conte o momento e quanto você quer investir. A gente prepara uma
          seleção para você.
        </p>
      </div>
      <div className="gift-finder">
        <label>
          Qual é a ocasião?
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            aria-label="Ocasião do assistente"
          >
            {["Todas", ...occasions].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
        <label>
          Quanto você quer investir?
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            aria-label="Orçamento do assistente"
          >
            {budgets.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        </label>
        <Link
          className="button"
          href={
            "/catalogo?" +
            filtersQuery({
              ...defaults,
              occasion,
              min: range.min,
              max: range.max,
            })
          }
        >
          Encontrar meus presentes <Icon name="arrow" size={18} />
        </Link>
      </div>
      {full && (
        <div className="theme-navigation">
          <h2>Ou comece pelo sentimento.</h2>
          <div>
            {coupons.slice(1).map((c) => (
              <Link href={"/catalogo?tema=" + c.theme} key={c.theme}>
                <span className="eyebrow">
                  {c.percent}% COM {c.code}
                </span>
                <h3>{c.title}</h3>
                <p>{c.description}</p>
                <Icon name="arrow" size={18} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
