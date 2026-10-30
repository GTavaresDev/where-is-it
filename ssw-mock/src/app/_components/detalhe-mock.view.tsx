import Link from "next/link";
import type { SeedRastreamento } from "@/lib/seed";
import { SswShell } from "./ssw-shell.view";

type DetalheMockViewProps = {
  data: SeedRastreamento;
};

export function DetalheMockView({ data }: DetalheMockViewProps) {
  return (
    <SswShell subtitle="Detalhe do rastreamento · Ambiente de demonstração">
      <div className="ssw-panel">
        <div className="ssw-panel-title">Detalhe da encomenda</div>
        <p className="ssw-nav">
          <Link href="/">« Voltar à consulta</Link>
        </p>
      </div>

      <table className="ssw-result">
        <thead>
          <tr>
            <th colSpan={2}>Dados da nota fiscal {data.nfNumber}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={2} className="ssw-pad-0">
              <table className="ssw-meta">
                <tbody>
                  <tr>
                    <td className="meta-label">Nota fiscal</td>
                    <td>{data.nfNumber}</td>
                    <td className="meta-label">Pedido</td>
                    <td>{data.orderNumber}</td>
                  </tr>
                  <tr>
                    <td className="meta-label">Destinatário</td>
                    <td>{data.recipient}</td>
                    <td className="meta-label">Coleta</td>
                    <td>{data.pickupDate}</td>
                  </tr>
                  <tr>
                    <td className="meta-label">CNPJ</td>
                    <td>{data.cnpj}</td>
                    <td className="meta-label">Código</td>
                    <td>{data.id}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="ssw-result ssw-result-gap">
        <thead>
          <tr>
            <th colSpan={4}>Histórico de ocorrências</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={4} className="ssw-pad-0">
              <table className="ssw-events">
                <thead>
                  <tr>
                    <th>Data / Hora</th>
                    <th>Ocorrência</th>
                    <th>Local / Unidade</th>
                    <th>Detalhe</th>
                  </tr>
                </thead>
                <tbody>
                  {data.events.map((event, index) => {
                    let rowClass = "";
                    if (index === 0) {
                      rowClass = "first";
                    }

                    return (
                      <tr key={`${event.dateTime}-${index}`} className={rowClass}>
                        <td>{event.dateTime}</td>
                        <td>{event.title}</td>
                        <td>
                          {event.location} / {event.unit}
                        </td>
                        <td>{event.detail}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      <p className="ssw-nav ssw-nav-bottom">
        <Link href="/">« Voltar à consulta</Link>
      </p>
    </SswShell>
  );
}
