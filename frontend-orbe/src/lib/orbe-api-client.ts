import type { ApiEncomenda, ApiFailure, ApiSuccessList } from "./types";

function baseUrl() {
  return (
    process.env.ORBE_API_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:3001"
  );
}

export async function consultarNoBackend({
  cnpj,
  nfNumber,
}: {
  cnpj: string;
  nfNumber: string;
}): Promise<{ ok: true; data: ApiEncomenda[] } | { ok: false; error: string }> {
  const params = new URLSearchParams({ cnpj });
  if (nfNumber) {
    params.set("nfNumber", nfNumber);
  }

  const response = await fetch(`${baseUrl()}/api/consulta?${params}`, {
    cache: "no-store",
  });
  const json = (await response.json()) as ApiSuccessList | ApiFailure;

  if (!json.success) {
    return { ok: false, error: json.error };
  }

  return { ok: true, data: json.data };
}
