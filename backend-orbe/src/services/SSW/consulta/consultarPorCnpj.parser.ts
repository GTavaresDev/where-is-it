import * as cheerio from "cheerio";

export type EncomendaRastreada = {
  id: string;
  cnpj: string;
  recipient: string;
  sender: string;
  senderCnpj: string;
  nfNumber: string;
  orderNumber: string;
  pickupDate: string | null;
  currentStatus: string;
  papel: "remetente" | "destinatario";
  events: [];
};

export function parseRastreamentoPorCnpj(html: string): EncomendaRastreada[] {
  const $ = cheerio.load(html);
  const rows = $("#ssw-cnpj-resultado tbody tr").toArray();
  const items: EncomendaRastreada[] = [];

  for (const row of rows) {
    const $row = $(row);
    const campo = (field: string) =>
      $row.find(`td[data-field="${field}"]`).text().trim();
    const papel = campo("papel");
    let papelNormalizado: EncomendaRastreada["papel"] = "destinatario";
    if (papel === "remetente") {
      papelNormalizado = "remetente";
    }

    const pickup = campo("pickup");
    let pickupDate: string | null = pickup;
    if (!pickup) {
      pickupDate = null;
    }

    items.push({
      id: campo("id"),
      cnpj: campo("cnpj"),
      recipient: campo("recipient"),
      sender: campo("sender"),
      senderCnpj: campo("sender-cnpj"),
      nfNumber: campo("nf"),
      orderNumber: campo("order"),
      pickupDate,
      currentStatus: campo("status"),
      papel: papelNormalizado,
      events: [],
    });
  }

  return items;
}

export function htmlSemEncomenda(html: string): boolean {
  return html.includes('id="ssw-cnpj-vazio"');
}
