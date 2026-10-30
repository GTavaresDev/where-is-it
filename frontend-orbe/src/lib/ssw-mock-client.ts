import type {
  ApiEncomenda,
  ApiFailure,
  ApiSuccessList,
  ApiSuccessOne,
} from "./types";

function baseUrl() {
  return (
    process.env.SSW_MOCK_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:4000"
  );
}

export async function consultarNoMock({
  cnpj,
  nfNumber,
}: {
  cnpj: string;
  nfNumber: string;
}): Promise<{ ok: true; data: ApiEncomenda[] } | { ok: false; error: string }> {
  const params = new URLSearchParams({ cnpj, nfNumber });
  const response = await fetch(`${baseUrl()}/api/consulta?${params}`, {
    cache: "no-store",
  });
  const json = (await response.json()) as ApiSuccessList | ApiFailure;

  if (!json.success) {
    return { ok: false, error: json.error };
  }

  return { ok: true, data: json.data };
}

export async function detalheNoMock(
  id: string,
): Promise<{ ok: true; data: ApiEncomenda } | { ok: false; error: string }> {
  const response = await fetch(`${baseUrl()}/api/rastreamento/${id}`, {
    cache: "no-store",
  });
  const json = (await response.json()) as ApiSuccessOne | ApiFailure;

  if (!json.success) {
    return { ok: false, error: json.error };
  }

  return { ok: true, data: json.data };
}

export async function criarColetaNoMock(
  cnpj: string,
): Promise<{ ok: true; data: ApiEncomenda } | { ok: false; error: string }> {
  const response = await fetch(`${baseUrl()}/api/coleta`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cnpj }),
    cache: "no-store",
  });
  const json = (await response.json()) as ApiSuccessOne | ApiFailure;

  if (!json.success) {
    return { ok: false, error: json.error };
  }

  return { ok: true, data: json.data };
}

export async function listarColetasNoMock(
  cnpj: string,
): Promise<{ ok: true; data: ApiEncomenda[] } | { ok: false; error: string }> {
  try {
    const response = await fetch(
      `${baseUrl()}/api/coleta?cnpj=${encodeURIComponent(cnpj)}`,
      { cache: "no-store" },
    );
    const json = (await response.json()) as ApiSuccessList | ApiFailure;

    if (!json.success) {
      return { ok: false, error: json.error };
    }

    return { ok: true, data: json.data };
  } catch {
    return {
      ok: false,
      error: "Não foi possível carregar as coletas. Verifique se o ssw-mock está na porta 4000.",
    };
  }
}
