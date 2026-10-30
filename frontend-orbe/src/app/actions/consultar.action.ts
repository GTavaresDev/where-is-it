"use server";

import { consultarNoBackend } from "@/lib/orbe-api-client";
import type { ApiEncomenda } from "@/lib/types";

export type ConsultaResult =
  | { ok: true; data: ApiEncomenda[] }
  | { ok: false; error: string };

export async function consultarAction({
  cnpj,
  nfNumber,
}: {
  cnpj: string;
  nfNumber: string;
}): Promise<ConsultaResult> {
  const cleanCnpj = cnpj.replace(/\D/g, "").trim();
  const cleanNf = nfNumber.replace(/\D/g, "").trim();

  if (!cleanCnpj) {
    return { ok: false, error: "Informe o CNPJ." };
  }

  try {
    return await consultarNoBackend({ cnpj: cleanCnpj, nfNumber: cleanNf });
  } catch {
    return {
      ok: false,
      error: "Não foi possível falar com o backend. Ele está na porta 3001?",
    };
  }
}
