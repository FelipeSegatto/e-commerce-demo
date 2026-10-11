"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Proposal } from "@/domain/types";
import { useDemo } from "./demo-provider";
import { proposalItems, proposalStockValid } from "@/services/proposals";
import { completePhysicalSale } from "@/services/assisted-sales";

export function OfferActions({ proposal }: { proposal: Proposal }) {
  const { state, update, notify } = useDemo();
  const router = useRouter();
  const [channel, setChannel] = useState("online");
  const [payment, setPayment] = useState("Pix");
  const [confirmed, setConfirmed] = useState(false);
  const submitted = useRef(false);
  const lines = proposalItems(proposal);
  const available =
    proposal.status === "Aprovada" && proposalStockValid(lines, state.products);
  const order = state.orders.find((o) => o.proposalId === proposal.id);
  if (proposal.status === "Convertida")
    return (
      <div className="notice">
        <b>Esta oferta já foi utilizada.</b>
        <p>
          {order?.channel === "presencial"
            ? "Venda presencial registrada, com retirada na loja e estoque atualizado."
            : "A compra online foi concluída."}{" "}
          A oferta não pode gerar uma segunda venda.
        </p>
        <Link className="text-link" href="/vendedor/propostas">
          Voltar às propostas ↗
        </Link>
      </div>
    );
  return (
    <div className="offer-channel-section">
      <h3>Como você deseja usar esta oferta?</h3>
      <p>Escolha a compra online ou o atendimento presencial na Gift Store.</p>
      <div className="offer-channel-options">
        <label
          className={"radio-card " + (channel === "online" ? "selected" : "")}
        >
          <input
            type="radio"
            name="offer-channel"
            value="online"
            checked={channel === "online"}
            onChange={() => setChannel("online")}
          />
          <span>
            <b>Comprar online</b>
            <small>
              O cliente escolhe entrega ou retirada e conclui pelo checkout.
            </small>
          </span>
        </label>
        <label
          className={
            "radio-card " + (channel === "presencial" ? "selected" : "")
          }
        >
          <input
            type="radio"
            name="offer-channel"
            value="presencial"
            checked={channel === "presencial"}
            onChange={() => setChannel("presencial")}
          />
          <span>
            <b>Concluir na loja</b>
            <small>
              O vendedor registra o pagamento e a entrega dos produtos no
              atendimento físico.
            </small>
          </span>
        </label>
      </div>
      {!available && (
        <p className="notice">
          {proposal.status === "Aguardando aprovação"
            ? "Aguarde a aprovação do administrador para utilizar a oferta em qualquer canal."
            : "Estoque insuficiente para concluir esta oferta."}
        </p>
      )}
      {channel === "online" ? (
        <>
          <p className="fine-print">
            O desconto segue para o checkout. O estoque só é baixado ao concluir
            o pedido.
          </p>
          <button
            className="button"
            disabled={!available}
            onClick={() => {
              update((current) => ({
                ...current,
                cart: lines.map((line, index) => ({
                  ...line,
                  key: proposal.id + "-" + index,
                  option:
                    current.products.find((p) => p.id === line.productId)
                      ?.options?.[0] || "",
                  message: "",
                })),
              }));
              router.push("/checkout?oferta=" + proposal.id);
            }}
          >
            Comprar online com esta oferta
          </button>
        </>
      ) : (
        <form
          className="operation-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (submitted.current || !confirmed) return;
            const id =
              "GS-" +
              (
                Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
              ).toUpperCase();
            const date = new Date().toISOString();
            const result = completePhysicalSale(
              state,
              proposal.id,
              payment,
              id,
              date,
            );
            if (result.error) {
              notify(result.error);
              return;
            }
            submitted.current = true;
            update(
              (current) =>
                completePhysicalSale(current, proposal.id, payment, id, date)
                  .state,
            );
            notify(
              "Venda presencial registrada. Pedido criado e estoque atualizado.",
            );
          }}
        >
          <label>
            Forma de pagamento na loja
            <select
              aria-label="Forma de pagamento na loja"
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
            >
              <option>Pix</option>
              <option>Cartão de crédito</option>
              <option>Dinheiro</option>
            </select>
          </label>
          <label className="check-label">
            <input
              type="checkbox"
              required
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            Confirmo a simulação do pagamento e da entrega dos produtos na loja.
          </label>
          <p className="fine-print">
            Esta ação registra uma venda presencial, aplica o desconto aprovado
            e baixa o estoque. Não há cobrança real nem integração com caixa ou
            maquininha.
          </p>
          <button className="button" disabled={!available || !confirmed}>
            Registrar venda presencial
          </button>
        </form>
      )}
    </div>
  );
}
