"use client";

import { usePathname } from "next/navigation";
import { NovaColetaModal } from "./nova-coleta-modal";

export function Header() {
  const pathname = usePathname();

  let title = "Orbe";
  if (pathname === "/consulta") {
    title = "Rastreamento";
  } else if (pathname.startsWith("/coleta")) {
    title = "Coletas";
  } else if (pathname.startsWith("/detalhe")) {
    title = "Detalhes do Envio";
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-card/80 px-6 backdrop-blur-md">
      <div>
        <h1 className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <NovaColetaModal />
      </div>
    </header>
  );
}

