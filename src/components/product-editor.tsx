"use client";
import { useState } from "react";
import type { Product } from "@/domain/types";
import { categories } from "@/services/catalog";
import { useDemo } from "./demo-provider";
import { AdminModal } from "./admin-modal";

export function ProductEditor({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { update, notify } = useDemo();
  const [draft, setDraft] = useState({ ...product });
  const field = (key: "name" | "brand" | "subcategory", label: string) => (
    <label>
      {label}
      <input
        value={draft[key] || ""}
        required={key === "name"}
        maxLength={120}
        onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
      />
    </label>
  );
  return (
    <AdminModal title="Editar produto" onClose={onClose}>
      <form
        className="operation-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (
            !draft.name.trim() ||
            draft.price <= 0 ||
            !Number.isInteger(draft.stock) ||
            draft.stock < 0 ||
            (draft.originalPrice && draft.originalPrice <= draft.price)
          ) {
            notify(
              "Revise nome, preços e estoque. O preço original deve ser maior que o preço atual.",
            );
            return;
          }
          update((state) => ({
            ...state,
            products: state.products.map((p) =>
              p.id === product.id ? { ...draft, name: draft.name.trim() } : p,
            ),
            editedProductIds: [
              ...new Set([...(state.editedProductIds || []), product.id]),
            ],
          }));
          notify("Produto atualizado no catálogo e no estoque.");
          onClose();
        }}
      >
        {field("name", "Nome do produto")}
        <div className="form-grid">
          <label>
            Categoria
            <select
              aria-label="Categoria do produto"
              value={draft.category}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  category: e.target.value as Product["category"],
                })
              }
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          {field("subcategory", "Subcategoria")}
        </div>
        {field("brand", "Marca")}
        <div className="form-grid">
          <label>
            Preço (R$)
            <input
              required
              type="number"
              step="0.01"
              min="0.01"
              value={draft.price}
              onChange={(e) =>
                setDraft({ ...draft, price: Number(e.target.value) })
              }
            />
          </label>
          <label>
            Preço original (R$)
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={draft.originalPrice || ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  originalPrice: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
            />
          </label>
          <label>
            Estoque
            <input
              required
              type="number"
              step="1"
              min="0"
              max="9999"
              value={draft.stock}
              onChange={(e) =>
                setDraft({ ...draft, stock: Number(e.target.value) })
              }
            />
          </label>
        </div>
        <label>
          Descrição
          <textarea
            required
            rows={4}
            maxLength={2000}
            value={draft.description}
            onChange={(e) =>
              setDraft({ ...draft, description: e.target.value })
            }
          />
        </label>
        <label className="check-label">
          <input
            type="checkbox"
            checked={!!draft.customizable}
            onChange={(e) =>
              setDraft({ ...draft, customizable: e.target.checked })
            }
          />
          Permite mensagem personalizada
        </label>
        <div className="admin-modal-actions">
          <button type="button" className="button outline" onClick={onClose}>
            Cancelar
          </button>
          <button className="button">Salvar alterações</button>
        </div>
      </form>
    </AdminModal>
  );
}
