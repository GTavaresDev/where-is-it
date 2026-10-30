"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import {
  criarColetaAction,
  type CriarColetaResult,
} from "../actions/criar-coleta.action";
import { SswShell } from "./ssw-shell.view";

export function CriarColetaView() {
  const [cnpj, setCnpj] = useState("11222333000181");
  const [resultado, setResultado] = useState<CriarColetaResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResultado(null);
    startTransition(async () => {
      setResultado(await criarColetaAction({ cnpj }));
    });
  }

  let submitLabel = "Gerar coleta";
  if (isPending) {
    submitLabel = "Aguarde...";
  }

  let panel: ReactNode = (
    <div className="ssw-empty">
      Informe o CNPJ do destinatário. O sistema gera NF, data e status inicial.
      O status avança automaticamente a cada 2 minutos.
    </div>
  );

  if (resultado?.ok) {
    panel = (
      <table className="ssw-result">
        <thead>
          <tr>
            <th colSpan={2}>Coleta gerada</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={2} className="ssw-pad-0">
              <table className="ssw-meta">
                <tbody>
                  <tr>
                    <td className="meta-label">NF</td>
                    <td>{resultado.data.nfNumber}</td>
                    <td className="meta-label">Data</td>
                    <td>{resultado.data.pickupDate}</td>
                  </tr>
                  <tr>
                    <td className="meta-label">CNPJ</td>
                    <td>{resultado.data.cnpj}</td>
                    <td className="meta-label">Pedido</td>
                    <td>{resultado.data.orderNumber}</td>
                  </tr>
                  <tr>
                    <td className="meta-label">Status</td>
                    <td colSpan={3}>{resultado.data.status}</td>
                  </tr>
                  <tr>
                    <td className="meta-label">Detalhe</td>
                    <td colSpan={3}>
                      <Link href={`/detalhe/${resultado.data.id}`}>
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    );
  } else if (resultado && !resultado.ok) {
    panel = <div className="ssw-error">{resultado.error}</div>;
  }

  return (
    <SswShell subtitle="Cadastro de coleta · Ambiente de demonstração">
      <div className="ssw-panel">
        <div className="ssw-panel-title">Nova coleta</div>

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
            Após criar, consulte a NF na tela de Consulta. Status sobe a cada 2
            min até MERCADORIA ENTREGUE.
          </div>
        </form>
      </div>

      {panel}
    </SswShell>
  );
}
