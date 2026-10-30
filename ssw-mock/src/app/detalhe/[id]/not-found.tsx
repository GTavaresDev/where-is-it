import Link from "next/link";
import { SswShell } from "../../_components/ssw-shell.view";

export default function DetalheNotFound() {
  return (
    <SswShell subtitle="Detalhe do rastreamento · Ambiente de demonstração">
      <div className="ssw-error">
        Encomenda não encontrada no mock.
      </div>
      <p className="ssw-nav">
        <Link href="/">« Voltar à consulta</Link>
      </p>
    </SswShell>
  );
}
