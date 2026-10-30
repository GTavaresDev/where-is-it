import { ConsultaView } from "../_components/consulta.view";

export default async function ConsultaPage({
  searchParams,
}: {
  searchParams: Promise<{ papel?: string; cnpj?: string }>;
}) {
  const params = await searchParams;
  const papel =
    params.papel === "remetente" || params.papel === "destinatario"
      ? params.papel
      : "todos";
  const cnpj = params.cnpj ?? "";

  return <ConsultaView papel={papel} cnpjInicial={cnpj} />;
}
