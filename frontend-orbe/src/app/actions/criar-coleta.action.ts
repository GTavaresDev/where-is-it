"use server";

import { criarColetaNoMock } from "@/lib/ssw-mock-client";
import type { ApiEncomenda } from "@/lib/types";

export type CriarColetaResult =
  | { ok: true; data: ApiEncomenda }
  | { ok: false; error: string };

export async function criarColetaAction({
  cnpj,
}: {
  cnpj: string;
}): Promise<CriarColetaResult> {
  const cleanCnpj = cnpj.replace(/\D/g, "").trim();

  if (cleanCnpj.length !== 14) {
    return { ok: false, error: "CNPJ deve ter 14 dígitos." };
  }

  try {
    return await criarColetaNoMock(cleanCnpj);
  } catch {
    return {
      ok: false,
      error: "Não foi possível falar com o ssw-mock. Ele está na porta 4000?",
    };
  }
}
