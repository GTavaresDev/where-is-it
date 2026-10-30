"use server";

import { findByCnpjAndNf, type SeedRastreamento } from "@/lib/seed";

export type ConsultaMockResult =
  | { ok: true; data: SeedRastreamento[] }
  | { ok: false; error: string };

export async function consultarMockAction({
  cnpj,
  nfNumber,
}: {
  cnpj: string;
  nfNumber: string;
}): Promise<ConsultaMockResult> {
  const cleanCnpj = cnpj.replace(/\D/g, "").trim();
  const cleanNf = nfNumber.replace(/\D/g, "").trim();

  if (!cleanCnpj) {
    return { ok: false, error: "Informe o CNPJ." };
  }

  const matches = await findByCnpjAndNf({
    cnpj: cleanCnpj,
    nfNumber: cleanNf,
  });

  if (matches.length === 0) {
    return {
      ok: false,
      error: "Nenhuma encomenda encontrada para este CNPJ e NF no mock.",
    };
  }

  return { ok: true, data: matches };
}
