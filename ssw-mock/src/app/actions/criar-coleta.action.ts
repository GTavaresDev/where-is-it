"use server";

import {
  criarColeta,
  statusAtualDaColeta,
  type Coleta,
} from "@/lib/coletas";

export type CriarColetaResult =
  | {
      ok: true;
      data: {
        id: string;
        cnpj: string;
        nfNumber: string;
        pickupDate: string;
        status: string;
        orderNumber: string;
      };
    }
  | { ok: false; error: string };

function toResultData(coleta: Coleta) {
  return {
    id: coleta.id,
    cnpj: coleta.cnpj,
    nfNumber: coleta.nfNumber,
    pickupDate: coleta.pickupDate,
    status: statusAtualDaColeta(coleta),
    orderNumber: coleta.orderNumber,
  };
}

export async function criarColetaAction({
  cnpj,
}: {
  cnpj: string;
}): Promise<CriarColetaResult> {
  const cleanCnpj = cnpj.replace(/\D/g, "").trim();

  if (!cleanCnpj) {
    return { ok: false, error: "Informe o CNPJ." };
  }

  if (cleanCnpj.length !== 14) {
    return { ok: false, error: "CNPJ deve ter 14 dígitos." };
  }

  try {
    const coleta = await criarColeta(cleanCnpj);
    return { ok: true, data: toResultData(coleta) };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao criar coleta.";
    return { ok: false, error: message };
  }
}
