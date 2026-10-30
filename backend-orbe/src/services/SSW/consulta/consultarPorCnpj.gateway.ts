import { cnpjSchema } from "./consultarPorCnpjENf.schema";

const SSW_BASE_URL =
  process.env.ORBE_SSW_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:4000";
const REQUEST_TIMEOUT_MS = 15_000;

export type ConsultaPorCnpjGatewayErrorCode =
  | "INVALID_CNPJ"
  | "SCRAPING_FAILED"
  | "SSW_UNAVAILABLE"
  | "CONSULTA_NOT_FOUND";

export type ConsultaPorCnpjGatewayError = Error & {
  code: ConsultaPorCnpjGatewayErrorCode;
};

function createError(
  code: ConsultaPorCnpjGatewayErrorCode,
  message: string,
  cause?: unknown,
): ConsultaPorCnpjGatewayError {
  const error = new Error(message, cause ? { cause } : undefined) as ConsultaPorCnpjGatewayError;
  error.code = code;
  return error;
}

export async function fetchRastreamentoPorCnpjHtml({
  cnpj,
  nfNumber,
}: {
  cnpj: string;
  nfNumber: string;
}): Promise<string> {
  const parsedCnpj = cnpjSchema.safeParse(cnpj);
  if (!parsedCnpj.success) {
    throw createError("INVALID_CNPJ", "CNPJ inválido.");
  }

  const params = new URLSearchParams({ cnpj: parsedCnpj.data });
  if (nfNumber.replace(/\D/g, "")) {
    params.set("nfNumber", nfNumber.replace(/\D/g, ""));
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${SSW_BASE_URL}/2/rastreamento_cnpj?${params}`,
      {
        method: "GET",
        signal: controller.signal,
        cache: "no-store",
        headers: { Accept: "text/html" },
      },
    );
    const html = await response.text();

    if (response.status === 404) {
      throw createError(
        "CONSULTA_NOT_FOUND",
        "Nenhuma encomenda encontrada para este CNPJ.",
      );
    }

    if (!response.ok) {
      throw createError(
        "SCRAPING_FAILED",
        `Falha ao consultar o SSW Orbe (HTTP ${response.status}).`,
      );
    }

    return html;
  } catch (error) {
    if (error instanceof Error && "code" in error) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw createError(
        "SSW_UNAVAILABLE",
        "O SSW Orbe não respondeu dentro do tempo limite.",
        error,
      );
    }

    throw createError("SCRAPING_FAILED", "Falha ao consultar o SSW Orbe.", error);
  } finally {
    clearTimeout(timeout);
  }
}
