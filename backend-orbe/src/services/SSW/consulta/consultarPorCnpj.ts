import { fetchRastreamentoPorCnpjHtml } from "./consultarPorCnpj.gateway";
import {
  parseRastreamentoPorCnpj,
  type EncomendaRastreada,
} from "./consultarPorCnpj.parser";

export type ConsultaPorCnpjResponse = {
  success: true;
  data: EncomendaRastreada[];
  scrapedAt: string;
};

export async function consultarPorCnpj({
  cnpj,
  nfNumber,
}: {
  cnpj: string;
  nfNumber: string;
}): Promise<ConsultaPorCnpjResponse> {
  const html = await fetchRastreamentoPorCnpjHtml({ cnpj, nfNumber });
  const data = parseRastreamentoPorCnpj(html);

  if (data.length === 0) {
    const error = new Error("Nenhuma encomenda encontrada para este CNPJ.") as Error & {
      code: "CONSULTA_NOT_FOUND";
    };
    error.code = "CONSULTA_NOT_FOUND";
    throw error;
  }

  return {
    success: true,
    data,
    scrapedAt: new Date().toISOString(),
  };
}
