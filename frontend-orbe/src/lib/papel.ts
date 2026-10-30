export function papelLabel(papel: string | undefined): string {
  if (papel === "remetente") {
    return "Remetente";
  }

  if (papel === "destinatario") {
    return "Destinatário";
  }

  return "";
}
