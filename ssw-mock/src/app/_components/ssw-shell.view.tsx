import Link from "next/link";
import type { ReactNode } from "react";

type SswShellProps = {
  subtitle: string;
  children: ReactNode;
};

export function SswShell({ subtitle, children }: SswShellProps) {
  return (
    <div className="ssw-shell">
      <div className="ssw-top">
        SSW - Sistema Softway de Web
        <small>{subtitle}</small>
      </div>

      <div className="ssw-bar">
        Arquivo | <Link href="/">Consulta</Link> |{" "}
        <Link href="/coleta">Coleta</Link> | Ajuda
      </div>

      <div className="ssw-body">{children}</div>

      <div className="ssw-footer">
        © SSW Orbe Mock — seed + coletas em data/
      </div>
    </div>
  );
}
