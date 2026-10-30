import { NextResponse } from "next/server";
import {
  criarColeta,
  listarColetas,
  statusAtualDaColeta,
  toRastreamento,
} from "@/lib/coletas";
import { mapToApiEncomenda } from "@/lib/map-encomenda";

export async function POST(request: Request) {
  let body: { cnpj?: string };

  try {
    body = (await request.json()) as { cnpj?: string };
  } catch {
    return NextResponse.json(
      { success: false, error: "JSON inválido.", code: "INVALID_BODY" },
      { status: 400 },
    );
  }

  const cnpj = (body.cnpj ?? "").replace(/\D/g, "").trim();

  if (cnpj.length !== 14) {
    return NextResponse.json(
      {
        success: false,
        error: "CNPJ deve ter 14 dígitos.",
        code: "INVALID_CNPJ",
      },
      { status: 400 },
    );
  }

  try {
    const coleta = await criarColeta(cnpj);

    return NextResponse.json({
      success: true,
      data: {
        ...mapToApiEncomenda(toRastreamento(coleta)),
        statusLabel: statusAtualDaColeta(coleta),
      },
      scrapedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao criar coleta.";
    return NextResponse.json(
      { success: false, error: message, code: "CREATE_FAILED" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const cnpj = new URL(request.url).searchParams.get("cnpj")?.replace(/\D/g, "");
  const coletas = await listarColetas();
  const filtered = cnpj
    ? coletas.filter(
        (coleta) =>
          coleta.cnpj.replace(/\D/g, "") === cnpj ||
          coleta.senderCnpj?.replace(/\D/g, "") === cnpj,
      )
    : coletas;

  return NextResponse.json({
    success: true,
    data: filtered.map((coleta) => ({
      ...mapToApiEncomenda(toRastreamento(coleta)),
      statusLabel: statusAtualDaColeta(coleta),
    })),
  });
}
