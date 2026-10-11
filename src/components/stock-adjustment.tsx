"use client";
import { useState } from "react";
import type { Product, StockMovement } from "@/domain/types";
import { adjustStock } from "@/services/stock";
import { useDemo } from "./demo-provider";
import { AdminModal } from "./admin-modal";

export function StockAdjustment({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { state, update, notify } = useDemo();
  const [direction, setDirection] = useState("entrada");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const delta = Number(quantity) * (direction === "entrada" ? 1 : -1);
  const next = product.stock + delta;
  const valid =
    Number.isInteger(Number(quantity)) &&
    Number(quantity) > 0 &&
    next >= 0 &&
    next <= 9999 &&
    !!reason &&
    (reason !== "Outro" || !!note.trim());
  const resetConfirmation = () => {
    setConfirmed(false);
    setError("");
  };
  const history = (state.stockMovements || []).filter(
    (movement) => movement.productId === product.id,
  );
  return (
    <AdminModal title="Ajustar estoque" onClose={onClose}>
      <p>{product.name}</p>
      <p className="fine-print">
        Use este ajuste para reposição, contagem física ou correções. Vendas
        baixam o estoque automaticamente ao serem concluídas.
      </p>
      <form
        className="operation-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!valid || !confirmed) return;
          const movement: StockMovement = {
            id: "AJ-" + Date.now().toString(36),
            productId: product.id,
            previous: product.stock,
            next,
            quantity: delta,
            reason,
            note: note.trim(),
            actor: "Admin Demo",
            createdAt: new Date().toISOString(),
          };
          const result = adjustStock(state, movement);
          if (result.error) {
            setError(result.error);
            return;
          }
          update((current) => adjustStock(current, movement).state);
          notify("Ajuste confirmado e registrado no histórico.");
          onClose();
        }}
      >
        <div className="form-grid">
          <label>
            Tipo de ajuste
            <select
              aria-label="Tipo de ajuste"
              value={direction}
              onChange={(e) => {
                setDirection(e.target.value);
                resetConfirmation();
              }}
            >
              <option value="entrada">Entrada de unidades</option>
              <option value="saida">Saída de unidades</option>
            </select>
          </label>
          <label>
            Quantidade do ajuste
            <input
              required
              type="number"
              min="1"
              step="1"
              max="9999"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                resetConfirmation();
              }}
            />
          </label>
        </div>
        <label>
          Motivo do ajuste
          <select
            required
            aria-label="Motivo do ajuste"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              resetConfirmation();
            }}
          >
            <option value="">Selecione um motivo</option>
            {[
              "Reposição",
              "Contagem física",
              "Avaria",
              "Devolução",
              "Correção de cadastro",
              "Outro",
            ].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Observação
          <textarea
            rows={2}
            maxLength={500}
            required={reason === "Outro"}
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              resetConfirmation();
            }}
          />
        </label>
        <div className="notice stock-adjustment-preview">
          <span>
            Saldo atual: <b>{product.stock} un.</b>
          </span>
          <span>
            Ajuste:{" "}
            <b>
              {delta > 0 ? "+" : ""}
              {delta} un.
            </b>
          </span>
          <span>
            Saldo após confirmação: <b>{next} un.</b>
          </span>
        </div>
        {quantity && (next < 0 || next > 9999) && (
          <p role="alert">
            O ajuste não pode deixar o saldo negativo nem superar 9.999
            unidades.
          </p>
        )}
        <label className="check-label">
          <input
            type="checkbox"
            checked={confirmed}
            disabled={!valid}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          Conferi a quantidade e o motivo deste ajuste.
        </label>
        {error && (
          <p className="notice" role="alert">
            {error}
          </p>
        )}
        <div className="admin-modal-actions">
          <button type="button" className="button outline" onClick={onClose}>
            Cancelar
          </button>
          <button className="button" disabled={!valid || !confirmed}>
            Confirmar ajuste
          </button>
        </div>
      </form>
      <section className="stock-history">
        <h3>Histórico de ajustes manuais</h3>
        {history.length ? (
          history.slice(0, 10).map((movement) => (
            <div className="list-row" key={movement.id}>
              <span>
                <b>{movement.reason}</b>
                <small>
                  {new Date(movement.createdAt).toLocaleString("pt-BR", {
                    timeZone: "America/Sao_Paulo",
                  })}{" "}
                  · {movement.actor}
                </small>
                {movement.note && <small>{movement.note}</small>}
              </span>
              <b>
                {movement.previous} → {movement.next} un.
              </b>
            </div>
          ))
        ) : (
          <p className="fine-print">
            Nenhum ajuste manual registrado para este produto.
          </p>
        )}
      </section>
    </AdminModal>
  );
}
