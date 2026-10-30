import { NextResponse } from "next/server";
import { deriveStatus } from "@/lib/derive-status";
import { findByCnpjAndNf, type EncomendaEncontrada } from "@/lib/seed";

function escapeHtml(value: string | undefined): string {
  return (value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function statusAtual(item: EncomendaEncontrada): string {
  const event = item.events[0];
  if (!event) {
    return "desconhecido";
  }

  return deriveStatus(event.title, event.detail);
}

function linha(item: EncomendaEncontrada): string {
  const cells = [
    ["id", item.id],
    ["nf", item.nfNumber],
    ["papel", item.papel],
    ["recipient", item.recipient],
    ["sender", item.sender ?? ""],
    ["sender-cnpj", item.senderCnpj ?? ""],
    ["cnpj", item.cnpj],
    ["order", item.orderNumber],
    ["pickup", item.pickupDate],
    ["status", statusAtual(item)],
  ];

  const tds = cells
    .map(
      ([field, value]) =>
        `<td data-field="${field}">${escapeHtml(value)}</td>`,
    )
    .join("");

  return `<tr>${tds}</tr>`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cnpj = (searchParams.get("cnpj") ?? "").replace(/\D/g, "").trim();
  const nfNumber = (searchParams.get("nfNumber") ?? "").replace(/\D/g, "").trim();

  if (!cnpj) {
    return new NextResponse(
      `<p id="ssw-cnpj-erro">Informe o CNPJ.</p>`,
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  const matches = await findByCnpjAndNf({ cnpj, nfNumber });

  if (matches.length === 0) {
    return new NextResponse(
      `<p id="ssw-cnpj-vazio">Nenhuma encomenda encontrada para este CNPJ.</p>`,
      { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<body>
<table id="ssw-cnpj-resultado">
<tbody>
${matches.map(linha).join("\n")}
</tbody>
</table>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
