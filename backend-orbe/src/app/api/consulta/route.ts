import { NextRequest, NextResponse } from "next/server";
import {
  buildConsultaError,
  handleConsultaError,
} from "@/app/api/consulta/response";
import {
  consultarPorCnpj,
  type ConsultaPorCnpjResponse,
} from "@/services/SSW/consulta/consultarPorCnpj";

export async function GET(request: NextRequest) {
  const cnpj = request.nextUrl.searchParams.get("cnpj") ?? "";
  const nfNumber =
    request.nextUrl.searchParams.get("nfNumber") ??
    request.nextUrl.searchParams.get("nf") ??
    request.nextUrl.searchParams.get("notaFiscal") ??
    "";

  if (!cnpj.replace(/\D/g, "").trim()) {
    return buildConsultaError("INVALID_CNPJ");
  }

  try {
    const data = await consultarPorCnpj({ cnpj, nfNumber });
    return NextResponse.json<ConsultaPorCnpjResponse>(data);
  } catch (error) {
    return handleConsultaError(error);
  }
}
