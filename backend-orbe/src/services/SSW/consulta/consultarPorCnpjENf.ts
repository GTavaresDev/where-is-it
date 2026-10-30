import {
  fetchDetalheHtmlGateway,
  fetchListaHtmlGateway,
} from "./consultarPorCnpjENf.gateway";
import {
  parseDetalheHtml,
  parseListaHtml,
  type DetalheEncomenda,
} from "./consultarPorCnpjENf.parser";

/**
 * Orquestra a consulta pública de rastreamento SSW por CNPJ + NF:
 * 1. Busca HTML da listagem (gateway)
 * 2. Faz parse dos itens (parser)
 * 3. Localiza a NF solicitada
 * 4. Busca HTML do detalhe (gateway)
 * 5. Faz parse do detalhe e devolve o contrato da API
 */

export type { DetalheEncomenda };
export type {
  ConsultaEvento,
  ConsultaItem,
  StatusEncomenda,
} from "./consultarPorCnpjENf.parser";

export type ConsultaDetalheResponse = {
  success: true;
  data: DetalheEncomenda;
  scrapedAt: string;
};

export type ConsultaErrorCode =
  | "INVALID_CNPJ"
  | "INVALID_NF"
  | "SCRAPING_FAILED"
  | "NO_PACKAGES"
  | "CONSULTA_NOT_FOUND"
  | "SSW_UNAVAILABLE"
  | "INTERNAL_ERROR";

export type ConsultaError = {
  success: false;
  error: string;
  code: ConsultaErrorCode;
};

type ConsultaServiceError = Error & {
  code: ConsultaErrorCode;
};

function createConsultaError(
  code: ConsultaServiceError["code"],
  message: string,
): ConsultaServiceError {
  const error = new Error(message) as ConsultaServiceError;
  error.code = code;
  return error;
}

export async function consultarPorCnpjENf({
  cnpj,
  nfNumber,
}: {
  cnpj: string;
  nfNumber: string;
}): Promise<ConsultaDetalheResponse> {
  const listHtml = await fetchListaHtmlGateway({ cnpj, nfNumber });
  const listItems = parseListaHtml(listHtml);
  const requestedNf = nfNumber.replace(/\D/g, "");
  const targetItem =
    listItems.find(
      (item) => item.nfNumber.replace(/\D/g, "") === requestedNf,
    ) ?? (listItems.length === 1 ? listItems[0] : undefined);

  if (!targetItem) {
    throw createConsultaError(
      "CONSULTA_NOT_FOUND",
      "Encomenda não encontrada para este CNPJ e nota fiscal.",
    );
  }

  const detailHtml = await fetchDetalheHtmlGateway({
    detailPath: targetItem.detailPath,
  });
  const detail = parseDetalheHtml(detailHtml, targetItem);

  return {
    success: true,
    data: detail,
    scrapedAt: new Date().toISOString(),
  };
}
