import { NextResponse } from "next/server";
import { findByCnpjAndNf } from "@/lib/seed";
import { mapToApiEncomenda } from "@/lib/map-encomenda";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cnpj = (searchParams.get("cnpj") ?? "").replace(/\D/g, "").trim();
  const nfNumber = (searchParams.get("nfNumber") ?? "").replace(/\D/g, "").trim();

  if (!cnpj) {
    return NextResponse.json(
      { success: false, error: "Informe o CNPJ.", code: "INVALID_CNPJ" },
      { status: 400 },
    );
  }

  const matches = await findByCnpjAndNf({ cnpj, nfNumber });

  if (matches.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: "Nenhuma encomenda encontrada para este CNPJ e NF.",
        code: "NOT_FOUND",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data: matches.map(mapToApiEncomenda),
    scrapedAt: new Date().toISOString(),
  });
}
