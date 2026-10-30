import { NextRequest, NextResponse } from "next/server";
import {
  buildConsultaError,
  handleConsultaError,
} from "@/app/api/consulta/response";
import { consultarPorCnpj } from "@/services/SSW/consulta/consultarPorCnpj";

export async function GET(request: NextRequest) {
  const cnpj = request.nextUrl.searchParams.get("cnpj") ?? "";
  const nfNumber =
    request.nextUrl.searchParams.get("nfNumber") ??
    request.nextUrl.searchParams.get("nf") ??
    "";

  if (!cnpj.replace(/\D/g, "").trim()) {
    return buildConsultaError("INVALID_CNPJ");
  }

  try {
    const data = await consultarPorCnpj({ cnpj, nfNumber });
    return NextResponse.json(data);
  } catch (error) {
    return handleConsultaError(error);
  }
}
