import { notFound } from "next/navigation";
import { DetalheMockView } from "../../_components/detalhe-mock.view";
import { findById } from "@/lib/seed";

type DetalhePageProps = {
  params: Promise<{ id: string }>;
};

export default async function DetalhePage({ params }: DetalhePageProps) {
  const { id } = await params;
  const data = await findById(id);

  if (!data) {
    notFound();
  }

  return <DetalheMockView data={data} />;
}
