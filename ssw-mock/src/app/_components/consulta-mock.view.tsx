"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import {
  consultarMockAction,
  type ConsultaMockResult,
} from "../actions/consultar.action";
import type { SeedRastreamento } from "@/lib/seed";
import { SswShell } from "./ssw-shell.view";

export function ConsultaMockView() {
  const [cnpj, setCnpj] = useState("11222333000181");
  const [nfNumber, setNfNumber] = useState("1001");
  const [resultado, setResultado] = useState<ConsultaMockResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResultado(null);
    startTransition(async () => {
      setResultado(await consultarMockAction({ cnpj, nfNumber }));
    });
  }

  let submitLabel = "Consultar";
  if (isPending) {
    submitLabel = "Aguarde...";
  }

  let panel: ReactNode = (
    <div className="ssw-empty">
      Informe o CNPJ do destinatário e o número da NF e clique em Consultar.
    </div>
  );

  if (resultado?.ok) {
    panel = <ListaResultados items={resultado.data} />;
  } else if (resultado && !resultado.ok) {
    panel = <div className="ssw-error">{resultado.error}</div>;
  }

  return (
    <SswShell subtitle="Módulo de Rastreamento · Ambiente de demonstração">
      <div className="ssw-panel">
        <div className="ssw-panel-title">Consulta por CNPJ / NF</div>

        <form onSubmit={onSubmit}>
          <table className="ssw-form-table">
            <tbody>
              <tr>
                <td className="label">CNPJ destinatário:</td>
                <td>
                  <input
                    className="ssw-input"
                    value={cnpj}
                    onChange={(event) => setCnpj(event.target.value)}
                    maxLength={18}
                  />
                </td>
              </tr>
              <tr>
                <td className="label">Nº da nota fiscal:</td>
                <td>
                  <input
                    className="ssw-input"
                    value={nfNumber}
                    onChange={(event) => setNfNumber(event.target.value)}
                    maxLength={12}
                  />
                </td>
              </tr>
              <tr>
                <td />
                <td>
                  <button type="submit" className="ssw-btn" disabled={isPending}>
                    {submitLabel}
                  </button>
                  &nbsp;
                  <button
                    type="button"
                    className="ssw-btn"
                    onClick={() => {
                      setCnpj("");
                      setNfNumber("");
                      setResultado(null);
                    }}
                  >
                    Limpar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="ssw-hint">
            Exemplos: 11222333000181 / 1001 · 11222333000181 / 1002 ·
            04521456000158 / 2001 (NF em branco lista todas do CNPJ)
          </div>
        </form>
      </div>

      {panel}
    </SswShell>
  );
}

function ListaResultados({ items }: { items: SeedRastreamento[] }) {
  return (
    <table className="ssw-result">
      <thead>
        <tr>
          <th colSpan={6}>Encomendas encontradas</th>
        </tr>
        <tr>
          <th className="ssw-col-head">NF</th>
          <th className="ssw-col-head">Destinatário</th>
          <th className="ssw-col-head">Pedido</th>
          <th className="ssw-col-head">Coleta</th>
          <th className="ssw-col-head">Última ocorrência</th>
          <th className="ssw-col-head">Detalhe</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const ultimo = item.events[0];
          let ultimaOcorrencia = "—";
          if (ultimo) {
            ultimaOcorrencia = `${ultimo.dateTime} — ${ultimo.title}`;
          }

          return (
            <tr key={item.id}>
              <td className="ssw-list-cell">{item.nfNumber}</td>
              <td className="ssw-list-cell">{item.recipient}</td>
              <td className="ssw-list-cell">{item.orderNumber}</td>
              <td className="ssw-list-cell">{item.pickupDate}</td>
              <td className="ssw-list-cell">{ultimaOcorrencia}</td>
              <td className="ssw-list-cell ssw-list-center">
                <Link href={`/detalhe/${item.id}`}>Ver detalhes</Link>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
