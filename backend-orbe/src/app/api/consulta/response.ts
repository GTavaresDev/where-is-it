import { NextResponse } from "next/server";
import type {
  ConsultaError,
  ConsultaErrorCode,
} from "@/services/SSW/consulta/consultarPorCnpjENf";

const errorResponses: Record<
  ConsultaErrorCode,
  { message: string; status: number }
> = {
  INVALID_CNPJ: { message: "CNPJ inválido.", status: 400 },
  INVALID_NF: { message: "Nota fiscal é obrigatória.", status: 400 },
  SCRAPING_FAILED: {
    message: "Não foi possível interpretar a resposta do SSW no momento.",
    status: 502,
  },
  NO_PACKAGES: { message: "Nenhuma encomenda encontrada.", status: 404 },
  CONSULTA_NOT_FOUND: {
    message: "Encomenda não encontrada para este CNPJ.",
    status: 404,
  },
  SSW_UNAVAILABLE: {
    message:
      "O sistema SSW está temporariamente indisponível. Tente novamente em alguns minutos.",
    status: 502,
  },
  INTERNAL_ERROR: {
    message: "Ocorreu um erro interno ao buscar as encomendas.",
    status: 500,
  },
};

export function buildConsultaError(
  code: ConsultaErrorCode,
  message = errorResponses[code].message,
  status = errorResponses[code].status,
) {
  return NextResponse.json<ConsultaError>(
    { success: false, error: message, code },
    { status },
  );
}

export function handleConsultaError(
  error: unknown,
  notFoundMessage = errorResponses.CONSULTA_NOT_FOUND.message,
) {
  if (error instanceof Error && "code" in error) {
    const code = error.code;

    if (typeof code === "string" && code in errorResponses) {
      return buildConsultaError(
        code as ConsultaErrorCode,
        code === "CONSULTA_NOT_FOUND" ? notFoundMessage : undefined,
      );
    }
  }

  return buildConsultaError("INTERNAL_ERROR");
}
