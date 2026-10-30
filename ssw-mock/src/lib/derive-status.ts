export type StatusEncomenda =
  | "pendente"
  | "em_transferencia"
  | "em_transito"
  | "entregue"
  | "devolvido"
  | "desconhecido";

const STATUS_KEYWORDS: Array<{ terms: string[]; status: StatusEncomenda }> = [
  {
    terms: ["MERCADORIA ENTREGUE", "ENTREGA REALIZADA", "ENTREGUE"],
    status: "entregue",
  },
  {
    terms: ["SAIDA DE UNIDADE", "SAIDA PARA ENTREGA", "EM TRANSITO"],
    status: "em_transito",
  },
  {
    terms: ["CHEGADA EM UNIDADE", "CHEGADA EM UNIDADE DE TRANSBORDO"],
    status: "em_transferencia",
  },
  { terms: ["DOCUMENTO DE TRANSPORTE EMITIDO"], status: "pendente" },
  { terms: ["DEVOLV"], status: "devolvido" },
];

export function deriveStatus(title: string, detail = ""): StatusEncomenda {
  const text = `${title} ${detail}`.toUpperCase();

  for (const keyword of STATUS_KEYWORDS) {
    if (keyword.terms.some((term) => text.includes(term))) {
      return keyword.status;
    }
  }

  return "desconhecido";
}
