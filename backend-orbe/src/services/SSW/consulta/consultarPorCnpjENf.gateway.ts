import * as cheerio from "cheerio";
import { cnpjSchema, nfNumberSchema } from "./consultarPorCnpjENf.schema";

/**
 * Gateway HTTP para o SSW Orbe (mock local).
 * Usa fetch em vez de curl — alvo é localhost.
 */

const SSW_BASE_URL =
  process.env.ORBE_SSW_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:4000";
const SSW_CONSULTA_URL = `${SSW_BASE_URL}/2/rastreamento_dest`;
const SSW_CONSULTA_RESULT_URL = `${SSW_BASE_URL}/2/resultSSW_dest_nro`;
const REQUEST_TIMEOUT_MS = 15_000;
const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36";

export type CamposFormularioSsw = {
  action: string;
  cnpjFieldName: string;
  hiddenFields: Record<string, string>;
};

export type ConsultaGatewayErrorCode =
  | "INVALID_CNPJ"
  | "INVALID_NF"
  | "SCRAPING_FAILED"
  | "SSW_UNAVAILABLE";

export type ConsultaGatewayError = Error & {
  code: ConsultaGatewayErrorCode;
};

function createConsultaGatewayError(
  code: ConsultaGatewayErrorCode,
  message: string,
  cause?: unknown,
): ConsultaGatewayError {
  const error = new Error(
    message,
    cause ? { cause } : undefined,
  ) as ConsultaGatewayError;
  error.code = code;
  return error;
}

function isAllowedSswHost(hostname: string): boolean {
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return true;
  }

  try {
    const configured = new URL(SSW_BASE_URL).hostname;
    return hostname === configured;
  } catch {
    return false;
  }
}

async function runFetch(url: string, init?: RequestInit): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": USER_AGENT,
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) {
      throw createConsultaGatewayError(
        "SCRAPING_FAILED",
        `Falha ao consultar o SSW Orbe (HTTP ${response.status}).`,
      );
    }

    return await response.text();
  } catch (error) {
    if (error instanceof Error && "code" in error) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw createConsultaGatewayError(
        "SSW_UNAVAILABLE",
        "O SSW Orbe não respondeu dentro do tempo limite.",
        error,
      );
    }

    throw createConsultaGatewayError(
      "SCRAPING_FAILED",
      "Falha ao consultar o SSW Orbe.",
      error,
    );
  } finally {
    clearTimeout(timeout);
  }
}

function assertHtmlLooksUsable(html: string): void {
  const normalized = html.toLowerCase();
  const knownFailures = [
    "erro interno",
    "sistema indispon",
    "temporariamente indispon",
    "acesso negado",
  ];

  if (knownFailures.some((failure) => normalized.includes(failure))) {
    throw createConsultaGatewayError(
      "SCRAPING_FAILED",
      "A resposta do SSW Orbe não contém dados de rastreamento válidos.",
    );
  }
}

function resolveSswUrl(path: string): string {
  if (!path) {
    throw createConsultaGatewayError(
      "SCRAPING_FAILED",
      "O caminho de detalhe retornado pelo SSW Orbe está vazio.",
    );
  }

  try {
    const url = new URL(path, SSW_BASE_URL);

    if (!isAllowedSswHost(url.hostname)) {
      throw new Error("URL externa ao SSW Orbe.");
    }

    return url.toString();
  } catch (error) {
    throw createConsultaGatewayError(
      "SCRAPING_FAILED",
      "O caminho de detalhe retornado pelo SSW Orbe é inválido.",
      error,
    );
  }
}

async function carregarFormulario(): Promise<CamposFormularioSsw> {
  const html = await runFetch(SSW_CONSULTA_URL, {
    method: "GET",
    headers: {
      Referer: SSW_CONSULTA_URL,
    },
  });
  const $ = cheerio.load(html);
  const form = $("form").first();

  if (!form.length) {
    throw createConsultaGatewayError(
      "SCRAPING_FAILED",
      "Não foi possível localizar o formulário do SSW Orbe.",
    );
  }

  const hiddenFields = form
    .find("input[type='hidden']")
    .toArray()
    .map((element) => {
      const name = $(element).attr("name") ?? "";
      const value = $(element).attr("value") ?? "";
      return [name, value] as const;
    })
    .filter(([name]) => Boolean(name))
    .reduce<Record<string, string>>((accumulator, [name, value]) => {
      accumulator[name] = value;
      return accumulator;
    }, {});

  return {
    action: SSW_CONSULTA_RESULT_URL,
    cnpjFieldName: "cnpjdest",
    hiddenFields,
  };
}

export async function fetchListaHtmlGateway({
  cnpj,
  nfNumber,
}: {
  cnpj: string;
  nfNumber: string;
}): Promise<string> {
  const parsedCnpj = cnpjSchema.safeParse(cnpj);
  const parsedNf = nfNumberSchema.safeParse(nfNumber);

  if (!parsedCnpj.success) {
    throw createConsultaGatewayError("INVALID_CNPJ", "CNPJ inválido.");
  }
  if (!parsedNf.success) {
    throw createConsultaGatewayError("INVALID_NF", "Nota fiscal é obrigatória.");
  }

  const form = await carregarFormulario();
  const body = new URLSearchParams({
    ...form.hiddenFields,
    [form.cnpjFieldName]: parsedCnpj.data,
    NR: parsedNf.data,
  }).toString();

  const html = await runFetch(form.action, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: SSW_BASE_URL,
      Referer: SSW_CONSULTA_URL,
    },
    body,
  });

  assertHtmlLooksUsable(html);
  return html;
}

export async function fetchDetalheHtmlGateway({
  detailPath,
}: {
  detailPath: string;
}): Promise<string> {
  const url = resolveSswUrl(detailPath.trim());
  const html = await runFetch(url, {
    method: "GET",
    headers: {
      Referer: SSW_CONSULTA_URL,
    },
  });

  assertHtmlLooksUsable(html);
  return html;
}
