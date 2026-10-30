"use server";

import { listarColetasNoMock } from "@/lib/ssw-mock-client";
import type { ApiEncomenda } from "@/lib/types";

export async function listarColetasAction({
  cnpj,
}: {
  cnpj: string;
}): Promise<{ ok: true; data: ApiEncomenda[] } | { ok: false; error: string }> {
  try {
    return await listarColetasNoMock(cnpj.replace(/\D/g, ""));
  } catch {
    return { ok: false, error: "Não foi possível carregar as coletas." };
  }
}
