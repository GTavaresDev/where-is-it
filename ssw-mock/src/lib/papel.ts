export type Papel = "remetente" | "destinatario";

export function papelDoCnpj(
  item: { cnpj: string; senderCnpj?: string },
  cnpj: string,
): Papel | null {
  const clean = cnpj.replace(/\D/g, "");
  const destinatario = item.cnpj.replace(/\D/g, "");
  const remetente = (item.senderCnpj ?? "").replace(/\D/g, "");

  if (destinatario === clean) {
    return "destinatario";
  }

  if (remetente === clean) {
    return "remetente";
  }

  return null;
}
