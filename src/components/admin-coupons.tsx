"use client";
import { useState } from "react";
import type { Coupon } from "@/services/coupons";
import { categories, money } from "@/services/catalog";
import { useDemo } from "./demo-provider";
import { AdminModal } from "./admin-modal";

export function AdminCoupons() {
  const { state, update, notify } = useDemo();
  const [draft, setDraft] = useState<Coupon | null>(null);
  const [error, setError] = useState("");
  const existing = draft && state.coupons.some((c) => c.theme === draft.theme);
  const open = (coupon: Coupon) => {
    setDraft(structuredClone(coupon));
    setError("");
  };
  return (
    <>
      <div className="operations-heading">
        <p>
          Defina quais presentes participam, o desconto e os limites de cada
          campanha.
        </p>
        <button
          className="button"
          onClick={() =>
            open({
              code: "",
              theme: "campanha-" + Date.now(),
              title: "",
              description: "",
              percent: 10,
              minimum: 0,
              cap: 100,
              categories: [],
              color: "olive",
              active: true,
            })
          }
        >
          + Novo cupom
        </button>
      </div>
      <section className="panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Campanha</th>
                <th>Condições</th>
                <th>Usos em pedidos</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {state.coupons.map((coupon) => (
                <tr key={coupon.theme}>
                  <td>
                    <b>{coupon.code}</b>
                    <small>{coupon.title}</small>
                  </td>
                  <td>
                    {coupon.percent}% · mínimo {money(coupon.minimum)}
                    <small>Até {money(coupon.cap)} de desconto</small>
                    <small>
                      {coupon.categories.length
                        ? coupon.categories.join(", ")
                        : "Todas as categorias"}
                    </small>
                    {coupon.firstOrderOnly && <small>Primeiro pedido</small>}
                  </td>
                  <td>
                    {
                      state.orders.filter((o) => o.coupon === coupon.code)
                        .length
                    }
                  </td>
                  <td>
                    <span
                      className={
                        "badge " + (coupon.active === false ? "warning" : "")
                      }
                    >
                      {coupon.active === false ? "Pausado" : "Ativo"}
                    </span>
                  </td>
                  <td className="product-management-actions">
                    <button
                      className="text-link"
                      aria-label={"Editar cupom " + coupon.code}
                      onClick={() => open(coupon)}
                    >
                      Editar
                    </button>
                    <button
                      className="text-link"
                      aria-label={
                        (coupon.active === false
                          ? "Ativar cupom "
                          : "Pausar cupom ") + coupon.code
                      }
                      onClick={() => {
                        update((current) => ({
                          ...current,
                          coupons: current.coupons.map((c) =>
                            c.theme === coupon.theme
                              ? { ...c, active: c.active === false }
                              : c,
                          ),
                        }));
                        notify(
                          coupon.active === false
                            ? "Cupom ativado na loja."
                            : "Cupom pausado. Novos pedidos não poderão utilizá-lo.",
                        );
                      }}
                    >
                      {coupon.active === false ? "Ativar" : "Pausar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="fine-print">
          As alterações valem para novos pedidos. Pedidos concluídos preservam
          seus descontos. Cupons não acumulam com ofertas do vendedor.
        </p>
      </section>
      {draft && (
        <AdminModal
          title={existing ? "Editar cupom" : "Novo cupom"}
          onClose={() => setDraft(null)}
        >
          <form
            className="operation-form"
            onSubmit={(e) => {
              e.preventDefault();
              const code = draft.code.trim().toUpperCase();
              if (
                !/^[A-Z0-9-]{3,20}$/.test(code) ||
                state.coupons.some(
                  (c) => c.code === code && c.theme !== draft.theme,
                )
              ) {
                setError(
                  "Use um código único com 3 a 20 letras, números ou hífens.",
                );
                return;
              }
              if (
                !draft.title.trim() ||
                draft.percent <= 0 ||
                draft.percent > 100 ||
                draft.minimum < 0 ||
                draft.cap <= 0
              ) {
                setError("Revise título, percentual e limites do cupom.");
                return;
              }
              const saved = { ...draft, code, title: draft.title.trim() };
              update((current) => ({
                ...current,
                coupons: existing
                  ? current.coupons.map((c) =>
                      c.theme === draft.theme ? saved : c,
                    )
                  : [...current.coupons, saved],
              }));
              notify(
                existing ? "Cupom atualizado na loja." : "Novo cupom criado.",
              );
              setDraft(null);
            }}
          >
            <label>
              Código
              <input
                required
                readOnly={!!existing}
                maxLength={20}
                value={draft.code}
                onChange={(e) =>
                  setDraft({ ...draft, code: e.target.value.toUpperCase() })
                }
              />
            </label>
            <label>
              Título da campanha
              <input
                required
                maxLength={100}
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </label>
            <label>
              Descrição
              <textarea
                required
                rows={3}
                maxLength={500}
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
              />
            </label>
            <div className="form-grid">
              <label>
                Desconto (%)
                <input
                  required
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={draft.percent}
                  onChange={(e) =>
                    setDraft({ ...draft, percent: Number(e.target.value) })
                  }
                />
              </label>
              <label>
                Valor mínimo (R$)
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.minimum}
                  onChange={(e) =>
                    setDraft({ ...draft, minimum: Number(e.target.value) })
                  }
                />
              </label>
              <label>
                Desconto máximo (R$)
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={draft.cap}
                  onChange={(e) =>
                    setDraft({ ...draft, cap: Number(e.target.value) })
                  }
                />
              </label>
            </div>
            <fieldset className="coupon-category-fields">
              <legend>Categorias elegíveis</legend>
              <p className="fine-print">
                Sem categorias selecionadas, o cupom vale para todos os
                produtos.
              </p>
              {categories.map((category) => (
                <label className="check-label" key={category}>
                  <input
                    type="checkbox"
                    checked={draft.categories.includes(category)}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        categories: e.target.checked
                          ? [...draft.categories, category]
                          : draft.categories.filter((c) => c !== category),
                      })
                    }
                  />
                  {category}
                </label>
              ))}
            </fieldset>
            <label className="check-label">
              <input
                type="checkbox"
                checked={!!draft.firstOrderOnly}
                onChange={(e) =>
                  setDraft({ ...draft, firstOrderOnly: e.target.checked })
                }
              />
              Somente no primeiro pedido
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={draft.active !== false}
                onChange={(e) =>
                  setDraft({ ...draft, active: e.target.checked })
                }
              />
              Cupom ativo na loja
            </label>
            <label>
              Cor da campanha
              <select
                aria-label="Cor da campanha"
                value={draft.color}
                onChange={(e) => setDraft({ ...draft, color: e.target.value })}
              >
                <option value="olive">Oliva</option>
                <option value="sand">Areia</option>
                <option value="rose">Rosa</option>
              </select>
            </label>
            {error && (
              <p className="notice" role="alert">
                {error}
              </p>
            )}
            <div className="admin-modal-actions">
              <button
                type="button"
                className="button outline"
                onClick={() => setDraft(null)}
              >
                Cancelar
              </button>
              <button className="button">Salvar cupom</button>
            </div>
          </form>
        </AdminModal>
      )}
    </>
  );
}
